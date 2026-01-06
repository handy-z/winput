import type { Pointer } from "bun:ffi";
import { RGB, PenOptions, PenStyle } from "./types";
import * as actions from "./actions";
import { OverlayWindow } from "./overlay-window";

/**
 * Pen class for drawing on the overlay
 * Provides methods for drawing lines, shapes, and managing pen state
 */
export class Pen {
  private currentX: number = 0;
  private currentY: number = 0;
  private isDown: boolean = false;
  private penHandle: Pointer | bigint | null = null;
  private oldPen: Pointer | bigint | null = null;
  private brushHandle: Pointer | bigint | null = null;
  private oldBrush: Pointer | bigint | null = null;
  private color: RGB;
  private width: number;
  private style: PenStyle;

  constructor(private window: OverlayWindow, options: PenOptions) {
    if (!window) {
      throw new Error("OverlayWindow instance is required");
    }
    if (!options.color) {
      throw new Error("Pen color is required");
    }
    this.color = options.color;
    this.width = options.width ?? 1;
    this.style = options.style ?? PenStyle.SOLID;
    this.createPenHandle();
  }

  /**
   * Create the GDI pen handle
   */
  private createPenHandle(): void {
    if (this.penHandle) {
      actions.deleteObject(this.penHandle);
    }

    this.penHandle = actions.createPen(this.style, this.width, this.color);

    const dc = this.window.getDC();
    if (dc && this.penHandle) {
      this.oldPen = actions.selectObject(dc, this.penHandle);
    }
  }

  /**
   * Move the pen to a specified position
   * If pen is down, draws a line to the position
   * If pen is up, just moves without drawing
   * @param x - X coordinate
   * @param y - Y coordinate
   * @returns this for method chaining
   */
  move(x: number, y: number): this {
    const dc = this.window.getDC();
    if (!dc) return this;

    if (this.isDown) {
      actions.lineTo(dc, x, y);
    } else {
      actions.moveToEx(dc, x, y);
    }

    this.currentX = x;
    this.currentY = y;

    return this;
  }

  /**
   * Put the pen down to start drawing
   * @returns this for method chaining
   */
  down(): this {
    this.isDown = true;
    return this;
  }

  /**
   * Lift the pen up to stop drawing
   * @returns this for method chaining
   */
  up(): this {
    this.isDown = false;
    this.window.update();
    return this;
  }

  /**
   * Draw a line to the specified position (only if pen is down)
   * @param x - X coordinate
   * @param y - Y coordinate
   * @returns this for method chaining
   */
  lineTo(x: number, y: number): this {
    const dc = this.window.getDC();
    if (!dc) return this;

    if (this.isDown) {
      actions.lineTo(dc, x, y);
    } else {
      actions.moveToEx(dc, x, y);
    }

    this.currentX = x;
    this.currentY = y;

    return this;
  }

  /**
   * Draw a complete line from one point to another
   * @param x1 - Start X coordinate
   * @param y1 - Start Y coordinate
   * @param x2 - End X coordinate
   * @param y2 - End Y coordinate
   * @returns this for method chaining
   */
  drawLine(x1: number, y1: number, x2: number, y2: number): this {
    try {
      const dc = this.window.getDC();
      if (!dc) {
        console.warn("No DC available for drawing");
        return this;
      }

      actions.moveToEx(dc, x1, y1);
      actions.lineTo(dc, x2, y2);
      this.window.update();

      this.currentX = x2;
      this.currentY = y2;
    } catch (error) {
      console.error("Error in drawLine:", error);
    }

    return this;
  }

  /**
   * Draw a rectangle
   * @param x - X coordinate of top-left corner
   * @param y - Y coordinate of top-left corner
   * @param width - Width of the rectangle
   * @param height - Height of the rectangle
   * @returns this for method chaining
   */
  drawRect(x: number, y: number, width: number, height: number): this {
    const dc = this.window.getDC();
    if (!dc) return this;

    const oldBrush = actions.selectObject(
      dc,
      actions.getStockObject(actions.NULL_BRUSH)
    );
    actions.drawRectangle(dc, x, y, x + width, y + height);
    actions.selectObject(dc, oldBrush);
    this.window.update();

    return this;
  }

  /**
   * Draw an ellipse
   * @param x - X coordinate of bounding box top-left corner
   * @param y - Y coordinate of bounding box top-left corner
   * @param width - Width of the ellipse
   * @param height - Height of the ellipse
   * @returns this for method chaining
   */
  drawEllipse(x: number, y: number, width: number, height: number): this {
    const dc = this.window.getDC();
    if (!dc) return this;

    const oldBrush = actions.selectObject(
      dc,
      actions.getStockObject(actions.NULL_BRUSH)
    );
    actions.drawEllipse(dc, x, y, x + width, y + height);
    actions.selectObject(dc, oldBrush);
    this.window.update();

    return this;
  }

  /**
   * Change the pen color
   * @param color - New RGB color
   * @returns this for method chaining
   */
  setColor(color: RGB): this {
    this.color = color;
    this.createPenHandle();
    return this;
  }

  /**
   * Change the pen width
   * @param width - New pen width in pixels
   * @returns this for method chaining
   */
  setWidth(width: number): this {
    this.width = width;
    this.createPenHandle();
    return this;
  }

  /**
   * Get current pen position
   * @returns Current position as {x, y}
   */
  getPosition(): { x: number; y: number } {
    return { x: this.currentX, y: this.currentY };
  }

  /**
   * Draw a filled rectangle
   * @param x - X coordinate of top-left corner
   * @param y - Y coordinate of top-left corner
   * @param width - Width of the rectangle
   * @param height - Height of the rectangle
   * @returns this for method chaining
   */
  drawFilledRect(x: number, y: number, width: number, height: number): this {
    const dc = this.window.getDC();
    if (!dc) return this;

    this.brushHandle = actions.createSolidBrush(this.color);
    this.oldBrush = actions.selectObject(dc, this.brushHandle);

    actions.drawRectangle(dc, x, y, x + width, y + height);

    if (this.oldBrush) {
      actions.selectObject(dc, this.oldBrush);
    }
    if (this.brushHandle) {
      actions.deleteObject(this.brushHandle);
      this.brushHandle = null;
    }

    this.window.update();
    return this;
  }

  /**
   * Draw a filled ellipse
   * @param x - X coordinate of bounding box top-left corner
   * @param y - Y coordinate of bounding box top-left corner
   * @param width - Width of the ellipse
   * @param height - Height of the ellipse
   * @returns this for method chaining
   */
  drawFilledEllipse(x: number, y: number, width: number, height: number): this {
    const dc = this.window.getDC();
    if (!dc) return this;

    this.brushHandle = actions.createSolidBrush(this.color);
    this.oldBrush = actions.selectObject(dc, this.brushHandle);

    actions.drawEllipse(dc, x, y, x + width, y + height);
    if (this.oldBrush) {
      actions.selectObject(dc, this.oldBrush);
    }
    if (this.brushHandle) {
      actions.deleteObject(this.brushHandle);
      this.brushHandle = null;
    }

    this.window.update();
    return this;
  }

  destroy(): void {
    const dc = this.window.getDC();

    if (dc && this.oldPen) {
      actions.selectObject(dc, this.oldPen);
      this.oldPen = null;
    }
    if (this.penHandle) {
      actions.deleteObject(this.penHandle);
      this.penHandle = null;
    }

    if (this.brushHandle) {
      actions.deleteObject(this.brushHandle);
      this.brushHandle = null;
    }
  }
}
