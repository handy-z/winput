import { ImageData } from "../types";
import { utils } from "@winput/utils";

export function clone(img: ImageData): ImageData {
  return {
    path: img.path,
    width: img.width,
    height: img.height,
    buffer: new Uint8Array(img.buffer),
  };
}

export function grayscale(img: ImageData): ImageData {
  const { path, width, height, buffer: data } = img;
  const output = new Uint8Array(data.length);

  for (let i = 0; i < data.length; i += 4) {
    const b = data[i];
    const g = data[i + 1];
    const r = data[i + 2];
    const a = data[i + 3];

    const gray = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    const v = Math.min(255, Math.max(0, gray));

    output[i] = v;
    output[i + 1] = v;
    output[i + 2] = v;
    output[i + 3] = a;
  }

  return { path, width, height, buffer: output };
}

export function brightness(img: ImageData, factor: number): ImageData {
  const { path, width, height, buffer: data } = img;
  const output = new Uint8Array(data.length);
  const adjustment = factor * 255;

  for (let i = 0; i < data.length; i += 4) {
    for (let c = 0; c < 3; c++) {
      output[i + c] = Math.min(255, Math.max(0, data[i + c] + adjustment));
    }
    output[i + 3] = data[i + 3];
  }
  return { path, width, height, buffer: output };
}

export function contrast(img: ImageData, factor: number): ImageData {
  const { path, width, height, buffer: data } = img;
  const output = new Uint8Array(data.length);

  for (let i = 0; i < data.length; i += 4) {
    for (let c = 0; c < 3; c++) {
      const v = data[i + c];
      const newVal = factor * (v - 128) + 128;
      output[i + c] = Math.min(255, Math.max(0, newVal));
    }
    output[i + 3] = data[i + 3];
  }
  return { path, width, height, buffer: output };
}

export function convolve(
  img: ImageData,
  kernel: number[],
  kernelWidth: number
): ImageData {
  const { path, width, height, buffer: data } = img;
  const output = new Uint8Array(data.length);
  const half = Math.floor(kernelWidth / 2);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let r = 0,
        g = 0,
        b = 0;

      for (let ky = 0; ky < kernelWidth; ky++) {
        for (let kx = 0; kx < kernelWidth; kx++) {
          const px = Math.min(width - 1, Math.max(0, x + kx - half));
          const py = Math.min(height - 1, Math.max(0, y + ky - half));
          const idx = (py * width + px) * 4;
          const kVal = kernel[ky * kernelWidth + kx];

          b += data[idx] * kVal;
          g += data[idx + 1] * kVal;
          r += data[idx + 2] * kVal;
        }
      }

      const idx = (y * width + x) * 4;
      output[idx] = Math.min(255, Math.max(0, b));
      output[idx + 1] = Math.min(255, Math.max(0, g));
      output[idx + 2] = Math.min(255, Math.max(0, r));
      output[idx + 3] = data[idx + 3];
    }
  }

  return { path, width, height, buffer: output };
}

export function gaussianBlur(img: ImageData, radius: number = 1): ImageData {
  if (radius === 1) {
    const kernel = [
      1 / 16,
      2 / 16,
      1 / 16,
      2 / 16,
      4 / 16,
      2 / 16,
      1 / 16,
      2 / 16,
      1 / 16,
    ];
    return convolve(img, kernel, 3);
  }
  const kernel = [
    1, 4, 7, 4, 1, 4, 16, 26, 16, 4, 7, 26, 41, 26, 7, 4, 16, 26, 16, 4, 1, 4,
    7, 4, 1,
  ].map((x) => x / 273);
  return convolve(img, kernel, 5);
}

export function sharpen(img: ImageData): ImageData {
  const kernel = [0, -1, 0, -1, 5, -1, 0, -1, 0];
  return convolve(img, kernel, 3);
}

