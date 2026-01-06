import type { RGB } from "./types";
import { utils } from "@winput/utils";

/**
 * Represents a pixel with its color information and provides comparison methods.
 */
export class Pixel {
  /** Red component (0-255) */
  public readonly r: number;
  /** Green component (0-255) */
  public readonly g: number;
  /** Blue component (0-255) */
  public readonly b: number;
  
  /** X coordinate of the pixel */
  public readonly x: number;
  /** Y coordinate of the pixel */
  public readonly y: number;

  constructor(x: number, y: number, rgb: RGB) {
    this.x = x;
    this.y = y;
    this.r = rgb.r;
    this.g = rgb.g;
    this.b = rgb.b;
  }

  /**
   * Checks if this pixel's color exactly matches the target color.
   * 
   * @param target - Target RGB color to compare against
   * @returns True if all RGB components match exactly
   * @example
   * ```typescript
   * const pixel = screen.getPixel(100, 200);
   * if (pixel?.isEqual({ r: 255, g: 0, b: 0 })) {
   *   console.log("Pixel is exactly red!");
   * }
   * ```
   */
  isEqual(target: RGB): boolean {
    return this.r === target.r && this.g === target.g && this.b === target.b;
  }

  /**
   * Checks if this pixel's color matches the target color within tolerance.
   * 
   * @param target - Target RGB color to compare against
   * @param tolerance - Color tolerance (0-255, default: 0). Higher values allow more variation
   * @returns True if all RGB components are within tolerance
   * @example
   * ```typescript
   * const pixel = screen.getPixel(100, 200);
   * if (pixel?.isSimilar({ r: 255, g: 0, b: 0 }, 10)) {
   *   console.log("Pixel is approximately red!");
   * }
   * ```
   */
  isSimilar(target: RGB, tolerance: number = 0): boolean {
    return utils.isColorSimilar({ r: this.r, g: this.g, b: this.b }, target, tolerance);
  }

  /**
   * Returns the pixel color as an RGB object.
   * 
   * @returns RGB color object
   * @example
   * ```typescript
   * const pixel = screen.getPixel(100, 200);
   * const rgb = pixel?.toRGB();
   * console.log(`RGB: (${rgb.r}, ${rgb.g}, ${rgb.b})`);
   * ```
   */
  toRGB(): RGB {
    return { r: this.r, g: this.g, b: this.b };
  }

  /**
   * Returns the pixel color as a hexadecimal string.
   * 
   * @returns Hex color string (e.g., "#FF0000")
   * @example
   * ```typescript
   * const pixel = screen.getPixel(100, 200);
   * console.log(`Color: ${pixel?.toHex()}`);
   * ```
   */
  toHex(): string {
    return utils.rgbToHex({ r: this.r, g: this.g, b: this.b });
  }

  /**
   * Returns the pixel color as a numeric value (0xRRGGBB).
   * 
   * @returns Numeric color value
   * @example
   * ```typescript
   * const pixel = screen.getPixel(100, 200);
   * console.log(`Color: 0x${pixel?.toNumber().toString(16).toUpperCase()}`);
   * ```
   */
  toNumber(): number {
    return (this.r << 16) | (this.g << 8) | this.b;
  }

  /**
   * Returns a string representation of the pixel.
   * 
   * @returns String in format "Pixel(x, y) RGB(r, g, b)"
   * @example
   * ```typescript
   * const pixel = screen.getPixel(100, 200);
   * console.log(pixel?.toString()); // "Pixel(100, 200) RGB(255, 0, 0)"
   * ```
   */
  toString(): string {
    return `Pixel(${this.x}, ${this.y}) RGB(${this.r}, ${this.g}, ${this.b})`;
  }
}
