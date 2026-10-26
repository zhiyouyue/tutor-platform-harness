import { createHmac, randomInt } from "node:crypto";
import { deflateSync, inflateSync } from "node:zlib";

// 官方 produce() 把过期时间写成“现在”，信令发出去 token 已经失效。
// 这里按同一套字节布局签发，但过期时间是 now + ttl。

class ByteBuf {
  private buf = Buffer.alloc(256);
  private len = 0;

  private grow(extra: number) {
    const need = this.len + extra;
    if (need <= this.buf.length) return;
    let size = this.buf.length;
    while (size < need) size *= 2;
    const next = Buffer.alloc(size);
    this.buf.copy(next, 0, 0, this.len);
    this.buf = next;
  }

  writeInt32(n: number) {
    this.grow(4);
    this.buf.writeInt32BE(n, this.len);
    this.len += 4;
  }

  writeInt8(n: number) {
    this.grow(1);
    this.buf.writeInt8(n, this.len);
    this.len += 1;
  }

  writeBytes(data: Buffer | string) {
    const bytes = Buffer.isBuffer(data) ? data : Buffer.from(data, "utf8");
    this.grow(bytes.length);
    bytes.copy(this.buf, this.len);
    this.len += bytes.length;
  }

  writeString(text: string) {
    const bytes = Buffer.from(text, "utf8");
    this.writeInt32(bytes.length);
    this.writeBytes(bytes);
  }

  /** 官方 ByteBuffer.getvalue() 会带上未写满的 0 填充，签名覆盖这段填充。 */
  toBuffer(): Buffer {
    return Buffer.from(this.buf);
  }

  toExact(): Buffer {
    return this.buf.subarray(0, this.len);
  }
}

function signKey(appKey: string, issueTimestamp: number, salt: number): Buffer {
  const issue = Buffer.alloc(4);
  issue.writeUInt32BE(issueTimestamp, 0);
  const step = createHmac("sha256", issue).update(appKey).digest();
  const saltBuf = Buffer.alloc(4);
  saltBuf.writeUInt32BE(salt, 0);
  return createHmac("sha256", saltBuf).update(step).digest();
}

function packService(channelId: string, userId: string): Buffer {
  const buf = new ByteBuf();
  buf.writeString(channelId);
  buf.writeString(userId);
  buf.writeInt8(0);
  return buf.toExact();
}

function packOptions(): Buffer {
  const entries: Array<[string, string]> = [["k1", "v1"], ["k2", "v2"]];
  const buf = new ByteBuf();
  buf.writeInt8(1);
  buf.writeInt32(entries.length);
  for (const [key, value] of entries) {
    buf.writeString(key);
    buf.writeString(value);
  }
  return buf.toExact();
}

export function buildDingRtcToken(params: {
  appId: string;
  appKey: string;
  channelId: string;
  userId: string;
  ttlSeconds: number;
  nowSeconds?: number;
  salt?: number;
}): string {
  const now = params.nowSeconds ?? Math.floor(Date.now() / 1000);
  const issueTimestamp = now;
  const expiry = now + params.ttlSeconds;
  const salt = params.salt ?? randomInt(1, Math.max(2, issueTimestamp));
  const key = signKey(params.appKey, issueTimestamp, salt);

  const body = new ByteBuf();
  body.writeString(params.appId);
  body.writeInt32(issueTimestamp);
  body.writeInt32(salt);
  body.writeInt32(expiry);
  body.writeBytes(packService(params.channelId, params.userId));
  body.writeBytes(packOptions());

  const signature = createHmac("sha256", key).update(body.toBuffer()).digest();
  const packed = new ByteBuf();
  packed.writeInt32(signature.length);
  packed.writeBytes(signature);
  packed.writeBytes(body.toBuffer());
  return `000${deflateSync(packed.toBuffer()).toString("base64")}`;
}

export function readDingRtcTokenExpiry(token: string): number {
  if (!token.startsWith("000")) throw new Error("unsupported token");
  const raw = inflateSync(Buffer.from(token.slice(3), "base64"));
  let offset = 0;
  const readInt32 = () => {
    const n = raw.readInt32BE(offset);
    offset += 4;
    return n;
  };
  const sigLen = readInt32();
  offset += sigLen;
  const appLen = readInt32();
  offset += appLen;
  readInt32();
  readInt32();
  return readInt32();
}