export function sobel(img: ImageData): ImageData {
  const gray = grayscale(img);
  const { path, width, height, buffer: data } = gray;
  const output = new Uint8Array(data.length);

  const kx = [-1, 0, 1, -2, 0, 2, -1, 0, 1];
  const ky = [-1, -2, -1, 0, 0, 0, 1, 2, 1];

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      let pixelX = 0;
      let pixelY = 0;

      for (let j = -1; j <= 1; j++) {
        for (let i = -1; i <= 1; i++) {
          const idx = ((y + j) * width + (x + i)) * 4;
          const val = data[idx + 1];
          pixelX += val * kx[(j + 1) * 3 + (i + 1)];
          pixelY += val * ky[(j + 1) * 3 + (i + 1)];
        }
      }

      const mag = Math.sqrt(pixelX * pixelX + pixelY * pixelY);
      const val = Math.min(255, Math.max(0, mag));

      const idx = (y * width + x) * 4;
      output[idx] = val;
      output[idx + 1] = val;
      output[idx + 2] = val;
      output[idx + 3] = 255;
    }
  }

  return { path, width, height, buffer: output };
}

export function dilate(img: ImageData, pixels: number = 1): ImageData {
  const { path, width, height, buffer: data } = img;
  const output = new Uint8Array(data.length);
  for (let i = 3; i < data.length; i += 4) output[i] = data[i];

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let maxR = 0,
        maxG = 0,
        maxB = 0;

      for (let dy = -pixels; dy <= pixels; dy++) {
        for (let dx = -pixels; dx <= pixels; dx++) {
          const ny = y + dy;
          const nx = x + dx;
          if (ny >= 0 && ny < height && nx >= 0 && nx < width) {
            const idx = (ny * width + nx) * 4;
            maxB = Math.max(maxB, data[idx]);
            maxG = Math.max(maxG, data[idx + 1]);
            maxR = Math.max(maxR, data[idx + 2]);
          }
        }
      }
      const idx = (y * width + x) * 4;
      output[idx] = maxB;
      output[idx + 1] = maxG;
      output[idx + 2] = maxR;
    }
  }
  return { path, width, height, buffer: output };
}

export function erode(img: ImageData, pixels: number = 1): ImageData {
  const { path, width, height, buffer: data } = img;
  const output = new Uint8Array(data.length);
  for (let i = 3; i < data.length; i += 4) output[i] = data[i];

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let minR = 255,
        minG = 255,
        minB = 255;

      for (let dy = -pixels; dy <= pixels; dy++) {
        for (let dx = -pixels; dx <= pixels; dx++) {
          const ny = y + dy;
          const nx = x + dx;
          if (ny >= 0 && ny < height && nx >= 0 && nx < width) {
            const idx = (ny * width + nx) * 4;
            minB = Math.min(minB, data[idx]);
            minG = Math.min(minG, data[idx + 1]);
            minR = Math.min(minR, data[idx + 2]);
          }
        }
      }
      const idx = (y * width + x) * 4;
      output[idx] = minB;
      output[idx + 1] = minG;
      output[idx + 2] = minR;
    }
  }
  return { path, width, height, buffer: output };
}

export function erode2dilate(img: ImageData, pixels: number = 1): ImageData {
  return dilate(erode(img, pixels), pixels);
}

export function dilate2erode(img: ImageData, pixels: number = 1): ImageData {
  return erode(dilate(img, pixels), pixels);
}

export function toPixels(img: ImageData): [number, number, number, number][] {
  const { buffer: data } = img;
  const pixels: [number, number, number, number][] = [];
  for (let i = 0; i < data.length; i += 4) {
    pixels.push([data[i + 2], data[i + 1], data[i], data[i + 3]]);
  }
  return pixels;
}

export function invert(img: ImageData): ImageData {
  const { path, width, height, buffer: data } = img;
  const output = new Uint8Array(data.length);

  for (let i = 0; i < data.length; i += 4) {
    output[i] = 255 - data[i];
    output[i + 1] = 255 - data[i + 1];
    output[i + 2] = 255 - data[i + 2];
    output[i + 3] = data[i + 3];
  }

  return { path, width, height, buffer: output };
}

