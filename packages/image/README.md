# @winput/image 🖼️

[![npm](https://img.shields.io/npm/v/@winput/image.svg)](https://www.npmjs.com/package/@winput/image)

Image loading, saving, and processing for Windows.

## Requirements

- **OS**: Windows 64-bit
- **Runtime**: [Bun](https://bun.sh) (npm not supported)

## Installation

```bash
bun add @winput/image
```

## Usage

```typescript
import { image, Image } from "@winput/image";

const img = await image.load("input.png");
await img?.grayscale().blur(2).edges().save("output.png");

// Drawing
img?.drawer().rectangle(10, 10, 100, 50).circle(200, 200, 50);

// OCR
const text = await img?.ocr().recognize();

// Display
img?.display().show("Preview");
```

## API

### image

| Method             | Params                                | Returns                                  | Description                               |
| ------------------ | ------------------------------------- | ---------------------------------------- | ----------------------------------------- |
| `load(path)`       | `string`                              | `Promise<`[`Image`](#image-1)` \| null>` | Load file ([formats](#supported-formats)) |
| `save(data, path)` | [`ImageData`](#image-1data), `string` | `Promise<boolean>`                       | Save ([formats](#supported-formats))      |
| `process(data)`    | [`ImageData`](#image-1data)           | [`Image`](#image-1)                      | Create processor                          |

---

### Image

All processing methods return [`Image`](#image-1) for chaining.

#### Transform

| Method               | Params   | Returns             | Description             |
| -------------------- | -------- | ------------------- | ----------------------- |
| `grayscale()`        | -        | [`Image`](#image-1) | Convert to grayscale    |
| `brightness(factor)` | `number` | [`Image`](#image-1) | Adjust brightness (0-∞) |
| `contrast(factor)`   | `number` | [`Image`](#image-1) | Adjust contrast (0-∞)   |
| `blur(radius?)`      | `number` | [`Image`](#image-1) | Gaussian blur           |
| `sharpen()`          | -        | [`Image`](#image-1) | Sharpen image           |
| `edges()`            | -        | [`Image`](#image-1) | Sobel edge detection    |
| `invert()`           | -        | [`Image`](#image-1) | Invert colors           |
| `sepia()`            | -        | [`Image`](#image-1) | Sepia tone effect       |
| `hue(degrees)`       | `number` | [`Image`](#image-1) | Shift hue (0-360)       |
| `saturate(factor)`   | `number` | [`Image`](#image-1) | Adjust saturation       |

#### Morphological

| Method                  | Params                                | Returns             | Description            |
| ----------------------- | ------------------------------------- | ------------------- | ---------------------- |
| `dilate(pixels?)`       | `number`                              | [`Image`](#image-1) | Expand bright regions  |
| `erode(pixels?)`        | `number`                              | [`Image`](#image-1) | Shrink bright regions  |
| `erode2dilate(pixels?)` | `number`                              | [`Image`](#image-1) | Opening (remove noise) |
| `dilate2erode(pixels?)` | `number`                              | [`Image`](#image-1) | Closing (fill holes)   |
| `denoise(strength?)`    | [`DenoiseStrength`](#denoisestrength) | [`Image`](#image-1) | Preset denoising       |

#### Geometry

| Method                     | Params                                        | Returns             | Description      |
| -------------------------- | --------------------------------------------- | ------------------- | ---------------- |
| `resize(w, h, algorithm?)` | `number`, `number`, [`Algorithm`](#algorithm) | [`Image`](#image-1) | Resize           |
| `crop(x, y, w, h)`         | `number`×4                                    | [`Image`](#image-1) | Crop region      |
| `rotate(degrees)`          | `number`                                      | [`Image`](#image-1) | Rotate clockwise |
| `flip(h?, v?)`             | `boolean`, `boolean`                          | [`Image`](#image-1) | Flip image       |

#### Threshold

| Method                          | Params   | Returns             | Description              |
| ------------------------------- | -------- | ------------------- | ------------------------ |
| `threshold(value?)`             | `number` | [`Image`](#image-1) | Binary threshold (0-255) |
| `adaptiveThreshold(blockSize?)` | `number` | [`Image`](#image-1) | Local adaptive           |

#### Filters

| Method                              | Params             | Returns             | Description              |
| ----------------------------------- | ------------------ | ------------------- | ------------------------ |
| `medianFilter(radius?)`             | `number`           | [`Image`](#image-1) | Remove salt/pepper noise |
| `bilateralFilter(spatial?, range?)` | `number`, `number` | [`Image`](#image-1) | Edge-preserving smooth   |

#### Analysis & Compositing

| Method                         | Params                                                 | Returns                   | Description        |
| ------------------------------ | ------------------------------------------------------ | ------------------------- | ------------------ |
| `histogram()`                  | -                                                      | [`Histogram`](#histogram) | Get RGB histograms |
| `autoLevel()`                  | -                                                      | [`Image`](#image-1)       | Auto-adjust levels |
| `overlay(img, x?, y?, alpha?)` | [`ImageData`](#image-1data), `number`×3                | [`Image`](#image-1)       | Overlay with alpha |
| `blend(img, mode?)`            | [`ImageData`](#image-1data), [`BlendMode`](#blendmode) | [`Image`](#image-1)       | Blend images       |

#### Output

| Method        | Params   | Returns             | Description     |
| ------------- | -------- | ------------------- | --------------- |
| `save(path?)` | `string` | `Promise<boolean>`  | Save to file    |
| `clone()`     | -        | [`Image`](#image-1) | Deep copy       |
| `toPixels()`  | -        | `[r,g,b,a][]`       | Get pixel array |

#### Sub-modules

| Method    | Params | Returns                           | Description      |
| --------- | ------ | --------------------------------- | ---------------- |
| `display` | -      | [`ImageDisplay`](#image-1display) | Window display   |
| `drawer`  | -      | [`ImageDrawer`](#image-1drawer)   | Draw shapes      |
| `ocr`     | -      | [`ImageOCR`](#image-1ocr)         | Text recognition |

---

### ImageDisplay

| Method                  | Params             | Returns                           | Description    |
| ----------------------- | ------------------ | --------------------------------- | -------------- |
| `show(name?, waitKey?)` | `string`, `number` | [`ImageDisplay`](#image-1display) | Show window    |
| `destroyWindow(name)`   | `string`           | [`ImageDisplay`](#image-1display) | Destroy window |
| `destroyAllWindows()`   | -                  | [`ImageDisplay`](#image-1display) | Destroy all    |

---

### ImageDrawer

All methods return [`ImageDrawer`](#image-1drawer) for chaining.

| Method                                 | Params                                                   | Returns                         | Description   |
| -------------------------------------- | -------------------------------------------------------- | ------------------------------- | ------------- |
| `rectangle(x, y, w, h, options?)`      | `number`×4, [`DrawOptions`](#drawoptions)                | [`ImageDrawer`](#image-1drawer) | Rectangle     |
| `circle(cx, cy, radius, options?)`     | `number`×3, [`DrawOptions`](#drawoptions)                | [`ImageDrawer`](#image-1drawer) | Circle        |
| `line(x1, y1, x2, y2, options?)`       | `number`×4, [`DrawOptions`](#drawoptions)                | [`ImageDrawer`](#image-1drawer) | Line          |
| `fillRect(x, y, w, h, color?)`         | `number`×4, [`RGB`](#rgb)                                | [`ImageDrawer`](#image-1drawer) | Filled rect   |
| `fillCircle(cx, cy, radius, color?)`   | `number`×3, [`RGB`](#rgb)                                | [`ImageDrawer`](#image-1drawer) | Filled circle |
| `ellipse(cx, cy, rx, ry, options?)`    | `number`×4, [`EllipseOptions`](#ellipseoptions)          | [`ImageDrawer`](#image-1drawer) | Ellipse       |
| `polygon(points, options?)`            | [`Point[]`](#point), [`PolygonOptions`](#polygonoptions) | [`ImageDrawer`](#image-1drawer) | Polygon       |
| `arrow(x1, y1, x2, y2, options?)`      | `number`×4, [`ArrowOptions`](#arrowoptions)              | [`ImageDrawer`](#image-1drawer) | Arrow         |
| `cross(cx, cy, size, options?)`        | `number`×3, [`DrawOptions`](#drawoptions)                | [`ImageDrawer`](#image-1drawer) | Cross/plus    |
| `arc(cx, cy, r, start, end, options?)` | `number`×5, [`DrawOptions`](#drawoptions)                | [`ImageDrawer`](#image-1drawer) | Arc           |
| `text(x, y, text, options?)`           | `number`×2, `string`, [`TextOptions`](#textoptions)      | [`ImageDrawer`](#image-1drawer) | Text          |

---

### ImageOCR

| Method                | Params                      | Returns                                        | Description     |
| --------------------- | --------------------------- | ---------------------------------------------- | --------------- |
| `recognize(options?)` | [`OCROptions`](#ocroptions) | `Promise<`[`OCRResult`](#ocrresult)` \| null>` | Perform OCR     |
| `terminate()`         | -                           | `Promise<void>`                                | Free resources  |
| `reinitialize(lang)`  | `string`                    | `Promise<void>`                                | Change language |

---

## Supported Formats

| Format | Extension       | Description                          |
| ------ | --------------- | ------------------------------------ |
| PNG    | `.png`          | Portable Network Graphics (lossless) |
| JPEG   | `.jpg`, `.jpeg` | JPEG (lossy compression)             |
| BMP    | `.bmp`          | Bitmap (uncompressed)                |
| WebP   | `.webp`         | Modern format                        |
| GIF    | `.gif`          | Limited colors                       |
| TIFF   | `.tiff`         | High quality                         |
| ICO    | `.ico`          | Icon format                          |
| HEIC   | `.heic`         | High Efficiency Image Container      |
| HEIF   | `.heif`         | High Efficiency Image Format         |
| AVIF   | `.avif`         | AV1 Image File Format                |
| SVG    | `.svg`          | Scalable Vector Graphics             |
| RAW    | `.raw`          | Raw image data                       |

---

## Types

### ImageData

```typescript
{
  width: number;
  height: number;
  buffer: Uint8Array;
}
```

### RGB

```typescript
{
  r: number;
  g: number;
  b: number;
}
```

### Point

```typescript
{
  x: number;
  y: number;
}
```

### Histogram

```typescript
{ r: number[]; g: number[]; b: number[] }
```

### DenoiseStrength

```typescript
type DenoiseStrength = "light" | "medium" | "heavy";
```

### Algorithm

```typescript
type Algorithm = "nearest" | "bilinear";
```

### BlendMode

```typescript
type BlendMode = "multiply" | "screen" | "overlay" | "add" | "subtract";
```

### DrawOptions

```typescript
{ color?: RGB; thickness?: number }
```

### EllipseOptions

```typescript
{ color?: RGB; thickness?: number; filled?: boolean }
```

### PolygonOptions

```typescript
{ color?: RGB; thickness?: number; filled?: boolean }
```

### ArrowOptions

```typescript
{ color?: RGB; thickness?: number; arrowSize?: number }
```

### TextOptions

```typescript
{ color?: RGB; scale?: number }
```

### OCROptions

```typescript
{ lang?: string }  // Default: "eng"
```

### OCRResult

```typescript
{
  text: string;
  confidence: number;
  words: Array<{ text: string; confidence: number; bbox: Rect }>;
}
```

## Exports

| Export      | Type                      | Description               |
| ----------- | ------------------------- | ------------------------- |
| `image`     | [`image`](#image)         | Main image operations     |
| `Image`     | [`Image`](#image-1)       | Chainable image processor |
| `ImageData` | [`ImageData`](#imagedata) | Image data structure      |

## License

[MIT](../../LICENSE)
