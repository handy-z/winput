import { createWorker, type Worker, type RecognizeResult } from "tesseract.js";
import type { ImageData, OCROptions, OCRResult } from "../types";

let globalWorker: Worker | null = null;

export function convertResult(result: RecognizeResult): OCRResult | null {
  const data: any = result.data;

  if (!data) {
    console.error("No data in OCR result");
    return null;
  }

  const lines: any[] = [];
  const words: any[] = [];

  if (data.hocr) {
    const hocr = data.hocr;

    const wordRegex =
      /<span class=['"]ocrx_word['"][^>]*bbox (\d+) (\d+) (\d+) (\d+)[^>]*>([^<]+)<\/span>/g;
    let wordMatch;

    while ((wordMatch = wordRegex.exec(hocr)) !== null) {
      const [, x0, y0, x1, y1, text] = wordMatch;
      words.push({
        text: text.trim(),
        confidence: 90,
        bbox: {
          x0: parseInt(x0),
          y0: parseInt(y0),
          x1: parseInt(x1),
          y1: parseInt(y1),
        },
      });
    }

    const lineRegex =
      /<span class=['"]ocr_line['"][^>]*bbox (\d+) (\d+) (\d+) (\d+)[^>]*>(.*?)<\/span>/gs;
    let lineMatch;

    while ((lineMatch = lineRegex.exec(hocr)) !== null) {
      const [, x0, y0, x1, y1, content] = lineMatch;

      const lineText = content
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim();

      if (lineText) {
        const lineWords = words.filter(
          (w) =>
            w.bbox.y0 >= parseInt(y0) - 5 &&
            w.bbox.y1 <= parseInt(y1) + 5 &&
            w.bbox.x0 >= parseInt(x0) - 5 &&
            w.bbox.x1 <= parseInt(x1) + 5
        );

        lines.push({
          text: lineText,
          confidence: 90,
          words: lineWords,
          bbox: {
            x0: parseInt(x0),
            y0: parseInt(y0),
            x1: parseInt(x1),
            y1: parseInt(y1),
          },
        });
      }
    }
  }

  if (data.blocks && Array.isArray(data.blocks)) {
    for (const block of data.blocks) {
      if (block.paragraphs) {
        for (const paragraph of block.paragraphs) {
          if (paragraph.lines) {
            for (const line of paragraph.lines) {
              lines.push({
                text: line.text,
                confidence: line.confidence,
                words: line.words.map((word: any) => ({
                  text: word.text,
                  confidence: word.confidence,
                  bbox: {
                    x0: word.bbox.x0,
                    y0: word.bbox.y0,
                    x1: word.bbox.x1,
                    y1: word.bbox.y1,
                  },
                })),
                bbox: {
                  x0: line.bbox.x0,
                  y0: line.bbox.y0,
                  x1: line.bbox.x1,
                  y1: line.bbox.y1,
                },
              });

              for (const word of line.words) {
                words.push({
                  text: word.text,
                  confidence: word.confidence,
                  bbox: {
                    x0: word.bbox.x0,
                    y0: word.bbox.y0,
                    x1: word.bbox.x1,
                    y1: word.bbox.y1,
                  },
                });
              }
            }
          }
        }
      }
    }
  }

  if (lines.length === 0 && data.text) {
    const textLines = data.text.split("\n").filter((l: string) => l.trim());
    textLines.forEach((lineText: string) => {
      lines.push({
        text: lineText,
        confidence: data.confidence,
        words: [],
        bbox: { x0: 0, y0: 0, x1: 0, y1: 0 },
      });
    });
  }

  return {
    text: data.text || "",
    confidence: data.confidence || 0,
    lines,
    words,
    hocr: data.hocr,
  };
}

export function imageDataToImageData(imgData: ImageData): ImageData {
  const rgba = new Uint8ClampedArray(imgData.buffer.length);
  for (let i = 0; i < imgData.buffer.length; i += 4) {
    rgba[i] = imgData.buffer[i + 2];
    rgba[i + 1] = imgData.buffer[i + 1];
    rgba[i + 2] = imgData.buffer[i];
    rgba[i + 3] = imgData.buffer[i + 3];
  }

  return {
    width: imgData.width,
    height: imgData.height,
    data: rgba,
  } as any;
}

export async function initWorker(lang: string = "eng"): Promise<Worker> {
  if (!globalWorker) {
    globalWorker = await createWorker(lang);
  }
  return globalWorker;
}

export async function recognize(
  source: ImageData,
  options: OCROptions = {}
): Promise<OCRResult | null> {
  const fs = await import("fs");
  const path = await import("path");
  const os = await import("os");

  let tempFilePath: string | null = null;

  try {
    const lang = options.lang || "eng";
    const worker = await initWorker(lang);

    if (options.tessedit_pageseg_mode !== undefined) {
      await worker.setParameters({
        tessedit_pageseg_mode: options.tessedit_pageseg_mode as any,
      });
    }
    if (options.preserve_interword_spaces !== undefined) {
      await worker.setParameters({
        preserve_interword_spaces: options.preserve_interword_spaces as any,
      });
    }

    tempFilePath = path.join(
      os.tmpdir(),
      `ocr-temp-${Date.now()}-${Math.random().toString(36).slice(2)}.png`
    );

    const { saveImage } = await import("../actions");
    const saved = await saveImage(source, tempFilePath);

    if (!saved) {
      console.error("Failed to save image to temporary file");
      return null;
    }

    const result: RecognizeResult = await worker.recognize(tempFilePath);

    if (!result || !result.data) {
      console.error("OCR recognition returned invalid result");
      return null;
    }

    const converted = convertResult(result);
    if (!converted) {
      console.error("Failed to convert OCR result");
      return null;
    }

    return converted;
  } catch (error) {
    if (options.errorHandler) {
      options.errorHandler(error);
    } else {
      console.error("OCR recognition failed:", error);
    }
    return null;
  } finally {
    if (tempFilePath) {
      try {
        const fs = await import("fs");
        await fs.promises.unlink(tempFilePath);
      } catch (cleanupError) {}
    }
  }
}

export async function terminate(): Promise<void> {
  if (globalWorker) {
    await globalWorker.terminate();
    globalWorker = null;
  }
}

export async function reinitialize(lang: string): Promise<void> {
  await terminate();
  globalWorker = await createWorker(lang);
}