export function sepia(img: ImageData): ImageData {
  const { path, width, height, buffer: data } = img;
  const output = new Uint8Array(data.length);

  for (let i = 0; i < data.length; i += 4) {
    const b = data[i];
    const g = data[i + 1];
    const r = data[i + 2];

    output[i] = Math.min(255, r * 0.272 + g * 0.534 + b * 0.131);
    output[i + 1] = Math.min(255, r * 0.349 + g * 0.686 + b * 0.168);
    output[i + 2] = Math.min(255, r * 0.393 + g * 0.769 + b * 0.189);
    output[i + 3] = data[i + 3];
  }

  return { path, width, height, buffer: output };
}

export function hue(img: ImageData, degrees: number): ImageData {
  const { path, width, height, buffer: data } = img;
  const output = new Uint8Array(data.length);

  for (let i = 0; i < data.length; i += 4) {
    const b = data[i];
    const g = data[i + 1];
    const r = data[i + 2];

    const [h, s, v] = utils.rgbToHsv(r, g, b);
    const newH = (h + degrees) % 360;
    const [newR, newG, newB] = utils.hsvToRgb(
      newH < 0 ? newH + 360 : newH,
      s,
      v
    );

    output[i] = newB;
    output[i + 1] = newG;
    output[i + 2] = newR;
    output[i + 3] = data[i + 3];
  }

  return { path, width, height, buffer: output };
}

export function saturate(img: ImageData, factor: number): ImageData {
  const { path, width, height, buffer: data } = img;
  const output = new Uint8Array(data.length);

  for (let i = 0; i < data.length; i += 4) {
    const b = data[i];
    const g = data[i + 1];
    const r = data[i + 2];

    const [h, s, v] = utils.rgbToHsv(r, g, b);
    const newS = Math.min(1, Math.max(0, s * factor));
    const [newR, newG, newB] = utils.hsvToRgb(h, newS, v);

    output[i] = newB;
    output[i + 1] = newG;
    output[i + 2] = newR;
    output[i + 3] = data[i + 3];
  }

  return { path, width, height, buffer: output };
}

export function rotate(img: ImageData, degrees: number): ImageData {
  const { path, width, height, buffer: data } = img;
  const rad = (degrees * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);

  const newWidth = Math.ceil(Math.abs(width * cos) + Math.abs(height * sin));
  const newHeight = Math.ceil(Math.abs(width * sin) + Math.abs(height * cos));

  const output = new Uint8Array(newWidth * newHeight * 4);
  const cx = width / 2;
  const cy = height / 2;
  const ncx = newWidth / 2;
  const ncy = newHeight / 2;

  for (let y = 0; y < newHeight; y++) {
    for (let x = 0; x < newWidth; x++) {
      const ox = (x - ncx) * cos + (y - ncy) * sin + cx;
      const oy = -(x - ncx) * sin + (y - ncy) * cos + cy;

      if (ox >= 0 && ox < width && oy >= 0 && oy < height) {
        const srcIdx = (Math.floor(oy) * width + Math.floor(ox)) * 4;
        const dstIdx = (y * newWidth + x) * 4;

        output[dstIdx] = data[srcIdx];
        output[dstIdx + 1] = data[srcIdx + 1];
        output[dstIdx + 2] = data[srcIdx + 2];
        output[dstIdx + 3] = data[srcIdx + 3];
      }
    }
  }

  return { path, width: newWidth, height: newHeight, buffer: output };
}

export function flip(
  img: ImageData,
  horizontal: boolean = false,
  vertical: boolean = false
): ImageData {
  const { path, width, height, buffer: data } = img;
  const output = new Uint8Array(data.length);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const srcX = horizontal ? width - 1 - x : x;
      const srcY = vertical ? height - 1 - y : y;
      const srcIdx = (srcY * width + srcX) * 4;
      const dstIdx = (y * width + x) * 4;

      output[dstIdx] = data[srcIdx];
      output[dstIdx + 1] = data[srcIdx + 1];
      output[dstIdx + 2] = data[srcIdx + 2];
      output[dstIdx + 3] = data[srcIdx + 3];
    }
  }

  return { path, width, height, buffer: output };
}

