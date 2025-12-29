import * as actions from "./actions";

class Window {
  /**
   * Creates a new window with customizable options.
   * Provides a high-level API for window creation with sensible defaults.
   * 
   * @param options - Window creation options including name, size, position, and styles
   * @returns {bigint | null} Window handle if successful, null if creation failed
   * 
   * @example
   * const hwnd = window.create({
   *   windowName: "My Window",
   *   width: 800,
   *   height: 600,
   *   x: 100,
   *   y: 100
   * });
   * if (hwnd) {
   *   console.log(`Created window with handle: ${hwnd}`);
   * }
   */
  create = actions.createWindow;

  /**
   * Registers a custom window class.
   * This is necessary for creating custom windows with specific behaviors and backgrounds.
   * Must be called before creating a window with the specified class name.
   * 
   * @param className - Name of the window class to register
   * @param backgroundBrush - Optional background brush handle from GetStockObject. Use null for transparent background (default: null)
   * @returns {number} Atom identifying the registered class, or 0 if registration failed
   * 
   * @example
   * const BLACK_BRUSH = 4;
   * const brush = gdi32.symbols.GetStockObject(BLACK_BRUSH);
   * const atom = window.registerClass("MyCustomClass", brush);
   * if (atom) {
   *   const hwnd = window.create({
   *     className: "MyCustomClass",
   *     windowName: "Custom Window"
   *   });
   * }
   */
  registerClass = actions.registerWindowClass;

  /**
   * Retrieves detailed information about the currently active (foreground) window.
   * 
   * @returns {WindowInfo | null} Object containing window handle, title, bounding rectangle, and fullscreen status, or null if no active window
   * 
   * @example
   * const activeWin = window.getActiveWindow();
   * if (activeWin) {
   *   console.log(`Active window: ${activeWin.title}`);
   *   console.log(`Position: ${activeWin.rect.left}, ${activeWin.rect.top}`);
   * }
   */
  getActiveWindow = actions.getActiveWindow;

  /**
   * Retrieves the title text of a window.
   * 
   * @param hwnd - Window handle (bigint). If not provided, uses the currently active window
   * @returns {string} The window's title text. Returns empty string if window has no title
   * 
   * @example
   * const activeWin = window.getActiveWindow();
   * if (activeWin) {
   *   const title = window.getWindowTitle(activeWin.hwnd);
   *   console.log(`Window title: ${title}`);
   * }
   */
  getWindowTitle = actions.getWindowTitle;

  /**
   * Retrieves the dimensions of the bounding rectangle of a window in screen coordinates.
   * The rectangle includes the entire window, including title bar, borders, and scrollbars.
   * 
   * @param hwnd - Window handle (bigint)
   * @returns {Rect | null} Rectangle object with left, top, right, bottom properties in screen coordinates, or null if failed
   * 
   * @example
   * const rect = window.getWindowRect(hwnd);
   * if (rect) {
   *   const width = rect.right - rect.left;
   *   const height = rect.bottom - rect.top;
   *   console.log(`Window size: ${width}x${height}`);
   * }
   */
  getWindowRect = actions.getWindowRect;

  /**
   * Retrieves the dimensions of the client area of a window.
   * The client area is the portion of the window where the application displays output, excluding borders and title bar.
   * Coordinates are relative to the upper-left corner of the client area (always starts at 0,0).
   * 
   * @param hwnd - Window handle (bigint)
   * @returns {Rect | null} Rectangle object with left, top, right, bottom properties in client coordinates, or null if failed
   * 
   * @example
   * const clientRect = window.getClientRect(hwnd);
   * if (clientRect) {
   *   console.log(`Client area: ${clientRect.right}x${clientRect.bottom}`);
   * }
   */
  getClientRect = actions.getClientRect;

