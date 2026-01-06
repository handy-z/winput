import type { ImageData } from "../types";
import * as actions from "./actions";

export class ImageDrawer {
  protected imageData: ImageData;

  constructor(imageData: ImageData) {
    this.imageData = imageData;
  }

  /**
   * Draws a rectangle outline on the image.
   *
   * @param x - X coordinate of top-left corner
   * @param y - Y coordinate of top-left corner
   * @param width - Width of rectangle in pixels
   * @param height - Height of rectangle in pixels
   * @param options - Drawing options
   * @param options.color - RGB color of the rectangle (default: green)
   * @param options.thickness - Line thickness in pixels (default: 2)
   * @returns {this} This instance for chaining
   * @example
   * ```typescript
   * img.drawer().rectangle(100, 100, 200, 150);
   * img.drawer().rectangle(50, 50, 300, 200, {
   *   color: { r: 255, g: 0, b: 0 },
   *   thickness: 4
   * });
   * ```
   */
  rectangle(
    x: number,
    y: number,
    width: number,
    height: number,
    options: actions.DrawOptions = {}
  ): this {
    actions.drawRectangle(
      this.imageData,
      x,
      y,
      width,
      height,
      options
    );
    return this;
  }

  /**
   * Draws a circle outline using the Midpoint Circle Algorithm.
   *
   * @param centerX - X coordinate of circle center
   * @param centerY - Y coordinate of circle center
   * @param radius - Circle radius in pixels
   * @param options - Drawing options
   * @param options.color - RGB color of the circle (default: green)
   * @param options.thickness - Line thickness in pixels (default: 1)
   * @returns {this} This instance for chaining
   * @example
   * ```typescript
   * img.drawer().circle(200, 200, 50);
   * img.drawer().circle(300, 300, 75, {
   *   color: { r: 0, g: 0, b: 255 },
   *   thickness: 3
   * });
   * ```
   */
  circle(
    centerX: number,
    centerY: number,
    radius: number,
    options: actions.DrawOptions = {}
  ): this {
    actions.drawCircle(
      this.imageData,
      centerX,
      centerY,
      radius,
      options
    );
    return this;
  }

  /**
   * Draws a line using Bresenham's line algorithm.
   *
   * @param x1 - Starting X coordinate
   * @param y1 - Starting Y coordinate
   * @param x2 - Ending X coordinate
   * @param y2 - Ending Y coordinate
   * @param options - Drawing options
   * @param options.color - RGB color of the line (default: green)
   * @param options.thickness - Line thickness in pixels (default: 2)
   * @returns {this} This instance for chaining
   * @example
   * ```typescript
   * img.drawer().line(0, 0, 300, 300);
   * img.drawer().line(100, 100, 400, 200, {
   *   color: { r: 255, g: 255, b: 0 },
   *   thickness: 3
   * });
   * ```
   */
  line(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    options: actions.DrawOptions = {}
  ): this {
    actions.drawLine(
      this.imageData,
      x1,
      y1,
      x2,
      y2,
      options
    );
    return this;
  }

  /**
   * Draws a filled rectangle on the image.
   *
   * @param x - X coordinate of top-left corner
   * @param y - Y coordinate of top-left corner
   * @param width - Width of rectangle in pixels
   * @param height - Height of rectangle in pixels
   * @param color - RGB color of the filled rectangle (default: green)
   * @returns {this} This instance for chaining
   * @example
   * ```typescript
   * img.drawer().fillRect(100, 100, 200, 150);
   * img.drawer().fillRect(50, 50, 300, 200, { r: 255, g: 0, b: 0 });
   * ```
   */
  fillRect(
    x: number,
    y: number,
    width: number,
    height: number,
    color?: { r: number; g: number; b: number }
  ): this {
    actions.fillRectangle(this.imageData, x, y, width, height, color);
    return this;
  }

  /**
   * Draws a filled circle on the image.
   *
   * @param centerX - X coordinate of circle center
   * @param centerY - Y coordinate of circle center
   * @param radius - Circle radius in pixels
   * @param color - RGB color of the filled circle (default: green)
   * @returns {this} This instance for chaining
   * @example
   * ```typescript
   * img.drawer().fillCircle(200, 200, 50);
   * img.drawer().fillCircle(300, 300, 75, { r: 0, g: 0, b: 255 });
   * ```
   */
  fillCircle(
    centerX: number,
    centerY: number,
    radius: number,
    color?: { r: number; g: number; b: number }
  ): this {
    actions.fillCircle(this.imageData, centerX, centerY, radius, color);
    return this;
  }

  /**
   * Draws an ellipse (outline or filled) on the image.
   *
   * @param centerX - X coordinate of ellipse center
   * @param centerY - Y coordinate of ellipse center
   * @param radiusX - Horizontal radius in pixels
   * @param radiusY - Vertical radius in pixels
   * @param options - Drawing options
   * @param options.color - RGB color of the ellipse (default: green)
   * @param options.thickness - Line thickness in pixels for outline (default: 1)
   * @param options.filled - Whether to fill the ellipse (default: false)
   * @returns {this} This instance for chaining
   * @example
   * ```typescript
   * img.drawer().ellipse(200, 150, 100, 50);
   * img.drawer().ellipse(300, 250, 80, 120, {
   *   color: { r: 255, g: 0, b: 255 },
   *   filled: true
   * });
   * ```
   */
  ellipse(
    centerX: number,
    centerY: number,
    radiusX: number,
    radiusY: number,
    options: actions.EllipseOptions = {}
  ): this {
    actions.drawEllipse(
      this.imageData,
      centerX,
      centerY,
      radiusX,
      radiusY,
      options
    );
    return this;
  }

