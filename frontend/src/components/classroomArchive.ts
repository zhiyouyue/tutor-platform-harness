const API_BASE = import.meta.env.VITE_API_URL ?? "";

export type SegmentArchive = {
  addTrack: (track: MediaStreamTrack) => void;
  stop: () => void;
};

export function startSegmentArchive(appointmentId: number, stream: MediaStream): SegmentArchive {
  let seq = 0;
  let recorder: MediaRecorder | null = null;
  let stopped = false;

  function mimeType() {
    const candidates = ["video/webm;codecs=vp8,opus", "video/webm"];
    return candidates.find((item) => MediaRecorder.isTypeSupported(item)) ?? "";
  }

  function start() {
    if (stopped || typeof MediaRecorder === "undefined" || stream.getTracks().length === 0) return;
    const mime = mimeType();
    recorder = mime ? new MediaRecorder(stream, { mimeType: mime }) : new MediaRecorder(stream);
    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) void uploadSegment(appointmentId, event.data, ++seq);
    };
    recorder.start(8000);
  }

  function restart() {
    const current = recorder;
    recorder = null;
    if (current && current.state !== "inactive") {
      current.onstop = () => start();
      current.stop();
      return;
    }
    start();
  }

  start();

  return {
    addTrack(track) {
      if (stopped || stream.getTracks().some((item) => item.id === track.id)) return;
      stream.addTrack(track);
      restart();
    },
    stop() {
      stopped = true;
      if (recorder && recorder.state !== "inactive") recorder.stop();
    },
  };
}

async function uploadSegment(appointmentId: number, blob: Blob, seq: number) {
  const form = new FormData();
  form.append("file", blob, `segment-${seq}.webm`);
  const token = localStorage.getItem("auth_token");
  await fetch(`${API_BASE}/api/v1/appointments/${appointmentId}/recordings/segments`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: form,
  });
}