  /**
   * Gets the total size (width and height) of a window including borders and title bar.
   * 
   * @param hwnd - Window handle (bigint)
   * @returns {Size | null} Object with width and height properties in pixels, or null if failed
   * 
   * @example
   * const size = window.getWindowSize(hwnd);
   * if (size) {
   *   console.log(`Window is ${size.width}x${size.height}`);
   * }
   */
  getWindowSize = actions.getWindowSize;

  /**
   * Gets the size of a window's client area (the drawable region, excluding borders and title bar).
   * 
   * @param hwnd - Window handle (bigint)
   * @returns {Size | null} Object with width and height properties in pixels, or null if failed
   * 
   * @example
   * const clientSize = window.getClientSize(hwnd);
   * if (clientSize) {
   *   console.log(`Drawable area: ${clientSize.width}x${clientSize.height}`);
   * }
   */
  getClientSize = actions.getClientSize;

  /**
   * Determines whether a window is currently visible on screen.
   * A window can have the visible style but still be obscured by other windows.
   * 
   * @param hwnd - Window handle (bigint)
   * @returns {boolean} True if the window has the visible style, false otherwise
   */
  isWindowVisible = actions.isWindowVisible;

  /**
   * Checks if a window is currently minimized to the taskbar.
   * 
   * @param hwnd - Window handle (bigint)
   * @returns {boolean} True if window is minimized, false otherwise
   */
  isWindowMinimized = actions.isWindowMinimized;

  /**
   * Checks if a window is currently maximized to fill the screen.
   * 
   * @param hwnd - Window handle (bigint)
   * @returns {boolean} True if window is maximized, false otherwise
   */
  isWindowMaximized = actions.isWindowMaximized;

  /**
   * Determines whether a window handle is valid and the window still exists.
   * Useful for checking if a window has been closed.
   * 
   * @param hwnd - Window handle (bigint) to validate
   * @returns {boolean} True if the handle represents an existing window, false otherwise
   * 
   * @example
   * if (!window.isWindow(hwnd)) {
   *   console.log('Window has been closed');
   * }
   */
  isWindow = actions.isWindow;

  /**
   * Brings a window to the foreground and activates it.
   * The window is restored if minimized.
   * 
   * @param hwnd - Window handle (bigint)
   * @returns {boolean} True if the window was successfully brought to foreground, false otherwise
   * 
   * @example
   * const hwnd = window.findWindow('Notepad');
   * if (hwnd) {
   *   window.setForeground(hwnd);
   * }
   */
  setForeground = actions.setForeground;

  /**
   * Focuses a window and waits for it to become the active foreground window.
   * Automatically restores the window if minimized before focusing.
   * Polls every 100ms until timeout.
   * 
   * @param hwnd - Window handle (bigint)
   * @param timeout - Maximum time to wait in milliseconds (default: 1000)
   * @returns {Promise<boolean>} Promise that resolves to true if window became foreground before timeout, false otherwise
   * 
   * @example
   * const success = await window.focusWindow(hwnd, 2000);
   * if (success) {
   *   console.log('Window is now focused');
   * }
   */
  focusWindow = actions.focusWindow;

  /**
   * Searches for a window by its exact title text (case-sensitive).
   * Only searches top-level windows, not child windows.
   * 
   * @param title - Exact window title to search for
   * @returns {number | null} Window handle (as number) if found, null otherwise
   * 
   * @example
   * const notepad = window.findWindow('Untitled - Notepad');
   * if (notepad) {
   *   window.setForeground(BigInt(notepad));
   * }
   */
  findWindow = actions.findWindow;

  /**
   * Waits for a window with the specified exact title to appear.
   * Polls every 100ms checking for the window.
   * 
   * @param title - Exact window title to wait for
   * @param timeout - Maximum time to wait in milliseconds. If not specified, waits indefinitely
   * @returns {Promise<number | null>} Promise that resolves to window handle if found, null if timeout occurred
   * 
   * @example
   * const hwnd = await window.waitForWindow('Calculator', 5000);
   * if (hwnd) {
   *   console.log('Calculator opened');
   * }
   */
  waitForWindow = actions.waitForWindow;

