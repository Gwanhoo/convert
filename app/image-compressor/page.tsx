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

const toolCards = [
  {
    title: "Image Compressor",
    description: "Reduce JPG and PNG image size directly in your browser.",
    tags: [".JPG", ".PNG", ".WEBP"]
  },
  {
    title: "Image Converter",
    description: "Convert between WEBP, PNG, and JPG quickly in your browser.",
    tags: ["IMAGE", "CONVERT"]
  },
  {
    title: "PDF Compressor",
    description: "Future tool: optimize PDF files without losing readability.",
    tags: ["COMING", "PDF"]
  }
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

  const previewUrl = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);

  const selectedOption = outputOptions.find((option) => option.id === selectedOutputFormat) ?? outputOptions[0];

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
    <div className="min-h-screen text-[var(--text)]">
      <header className="sticky top-0 z-50 tonal-shift backdrop-blur">
        <nav className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-4">
          <div className="font-headline text-2xl font-extrabold tracking-tight text-[var(--primary)]">Convertly</div>
          <div className="hidden items-center gap-8 md:flex">
            <Link href="/" className="border-b-2 border-[var(--primary)] pb-1 text-sm font-semibold text-[var(--primary)]">Home</Link>
            <span className="text-sm text-[var(--text-muted)]">Tools</span>
            <span className="text-sm text-[var(--text-muted)]">About</span>
          </div>
          <Link href="/" className="rounded-full bg-[var(--primary)] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[var(--primary-dim)]">
            Image Converter
          </Link>
        </nav>
      </header>

      <main className="mx-auto w-full max-w-7xl space-y-20 px-6 py-12">
        <section className="mx-auto max-w-4xl space-y-6 text-center">
          <h1 className="font-headline text-5xl font-extrabold leading-tight md:text-7xl">
            Compress Your Files <span className="bg-gradient-to-r from-[var(--primary)] to-[var(--primary-container)] bg-clip-text text-transparent">Instantly</span>
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-[var(--text-muted)]">
            Reduce image size in your browser with a simple quality setting. No file leaves your device.
          </p>
        </section>

        <section className="grid grid-cols-1 gap-10 lg:grid-cols-12">
          <div className="space-y-6 lg:col-span-8">
            <div className="rounded-2xl bg-[var(--surface)] p-7 shadow-sm">
              <h2 className="mb-4 text-lg font-bold text-[var(--primary)]">Input</h2>

              <div className="mb-6 flex flex-wrap items-center gap-3">
                <span className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--text-muted)]">Compress</span>
                <div className="flex items-center gap-2 rounded-lg bg-[var(--surface-high)] px-3 py-2 text-sm font-semibold">
                  <span>{file ? file.name.split(".").pop()?.toUpperCase() : "JPG/PNG"}</span>
                  <span aria-hidden>→</span>
                  <span>{selectedOption.label}</span>
                </div>
              </div>

              <label className="group flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[var(--outline)]/40 bg-[var(--surface-low)]/60 px-6 py-16 text-center transition hover:border-[var(--primary)]/40 hover:bg-[var(--primary-container)]/10">
                <div className="mb-3 text-5xl text-[var(--primary)]">⤴</div>
                <h3 className="font-headline text-2xl font-bold">Drag & Drop File</h3>
                <p className="mt-2 text-sm text-[var(--text-muted)]">Only JPG and PNG are supported.</p>
                <span className="mt-6 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--primary-dim)] px-8 py-3 text-xs font-bold uppercase tracking-[0.16em] text-white">
                  Upload File
                </span>
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

              {file && (
                <div className="mt-4 rounded-xl border border-[var(--outline)]/30 bg-white px-4 py-3 text-sm">
                  <p className="truncate font-semibold">{file.name}</p>
                  <p className="text-xs text-[var(--text-muted)]">Original size: {formatBytes(file.size)}</p>
                </div>
              )}

              <div className="mt-6 grid gap-4">
                <div>
                  <label htmlFor="output-format" className="mb-2 block text-sm font-semibold text-[var(--text-muted)]">
                    Output format
                  </label>
                  <select
                    id="output-format"
                    value={selectedOutputFormat}
                    onChange={(event) => {
                      setSelectedOutputFormat(event.target.value as OutputFormat);
                      clearResult();
                    }}
                    className="w-full rounded-xl border border-[var(--outline)]/40 bg-white px-4 py-3 text-sm font-medium"
                  >
                    {outputOptions.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="quality" className="mb-2 block text-sm font-semibold text-[var(--text-muted)]">
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
                    <p className="mt-1 text-xs text-[var(--text-muted)]">PNG keeps quality (lossless conversion).</p>
                  )}
                </div>
              </div>

              <div className="mt-6">
                <button
                  type="button"
                  onClick={handleCompress}
                  disabled={!file || isCompressing}
                  className="min-w-[220px] rounded-full bg-[var(--primary)] px-8 py-4 text-sm font-bold uppercase tracking-[0.12em] text-white shadow-lg shadow-[var(--primary)]/25 transition hover:bg-[var(--primary-dim)] disabled:cursor-not-allowed disabled:bg-slate-400 disabled:shadow-none"
                >
                  {isCompressing ? "Compressing..." : "Compress image"}
                </button>
              </div>

              {errorMessage && <p className="mt-4 text-sm font-medium text-rose-700">{errorMessage}</p>}
            </div>
          </div>

          <aside className="space-y-6 lg:col-span-4">
            <div className="rounded-2xl bg-[var(--surface-low)] p-6">
              <h2 className="font-headline text-xl font-bold">Result</h2>

              <div className="mt-4 rounded-xl bg-white p-4">
                {previewUrl && file ? (
                  <>
                    <img src={previewUrl} alt={file.name} className="mb-3 h-40 w-full rounded-lg object-cover" />
                    <p className="truncate text-sm font-bold">{file.name}</p>
                    <p className="text-xs text-[var(--text-muted)]">Ready to compress</p>
                  </>
                ) : (
                  <p className="text-sm text-[var(--text-muted)]">No files yet. Upload an image to get started.</p>
                )}
              </div>

              {downloadUrl ? (
                <>
                  <p className="mt-4 text-sm font-medium text-emerald-700">Compression complete.</p>
                  {file && compressedSize !== null && (
                    <p className="mt-1 text-xs text-[var(--text-muted)]">
                      {formatBytes(file.size)} → {formatBytes(compressedSize)}
                    </p>
                  )}
                  <a
                    href={downloadUrl}
                    download={outputName}
                    className="mt-4 inline-flex w-full items-center justify-center rounded-full bg-[var(--primary-container)]/20 px-4 py-3 text-sm font-semibold text-[var(--primary)] transition hover:bg-[var(--primary-container)]/40"
                  >
                    Download {outputName}
                  </a>
                </>
              ) : (
                <div className="mt-4 rounded-xl bg-white px-4 py-3 text-sm text-[var(--text-muted)]">
                  {isCompressing ? "Compressing image..." : "Compressed image will appear here."}
                </div>
              )}

              <p className="mt-4 rounded-lg border-l-4 border-[var(--primary)] bg-indigo-50 p-3 text-xs text-[var(--text)]">
                Browser mode: your file stays on-device during compression.
              </p>
            </div>
          </aside>
        </section>

        <section className="space-y-8">
          <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--primary)]">Power Tools</p>
              <h2 className="font-headline text-4xl font-extrabold">Popular Converters</h2>
            </div>
            <button type="button" className="text-sm font-bold text-[var(--primary)]">View all tools →</button>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {toolCards.map((tool) => (
              <article key={tool.title} className="rounded-2xl bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                <h3 className="font-headline text-xl font-bold">{tool.title}</h3>
                <p className="mt-2 text-sm text-[var(--text-muted)]">{tool.description}</p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {tool.tags.map((tag) => (
                    <span key={tag} className="rounded-md bg-[var(--surface-high)] px-2 py-1 text-[10px] font-bold text-[var(--text-muted)]">
                      {tag}
                    </span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>

      <footer className="bg-slate-100">
        <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-6 px-6 py-10 text-center md:flex-row md:text-left">
          <div>
            <p className="font-headline text-xl font-bold">Convertly</p>
            <p className="text-sm text-slate-500">© 2026 Convertly. Precision File Conversion.</p>
          </div>
          <div className="flex flex-wrap justify-center gap-5 text-sm text-slate-500">
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
            <span>Contact Us</span>
            <span>API Documentation</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
