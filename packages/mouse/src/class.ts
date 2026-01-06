import { getPosition } from "./core";
import * as actions from "./actions";
import { Listener } from "./listener";

class Mouse {
  /**
   * Get the current mouse cursor position.
   * @returns {{ x: number, y: number }} Current cursor coordinates
   */
  get position(): { x: number; y: number; } {
    return getPosition();
  }

  /**
   * Press and hold a mouse button down.
   * @param button - Button to press ("left", "right", "middle", "x1", "x2") (default: "left")
   * @returns {Mouse} Returns mouse instance for method chaining
   * @throws {Error} If button name is invalid
   * @example
   * mouse.press("left").moveTo(500, 300).release("left")
   */
  press = actions.press;

  /**
   * Release a held mouse button.
   * @param button - Button to release ("left", "right", "middle", "x1", "x2") (default: "left")
   * @returns {Mouse} Returns mouse instance for method chaining
   * @throws {Error} If button name is invalid
   * @example
   * mouse.press("right").moveTo(800, 600).release("right")
   */
  release = actions.release;

  /**
   * Click a mouse button (press and release).
   * @param button - Button to click ("left", "right", "middle") (default: "left")
   * @param repeat - Number of times to click (default: 1, use 2 for double-click, must be >= 1)
   * @param delay - Delay between clicks in seconds (default: 0, must be >= 0)
   * @returns {Mouse} Returns mouse instance for method chaining
   * @throws {Error} If parameters are out of bounds
   * @example
   * mouse.click() // Single left click
   * mouse.click("right") // Right click
   * mouse.click("left", 2) // Double click
   * mouse.click("left", 3, 0.5) // Triple click with 500ms delay
   */
  click = actions.click;

  /**
   * Move the mouse cursor to absolute screen coordinates.
   * @param x - Target X coordinate (optional, keeps current if undefined)
   * @param y - Target Y coordinate (optional, keeps current if undefined)
   * @param relative - If true, treats coordinates as relative offset (default: false)
   * @returns {Mouse} Returns mouse instance for method chaining
   * @throws {Error} If coordinates are invalid or out of bounds
   * @example
   * mouse.moveTo(500, 300) // Move to absolute position
   * mouse.moveTo(100, 50, true) // Move 100px right, 50px down (relative)
   */
  moveTo = actions.moveTo;

  /**
   * Move the mouse cursor relative to its current position.
   * @param xOffset - Horizontal offset in pixels (default: 0)
   * @param yOffset - Vertical offset in pixels (default: 0)
   * @param relative - If true, uses raw relative movement (default: false)
   * @returns {Mouse} Returns mouse instance for method chaining
   * @example
   * mouse.moveRel(50, -30) // Move 50px right, 30px up from current position
   */
  moveRel = actions.moveRel;

  /**
   * Check if a mouse button is currently pressed down.
   * @param button - Button to check ("left", "right", "middle", "x1", "x2")
   * @returns {boolean} True if the button is currently held down, false otherwise
   * @throws {Error} If button name is invalid
   * @example
   * if (mouse.isPressed("left")) {
   *   console.log("Left button is held down");
   * }
   */
  isPressed = actions.isPressed;

  /**
   * Drag to absolute coordinates (press, move, release).
   * @param x - Target X coordinate
   * @param y - Target Y coordinate
   * @param button - Button to drag with ("left", "right", "middle") (default: "left")
   * @param duration - Duration of drag animation in seconds (default: 0.5, must be >= 0)
   * @returns {Mouse} Returns mouse instance for method chaining
   * @throws {Error} If coordinates are invalid or duration is negative
   * @example
   * mouse.dragTo(800, 600, "left", 1.0) // Drag to position over 1 second
   */
  dragTo = actions.dragTo;

  /**
   * Drag relative to current position (press, move by offset, release).
   * @param xOffset - Horizontal drag offset in pixels
   * @param yOffset - Vertical drag offset in pixels
   * @param button - Button to drag with ("left", "right", "middle") (default: "left")
   * @param duration - Duration of drag animation in seconds (default: 0.5, must be >= 0)
   * @returns {Mouse} Returns mouse instance for method chaining
   * @throws {Error} If duration is negative
   * @example
   * mouse.dragRel(100, -50, "left", 0.5) // Drag 100px right, 50px up
   */
  dragRel = actions.dragRel;

  /**
   * Scroll the mouse wheel.
   * @param clicks - Number of scroll clicks (positive = up/right, negative = down/left)
   * @param direction - Scroll direction ("vertical" or "horizontal") (default: "vertical")
   * @returns {Mouse} Returns mouse instance for method chaining
   * @example
   * mouse.scroll(5) // Scroll up 5 clicks
   * mouse.scroll(-3, "vertical") // Scroll down 3 clicks
   * mouse.scroll(2, "horizontal") // Scroll right 2 clicks
   */
  scroll = actions.scroll;