  /**
   * Waits for a window to close by monitoring its handle validity.
   * Polls every 100ms checking if window still exists.
   * 
   * @param hwnd - Window handle (bigint) to monitor
   * @param timeout - Maximum time to wait in milliseconds. If not specified, waits indefinitely
   * @returns {Promise<boolean>} Promise that resolves to true if window closed, false if timeout occurred
   * 
   * @example
   * const closed = await window.waitForWindowClose(hwnd, 3000);
   * if (closed) {
   *   console.log('Window closed successfully');
   * }
   */
  waitForWindowClose = actions.waitForWindowClose;

  /**
   * Retrieves the identifier of the process that created the window.
   * 
   * @param hwnd - Window handle (bigint)
   * @returns {number} Process ID (PID)
   * 
   * @example
   * const pid = window.getWindowProcessId(hwnd);
   * console.log(`Window belongs to process: ${pid}`);
   */
  getWindowProcessId = actions.getWindowProcessId;

  /**
   * Retrieves the name of the class to which the window belongs.
   * Every window is created from a window class that defines window behavior.
   * 
   * @param hwnd - Window handle (bigint)
   * @returns {string} Window class name
   * 
   * @example
   * const className = window.getClassName(hwnd);
   * console.log(`Window class: ${className}`);
   */
  getClassName = actions.getClassName;

  /**
   * Retrieves comprehensive information about a window in a single call.
   * Includes handle, title, rectangle, process ID, class name, and various state flags.
   * 
   * @param hwnd - Window handle (bigint)
   * @returns {ExtendedWindowInfo | null} Object containing hwnd, title, rect, processId, className, and state booleans (isVisible, isMinimized, isMaximized, isFullscreen), or null if failed
   * 
   * @example
   * const info = window.getExtendedWindowInfo(hwnd);
   * if (info) {
   *   console.log(`${info.title} - PID: ${info.processId}`);
   *   console.log(`Visible: ${info.isVisible}, Minimized: ${info.isMinimized}`);
   * }
   */
  getExtendedWindowInfo = actions.getExtendedWindowInfo;

  /**
   * Minimizes a window to the taskbar.
   * 
   * @param hwnd - Window handle (bigint)
   * @returns {boolean} True if window was successfully minimized, false otherwise
   * 
   * @example
   * window.minimizeWindow(hwnd);
   */
  minimizeWindow = actions.minimizeWindow;

  /**
   * Maximizes a window to fill the entire screen (excluding taskbar).
   * 
   * @param hwnd - Window handle (bigint)
   * @returns {boolean} True if window was successfully maximized, false otherwise
   * 
   * @example
   * window.maximizeWindow(hwnd);
   */
  maximizeWindow = actions.maximizeWindow;

  /**
   * Restores a window to its normal size and position from minimized or maximized state.
   * 
   * @param hwnd - Window handle (bigint)
   * @returns {boolean} True if window was successfully restored, false otherwise
   * 
   * @example
   * window.restoreWindow(hwnd);
   */
  restoreWindow = actions.restoreWindow;

  /**
   * Makes a hidden window visible without activating it.
   * 
   * @param hwnd - Window handle (bigint)
   * @returns {boolean} True if window was successfully shown, false otherwise
   */
  showWindow = actions.showWindow;

  /**
   * Hides a window by setting its visibility to hidden.
   * The window is not destroyed and can be shown again later.
   * 
   * @param hwnd - Window handle (bigint)
   * @returns {boolean} True if window was successfully hidden, false otherwise
   * 
   * @example
   * window.hideWindow(hwnd); // Window is hidden but still exists
   */
  hideWindow = actions.hideWindow;

  /**
   * Closes a window by sending a WM_CLOSE message.
   * This allows the application to prompt the user to save changes.
   * Does not guarantee the window will close (application may cancel).
   * 
   * @param hwnd - Window handle (bigint)
   * @returns {boolean} True if the message was successfully sent, false otherwise
   * 
   * @example
   * window.closeWindow(hwnd);
   * // Wait to verify closure
   * await window.waitForWindowClose(hwnd, 2000);
   */
  closeWindow = actions.closeWindow;

