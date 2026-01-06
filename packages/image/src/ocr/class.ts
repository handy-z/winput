import type { ImageData, OCROptions, OCRResult } from "../types";
import * as actions from "./actions";

export class ImageOCR {
  protected imageData: ImageData;

  constructor(imageData: ImageData) {
    this.imageData = imageData;
  }

  /**
   * Performs OCR on the image.
   *
   * @param options - OCR configuration options
   * @returns Promise resolving to OCR result with extracted text, or null if failed
   * @example
   * ```typescript
   * const ocr = img.ocr();
   * const result = await ocr.recognize({ lang: "eng" });
   * console.log(result?.text);
   * ```
   */
  async recognize(options: OCROptions = {}): Promise<OCRResult | null> {
    return actions.recognize(this.imageData, options);
  }

  /**
   * Terminates the OCR worker and frees resources.
   *
   * Call this when you're done with OCR operations to clean up memory.
   * @example
   * ```typescript
   * const ocr = img.ocr();
   * await ocr.recognize();
   * await ocr.terminate();
   * ```
   */
  async terminate(): Promise<void> {
    return actions.terminate();
  }

  /**
   * Reinitializes the OCR worker with a different language.
   *
   * @param lang - Language code (e.g., "eng", "spa", "fra")
   * @example
   * ```typescript
   * const ocr = img.ocr();
   * await ocr.reinitialize("spa");
   * const result = await ocr.recognize();
   * ```
   */
  async reinitialize(lang: string): Promise<void> {
    return actions.reinitialize(lang);
  }
}
