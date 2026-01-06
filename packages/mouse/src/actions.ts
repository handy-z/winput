import { user32 } from "./core";
import { buildMouseInputBuffer, buildInputBuffer } from "./core";
import {
  failSafeCheck,
  toWindowsCoordinates,
  position,
} from "./core";
import {
  MOUSEEVENTF_MOVE,
  MOUSEEVENTF_ABSOLUTE,
  MOUSEEVENTF_LEFTDOWN,
  MOUSEEVENTF_LEFTUP,
  MOUSEEVENTF_MIDDLEDOWN,
  MOUSEEVENTF_MIDDLEUP,
  MOUSEEVENTF_RIGHTDOWN,
  MOUSEEVENTF_RIGHTUP,
  MOUSEEVENTF_XDOWN,
  MOUSEEVENTF_XUP,
  XBUTTON1,
  XBUTTON2,
} from "./core";
import { LEFT, MIDDLE, MouseButton, RIGHT, X1, X2 } from "./buttons";
import { mouse } from "./class";

const MOUSEEVENTF_WHEEL = 0x0800;
const MOUSEEVENTF_HWHEEL = 0x1000;
const WHEEL_DELTA = 120;

const BUTTON_EVENT_MAP = {
  [LEFT]: {
    down: MOUSEEVENTF_LEFTDOWN,
    up: MOUSEEVENTF_LEFTUP,
    data: 0,
  },
  [MIDDLE]: {
    down: MOUSEEVENTF_MIDDLEDOWN,
    up: MOUSEEVENTF_MIDDLEUP,
    data: 0,
  },
  [RIGHT]: {
    down: MOUSEEVENTF_RIGHTDOWN,
    up: MOUSEEVENTF_RIGHTUP,
    data: 0,
  },
  [X1]: {
    down: MOUSEEVENTF_XDOWN,
    up: MOUSEEVENTF_XUP,
    data: XBUTTON1,
  },
  [X2]: {
    down: MOUSEEVENTF_XDOWN,
    up: MOUSEEVENTF_XUP,
    data: XBUTTON2,
  },
} as const;

function getButtonEvent(
  button: MouseButton,
  action: "down" | "up"
): { event: number; mouseData: number } {
  const mapping = BUTTON_EVENT_MAP[button];
  if (!mapping) {
    throw new Error(`Invalid button: ${button}`);
  }
  return { event: mapping[action], mouseData: mapping.data };
}

function validateCoordinates(x?: number, y?: number): void {
  if (x !== undefined) {
    if (!Number.isFinite(x)) {
      throw new Error(`Invalid x coordinate: ${x}`);
    }
    if (x < 0) {
      throw new Error(`x coordinate must be non-negative: ${x}`);
    }
  }

  if (y !== undefined) {
    if (!Number.isFinite(y)) {
      throw new Error(`Invalid y coordinate: ${y}`);
    }
    if (y < 0) {
      throw new Error(`y coordinate must be non-negative: ${y}`);
    }
  }
}
function sendMouseInput(
  dx: number,
  dy: number,
  mouseData: number,
  flags: number,
  time = 0
) {
  const miBuf = buildMouseInputBuffer(dx, dy, mouseData, flags, time, 0n);
  const inputBuf = buildInputBuffer(0, miBuf);
  user32.symbols.SendInput(1, inputBuf, 40);
}

export function press(button: MouseButton = LEFT) {
  try {
    const { event, mouseData } = getButtonEvent(button, "down");
    sendMouseInput(0, 0, mouseData, event, 0);
    return mouse;
  } catch (error) {
    console.error("[Mouse Press Error]", error);
    throw error;
  }
}

export function release(button: MouseButton = LEFT) {
  try {
    const { event, mouseData } = getButtonEvent(button, "up");
    sendMouseInput(0, 0, mouseData, event, 0);
    return mouse;
  } catch (error) {
    console.error("[Mouse Release Error]", error);
    throw error;
  }
}

