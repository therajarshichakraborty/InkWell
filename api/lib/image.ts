export type ImageExtension = "png" | "jpg" | "gif" | "webp";

const startsWith = (buffer: Buffer, bytes: number[], offset = 0) =>
  bytes.every((byte, index) => buffer[offset + index] === byte);

const ascii = (value: string) => [...value].map((char) => char.charCodeAt(0));

export function detectImageType(buffer: Buffer): ImageExtension | null {
  if (startsWith(buffer, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return "png";
  if (startsWith(buffer, [0xff, 0xd8, 0xff])) return "jpg";
  if (startsWith(buffer, ascii("GIF8"))) return "gif";
  if (startsWith(buffer, ascii("RIFF")) && startsWith(buffer, ascii("WEBP"), 8)) return "webp";
  return null;
}