  /**
   * Changes the position and dimensions of a window.
   * For top-level windows, position is relative to the screen. For child windows, relative to parent's client area.
   * 
   * @param hwnd - Window handle (bigint)
   * @param x - New X coordinate of the window's upper-left corner in pixels
   * @param y - New Y coordinate of the window's upper-left corner in pixels
   * @param width - New width of the window in pixels
   * @param height - New height of the window in pixels
   * @param repaint - Whether to repaint the window after moving (default: true)
   * @returns {boolean} True if successful, false otherwise
   * 
   * @example
   * // Move window to (100, 100) and resize to 800x600
   * window.moveWindow(hwnd, 100, 100, 800, 600);
   */
  moveWindow = actions.moveWindow;

  /**
   * Enumerates all top-level visible windows on the desktop.
   * Returns extended information for each window.
   * 
   * @returns {ExtendedWindowInfo[]} Array of window information objects
   * 
   * @example
   * const windows = window.enumWindows();
   * windows.forEach(win => {
   *   console.log(`${win.title} (${win.className})`);
   * });
   */
  enumWindows = actions.enumWindows;

  /**
   * Enumerates all child windows belonging to a parent window.
   * Child windows are controls like buttons, text boxes, etc.
   * 
   * @param parentHwnd - Parent window handle (bigint)
   * @returns {number[]} Array of child window handles (as numbers)
   * 
   * @example
   * const children = window.enumChildWindows(parentHwnd);
   * console.log(`Found ${children.length} child windows`);
   */
  enumChildWindows = actions.enumChildWindows;

  /**
   * Flashes the window's title bar and taskbar button to attract user attention.
   * The window flashes from the active state to the inactive state once.
   * 
   * @param hwnd - Window handle (bigint)
   * @param invert - Whether to invert the window caption (default: true)
   * @returns {boolean} True if successful, false otherwise
   * 
   * @example
   * window.flashWindow(hwnd); // Flash to get user's attention
   */
  flashWindow = actions.flashWindow;

  /**
   * Sets the opacity (alpha transparency) of a window.
   * Automatically converts the window to a layered window if needed.
   * 
   * @param hwnd - Window handle (bigint)
   * @param opacity - Opacity value from 0.0 (fully transparent) to 1.0 (fully opaque)
   * @returns {boolean} True if successful, false otherwise
   * 
   * @example
   * window.setOpacity(hwnd, 0.5); // Make window 50% transparent
   * window.setOpacity(hwnd, 1.0); // Make window fully opaque
   */
  setOpacity = actions.setWindowOpacity;

  /**
   * Sets or removes a window's topmost status.
   * Topmost windows appear above all non-topmost windows, even when deactivated.
   * 
   * @param hwnd - Window handle (bigint)
   * @param enable - True to make window always on top, false to remove topmost status
   * @returns {boolean} True if successful, false otherwise
   * 
   * @example
   * window.setTopmost(hwnd, true);  // Always on top
   * window.setTopmost(hwnd, false); // Normal behavior
   */
  setTopmost = actions.setWindowTopmost;

  /**
   * Centers a window on the primary screen.
   * Calculates center position based on screen size and window dimensions.
   * 
   * @param hwnd - Window handle (bigint)
   * @returns {boolean} True if window was successfully centered, false otherwise
   * 
   * @example
   * window.center(hwnd);
   */
  center = actions.centerWindow;

  /**
   * Changes the text of a window's title bar.
   * 
   * @param hwnd - Window handle (bigint)
   * @param title - New title text to set
   * @returns {boolean} True if successful, false otherwise
   * 
   * @example
   * window.setTitle(hwnd, 'My Custom Title');
   */
  setTitle = actions.setWindowTitle;

