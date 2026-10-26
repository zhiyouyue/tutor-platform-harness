import OSS from "ali-oss";
import { createWriteStream } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { pipeline } from "node:stream/promises";
import { config } from "../config/env.js";
import { AppError } from "../errors/AppError.js";

export function isOssConfigured(): boolean {
  return !!(config.oss.bucket && config.oss.accessKeyId && config.oss.accessKeySecret);
}

export function buildObjectKey(projectId: number, fileName: string): string {
  const safe = fileName.replace(/[^\w.\-()+\u4e00-\u9fff]/g, "_");
  return `projects/${projectId}/${Date.now()}-${safe}`;
}

function createOssClient() {
  return new OSS({
    region: config.oss.region,
    accessKeyId: config.oss.accessKeyId,
    accessKeySecret: config.oss.accessKeySecret,
    bucket: config.oss.bucket,
  });
}

export async function createUploadUrl(params: { key: string; mimeType: string }) {
  if (!isOssConfigured()) {
    throw new AppError("OSS 未配置，请使用本地上传接口", 503);
  }
  const client = createOssClient();
  const uploadUrl = client.signatureUrl(params.key, {
    method: "PUT",
    expires: 3600,
    "Content-Type": params.mimeType,
  });
  return {
    uploadUrl,
    ossKey: params.key,
    bucket: config.oss.bucket,
    mode: "oss" as const,
  };
}

export async function putBytes(params: { key: string; body: Buffer; mimeType: string }) {
  if (!isOssConfigured()) {
    const dest = path.join(LOCAL_UPLOAD_DIR, params.key);
    await mkdir(path.dirname(dest), { recursive: true });
    await writeFile(dest, params.body);
    return { bucket: "local-dev", key: params.key };
  }
  const client = createOssClient();
  await client.put(params.key, params.body, { mime: params.mimeType });
  return { bucket: config.oss.bucket, key: params.key };
}

export async function createDownloadUrl(key: string) {
  if (!isOssConfigured()) return null;
  const client = createOssClient();
  return client.signatureUrl(key, { expires: 3600 });
}

const LOCAL_UPLOAD_DIR = path.resolve(process.cwd(), "uploads");

export async function saveLocalFile(params: {
  projectId: number;
  fileName: string;
  stream: NodeJS.ReadableStream;
}): Promise<{ bucket: string; key: string; sizeBytes: number }> {
  const key = buildObjectKey(params.projectId, params.fileName);
  const dest = path.join(LOCAL_UPLOAD_DIR, key);
  await mkdir(path.dirname(dest), { recursive: true });
  await pipeline(params.stream, createWriteStream(dest));
  const { stat } = await import("node:fs/promises");
  const st = await stat(dest);
  return { bucket: "local-dev", key, sizeBytes: st.size };
}
