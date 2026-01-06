import { gdiplus, kernel32 } from "./core";
import { ptr } from "bun:ffi";
import { ImageData, ImageFormat } from "./types";
import { Image } from "./class";
import { extname } from "path";

let token: bigint | null = null;

function ensureGdiPlus() {
  if (token) return;

  const input = new Uint8Array(24);
  const view = new DataView(input.buffer);
  view.setUint32(0, 1, true);

  const tokenBuf = new BigUint64Array(1);
  const status = gdiplus.symbols.GdiplusStartup(
    ptr(tokenBuf),
    ptr(input),
    null
  );

  if (status !== 0) {
    throw new Error(`GDI+ Startup failed: ${status}`);
  }
  token = tokenBuf[0];
}

export async function loadImage(path: string): Promise<Image | null> {
  try {
    ensureGdiPlus();

    const pathBuf = Buffer.from(path + "\0", "utf16le");
    const bitmapPtrBuf = new BigUint64Array(1);

    const status = gdiplus.symbols.GdipCreateBitmapFromFile(
      ptr(pathBuf),
      ptr(bitmapPtrBuf)
    );

    if (status !== 0) {
      console.error(`GDI+ Load Image failed: ${status} for ${path}`);
      return null;
    }

    const bitmap = bitmapPtrBuf[0];

    try {
      const wBuf = new Uint32Array(1);
      const hBuf = new Uint32Array(1);

      gdiplus.symbols.GdipGetImageWidth(bitmap, ptr(wBuf));
      gdiplus.symbols.GdipGetImageHeight(bitmap, ptr(hBuf));

      const width = wBuf[0];
      const height = hBuf[0];

      const PixelFormat32bppARGB = 2498570;

      const rect = new Uint32Array([0, 0, width, height]);
      const bitmapData = new Uint8Array(40);

      const lockStatus = gdiplus.symbols.GdipBitmapLockBits(
        bitmap,
        ptr(rect),
        1,
        PixelFormat32bppARGB,
        ptr(bitmapData)
      );

      if (lockStatus !== 0) {
        console.error(`GDI+ Load Image LockBits failed: ${lockStatus}`);
        return null;
      }

      try {
        const view = new DataView(bitmapData.buffer);

        const scan0 = view.getBigUint64(16, true);
        const stride = view.getInt32(8, true);

        const len = width * height * 4;
        const data = new Uint8Array(len);

        if (stride === width * 4) {
          kernel32.symbols.RtlMoveMemory(ptr(data), Number(scan0), BigInt(len));
        } else {
          for (let y = 0; y < height; y++) {
            const srcRow = Number(scan0) + y * stride;
            const dstRow = Number(ptr(data)) + y * width * 4;
            kernel32.symbols.RtlMoveMemory(
              dstRow as any,
              srcRow as any,
              BigInt(width * 4)
            );
          }
        }

        return new Image({ path, width, height, buffer: data });
      } finally {
        gdiplus.symbols.GdipBitmapUnlockBits(bitmap, ptr(bitmapData));
      }
    } finally {
      gdiplus.symbols.GdipDisposeImage(bitmap);
    }
  } catch (e) {
    console.error(`GDI+ Load Image Error: ${e}`);
    return null;
  }
}

