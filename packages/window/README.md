# @winput/window 🪟

[![npm](https://img.shields.io/npm/v/@winput/window.svg)](https://www.npmjs.com/package/@winput/window)

Window management for Windows - find, move, resize, and manipulate windows.

## Requirements

- **OS**: Windows 64-bit
- **Runtime**: [Bun](https://bun.sh) (npm not supported)

## Installation

```bash
bun add @winput/window
```

## Usage

```typescript
import { window } from "@winput/window";

const notepad = window.findWindow("Notepad");
if (notepad) {
  window.activate(notepad);
  window.center(notepad);
  window.setOpacity(notepad, 0.8);
}

const windows = window.enumWindows();
windows.forEach(w => console.log(w.title));
```

## API

### window

#### Discovery

| Method | Params | Returns | Description |
|--------|--------|---------|-------------|
| `getActiveWindow()` | - | [`WindowInfo`](#windowinfo)` \| null` | Get focused window |
| `findWindow(title)` | `string` | [`HWND`](#hwnd)` \| null` | Find by title |
| `waitForWindow(title, timeout?)` | `string`, `number` | `Promise<`[`HWND`](#hwnd)` \| null>` | Wait for window |
| `waitForWindowClose(hwnd, timeout?)` | [`HWND`](#hwnd), `number` | `Promise<boolean>` | Wait for close |
| `enumWindows()` | - | [`WindowInfo[]`](#windowinfo) | List visible windows |
| `enumChildWindows(parent)` | [`HWND`](#hwnd) | [`WindowInfo[]`](#windowinfo) | List children |
| `getList()` | - | [`HWND[]`](#hwnd) | Get all HWNDs |
| `getCount()` | - | `number` | Count windows |

#### Properties

| Method | Params | Returns | Description |
|--------|--------|---------|-------------|
| `getWindowTitle(hwnd)` | [`HWND`](#hwnd) | `string` | Get title |
| `getWindowRect(hwnd)` | [`HWND`](#hwnd) | [`Rect`](#rect) | Get bounds |
| `getClientRect(hwnd)` | [`HWND`](#hwnd) | [`Rect`](#rect) | Get client area |
| `getWindowSize(hwnd)` | [`HWND`](#hwnd) | [`Size`](#size) | Get size |
| `getClientSize(hwnd)` | [`HWND`](#hwnd) | [`Size`](#size) | Get client size |
| `getClassName(hwnd)` | [`HWND`](#hwnd) | `string` | Get class name |
| `getWindowProcessId(hwnd)` | [`HWND`](#hwnd) | `number` | Get PID |
| `getProcessPath(hwnd)` | [`HWND`](#hwnd) | `string` | Get exe path |
| `getProcessName(hwnd)` | [`HWND`](#hwnd) | `string` | Get exe name |
| `getExtendedWindowInfo(hwnd)` | [`HWND`](#hwnd) | [`ExtendedInfo`](#extendedinfo) | Detailed info |
| `getText(hwnd)` | [`HWND`](#hwnd) | `string` | All window text |

#### State

| Method | Params | Returns | Description |
|--------|--------|---------|-------------|
| `isWindow(hwnd)` | [`HWND`](#hwnd) | `boolean` | Handle valid |
| `isWindowVisible(hwnd)` | [`HWND`](#hwnd) | `boolean` | Is visible |
| `isWindowMinimized(hwnd)` | [`HWND`](#hwnd) | `boolean` | Is minimized |
| `isWindowMaximized(hwnd)` | [`HWND`](#hwnd) | `boolean` | Is maximized |
| `getMinMax(hwnd)` | [`HWND`](#hwnd) | `-1 \| 0 \| 1` | Min/Normal/Max |
| `getStyle(hwnd)` | [`HWND`](#hwnd) | `number` | Style flags |
| `getExStyle(hwnd)` | [`HWND`](#hwnd) | `number` | Extended style |

#### Actions

| Method | Params | Returns | Description |
|--------|--------|---------|-------------|
| `activate(hwnd)` | [`HWND`](#hwnd) | `boolean` | Focus and restore |
| `focusWindow(hwnd)` | [`HWND`](#hwnd) | `boolean` | Bring to front |
| `showWindow(hwnd)` | [`HWND`](#hwnd) | `boolean` | Show window |
| `hideWindow(hwnd)` | [`HWND`](#hwnd) | `boolean` | Hide window |
| `minimizeWindow(hwnd)` | [`HWND`](#hwnd) | `boolean` | Minimize |
| `maximizeWindow(hwnd)` | [`HWND`](#hwnd) | `boolean` | Maximize |
| `restoreWindow(hwnd)` | [`HWND`](#hwnd) | `boolean` | Restore |
| `closeWindow(hwnd)` | [`HWND`](#hwnd) | `boolean` | Close |
| `kill(hwnd)` | [`HWND`](#hwnd) | `boolean` | Force kill |
| `flashWindow(hwnd)` | [`HWND`](#hwnd) | `boolean` | Flash taskbar |
| `minimizeAll()` | - | `void` | Minimize all |

#### Manipulation

| Method | Params | Returns | Description |
|--------|--------|---------|-------------|
| `moveWindow(hwnd, x, y, w, h)` | [`HWND`](#hwnd), `number`×4 | `boolean` | Move/resize |
| `center(hwnd)` | [`HWND`](#hwnd) | `boolean` | Center on screen |
| `setOpacity(hwnd, opacity)` | [`HWND`](#hwnd), `number` | `boolean` | Set transparency |
| `setTopmost(hwnd, enable)` | [`HWND`](#hwnd), `boolean` | `boolean` | Always on top |
| `setEnabled(hwnd, enabled)` | [`HWND`](#hwnd), `boolean` | `boolean` | Enable/disable |
| `setTitle(hwnd, title)` | [`HWND`](#hwnd), `string` | `boolean` | Change title |
| `moveToTop(hwnd)` | [`HWND`](#hwnd) | `boolean` | Top Z-order |
| `moveToBottom(hwnd)` | [`HWND`](#hwnd) | `boolean` | Bottom Z-order |
| `redraw(hwnd)` | [`HWND`](#hwnd) | `boolean` | Force repaint |

#### Coordinates

| Method | Params | Returns | Description |
|--------|--------|---------|-------------|
| `clientToScreen(hwnd, x, y)` | [`HWND`](#hwnd), `number`, `number` | [`Point`](#point) | Client → screen |
| `screenToClient(hwnd, x, y)` | [`HWND`](#hwnd), `number`, `number` | [`Point`](#point) | Screen → client |

#### Wait

| Method | Params | Returns | Description |
|--------|--------|---------|-------------|
| `waitActive(hwnd, timeout?)` | [`HWND`](#hwnd), `number` | `Promise<boolean>` | Wait active |
| `waitNotActive(hwnd, timeout?)` | [`HWND`](#hwnd), `number` | `Promise<boolean>` | Wait inactive |

#### Regions

| Method | Params | Returns | Description |
|--------|--------|---------|-------------|
| `setRegion.rect(hwnd, x, y, w, h)` | [`HWND`](#hwnd), `number`×4 | `boolean` | Rectangle |
| `setRegion.ellipse(hwnd, x, y, w, h)` | [`HWND`](#hwnd), `number`×4 | `boolean` | Ellipse |
| `setRegion.round(hwnd, x, y, w, h, rw, rh)` | [`HWND`](#hwnd), `number`×6 | `boolean` | Rounded rect |
| `setRegion.polygon(hwnd, points)` | [`HWND`](#hwnd), [`Point[]`](#point) | `boolean` | Polygon |
| `setRegion.reset(hwnd)` | [`HWND`](#hwnd) | `boolean` | Reset |

## Types

### HWND

```typescript
type HWND = number  // Window handle
```

### WindowInfo

```typescript
{
  hwnd: number;
  title: string;
  rect: Rect;
  className: string;
  processId: number;
}
```

### Rect

```typescript
{ left: number; top: number; right: number; bottom: number }
```

### Size

```typescript
{ width: number; height: number }
```

### Point

```typescript
{ x: number; y: number }
```

### ExtendedInfo

```typescript
{
  hwnd: number;
  title: string;
  className: string;
  processId: number;
  processName: string;
  rect: Rect;
  clientRect: Rect;
  isVisible: boolean;
  isMinimized: boolean;
  isMaximized: boolean;
}
```

## Exports

| Export | Type | Description |
|--------|------|-------------|
| `window` | [`Window`](#window) | Main window operations |
| `WindowInfo` | [`WindowInfo`](#windowinfo) | Window information |
| `Rect` | [`Rect`](#rect) | Rectangle bounds |

## License

[MIT](../../LICENSE)