  /**
   * Enables or disables mouse and keyboard input to a window and all its child windows.
   * When disabled, the window and its children cannot receive user input.
   * 
   * @param hwnd - Window handle (bigint)
   * @param enabled - True to enable input, false to disable input
   * @returns {boolean} True if successful, false otherwise
   * 
   * @example
   * window.setEnabled(hwnd, false); // Disable user input
   * window.setEnabled(hwnd, true);  // Re-enable input
   */
  setEnabled = actions.setWindowEnabled;

  /**
   * Forces a window to redraw itself immediately.
   * Adds the entire window rectangle to its update region.
   * 
   * @param hwnd - Window handle (bigint)
   * @returns {boolean} True if successful, false otherwise
   * 
   * @example
   * window.redraw(hwnd); // Force window refresh
   */
  redraw = actions.redrawWindow;

  /**
   * Moves a window to the bottom of the Z-order (behind all other windows).
   * The window does not lose activation.
   * 
   * @param hwnd - Window handle (bigint)
   * @returns {boolean} True if successful, false otherwise
   * 
   * @example
   * window.moveToBottom(hwnd);
   */
  moveToBottom = actions.moveWindowToBottom;

  /**
   * Brings a window to the top of the Z-order (above all other windows).
   * Does not activate the window unless it's already active.
   * 
   * @param hwnd - Window handle (bigint)
   * @returns {boolean} True if successful, false otherwise
   * 
   * @example
   * window.moveToTop(hwnd);
   */
  moveToTop = actions.moveWindowToTop;

  /**
   * Retrieves the full file path of the executable file that created the window's process.
   * 
   * @param hwnd - Window handle (bigint)
   * @returns {string} Full absolute path to the executable file
   * 
   * @example
   * const exePath = window.getProcessPath(hwnd);
   * console.log(`Executable: ${exePath}`);
   */
  getProcessPath = actions.getWindowProcessPath;

  /**
   * Converts coordinates from a window's client area to screen coordinates.
   * Useful for positioning elements on screen relative to a window.
   * 
   * @param hwnd - Window handle (bigint)
   * @param x - X coordinate relative to the client area (top-left is 0,0)
   * @param y - Y coordinate relative to the client area
   * @returns {{x: number, y: number} | null} Screen coordinates, or null if conversion failed
   * 
   * @example
   * const screenPos = window.clientToScreen(hwnd, 10, 20);
   * if (screenPos) {
   *   console.log(`Screen position: ${screenPos.x}, ${screenPos.y}`);
   * }
   */
  clientToScreen = actions.clientToScreen;

  /**
   * Converts screen coordinates to coordinates relative to a window's client area.
   * Useful for determining where a screen point is within a window.
   * 
   * @param hwnd - Window handle (bigint)
   * @param x - X coordinate in screen coordinates
   * @param y - Y coordinate in screen coordinates
   * @returns {{x: number, y: number} | null} Client coordinates, or null if conversion failed
   * 
   * @example
   * const clientPos = window.screenToClient(hwnd, 500, 300);
   * if (clientPos) {
   *   console.log(`Client position: ${clientPos.x}, ${clientPos.y}`);
   * }
   */
  screenToClient = actions.screenToClient;

  /**
   * Activates a window by bringing it to the foreground and restoring it if minimized.
   * Combines the functionality of `setForeground` and `restoreWindow`.
   * 
   * @param hwnd - Window handle (bigint)
   * @returns {boolean} True if successful, false otherwise
   * 
   * @example
   * window.activate(hwnd); // Restore and focus
   */
  activate = actions.activateWindow;

  /**
   * Waits for a window to become the active foreground window.
   * Polls every 100ms checking if the window is active.
   * 
   * @param hwnd - Window handle (bigint)
   * @param timeout - Maximum time to wait in milliseconds
   * @returns {Promise<boolean>} Promise that resolves to true if window became active before timeout, false otherwise
   * 
   * @example
   * const isActive = await window.waitActive(hwnd, 3000);
   */
  waitActive = actions.waitActiveWindow;

