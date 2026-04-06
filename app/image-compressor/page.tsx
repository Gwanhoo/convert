"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type OutputFormat = "jpeg" | "webp" | "png";

type OutputOption = {
  id: OutputFormat;
  label: string;
  mimeType: string;
  extension: string;
};

const outputOptions: OutputOption[] = [
  { id: "jpeg", label: "JPG", mimeType: "image/jpeg", extension: "jpg" },
  { id: "webp", label: "WebP", mimeType: "image/webp", extension: "webp" },
  { id: "png", label: "PNG", mimeType: "image/png", extension: "png" }
];

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(image);
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Could not load image."));
    };

    image.src = objectUrl;
  });
}

function compressImage(file: File, option: OutputOption, quality: number): Promise<Blob> {
  return new Promise(async (resolve, reject) => {
    try {
      const image = await loadImage(file);
      const canvas = document.createElement("canvas");
      canvas.width = image.width;
      canvas.height = image.height;

      const context = canvas.getContext("2d");
      if (!context) {
        reject(new Error("Canvas is not supported in this browser."));
        return;
      }

      if (option.mimeType === "image/jpeg") {
        context.fillStyle = "#ffffff";
        context.fillRect(0, 0, canvas.width, canvas.height);
      }

      context.drawImage(image, 0, 0);

      const outputQuality = option.mimeType === "image/png" ? undefined : quality;

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error("Compression failed."));
            return;
          }

          resolve(blob);
        },
        option.mimeType,
        outputQuality
      );
    } catch (error) {
      reject(error instanceof Error ? error : new Error("Compression failed."));
    }
  });
}

export default function ImageCompressorPage() {
  const [file, setFile] = useState<File | null>(null);
  const [quality, setQuality] = useState(0.8);
  const [isCompressing, setIsCompressing] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [compressedSize, setCompressedSize] = useState<number | null>(null);
  const [selectedOutputFormat, setSelectedOutputFormat] = useState<OutputFormat>("jpeg");

  const previewUrl = useMemo(() => {
    return file ? URL.createObjectURL(file) : null;
  }, [file]);

  const selectedOption =
    outputOptions.find((option) => option.id === selectedOutputFormat) ?? outputOptions[0];

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    };
  }, [previewUrl, downloadUrl]);

  function clearResult() {
    if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    setDownloadUrl(null);
    setCompressedSize(null);
  }

  function handleFileSelection(nextFile: File) {
    if (!nextFile.type.startsWith("image/")) {
      setErrorMessage("Invalid file. Please upload an image file.");
      setFile(null);
      clearResult();
      return;
    }

    if (!["image/jpeg", "image/png"].includes(nextFile.type)) {
      setErrorMessage("Unsupported image type. Please upload JPG or PNG.");
      setFile(null);
      clearResult();
      return;
    }

    setFile(nextFile);
    setErrorMessage(null);
    clearResult();
  }

  async function handleCompress() {
    if (!file) {
      setErrorMessage("Please upload an image file first.");
      return;
    }

    setErrorMessage(null);
    setIsCompressing(true);

    try {
      clearResult();
      const compressedBlob = await compressImage(file, selectedOption, quality);
      setDownloadUrl(URL.createObjectURL(compressedBlob));
      setCompressedSize(compressedBlob.size);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Compression failed.");
    } finally {
      setIsCompressing(false);
    }
  }

  const outputName = `image-compressed.${selectedOption.extension}`;

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-10 text-slate-900">
      <main className="mx-auto max-w-5xl space-y-8">
        <section className="rounded-2xl bg-white p-8 shadow-sm">
          <h1 className="text-3xl font-bold">Image Compressor</h1>
          <p className="mt-2 text-sm text-slate-600">
            Reduce image size in your browser with a simple quality setting.
          </p>

          <div className="mt-4 flex items-center justify-center gap-3">
            <Link
              href="/"
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
            >
              Go to Image Converter
            </Link>
          </div>
        </section>

        <section className="grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold">1) Input</h2>
            <p className="mt-1 text-sm text-slate-600">
              Upload a JPG or PNG image and choose compression quality.
            </p>

            <label className="mt-4 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 px-5 py-12 text-center transition hover:border-slate-400">
              <span className="text-3xl">🖼️</span>
              <span className="mt-3 text-sm font-medium">Choose image file</span>
              <span className="mt-1 text-xs text-slate-500">Only JPG and PNG are allowed.</span>
              <input
                className="sr-only"
                type="file"
                accept="image/jpeg,image/png"
                onChange={(event) => {
                  const nextFile = event.target.files?.[0];
                  if (nextFile) {
                    handleFileSelection(nextFile);
                  }
                  event.currentTarget.value = "";
                }}
              />
            </label>

            {previewUrl && file && (
              <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Preview
                </p>
                <img
                  src={previewUrl}
                  alt={file.name}
                  className="max-h-56 w-full rounded-lg object-contain"
                />
                <p className="mt-2 truncate text-sm font-medium">{file.name}</p>
                <p className="mt-1 text-xs text-slate-500">Original size: {formatBytes(file.size)}</p>
              </div>
            )}

            <div className="mt-4">
              <label
                htmlFor="output-format"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Output format
              </label>
              <select
                id="output-format"
                value={selectedOutputFormat}
                onChange={(event) => {
                  setSelectedOutputFormat(event.target.value as OutputFormat);
                  clearResult();
                }}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
              >
                {outputOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-4">
              <label htmlFor="quality" className="mb-2 block text-sm font-medium text-slate-700">
                Quality: {Math.round(quality * 100)}%
              </label>
              <input
                id="quality"
                type="range"
                min="0.1"
                max="1"
                step="0.1"
                value={quality}
                onChange={(event) => {
                  setQuality(Number(event.target.value));
                  clearResult();
                }}
                className="w-full"
                disabled={selectedOption.mimeType === "image/png"}
              />
              {selectedOption.mimeType === "image/png" && (
                <p className="mt-1 text-xs text-slate-500">
                  PNG keeps quality more strictly, so the slider has little to no effect.
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={handleCompress}
              disabled={!file || isCompressing}
              className="mt-5 w-full rounded-lg bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {isCompressing ? "Compressing..." : "Compress image"}
            </button>

            {errorMessage && (
              <p className="mt-3 text-sm font-medium text-rose-700">{errorMessage}</p>
            )}
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold">2) Result</h2>
            <p className="mt-1 text-sm text-slate-600">
              Your compressed image will appear here.
            </p>

            {downloadUrl ? (
              <div className="mt-6 space-y-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                <p className="text-sm font-medium text-emerald-800">Compression complete.</p>
                {file && compressedSize !== null && (
                  <p className="text-xs text-emerald-700">
                    {formatBytes(file.size)} → {formatBytes(compressedSize)}
                  </p>
                )}
                <a
                  href={downloadUrl}
                  download={outputName}
                  className="inline-flex w-full items-center justify-center rounded-lg bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
                >
                  Download {outputName}
                </a>
              </div>
            ) : (
              <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                {isCompressing ? "Working on your compression..." : "No compressed file yet."}
              </div>
            )}

            <p className="mt-6 text-xs text-slate-500">
              All processing is done locally in your browser. No uploads to a server.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}