export function crop(
  img: ImageData,
  x: number,
  y: number,
  w: number,
  h: number
): ImageData {
  const { path, width, height, buffer: data } = img;

  const startX = Math.max(0, Math.min(width, x));
  const startY = Math.max(0, Math.min(height, y));
  const endX = Math.max(0, Math.min(width, x + w));
  const endY = Math.max(0, Math.min(height, y + h));
  const cropWidth = endX - startX;
  const cropHeight = endY - startY;

  const output = new Uint8Array(cropWidth * cropHeight * 4);

  for (let cy = 0; cy < cropHeight; cy++) {
    for (let cx = 0; cx < cropWidth; cx++) {
      const srcIdx = ((startY + cy) * width + (startX + cx)) * 4;
      const dstIdx = (cy * cropWidth + cx) * 4;

      output[dstIdx] = data[srcIdx];
      output[dstIdx + 1] = data[srcIdx + 1];
      output[dstIdx + 2] = data[srcIdx + 2];
      output[dstIdx + 3] = data[srcIdx + 3];
    }
  }

  return { path, width: cropWidth, height: cropHeight, buffer: output };
}

export function resize(
  img: ImageData,
  newWidth: number,
  newHeight: number,
  algorithm: "nearest" | "bilinear" = "bilinear"
): ImageData {
  const { path, width, height, buffer: data } = img;
  const output = new Uint8Array(newWidth * newHeight * 4);

  if (algorithm === "nearest") {
    const xRatio = width / newWidth;
    const yRatio = height / newHeight;

    for (let y = 0; y < newHeight; y++) {
      for (let x = 0; x < newWidth; x++) {
        const srcX = Math.floor(x * xRatio);
        const srcY = Math.floor(y * yRatio);
        const srcIdx = (srcY * width + srcX) * 4;
        const dstIdx = (y * newWidth + x) * 4;

        output[dstIdx] = data[srcIdx];
        output[dstIdx + 1] = data[srcIdx + 1];
        output[dstIdx + 2] = data[srcIdx + 2];
        output[dstIdx + 3] = data[srcIdx + 3];
      }
    }
  } else {
    const xRatio = (width - 1) / newWidth;
    const yRatio = (height - 1) / newHeight;

    for (let y = 0; y < newHeight; y++) {
      for (let x = 0; x < newWidth; x++) {
        const srcX = x * xRatio;
        const srcY = y * yRatio;
        const x1 = Math.floor(srcX);
        const y1 = Math.floor(srcY);
        const x2 = Math.min(width - 1, x1 + 1);
        const y2 = Math.min(height - 1, y1 + 1);
        const xWeight = srcX - x1;
        const yWeight = srcY - y1;

        for (let c = 0; c < 4; c++) {
          const p1 = data[(y1 * width + x1) * 4 + c];
          const p2 = data[(y1 * width + x2) * 4 + c];
          const p3 = data[(y2 * width + x1) * 4 + c];
          const p4 = data[(y2 * width + x2) * 4 + c];

          const val =
            p1 * (1 - xWeight) * (1 - yWeight) +
            p2 * xWeight * (1 - yWeight) +
            p3 * (1 - xWeight) * yWeight +
            p4 * xWeight * yWeight;

          output[(y * newWidth + x) * 4 + c] = Math.round(val);
        }
      }
    }
  }

  return { path, width: newWidth, height: newHeight, buffer: output };
}

export function threshold(img: ImageData, value: number = 128): ImageData {
  const gray = grayscale(img);
  const { path, width, height, buffer: data } = gray;
  const output = new Uint8Array(data.length);

  for (let i = 0; i < data.length; i += 4) {
    const v = data[i + 1] >= value ? 255 : 0;
    output[i] = v;
    output[i + 1] = v;
    output[i + 2] = v;
    output[i + 3] = data[i + 3];
  }

  return { path, width, height, buffer: output };
}