  /**
   * Draws a polygon (outline or filled) on the image.
   *
   * @param points - Array of polygon vertices as {x, y} coordinates
   * @param options - Drawing options
   * @param options.color - RGB color of the polygon (default: green)
   * @param options.thickness - Line thickness in pixels for outline (default: 1)
   * @param options.filled - Whether to fill the polygon (default: false)
   * @returns {this} This instance for chaining
   * @example
   * ```typescript
   * const triangle = [
   *   { x: 200, y: 100 },
   *   { x: 150, y: 200 },
   *   { x: 250, y: 200 }
   * ];
   * img.drawer().polygon(triangle);
   * img.drawer().polygon(triangle, {
   *   color: { r: 255, g: 128, b: 0 },
   *   filled: true
   * });
   * ```
   */
  polygon(
    points: Array<{ x: number; y: number }>,
    options: actions.PolygonOptions = {}
  ): this {
    actions.drawPolygon(this.imageData, points, options);
    return this;
  }

  /**
   * Draws an arrow from one point to another.
   *
   * @param x1 - Starting X coordinate
   * @param y1 - Starting Y coordinate
   * @param x2 - Ending X coordinate (arrowhead will point here)
   * @param y2 - Ending Y coordinate (arrowhead will point here)
   * @param options - Drawing options
   * @param options.color - RGB color of the arrow (default: green)
   * @param options.thickness - Line thickness in pixels (default: 2)
   * @param options.arrowSize - Size of the arrowhead in pixels (default: 10)
   * @returns {this} This instance for chaining
   * @example
   * ```typescript
   * img.drawer().arrow(100, 100, 300, 200);
   * img.drawer().arrow(150, 150, 350, 250, {
   *   color: { r: 255, g: 0, b: 0 },
   *   thickness: 3,
   *   arrowSize: 15
   * });
   * ```
   */
  arrow(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    options: actions.DrawOptions & { arrowSize?: number } = {}
  ): this {
    actions.drawArrow(this.imageData, x1, y1, x2, y2, options);
    return this;
  }

  /**
   * Draws a cross/plus marker on the image.
   *
   * @param centerX - X coordinate of cross center
   * @param centerY - Y coordinate of cross center
   * @param size - Size of the cross in pixels (total width/height)
   * @param options - Drawing options
   * @param options.color - RGB color of the cross (default: green)
   * @param options.thickness - Line thickness in pixels (default: 2)
   * @returns {this} This instance for chaining
   * @example
   * ```typescript
   * img.drawer().cross(200, 200, 20);
   * img.drawer().cross(300, 300, 30, {
   *   color: { r: 255, g: 255, b: 0 },
   *   thickness: 3
   * });
   * ```
   */
  cross(
    centerX: number,
    centerY: number,
    size: number,
    options: actions.DrawOptions = {}
  ): this {
    actions.drawCross(this.imageData, centerX, centerY, size, options);
    return this;
  }

  /**
   * Draws an arc (portion of a circle) on the image.
   *
   * @param centerX - X coordinate of arc center
   * @param centerY - Y coordinate of arc center
   * @param radius - Arc radius in pixels
   * @param startAngle - Starting angle in radians
   * @param endAngle - Ending angle in radians
   * @param options - Drawing options
   * @param options.color - RGB color of the arc (default: green)
   * @param options.thickness - Line thickness in pixels (default: 1)
   * @returns {this} This instance for chaining
   * @example
   * ```typescript
   * img.drawer().arc(200, 200, 50, 0, Math.PI);
   * img.drawer().arc(300, 300, 75, Math.PI / 4, (3 * Math.PI) / 2, {
   *   color: { r: 0, g: 255, b: 255 },
   *   thickness: 3
   * });
   * ```
   */
  arc(
    centerX: number,
    centerY: number,
    radius: number,
    startAngle: number,
    endAngle: number,
    options: actions.DrawOptions = {}
  ): this {
    actions.drawArc(
      this.imageData,
      centerX,
      centerY,
      radius,
      startAngle,
      endAngle,
      options
    );
    return this;
  }

  /**
   * Draws text on the image using a simple bitmap font.
   *
   * @param x - X coordinate for text start position
   * @param y - Y coordinate for text baseline
   * @param text - The text string to render
   * @param options - Text rendering options
   * @param options.color - RGB color of the text (default: green)
   * @param options.scale - Scale factor for text size (default: 1)
   * @returns {this} This instance for chaining
   * @example
   * ```typescript
   * img.drawer().text(100, 100, 'Hello World');
   * img.drawer().text(50, 200, 'Scaled Text', {
   *   color: { r: 255, g: 255, b: 255 },
   *   scale: 2
   * });
   * ```
   */
  text(
    x: number,
    y: number,
    text: string,
    options: actions.TextOptions = {}
  ): this {
    actions.drawText(this.imageData, x, y, text, options);
    return this;
  }
}
