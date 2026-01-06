import { dlopen, FFIType, suffix } from "bun:ffi";

export const user32 = dlopen(`user32.${suffix}`, {
  GetSystemMetrics: { args: [FFIType.int], returns: FFIType.int },
  GetWindowLongW: { args: [FFIType.u64, FFIType.int], returns: FFIType.int },
  SetWindowLongW: { args: [FFIType.u64, FFIType.int, FFIType.int], returns: FFIType.int },
  SetWindowPos: { args: [FFIType.u64, FFIType.u64, FFIType.int, FFIType.int, FFIType.int, FFIType.int, FFIType.uint32_t], returns: FFIType.bool },
  SetLayeredWindowAttributes: { args: [FFIType.u64, FFIType.uint32_t, FFIType.int8_t, FFIType.uint32_t], returns: FFIType.bool },
  GetDC: { args: [FFIType.ptr], returns: FFIType.u64 },
  ReleaseDC: { args: [FFIType.u64, FFIType.u64], returns: FFIType.int },
  GetDesktopWindow: { args: [], returns: FFIType.ptr },
  PeekMessageW: { args: [FFIType.ptr, FFIType.u64, FFIType.u32, FFIType.u32, FFIType.u32], returns: FFIType.bool },
  TranslateMessage: { args: [FFIType.ptr], returns: FFIType.bool },
  DispatchMessageW: { args: [FFIType.ptr], returns: FFIType.ptr },
  UpdateWindow: { args: [FFIType.u64], returns: FFIType.bool },
  CreateWindowExW: {
    args: [FFIType.uint32_t, FFIType.ptr, FFIType.ptr, FFIType.uint32_t, FFIType.int, FFIType.int, FFIType.int, FFIType.int, FFIType.ptr, FFIType.ptr, FFIType.ptr, FFIType.ptr],
    returns: FFIType.ptr,
  },
  DefWindowProcW: {
    args: [FFIType.ptr, FFIType.u32, FFIType.ptr, FFIType.ptr],
    returns: FFIType.ptr,
  },
  RegisterClassExW: { args: [FFIType.ptr], returns: FFIType.u16 },
  LoadCursorW: { args: [FFIType.u64, FFIType.u64], returns: FFIType.u64 },
  ShowWindow: { args: [FFIType.u64, FFIType.int], returns: FFIType.bool },
});

export const kernel32 = dlopen(`kernel32.${suffix}`, {
  GetModuleHandleW: { args: [FFIType.ptr], returns: FFIType.u64 },
});

export const gdi32 = dlopen("gdi32.dll", {
  GetStockObject: { args: [FFIType.int], returns: FFIType.u64 },
  PatBlt: { args: [FFIType.u64, FFIType.int, FFIType.int, FFIType.int, FFIType.int, FFIType.uint32_t], returns: FFIType.bool },
  CreatePen: { args: [FFIType.int, FFIType.int, FFIType.uint32_t], returns: FFIType.u64 },
  DeleteObject: { args: [FFIType.u64], returns: FFIType.bool },
  SelectObject: { args: [FFIType.u64, FFIType.u64], returns: FFIType.u64 },
  MoveToEx: { args: [FFIType.u64, FFIType.int, FFIType.int, FFIType.ptr], returns: FFIType.bool },
  LineTo: { args: [FFIType.u64, FFIType.int, FFIType.int], returns: FFIType.bool },
  Rectangle: { args: [FFIType.u64, FFIType.int, FFIType.int, FFIType.int, FFIType.int], returns: FFIType.bool },
  Ellipse: { args: [FFIType.u64, FFIType.int, FFIType.int, FFIType.int, FFIType.int], returns: FFIType.bool },
  SetBkMode: { args: [FFIType.u64, FFIType.int], returns: FFIType.int },
  CreateCompatibleDC: { args: [FFIType.u64], returns: FFIType.u64 },
  DeleteDC: { args: [FFIType.u64], returns: FFIType.bool },
  CreateCompatibleBitmap: { args: [FFIType.u64, FFIType.int, FFIType.int], returns: FFIType.u64 },
  CreateSolidBrush: { args: [FFIType.uint32_t], returns: FFIType.u64 },
  BitBlt: { args: [FFIType.u64, FFIType.int, FFIType.int, FFIType.int, FFIType.int, FFIType.u64, FFIType.int, FFIType.int, FFIType.uint32_t], returns: FFIType.bool },
});
