export type ConversionCategory = "image" | "video" | "document";

export type ConversionOption = {
  id: string;
  label: string;
  outputMimeType: string;
  outputExtension: string;
};

export type ConversionDefinition = {
  id: string;
  category: ConversionCategory;
  label: string;
  acceptedMimeTypes: string[];
  options: ConversionOption[];
};

export const conversionDefinitions: ConversionDefinition[] = [
  {
    id: "image-basic",
    category: "image",
    label: "Image conversion",
    acceptedMimeTypes: ["image/jpeg", "image/png"],
    options: [
      {
        id: "png",
        label: "PNG",
        outputMimeType: "image/png",
        outputExtension: "png"
      },
      {
        id: "webp",
        label: "WebP",
        outputMimeType: "image/webp",
        outputExtension: "webp"
      }
    ]
  }
];
