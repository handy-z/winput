import { PenOptions, OverlayOptions } from "./types";
import { OverlayWindow } from "./overlay-window";
import { Pen } from "./pen";

/**
 * Overlay class for managing screen drawing
 */
class Overlay {
  private window: OverlayWindow | null = null;
  private pens: Pen[] = [];
  private _isInitialized: boolean = false;

  /**
   * Initialize the overlay window if not already initialized
   */
  private ensureInitialized(options?: OverlayOptions): boolean {
    if (this._isInitialized && this.window) {
      return true;
    }

    this.window = new OverlayWindow(options ?? {});
    const success = this.window.create();

    if (success) {
      this._isInitialized = true;
    }

    return success;
  }

  /**
   * Create a new pen for drawing
   * @param options - Pen configuration options
   * @param overlayOptions - Optional overlay window configuration (used if overlay not yet created)
   * @returns Pen instance for drawing
   */
  createPen(options: PenOptions, overlayOptions?: OverlayOptions): Pen {
    if (!this.ensureInitialized(overlayOptions)) {
      throw new Error("Failed to initialize overlay window");
    }

    const pen = new Pen(this.window!, options);
    this.pens.push(pen);
    return pen;
  }

  /**
   * Show the overlay window
   */
  show(options?: OverlayOptions): void {
    if (!this.ensureInitialized(options)) {
      throw new Error("Failed to initialize overlay window");
    }
    this.window!.show();
  }

  /**
   * Hide the overlay window
   */
  hide(): void {
    if (this.window) {
      this.window.hide();
    }
  }

  /**
   * Clear all drawings from the overlay
   */
  clear(): void {
    if (this.window) {
      this.window.clear();
    }
  }

  /**
   * Process Windows messages to keep the overlay responsive
   * Should be called periodically, especially if the overlay is visible for extended periods
   */
  update(): void {
    if (this.window) {
      this.window.update();
    }
  }

  /**
   * Destroy the overlay and clean up all resources
   */
  destroy(): void {
    for (const pen of this.pens) {
      pen.destroy();
    }
    this.pens = [];

    if (this.window) {
      this.window.destroy();
      this.window = null;
    }

    this._isInitialized = false;
  }

  /**
   * Get the overlay window instance (for advanced usage)
   */
  getWindow(): OverlayWindow | null {
    return this.window;
  }

  /**
   * Check if the overlay is initialized
   * @returns true if overlay is initialized
   */
  isInitialized(): boolean {
    return this._isInitialized;
  }
}

/**
 * Global overlay instance for screen drawing operations
 */
export const overlay = new Overlay();
