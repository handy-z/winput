import type { ImageData } from "../../types/image";
import * as actions from "./actions";

export class ImageProcessing {
  protected imageData: ImageData;

  constructor(imageData: ImageData) {
    this.imageData = imageData;
  }

  clone(): this {
    this.imageData = actions.clone(this.imageData);
    return this;
  }

  grayscale(): this {
    this.imageData = actions.grayscale(this.imageData);
    return this;
  }

  brightness(factor: number): this {
    this.imageData = actions.brightness(this.imageData, factor);
    return this;
  }

  contrast(factor: number): this {
    this.imageData = actions.contrast(this.imageData, factor);
    return this;
  }

  blur(radius: number = 1): this {
    this.imageData = actions.gaussianBlur(this.imageData, radius);
    return this;
  }

  sharpen(): this {
    this.imageData = actions.sharpen(this.imageData);
    return this;
  }

  edges(): this {
    this.imageData = actions.sobel(this.imageData);
    return this;
  }

  dilate(pixels: number = 1): this {
    this.imageData = actions.dilate(this.imageData, pixels);
    return this;
  }

  erode(pixels: number = 1): this {
    this.imageData = actions.erode(this.imageData, pixels);
    return this;
  }

  erode2dilate(pixels: number = 1): this {
    this.imageData = actions.erode2dilate(this.imageData, pixels);
    return this;
  }

  dilate2erode(pixels: number = 1): this {
    this.imageData = actions.dilate2erode(this.imageData, pixels);
    return this;
  }

  invert(): this {
    this.imageData = actions.invert(this.imageData);
    return this;
  }

  sepia(): this {
    this.imageData = actions.sepia(this.imageData);
    return this;
  }

  hue(degrees: number): this {
    this.imageData = actions.hue(this.imageData, degrees);
    return this;
  }

  saturate(factor: number): this {
    this.imageData = actions.saturate(this.imageData, factor);
    return this;
  }

  rotate(degrees: number): this {
    this.imageData = actions.rotate(this.imageData, degrees);
    return this;
  }

  flip(horizontal: boolean = false, vertical: boolean = false): this {
    this.imageData = actions.flip(this.imageData, horizontal, vertical);
    return this;
  }

  crop(x: number, y: number, w: number, h: number): this {
    this.imageData = actions.crop(this.imageData, x, y, w, h);
    return this;
  }

  resize(
    newWidth: number,
    newHeight: number,
    algorithm: "nearest" | "bilinear" = "bilinear"
  ): this {
    this.imageData = actions.resize(this.imageData, newWidth, newHeight, algorithm);
    return this;
  }

  threshold(value: number = 128): this {
    this.imageData = actions.threshold(this.imageData, value);
    return this;
  }

  adaptiveThreshold(blockSize: number = 11): this {
    this.imageData = actions.adaptiveThreshold(this.imageData, blockSize);
    return this;
  }

  medianFilter(radius: number = 1): this {
    this.imageData = actions.medianFilter(this.imageData, radius);
    return this;
  }

  bilateralFilter(spatialSigma: number = 3, rangeSigma: number = 50): this {
    this.imageData = actions.bilateralFilter(this.imageData, spatialSigma, rangeSigma);
    return this;
  }

  histogram(): { r: number[]; g: number[]; b: number[] } {
    return actions.histogram(this.imageData);
  }

  autoLevel(): this {
    this.imageData = actions.autoLevel(this.imageData);
    return this;
  }

  overlay(
    overlayImg: ImageData,
    x: number = 0,
    y: number = 0,
    alpha: number = 1.0
  ): this {
    this.imageData = actions.overlay(this.imageData, overlayImg, x, y, alpha);
    return this;
  }

  blend(
    img2: ImageData,
    mode: "multiply" | "screen" | "overlay" | "add" | "subtract" = "multiply"
  ): this {
    this.imageData = actions.blend(this.imageData, img2, mode);
    return this;
  }

  denoise(strength: "light" | "medium" | "heavy" = "medium"): this {
    switch (strength) {
      case "light":
        this.medianFilter(1);
        break;
      case "medium":
        this.bilateralFilter(3, 50).medianFilter(1);
        break;
      case "heavy":
        this.bilateralFilter(5, 75).medianFilter(2);
        break;
    }
    return this;
  }

  toPixels(): [number, number, number, number][] {
    return actions.toPixels(this.imageData);
  }
}
