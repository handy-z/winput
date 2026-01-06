import type { ImageData } from "../types";
import * as actions from "./actions";

export class ImageProcessing {
  protected imageData: ImageData;

  constructor(imageData: ImageData) {
    this.imageData = imageData;
  }

  /**
   * Creates a deep copy of the image.
   *
   * @returns {this} New independent image instance
   * @example
   * ```typescript
   * const original = await image.load("photo.png");
   * const copy = original.clone().grayscale();
   * await original.save("original.png"); // Unaffected
   * await copy.save("gray.png");
   * ```
   */
  clone(): this {
    this.imageData = actions.clone(this.imageData);
    return this;
  }

  /**
   * Converts the image to grayscale (black and white).
   *
   * Removes color information, leaving only luminance.
   *
   * @returns {this} This instance for chaining
   * @example
   * ```typescript
   * img.grayscale();
   * ```
   */
  grayscale(): this {
    this.imageData = actions.grayscale(this.imageData);
    return this;
  }

  /**
   * Adjusts the brightness of the image.
   *
   * @param factor - Multiplier for brightness (0.0 to infinity).
   *                 1.0 = original brightness
   *                 0.5 = 50% darker
   *                 2.0 = 200% brighter
   * @returns {this} This instance for chaining
   * @example
   * ```typescript
   * img.brightness(1.5); // Increase brightness by 50%
   * ```
   */
  brightness(factor: number): this {
    this.imageData = actions.brightness(this.imageData, factor);
    return this;
  }

  /**
   * Adjusts the contrast of the image.
   *
   * @param factor - Multiplier for contrast (0.0 to infinity).
   *                 1.0 = original contrast
   *                 0.5 = lower contrast
   *                 2.0 = higher contrast
   * @returns {this} This instance for chaining
   * @example
   * ```typescript
   * img.contrast(1.2); // Increase contrast by 20%
   * ```
   */
  contrast(factor: number): this {
    this.imageData = actions.contrast(this.imageData, factor);
    return this;
  }

  /**
   * Applies a Gaussian blur to the image.
   *
   * Useful for reducing noise or softening details.
   *
   * @param radius - Blur radius in pixels (default: 1). Larger values = more blur.
   * @returns {this} This instance for chaining
   * @example
   * ```typescript
   * img.blur(3); // Apply strong blur
   * ```
   */
  blur(radius: number = 1): this {
    this.imageData = actions.gaussianBlur(this.imageData, radius);
    return this;
  }

  /**
   * Sharpens the image to enhance edges and details.
   *
   * @returns {this} This instance for chaining
   * @example
   * ```typescript
   * img.sharpen();
   * ```
   */
  sharpen(): this {
    this.imageData = actions.sharpen(this.imageData);
    return this;
  }

  /**
   * Detects edges in the image using the Sobel operator.
   *
   * Validates structure and emphasizes boundaries between regions.
   *
   * @returns {this} This instance for chaining
   * @example
   * ```typescript
   * img.edges();
   * ```
   */
  edges(): this {
    this.imageData = actions.sobel(this.imageData);
    return this;
  }

  /**
   * Dilates the image (expands bright regions).
   *
   * Useful for joining broken parts of an object.
   *
   * @param pixels - Dilation radius (iterations) (default: 1)
   * @returns {this} This instance for chaining
   * @example
   * ```typescript
   * img.dilate(2);
   * ```
   */
  dilate(pixels: number = 1): this {
    this.imageData = actions.dilate(this.imageData, pixels);
    return this;
  }

  /**
   * Erodes the image (shrinks bright regions).
   *
   * Useful for removing small noise spots.
   *
   * @param pixels - Erosion radius (iterations) (default: 1)
   * @returns {this} This instance for chaining
   * @example
   * ```typescript
   * img.erode(1);
   * ```
   */
  erode(pixels: number = 1): this {
    this.imageData = actions.erode(this.imageData, pixels);
    return this;
  }

  /**
   * Performs erosion followed by dilation (Morphological Open).
   *
   * Useful for removing small objects/noise while preserving shape and size of larger objects.
   *
   * @param pixels - Radius for operations (default: 1)
   * @returns {this} This instance for chaining
   * @example
   * ```typescript
   * img.erode2dilate(1); // Remove noise
   * ```
   */
  erode2dilate(pixels: number = 1): this {
    this.imageData = actions.erode2dilate(this.imageData, pixels);
    return this;
  }

