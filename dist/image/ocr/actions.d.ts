import { type Worker, type RecognizeResult } from "tesseract.js";
import type { ImageData, OCROptions, OCRResult } from "../../types/image";
export declare function convertResult(result: RecognizeResult): OCRResult | null;
export declare function imageDataToImageData(imgData: ImageData): ImageData;
export declare function initWorker(lang?: string): Promise<Worker>;
export declare function recognize(source: ImageData, options?: OCROptions): Promise<OCRResult | null>;
export declare function terminate(): Promise<void>;
export declare function reinitialize(lang: string): Promise<void>;
//# sourceMappingURL=actions.d.ts.map