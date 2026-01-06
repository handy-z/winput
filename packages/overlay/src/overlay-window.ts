import { user32, gdi32 } from "./core";
import type { Pointer } from "bun:ffi";
import { ptr } from "bun:ffi";
import { OverlayOptions } from "./types";
import { window } from "@winput/window";

const LWA_COLORKEY = 0x00000001;

export class OverlayWindow {
  private hwnd: bigint | null = null;
  private hdc: Pointer | bigint | null = null;
  private x: number = 0;
  private y: number = 0;
  private width: number = 0;
  private height: number = 0;

  constructor(private options: OverlayOptions = {}) {}

  create(): boolean {
    try {
      this.width = this.options.width ?? user32.symbols.GetSystemMetrics(0);
      this.height = this.options.height ?? user32.symbols.GetSystemMetrics(1);
      this.x = this.options.x ?? 0;
      this.y = this.options.y ?? 0;

      const className = "OverlayWindowClass";
      const BLACK_BRUSH = 4;
      const blackBrush = gdi32.symbols.GetStockObject(BLACK_BRUSH);
      window.registerClass(className, blackBrush);

      this.hwnd = window.create({
        className: className,
        styles: ["WS_POPUP", "WS_VISIBLE"],
        exStyles: [
          "WS_EX_LAYERED",
          "WS_EX_TOPMOST",
          "WS_EX_NOACTIVATE",
          "WS_EX_TOOLWINDOW",
        ],
        x: this.x,
        y: this.y,
        width: this.width,
        height: this.height,
      });

      if (!this.hwnd) return false;

      const GWL_STYLE = -16;
      const WS_BORDER = 0x00800000;
      const WS_CAPTION = 0x00c00000;
      const WS_THICKFRAME = 0x00040000;
      const WS_DLGFRAME = 0x00400000;

      const currentStyle = user32.symbols.GetWindowLongW(this.hwnd, GWL_STYLE);
      const newStyle =
        currentStyle & ~(WS_CAPTION | WS_BORDER | WS_THICKFRAME | WS_DLGFRAME);
      user32.symbols.SetWindowLongW(this.hwnd, GWL_STYLE, newStyle);

      const SWP_FRAMECHANGED = 0x0020;
      const SWP_NOMOVE = 0x0002;
      const SWP_NOSIZE = 0x0001;
      const SWP_NOZORDER = 0x0004;
      user32.symbols.SetWindowPos(
        this.hwnd,
        0n,
        0,
        0,
        0,
        0,
        SWP_FRAMECHANGED | SWP_NOMOVE | SWP_NOSIZE | SWP_NOZORDER
      );

      user32.symbols.SetLayeredWindowAttributes(
        this.hwnd as any,
        0x00000000,
        0,
        LWA_COLORKEY
      );

      this.hdc = user32.symbols.GetDC(this.hwnd as any);
      if (!this.hdc) {
        this.destroy();
        return false;
      }

      window.showWindow(this.hwnd);
      return true;
    } catch (e) {
      console.error("Create error:", e);
      this.destroy();
      return false;
    }
  }

  getHandle() {
    return this.hwnd;
  }

  getDC() {
    if (!this.hwnd) {
      console.warn("Cannot get DC: window not created");
      return null;
    }
    return this.hdc;
  }

  getDimensions() {
    return { width: this.width, height: this.height };
  }

  isValid(): boolean {
    return this.hwnd !== null && this.hdc !== null;
  }

  update() {
    if (!this.hwnd) return;

    const MSG = new Uint8Array(48);
    while (user32.symbols.PeekMessageW(ptr(MSG), this.hwnd as any, 0, 0, 1)) {
      user32.symbols.TranslateMessage(ptr(MSG));
      user32.symbols.DispatchMessageW(ptr(MSG));
    }
  }

  clear() {
    if (!this.hdc) {
      console.warn("Cannot clear: DC not available");
      return;
    }

    const BLACKNESS = 0x00000042;
    gdi32.symbols.PatBlt(this.hdc, 0, 0, this.width, this.height, BLACKNESS);
  }

  show() {
    if (!this.hwnd) {
      console.warn("Cannot show: window not created");
      return;
    }
    window.showWindow(this.hwnd);
    user32.symbols.UpdateWindow(this.hwnd);
  }

  hide() {
    if (!this.hwnd) {
      console.warn("Cannot hide: window not created");
      return;
    }
    window.hideWindow(this.hwnd);
  }

  destroy() {
    if (this.hdc && this.hwnd) {
      user32.symbols.ReleaseDC(this.hwnd, this.hdc);
      this.hdc = null;
    }

    if (this.hwnd) {
      window.hideWindow(this.hwnd);
      this.hwnd = null;
    }
  }
}