  /**
   * Waits for a window to lose focus (become inactive).
   * Polls every 100ms checking if the window is no longer active.
   * 
   * @param hwnd - Window handle (bigint)
   * @param timeout - Maximum time to wait in milliseconds
   * @returns {Promise<boolean>} Promise that resolves to true if window became inactive before timeout, false otherwise
   * 
   * @example
   * const isInactive = await window.waitNotActive(hwnd, 2000);
   */
  waitNotActive = actions.waitNotActiveWindow;

  /**
   * Forcefully terminates the process that owns the window.
   * This does not allow the application to save changes or cleanup.
   * Use `closeWindow` for graceful shutdown.
   * 
   * @param hwnd - Window handle (bigint)
   * @returns {boolean} True if the process was successfully terminated, false otherwise
   * 
   * @example
   * window.kill(hwnd); // Force kill - use with caution
   */
  kill = actions.killWindow;

  /**
   * Retrieves the window style flags (GWL_STYLE).
   * Window styles control window appearance and behavior (e.g., WS_VISIBLE, WS_BORDER).
   * 
   * @param hwnd - Window handle (bigint)
   * @returns {number} Current style flags as a bitmask
   * 
   * @example
   * const style = window.getStyle(hwnd);
   */
  getStyle = actions.getWindowStyle;

  /**
   * Sets the window style flags (GWL_STYLE).
   * Window styles control window appearance and behavior.
   * 
   * @param hwnd - Window handle (bigint)
   * @param style - New style flags as a bitmask
   * @returns {number} Previous style flags
   * 
   * @example
   * const oldStyle = window.setStyle(hwnd, newStyleFlags);
   */
  setStyle = actions.setWindowStyle;

  /**
   * Retrieves the extended window style flags (GWL_EXSTYLE).
   * Extended styles control additional window behavior (e.g., WS_EX_TOPMOST, WS_EX_TRANSPARENT).
   * 
   * @param hwnd - Window handle (bigint)
   * @returns {number} Current extended style flags as a bitmask
   * 
   * @example
   * const exStyle = window.getExStyle(hwnd);
   */
  getExStyle = actions.getWindowExStyle;

  /**
   * Sets the extended window style flags (GWL_EXSTYLE).
   * Extended styles control additional window behavior.
   * 
   * @param hwnd - Window handle (bigint)
   * @param style - New extended style flags as a bitmask
   * @returns {number} Previous extended style flags
   * 
   * @example
   * const oldExStyle = window.setExStyle(hwnd, newExStyleFlags);
   */
  setExStyle = actions.setWindowExStyle;

  /**
   * Determines the current minimized/maximized state of a window.
   * 
   * @param hwnd - Window handle (bigint)
   * @returns {number} -1 if minimized, 0 if normal/restored, 1 if maximized
   * 
   * @example
   * const state = window.getMinMax(hwnd);
   * if (state === 1) console.log('Window is maximized');
   */
  getMinMax = actions.getWindowMinMax;

  /**
   * Retrieves a list of all visible top-level window handles.
   * 
   * @returns {bigint[]} Array of window handles
   * 
   * @example
   * const handles = window.getList();
   * console.log(`Found ${handles.length} windows`);
   */
  getList = actions.getWindowList;

  /**
   * Gets the count of all visible top-level windows.
   * More efficient than calling `getList().length`.
   * 
   * @returns {number} Number of visible windows
   * 
   * @example
   * const count = window.getCount();
   */
  getCount = actions.getWindowCount;

  /**
   * Minimizes all top-level windows on the desktop.
   * Equivalent to Windows+D or Show Desktop.
   * 
   * @example
   * window.minimizeAll(); // Show desktop
   */
  minimizeAll = actions.minimizeAll;

