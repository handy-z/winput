# @winput/mouse 🖱️

[![npm](https://img.shields.io/npm/v/@winput/mouse.svg)](https://www.npmjs.com/package/@winput/mouse)

Mouse automation for Windows - move, click, drag, scroll, and monitor mouse state.

## Requirements

- **OS**: Windows 64-bit
- **Runtime**: [Bun](https://bun.sh) (Node.js not supported)

## Installation

```bash
bun add @winput/mouse
```

## Usage

```typescript
import { mouse, LEFT, RIGHT, MIDDLE } from "@winput/mouse";

mouse.moveTo(500, 300);
mouse.click();
await mouse.smoothMoveTo(1000, 500, 0.5, "easeOutQuad");

mouse.listener.on.down((e) => console.log(e.button));
mouse.listener.start();
```

## API

### mouse

| Method                                        | Params                                                      | Returns                 | Description        |
| --------------------------------------------- | ----------------------------------------------------------- | ----------------------- | ------------------ |
| `position`                                    | -                                                           | [`Position`](#position) | Cursor coordinates |
| `moveTo(x, y, relative?)`                     | `number`, `number`, `boolean`                               | [`Mouse`](#mouse)       | Move to position   |
| `moveRel(dx, dy)`                             | `number`, `number`                                          | [`Mouse`](#mouse)       | Move relative      |
| `smoothMoveTo(x, y, duration?, easing?)`      | `number`, `number`, `number`, [`Easing`](#easing)           | `Promise<Mouse>`        | Animated move      |
| `click(button?, repeat?, delay?)`             | [`MouseButton`](#mousebutton), `number`, `number`           | [`Mouse`](#mouse)       | Click button       |
| `clickAt(x, y, button?)`                      | `number`, `number`, [`MouseButton`](#mousebutton)           | [`Mouse`](#mouse)       | Move and click     |
| `press(button)`                               | [`MouseButton`](#mousebutton)                               | [`Mouse`](#mouse)       | Press button       |
| `release(button)`                             | [`MouseButton`](#mousebutton)                               | [`Mouse`](#mouse)       | Release button     |
| `hold(button, duration)`                      | [`MouseButton`](#mousebutton), `number`                     | [`Mouse`](#mouse)       | Hold button        |
| `dragTo(x, y, button?, duration?)`            | `number`, `number`, [`MouseButton`](#mousebutton), `number` | [`Mouse`](#mouse)       | Drag to position   |
| `dragRel(dx, dy, button?, duration?)`         | `number`, `number`, [`MouseButton`](#mousebutton), `number` | [`Mouse`](#mouse)       | Drag relative      |
| `scroll(clicks, direction?)`                  | `number`, [`Direction`](#direction)                         | [`Mouse`](#mouse)       | Scroll wheel       |
| `isPressed(button)`                           | [`MouseButton`](#mousebutton)                               | `boolean`               | Check state        |
| `isAtPosition(x, y, tolerance?)`              | `number`, `number`, `number`                                | `boolean`               | Check position     |
| `waitForPosition(x, y, timeout?, tolerance?)` | `number`, `number`, `number`, `number`                      | `Promise<boolean>`      | Wait for pos       |
| `waitForPress(button, timeout?)`              | [`MouseButton`](#mousebutton), `number`                     | `Promise<boolean>`      | Wait for press     |
| `waitForRelease(button, timeout?)`            | [`MouseButton`](#mousebutton), `number`                     | `Promise<boolean>`      | Wait for release   |
| `listener`                                    | -                                                           | [`Listener`](#listener) | Event listener     |

### Listener

| Method             | Params                          | Returns | Description     |
| ------------------ | ------------------------------- | ------- | --------------- |
| `on.move(handler)` | [`MouseHandler`](#mousehandler) | `void`  | Mouse moved     |
| `on.down(handler)` | [`MouseHandler`](#mousehandler) | `void`  | Button pressed  |
| `on.up(handler)`   | [`MouseHandler`](#mousehandler) | `void`  | Button released |
| `start()`          | -                               | `void`  | Start listening |
| `stop()`           | -                               | `void`  | Stop listening  |

## Types

### Position

```typescript
{
  x: number;
  y: number;
}
```

### MouseButton

```typescript
type MouseButton = "left" | "right" | "middle" | "x1" | "x2";
```

### Direction

```typescript
type Direction = "vertical" | "horizontal";
```

### Easing

```typescript
type Easing =
  | "linear"
  | "easeInQuad"
  | "easeOutQuad"
  | "easeInOutQuad"
  | "easeInCubic"
  | "easeOutCubic"
  | "easeInOutCubic";
```

### MouseEvent

```typescript
{
  x: number;
  y: number;
  button: MouseButton;
  event: string;
}
```

### MouseHandler

```typescript
type MouseHandler = (event: MouseEvent) => void;
```

## Exports

| Export                    | Type                          | Description           |
| ------------------------- | ----------------------------- | --------------------- |
| `mouse`                   | [`Mouse`](#mouse)             | Main mouse operations |
| `LEFT`, `RIGHT`, `MIDDLE` | [`MouseButton`](#mousebutton) | Button constants      |
| `X1`, `X2`                | [`MouseButton`](#mousebutton) | Extended buttons      |

## License

[MIT](../../LICENSE)
