# @winput/overlay 🎨

[![npm](https://img.shields.io/npm/v/@winput/overlay.svg)](https://www.npmjs.com/package/@winput/overlay)

Transparent overlay window for on-screen drawing.

## Requirements

- **OS**: Windows 64-bit
- **Runtime**: [Bun](https://bun.sh) (npm not supported)

## Installation

```bash
bun add @winput/overlay
```

## Usage

```typescript
import { overlay, Pen, PenStyle } from "@winput/overlay";

overlay.show();
const pen = overlay.createPen({ color: { r: 255, g: 0, b: 0 }, width: 3 });

pen.drawLine(100, 100, 500, 100);
pen.drawRect(100, 200, 400, 300);
pen.drawFilledEllipse(300, 400, 100, 80);

overlay.update();
overlay.destroy();
```

## API

### overlay

| Method | Params | Returns | Description |
|--------|--------|---------|-------------|
| `show(options?)` | [`OverlayOptions`](#overlayoptions) | `void` | Show overlay |
| `hide()` | - | `void` | Hide overlay |
| `clear()` | - | `void` | Clear drawings |
| `update()` | - | `void` | Process messages |
| `destroy()` | - | `void` | Cleanup resources |
| `createPen(options, overlayOptions?)` | [`PenOptions`](#penoptions), [`OverlayOptions`](#overlayoptions) | [`Pen`](#pen) | Create pen |
| `getWindow()` | - | `OverlayWindow \| null` | Get window |
| `isInitialized()` | - | `boolean` | Check init state |

### Pen

All methods return [`Pen`](#pen) for chaining.

| Method | Params | Returns | Description |
|--------|--------|---------|-------------|
| `move(x, y)` | `number`, `number` | [`Pen`](#pen) | Move position |
| `down()` | - | [`Pen`](#pen) | Start drawing |
| `up()` | - | [`Pen`](#pen) | Stop drawing |
| `lineTo(x, y)` | `number`, `number` | [`Pen`](#pen) | Line to point |
| `drawLine(x1, y1, x2, y2)` | `number`×4 | [`Pen`](#pen) | Draw line |
| `drawRect(x, y, w, h)` | `number`×4 | [`Pen`](#pen) | Rectangle outline |
| `drawEllipse(x, y, w, h)` | `number`×4 | [`Pen`](#pen) | Ellipse outline |
| `drawFilledRect(x, y, w, h)` | `number`×4 | [`Pen`](#pen) | Filled rectangle |
| `drawFilledEllipse(x, y, w, h)` | `number`×4 | [`Pen`](#pen) | Filled ellipse |
| `setColor(color)` | [`RGB`](#rgb) | [`Pen`](#pen) | Set RGB color |
| `setWidth(width)` | `number` | [`Pen`](#pen) | Set line width |
| `getPosition()` | - | [`Point`](#point) | Get position |
| `destroy()` | - | `void` | Cleanup |

## Types

### PenOptions

```typescript
{
  color: RGB;
  width?: number;      // Default: 1
  style?: PenStyle;    // Default: SOLID
}
```

### OverlayOptions

```typescript
{
  transparent?: boolean;
  clickThrough?: boolean;
}
```

### RGB

```typescript
{ r: number; g: number; b: number }
```

### Point

```typescript
{ x: number; y: number }
```

### PenStyle

```typescript
enum PenStyle {
  SOLID = 0,
  DASH = 1,
  DOT = 2,
  DASHDOT = 3,
  DASHDOTDOT = 4
}
```

## Exports

| Export | Type | Description |
|--------|------|-------------|
| `overlay` | [`Overlay`](#overlay) | Singleton instance |
| `Pen` | [`Pen`](#pen) | Pen class |
| `PenStyle` | [`PenStyle`](#penstyle) | Line styles |

## License

[MIT](../../LICENSE)