  /**
   * Retrieves the executable name of the process that owns the window.
   * Returns just the filename, not the full path.
   * 
   * @param hwnd - Window handle (bigint)
   * @returns {string} Process name including extension (e.g., "notepad.exe", "chrome.exe")
   * 
   * @example
   * const processName = window.getProcessName(hwnd);
   * console.log(`Process: ${processName}`);
   */
  getProcessName = actions.getWindowProcessName;

  /**
   * Retrieves all text content from a window and all its child windows.
   * Useful for extracting text from dialog boxes and UI elements.
   * 
   * @param hwnd - Window handle (bigint)
   * @returns {string} Combined text from the window and its children, separated by newlines
   * 
   * @example
   * const text = window.getText(hwnd);
   * console.log(`Window contains: ${text}`);
   */
  getText = actions.getWindowText;

  /**
   * Functions for setting custom window shapes by defining regions.
   * A window region determines the area within a window where the system permits drawing.
   * The system does not display portions of a window outside the window region.
   */
  readonly setRegion = {
    /**
     * Sets a rectangular region for the window.
     * 
     * @param hwnd - Window handle (bigint)
     * @param x - X coordinate of the rectangle's upper-left corner
     * @param y - Y coordinate of the rectangle's upper-left corner
     * @param w - Width of the rectangle
     * @param h - Height of the rectangle
     * @param redraw - Whether to redraw the window after setting region (default: true)
     * 
     * @example
     * window.setRegion.rect(hwnd, 0, 0, 400, 300);
     */
    rect: actions.setWindowRegionRect,
    /**
     * Sets an elliptical (oval/circular) region for the window.
     * 
     * @param hwnd - Window handle (bigint)
     * @param x - X coordinate of the bounding rectangle's upper-left corner
     * @param y - Y coordinate of the bounding rectangle's upper-left corner
     * @param w - Width of the bounding rectangle
     * @param h - Height of the bounding rectangle (use same as width for circle)
     * @param redraw - Whether to redraw the window after setting region (default: true)
     * 
     * @example
     * // Create a circular window
     * window.setRegion.ellipse(hwnd, 0, 0, 300, 300);
     */
    ellipse: actions.setWindowRegionEllipse,
    /**
     * Sets a rounded rectangular region for the window.
     * 
     * @param hwnd - Window handle (bigint)
     * @param x - X coordinate of the rectangle's upper-left corner
     * @param y - Y coordinate of the rectangle's upper-left corner
     * @param w - Width of the rectangle
     * @param h - Height of the rectangle
     * @param rw - Width of ellipse used for rounding the corners
     * @param rh - Height of ellipse used for rounding the corners
     * @param redraw - Whether to redraw the window after setting region (default: true)
     * 
     * @example
     * // Create a window with rounded corners
     * window.setRegion.round(hwnd, 0, 0, 500, 400, 20, 20);
     */
    round: actions.setWindowRegionRound,
    /**
     * Sets a polygonal region for the window.
     * 
     * @param hwnd - Window handle (bigint)
     * @param points - Array of point objects {x, y} defining the polygon vertices
     * @param fillMode - Fill mode: 1 for ALTERNATE (default), 2 for WINDING
     * @param redraw - Whether to redraw the window after setting region (default: true)
     * 
     * @example
     * // Create a triangular window
     * window.setRegion.polygon(hwnd, [
     *   {x: 250, y: 0},
     *   {x: 500, y: 400},
     *   {x: 0, y: 400}
     * ]);
     */
    polygon: actions.setWindowRegionPolygon,
    /**
     * Resets the window region to default (entire window rectangle).
     * Restores the window to its normal rectangular shape.
     * 
     * @param hwnd - Window handle (bigint)
     * @param redraw - Whether to redraw the window after resetting region (default: true)
     * 
     * @example
     * window.setRegion.reset(hwnd); // Restore normal shape
     */
    reset: actions.resetWindowRegion,
  };
}

/**
 * Window management class providing comprehensive functions for controlling and querying Windows OS windows.
 * Supports window manipulation, state detection, enumeration, and coordinate transformations.
 */
export const window = new Window();
