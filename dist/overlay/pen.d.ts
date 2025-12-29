import { RGB, PenOptions } from "../types";
import { OverlayWindow } from "./overlay-window";
/**
 * Pen class for drawing on the overlay
 * Provides methods for drawing lines, shapes, and managing pen state
 */
export declare class Pen {
    private window;
    private currentX;
    private currentY;
    private isDown;
    private penHandle;
    private oldPen;
    private brushHandle;
    private oldBrush;
    private color;
    private width;
    private style;
    constructor(window: OverlayWindow, options: PenOptions);
    /**
     * Create the GDI pen handle
     */
    private createPenHandle;
    /**
     * Move the pen to a specified position
     * If pen is down, draws a line to the position
     * If pen is up, just moves without drawing
     * @param x - X coordinate
     * @param y - Y coordinate
     * @returns this for method chaining
     */
    move(x: number, y: number): this;
    /**
     * Put the pen down to start drawing
     * @returns this for method chaining
     */
    down(): this;
    /**
     * Lift the pen up to stop drawing
     * @returns this for method chaining
     */
    up(): this;
    /**
     * Draw a line to the specified position (only if pen is down)
     * @param x - X coordinate
     * @param y - Y coordinate
     * @returns this for method chaining
     */
    lineTo(x: number, y: number): this;
    /**
     * Draw a complete line from one point to another
     * @param x1 - Start X coordinate
     * @param y1 - Start Y coordinate
     * @param x2 - End X coordinate
     * @param y2 - End Y coordinate
     * @returns this for method chaining
     */
    drawLine(x1: number, y1: number, x2: number, y2: number): this;
    /**
     * Draw a rectangle
     * @param x - X coordinate of top-left corner
     * @param y - Y coordinate of top-left corner
     * @param width - Width of the rectangle
     * @param height - Height of the rectangle
     * @returns this for method chaining
     */
    drawRect(x: number, y: number, width: number, height: number): this;
    /**
     * Draw an ellipse
     * @param x - X coordinate of bounding box top-left corner
     * @param y - Y coordinate of bounding box top-left corner
     * @param width - Width of the ellipse
     * @param height - Height of the ellipse
     * @returns this for method chaining
     */
    drawEllipse(x: number, y: number, width: number, height: number): this;
    /**
     * Change the pen color
     * @param color - New RGB color
     * @returns this for method chaining
     */
    setColor(color: RGB): this;
    /**
     * Change the pen width
     * @param width - New pen width in pixels
     * @returns this for method chaining
     */
    setWidth(width: number): this;
    /**
     * Get current pen position
     * @returns Current position as {x, y}
     */
    getPosition(): {
        x: number;
        y: number;
    };
    /**
     * Draw a filled rectangle
     * @param x - X coordinate of top-left corner
     * @param y - Y coordinate of top-left corner
     * @param width - Width of the rectangle
     * @param height - Height of the rectangle
     * @returns this for method chaining
     */
    drawFilledRect(x: number, y: number, width: number, height: number): this;
    /**
     * Draw a filled ellipse
     * @param x - X coordinate of bounding box top-left corner
     * @param y - Y coordinate of bounding box top-left corner
     * @param width - Width of the ellipse
     * @param height - Height of the ellipse
     * @returns this for method chaining
     */
    drawFilledEllipse(x: number, y: number, width: number, height: number): this;
    destroy(): void;
}
//# sourceMappingURL=pen.d.ts.map