  /**
   * Performs dilation followed by erosion (Morphological Close).
   *
   * Useful for closing small holes inside foreground objects.
   *
   * @param pixels - Radius for operations (default: 1)
   * @returns {this} This instance for chaining
   * @example
   * ```typescript
   * img.dilate2erode(1); // Close holes
   * ```
   */
  dilate2erode(pixels: number = 1): this {
    this.imageData = actions.dilate2erode(this.imageData, pixels);
    return this;
  }

  /**
   * Inverts the colors of the image (negative).
   *
   * @returns {this} This instance for chaining
   * @example
   * ```typescript
   * img.invert();
   * ```
   */
  invert(): this {
    this.imageData = actions.invert(this.imageData);
    return this;
  }

  /**
   * Applies a Sepia tone filter to the image.
   *
   * @returns {this} This instance for chaining
   * @example
   * ```typescript
   * img.sepia();
   * ```
   */
  sepia(): this {
    this.imageData = actions.sepia(this.imageData);
    return this;
  }

  /**
   * Shifts the hue of the image.
   *
   * @param degrees - Degrees to shift hue (0-360)
   * @returns {this} This instance for chaining
   * @example
   * ```typescript
   * img.hue(90); // Shift colors
   * ```
   */
  hue(degrees: number): this {
    this.imageData = actions.hue(this.imageData, degrees);
    return this;
  }

  /**
   * Adjusts the color saturation of the image.
   *
   * @param factor - Multiplier for saturation.
   *                 0.0 = grayscale
   *                 1.0 = original saturation
   *                 >1.0 = more vibrant
   * @returns {this} This instance for chaining
   * @example
   * ```typescript
   * img.saturate(2.0); // Make colors pop
   * ```
   */
  saturate(factor: number): this {
    this.imageData = actions.saturate(this.imageData, factor);
    return this;
  }

  /**
   * Rotates the image by a specified angle.
   *
   * @param degrees - Angle in degrees (clockwise)
   * @returns {this} This instance for chaining
   * @example
   * ```typescript
   * img.rotate(90);
   * ```
   */
  rotate(degrees: number): this {
    this.imageData = actions.rotate(this.imageData, degrees);
    return this;
  }

  /**
   * Flips the image horizontally and/or vertically.
   *
   * @param horizontal - Flip along Y axis (left-right)
   * @param vertical - Flip along X axis (up-down)
   * @returns {this} This instance for chaining
   * @example
   * ```typescript
   * img.flip(true, false); // Mirror effect
   * ```
   */
  flip(horizontal: boolean = false, vertical: boolean = false): this {
    this.imageData = actions.flip(this.imageData, horizontal, vertical);
    return this;
  }

  /**
   * Crops the image to a specified rectangular region.
   *
   * @param x - X coordinate of top-left corner
   * @param y - Y coordinate of top-left corner
   * @param w - Width of crop area
   * @param h - Height of crop area
   * @returns {this} This instance for chaining
   * @example
   * ```typescript
   * img.crop(100, 100, 200, 200);
   * ```
   */
  crop(x: number, y: number, w: number, h: number): this {
    this.imageData = actions.crop(this.imageData, x, y, w, h);
    return this;
  }

  /**
   * Resizes the image to new dimensions.
   *
   * @param newWidth - Target width in pixels
   * @param newHeight - Target height in pixels
   * @param algorithm - Interpolation algorithm ("nearest" or "bilinear") (default: "bilinear")
   * @returns {this} This instance for chaining
   * @example
   * ```typescript
   * img.resize(800, 600);
   * ```
   */
  resize(
    newWidth: number,
    newHeight: number,
    algorithm: "nearest" | "bilinear" = "bilinear"
  ): this {
    this.imageData = actions.resize(this.imageData, newWidth, newHeight, algorithm);
    return this;
  }

  /**
   * Applies binary thresholding to the image.
   *
   * Pixels brighter than value become white, others become black.
   *
   * @param value - Threshold value (0-255) (default: 128)
   * @returns {this} This instance for chaining
   * @example
   * ```typescript
   * img.threshold(100);
   * ```
   */
  threshold(value: number = 128): this {
    this.imageData = actions.threshold(this.imageData, value);
    return this;
  }

