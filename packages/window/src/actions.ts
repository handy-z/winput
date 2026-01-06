import { user32, kernel32, gdi32 } from "./core";
import { ptr, JSCallback, FFIType } from "bun:ffi";
import type {
  WindowInfo,
  ExtendedWindowInfo,
  Rect,
  Size,
} from "./types";
import { getScreenSize } from "@winput/screen";

const SW_MINIMIZE = 6;
const HWND_BOTTOM = 1;
const HWND_TOP = 0;
const RDW_INVALIDATE = 0x0001;
const RDW_ERASE = 0x0004;
const RDW_UPDATENOW = 0x0100;
const PROCESS_QUERY_LIMITED_INFORMATION = 0x1000;
const SW_MAXIMIZE = 3;
const SW_RESTORE = 9;
const SW_HIDE = 0;
const SW_SHOW = 5;
const WM_CLOSE = 0x0010;
const GWL_STYLE = -16;
const GWL_EXSTYLE = -20;
const WS_EX_LAYERED = 0x80000;
const LWA_ALPHA = 0x2;
const HWND_TOPMOST = -1;
const HWND_NOTOPMOST = -2;
const SWP_NOMOVE = 0x0002;
const SWP_NOSIZE = 0x0001;

const STYLES = {
  WS_OVERLAPPED: 0x00000000,
  WS_POPUP: 0x80000000,
  WS_CHILD: 0x40000000,
  WS_MINIMIZE: 0x20000000,
  WS_VISIBLE: 0x10000000,
  WS_DISABLED: 0x08000000,
  WS_CLIPSIBLINGS: 0x04000000,
  WS_CLIPCHILDREN: 0x02000000,
  WS_MAXIMIZE: 0x01000000,
  WS_CAPTION: 0x00c00000,
  WS_BORDER: 0x00800000,
  WS_DLGFRAME: 0x00400000,
  WS_VSCROLL: 0x00200000,
  WS_HSCROLL: 0x00100000,
  WS_SYSMENU: 0x00080000,
  WS_THICKFRAME: 0x00040000,
  WS_GROUP: 0x00020000,
  WS_TABSTOP: 0x00010000,
  WS_MINIMIZEBOX: 0x00020000,
  WS_MAXIMIZEBOX: 0x00010000,
};

const EX_STYLES = {
  WS_EX_DLGMODALFRAME: 0x00000001,
  WS_EX_NOPARENTNOTIFY: 0x00000004,
  WS_EX_TOPMOST: 0x00000008,
  WS_EX_ACCEPTFILES: 0x00000010,
  WS_EX_TRANSPARENT: 0x00000020,
  WS_EX_MDICHILD: 0x00000040,
  WS_EX_TOOLWINDOW: 0x00000080,
  WS_EX_WINDOWEDGE: 0x00000100,
  WS_EX_CLIENTEDGE: 0x00000200,
  WS_EX_CONTEXTHELP: 0x00000400,
  WS_EX_RIGHT: 0x00001000,
  WS_EX_LEFT: 0x00000000,
  WS_EX_RTLREADING: 0x00002000,
  WS_EX_LTRREADING: 0x00000000,
  WS_EX_LEFTSCROLLBAR: 0x00004000,
  WS_EX_RIGHTSCROLLBAR: 0x00000000,
  WS_EX_CONTROLPARENT: 0x00010000,
  WS_EX_STATICEDGE: 0x00020000,
  WS_EX_APPWINDOW: 0x00040000,
  WS_EX_LAYERED: 0x00080000,
  WS_EX_NOINHERITLAYOUT: 0x00100000,
  WS_EX_NOREDIRECTIONBITMAP: 0x00200000,
  WS_EX_LAYOUTRTL: 0x00400000,
  WS_EX_COMPOSITED: 0x02000000,
  WS_EX_NOACTIVATE: 0x08000000,
};

const textDecoder = new TextDecoder("utf-16le");
const asciiDecoder = new TextDecoder("ascii");

export interface CreateWindowOptions {
  windowName?: string;
  className?: string;
  styles?: (keyof typeof STYLES)[];
  exStyles?: (keyof typeof EX_STYLES)[];
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}

