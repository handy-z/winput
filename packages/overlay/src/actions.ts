import { gdi32, user32 } from "./core";
import type { Pointer } from "bun:ffi";
import type { RGB } from "./types";

export const PS_SOLID = 0;
export const PS_DASH = 1;
export const PS_DOT = 2;
export const PS_DASHDOT = 3;
export const PS_DASHDOTDOT = 4;
export const TRANSPARENT = 1;
export const OPAQUE = 2;
export const NULL_BRUSH = 5;
export const NULL_PEN = 8;
export const SRCCOPY = 0x00cc0020;
export const BLACKNESS = 0x00000042;
export const WHITENESS = 0x00ff0062;
export const FW_NORMAL = 400;
export const FW_BOLD = 700;
export const TA_LEFT = 0;
export const TA_CENTER = 6;
export const TA_RIGHT = 2;
export const TA_TOP = 0;
export const TA_BASELINE = 24;
export const TA_BOTTOM = 8;
export const ALTERNATE = 1;
export const WINDING = 2;

export function rgbToColorRef(color: RGB): number {
  return (color.r & 0xff) | ((color.g & 0xff) << 8) | ((color.b & 0xff) << 16);
}

export function colorRefToRgb(colorRef: number): RGB {
  return {
    r: colorRef & 0xff,
    g: (colorRef >> 8) & 0xff,
    b: (colorRef >> 16) & 0xff,
  };
}

export function createPen(
  style: number,
  width: number,
  color: RGB
): Pointer | bigint {
  if (width < 0) {
    throw new Error("Pen width must be non-negative");
  }
  const colorRef = rgbToColorRef(color);
  return gdi32.symbols.CreatePen(style, width, colorRef);
}

export function deleteObject(handle: Pointer | bigint): boolean {
  if (!handle) return false;
  return gdi32.symbols.DeleteObject(handle);
}

export function selectObject(
  hdc: Pointer | bigint,
  hObject: Pointer | bigint
): Pointer | bigint {
  return gdi32.symbols.SelectObject(hdc as any, hObject as any);
}

export function moveToEx(hdc: Pointer | bigint, x: number, y: number): boolean {
  return gdi32.symbols.MoveToEx(hdc as any, x, y, null);
}

export function lineTo(hdc: Pointer | bigint, x: number, y: number): boolean {
  return gdi32.symbols.LineTo(hdc as any, x, y);
}

export function drawRectangle(
  hdc: Pointer | bigint,
  left: number,
  top: number,
  right: number,
  bottom: number
): boolean {
  return gdi32.symbols.Rectangle(hdc as any, left, top, right, bottom);
}

export function drawEllipse(
  hdc: Pointer | bigint,
  left: number,
  top: number,
  right: number,
  bottom: number
): boolean {
  return gdi32.symbols.Ellipse(hdc as any, left, top, right, bottom);
}

export function setBkMode(hdc: Pointer | bigint, mode: number): number {
  return gdi32.symbols.SetBkMode(hdc as any, mode);
}

export function getStockObject(index: number): Pointer | bigint {
  return gdi32.symbols.GetStockObject(index);
}

export function getDC(hwnd: Pointer | bigint | null): Pointer | bigint | null {
  return user32.symbols.GetDC(hwnd as any);
}

export function releaseDC(
  hwnd: Pointer | bigint | null,
  hdc: Pointer | bigint
): number {
  return user32.symbols.ReleaseDC(hwnd as any, hdc as any);
}

export function getDesktopWindow(): Pointer | bigint {
  return user32.symbols.GetDesktopWindow();
}

export function createCompatibleDC(hdc: Pointer | bigint): Pointer | bigint {
  return gdi32.symbols.CreateCompatibleDC(hdc as any);
}

export function deleteDC(hdc: Pointer | bigint): boolean {
  return gdi32.symbols.DeleteDC(hdc as any);
}

export function createCompatibleBitmap(
  hdc: Pointer | bigint,
  width: number,
  height: number
): Pointer | bigint {
  return gdi32.symbols.CreateCompatibleBitmap(hdc as any, width, height);
}

export function createSolidBrush(color: RGB): Pointer | bigint {
  const colorRef = rgbToColorRef(color);
  return gdi32.symbols.CreateSolidBrush(colorRef);
}

export function bitBlt(
  hdcDest: Pointer | bigint,
  xDest: number,
  yDest: number,
  width: number,
  height: number,
  hdcSrc: Pointer | bigint,
  xSrc: number,
  ySrc: number,
  rop: number
): boolean {
  return gdi32.symbols.BitBlt(
    hdcDest as any,
    xDest,
    yDest,
    width,
    height,
    hdcSrc as any,
    xSrc,
    ySrc,
    rop
  );
}

export function fillRect(
  hdc: Pointer | bigint,
  left: number,
  top: number,
  right: number,
  bottom: number
): boolean {
  const brush = getStockObject(NULL_BRUSH);
  const oldBrush = selectObject(hdc, brush);
  const result = drawRectangle(hdc, left, top, right, bottom);
  selectObject(hdc, oldBrush);
  return result;
}