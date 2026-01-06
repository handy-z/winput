# winput 🚀

[![GitHub release](https://img.shields.io/github/v/tag/handy-z/winput?label=release)](https://github.com/handy-z/winput/releases)
[![npm version](https://img.shields.io/npm/v/winput.svg)](https://www.npmjs.com/package/winput)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Bun](https://img.shields.io/badge/Bun-%23000000.svg?style=flat&logo=bun&logoColor=white)](https://bun.sh)
[![Windows](https://img.shields.io/badge/Windows-0078D6?style=flat&logo=windows&logoColor=white)](https://www.microsoft.com/windows)

> **winput** is a powerful Windows automation library for TypeScript and JavaScript / Bun, providing low-level access to keyboard, mouse, window, and screen controls via the Windows API.

## Table of Contents

- [Features](#features-)
- [Requirements](#requirements-)
- [Installation](#installation-)
- [Packages](#packages-)
- [Quick Start](#quick-start-)
- [Contributing](#contributing-)
- [License](#license-)
- [Disclaimer](#disclaimer-)

## Features ✨

- ⌨️ **Keyboard Control**: Simulate keystrokes, combinations (hotkeys), type text, and monitor key states.
- 🖱️ **Mouse Control**: Move cursor, click, drag, scroll, and smooth movements.
- 🎣 **Input Hooks**: Global low-level keyboard and mouse hooks to listen for events even when your app is in the background.
- 🪟 **Window Management**: Find, activate, move, resize, hide/show, and manipulate windows.
- 🖥️ **Screen Analysis**: Capture screen, read pixel colors, search for pixels, and find images on the screen.
- 🖼️ **Image Processing**: Load, save, and process images (blur, sharpen, edges, etc.).
- 🎨 **Overlay Drawing**: Create transparent overlay windows for on-screen drawing.
- ⚡ **Performance**: Built with native Windows API calls for minimal latency.

## Requirements 📋

- **Operating System**: Windows 64-bit
- **Runtime**: [Bun](https://bun.sh) (npm not supported)

## Installation 📦

### Install All Packages (Recommended)

```bash
bun add winput
```

### Install Individual Packages

```bash
# Install only what you need
bun add @winput/keyboard   # Keyboard automation
bun add @winput/mouse      # Mouse automation
bun add @winput/window     # Window management
bun add @winput/screen     # Screen capture & pixel operations
bun add @winput/image      # Image processing
bun add @winput/overlay    # On-screen overlay drawing
bun add @winput/utils      # Color & geometry utilities
```

## Packages 📦

| Package | npm | Description |
|---------|-----|-------------|
| [`winput`](packages/winput) | [![npm](https://img.shields.io/npm/v/winput.svg)](https://www.npmjs.com/package/winput) | Meta-package - all modules |
| [`@winput/keyboard`](packages/keyboard) | [![npm](https://img.shields.io/npm/v/@winput/keyboard.svg)](https://www.npmjs.com/package/@winput/keyboard) | Keyboard automation |
| [`@winput/mouse`](packages/mouse) | [![npm](https://img.shields.io/npm/v/@winput/mouse.svg)](https://www.npmjs.com/package/@winput/mouse) | Mouse automation |
| [`@winput/window`](packages/window) | [![npm](https://img.shields.io/npm/v/@winput/window.svg)](https://www.npmjs.com/package/@winput/window) | Window management |
| [`@winput/screen`](packages/screen) | [![npm](https://img.shields.io/npm/v/@winput/screen.svg)](https://www.npmjs.com/package/@winput/screen) | Screen capture & pixels |
| [`@winput/image`](packages/image) | [![npm](https://img.shields.io/npm/v/@winput/image.svg)](https://www.npmjs.com/package/@winput/image) | Image processing |
| [`@winput/overlay`](packages/overlay) | [![npm](https://img.shields.io/npm/v/@winput/overlay.svg)](https://www.npmjs.com/package/@winput/overlay) | Overlay drawing |
| [`@winput/utils`](packages/utils) | [![npm](https://img.shields.io/npm/v/@winput/utils.svg)](https://www.npmjs.com/package/@winput/utils) | Color & geometry utils |

## Quick Start ⚡

### Using winput (All-in-One)

```typescript
import { keyboard, mouse, window, image } from "winput";

// Keyboard
keyboard.write("Hello World!");
keyboard.hotkey(["ctrl", "s"]); // Save

// Mouse
mouse.moveTo(500, 500); // Move to coordinates
mouse.click("left"); // Left click
mouse.scroll(10); // Scroll up

// Window
const notepad = window.findWindow("Notepad");
if (notepad) {
  window.activate(notepad);
}

// Image Processing
const img = await image.load("screenshot.png");
if (img) {
  img.grayscale().blur(2).save("processed.png");
}
```

### Using Individual Packages

```typescript
// Import only what you need for smaller bundles
import { keyboard } from "@winput/keyboard";
import { mouse } from "@winput/mouse";
import { screen } from "@winput/screen";

keyboard.write("Hello!");
mouse.click();
const size = screen.getScreenSize();
console.log(`Screen: ${size.width}x${size.height}`);
```

### Event Listeners (Hooks)

```typescript
import { keyboard, mouse } from "winput";

// Listen for key presses
keyboard.listener.on.down((e) => {
  console.log(`Key pressed: ${e.key} (${e.vk_code})`);
  if (e.key === "escape") process.exit(0);
});

// Listen for mouse clicks
mouse.listener.on.down((e) => {
  console.log(`Mouse button ${e.button} at ${e.x}, ${e.y}`);
});

// Start listening
keyboard.listener.start();
mouse.listener.start();
```

### Advanced Examples

```typescript
import { screen, image, window } from "winput";

// Screen capture with image processing
const captured = screen.capture(0, 0, 800, 600);
if (captured) {
  const processed = image.process(captured);
  processed.grayscale().edges().save("edges.png");
}

// Multi-monitor information
const monitors = screen.getMonitors();
monitors.forEach((monitor, i) => {
  const width = monitor.rect.right - monitor.rect.left;
  const height = monitor.rect.bottom - monitor.rect.top;
  console.log(`Monitor ${i + 1}: ${monitor.deviceName}`);
  console.log(`  Resolution: ${width}x${height}`);
  console.log(`  Primary: ${monitor.isPrimary}`);
});

// Window manipulation with transparency
const notepad = window.findWindow("Notepad");
if (notepad) {
  window.setOpacity(notepad, 0.8);
  window.setTopmost(notepad, true);
  window.center(notepad);
}
```

## Contributing 🤝

Contributions are welcome! Please follow these steps:

1. Fork the repository.
2. Create your feature branch (`git checkout -b feature/NewFeature`).
3. Commit your changes (`git commit -m 'Add some NewFeature'`).
4. Push to the branch (`git push origin feature/NewFeature`).
5. Open a Pull Request.

## License 📄

Distributed under the MIT License. See [LICENSE](LICENSE) for more information.

## Disclaimer ⚠️

This library is intended for automation, testing, and availability purposes. Please use responsibly.
