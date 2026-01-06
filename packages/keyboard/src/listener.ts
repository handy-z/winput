import { user32 } from "./core";
import { KeyboardEvents, KeyboardEvent } from "./types";
import { KEYBOARD_MAPPING, VK_TO_KEYNAME, VK_CODES, KeyName } from "./mapping";
import { ListenerBase } from "./core";

const MOUSE_VK_CODES: Set<number> = new Set([
  VK_CODES.LBUTTON,
  VK_CODES.RBUTTON,
  VK_CODES.MBUTTON,
  VK_CODES.XBUTTON1,
  VK_CODES.XBUTTON2,
]);

function getKeyNameFromVK(vk: number): KeyName | undefined {
  if (VK_TO_KEYNAME[vk]) {
    return VK_TO_KEYNAME[vk];
  }

  if (vk >= 0x30 && vk <= 0x39) {
    return String.fromCharCode(vk) as KeyName;
  }

  if (vk >= 0x41 && vk <= 0x5a) {
    return String.fromCharCode(vk).toLowerCase() as KeyName;
  }

  return undefined;
}

const VK_LIST = Object.values(VK_CODES);

export class Listener extends ListenerBase<KeyboardEvents> {
  protected async run(interval = 8) {
    if (interval < 1 || interval > 1000) {
      console.warn(`Keyboard listener interval out of recommended range (1-1000ms): ${interval}ms`);
    }
    
    const prev = new Map<number, boolean>();

    while (this.isRunning) {
      for (const vk of VK_LIST) {
        if (MOUSE_VK_CODES.has(vk)) continue;

        const state = user32.symbols.GetAsyncKeyState(vk);
        const isDown = (state & 0x8000) !== 0;

        const prevState = prev.get(vk);
        if (prevState !== isDown) {
          prev.set(vk, isDown);
          if (prevState !== undefined) {
            const name = getKeyNameFromVK(vk);
            if (!name) continue;
            const scanCode = KEYBOARD_MAPPING[name].scan;
            
            const ev: KeyboardEvent = {
              event: isDown ? "down" : "up",
              key: name,
              vk_code: vk,
              scan_code: scanCode,
            };
            this._emit(isDown ? "down" : "up", ev);
          }
        }
      }
      await Bun.sleep(interval);
    }
  }
}
