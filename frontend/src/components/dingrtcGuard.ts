export function joinFailureHint(err: unknown): string {
  const msg = err instanceof Error ? err.message : String(err ?? "");
  if (/camera|microphone|permission|NotAllowed|NotFound/i.test(msg)) {
    return "没有拿到摄像头或麦克风。请点地址栏的锁形图标，允许使用设备后再进入。";
  }
  if (/timeout|17105681|channelBind/i.test(msg)) {
    return "课堂信令超时。本地画面已打开。若一直连不上，请改用这台电脑的局域网 IP 打开页面后再进入。";
  }
  return "无法连上课堂。本地画面已打开，请检查网络后再试。";
}

export function withTimeout<T>(task: Promise<T>, ms: number, message: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = window.setTimeout(() => reject(new Error(message)), ms);
    task.then(
      (value) => {
        window.clearTimeout(timer);
        resolve(value);
      },
      (err) => {
        window.clearTimeout(timer);
        reject(err);
      },
    );
  });
}

export function attachTrack(video: HTMLVideoElement, track: MediaStreamTrack) {
  const current = video.srcObject instanceof MediaStream ? video.srcObject : new MediaStream();
  current.getTracks().filter((item) => item.kind === track.kind).forEach((item) => current.removeTrack(item));
  current.addTrack(track);
  video.srcObject = current;
  void video.play().catch(() => undefined);
}

export function patchDingRtcListenerCount(client: object) {
  let proto: object | null = client;
  while (proto && proto !== Object.prototype) {
    const desc = Object.getOwnPropertyDescriptor(proto, "listenerCount");
    if (desc && typeof desc.value === "function") {
      Object.defineProperty(proto, "listenerCount", {
        configurable: true,
        writable: true,
        value(this: { eventMap?: Record<string, unknown> }, event: string) {
          const list = this.eventMap?.[event];
          return Array.isArray(list) ? list.length : 0;
        },
      });
      return;
    }
    proto = Object.getPrototypeOf(proto);
  }
}
