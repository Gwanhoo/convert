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
    acceptedMimeTypes: [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "image/gif",
      "image/bmp",
      "image/x-icon",
      "image/vnd.microsoft.icon"
    ],
    options: [
      {
        id: "png",
        label: "PNG",
        outputMimeType: "image/png",
        outputExtension: "png"
      },
      {
        id: "jpg",
        label: "JPG / JPEG",
        outputMimeType: "image/jpeg",
        outputExtension: "jpg"
      },
      {
        id: "webp",
        label: "WebP",
        outputMimeType: "image/webp",
        outputExtension: "webp"
      },
      {
        id: "gif",
        label: "GIF",
        outputMimeType: "image/gif",
        outputExtension: "gif"
      },
      {
        id: "bmp",
        label: "BMP",
        outputMimeType: "image/bmp",
        outputExtension: "bmp"
      },
      {
        id: "ico",
        label: "ICO",
        outputMimeType: "image/x-icon",
        outputExtension: "ico"
      }
    ]
  }
];