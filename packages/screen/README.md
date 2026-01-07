# @winput/screen 🖥️

[![npm](https://img.shields.io/npm/v/@winput/screen.svg)](https://www.npmjs.com/package/@winput/screen)

Screen capture and pixel analysis for Windows.

## Requirements

- **OS**: Windows 64-bit
- **Runtime**: [Bun](https://bun.sh) (Node.js not supported)

## Installation

```bash
bun add @winput/screen
```

## Usage

```typescript
import { screen } from "@winput/screen";

const size = screen.getScreenSize();
const pixel = screen.getPixel(500, 300);
const capture = screen.capture(0, 0, 800, 600);

const text = await screen.recognizeText(100, 100, 400, 200);
console.log(text?.text);
```

## API

### screen

| Method | Params | Returns | Description |
|--------|--------|---------|-------------|
| `getScreenSize()` | - | [`Size`](#size) | Primary monitor size |
| `getMonitors()` | - | [`MonitorInfo[]`](#monitorinfo) | All monitor info |
| `capture(x?, y?, w?, h?)` | `number`, `number`, `number`, `number` | [`ImageData`](#imagedata)` \| null` | Capture region |
| `getPixel(x, y)` | `number`, `number` | [`Pixel`](#pixel)` \| null` | Get pixel color |
| `checkPixel(x, y, color, tolerance?)` | `number`, `number`, [`RGB`](#rgb), `number` | `boolean` | Check pixel match |
| `waitForPixel(x, y, color, tolerance?, timeout?)` | `number`, `number`, [`RGB`](#rgb), `number`, `number` | `Promise<boolean>` | Wait for color |
| `getMultiplePixels(positions)` | [`Position[]`](#position) | [`RGB[]`](#rgb) | Get multiple colors |
| `checkMultiplePixels(checks)` | [`PixelCheck[]`](#pixelcheck) | `boolean` | Check multiple |
| `waitForAnyPixel(checks, timeout?)` | [`PixelCheck[]`](#pixelcheck), `number` | `Promise<boolean>` | Wait any match |
| `pixelSearch(x1, y1, x2, y2, color, tolerance?)` | `number`×4, [`RGB`](#rgb), `number` | [`Point`](#point)` \| null` | Find color |
| `imageSearch(x1, y1, x2, y2, image, tolerance?)` | `number`×4, `string`, `number` | `Promise<`[`Point`](#point)` \| null>` | Find image |
| `recognizeText(x, y, w, h, options?)` | `number`×4, [`OCROptions`](#ocroptions) | `Promise<`[`OCRResult`](#ocrresult)` \| null>` | OCR extract |

## Types

### Size

```typescript
{ width: number; height: number }
```

### Point

```typescript
{ x: number; y: number }
```

### Position

```typescript
{ x: number; y: number }
```

### RGB

```typescript
{ r: number; g: number; b: number }
```

### Pixel

```typescript
{
  x: number; y: number;
  r: number; g: number; b: number;
  isEqual(color: RGB): boolean;
  isSimilar(color: RGB, tolerance: number): boolean;
  toHex(): string;
}
```

### PixelCheck

```typescript
{ x: number; y: number; color: RGB; tolerance?: number }
```

### ImageData

```typescript
{ width: number; height: number; buffer: Uint8Array }
```

### MonitorInfo

```typescript
{
  deviceName: string;
  rect: Rect;
  workArea: Rect;
  isPrimary: boolean;
}
```

### OCRResult

```typescript
{
  text: string;
  confidence: number;
  words: Array<{ text: string; confidence: number; bbox: Rect }>;
}
```

### OCROptions

```typescript
{ lang?: string }  // Default: "eng"
```

## Exports

| Export | Type | Description |
|--------|------|-------------|
| `screen` | [`Screen`](#screen) | Main screen operations |
| `Pixel` | [`Pixel`](#pixel) | Pixel with utility methods |

## License

[MIT](../../LICENSE)
