import * as actions from "./actions";
import { image } from "@winput/image";

class Screen {
  /**
   * Gets the primary monitor's screen dimensions.
   *
   * Returns the width and height of the primary display in pixels.
   * For multi-monitor setups, use `getMonitors()` to get individual
   * monitor dimensions.
   *
   * @returns {{ width: number, height: number }} Screen width and height in pixels
   * @example
   * ```typescript
   * const size = screen.getScreenSize();
   * console.log(`Resolution: ${size.width}x${size.height}`);
   *
   * // Use for full screen capture
   * const fullscreen = screen.capture(0, 0, size.width, size.height);
   * ```
   */
  getScreenSize = actions.getScreenSize;

  /**
   * Enumerates all connected physical display monitors.
   *
   * Retrieves detailed information about each monitor using the Windows API
   * (`EnumDisplayMonitors` and `GetMonitorInfoW`). Useful for multi-monitor
   * setups to determine monitor positions, work areas, and primary display.
   *
   * @returns {Array<{ handle: bigint, rect: Rect, workArea: Rect, isPrimary: boolean, deviceName: string }>} Array of monitor information
   * @property {bigint} handle - Monitor handle (HMONITOR) for future API calls
   * @property {Rect} rect - Full display area coordinates (left, top, right, bottom)
   * @property {Rect} workArea - Usable desktop area excluding taskbar (left, top, right, bottom)
   * @property {boolean} isPrimary - Whether this is the primary display
   * @property {string} deviceName - System device name (e.g., "\\\\.\\DISPLAY1")
   * @example
   * ```typescript
   * const monitors = screen.getMonitors();
   * monitors.forEach((monitor, i) => {
   *   console.log(`Monitor ${i + 1}:`);
   *   console.log(`  Device: ${monitor.deviceName}`);
   *   console.log(`  Primary: ${monitor.isPrimary}`);
   *   console.log(`  Resolution: ${monitor.rect.right - monitor.rect.left}x${monitor.rect.bottom - monitor.rect.top}`);
   *   console.log(`  Work area: ${monitor.workArea.right - monitor.workArea.left}x${monitor.workArea.bottom - monitor.workArea.top}`);
   * });
   *
   * // Find primary monitor
   * const primary = monitors.find(m => m.isPrimary);
   * console.log(`Primary display: ${primary.deviceName}`);
   * ```
   */
  getMonitors = actions.getMonitors;

  /**
   * Captures a region of the screen as image data.
   *
   * Creates a snapshot of the specified screen area using GDI+. If no parameters
   * are provided, captures the entire primary screen. The returned ImageData can
   * be processed using the Image class or saved directly.
   *
   * @param x - X coordinate of capture region's top-left corner (default: 0)
   * @param y - Y coordinate of capture region's top-left corner (default: 0)
   * @param width - Width of capture region in pixels (default: screen width)
   * @param height - Height of capture region in pixels (default: screen height)
   * @returns {ImageData | null} Image buffer with metadata or null if capture failed
   * @example
   * ```typescript
   * // Full screen capture
   * const fullscreen = screen.capture();
   *
   * // Capture specific region
   * const region = screen.capture(100, 100, 400, 300);
   *
   * // Process captured image
   * if (region) {
   *   const img = image.process(region);
   *   img.grayscale().save("screenshot.png");
   * }
   *
   * // Capture top-left quadrant
   * const size = screen.getScreenSize();
   * const quadrant = screen.capture(0, 0, size.width / 2, size.height / 2);
   * ```
   */
  capture = actions.capture;

