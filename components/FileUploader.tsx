"use client";

type FileUploaderProps = {
  onFileSelected: (file: File) => void;
  accept: string;
};

export function FileUploader({ onFileSelected, accept }: FileUploaderProps) {
  return (
    <label className="block w-full cursor-pointer rounded-lg border-2 border-dashed border-slate-300 bg-white p-6 text-center transition hover:border-slate-400">
      <span className="block text-sm font-medium text-slate-700">Upload file</span>
      <span className="mt-1 block text-xs text-slate-500">
        JPG and PNG are supported for now.
      </span>
      <input
        className="sr-only"
        type="file"
        accept={accept}
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) {
            onFileSelected(file);
          }
        }}
      />
    </label>
  );
}