function getEncoderClsid(format: keyof typeof ImageFormat): Uint8Array {
  const clsid = new Uint8Array(16);
  const view = new DataView(clsid.buffer);

  switch (format) {
    case "png":
      view.setUint32(0, 0x557cf406, true);
      view.setUint16(4, 0x1a04, true);
      view.setUint16(6, 0x11d3, true);
      clsid.set([0x9a, 0x73, 0x00, 0x00, 0xf8, 0x1e, 0xf3, 0x2e], 8);
      break;
    case "jpg":
      view.setUint32(0, 0x557cf401, true);
      view.setUint16(4, 0x1a04, true);
      view.setUint16(6, 0x11d3, true);
      clsid.set([0x9a, 0x73, 0x00, 0x00, 0xf8, 0x1e, 0xf3, 0x2e], 8);
      break;
    case "jpeg":
      view.setUint32(0, 0x557cf401, true);
      view.setUint16(4, 0x1a04, true);
      view.setUint16(6, 0x11d3, true);
      clsid.set([0x9a, 0x73, 0x00, 0x00, 0xf8, 0x1e, 0xf3, 0x2e], 8);
      break;
    case "bmp":
      view.setUint32(0, 0x557cf400, true);
      view.setUint16(4, 0x1a04, true);
      view.setUint16(6, 0x11d3, true);
      clsid.set([0x9a, 0x73, 0x00, 0x00, 0xf8, 0x1e, 0xf3, 0x2e], 8);
      break;
    case "webp":
      view.setUint32(0, 0x557cf402, true);
      view.setUint16(4, 0x1a04, true);
      view.setUint16(6, 0x11d3, true);
      clsid.set([0x9a, 0x73, 0x00, 0x00, 0xf8, 0x1e, 0xf3, 0x2e], 8);
      break;
    case "gif":
      view.setUint32(0, 0x557cf403, true);
      view.setUint16(4, 0x1a04, true);
      view.setUint16(6, 0x11d3, true);
      clsid.set([0x9a, 0x73, 0x00, 0x00, 0xf8, 0x1e, 0xf3, 0x2e], 8);
      break;
    case "tiff":
      view.setUint32(0, 0x557cf404, true);
      view.setUint16(4, 0x1a04, true);
      view.setUint16(6, 0x11d3, true);
      clsid.set([0x9a, 0x73, 0x00, 0x00, 0xf8, 0x1e, 0xf3, 0x2e], 8);
      break;
    case "ico":
      view.setUint32(0, 0x557cf405, true);
      view.setUint16(4, 0x1a04, true);
      view.setUint16(6, 0x11d3, true);
      clsid.set([0x9a, 0x73, 0x00, 0x00, 0xf8, 0x1e, 0xf3, 0x2e], 8);
      break;
    case "heic":
      view.setUint32(0, 0x557cf406, true);
      view.setUint16(4, 0x1a04, true);
      view.setUint16(6, 0x11d3, true);
      clsid.set([0x9a, 0x73, 0x00, 0x00, 0xf8, 0x1e, 0xf3, 0x2e], 8);
      break;
    case "heif":
      view.setUint32(0, 0x557cf407, true);
      view.setUint16(4, 0x1a04, true);
      view.setUint16(6, 0x11d3, true);
      clsid.set([0x9a, 0x73, 0x00, 0x00, 0xf8, 0x1e, 0xf3, 0x2e], 8);
      break;
    case "avif":
      view.setUint32(0, 0x557cf408, true);
      view.setUint16(4, 0x1a04, true);
      view.setUint16(6, 0x11d3, true);
      clsid.set([0x9a, 0x73, 0x00, 0x00, 0xf8, 0x1e, 0xf3, 0x2e], 8);
      break;
    case "svg":
      view.setUint32(0, 0x557cf409, true);
      view.setUint16(4, 0x1a04, true);
      view.setUint16(6, 0x11d3, true);
      clsid.set([0x9a, 0x73, 0x00, 0x00, 0xf8, 0x1e, 0xf3, 0x2e], 8);
      break;
    case "raw":
      view.setUint32(0, 0x557cf40a, true);
      view.setUint16(4, 0x1a04, true);
      view.setUint16(6, 0x11d3, true);
      clsid.set([0x9a, 0x73, 0x00, 0x00, 0xf8, 0x1e, 0xf3, 0x2e], 8);
      break;
    default:
      throw new Error(`Unsupported format: ${format}`);
  }

  return clsid;
}

export async function saveImage(
  img: Image | ImageData,
  path?: string
): Promise<boolean> {
  try {
    ensureGdiPlus();

    const { width, height, buffer } = img;
    const stride = width * 4;
    const PixelFormat32bppARGB = 2498570;

    const bitmapPtrBuf = new BigUint64Array(1);

    const status = gdiplus.symbols.GdipCreateBitmapFromScan0(
      width,
      height,
      stride,
      PixelFormat32bppARGB,
      ptr(buffer),
      ptr(bitmapPtrBuf)
    );

    if (status !== 0) {
      console.error(`GDI+ Create Bitmap From Scan0 failed: ${status}`);
      return false;
    }

    const bitmap = bitmapPtrBuf[0];

    try {
      const outPath = path || img?.path || `screen_${Date.now()}.png`;
      if (!extname(outPath)) {
        console.error(
          `Invalid path: "${outPath}" required file extension: ${Object.keys(
            ImageFormat
          ).join(", ")}`
        );
        return false;
      }
      const clsid = getEncoderClsid(extname(outPath).replace(".", "") as any);
      const pathBuf = Buffer.from(outPath + "\0", "utf16le");

      const saveStatus = gdiplus.symbols.GdipSaveImageToFile(
        bitmap,
        ptr(pathBuf),
        ptr(clsid),
        null
      );

      if (saveStatus !== 0) {
        console.error(`GDI+ Save Image To File failed: ${saveStatus}`);
        return false;
      }
      return true;
    } finally {
      gdiplus.symbols.GdipDisposeImage(bitmap);
    }
  } catch (e) {
    console.error(`GDI+ Save Image Error: ${e}`);
    return false;
  }
}
