import { dlopen, FFIType, suffix } from "bun:ffi";

export const user32 = dlopen(`user32.${suffix}`, {
  GetDC: { args: [FFIType.ptr], returns: FFIType.u64 },
  ReleaseDC: { args: [FFIType.u64, FFIType.u64], returns: FFIType.int },
  GetSystemMetrics: { args: [FFIType.int], returns: FFIType.int },
  GetMonitorInfoW: { args: [FFIType.ptr, FFIType.ptr], returns: FFIType.bool },
  EnumDisplayMonitors: { args: [FFIType.ptr, FFIType.ptr, FFIType.function, FFIType.ptr], returns: FFIType.bool },
});

export const gdi32 = dlopen("gdi32.dll", {
  GetPixel: { args: [FFIType.u64, FFIType.int, FFIType.int], returns: FFIType.uint32_t },
  CreateCompatibleDC: { args: [FFIType.u64], returns: FFIType.u64 },
  CreateCompatibleBitmap: { args: [FFIType.u64, FFIType.int, FFIType.int], returns: FFIType.u64 },
  SelectObject: { args: [FFIType.u64, FFIType.u64], returns: FFIType.u64 },
  BitBlt: { args: [FFIType.u64, FFIType.int, FFIType.int, FFIType.int, FFIType.int, FFIType.u64, FFIType.int, FFIType.int, FFIType.uint32_t], returns: FFIType.bool },
  GetDIBits: { args: [FFIType.u64, FFIType.u64, FFIType.u32, FFIType.u32, FFIType.ptr, FFIType.ptr, FFIType.u32], returns: FFIType.int },
  DeleteObject: { args: [FFIType.u64], returns: FFIType.bool },
  DeleteDC: { args: [FFIType.u64], returns: FFIType.bool },
});
