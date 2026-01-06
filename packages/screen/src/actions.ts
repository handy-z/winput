import { user32, gdi32 } from "./core";
import { ptr, type Pointer, JSCallback } from "bun:ffi";
import type { RGB, Point, ImageData } from "./types";
import { utils } from "@winput/utils";
import { Pixel } from "./pixel";

let cachedDC: Pointer | bigint | null = null;
let dcTime = 0;

function getDC(): Pointer | bigint | null {
  if (cachedDC && Date.now() - dcTime < 1000) return cachedDC;
  if (cachedDC) user32.symbols.ReleaseDC(null, cachedDC);
  cachedDC = user32.symbols.GetDC(null);
  dcTime = Date.now();
  return cachedDC;
}

export function getScreenSize() {
  return {
    width: user32.symbols.GetSystemMetrics(0),
    height: user32.symbols.GetSystemMetrics(1),
  };
}

export function getPixel(x: number, y: number): Pixel | null {
  const dc = getDC();
  if (!dc) return null;
  const c = gdi32.symbols.GetPixel(dc as any, x, y);
  const rgb = { r: c & 0xff, g: (c >> 8) & 0xff, b: (c >> 16) & 0xff };
  return new Pixel(x, y, rgb);
}

export function checkPixel(
  x: number,
  y: number,
  target: RGB,
  tolerance = 0
): boolean {
  const pixel = getPixel(x, y);
  if (!pixel) return false;
  return pixel.isSimilar(target, tolerance);
}

export function waitForPixel(
  x: number,
  y: number,
  target: RGB,
  tolerance = 0,
  timeout?: number,
  interval?: number
): Promise<boolean> {
  return new Promise((resolve) => {
    let elapsed = 0;
    const id = setInterval(() => {
      if (checkPixel(x, y, target, tolerance)) {
        clearInterval(id);
        resolve(true);
        return;
      }
      if (timeout && (elapsed += interval ?? 50) >= timeout) {
        clearInterval(id);
        resolve(false);
      }
    }, interval ?? 50);
  });
}

export function getMultiplePixels(positions: Point[]): (RGB | null)[] {
  return positions.map((p) => {
    const pixel = getPixel(p.x, p.y);
    return pixel ? pixel.toRGB() : null;
  });
}

export function checkMultiplePixels(
  checks: Array<{ x: number; y: number; target: RGB; tolerance?: number }>
): boolean {
  return checks.every((c) => checkPixel(c.x, c.y, c.target, c.tolerance ?? 0));
}

export function waitForAnyPixel(
  checks: Array<{ x: number; y: number; target: RGB; tolerance?: number }>,
  timeout?: number,
  interval?: number
): Promise<number> {
  return new Promise((resolve) => {
    let elapsed = 0;
    const id = setInterval(() => {
      for (let i = 0; i < checks.length; i++) {
        const c = checks[i];
        if (checkPixel(c.x, c.y, c.target, c.tolerance ?? 0)) {
          clearInterval(id);
          resolve(i);
          return;
        }
      }
      if (timeout && (elapsed += interval ?? 50) >= timeout) {
        clearInterval(id);
        resolve(-1);
      }
    }, interval ?? 50);
  });
}

export function pixelSearch(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  color: RGB | string | number,
  tolerance: number = 0
): Point | null {
  const left = Math.min(x1, x2);
  const top = Math.min(y1, y2);
  const right = Math.max(x1, x2);
  const bottom = Math.max(y1, y2);
  const width = right - left + 1;
  const height = bottom - top + 1;

  const buffer = capture(left, top, width, height);
  if (!buffer) return null;

  let target: RGB;
  if (typeof color === "string") {
    target = utils.hexToRgb(color);
  } else if (typeof color === "number") {
    target = {
      r: (color >> 16) & 0xff,
      g: (color >> 8) & 0xff,
      b: color & 0xff,
    };
  } else {
    target = color;
  }

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      const b = buffer.buffer[i];
      const g = buffer.buffer[i + 1];
      const r = buffer.buffer[i + 2];

      if (tolerance === 0) {
        if (r === target.r && g === target.g && b === target.b) {
          return { x: left + x, y: top + y };
        }
      } else {
        if (
          Math.abs(r - target.r) <= tolerance &&
          Math.abs(g - target.g) <= tolerance &&
          Math.abs(b - target.b) <= tolerance
        ) {
          return { x: left + x, y: top + y };
        }
      }
    }
  }

  return null;
}



