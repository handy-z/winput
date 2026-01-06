import { user32, gdi32, gdiplus } from "../core";
import { ptr } from "bun:ffi";
import { ImageData } from "../types";
import type { Image } from "../class";

const WS_POPUP = 0x80000000;
const WS_CAPTION = 0x00c00000;
const WS_SYSMENU = 0x00080000;
const WS_THICKFRAME = 0x00040000;
const WS_MINIMIZEBOX = 0x00020000;
const WS_VISIBLE = 0x10000000;
const SW_SHOW = 5;
const WM_PAINT = 0x000f;
const WM_KEYDOWN = 0x0100;
const WM_CLOSE = 0x0010;
const DIB_RGB_COLORS = 0;
const SRCCOPY = 0x00cc0020;

let gdiplusToken: bigint | null = null;
const activeWindows = new Map<string, bigint>();
let lastKeyPressed = 0;

function ensureGdiPlus(): void {
  if (gdiplusToken) return;

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
  gdiplusToken = tokenBuf[0];
}

interface CreateWindowOptions {
  windowName?: string;
  className?: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}

function createWindow(options: CreateWindowOptions = {}): bigint | null {
  const {
    windowName = "",
    className = "Static",
    x = 100,
    y = 100,
    width = 800,
    height = 600,
  } = options;

  const classNameBuf = Buffer.from(className + "\0", "utf16le");
  const windowNameBuf = Buffer.from(windowName + "\0", "utf16le");

  const style = WS_POPUP | WS_CAPTION | WS_SYSMENU | WS_THICKFRAME | WS_MINIMIZEBOX | WS_VISIBLE;
  const exStyle = 0;

  const hwnd = user32.symbols.CreateWindowExW(
    exStyle,
    classNameBuf,
    windowNameBuf,
    style,
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

function closeWindow(hwnd: bigint): boolean {
  return user32.symbols.PostMessageA(hwnd, WM_CLOSE, 0n, 0n);
}

function isWindow(hwnd: bigint): boolean {
  return user32.symbols.IsWindow(hwnd);
}

export function imshow(
  windowName: string,
  img: Image | ImageData,
  waitKey?: number
): void {
  ensureGdiPlus();

  const imageData =
    img instanceof Object && "img" in img ? (img as { img: ImageData }).img : img;
  const { width, height, buffer } = imageData;

  if (activeWindows.has(windowName)) {
    destroyWindow(windowName);
  }

  const hwnd = createWindow({
    windowName,
    className: "Static",
    x: 100,
    y: 100,
    width,
    height: height + 30,
  });

  if (!hwnd) {
    throw new Error(`Failed to create window: ${windowName}`);
  }

  activeWindows.set(windowName, hwnd);

  showWindow(hwnd);
  user32.symbols.UpdateWindow(hwnd);

  const hdc = user32.symbols.GetDC(hwnd as unknown as ReturnType<typeof ptr>);
  if (!hdc) {
    throw new Error("Failed to get window DC");
  }

  const bmi = new Uint8Array(40);
  const bmiView = new DataView(bmi.buffer);
  bmiView.setUint32(0, 40, true);
  bmiView.setInt32(4, width, true);
  bmiView.setInt32(8, -height, true);
  bmiView.setUint16(12, 1, true);
  bmiView.setUint16(14, 32, true);
  bmiView.setUint32(16, 0, true);

  gdi32.symbols.StretchDIBits(
    hdc,
    0,
    0,
    width,
    height,
    0,
    0,
    width,
    height,
    ptr(buffer),
    ptr(bmi),
    DIB_RGB_COLORS,
    SRCCOPY
  );

  user32.symbols.ReleaseDC(hwnd, hdc);

  if (waitKey !== undefined) {
    lastKeyPressed = 0;
    const startTime = Date.now();
    const MSG = new Uint8Array(48);

    while (true) {
      if (!isWindow(hwnd)) {
        activeWindows.delete(windowName);
        break;
      }

      if (user32.symbols.PeekMessageW) {
        while (
          user32.symbols.PeekMessageW(ptr(MSG), BigInt(Number(hwnd)), 0, 0, 1)
        ) {
          const msgView = new DataView(MSG.buffer);
          const message = msgView.getUint32(8, true);

          if (message === WM_PAINT) {
            const paintHdc = user32.symbols.GetDC(hwnd as unknown as ReturnType<typeof ptr>);
            if (paintHdc) {
              gdi32.symbols.StretchDIBits(
                paintHdc,
                0,
                0,
                width,
                height,
                0,
                0,
                width,
                height,
                ptr(buffer),
                ptr(bmi),
                DIB_RGB_COLORS,
                SRCCOPY
              );
              user32.symbols.ReleaseDC(hwnd, paintHdc);
            }
          }

          if (user32.symbols.TranslateMessage) {
            user32.symbols.TranslateMessage(ptr(MSG));
          }
          if (user32.symbols.DispatchMessageW) {
            user32.symbols.DispatchMessageW(ptr(MSG));
          }

          if (message === WM_KEYDOWN) {
            lastKeyPressed = msgView.getUint32(16, true);
          }
        }
      }

      if (lastKeyPressed !== 0) {
        break;
      }

      if (waitKey > 0 && Date.now() - startTime >= waitKey) {
        break;
      }

      Bun.sleepSync(1);
    }
  }
}

export function destroyWindow(windowName: string): void {
  const hwnd = activeWindows.get(windowName);
  if (hwnd) {
    closeWindow(hwnd);
    activeWindows.delete(windowName);
  }
}

export function destroyAllWindows(): void {
  for (const windowName of Array.from(activeWindows.keys())) {
    destroyWindow(windowName);
  }
}

export async function waitKey(timeout: number = 0): Promise<number> {
  lastKeyPressed = 0;
  const startTime = Date.now();
  const MSG = new Uint8Array(48);

  while (true) {
    for (const hwnd of activeWindows.values()) {
      if (!user32.symbols.IsWindow(hwnd)) {
        continue;
      }

      while (
        user32.symbols.PeekMessageW?.(
          ptr(MSG),
          ptr(new BigUint64Array([hwnd])),
          0,
          0,
          1
        )
      ) {
        user32.symbols.TranslateMessage?.(ptr(MSG));
        user32.symbols.DispatchMessageW?.(ptr(MSG));
      }
    }

    if (lastKeyPressed !== 0) {
      return lastKeyPressed;
    }

    if (timeout > 0 && Date.now() - startTime >= timeout) {
      return 0;
    }

    await Bun.sleep(10);
  }
}
