import type { ConversionOption } from "./conversionTypes";
import { alphaUnsupportedOutputMimes, normalizeMimeType } from "./imageFormatSupport";

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

function isAnimatedGif(file: File): Promise<boolean> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const buffer = reader.result;
      if (!(buffer instanceof ArrayBuffer)) {
        resolve(false);
        return;
      }

      const bytes = new Uint8Array(buffer);
      let frameCount = 0;

      for (let i = 0; i < bytes.length - 2; i += 1) {
        if (bytes[i] === 0x21 && bytes[i + 1] === 0xf9 && bytes[i + 2] === 0x04) {
          frameCount += 1;
          if (frameCount > 1) {
            resolve(true);
            return;
          }
        }
      }

      resolve(false);
    };

    reader.onerror = () => reject(new Error("Could not read GIF file."));
    reader.readAsArrayBuffer(file);
  });
}

function canvasToBlob(canvas: HTMLCanvasElement, mimeType: string, quality = 0.92): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Image conversion failed."));
          return;
        }

        const normalizedRequestedType = normalizeMimeType(mimeType);
        const normalizedResultType = normalizeMimeType(blob.type);

        if (normalizedResultType !== normalizedRequestedType) {
          reject(new Error(`${mimeType} output is not supported in this browser.`));
          return;
        }

        resolve(blob);
      },
      mimeType,
      quality
    );
  });
}

export async function convertImageFile(file: File, option: ConversionOption): Promise<Blob> {
  const normalizedInputType = normalizeMimeType(file.type);

  if (normalizedInputType === "image/gif" && (await isAnimatedGif(file))) {
    throw new Error("Animated GIF is not supported. Please use a single-frame GIF image.");
  }

  const image = await loadImage(file);
  const canvas = document.createElement("canvas");
  canvas.width = image.width;
  canvas.height = image.height;

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Canvas is not supported in this browser.");
  }

  const outputMimeType = normalizeMimeType(option.outputMimeType);

  if (alphaUnsupportedOutputMimes.has(outputMimeType)) {
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);
  }

  context.drawImage(image, 0, 0);

  return canvasToBlob(canvas, outputMimeType, 0.92);
}
