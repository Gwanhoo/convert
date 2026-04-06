"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { convertImageFile } from "@/lib/imageConverter";
import { conversionDefinitions } from "@/lib/conversionTypes";
import {
  getUnsupportedFormatMessage,
  normalizeMimeType
} from "@/lib/imageFormatSupport";
import { FormatSelector } from "@/components/FormatSelector";
export const metadata = {
  title: "Image Converter - JPG to PNG, WebP Online",
  description: "Convert JPG and PNG images to WebP, PNG, or JPG instantly in your browser."
};


const imageDefinition = conversionDefinitions[0];

const formatLabelByMimeType: Record<string, string> = {
  "image/jpeg": "JPG",
  "image/jpg": "JPG",
  "image/png": "PNG"
};

const outputOptionsByInputMime: Record<string, string[]> = {
  "image/jpeg": ["png", "webp"],
  "image/jpg": ["png", "webp"],
  "image/png": ["jpg", "webp"]
};

export default function HomePage() {
  const [file, setFile] = useState<File | null>(null);
  const [selectedFormat, setSelectedFormat] = useState("webp");
  const [isConverting, setIsConverting] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const previewUrl = useMemo(() => {
    return file ? URL.createObjectURL(file) : null;
  }, [file]);

  const allowedOutputIds = useMemo(() => {
    if (!file) {
      return ["png", "jpg", "webp"];
    }

    const normalizedMimeType = normalizeMimeType(file.type);
    return outputOptionsByInputMime[normalizedMimeType] ?? [];
  }, [file]);

  const allowedOptions = useMemo(() => {
    return imageDefinition.options.filter((option) => allowedOutputIds.includes(option.id));
  }, [allowedOutputIds]);

  const selectedOption = useMemo(() => {
    return (
      allowedOptions.find((option) => option.id === selectedFormat) ??
      allowedOptions[0] ??
      imageDefinition.options[0]
    );
  }, [allowedOptions, selectedFormat]);

  useEffect(() => {
    if (allowedOptions.length === 0) {
      return;
    }

    if (!allowedOptions.some((option) => option.id === selectedFormat)) {
      setSelectedFormat(allowedOptions[0].id);
    }
  }, [allowedOptions, selectedFormat]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    };
  }, [previewUrl, downloadUrl]);

  function resetDownload() {
    if (downloadUrl) {
      URL.revokeObjectURL(downloadUrl);
    }
    setDownloadUrl(null);
  }

  async function handleConvert() {
    if (!file) {
      setErrorMessage("Please upload an image file first.");
      return;
    }

    if (allowedOptions.length === 0) {
      setErrorMessage("This file type cannot be converted to a supported output format.");
      return;
    }

    setErrorMessage(null);
    setIsConverting(true);

    try {
      resetDownload();
      const convertedBlob = await convertImageFile(file, selectedOption);
      setDownloadUrl(URL.createObjectURL(convertedBlob));
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Conversion failed.");
    } finally {
      setIsConverting(false);
    }
  }

  function handleFileSelection(nextFile: File) {
    if (!nextFile.type.startsWith("image/")) {
      setErrorMessage("Invalid file. Please upload an image file.");
      setFile(null);
      resetDownload();
      return;
    }

    const normalizedMimeType = normalizeMimeType(nextFile.type);

    if (!["image/jpeg", "image/jpg", "image/png"].includes(normalizedMimeType)) {
      setErrorMessage(getUnsupportedFormatMessage(nextFile.type));
      setFile(null);
      resetDownload();
      return;
    }

    setFile(nextFile);
    setErrorMessage(null);
    resetDownload();
  }

  const outputName = `image-converted.${selectedOption.outputExtension}`;

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-10 text-slate-900">
      <main className="mx-auto max-w-5xl space-y-8">
        <section className="rounded-2xl bg-white p-8 shadow-sm">
          <h1 className="text-3xl font-bold">Image Converter</h1>
          <p className="mt-2 text-sm text-slate-600">
            Convert JPG and PNG images to PNG, JPG, or WebP directly in your browser.
          </p>

          <div className="mt-4 flex items-center justify-center gap-3">
            <Link
              href="/image-compressor"
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
            >
              Go to Image Compressor
            </Link>
          </div>
        </section>

        <section className="grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold">1) Input</h2>
            <p className="mt-1 text-sm text-slate-600">
              Upload a JPG or PNG image and pick an output format.
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
              </div>
            )}

            <div className="mt-4">
              <FormatSelector
                options={allowedOptions}
                selectedOptionId={selectedOption.id}
                onChange={(optionId) => {
                  setSelectedFormat(optionId);
                  resetDownload();
                }}
                disabled={!file || allowedOptions.length === 0}
              />

              {file && (
                <p className="mt-2 text-xs text-slate-500">
                  {formatLabelByMimeType[normalizeMimeType(file.type)] ?? "Input"} →{" "}
                  {selectedOption.label}
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={handleConvert}
              disabled={!file || isConverting || allowedOptions.length === 0}
              className="mt-5 w-full rounded-lg bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {isConverting ? "Converting..." : "Convert image"}
            </button>

            {errorMessage && (
              <p className="mt-3 text-sm font-medium text-rose-700">{errorMessage}</p>
            )}
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold">2) Result</h2>
            <p className="mt-1 text-sm text-slate-600">
              Your converted image will appear here.
            </p>

            {downloadUrl ? (
              <div className="mt-6 space-y-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                <p className="text-sm font-medium text-emerald-800">Conversion complete.</p>
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
                {isConverting ? "Working on your conversion..." : "No converted file yet."}
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
