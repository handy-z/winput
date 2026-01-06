import * as actions from "./actions";
import { Listener } from "./listener";

class Keyboard {
  /**
   * Press and hold a key down.
   * @param key - Name of the key to press (e.g., "a", "enter", "ctrl")
   * @returns {Keyboard} Returns keyboard instance for method chaining
   * @throws {Error} If key name is invalid
   * @example
   * keyboard.press("shift").tap("a").release("shift")
   */
  press = actions.press;

  /**
   * Release a held key.
   * @param key - Name of the key to release
   * @returns {Keyboard} Returns keyboard instance for method chaining
   * @throws {Error} If key name is invalid
   * @example
   * keyboard.press("ctrl").tap("c").release("ctrl")
   */
  release = actions.release;

  /**
   * Press and immediately release a key (single tap).
   * @param key - Name of the key to tap
   * @returns {Keyboard} Returns keyboard instance for method chaining
   * @throws {Error} If key name is invalid
   * @example
   * keyboard.tap("enter")
   */
  tap = actions.tap;

  /**
   * Tap a key multiple times with optional delay between taps.
   * @param key - Name of the key to tap
   * @param repeat - Number of times to tap the key (default: 1, must be >= 1)
   * @param delay - Delay between taps in seconds (default: 0, must be >= 0)
   * @returns {Keyboard} Returns keyboard instance for method chaining
   * @throws {Error} If key name is invalid or parameters are out of bounds
   * @example
   * keyboard.repeatTap("space", 5, 0.1) // Tap space 5 times with 100ms delay
   */
  repeatTap = actions.repeatTap;

  /**
   * Type a string of characters, automatically handling uppercase and special characters.
   * @param message - Text string to type
   * @param delay - Delay between characters in seconds (default: 0, must be >= 0)
   * @returns {Keyboard} Returns keyboard instance for method chaining
   * @throws {Error} If delay is negative
   * @example
   * keyboard.write("Hello, World!", 0.05) // Type with 50ms delay per character
   */
  write = actions.write;

  /**
   * Check if a key is currently pressed down.
   * @param key - Name of the key to check
   * @returns {boolean} True if the key is currently held down, false otherwise
   * @throws {Error} If key name is invalid
   * @example
   * if (keyboard.isPressed("shift")) {
   *   console.log("Shift is being held");
   * }
   */
  isPressed = actions.isPressed;

  /**
   * Execute a keyboard shortcut by pressing all keys, then releasing in reverse order.
   * @param keys - Array of keys to press together (e.g., ["ctrl", "shift", "s"])
   * @returns {Keyboard} Returns keyboard instance for method chaining
   * @throws {Error} If any key name is invalid
   * @example
   * keyboard.hotkey(["ctrl", "alt", "delete"])
   * keyboard.hotkey(["win", "r"])
   */
  hotkey = actions.hotkey;

  /**
   * Hold a key down for a specified duration.
   * @param key - Name of the key to hold
   * @param duration - Duration to hold in seconds (must be >= 0)
   * @returns {Keyboard} Returns keyboard instance for method chaining
   * @throws {Error} If key name is invalid or duration is negative
   * @example
   * keyboard.hold("space", 2.5) // Hold space for 2.5 seconds
   */
  hold = actions.hold;

  /**
   * Check if any of the specified keys are currently pressed.
   * @param keys - Array of key names to check
   * @returns {boolean} True if at least one key is pressed, false otherwise
   * @throws {Error} If any key name is invalid
   * @example
   * if (keyboard.isAnyPressed(["ctrl", "shift", "alt"])) {
   *   console.log("A modifier key is held");
   * }
   */
  isAnyPressed = actions.isAnyPressed;

  /**
   * Check if all of the specified keys are currently pressed.
   * @param keys - Array of key names to check
   * @returns {boolean} True if all keys are pressed, false otherwise
   * @throws {Error} If any key name is invalid
   * @example
   * if (keyboard.areAllPressed(["ctrl", "shift", "s"])) {
   *   console.log("Ctrl+Shift+S is held");
   * }
   */
  areAllPressed = actions.areAllPressed;

  /**
   * Wait for a key to be pressed.
   * @param key - Name of the key to wait for
   * @param timeout - Maximum wait time in milliseconds (optional, waits indefinitely if not provided)
   * @returns {Promise<boolean>} Resolves to true when key is pressed, false on timeout
   * @throws {Error} If key name is invalid or timeout is negative
   * @example
   * const pressed = await keyboard.waitForPress("enter", 5000);
   * if (pressed) console.log("Enter was pressed");
   */
  waitForPress = actions.waitForPress;

  /**
   * Wait for a key to be released.
   * @param key - Name of the key to wait for release
   * @param timeout - Maximum wait time in milliseconds (optional, waits indefinitely if not provided)
   * @returns {Promise<boolean>} Resolves to true when key is released, false on timeout
   * @throws {Error} If key name is invalid or timeout is negative
   * @example
   * const released = await keyboard.waitForRelease("shift", 3000);
   * if (released) console.log("Shift was released");
   */
  waitForRelease = actions.waitForRelease;

  /**
   * Toggle a lock key (Caps Lock, Num Lock, or Scroll Lock).
   * @param key - Lock key to toggle ("capslock", "numlock", or "scrolllock")
   * @returns {Keyboard} Returns keyboard instance for method chaining
   * @example
   * keyboard.toggleKey("capslock")
   */
  toggleKey = actions.toggleKey;

  /**
   * Get the current state of a key, including both press and toggle states.
   * @param key - Name of the key to check
   * @returns {{ isPressed: boolean, isToggled: boolean }} Object containing key state
   *   - isPressed: true if key is currently held down
   *   - isToggled: true if key is toggled on (for lock keys like Caps Lock)
   * @throws {Error} If key name is invalid
   * @example
   * const state = keyboard.getKeyState("capslock");
   * console.log(`Caps Lock is ${state.isToggled ? "on" : "off"}`);
   */
  getKeyState = actions.getKeyState;

  /**
   * Release all commonly held modifier and letter keys.
   * Useful for cleanup after automation scripts to prevent stuck keys.
   * @returns {Keyboard} Returns keyboard instance for method chaining
   * @example
   * keyboard.releaseAll() // Release all modifiers and letter keys
   */
  releaseAll = actions.releaseAll;

  /**
   * Keyboard event listener that monitors key presses and releases.
   * Use the fluent API for event registration:
   * 
   * @example
   * ```typescript
   * // Register event handlers
   * keyboard.listener.on.down((e) => console.log(`Key down: ${e.key}`));
   * keyboard.listener.on.up((e) => console.log(`Key up: ${e.key}`));
   * 
   * // One-time handler
   * keyboard.listener.once.down((e) => console.log("First key press"));
   * 
   * // Remove handler
   * const handler = (e) => console.log(e);
   * keyboard.listener.on.down(handler);
   * keyboard.listener.off.down(handler);
   * 
   * // Start listening
   * keyboard.listener.start();
   * ```
   *
   * @fires down - Key pressed. Event: `{ event, key, vk_code, scan_code }`
   * @fires up - Key released. Event: `{ event, key, vk_code, scan_code }`
   */ 
  listener = new Listener();
}

/**
 * Keyboard input controller for simulating keystrokes and monitoring key states.
 * Provides methods for pressing, releasing, typing, and listening to keyboard events.
 */
export const keyboard = new Keyboard();
