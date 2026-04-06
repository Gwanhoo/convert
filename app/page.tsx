"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { convertImageFile } from "@/lib/imageConverter";
import { conversionDefinitions } from "@/lib/conversionTypes";

const imageDefinition = conversionDefinitions[0];

const toolCards = [
  {
    title: "Image Converter",
    description: "Convert between WEBP, PNG, and JPG quickly in your browser.",
    tags: [".WEBP", ".PNG", ".JPG"]
  },
  {
    title: "MP4 to MP3",
    description: "Future tool: extract audio tracks from video files.",
    tags: ["COMING", "AUDIO"]
  },
  {
    title: "PDF to Word",
    description: "Future tool: OCR-ready document conversion pipeline.",
    tags: ["COMING", "OCR"]
  }
];

export default function HomePage() {
  const [file, setFile] = useState<File | null>(null);
  const [selectedFormat, setSelectedFormat] = useState(imageDefinition.options[0].id);
  const [isConverting, setIsConverting] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const selectedOption = useMemo(
    () => imageDefinition.options.find((option) => option.id === selectedFormat) ?? imageDefinition.options[0],
    [selectedFormat]
  );

  const previewUrl = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    };
  }, [previewUrl, downloadUrl]);

  async function handleConvert() {
    if (!file) return;

    setErrorMessage(null);
    setIsConverting(true);

    try {
      if (downloadUrl) URL.revokeObjectURL(downloadUrl);
      const convertedBlob = await convertImageFile(file, selectedOption);
      setDownloadUrl(URL.createObjectURL(convertedBlob));
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Conversion failed.");
    } finally {
      setIsConverting(false);
    }
  }

  const outputName = file
    ? `${file.name.replace(/\.[^/.]+$/, "")}.${selectedOption.outputExtension}`
    : `converted.${selectedOption.outputExtension}`;


  function handleFileSelection(nextFile: File) {
    if (!imageDefinition.acceptedMimeTypes.includes(nextFile.type)) {
      setErrorMessage("Unsupported file type. Please upload a JPG or PNG image.");
      setFile(null);
      setDownloadUrl(null);
      return;
    }

    setFile(nextFile);
    setDownloadUrl(null);
    setErrorMessage(null);
  }

  return (
    <div className="min-h-screen text-[var(--text)]">
      <header className="sticky top-0 z-50 tonal-shift backdrop-blur">
        <nav className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-4">
          <div className="font-headline text-2xl font-extrabold tracking-tight text-[var(--primary)]">Convertly</div>
          <div className="hidden items-center gap-8 md:flex">
            <span className="border-b-2 border-[var(--primary)] pb-1 text-sm font-semibold text-[var(--primary)]">Home</span>
            <span className="text-sm text-[var(--text-muted)]">Tools</span>
            <span className="text-sm text-[var(--text-muted)]">About</span>
          </div>
          <Link href="/image-compressor" className="rounded-full bg-[var(--primary)] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[var(--primary-dim)]">
            Image Compressor
          </Link>
        </nav>
      </header>

      <main className="mx-auto w-full max-w-7xl space-y-20 px-6 py-12">
        <section className="mx-auto max-w-4xl space-y-6 text-center">
          <h1 className="font-headline text-5xl font-extrabold leading-tight md:text-7xl">
            Convert Your Files <span className="bg-gradient-to-r from-[var(--primary)] to-[var(--primary-container)] bg-clip-text text-transparent">Instantly</span>
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-[var(--text-muted)]">
            Fast, secure, and free file conversion directly in your browser. No software installation required.
          </p>
        </section>

        <section className="grid grid-cols-1 gap-10 lg:grid-cols-12">
          <div className="space-y-6 lg:col-span-8">
            <div className="rounded-2xl bg-[var(--surface)] p-7 shadow-sm">
              <div className="mb-6 flex flex-wrap items-center gap-3">
                <span className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--text-muted)]">Convert</span>
                <div className="flex items-center gap-2 rounded-lg bg-[var(--surface-high)] px-3 py-2 text-sm font-semibold">
                  <span>{file ? file.name.split(".").pop()?.toUpperCase() : "JPG/PNG"}</span>
                  <span aria-hidden>→</span>
                  <span>{selectedOption.label}</span>
                </div>
              </div>

              <label className="group flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[var(--outline)]/40 bg-[var(--surface-low)]/60 px-6 py-16 text-center transition hover:border-[var(--primary)]/40 hover:bg-[var(--primary-container)]/10">
                <div className="mb-3 text-5xl text-[var(--primary)]">⤴</div>
                <h2 className="font-headline text-2xl font-bold">Drag & Drop File</h2>
                <p className="mt-2 text-sm text-[var(--text-muted)]">Supports JPG and PNG for now</p>
                <span className="mt-6 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--primary-dim)] px-8 py-3 text-xs font-bold uppercase tracking-[0.16em] text-white">
                  Upload File
                </span>
                <input
                  className="sr-only"
                  type="file"
                  accept={imageDefinition.acceptedMimeTypes.join(",")}
                  onChange={(event) => {
                    const nextFile = event.target.files?.[0];
                    if (nextFile) {
                      handleFileSelection(nextFile);
                    }
                    event.currentTarget.value = "";
                  }}
                />
              </label>

              <div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
                <div>
                  <label htmlFor="output-format" className="mb-2 block text-sm font-semibold text-[var(--text-muted)]">
                    Output format
                  </label>
                  <select
                    id="output-format"
                    value={selectedFormat}
                    onChange={(event) => {
                      setSelectedFormat(event.target.value);
                      setDownloadUrl(null);
                    }}
                    className="w-full rounded-xl border border-[var(--outline)]/40 bg-white px-4 py-3 text-sm font-medium"
                  >
                    {imageDefinition.options.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="button"
                  onClick={handleConvert}
                  disabled={!file || isConverting}
                  className="min-w-[220px] rounded-full bg-[var(--primary)] px-8 py-4 text-sm font-bold uppercase tracking-[0.12em] text-white shadow-lg shadow-[var(--primary)]/25 transition hover:bg-[var(--primary-dim)] disabled:cursor-not-allowed disabled:bg-slate-400 disabled:shadow-none"
                >
                  {isConverting ? "Converting..." : "Convert"}
                </button>
              </div>

              {errorMessage && <p className="mt-4 text-sm font-medium text-rose-700">{errorMessage}</p>}
            </div>
          </div>

          <aside className="space-y-6 lg:col-span-4">
            <div className="rounded-2xl bg-[var(--surface-low)] p-6">
              <h3 className="font-headline text-xl font-bold">Recent Activity</h3>
              <div className="mt-4 rounded-xl bg-white p-4">
                {previewUrl && file ? (
                  <>
                    <img src={previewUrl} alt={file.name} className="mb-3 h-40 w-full rounded-lg object-cover" />
                    <p className="truncate text-sm font-bold">{file.name}</p>
                    <p className="text-xs text-[var(--text-muted)]">Ready to convert</p>
                  </>
                ) : (
                  <p className="text-sm text-[var(--text-muted)]">No conversions yet. Upload an image to get started.</p>
                )}
              </div>

              {downloadUrl && (
                <a
                  href={downloadUrl}
                  download={outputName}
                  className="mt-4 inline-flex w-full items-center justify-center rounded-full bg-[var(--primary-container)]/20 px-4 py-3 text-sm font-semibold text-[var(--primary)] transition hover:bg-[var(--primary-container)]/40"
                >
                  Download converted file
                </a>
              )}

              <p className="mt-4 rounded-lg border-l-4 border-[var(--primary)] bg-indigo-50 p-3 text-xs text-[var(--text)]">
                Browser mode: your file stays on-device during conversion.
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
