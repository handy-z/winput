# @winput/utils 🛠️

[![npm](https://img.shields.io/npm/v/@winput/utils.svg)](https://www.npmjs.com/package/@winput/utils)

Color conversion and geometry utilities.

## Requirements

- **OS**: Windows 64-bit
- **Runtime**: [Bun](https://bun.sh) (Node.js not supported)

## Installation

```bash
bun add @winput/utils
```

## Usage

```typescript
import { utils } from "@winput/utils";

const hex = utils.rgbToHex({ r: 255, g: 128, b: 0 }); // "#FF8000"
const rgb = utils.hexToRgb("#FF8000"); // { r: 255, g: 128, b: 0 }

const similar = utils.isColorSimilar(
  { r: 255, g: 0, b: 0 },
  { r: 250, g: 10, b: 5 },
  20
); // true

const inside = utils.pointInRect(
  { x: 150, y: 150 },
  { left: 100, top: 100, right: 200, bottom: 200 }
); // true
```

## API

### utils

| Method                              | Params                                 | Returns       | Description        |
| ----------------------------------- | -------------------------------------- | ------------- | ------------------ |
| `rgbToHex(rgb)`                     | [`RGB`](#rgb)                          | `string`      | RGB to hex string  |
| `hexToRgb(hex)`                     | `string`                               | [`RGB`](#rgb) | Hex to RGB         |
| `rgbToHsv(r, g, b)`                 | `number`, `number`, `number`           | [`HSV`](#hsv) | RGB to HSV         |
| `hsvToRgb(h, s, v)`                 | `number`, `number`, `number`           | [`RGB`](#rgb) | HSV to RGB         |
| `colorDistance(c1, c2)`             | [`RGB`](#rgb), [`RGB`](#rgb)           | `number`      | Distance (0-441)   |
| `isColorSimilar(c1, c2, tolerance)` | [`RGB`](#rgb), [`RGB`](#rgb), `number` | `boolean`     | Check similarity   |
| `pointInRect(point, rect)`          | [`Point`](#point), [`Rect`](#rect)     | `boolean`     | Point in rectangle |

## Types

### RGB

```typescript
{
  r: number;
  g: number;
  b: number;
}
```

### HSV

```typescript
{
  h: number;
  s: number;
  v: number;
}
```

### Point

```typescript
{
  x: number;
  y: number;
}
```

### Rect

```typescript
{
  left: number;
  top: number;
  right: number;
  bottom: number;
}
```

## Exports

| Export  | Type              | Description            |
| ------- | ----------------- | ---------------------- |
| `utils` | [`Utils`](#utils) | Main utility functions |
| `RGB`   | [`RGB`](#rgb)     | RGB color structure    |
| `HSV`   | [`HSV`](#hsv)     | HSV color structure    |

## License

[MIT](../../LICENSE)