export function createWindow(options: CreateWindowOptions = {}): bigint | null {
  const {
    windowName = "",
    className = "Static",
    styles = [
      "WS_POPUP",
      "WS_CAPTION",
      "WS_SYSMENU",
      "WS_THICKFRAME",
      "WS_MINIMIZEBOX",
      "WS_VISIBLE",
    ],
    exStyles = [],
    x = 100,
    y = 100,
    width = 800,
    height = 600,
  } = options;

  const classNameBuf = Buffer.from(className + "\0", "utf16le");
  const windowNameBuf = Buffer.from(windowName + "\0", "utf16le");

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

export function createWindowEx(
  options: CreateWindowOptions = {}
): bigint | null {
  return createWindow(options);
}

// ==================== Window Class Registration ====================

// Cache for window procedures to prevent GC
const wndProcs = new Set<JSCallback>();

/**
 * Registers a custom window class.
 * This is necessary for cleaner custom windows without default system backgrounds.
 *
 * @param className - Name of the class to register
 * @param backgroundBrush - Background brush handle (default: NULL/Transparent)
 * @returns Atom identifying the class, or 0 on failure
 */
export function registerWindowClass(
  className: string,
  backgroundBrush: number | bigint | null = null
): number {
  const hInstance = kernel32.symbols.GetModuleHandleW(null);
  const classNameBuf = Buffer.from(className + "\0", "utf16le");

  // Define default WindowProc
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

  // WNDCLASSEXW structure
  const wndClass = new Uint8Array(80);
  const view = new DataView(wndClass.buffer);

  view.setUint32(0, 80, true); // cbSize
  view.setUint32(4, 3, true); // style (CS_HREDRAW | CS_VREDRAW)

  // lpfnWndProc
  const procPtr = wndProc.ptr;
  view.setBigUint64(8, BigInt(procPtr), true);

  view.setInt32(16, 0, true); // cbClsExtra
  view.setInt32(20, 0, true); // cbWndExtra

  // hInstance
  view.setBigUint64(24, BigInt(hInstance), true);

  view.setBigUint64(32, 0n, true); // hIcon

  // hCursor (Load standard arrow cursor)
  const IDC_ARROW = 32512;
  const hCursor = (user32 as any).symbols.LoadCursorW(null, BigInt(IDC_ARROW));
  view.setBigUint64(40, BigInt(hCursor), true);

  // hbrBackground
  if (backgroundBrush) {
    view.setBigUint64(48, BigInt(backgroundBrush), true);
  } else {
    view.setBigUint64(48, 0n, true); // NULL brush for transparency
  }

  view.setBigUint64(56, 0n, true); // lpszMenuName

  // lpszClassName
  const classPtr = ptr(classNameBuf);
  view.setBigUint64(64, BigInt(classPtr), true);

  view.setBigUint64(72, 0n, true); // hIconSm

  const atom = user32.symbols.RegisterClassExW(ptr(wndClass));
  return atom;
}

export function getActiveWindow(): WindowInfo | null {
  const hwnd = user32.symbols.GetForegroundWindow();
  if (!hwnd) return null;

  const titleBuf = new Uint16Array(256);
  const len = user32.symbols.GetWindowTextW(hwnd, ptr(titleBuf), 256);
  const title = len > 0 ? textDecoder.decode(titleBuf.subarray(0, len)) : "";

  const rectBuf = new Int32Array(4);
  if (!user32.symbols.GetWindowRect(hwnd, ptr(rectBuf))) return null;

  const rect = {
    left: rectBuf[0],
    top: rectBuf[1],
    right: rectBuf[2],
    bottom: rectBuf[3],
  };
  const screen = getScreenSize();
  const isFullscreen =
    rect.left === 0 &&
    rect.top === 0 &&
    rect.right - rect.left === screen.width &&
    rect.bottom - rect.top === screen.height &&
    !((user32.symbols.GetWindowLongW(hwnd, -16) & 0x00c40000) !== 0);

  return { hwnd, title, rect, isFullscreen };
}

export function getWindowTitle(hwnd?: number | bigint): string {
  const h =
    hwnd !== undefined ? BigInt(hwnd) : user32.symbols.GetForegroundWindow();
  if (!h) return "";
  const buf = new Uint16Array(256);
  const len = user32.symbols.GetWindowTextW(h, ptr(buf), 256);
  return len > 0 ? textDecoder.decode(buf.subarray(0, len)) : "";
}

export function getWindowRect(hwnd: number | bigint): Rect | null {
  const buf = new Int32Array(4);
  if (!user32.symbols.GetWindowRect(BigInt(hwnd), ptr(buf))) return null;
  return { left: buf[0], top: buf[1], right: buf[2], bottom: buf[3] };
}

export function isWindowVisible(hwnd: number | bigint): boolean {
  return user32.symbols.IsWindowVisible(BigInt(hwnd));
}

export function setForeground(hwnd: number | bigint): boolean {
  return user32.symbols.SetForegroundWindow(BigInt(hwnd));
}

export function findWindow(title: string): bigint | null {
  const bytes = new TextEncoder().encode(title + "\0");
  const result = user32.symbols.FindWindowA(null, ptr(bytes));
  return result ? result : null;
}

export function waitForWindow(
  title: string,
  timeout?: number
): Promise<bigint | null> {
  return new Promise((resolve) => {
    let elapsed = 0;
    const id = setInterval(() => {
      const hwnd = findWindow(title);
      if (hwnd) {
        clearInterval(id);
        resolve(hwnd);
        return;
      }
      if (timeout && (elapsed += 100) >= timeout) {
        clearInterval(id);
        resolve(null);
      }
    }, 100);
  });
}

export function getWindowProcessId(hwnd: number | bigint): number {
  const buf = new Uint32Array(1);
  user32.symbols.GetWindowThreadProcessId(BigInt(hwnd), ptr(buf));
  return buf[0];
}

export function getClassName(hwnd: number | bigint): string {
  const buf = new Uint8Array(256);
  const len = user32.symbols.GetClassNameA(BigInt(hwnd), ptr(buf), 256);
  return len > 0 ? asciiDecoder.decode(buf.subarray(0, len)) : "";
}

export function isWindowMinimized(hwnd: number | bigint): boolean {
  return user32.symbols.IsIconic(BigInt(hwnd));
}

export function isWindowMaximized(hwnd: number | bigint): boolean {
  return user32.symbols.IsZoomed(BigInt(hwnd));
}

export function minimizeWindow(hwnd: number | bigint): boolean {
  return user32.symbols.ShowWindow(BigInt(hwnd), SW_MINIMIZE);
}

export function maximizeWindow(hwnd: number | bigint): boolean {
  return user32.symbols.ShowWindow(BigInt(hwnd), SW_MAXIMIZE);
}

export function restoreWindow(hwnd: number | bigint): boolean {
  return user32.symbols.ShowWindow(BigInt(hwnd), SW_RESTORE);
}

export function showWindow(hwnd: number | bigint): boolean {
  return user32.symbols.ShowWindow(BigInt(hwnd), SW_SHOW);
}

export function hideWindow(hwnd: number | bigint): boolean {
  return user32.symbols.ShowWindow(BigInt(hwnd), SW_HIDE);
}

export function closeWindow(hwnd: number | bigint): boolean {
  return user32.symbols.PostMessageA(BigInt(hwnd), WM_CLOSE, null, null);
}

export function moveWindow(
  hwnd: number | bigint,
  x: number,
  y: number,
  width: number,
  height: number,
  repaint = true
): boolean {
  return user32.symbols.MoveWindow(BigInt(hwnd), x, y, width, height, repaint);
}

export function centerWindow(hwnd: number | bigint): boolean {
  const rect = getWindowRect(hwnd);
  if (!rect) return false;

  const width = rect.right - rect.left;
  const height = rect.bottom - rect.top;
  const screen = getScreenSize();

  const x = Math.floor((screen.width - width) / 2);
  const y = Math.floor((screen.height - height) / 2);

  return moveWindow(hwnd, x, y, width, height, true);
}

export function getClientRect(hwnd: number | bigint): Rect | null {
  const buf = new Int32Array(4);
  if (!user32.symbols.GetClientRect(BigInt(hwnd), ptr(buf))) return null;
  return { left: buf[0], top: buf[1], right: buf[2], bottom: buf[3] };
}

export function getWindowSize(hwnd: number | bigint): Size | null {
  const rect = getWindowRect(hwnd);
  if (!rect) return null;
  return { width: rect.right - rect.left, height: rect.bottom - rect.top };
}

export function getClientSize(hwnd: number | bigint): Size | null {
  const rect = getClientRect(hwnd);
  if (!rect) return null;
  return { width: rect.right - rect.left, height: rect.bottom - rect.top };
}

export function isWindow(hwnd: number | bigint): boolean {
  return user32.symbols.IsWindow(BigInt(hwnd));
}

export function getExtendedWindowInfo(
  hwnd: number | bigint
): ExtendedWindowInfo | null {
  if (!isWindow(hwnd)) return null;

  const h = BigInt(hwnd);

  const titleBuf = new Uint16Array(256);
  const titleLen = user32.symbols.GetWindowTextW(h, ptr(titleBuf), 256);
  const title =
    titleLen > 0 ? textDecoder.decode(titleBuf.subarray(0, titleLen)) : "";

  const rectBuf = new Int32Array(4);
  if (!user32.symbols.GetWindowRect(h, ptr(rectBuf))) return null;
  const rect = {
    left: rectBuf[0],
    top: rectBuf[1],
    right: rectBuf[2],
    bottom: rectBuf[3],
  };

  const screen = getScreenSize();
  const isFullscreen =
    rect.left === 0 &&
    rect.top === 0 &&
    rect.right - rect.left === screen.width &&
    rect.bottom - rect.top === screen.height &&
    !((user32.symbols.GetWindowLongW(h, GWL_STYLE) & 0x00c40000) !== 0);

  const pidBuf = new Uint32Array(1);
  user32.symbols.GetWindowThreadProcessId(h, ptr(pidBuf));

  const classBuf = new Uint8Array(256);
  const classLen = user32.symbols.GetClassNameA(h, ptr(classBuf), 256);
  const className =
    classLen > 0 ? asciiDecoder.decode(classBuf.subarray(0, classLen)) : "";

  return {
    hwnd: h,
    title,
    rect,
    isFullscreen,
    processId: pidBuf[0],
    isVisible: user32.symbols.IsWindowVisible(h),
    isMinimized: user32.symbols.IsIconic(h),
    isMaximized: user32.symbols.IsZoomed(h),
    className,
  };
}

export function waitForWindowClose(
  hwnd: number | bigint,
  timeout?: number
): Promise<boolean> {
  return new Promise((resolve) => {
    let elapsed = 0;
    const id = setInterval(() => {
      if (!isWindow(hwnd)) {
        clearInterval(id);
        resolve(true);
        return;
      }
      if (timeout && (elapsed += 100) >= timeout) {
        clearInterval(id);
        resolve(false);
      }
    }, 100);
  });
}

export async function focusWindow(
  hwnd: number | bigint,
  timeout = 1000
): Promise<boolean> {
  setForeground(hwnd);
  let elapsed = 0;
  while (elapsed < timeout) {
    const active = getActiveWindow();
    if (active && active.hwnd === BigInt(hwnd)) return true;
    await Bun.sleep(50);
    elapsed += 50;
  }
  return false;
}

export function enumWindows(): ExtendedWindowInfo[] {
  const windows: ExtendedWindowInfo[] = [];
  const callback = new JSCallback(
    (hwnd: bigint, _lParam: bigint) => {
      const info = getExtendedWindowInfo(hwnd);
      if (info && info.isVisible && info.title) {
        windows.push(info);
      }
      return true;
    },
    {
      args: ["u64", "i64"],
      returns: "bool",
    }
  );

  user32.symbols.EnumWindows(callback.ptr, 0);
  callback.close();
  return windows;
}

export function enumChildWindows(parentHwnd: number | bigint): bigint[] {
  const children: bigint[] = [];
  const callback = new JSCallback(
    (hwnd: bigint, _lParam: bigint) => {
      children.push(hwnd);
      return true;
    },
    {
      args: ["u64", "i64"],
      returns: "bool",
    }
  );

  user32.symbols.EnumChildWindows(BigInt(parentHwnd), callback.ptr, 0);
  callback.close();
  return children;
}

export function flashWindow(hwnd: number | bigint, invert = true): boolean {
  return user32.symbols.FlashWindow(BigInt(hwnd), invert);
}

export function setWindowOpacity(
  hwnd: number | bigint,
  opacity: number
): boolean {
  const h = BigInt(hwnd);
  const exStyle = user32.symbols.GetWindowLongW(h, GWL_EXSTYLE);
  user32.symbols.SetWindowLongW(h, GWL_EXSTYLE, exStyle | WS_EX_LAYERED);

  const alpha = Math.max(0, Math.min(255, Math.floor(opacity * 255)));
  return user32.symbols.SetLayeredWindowAttributes(h, 0, alpha, LWA_ALPHA);
}

export function setWindowTopmost(
  hwnd: number | bigint,
  enable: boolean
): boolean {
  return user32.symbols.SetWindowPos(
    BigInt(hwnd),
    BigInt(enable ? HWND_TOPMOST : HWND_NOTOPMOST),
    0,
    0,
    0,
    0,
    SWP_NOMOVE | SWP_NOSIZE
  );
}

export function setWindowTitle(hwnd: number | bigint, title: string): boolean {
  const buf = new Uint16Array(title.length + 1);
  const encoded = new TextEncoder().encodeInto(
    title,
    new Uint8Array(buf.buffer)
  );
  const buffer = Buffer.from(title + "\0", "utf16le");
  return user32.symbols.SetWindowTextW(BigInt(hwnd), ptr(buffer));
}

export function setWindowEnabled(
  hwnd: number | bigint,
  enabled: boolean
): boolean {
  return user32.symbols.EnableWindow(BigInt(hwnd), enabled);
}

export function redrawWindow(hwnd: number | bigint): boolean {
  return user32.symbols.RedrawWindow(
    BigInt(hwnd),
    null,
    0n,
    RDW_INVALIDATE | RDW_ERASE | RDW_UPDATENOW
  );
}

export function moveWindowToBottom(hwnd: number | bigint): boolean {
  return user32.symbols.SetWindowPos(
    BigInt(hwnd),
    BigInt(HWND_BOTTOM),
    0,
    0,
    0,
    0,
    SWP_NOMOVE | SWP_NOSIZE
  );
}

export function moveWindowToTop(hwnd: number | bigint): boolean {
  return user32.symbols.SetWindowPos(
    BigInt(hwnd),
    BigInt(HWND_TOP),
    0,
    0,
    0,
    0,
    SWP_NOMOVE | SWP_NOSIZE
  );
}

export function getWindowProcessPath(hwnd: number | bigint): string {
  const pid = getWindowProcessId(hwnd);
  if (!pid) return "";

  const hProcess = kernel32.symbols.OpenProcess(
    PROCESS_QUERY_LIMITED_INFORMATION,
    false,
    pid
  );

  if (!hProcess) return "";

  try {
    const buf = new Uint16Array(1024);
    const sizeBuf = new Uint32Array([1024]);
    const success = kernel32.symbols.QueryFullProcessImageNameW(
      hProcess,
      0,
      ptr(buf),
      ptr(sizeBuf)
    );

    if (success) {
      return textDecoder.decode(buf.subarray(0, sizeBuf[0]));
    }
    return "";
  } finally {
    kernel32.symbols.CloseHandle(hProcess);
  }
}

export function clientToScreen(
  hwnd: number | bigint,
  x: number,
  y: number
): { x: number; y: number } | null {
  const point = new Int32Array([x, y]);
  if (user32.symbols.ClientToScreen(BigInt(hwnd), ptr(point))) {
    return { x: point[0], y: point[1] };
  }
  return null;
}

export function screenToClient(
  hwnd: number | bigint,
  x: number,
  y: number
): { x: number; y: number } | null {
  const point = new Int32Array([x, y]);
  if (user32.symbols.ScreenToClient(BigInt(hwnd), ptr(point))) {
    return { x: point[0], y: point[1] };
  }
  return null;
}

export function activateWindow(hwnd: number | bigint): boolean {
  const h = BigInt(hwnd);
  if (isWindowMinimized(h)) {
    restoreWindow(h);
  }
  return setForeground(h);
}

export async function waitActiveWindow(
  hwnd: number | bigint,
  timeout?: number
): Promise<boolean> {
  const h = BigInt(hwnd);
  return new Promise((resolve) => {
    let elapsed = 0;
    const id = setInterval(() => {
      const active = getActiveWindow();
      if (active && active.hwnd === h) {
        clearInterval(id);
        resolve(true);
        return;
      }
      if (timeout && (elapsed += 100) >= timeout) {
        clearInterval(id);
        resolve(false);
      }
    }, 100);
  });
}

export async function waitNotActiveWindow(
  hwnd: number | bigint,
  timeout?: number
): Promise<boolean> {
  const h = BigInt(hwnd);
  return new Promise((resolve) => {
    let elapsed = 0;
    const id = setInterval(() => {
      const active = getActiveWindow();
      if (!active || active.hwnd !== h) {
        clearInterval(id);
        resolve(true);
        return;
      }
      if (timeout && (elapsed += 100) >= timeout) {
        clearInterval(id);
        resolve(false);
      }
    }, 100);
  });
}

export function killWindow(hwnd: number | bigint): boolean {
  const h = BigInt(hwnd);
  const pid = getWindowProcessId(h);
  if (!pid) return false;

  const PROCESS_TERMINATE = 0x0001;
  const hProcess = kernel32.symbols.OpenProcess(PROCESS_TERMINATE, false, pid);

  if (!hProcess) return false;

  try {
    return kernel32.symbols.TerminateProcess(hProcess, 1);
  } finally {
    kernel32.symbols.CloseHandle(hProcess);
  }
}

export function getWindowStyle(hwnd: number | bigint): number {
  return user32.symbols.GetWindowLongW(BigInt(hwnd), GWL_STYLE);
}

export function setWindowStyle(
  hwnd: number | bigint,
  style: keyof typeof STYLES
): number {
  return user32.symbols.SetWindowLongW(BigInt(hwnd), GWL_STYLE, STYLES[style]);
}

export function getWindowExStyle(hwnd: number | bigint): number {
  return user32.symbols.GetWindowLongW(BigInt(hwnd), GWL_EXSTYLE);
}

export function setWindowExStyle(
  hwnd: number | bigint,
  style: keyof typeof EX_STYLES
): number {
  return user32.symbols.SetWindowLongW(
    BigInt(hwnd),
    GWL_EXSTYLE,
    EX_STYLES[style]
  );
}

export function getWindowMinMax(hwnd: number | bigint): number {
  const h = BigInt(hwnd);
  if (user32.symbols.IsIconic(h)) return -1;
  if (user32.symbols.IsZoomed(h)) return 1;
  return 0;
}

export function getWindowList(): bigint[] {
  const list: bigint[] = [];
  const callback = new JSCallback(
    (hwnd: bigint, _lParam: bigint) => {
      if (user32.symbols.IsWindowVisible(hwnd)) {
        list.push(hwnd);
      }
      return true;
    },
    { args: ["u64", "i64"], returns: "bool" }
  );

  user32.symbols.EnumWindows(callback.ptr, 0);
  callback.close();
  return list;
}

export function getWindowCount(): number {
  return getWindowList().length;
}

export function minimizeAll(): void {
  const windows = getWindowList();
  for (const hwnd of windows) {
    user32.symbols.ShowWindow(hwnd, SW_MINIMIZE);
  }
}

export function getWindowProcessName(hwnd: number | bigint): string {
  const path = getWindowProcessPath(hwnd);
  if (!path) return "";
  const parts = path.split("\\");
  return parts[parts.length - 1];
}

export function getWindowText(hwnd: number | bigint): string {
  let text = getWindowTitle(hwnd);
  const children = enumChildWindows(hwnd);
  for (const child of children) {
    const childText = getWindowTitle(child);
    if (childText) text += "\r\n" + childText;
  }
  return text;
}

export function setWindowRegionRect(
  hwnd: number | bigint,
  x: number,
  y: number,
  w: number,
  h: number,
  redraw = true
): boolean {
  const rgn = gdi32.symbols.CreateRectRgn(x, y, x + w, y + h);
  if (!rgn) return false;
  return user32.symbols.SetWindowRgn(BigInt(hwnd), rgn, redraw) !== 0;
}

export function setWindowRegionEllipse(
  hwnd: number | bigint,
  x: number,
  y: number,
  w: number,
  h: number,
  redraw = true
): boolean {
  const rgn = gdi32.symbols.CreateEllipticRgn(x, y, x + w, y + h);
  if (!rgn) return false;
  return user32.symbols.SetWindowRgn(BigInt(hwnd), rgn, redraw) !== 0;
}

export function setWindowRegionRound(
  hwnd: number | bigint,
  x: number,
  y: number,
  w: number,
  h: number,
  rw: number,
  rh: number,
  redraw = true
): boolean {
  const rgn = gdi32.symbols.CreateRoundRectRgn(x, y, x + w, y + h, rw, rh);
  if (!rgn) return false;
  return user32.symbols.SetWindowRgn(BigInt(hwnd), rgn, redraw) !== 0;
}

export function setWindowRegionPolygon(
  hwnd: number | bigint,
  points: { x: number; y: number }[],
  fillMode = 1,
  redraw = true
): boolean {
  const buf = new Int32Array(points.length * 2);
  for (let i = 0; i < points.length; i++) {
    buf[i * 2] = points[i].x;
    buf[i * 2 + 1] = points[i].y;
  }
  const rgn = gdi32.symbols.CreatePolygonRgn(ptr(buf), points.length, fillMode);
  if (!rgn) return false;
  return user32.symbols.SetWindowRgn(BigInt(hwnd), rgn, redraw) !== 0;
}

export function resetWindowRegion(
  hwnd: number | bigint,
  redraw = true
): boolean {
  return user32.symbols.SetWindowRgn(BigInt(hwnd), 0, redraw) !== 0;
}
