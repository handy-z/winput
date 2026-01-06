import { KEYBOARD_MAPPING } from "../mapping";

export type KeyboardDownEvent = {
  event: "down";
  key: keyof typeof KEYBOARD_MAPPING;
  vk_code: number;
  scan_code: number;
};

export type KeyboardUpEvent = {
  event: "up";
  key: keyof typeof KEYBOARD_MAPPING;
  vk_code: number;
  scan_code: number;
};

export type KeyboardEvent = KeyboardDownEvent | KeyboardUpEvent;

export type KeyboardEvents = {
  down: KeyboardDownEvent;
  up: KeyboardUpEvent;
};

export type KeyboardCallback = (ev: KeyboardEvent) => void;
