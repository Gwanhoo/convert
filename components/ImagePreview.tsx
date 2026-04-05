"use client";

type ImagePreviewProps = {
  src: string;
  fileName: string;
};

export function ImagePreview({ src, fileName }: ImagePreviewProps) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3">
      <p className="mb-2 text-xs text-slate-500">Preview</p>
      <img src={src} alt={fileName} className="max-h-72 w-full rounded-md object-contain" />
    </div>
  );
}
