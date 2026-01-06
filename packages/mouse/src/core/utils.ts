import { user32 } from "./ffi-loader";
import { SM_CXSCREEN, SM_CYSCREEN } from "./constants";

/**
 * Fail-safe check for mouse operations
 * Throws error if mouse is at corner (0,0) which is used as emergency stop
 */
export function failSafeCheck(): void {
  const pos = getPosition();
  if (pos.x === 0 && pos.y === 0) {
    throw new Error("Fail-safe triggered: mouse at (0,0)");
  }
}

/**
 * Gets current cursor position as object
 */
export function getPosition(): { x: number; y: number } {
  const buf = Buffer.alloc(8);
  user32.symbols.GetCursorPos(buf);
  return {
    x: buf.readInt32LE(0),
    y: buf.readInt32LE(4),
  };
}

/**
 * Gets cursor position, optionally using provided coordinates
 * Returns as tuple [x, y]
 */
export function position(x?: number, y?: number): [number, number] {
  if (x !== undefined && y !== undefined) {
    return [x, y];
  }
  const pos = getPosition();
  return [pos.x, pos.y];
}

/**
 * Converts screen coordinates to Windows absolute coordinates (0-65535)
 */
export function toWindowsCoordinates(x: number, y: number): [number, number] {
  const screenWidth = user32.symbols.GetSystemMetrics(SM_CXSCREEN);
  const screenHeight = user32.symbols.GetSystemMetrics(SM_CYSCREEN);
  return [
    Math.round((x * 65535) / screenWidth),
    Math.round((y * 65535) / screenHeight),
  ];
}

export function getScreenWidth(): number {
  return user32.symbols.GetSystemMetrics(SM_CXSCREEN);
}

export function getScreenHeight(): number {
  return user32.symbols.GetSystemMetrics(SM_CYSCREEN);
}