export function adaptiveThreshold(
  img: ImageData,
  blockSize: number = 11
): ImageData {
  const gray = grayscale(img);
  const { path, width, height, buffer: data } = gray;
  const output = new Uint8Array(data.length);
  const half = Math.floor(blockSize / 2);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let sum = 0;
      let count = 0;

      for (let dy = -half; dy <= half; dy++) {
        for (let dx = -half; dx <= half; dx++) {
          const nx = Math.min(width - 1, Math.max(0, x + dx));
          const ny = Math.min(height - 1, Math.max(0, y + dy));
          sum += data[(ny * width + nx) * 4 + 1];
          count++;
        }
      }

      const mean = sum / count;
      const idx = (y * width + x) * 4;
      const v = data[idx + 1] >= mean ? 255 : 0;

      output[idx] = v;
      output[idx + 1] = v;
      output[idx + 2] = v;
      output[idx + 3] = data[idx + 3];
    }
  }

  return { path, width, height, buffer: output };
}

export function medianFilter(img: ImageData, radius: number = 1): ImageData {
  const { path, width, height, buffer: data } = img;
  const output = new Uint8Array(data.length);
  const windowSize = radius * 2 + 1;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const values: number[][] = [[], [], []];

      for (let dy = -radius; dy <= radius; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
          const nx = Math.min(width - 1, Math.max(0, x + dx));
          const ny = Math.min(height - 1, Math.max(0, y + dy));
          const idx = (ny * width + nx) * 4;

          values[0].push(data[idx]);
          values[1].push(data[idx + 1]);
          values[2].push(data[idx + 2]);
        }
      }

      for (let c = 0; c < 3; c++) {
        values[c].sort((a, b) => a - b);
      }

      const midIdx = Math.floor((windowSize * windowSize) / 2);
      const idx = (y * width + x) * 4;

      output[idx] = values[0][midIdx];
      output[idx + 1] = values[1][midIdx];
      output[idx + 2] = values[2][midIdx];
      output[idx + 3] = data[idx + 3];
    }
  }

  return { path, width, height, buffer: output };
}

export function bilateralFilter(
  img: ImageData,
  spatialSigma: number = 3,
  rangeSigma: number = 50
): ImageData {
  const { path, width, height, buffer: data } = img;
  const output = new Uint8Array(data.length);
  const radius = Math.ceil(spatialSigma * 2);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let sumB = 0,
        sumG = 0,
        sumR = 0,
        sumW = 0;
      const centerIdx = (y * width + x) * 4;
      const centerB = data[centerIdx];
      const centerG = data[centerIdx + 1];
      const centerR = data[centerIdx + 2];

      for (let dy = -radius; dy <= radius; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
          const nx = Math.min(width - 1, Math.max(0, x + dx));
          const ny = Math.min(height - 1, Math.max(0, y + dy));
          const idx = (ny * width + nx) * 4;

          const spatialDist = dx * dx + dy * dy;
          const colorDist =
            Math.pow(data[idx] - centerB, 2) +
            Math.pow(data[idx + 1] - centerG, 2) +
            Math.pow(data[idx + 2] - centerR, 2);

          const weight = Math.exp(
            -spatialDist / (2 * spatialSigma * spatialSigma) -
              colorDist / (2 * rangeSigma * rangeSigma)
          );

          sumB += data[idx] * weight;
          sumG += data[idx + 1] * weight;
          sumR += data[idx + 2] * weight;
          sumW += weight;
        }
      }

      output[centerIdx] = Math.round(sumB / sumW);
      output[centerIdx + 1] = Math.round(sumG / sumW);
      output[centerIdx + 2] = Math.round(sumR / sumW);
      output[centerIdx + 3] = data[centerIdx + 3];
    }
  }

  return { path, width, height, buffer: output };
}

