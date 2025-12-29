/**
 * Represents raw image data with dimensions and pixel buffer.
 *
 * This interface is used throughout the image processing module to represent
 * image data in a consistent format. The buffer contains BGRA pixel data
 * (Blue, Green, Red, Alpha) in row-major order.
 *
 * @property path - Optional file path where the image was loaded from or will be saved to
 * @property width - Image width in pixels
 * @property height - Image height in pixels
 * @property buffer - Raw pixel data in BGRA format (4 bytes per pixel)
 *
 * @example
 * ```typescript
 * const imageData: ImageData = {
 *   path: "photo.png",
 *   width: 1920,
 *   height: 1080,
 *   buffer: new Uint8Array(1920 * 1080 * 4)
 * };
 * ```
 */
export interface ImageData {
  path?: string;
  width: number;
  height: number;
  buffer: Uint8Array;
}

/**
 * Supported image file formats for loading and saving.
 *
 * This enum defines all image formats that can be used with the
 * `image.load()` and `image.save()` functions via GDI+.
 *
 * Supported formats:
 * - `png` - Portable Network Graphics (lossless compression)
 * - `jpg` / `jpeg` - JPEG (lossy compression, good for photos)
 * - `bmp` - Bitmap (uncompressed, large file sizes)
 * - `webp` - WebP (modern format with good compression)
 * - `gif` - Graphics Interchange Format (limited to 256 colors)
 * - `tiff` - Tagged Image File Format (high quality, flexible)
 * - `ico` - Icon format (for application icons)
 * - `heic` - High Efficiency Image Container (modern Apple format)
 * - `heif` - High Efficiency Image Format
 * - `avif` - AV1 Image File Format (next-gen compression)
 * - `svg` - Scalable Vector Graphics
 * - `raw` - Raw image data
 */
export enum ImageFormat {
  png,
  jpg,
  jpeg,
  bmp,
  webp,
  gif,
  tiff,
  ico,
  heic,
  heif,
  avif,
  svg,
  raw,
}

export interface OCROptions {
  /** Language code(s) for OCR (e.g., "eng", "eng+fra"). Default: "eng" */
  lang?: string;
  /** Custom logger function for OCR progress */
  logger?: (msg: any) => void;
  /** Custom error handler */
  errorHandler?: (err: any) => void;
  /** Page segmentation mode (0-13). Default: 3 (Fully automatic page segmentation) */
  tessedit_pageseg_mode?: number;
  /** Whether to preserve spaces between words */
  preserve_interword_spaces?: string;
}

export interface OCRWord {
  /** Extracted word text */
  text: string;
  /** Confidence score (0-100) */
  confidence: number;
  /** Bounding box coordinates */
  bbox: {
    x0: number;
    y0: number;
    x1: number;
    y1: number;
  };
}

export interface OCRLine {
  /** Full line text */
  text: string;
  /** Words in this line */
  words: OCRWord[];
  /** Confidence score for the line (0-100) */
  confidence: number;
  /** Bounding box coordinates */
  bbox: {
    x0: number;
    y0: number;
    x1: number;
    y1: number;
  };
}

export interface OCRResult {
  /** Full extracted text */
  text: string;
  /** Overall confidence score (0-100) */
  confidence: number;
  /** Lines of text with bounding boxes */
  lines: OCRLine[];
  /** Individual words with bounding boxes */
  words: OCRWord[];
  /** hOCR output (HTML-based OCR format) */
  hocr?: string;
}