  /**
   * Reads the RGB color value of a single pixel and returns a Pixel object.
   *
   * Captures and returns a Pixel object containing the color and position of the pixel
   * at the specified screen coordinates. The Pixel object provides convenient methods
   * for color comparison and conversion.
   * Coordinates are relative to the top-left corner of the primary monitor (0, 0).
   *
   * @param x - X coordinate of the pixel
   * @param y - Y coordinate of the pixel
   * @returns {Pixel | null} Pixel object with color comparison methods, or null if failed
   * @example
   * ```typescript
   * // Using fluent API for color comparison
   * const pixel = screen.getPixel(500, 300);
   * if (pixel?.isEqual({ r: 255, g: 0, b: 0 })) {
   *   console.log("Pixel is exactly red!");
   * }
   *
   * // Check with tolerance
   * if (pixel?.isSimilar({ r: 255, g: 0, b: 0 }, 10)) {
   *   console.log("Pixel is approximately red!");
   * }
   *
   * // Access RGB values directly
   * if (pixel) {
   *   console.log(`RGB: (${pixel.r}, ${pixel.g}, ${pixel.b})`);
   *   console.log(`Hex: ${pixel.toHex()}`);
   *   console.log(`Position: (${pixel.x}, ${pixel.y})`);
   * }
   * ```
   */
  getPixel = actions.getPixel;

  /**
   * Checks if a pixel matches a target color within tolerance.
   *
   * Compares the pixel's RGB values against the target color, allowing
   * for slight variations controlled by the tolerance parameter. Returns
   * true only if all three color channels (R, G, B) are within tolerance.
   *
   * @param x - X coordinate of the pixel
   * @param y - Y coordinate of the pixel
   * @param target - Target RGB color object to match
   * @param tolerance - Color tolerance (0-255, default: 0). Higher values allow more color variation
   * @returns {boolean} True if pixel matches target color within tolerance
   * @example
   * ```typescript
   * // Exact color match
   * const isRed = screen.checkPixel(100, 200, { r: 255, g: 0, b: 0 });
   *
   * // Match with tolerance (useful for anti-aliased graphics)
   * const isNearlyRed = screen.checkPixel(100, 200, { r: 255, g: 0, b: 0 }, 10);
   *
   * // Check for specific UI element color
   * if (screen.checkPixel(500, 300, { r: 44, g: 156, b: 217 }, 5)) {
   *   console.log("Found blue button!");
   * }
   * ```
   */
  checkPixel = actions.checkPixel;

  /**
   * Waits for a pixel to match a target color.
   *
   * Continuously polls the pixel until it matches the target color or the
   * timeout expires. Useful for waiting on UI state changes or animations.
   * If no timeout is specified, waits indefinitely.
   *
   * @param x - X coordinate of the pixel
   * @param y - Y coordinate of the pixel
   * @param target - Target RGB color to match
   * @param tolerance - Color tolerance (0-255, default: 0)
   * @param timeout - Maximum wait time in milliseconds (optional, waits indefinitely if not set)
   * @returns {Promise<boolean>} Resolves to true when color matches, false if timeout occurs
   * @example
   * ```typescript
   * // Wait for loading indicator to turn green
   * const success = await screen.waitForPixel(
   *   100, 200,
   *   { r: 0, g: 255, b: 0 },
   *   5,
   *   5000 // 5 second timeout
   * );
   *
   * if (success) {
   *   console.log("Loading complete!");
   * } else {
   *   console.log("Timeout waiting for pixel change");
   * }
   *
   * // Wait indefinitely for specific color
   * await screen.waitForPixel(500, 300, { r: 255, g: 0, b: 0 });
   * console.log("Red pixel detected!");
   * ```
   */
  waitForPixel = actions.waitForPixel;

  /**
   * Reads RGB colors for multiple pixels in a single operation.
   *
   * Efficiently captures colors of multiple pixels at once. More performant
   * than calling `getPixel()` multiple times. Returns array with same order
   * as input positions.
   *
   * @param positions - Array of `{ x: number, y: number }` coordinate objects
   * @returns {(RGB | null)[]} Array of RGB colors (null for failed reads)
   * @example
   * ```typescript
   * // Read colors from multiple locations
   * const colors = screen.getMultiplePixels([
   *   { x: 100, y: 100 },
   *   { x: 200, y: 200 },
   *   { x: 300, y: 300 }
   * ]);
   *
   * colors.forEach((color, i) => {
   *   if (color) {
   *     console.log(`Pixel ${i}: RGB(${color.r}, ${color.g}, ${color.b})`);
   *   }
   * });
   *
   * // Check if all pixels are the same color
   * const allSame = colors.every((c, i) =>
   *   i === 0 || (c.r === colors[0].r && c.g === colors[0].g && c.b === colors[0].b)
   * );
   * ```
   */
  getMultiplePixels = actions.getMultiplePixels;

