/** Detect best supported MediaRecorder MIME type */
export function getSupportedMimeType(): string {
  const types = [
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/mp4",
    "audio/ogg;codecs=opus",
    "audio/ogg",
  ];
  for (const type of types) {
    if (
      typeof MediaRecorder !== "undefined" &&
      MediaRecorder.isTypeSupported(type)
    ) {
      return type;
    }
  }
  return "audio/webm";
}

export function getExtensionFromMime(mime: string): string {
  if (mime.includes("mp4") || mime.includes("m4a")) return "m4a";
  if (mime.includes("ogg")) return "ogg";
  return "webm";
}

export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

export function checkBrowserSupport(): { ok: boolean; missing: string[] } {
  const missing: string[] = [];
  if (typeof window === "undefined") return { ok: true, missing: [] };
  if (!navigator.mediaDevices?.getUserMedia)
    missing.push("Microphone (getUserMedia)");
  if (typeof MediaRecorder === "undefined") missing.push("MediaRecorder");
  if (typeof indexedDB === "undefined") missing.push("IndexedDB");
  if (typeof Blob === "undefined") missing.push("Blob");
  if (typeof URL?.createObjectURL === "undefined")
    missing.push("URL.createObjectURL");
  return { ok: missing.length === 0, missing };
}
