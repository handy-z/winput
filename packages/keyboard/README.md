# @winput/keyboard ⌨️

[![npm](https://img.shields.io/npm/v/@winput/keyboard.svg)](https://www.npmjs.com/package/@winput/keyboard)

Keyboard automation for Windows - simulate keystrokes, hotkeys, and monitor key states.

## Requirements

- **OS**: Windows 64-bit
- **Runtime**: [Bun](https://bun.sh) (Node.js not supported)

## Installation

```bash
bun add @winput/keyboard
```

## Usage

```typescript
import { keyboard, VK_CODES, KEYBOARD_MAPPING } from "@winput/keyboard";

keyboard.write("Hello World!");
keyboard.hotkey(["ctrl", "s"]);

keyboard.listener.on.down((e) => {
  console.log(`Key: ${e.key}, VK: ${e.vk_code}`);
});
keyboard.listener.start();
```

## API

### keyboard

| Method | Params | Returns | Description |
|--------|--------|---------|-------------|
| `press(key)` | [`KeyName`](#keyname) | [`Keyboard`](#keyboard) | Press and hold a key |
| `release(key)` | [`KeyName`](#keyname) | [`Keyboard`](#keyboard) | Release a held key |
| `tap(key)` | [`KeyName`](#keyname) | [`Keyboard`](#keyboard) | Press and release a key |
| `repeatTap(key, count?, delay?)` | [`KeyName`](#keyname), `number`, `number` | [`Keyboard`](#keyboard) | Tap multiple times |
| `write(text, delay?)` | `string`, `number` | [`Keyboard`](#keyboard) | Type characters |
| `hotkey(keys)` | [`KeyName[]`](#keyname) | [`Keyboard`](#keyboard) | Keyboard shortcut |
| `hold(key, duration)` | [`KeyName`](#keyname), `number` | [`Keyboard`](#keyboard) | Hold for duration |
| `isPressed(key)` | [`KeyName`](#keyname) | `boolean` | Check if pressed |
| `isAnyPressed(keys)` | [`KeyName[]`](#keyname) | `boolean` | Any key pressed |
| `areAllPressed(keys)` | [`KeyName[]`](#keyname) | `boolean` | All keys pressed |
| `waitForPress(key, timeout?)` | [`KeyName`](#keyname), `number` | `Promise<boolean>` | Wait for press |
| `waitForRelease(key, timeout?)` | [`KeyName`](#keyname), `number` | `Promise<boolean>` | Wait for release |
| `toggleKey(key)` | [`KeyName`](#keyname) | [`Keyboard`](#keyboard) | Toggle lock keys |
| `getKeyState(key)` | [`KeyName`](#keyname) | [`KeyState`](#keystate) | Get key state |
| `releaseAll()` | - | [`Keyboard`](#keyboard) | Release all keys |
| `listener` | - | [`Listener`](#listener) | Event listener |

### Listener

| Method | Params | Returns | Description |
|--------|--------|---------|-------------|
| `on.down(handler)` | [`KeyHandler`](#keyhandler) | `void` | Key pressed |
| `on.up(handler)` | [`KeyHandler`](#keyhandler) | `void` | Key released |
| `once.down(handler)` | [`KeyHandler`](#keyhandler) | `void` | One-time press |
| `off.down(handler)` | [`KeyHandler`](#keyhandler) | `void` | Remove handler |
| `start()` | - | `void` | Start listening |
| `stop()` | - | `void` | Stop listening |

## Types

### KeyName

```typescript
type KeyName = "a" | "b" | ... | "ctrl" | "shift" | "alt" | "enter" | "space" | ...
```

### KeyState

```typescript
{
  isPressed: boolean;  // Key is held down
  isToggled: boolean;  // Lock key is on
}
```

### KeyboardEvent

```typescript
{
  event: string;      // "keydown" | "keyup"
  key: string;        // Key name
  vk_code: number;    // Virtual key code
  scan_code: number;  // Scan code
}
```

### KeyHandler

```typescript
type KeyHandler = (event: KeyboardEvent) => void
```

## Exports

| Export | Type | Description |
|--------|------|-------------|
| `keyboard` | [`Keyboard`](#keyboard) | Main keyboard operations |
| `VK_CODES` | `object` | Virtual key code constants |
| `KEYBOARD_MAPPING` | `object` | Key definitions |
| `KeyName` | [`KeyName`](#keyname) | Valid key names |

## License

[MIT](../../LICENSE)
