import { dlopen, FFIType, suffix } from "bun:ffi";

export const user32 = dlopen(`user32.${suffix}`, {
  GetDC: { args: [FFIType.ptr], returns: FFIType.u64 },
  ReleaseDC: { args: [FFIType.u64, FFIType.u64], returns: FFIType.int },
  GetDesktopWindow: { args: [], returns: FFIType.ptr },
  GetSystemMetrics: { args: [FFIType.int], returns: FFIType.int },
  GetWindowRect: { args: [FFIType.u64, FFIType.ptr], returns: FFIType.bool },
  GetForegroundWindow: { args: [], returns: FFIType.u64 },
  GetWindowTextW: {
    args: [FFIType.u64, FFIType.ptr, FFIType.int],
    returns: FFIType.int,
  },
  FindWindowA: { args: [FFIType.ptr, FFIType.ptr], returns: FFIType.u64 },
  ShowWindow: { args: [FFIType.u64, FFIType.int], returns: FFIType.bool },
  SetWindowPos: {
    args: [
      FFIType.u64,
      FFIType.u64,
      FFIType.int,
      FFIType.int,
      FFIType.int,
      FFIType.int,
      FFIType.uint32_t,
    ],
    returns: FFIType.bool,
  },
  UpdateWindow: { args: [FFIType.u64], returns: FFIType.bool },
  IsWindow: { args: [FFIType.u64], returns: FFIType.bool },
  PeekMessageW: {
    args: [FFIType.ptr, FFIType.u64, FFIType.u32, FFIType.u32, FFIType.u32],
    returns: FFIType.bool,
  },
  TranslateMessage: { args: [FFIType.ptr], returns: FFIType.bool },
  DispatchMessageW: { args: [FFIType.ptr], returns: FFIType.ptr },
  CreateWindowExW: {
    args: [FFIType.uint32_t, FFIType.ptr, FFIType.ptr, FFIType.uint32_t, FFIType.int, FFIType.int, FFIType.int, FFIType.int, FFIType.ptr, FFIType.ptr, FFIType.ptr, FFIType.ptr],
    returns: FFIType.ptr,
  },
  PostMessageA: { args: [FFIType.u64, FFIType.u32, FFIType.u64, FFIType.u64], returns: FFIType.bool },
});

export const gdi32 = dlopen("gdi32.dll", {
  CreateCompatibleDC: { args: [FFIType.u64], returns: FFIType.u64 },
  CreateDIBSection: {
    args: [
      FFIType.u64,
      FFIType.ptr,
      FFIType.uint32_t,
      FFIType.ptr,
      FFIType.ptr,
      FFIType.uint32_t,
    ],
    returns: FFIType.u64,
  },
  SelectObject: { args: [FFIType.u64, FFIType.u64], returns: FFIType.u64 },
  BitBlt: {
    args: [
      FFIType.u64,
      FFIType.int,
      FFIType.int,
      FFIType.int,
      FFIType.int,
      FFIType.u64,
      FFIType.int,
      FFIType.int,
      FFIType.uint32_t,
    ],
    returns: FFIType.bool,
  },
  StretchDIBits: {
    args: [
      FFIType.u64,
      FFIType.int,
      FFIType.int,
      FFIType.int,
      FFIType.int,
      FFIType.int,
      FFIType.int,
      FFIType.int,
      FFIType.int,
      FFIType.ptr,
      FFIType.ptr,
      FFIType.uint32_t,
      FFIType.uint32_t,
    ],
    returns: FFIType.int,
  },
  DeleteDC: { args: [FFIType.u64], returns: FFIType.bool },
  DeleteObject: { args: [FFIType.u64], returns: FFIType.bool },
  CreateCompatibleBitmap: {
    args: [FFIType.u64, FFIType.int, FFIType.int],
    returns: FFIType.u64,
  },
});

export const gdiplus = dlopen("gdiplus.dll", {
  GdiplusStartup: {
    args: [FFIType.ptr, FFIType.ptr, FFIType.ptr],
    returns: FFIType.int,
  },
  GdiplusShutdown: { args: [FFIType.u64], returns: FFIType.void },
  GdipCreateBitmapFromFile: {
    args: [FFIType.ptr, FFIType.ptr],
    returns: FFIType.int,
  },
  GdipGetImageWidth: {
    args: [FFIType.u64, FFIType.ptr],
    returns: FFIType.int,
  },
  GdipGetImageHeight: {
    args: [FFIType.u64, FFIType.ptr],
    returns: FFIType.int,
  },
  GdipBitmapLockBits: {
    args: [FFIType.u64, FFIType.ptr, FFIType.uint32_t, FFIType.int, FFIType.ptr],
    returns: FFIType.int,
  },
  GdipBitmapUnlockBits: {
    args: [FFIType.u64, FFIType.ptr],
    returns: FFIType.int,
  },
  GdipDisposeImage: { args: [FFIType.u64], returns: FFIType.int },
  GdipCreateBitmapFromScan0: {
    args: [
      FFIType.int,
      FFIType.int,
      FFIType.int,
      FFIType.int,
      FFIType.ptr,
      FFIType.ptr,
    ],
    returns: FFIType.int,
  },
  GdipSaveImageToFile: {
    args: [FFIType.u64, FFIType.ptr, FFIType.ptr, FFIType.ptr],
    returns: FFIType.int,
  },
  GdipGetImageEncodersSize: {
    args: [FFIType.ptr, FFIType.ptr],
    returns: FFIType.int,
  },
  GdipGetImageEncoders: {
    args: [FFIType.u32, FFIType.u32, FFIType.ptr],
    returns: FFIType.int,
  },
});

export const kernel32 = dlopen(`kernel32.${suffix}`, {
  RtlMoveMemory: {
    args: [FFIType.ptr, FFIType.ptr, FFIType.u64],
    returns: FFIType.void,
  },
});