  /**
   * Applies adaptive thresholding.
   *
   * Threshold varies locally based on neighborhood. Good for non-uniform lighting.
   *
   * @param blockSize - Size of neighborhood area (default: 11)
   * @returns {this} This instance for chaining
   * @example
   * ```typescript
   * img.adaptiveThreshold(15);
   * ```
   */
  adaptiveThreshold(blockSize: number = 11): this {
    this.imageData = actions.adaptiveThreshold(this.imageData, blockSize);
    return this;
  }

  /**
   * Applies a median filter to reduce noise while preserving edges.
   *
   * Effective for removing "salt and pepper" noise.
   *
   * @param radius - Filter radius (default: 1)
   * @returns {this} This instance for chaining
   * @example
   * ```typescript
   * img.medianFilter(2);
   * ```
   */
  medianFilter(radius: number = 1): this {
    this.imageData = actions.medianFilter(this.imageData, radius);
    return this;
  }

  /**
   * Applies a bilateral filter.
   *
   * Smooths images while preserving edges. Computationally expensive.
   *
   * @param spatialSigma - Formatting for spatial proximity (default: 3)
   * @param rangeSigma - Formatting for color similarity (default: 50)
   * @returns {this} This instance for chaining
   * @example
   * ```typescript
   * img.bilateralFilter();
   * ```
   */
  bilateralFilter(spatialSigma: number = 3, rangeSigma: number = 50): this {
    this.imageData = actions.bilateralFilter(this.imageData, spatialSigma, rangeSigma);
    return this;
  }

  /**
   * Calculates the color histogram of the image.
   *
   * @returns {{ r: number[]; g: number[]; b: number[] }} Object containing arrays for R, G, B channels (256 bins each)
   * @example
   * ```typescript
   * const hist = img.histogram();
   * console.log(hist.r[0]); // Count of pixels with Red=0
   * ```
   */
  histogram(): { r: number[]; g: number[]; b: number[] } {
    return actions.histogram(this.imageData);
  }

  /**
   * Automatically adjusts levels to stretch contrast.
   *
   * @returns {this} This instance for chaining
   * @example
   * ```typescript
   * img.autoLevel();
   * ```
   */
  autoLevel(): this {
    this.imageData = actions.autoLevel(this.imageData);
    return this;
  }

  /**
   * Overlays another image onto this one.
   *
   * @param overlayImg - The image to overlay
   * @param x - X position
   * @param y - Y position
   * @param alpha - Opacity of overlay (0.0 to 1.0) (default: 1.0)
   * @returns {this} This instance for chaining
   * @example
   * ```typescript
   * const watermark = await image.load("logo.png");
   * img.overlay(watermark.imageData, 10, 10, 0.5);
   * ```
   */
  overlay(
    overlayImg: ImageData,
    x: number = 0,
    y: number = 0,
    alpha: number = 1.0
  ): this {
    this.imageData = actions.overlay(this.imageData, overlayImg, x, y, alpha);
    return this;
  }

  /**
   * Blends another image with this one using a blend mode.
   *
   * @param img2 - Second image (must be same size)
   * @param mode - Blend mode ("multiply", "screen", "overlay", "add", "subtract")
   * @returns {this} This instance for chaining
   * @example
   * ```typescript
   * img.blend(otherImg, "screen");
   * ```
   */
  blend(
    img2: ImageData,
    mode: "multiply" | "screen" | "overlay" | "add" | "subtract" = "multiply"
  ): this {
    this.imageData = actions.blend(this.imageData, img2, mode);
    return this;
  }

  /**
   * Applies preset denoising filters.
   *
   * @param strength - Denoise strength: "light", "medium", or "heavy" (default: "medium")
   * @returns {this} This instance for chaining
   * @example
   * ```typescript
   * img.denoise("heavy");
   * ```
   */
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

  /**
   * Exports raw pixel data as an array of RGBA tuples.
   *
   * @returns {[number, number, number, number][]} Array of [R, G, B, A] values
   * @example
   * ```typescript
   * const pixels = img.toPixels();
   * console.log(pixels[0]); // [255, 0, 0, 255]
   * ```
   */
  toPixels(): [number, number, number, number][] {
    return actions.toPixels(this.imageData);
  }
}
