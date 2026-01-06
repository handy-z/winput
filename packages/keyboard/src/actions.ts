import { user32 } from "./core";
import { buildKeyboardInputBuffer, buildInputBuffer } from "./core";
import { KEYBOARD_MAPPING, SHIFT_KEYS, KeyName } from "./mapping";
import {
  KEYEVENTF_SCANCODE,
  KEYEVENTF_KEYUP,
  KEYEVENTF_EXTENDEDKEY,
} from "./core";
import { keyboard } from "./class";

const KEYEVENTF_KEYDOWN = 0;

function sendKeyboardInput(
  scan: number,
  extended: boolean,
  flags: number,
  time = 0
) {
  const fullFlags = flags | (extended ? KEYEVENTF_EXTENDEDKEY : 0);
  const kiBuf = buildKeyboardInputBuffer(0, scan, fullFlags, time, 0n);
  const inputBuf = buildInputBuffer(1, kiBuf);
  user32.symbols.SendInput(1, inputBuf, 40);
}

function sendVKInput(vk: number, keyUp: boolean, time = 0) {
  const flags = keyUp ? KEYEVENTF_KEYUP : KEYEVENTF_KEYDOWN;
  const kiBuf = buildKeyboardInputBuffer(vk, 0, flags, time, 0n);
  const inputBuf = buildInputBuffer(1, kiBuf);
  user32.symbols.SendInput(1, inputBuf, 40);
}

function getKeyDef(key: KeyName): {
  scan: number;
  extended?: boolean;
  vk?: number;
} {
  const def = KEYBOARD_MAPPING[key];
  if (!def) {
    throw new Error(`Invalid key name: "${key}"`);
  }
  return def as {
    scan: number;
    extended?: boolean;
    vk?: number;
  };
}

export function press(key: KeyName) {
  const def = getKeyDef(key);

  if (def.scan === 0 && def.vk) {
    sendVKInput(def.vk, false);
  } else {
    const flags = KEYEVENTF_SCANCODE;
    sendKeyboardInput(def.scan, !!def.extended, flags);
  }

  return keyboard;
}

export function release(key: KeyName) {
  const def = getKeyDef(key);

  if (def.scan === 0 && def.vk) {
    sendVKInput(def.vk, true);
  } else {
    const flags = KEYEVENTF_SCANCODE | KEYEVENTF_KEYUP;
    sendKeyboardInput(def.scan, !!def.extended, flags);
  }

  return keyboard;
}

export function tap(key: KeyName) {
  press(key);
  release(key);
  return keyboard;
}

export function repeatTap(key: KeyName, repeat = 1, delay = 0.0) {
  if (repeat < 1) {
    throw new Error(`repeat must be >= 1, got: ${repeat}`);
  }
  if (delay < 0) {
    throw new Error(`delay must be >= 0, got: ${delay}`);
  }
  
  for (let i = 0; i < repeat; i++) {
    press(key);
    release(key);
    if (delay > 0) Bun.sleepSync(delay);
  }
  return keyboard;
}

export function write(message: string, delay = 0.0) {
  if (delay < 0) {
    throw new Error(`delay must be >= 0, got: ${delay}`);
  }
  
  for (const c of message) {
    if (c >= "A" && c <= "Z") {
      const base = c.toLowerCase() as KeyName;
      press("shift");
      tap(base);
      release("shift");
    } else if (SHIFT_KEYS.has(c)) {
      const base = SHIFT_KEYS.get(c)! as KeyName;
      press("shift");
      tap(base);
      release("shift");
    } else {
      tap(c as KeyName);
    }
    if (delay > 0) Bun.sleepSync(delay);
  }
  return keyboard;
}

export function isPressed(key: KeyName): boolean {
  const def = getKeyDef(key);

  if (def.vk) {
    const state = user32.symbols.GetAsyncKeyState(def.vk);
    return (state & 0x8000) !== 0;
  }

  const vkCode = user32.symbols.MapVirtualKeyW(def.scan, 1);
  const state = user32.symbols.GetAsyncKeyState(vkCode);
  return (state & 0x8000) !== 0;
}

export function isAnyPressed(keys: KeyName[]): boolean {
  return keys.some((key) => isPressed(key));
}

export function areAllPressed(keys: KeyName[]): boolean {
  return keys.every((key) => isPressed(key));
}

export function hotkey(keys: KeyName[]) {
  for (const key of keys) {
    press(key);
  }
  for (let i = keys.length - 1; i >= 0; i--) {
    release(keys[i]);
  }
  return keyboard;
}

export function hold(key: KeyName, duration: number) {
  if (duration < 0) {
    throw new Error(`duration must be >= 0, got: ${duration}`);
  }
  
  press(key);
  Bun.sleepSync(duration);
  release(key);
  return keyboard;
}

export function waitForPress(key: KeyName, timeout?: number): Promise<boolean> {
  if (timeout !== undefined && timeout < 0) {
    throw new Error(`timeout must be >= 0, got: ${timeout}`);
  }
  
  return new Promise((resolve) => {
    const checkInterval = 8;
    let elapsed = 0;
    const intervalId = setInterval(() => {
      if (isPressed(key)) {
        clearInterval(intervalId);
        resolve(true);
        return;
      }
      if (timeout) {
        elapsed += checkInterval;
        if (elapsed >= timeout) {
          clearInterval(intervalId);
          resolve(false);
        }
      }
    }, checkInterval);
  });
}

export function waitForRelease(
  key: KeyName,
  timeout?: number
): Promise<boolean> {
  if (timeout !== undefined && timeout < 0) {
    throw new Error(`timeout must be >= 0, got: ${timeout}`);
  }
  
  return new Promise((resolve) => {
    const checkInterval = 8;
    let elapsed = 0;
    const intervalId = setInterval(() => {
      if (!isPressed(key)) {
        clearInterval(intervalId);
        resolve(true);
        return;
      }
      if (timeout) {
        elapsed += checkInterval;
        if (elapsed >= timeout) {
          clearInterval(intervalId);
          resolve(false);
        }
      }
    }, checkInterval);
  });
}

export function toggleKey(key: "capslock" | "numlock" | "scrolllock") {
  tap(key);
  return keyboard;
}

export function getKeyState(key: KeyName): {
  isPressed: boolean;
  isToggled: boolean;
} {
  const def = getKeyDef(key);
  let vkCode: number;

  if (def.vk) {
    vkCode = def.vk;
  } else {
    vkCode = user32.symbols.MapVirtualKeyW(def.scan, 1);
  }

  const asyncState = user32.symbols.GetAsyncKeyState(vkCode);
  const keyState = user32.symbols.GetKeyState(vkCode);
  return {
    isPressed: (asyncState & 0x8000) !== 0,
    isToggled: (keyState & 0x0001) !== 0,
  };
}

export function releaseAll() {
  const keysToRelease: KeyName[] = [
    "shift",
    "shiftleft",
    "shiftright",
    "ctrl",
    "ctrlleft",
    "ctrlright",
    "alt",
    "altleft",
    "altright",
    "win",
    "winleft",
    "winright",
  ];
  const letters = "abcdefghijklmnopqrstuvwxyz".split("") as KeyName[];
  keysToRelease.push(...letters);
  for (const key of keysToRelease) {
    if (isPressed(key)) {
      release(key);
    }
  }
  return keyboard;
}