  /**
   * Checks if all specified pixels match their respective target colors.
   *
   * Validates multiple pixel-color pairs simultaneously. Returns true only
   * if every pixel matches its target color within the specified tolerance.
   * Useful for verifying complex UI states or patterns.
   *
   * @param checks - Array of pixel check objects with `x`, `y`, `target` RGB, and optional `tolerance`
   * @returns {boolean} True if all pixels match their targets
   * @example
   * ```typescript
   * // Verify UI state by checking multiple indicator pixels
   * const uiReady = screen.checkMultiplePixels([
   *   { x: 100, y: 100, target: { r: 0, g: 255, b: 0 }, tolerance: 5 },
   *   { x: 200, y: 200, target: { r: 255, g: 0, b: 0 }, tolerance: 5 },
   *   { x: 300, y: 300, target: { r: 0, g: 0, b: 255 } }
   * ]);
   *
   * if (uiReady) {
   *   console.log("All UI elements are in expected state");
   * }
   * ```
   */
  checkMultiplePixels = actions.checkMultiplePixels;

  /**
   * Waits for any one of multiple pixel conditions to match.
   *
   * Continuously polls all specified pixels until at least one matches its
   * target color. Returns the index of the first matching condition, or -1
   * if timeout occurs. Perfect for waiting on multiple possible UI states.
   *
   * @param checks - Array of pixel check objects with `x`, `y`, `target` RGB, and optional `tolerance`
   * @param timeout - Maximum wait time in milliseconds (optional, waits indefinitely if not specified)
   * @returns {Promise<number>} Index of first matched condition (0-based), or -1 on timeout
   * @example
   * ```typescript
   * // Wait for either success (green) or error (red) indicator
   * const result = await screen.waitForAnyPixel([
   *   { x: 100, y: 100, target: { r: 0, g: 255, b: 0 }, tolerance: 5 },   // Success
   *   { x: 100, y: 100, target: { r: 255, g: 0, b: 0 }, tolerance: 5 }    // Error
   * ], 10000);
   *
   * if (result === 0) {
   *   console.log("Success indicator detected!");
   * } else if (result === 1) {
   *   console.log("Error indicator detected!");
   * } else {
   *   console.log("Timeout - no indicator detected");
   * }
   * ```
   */
  waitForAnyPixel = actions.waitForAnyPixel;

  /**
   * Searches for the first occurrence of a specific color in a rectangular region.
   *
   * Scans the specified area left-to-right, top-to-bottom to find a pixel
   * matching the target color. Returns coordinates of the first match found.
   * Color can be specified as RGB object, hex string, or numeric value.
   *
   * @param x1 - X coordinate of first corner
   * @param y1 - Y coordinate of first corner
   * @param x2 - X coordinate of opposite corner
   * @param y2 - Y coordinate of opposite corner
   * @param color - Target color as RGB object, hex string (e.g., "#FF0000"), or number (0xRRGGBB)
   * @param tolerance - Color tolerance (0-255, default: 0)
   * @returns {Point | null} Coordinates `{ x: number, y: number }` of first match, or null if not found
   * @example
   * ```typescript
   * // Search for red pixel using RGB object
   * const pos1 = screen.pixelSearch(0, 0, 800, 600, { r: 255, g: 0, b: 0 });
   *
   * // Search using hex color
   * const pos2 = screen.pixelSearch(0, 0, 800, 600, "#00FF00");
   *
   * // Search with numeric color and tolerance
   * const pos3 = screen.pixelSearch(0, 0, 800, 600, 0x0000FF, 10);
   *
   * if (pos1) {
   *   console.log(`Found red pixel at (${pos1.x}, ${pos1.y})`);
   * }
   * ```
   */
  pixelSearch = actions.pixelSearch;

