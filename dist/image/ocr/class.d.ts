import type { ImageData, OCROptions, OCRResult } from "../../types/image";
export declare class ImageOCR {
    protected imageData: ImageData;
    constructor(imageData: ImageData);
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
    recognize(options?: OCROptions): Promise<OCRResult | null>;
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
    terminate(): Promise<void>;
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
    reinitialize(lang: string): Promise<void>;
}
//# sourceMappingURL=class.d.ts.map