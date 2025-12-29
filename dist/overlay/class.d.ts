import { PenOptions, OverlayOptions } from "../types";
import { OverlayWindow } from "./overlay-window";
import { Pen } from "./pen";
/**
 * Overlay class for managing screen drawing
 */
declare class Overlay {
    private window;
    private pens;
    private _isInitialized;
    /**
     * Initialize the overlay window if not already initialized
     */
    private ensureInitialized;
    /**
     * Create a new pen for drawing
     * @param options - Pen configuration options
     * @param overlayOptions - Optional overlay window configuration (used if overlay not yet created)
     * @returns Pen instance for drawing
     */
    createPen(options: PenOptions, overlayOptions?: OverlayOptions): Pen;
    /**
     * Show the overlay window
     */
    show(options?: OverlayOptions): void;
    /**
     * Hide the overlay window
     */
    hide(): void;
    /**
     * Clear all drawings from the overlay
     */
    clear(): void;
    /**
     * Process Windows messages to keep the overlay responsive
     * Should be called periodically, especially if the overlay is visible for extended periods
     */
    update(): void;
    /**
     * Destroy the overlay and clean up all resources
     */
    destroy(): void;
    /**
     * Get the overlay window instance (for advanced usage)
     */
    getWindow(): OverlayWindow | null;
    /**
     * Check if the overlay is initialized
     * @returns true if overlay is initialized
     */
    isInitialized(): boolean;
}
/**
 * Global overlay instance for screen drawing operations
 */
export declare const overlay: Overlay;
export {};
//# sourceMappingURL=class.d.ts.map