export function histogram(img: ImageData): {
  r: number[];
  g: number[];
  b: number[];
} {
  const { buffer: data } = img;
  const r = new Array(256).fill(0);
  const g = new Array(256).fill(0);
  const b = new Array(256).fill(0);

  for (let i = 0; i < data.length; i += 4) {
    b[data[i]]++;
    g[data[i + 1]]++;
    r[data[i + 2]]++;
  }

  return { r, g, b };
}

export function autoLevel(img: ImageData): ImageData {
  const { path, width, height, buffer: data } = img;
  const output = new Uint8Array(data.length);

  let minR = 255,
    maxR = 0,
    minG = 255,
    maxG = 0,
    minB = 255,
    maxB = 0;

  for (let i = 0; i < data.length; i += 4) {
    minB = Math.min(minB, data[i]);
    maxB = Math.max(maxB, data[i]);
    minG = Math.min(minG, data[i + 1]);
    maxG = Math.max(maxG, data[i + 1]);
    minR = Math.min(minR, data[i + 2]);
    maxR = Math.max(maxR, data[i + 2]);
  }

  const rangeB = maxB - minB || 1;
  const rangeG = maxG - minG || 1;
  const rangeR = maxR - minR || 1;

  for (let i = 0; i < data.length; i += 4) {
    output[i] = ((data[i] - minB) * 255) / rangeB;
    output[i + 1] = ((data[i + 1] - minG) * 255) / rangeG;
    output[i + 2] = ((data[i + 2] - minR) * 255) / rangeR;
    output[i + 3] = data[i + 3];
  }

  return { path, width, height, buffer: output };
}

export function overlay(
  img: ImageData,
  overlayImg: ImageData,
  x: number = 0,
  y: number = 0,
  alpha: number = 1.0
): ImageData {
  const { path, width, height, buffer: data } = img;
  const output = new Uint8Array(data);

  for (let oy = 0; oy < overlayImg.height; oy++) {
    for (let ox = 0; ox < overlayImg.width; ox++) {
      const destX = x + ox;
      const destY = y + oy;

      if (destX >= 0 && destX < width && destY >= 0 && destY < height) {
        const srcIdx = (oy * overlayImg.width + ox) * 4;
        const dstIdx = (destY * width + destX) * 4;

        const overlayAlpha = (overlayImg.buffer[srcIdx + 3] / 255) * alpha;

        for (let c = 0; c < 3; c++) {
          output[dstIdx + c] = Math.round(
            overlayImg.buffer[srcIdx + c] * overlayAlpha +
              output[dstIdx + c] * (1 - overlayAlpha)
          );
        }
      }
    }
  }

  return { path, width, height, buffer: output };
}

export function blend(
  img: ImageData,
  img2: ImageData,
  mode: "multiply" | "screen" | "overlay" | "add" | "subtract" = "multiply"
): ImageData {
  const { path, width, height, buffer: data } = img;
  const output = new Uint8Array(data.length);

  const minWidth = Math.min(width, img2.width);
  const minHeight = Math.min(height, img2.height);

  for (let y = 0; y < minHeight; y++) {
    for (let x = 0; x < minWidth; x++) {
      const idx = (y * width + x) * 4;
      const idx2 = (y * img2.width + x) * 4;

      for (let c = 0; c < 3; c++) {
        const v1 = data[idx + c] / 255;
        const v2 = img2.buffer[idx2 + c] / 255;
        let result = 0;

        switch (mode) {
          case "multiply":
            result = v1 * v2;
            break;
          case "screen":
            result = 1 - (1 - v1) * (1 - v2);
            break;
          case "overlay":
            result = v1 < 0.5 ? 2 * v1 * v2 : 1 - 2 * (1 - v1) * (1 - v2);
            break;
          case "add":
            result = Math.min(1, v1 + v2);
            break;
          case "subtract":
            result = Math.max(0, v1 - v2);
            break;
        }

        output[idx + c] = Math.round(result * 255);
      }

      output[idx + 3] = data[idx + 3];
    }
  }

  for (let i = minHeight * width * 4; i < data.length; i++) {
    output[i] = data[i];
  }

  return { path, width, height, buffer: output };
}
