import { dlopen, FFIType, suffix } from "bun:ffi";

export const user32 = dlopen(`user32.${suffix}`, {
  SendInput: {
    args: [FFIType.u32, FFIType.ptr, FFIType.i32],
    returns: FFIType.u32,
  },
  MapVirtualKeyW: {
    args: [FFIType.u32, FFIType.u32],
    returns: FFIType.u32,
  },
  GetKeyState: {
    args: [FFIType.i32],
    returns: FFIType.i16,
  },
  GetAsyncKeyState: {
    args: [FFIType.i32],
    returns: FFIType.i16,
  },
});
