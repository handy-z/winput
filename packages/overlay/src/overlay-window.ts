import { user32, gdi32, kernel32 } from "./core";
import type { Pointer } from "bun:ffi";
import { ptr, JSCallback, FFIType } from "bun:ffi";
import { OverlayOptions } from "./types";

const LWA_COLORKEY = 0x00000001;
const SW_SHOW = 5;
const SW_HIDE = 0;

const STYLES = {
  WS_POPUP: 0x80000000,
  WS_VISIBLE: 0x10000000,
} as const;

const EX_STYLES = {
  WS_EX_LAYERED: 0x00080000,
  WS_EX_TOPMOST: 0x00000008,
  WS_EX_NOACTIVATE: 0x08000000,
  WS_EX_TOOLWINDOW: 0x00000080,
} as const;

type StyleKey = keyof typeof STYLES;
type ExStyleKey = keyof typeof EX_STYLES;

interface CreateWindowOptions {
  className?: string;
  styles?: StyleKey[];
  exStyles?: ExStyleKey[];
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}

const wndProcs = new Set<JSCallback>();

function registerWindowClass(
  className: string,
  backgroundBrush: number | bigint | null = null
): number {
  const hInstance = kernel32.symbols.GetModuleHandleW(null);
  const classNameBuf = Buffer.from(className + "\0", "utf16le");

  const wndProc = new JSCallback(
    (hwnd, msg, wParam, lParam) => {
      return user32.symbols.DefWindowProcW(hwnd, msg, wParam, lParam);
    },
    {
      args: [FFIType.ptr, FFIType.u32, FFIType.ptr, FFIType.ptr],
      returns: FFIType.ptr,
    }
  );
  wndProcs.add(wndProc);

  const wndClass = new Uint8Array(80);
  const view = new DataView(wndClass.buffer);

  view.setUint32(0, 80, true);
  view.setUint32(4, 3, true);

  const procPtr = wndProc.ptr;
  view.setBigUint64(8, BigInt(procPtr), true);

  view.setInt32(16, 0, true);
  view.setInt32(20, 0, true);

  view.setBigUint64(24, BigInt(hInstance), true);

  view.setBigUint64(32, 0n, true);

  const IDC_ARROW = 32512;
  const hCursor = (
    user32 as ReturnType<typeof import("bun:ffi").dlopen>
  ).symbols.LoadCursorW(null, BigInt(IDC_ARROW));
  view.setBigUint64(40, BigInt(hCursor as bigint), true);
  if (backgroundBrush) {
    view.setBigUint64(48, BigInt(backgroundBrush), true);
  } else {
    view.setBigUint64(48, 0n, true);
  }

  view.setBigUint64(56, 0n, true);
  const classPtr = ptr(classNameBuf);
  view.setBigUint64(64, BigInt(classPtr), true);

  view.setBigUint64(72, 0n, true);

  const atom = user32.symbols.RegisterClassExW(ptr(wndClass));
  return atom;
}

function createOverlayWindow(options: CreateWindowOptions = {}): bigint | null {
  const {
    className = "Static",
    styles = [],
    exStyles = [],
    x = 0,
    y = 0,
    width = 800,
    height = 600,
  } = options;

  const classNameBuf = Buffer.from(className + "\0", "utf16le");
  const windowNameBuf = Buffer.from("\0", "utf16le");

  const hwnd = user32.symbols.CreateWindowExW(
    exStyles.reduce((a, b) => a | EX_STYLES[b], 0),
    classNameBuf,
    windowNameBuf,
    styles.reduce((a, b) => a | STYLES[b], 0),
    x,
    y,
    width,
    height,
    null,
    null,
    null,
    null
  );

  return hwnd ? (hwnd as unknown as bigint) : null;
}

function showWindow(hwnd: bigint): boolean {
  return user32.symbols.ShowWindow(hwnd, SW_SHOW);
}

function hideWindow(hwnd: bigint): boolean {
  return user32.symbols.ShowWindow(hwnd, SW_HIDE);
}

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
      registerWindowClass(className, blackBrush);

      this.hwnd = createOverlayWindow({
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
        this.hwnd,
        0x00000000,
        0,
        LWA_COLORKEY
      );

      this.hdc = user32.symbols.GetDC(this.hwnd as unknown as Pointer);
      if (!this.hdc) {
        this.destroy();
        return false;
      }

      showWindow(this.hwnd);
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
    while (user32.symbols.PeekMessageW(ptr(MSG), this.hwnd, 0, 0, 1)) {
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
    gdi32.symbols.PatBlt(
      this.hdc as bigint,
      0,
      0,
      this.width,
      this.height,
      BLACKNESS
    );
  }

  show() {
    if (!this.hwnd) {
      console.warn("Cannot show: window not created");
      return;
    }
    showWindow(this.hwnd);
    user32.symbols.UpdateWindow(this.hwnd);
  }

  hide() {
    if (!this.hwnd) {
      console.warn("Cannot hide: window not created");
      return;
    }
    hideWindow(this.hwnd);
  }

  destroy() {
    if (this.hdc && this.hwnd) {
      user32.symbols.ReleaseDC(this.hwnd, this.hdc as bigint);
      this.hdc = null;
    }

    if (this.hwnd) {
      hideWindow(this.hwnd);
      this.hwnd = null;
    }
  }
}