  /**
   * Move the mouse cursor smoothly with easing animation.
   * @param x - Target X coordinate
   * @param y - Target Y coordinate
   * @param duration - Duration of animation in seconds (default: 0.5, must be >= 0)
   * @param easing - Easing function: "linear", "easeInQuad", "easeOutQuad", "easeInOutQuad", "easeInCubic", "easeOutCubic", "easeInOutCubic" (default: "easeOutQuad")
   * @returns {Promise<Mouse>} Returns mouse instance for chaining
   * @throws {Error} If coordinates are invalid or duration is negative
   * @example
   * await mouse.smoothMoveTo(800, 600, 0.5, "easeOutQuad")
   * await mouse.smoothMoveTo(1920, 1080, 1.5, "easeInOutCubic")
   */
  smoothMoveTo = actions.smoothMoveTo;

  /**
   * Hold a mouse button down for a specified duration.
   * @param button - Button to hold ("left", "right", "middle", "x1", "x2")
   * @param duration - Duration to hold in seconds (must be >= 0)
   * @returns {Mouse} Returns mouse instance for method chaining
   * @throws {Error} If button is invalid or duration is negative
   * @example
   * mouse.hold("left", 2.0) // Hold left button for 2 seconds
   */
  hold = actions.hold;

  /**
   * Move to coordinates and click in one operation.
   * @param x - X coordinate to click at
   * @param y - Y coordinate to click at
   * @param button - Button to click ("left", "right", "middle") (default: "left")
   * @returns {Mouse} Returns mouse instance for method chaining
   * @throws {Error} If coordinates are invalid
   * @example
   * mouse.clickAt(500, 300) // Move to (500, 300) and click
   * mouse.clickAt(800, 600, "right") // Move and right-click
   */
  clickAt = actions.clickAt;

  /**
   * Check if the mouse is at a specific position.
   * @param x - X coordinate to check
   * @param y - Y coordinate to check
   * @param tolerance - Pixel tolerance for position matching (default: 0, must be >= 0)
   * @returns {boolean} True if mouse is at or near the position within tolerance
   * @throws {Error} If tolerance is negative
   * @example
   * if (mouse.isAtPosition(500, 300, 5)) {
   *   console.log("Mouse is within 5 pixels of (500, 300)");
   * }
   */
  isAtPosition = actions.isAtPosition;

  /**
   * Wait for the mouse to reach a specific position.
   * @param x - X coordinate to wait for
   * @param y - Y coordinate to wait for
   * @param timeout - Maximum wait time in milliseconds (optional, waits indefinitely if not provided)
   * @param tolerance - Pixel tolerance for position matching (default: 0, must be >= 0)
   * @returns {Promise<boolean>} Resolves to true when position is reached, false on timeout
   * @throws {Error} If timeout or tolerance is negative
   * @example
   * const reached = await mouse.waitForPosition(500, 300, 5000, 10);
   * if (reached) console.log("Mouse reached the position");
   */
  waitForPosition = actions.waitForPosition;

  /**
   * Wait for a mouse button to be pressed.
   * @param button - Button to wait for ("left", "right", "middle", "x1", "x2")
   * @param timeout - Maximum wait time in milliseconds (optional, waits indefinitely if not provided)
   * @returns {Promise<boolean>} Resolves to true when button is pressed, false on timeout
   * @throws {Error} If button is invalid or timeout is negative
   * @example
   * const pressed = await mouse.waitForPress("left", 5000);
   * if (pressed) console.log("Left button was pressed");
   */
  waitForPress = actions.waitForPress;

  /**
   * Wait for a mouse button to be released.
   * @param button - Button to wait for release ("left", "right", "middle", "x1", "x2")
   * @param timeout - Maximum wait time in milliseconds (optional, waits indefinitely if not provided)
   * @returns {Promise<boolean>} Resolves to true when button is released, false on timeout
   * @throws {Error} If button is invalid or timeout is negative
   * @example
   * const released = await mouse.waitForRelease("right", 3000);
   * if (released) console.log("Right button was released");
   */
  waitForRelease = actions.waitForRelease;

  /**
   * Mouse event listener that monitors cursor movement and button states.
   * Use the fluent API for event registration:
   *
   * @example
   * ```typescript
   * // Register event handlers
   * mouse.listener.on.move((e) => console.log(`Moved to: ${e.x}, ${e.y}`));
   * mouse.listener.on.down((e) => console.log(`Button ${e.button} down`));
   * mouse.listener.on.up((e) => console.log(`Button ${e.button} up`));
   *
   * // One-time handler
   * mouse.listener.once.move((e) => console.log("First movement detected"));
   *
   * // Remove handler
   * const handler = (e) => console.log(e);
   * mouse.listener.on.move(handler);
   * mouse.listener.off.move(handler);
   *
   * // Start listening
   * mouse.listener.start();
   * ```
   *
   * @fires move - Cursor moved. Event: `{ event, x, y, lastX, lastY, deltaX, deltaY }`
   * @fires down - Button pressed. Event: `{ event, button, x, y }`
   * @fires up - Button released. Event: `{ event, button, x, y }`
   */
  listener = new Listener();
}

/**
 * Mouse input controller for simulating mouse actions and monitoring mouse state.
 * Provides methods for clicking, moving, dragging, scrolling, and listening to mouse events.
 */
export const mouse = new Mouse();