export function click(
  button: Exclude<MouseButton, "x1" | "x2"> = LEFT,
  repeat = 1,
  delay = 0.0
) {
  if (repeat < 1) {
    throw new Error(`repeat must be >= 1, got: ${repeat}`);
  }
  if (delay < 0) {
    throw new Error(`delay must be >= 0, got: ${delay}`);
  }
  
  if ([LEFT, MIDDLE, RIGHT].includes(button)) {
    let downEv = 0,
      upEv = 0;
    if (button === LEFT) {
      downEv = MOUSEEVENTF_LEFTDOWN;
      upEv = MOUSEEVENTF_LEFTUP;
    } else if (button === MIDDLE) {
      downEv = MOUSEEVENTF_MIDDLEDOWN;
      upEv = MOUSEEVENTF_MIDDLEUP;
    } else {
      downEv = MOUSEEVENTF_RIGHTDOWN;
      upEv = MOUSEEVENTF_RIGHTUP;
    }
    for (let i = 0; i < repeat; i++) {
      failSafeCheck();
      sendMouseInput(0, 0, 0, downEv, 0);
      sendMouseInput(0, 0, 0, upEv, 0);
      if (delay > 0) Bun.sleepSync(Math.round(delay * 1000));
    }
  }
  return mouse;
}

export function moveTo(
  x?: number,
  y?: number,
  relative = false
) {
  try {
    failSafeCheck();
    validateCoordinates(x, y);

    if (!relative) {
      const [finalX, finalY] = position(x, y);
      const [winX, winY] = toWindowsCoordinates(finalX, finalY);
      sendMouseInput(winX, winY, 0, MOUSEEVENTF_MOVE | MOUSEEVENTF_ABSOLUTE, 0);
    } else {
      const offsetX = x ?? 0;
      const offsetY = y ?? 0;
      moveRel(offsetX, offsetY, true);
    }

    return mouse;
  } catch (error) {
    console.error("[Mouse MoveTo Error]", error);
    throw error;
  }
}

export function moveRel(
  xOffset = 0,
  yOffset = 0,
  relative = false
) {
  failSafeCheck();
  if (!relative) {
    const [x, y] = position();
    moveTo(x + xOffset, y + yOffset, false);
  } else {
    sendMouseInput(xOffset, yOffset, 0, MOUSEEVENTF_MOVE, 0);
  }
  return mouse;
}
export const move = moveRel;

export function isPressed(button: MouseButton): boolean {
  let vkCode: number;
  if (button === LEFT) vkCode = 0x01;
  else if (button === RIGHT) vkCode = 0x02;
  else if (button === MIDDLE) vkCode = 0x04;
  else if (button === X1) vkCode = 0x05;
  else if (button === X2) vkCode = 0x06;
  else throw new Error(`Invalid button: ${button}`);
  const state = user32.symbols.GetAsyncKeyState(vkCode);
  return (state & 0x8000) !== 0;
}

export function dragTo(
  x: number,
  y: number,
  button: Exclude<MouseButton, "x1" | "x2"> = LEFT,
  duration = 0.5
) {
  if (duration < 0) {
    throw new Error(`duration must be >= 0, got: ${duration}`);
  }
  
  failSafeCheck();
  const [startX, startY] = position();
  press(button);
  if (duration <= 0) {
    moveTo(x, y, false);
  } else {
    const steps = Math.max(10, Math.floor(duration * 100));
    const stepDelay = duration / steps;
    for (let i = 1; i <= steps; i++) {
      const progress = i / steps;
      const currentX = Math.round(startX + (x - startX) * progress);
      const currentY = Math.round(startY + (y - startY) * progress);
      moveTo(currentX, currentY, false);
      Bun.sleepSync(Math.round(stepDelay * 1000));
    }
  }
  release(button);
  return mouse;
}

export function dragRel(
  xOffset: number,
  yOffset: number,
  button: Exclude<MouseButton, "x1" | "x2"> = LEFT,
  duration = 0.5
) {
  const [currentX, currentY] = position();
  return dragTo(
    currentX + xOffset,
    currentY + yOffset,
    button,
    duration
  );
}

export function scroll(
  clicks: number,
  direction: "vertical" | "horizontal" = "vertical"
) {
  failSafeCheck();
  const scrollAmount = clicks * WHEEL_DELTA;
  const flags =
    direction === "vertical" ? MOUSEEVENTF_WHEEL : MOUSEEVENTF_HWHEEL;
  sendMouseInput(0, 0, scrollAmount, flags, 0);
  return mouse;
}

