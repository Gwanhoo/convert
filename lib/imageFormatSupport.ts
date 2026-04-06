import type { ConversionOption } from "./conversionTypes";

export const mimeAliases: Record<string, string> = {
  "image/jpg": "image/jpeg",
  "image/x-png": "image/png",
  "image/x-icon": "image/x-icon",
  "image/vnd.microsoft.icon": "image/x-icon"
};

export const formatLabelByMimeType: Record<string, string> = {
  "image/png": "PNG",
  "image/jpeg": "JPG",
  "image/webp": "WEBP",
  "image/gif": "GIF",
  "image/bmp": "BMP",
  "image/x-icon": "ICO"
};

export const alphaUnsupportedOutputMimes = new Set(["image/jpeg", "image/bmp"]);

export function normalizeMimeType(mimeType: string): string {
  return mimeAliases[mimeType] ?? mimeType;
}

export function getOutputOptionIdsForInputMime(inputMimeType: string, options: ConversionOption[]): string[] {
  const normalizedInputMime = normalizeMimeType(inputMimeType);

  return options
    .filter((option) => option.outputMimeType !== normalizedInputMime)
    .map((option) => option.id);
}

export function getUnsupportedFormatMessage(inputMimeType: string): string {
  const normalizedInputMime = normalizeMimeType(inputMimeType);
  const label = formatLabelByMimeType[normalizedInputMime];

  if (label) {
    return `Unsupported image type. ${label} is not supported in this converter.`;
  }

  return "Unsupported image type. Please upload a supported image format.";
}
