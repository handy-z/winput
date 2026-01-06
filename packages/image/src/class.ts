import * as actions from "./actions";
import { ImageData } from "./types";
import { ImageProcessing } from "./processing";
import { ImageDrawer } from "./drawer";
import { ImageOCR } from "./ocr";
import { ImageDisplay } from "./display";

/**
 * Chainable image processor for applying transformations and filters to images.
 *
 * This class provides a fluent API for image manipulation, allowing you to chain
 * multiple operations together. All transformation methods modify the image in-place
 * and return `this` for method chaining.
 */
export class Image extends ImageProcessing {
  /** Optional file path where the image was loaded from or will be saved to */
  path?: string;

  /** Image width in pixels */
  width: number;

  /** Image height in pixels */
  height: number;

  /** Raw pixel data in BGRA format (4 bytes per pixel) */
  buffer: Uint8Array;

  /**
   * Creates a new Image processor instance.
   *
   * @param imageData - The image data to wrap for processing
   */
  constructor(imageData: ImageData) {
    super(imageData);
    this.path = imageData.path;
    this.width = imageData.width;
    this.height = imageData.height;
    this.buffer = imageData.buffer;
  }

  /**
   * Saves the processed image to a file.
   *
   * The file format is automatically determined by the file extension.
   * If no path is provided, uses the original image path or generates
   * a timestamp-based filename.
   *
   * @param path - Output file path (optional, uses original path if not specified)
   * @returns {Promise<boolean>} Promise that resolves to true if save succeeded, false otherwise
   * @example
   * ```typescript
   * await img.grayscale().save("output.png");
   * await img.save(); // Overwrites original file
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
  async save(path?: string): Promise<boolean> {
    return actions.saveImage(this, path);
  }

  /**
   * Creates an ImageDisplay instance for displaying this image.
   *
   * @returns {ImageDisplay} Display instance for window operations
   * @example
   * ```typescript
   * const img = await image.load("photo.png");
   * img.display().show("My Window");
   * img.display().destroyWindow("My Window");
   * ```
   */
  get display(): ImageDisplay {
    return new ImageDisplay(this.imageData);
  }

  /**
   * Creates an ImageDrawer instance for drawing shapes on this image.
   *
   * @returns {ImageDrawer} Drawer instance for drawing operations
   * @example
   * ```typescript
   * const img = await image.load("photo.png");
   * img.drawer().line(0, 0, 100, 100).circle(50, 50, 25);
   * await img.save("with-drawings.png");
   * ```
   */
  get drawer(): ImageDrawer {
    return new ImageDrawer(this.imageData);
  }

  /**
   * Creates an OCR instance for this image.
   *
   * Returns an OCR object that can be used to perform text recognition with
   * custom options. This is particularly useful after preprocessing the image
   * to improve OCR accuracy.
   *
   * @returns {ImageOCR} OCR instance for performing text recognition
   * @example
   * ```typescript
   * // Load and preprocess image for better OCR
   * const img = await image.load("document.png");
   * const ocr = img.ocr();
   * const result = await ocr.recognize({ lang: "eng" });
   * console.log("Extracted text:", result?.text);
   * await ocr.terminate();
   * ```
   */
  get ocr(): ImageOCR {
    return new ImageOCR(this.imageData);
  }
}

class ImageFile {
  /**
   * Loads an image from file using GDI+.
   *
   * Reads an image file from disk and returns a chainable Image processor instance.
   * Returns null if the file cannot be loaded or doesn't exist.
   *
   * @param path - Absolute or relative path to the image file
   * @returns {Promise<Image | null>} Image processor instance or null if loading failed
   * @example
   * ```typescript
   * // Load and process
   * const img = await image.load("C:\\photos\\image.png");
   * if (img) {
   *   img.grayscale().save("output.png");
   * }
   *
   * // Chain operations
   * const processed = await image.load("photo.jpg");
   * await processed?.blur(2).sharpen().save("enhanced.jpg");
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
  load = actions.loadImage;

  /**
   * Saves an image to a file using GDI+.
   *
   * The file format is automatically determined by the file extension.
   * If no path is provided, uses the image's original path or generates
   * a timestamp-based filename.
   *
   * @param img - The Image or ImageData to save
   * @param path - Output file path (optional). If omitted, uses img.path or generates a default name
   * @returns {Promise<boolean>} Promise that resolves to true if save succeeded, false otherwise
   *
   * @example
   * ```typescript
   * // Save with explicit path
   * const imgData: ImageData = { width: 100, height: 100, buffer: new Uint8Array(40000) };
   * await image.save(imgData, "output.png");
   *
   * // Save Image instance using its original path
   * const img = await image.load("photo.jpg");
   * img?.grayscale();
   * await image.save(img);
   *
   * // Auto-generate filename from timestamp
   * const capture = screen.captureScreen();
   * await image.save(capture); // Creates screen_<timestamp>.png
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
  save = actions.saveImage;

  /**
   * Creates a chainable Image processor from existing image data.
   *
   * Useful when you have ImageData from a screen capture or other source
   * and want to apply transformations using the fluent API.
   *
   * @param img - The Image instance or ImageData to wrap
   * @returns {Image} Chainable image processor
   * @example
   * ```typescript
   * // Process screen capture
   * const capture = screen.captureScreen();
   * const processed = image.process(capture);
   * processed.blur(1).contrast(1.2).save("result.png");
   *
   * // Wrap and transform ImageData
   * const imgData: ImageData = { width: 100, height: 100, buffer: new Uint8Array(40000) };
   * image.process(imgData).invert().save("inverted.png");
   * ```
   */
  process(img: Image | ImageData): Image {
    if (img instanceof Image) {
      return img;
    }
    return new Image(img);
  }
}

/**
 * Image file operations and processing utilities.
 *
 * This singleton provides the main entry point for image manipulation functionality.
 * Use it to load images from disk, save processed images, and create chainable
 * Image processor instances from ImageData buffers.
 */
export const image = new ImageFile();