const easingFunctions = {
  linear: (t: number) => t,
  easeInQuad: (t: number) => t * t,
  easeOutQuad: (t: number) => t * (2 - t),
  easeInOutQuad: (t: number) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),
  easeInCubic: (t: number) => t * t * t,
  easeOutCubic: (t: number) => --t * t * t + 1,
  easeInOutCubic: (t: number) =>
    t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
};
export type EasingFunction = keyof typeof easingFunctions;

export async function smoothMoveTo(
  x: number,
  y: number,
  duration = 0.5,
  easing: EasingFunction = "easeOutQuad"
) {
  if (duration < 0) {
    throw new Error(`duration must be >= 0, got: ${duration}`);
  }
  
  failSafeCheck();
  const [startX, startY] = position();
  const easeFn = easingFunctions[easing];
  if (duration <= 0) {
    moveTo(x, y, false);
    return mouse;
  }
  const steps = Math.max(10, Math.floor(duration * 100));
  const stepDelay = duration / steps;
  for (let i = 1; i <= steps; i++) {
    const t = i / steps;
    const progress = easeFn(t);
    const currentX = Math.round(startX + (x - startX) * progress);
    const currentY = Math.round(startY + (y - startY) * progress);
    moveTo(currentX, currentY, false);
    Bun.sleepSync(Math.round(stepDelay * 1000));
  }
  return mouse;
}

export function hold(
  button: MouseButton,
  duration: number
) {
  if (duration < 0) {
    throw new Error(`duration must be >= 0, got: ${duration}`);
  }
  
  failSafeCheck();
  press(button);
  Bun.sleepSync(Math.round(duration * 1000));
  release(button);
  return mouse;
}

export function clickAt(
  x: number,
  y: number,
  button: Exclude<MouseButton, "x1" | "x2"> = LEFT
) {
  failSafeCheck();
  moveTo(x, y, false);
  click(button, 1, 0);
  return mouse;
}

export function isAtPosition(x: number, y: number, tolerance = 0): boolean {
  if (tolerance < 0) {
    throw new Error(`tolerance must be >= 0, got: ${tolerance}`);
  }
  
  const [currentX, currentY] = position();
  const dx = Math.abs(currentX - x);
  const dy = Math.abs(currentY - y);
  return dx <= tolerance && dy <= tolerance;
}

export function waitForPosition(
  x: number,
  y: number,
  timeout?: number,
  tolerance = 0
): Promise<boolean> {
  if (timeout !== undefined && timeout < 0) {
    throw new Error(`timeout must be >= 0, got: ${timeout}`);
  }
  if (tolerance < 0) {
    throw new Error(`tolerance must be >= 0, got: ${tolerance}`);
  }
  
  return new Promise((resolve) => {
    const checkInterval = 8;
    let elapsed = 0;
    const intervalId = setInterval(() => {
      if (isAtPosition(x, y, tolerance)) {
        clearInterval(intervalId);
        resolve(true);
        return;
      }
      if (timeout !== undefined) {
        elapsed += checkInterval;
        if (elapsed >= timeout) {
          clearInterval(intervalId);
          resolve(false);
        }
      }
    }, checkInterval);
  });
}

export async function waitForPress(
  button: MouseButton,
  timeout?: number
): Promise<boolean> {
  if (timeout !== undefined && timeout < 0) {
    throw new Error(`timeout must be >= 0, got: ${timeout}`);
  }
  
  return new Promise((resolve) => {
    const checkInterval = 8;
    let elapsed = 0;
    const intervalId = setInterval(() => {
      if (isPressed(button)) {
        clearInterval(intervalId);
        resolve(true);
        return;
      }
      if (timeout !== undefined) {
        elapsed += checkInterval;
        if (elapsed >= timeout) {
          clearInterval(intervalId);
          resolve(false);
        }
      }
    }, checkInterval);
  });
}

export async function waitForRelease(
  button: MouseButton,
  timeout?: number
): Promise<boolean> {
  if (timeout !== undefined && timeout < 0) {
    throw new Error(`timeout must be >= 0, got: ${timeout}`);
  }
  
  return new Promise((resolve) => {
    const checkInterval = 8;
    let elapsed = 0;
    const intervalId = setInterval(() => {
      if (!isPressed(button)) {
        clearInterval(intervalId);
        resolve(true);
        return;
      }
      if (timeout !== undefined) {
        elapsed += checkInterval;
        if (elapsed >= timeout) {
          clearInterval(intervalId);
          resolve(false);
        }
      }
    }, checkInterval);
  });
}
