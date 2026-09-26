import JSZip from "jszip";
import type { RecordingRecord } from "./indexeddb";
import { getExtensionFromMime } from "./audio";

export async function generateDatasetZip(
  recordings: RecordingRecord[],
  prefix: string = "speaker",
): Promise<Blob> {
  const zip = new JSZip();
  const audioFolder = zip.folder("audio");
  if (!audioFolder) throw new Error("Failed to create audio folder");

  // Sanitize prefix: lowercase, spaces → underscores, remove special chars
  const cleanPrefix =
    prefix
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "_")
      .replace(/[^a-z0-9_]/g, "") || "speaker";

  const sorted = [...recordings].sort((a, b) => a.questionId - b.questionId);

  const metadata = {
    speaker: cleanPrefix,
    totalRecordings: sorted.length,
    createdAt: new Date().toISOString(),
    recordings: sorted.map((r) => {
      const ext = getExtensionFromMime(r.mimeType);
      const padded = r.questionId.toString().padStart(3, "0");
      const filename = `audio/${cleanPrefix}_${padded}.${ext}`;
      return {
        questionId: r.questionId,
        question: r.questionText,
        filename,
        duration: r.duration,
        mimeType: r.mimeType,
      };
    }),
  };

  for (const r of sorted) {
    const ext = getExtensionFromMime(r.mimeType);
    const padded = r.questionId.toString().padStart(3, "0");
    audioFolder.file(`${cleanPrefix}_${padded}.${ext}`, r.blob);
  }

  zip.file("metadata.json", JSON.stringify(metadata, null, 2));

  return zip.generateAsync({
    type: "blob",
    compression: "DEFLATE",
    compressionOptions: { level: 6 },
  });
}
export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// Example – adjust to match your existing implementation
