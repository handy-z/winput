# winput 🚀

[![npm](https://img.shields.io/npm/v/winput.svg)](https://www.npmjs.com/package/winput)

Windows automation library - keyboard, mouse, window, screen, image, and overlay control.

This is the meta-package that includes all `@winput/*` modules.

## Requirements

- **OS**: Windows 64-bit
- **Runtime**: [Bun](https://bun.sh) (Node.js not supported)

## Installation

```bash
bun add winput
```

## Usage

```typescript
import { keyboard, mouse, window, screen, image, overlay, utils } from "winput";

keyboard.write("Hello World!");
keyboard.hotkey(["ctrl", "s"]);

mouse.moveTo(500, 300);
mouse.click();

const notepad = window.findWindow("Notepad");
window.activate(notepad);

const pixel = screen.getPixel(100, 100);
const capture = screen.capture();

const img = await image.load("photo.png");
await img?.grayscale().blur(2).save("processed.png");

overlay.show();
const pen = overlay.createPen({ color: { r: 255, g: 0, b: 0 } });
pen.drawRect(100, 100, 200, 150);

const hex = utils.rgbToHex({ r: 255, g: 128, b: 0 });
```

## Packages

| Package                                                              | Description             |
| -------------------------------------------------------------------- | ----------------------- |
| [`@winput/keyboard`](https://www.npmjs.com/package/@winput/keyboard) | Keyboard automation     |
| [`@winput/mouse`](https://www.npmjs.com/package/@winput/mouse)       | Mouse automation        |
| [`@winput/window`](https://www.npmjs.com/package/@winput/window)     | Window management       |
| [`@winput/screen`](https://www.npmjs.com/package/@winput/screen)     | Screen capture & pixels |
| [`@winput/image`](https://www.npmjs.com/package/@winput/image)       | Image processing        |
| [`@winput/overlay`](https://www.npmjs.com/package/@winput/overlay)   | On-screen drawing       |
| [`@winput/utils`](https://www.npmjs.com/package/@winput/utils)       | Color & geometry utils  |

## Requirements

- **OS**: Windows 64-bit
- **Runtime**: [Bun](https://bun.sh)

## License

[MIT](../../LICENSE)