  /**
   * Searches for an image pattern within a screen region.
   *
   * Locates a template image within the specified rectangular area using
   * pixel-by-pixel comparison. Supports loading images from files or using
   * ImageData directly. Returns the top-left coordinates of the match.
   *
   * @param x1 - X coordinate of search region's first corner
   * @param y1 - Y coordinate of search region's first corner
   * @param x2 - X coordinate of search region's opposite corner
   * @param y2 - Y coordinate of search region's opposite corner
   * @param image - File path to template image OR ImageData object
   * @param tolerance - Color matching tolerance (0-255, default: 0). Higher values allow more color variation
   * @returns {Promise<Point | null>} Coordinates `{ x: number, y: number }` of match's top-left corner, or null if not found
   * @example
   * ```typescript
   * // Search for button image on screen
   * const buttonPos = await screen.imageSearch(
   *   0, 0, 1920, 1080,
   *   "assets/button.png",
   *   10
   * );
   *
   * if (buttonPos) {
   *   console.log(`Button found at (${buttonPos.x}, ${buttonPos.y})`);
   *   // Click on the button
   *   mouse.moveTo(buttonPos.x + 50, buttonPos.y + 20);
   *   mouse.click();
   * }
   *
   * // Use ImageData directly
   * const icon = await image.load("icon.png");
   * if (icon) {
   *   const iconPos = await screen.imageSearch(0, 0, 800, 600, icon.img);
   *   console.log(`Icon found at`, iconPos);
   * }
   * ```
   *
   * Supported file formats:
   * - `.png` - Portable Network Graphics (lossless)
   * - `.jpg` / `.jpeg` - JPEG (lossy compression)
   * - `.bmp` - Bitmap (uncompressed)
   * - `.webp` - WebP (modern format)
   * - `.gif` - Graphics Interchange Format (limited colors)
   * - `.tiff` - Tagged Image File Format (high quality)
   * - `.ico` - Icon format
   * - `.heic` - High Efficiency Image Container
   * - `.heif` - High Efficiency Image Format
   * - `.avif` - AV1 Image File Format
   * - `.svg` - Scalable Vector Graphics
   * - `.raw` - Raw image data
   */
  imageSearch = actions.imageSearch;

  /**
   * Captures a screen region and performs OCR (Optical Character Recognition) on it.
   *
   * Combines screen capture with OCR in a single convenient method. Captures the specified
   * rectangular region and extracts text using Tesseract OCR engine.
   *
   * @param x - X coordinate of capture region's top-left corner
   * @param y - Y coordinate of capture region's top-left corner
   * @param width - Width of capture region in pixels
   * @param height - Height of capture region in pixels
   * @param options - OCR configuration options
   * @returns {Promise<import("../types/ocr").OCRResult | null>} Promise resolving to OCR result with extracted text, or null if failed
   * @example
   * ```typescript
   * // Capture and recognize text from a screen region
   * const result = await screen.recognizeText(100, 100, 400, 200);
   * if (result) {
   *   console.log("Text:", result.text);
   *   console.log("Confidence:", result.confidence);
   *
   *   // Access individual words with bounding boxes
   *   result.words.forEach(word => {
   *     console.log(`"${word.text}" at (${word.bbox.x0}, ${word.bbox.y0})`);
   *   });
   * }
   *
   * // With language options
   * const frenchText = await screen.recognizeText(0, 0, 800, 600, {
   *   lang: "fra"
   * });
   * ```
   */
  async recognizeText(
    x: number,
    y: number,
    width: number,
    height: number,
    options?: import("./types").OCROptions
  ): Promise<import("./types").OCRResult | null> {
    const capture = this.capture(x, y, width, height);
    if (!capture) {
      return null;
    }
    return image.process(capture).ocr.recognize(options);
  }
}

/**
 * Screen capture and pixel manipulation utilities for Windows.
 *
 * This class provides comprehensive screen interaction capabilities
 * All operations work across multi-monitor setups using Windows GDI+ API.
 */
export const screen = new Screen();