export function capture(
  x = 0,
  y = 0,
  width?: number,
  height?: number
): ImageData | null {
  const w = width || user32.symbols.GetSystemMetrics(0);
  const h = height || user32.symbols.GetSystemMetrics(1);

  const screenDC = user32.symbols.GetDC(null);
  if (!screenDC) return null;

  const memDC = gdi32.symbols.CreateCompatibleDC(screenDC);
  if (!memDC) {
    user32.symbols.ReleaseDC(null, screenDC);
    return null;
  }

  const bitmap = gdi32.symbols.CreateCompatibleBitmap(screenDC, w, h);
  if (!bitmap) {
    user32.symbols.ReleaseDC(null, screenDC);
    gdi32.symbols.DeleteDC(memDC);
    return null;
  }

  const oldBitmap = gdi32.symbols.SelectObject(memDC, bitmap);

  const success = gdi32.symbols.BitBlt(
    memDC,
    0,
    0,
    w,
    h,
    screenDC,
    x,
    y,
    0x00cc0020
  );

  let buffer: Uint8Array | null = null;

  if (success) {
    const size = w * h * 4;
    buffer = new Uint8Array(size);

    const bi = new Uint8Array(40);
    const view = new DataView(bi.buffer);
    view.setInt32(0, 40, true);
    view.setInt32(4, w, true);
    view.setInt32(8, -h, true);
    view.setInt16(12, 1, true);
    view.setInt16(14, 32, true);
    view.setInt32(16, 0, true);

    const result = gdi32.symbols.GetDIBits(
      memDC,
      bitmap,
      0,
      h,
      ptr(buffer),
      ptr(bi),
      0
    );

    if (result === 0) buffer = null;
  }

  if (oldBitmap) gdi32.symbols.SelectObject(memDC, oldBitmap);
  gdi32.symbols.DeleteObject(bitmap);
  gdi32.symbols.DeleteDC(memDC);
  user32.symbols.ReleaseDC(null, screenDC);

  if (!buffer) return null;

  return {
    width: w,
    height: h,
    buffer: buffer,
  };
}

export function getMonitors(): Array<{
  handle: bigint;
  rect: { left: number; top: number; right: number; bottom: number };
  workArea: { left: number; top: number; right: number; bottom: number };
  isPrimary: boolean;
  deviceName: string;
}> {
  const monitors: Array<{
    handle: bigint;
    rect: { left: number; top: number; right: number; bottom: number };
    workArea: { left: number; top: number; right: number; bottom: number };
    isPrimary: boolean;
    deviceName: string;
  }> = [];

  const MONITORINFOF_PRIMARY = 0x00000001;
  const CCHDEVICENAME = 32;

  const callback = new JSCallback(
    (
      hMonitor: bigint,
      _hdcMonitor: bigint,
      _lprcMonitor: bigint,
      _dwData: bigint
    ) => {
      const monitorInfoSize = 40 + CCHDEVICENAME * 2;
      const monitorInfo = new Uint8Array(monitorInfoSize);
      const view = new DataView(monitorInfo.buffer);

      view.setUint32(0, monitorInfoSize, true);

      if (user32.symbols.GetMonitorInfoW(hMonitor as any, ptr(monitorInfo))) {
        const left = view.getInt32(4, true);
        const top = view.getInt32(8, true);
        const right = view.getInt32(12, true);
        const bottom = view.getInt32(16, true);

        const workLeft = view.getInt32(20, true);
        const workTop = view.getInt32(24, true);
        const workRight = view.getInt32(28, true);
        const workBottom = view.getInt32(32, true);

        const flags = view.getUint32(36, true);
        const isPrimary = (flags & MONITORINFOF_PRIMARY) !== 0;

        const deviceNameBytes = monitorInfo.slice(40, 40 + CCHDEVICENAME * 2);
        const deviceName = new TextDecoder("utf-16le")
          .decode(deviceNameBytes)
          .replace(/\0.*$/, "");

        monitors.push({
          handle: hMonitor,
          rect: { left, top, right, bottom },
          workArea: {
            left: workLeft,
            top: workTop,
            right: workRight,
            bottom: workBottom,
          },
          isPrimary,
          deviceName,
        });
      }

      return true;
    },
    { args: ["ptr", "ptr", "ptr", "ptr"], returns: "bool" }
  );

  user32.symbols.EnumDisplayMonitors(null, null, callback.ptr, 0 as any);
  callback.close();

  return monitors;
}
