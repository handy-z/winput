import type { RGB, ImageData } from "../types";

export interface DrawOptions {
  color?: RGB;
  thickness?: number;
}

export function setPixel(
  img: ImageData,
  px: number,
  py: number,
  color: RGB
): void {
  if (px < 0 || px >= img.width || py < 0 || py >= img.height) return;
  const idx = (py * img.width + px) * 4;
  img.buffer[idx] = color.b;
  img.buffer[idx + 1] = color.g;
  img.buffer[idx + 2] = color.r;
  img.buffer[idx + 3] = 255;
}

export function drawRectangle(
  img: ImageData,
  x: number,
  y: number,
  width: number,
  height: number,
  options: DrawOptions = {}
): void {
  const { color = { r: 0, g: 255, b: 0 }, thickness = 2 } = options;

  for (let t = 0; t < thickness; t++) {
    for (let i = 0; i < width; i++) {
      setPixel(img, x + i, y + t, color);
      setPixel(img, x + i, y + height - 1 - t, color);
    }
  }

  for (let t = 0; t < thickness; t++) {
    for (let i = 0; i < height; i++) {
      setPixel(img, x + t, y + i, color);
      setPixel(img, x + width - 1 - t, y + i, color);
    }
  }
}

export function drawCircle(
  img: ImageData,
  centerX: number,
  centerY: number,
  radius: number,
  options: DrawOptions = {}
): void {
  const { color = { r: 0, g: 255, b: 0 }, thickness = 1 } = options;

  const drawCirclePoints = (x: number, y: number) => {
    setPixel(img, centerX + x, centerY + y, color);
    setPixel(img, centerX - x, centerY + y, color);
    setPixel(img, centerX + x, centerY - y, color);
    setPixel(img, centerX - x, centerY - y, color);
    setPixel(img, centerX + y, centerY + x, color);
    setPixel(img, centerX - y, centerY + x, color);
    setPixel(img, centerX + y, centerY - x, color);
    setPixel(img, centerX - y, centerY - x, color);
  };

  for (let t = 0; t < thickness; t++) {
    const r = radius - Math.floor(thickness / 2) + t;
    if (r < 0) continue;

    let x = 0;
    let y = r;
    let d = 1 - r;

    drawCirclePoints(x, y);

    while (x < y) {
      x++;
      if (d < 0) {
        d += 2 * x + 1;
      } else {
        y--;
        d += 2 * (x - y) + 1;
      }
      drawCirclePoints(x, y);
    }
  }
}

export function drawLine(
  img: ImageData,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  options: DrawOptions = {}
): void {
  const { color = { r: 0, g: 255, b: 0 }, thickness = 2 } = options;

  const drawThickPoint = (px: number, py: number) => {
    const halfThick = Math.floor(thickness / 2);
    for (let dy = -halfThick; dy <= halfThick; dy++) {
      for (let dx = -halfThick; dx <= halfThick; dx++) {
        if (dx * dx + dy * dy <= halfThick * halfThick + halfThick) {
          setPixel(img, px + dx, py + dy, color);
        }
      }
    }
  };

  const dx = Math.abs(x2 - x1);
  const dy = Math.abs(y2 - y1);
  const sx = x1 < x2 ? 1 : -1;
  const sy = y1 < y2 ? 1 : -1;
  let err = dx - dy;

  let x = x1;
  let y = y1;

  while (true) {
    drawThickPoint(x, y);

    if (x === x2 && y === y2) break;

    const e2 = 2 * err;
    if (e2 > -dy) {
      err -= dy;
      x += sx;
    }
    if (e2 < dx) {
      err += dx;
      y += sy;
    }
  }
}

export function fillRectangle(
  img: ImageData,
  x: number,
  y: number,
  width: number,
  height: number,
  color: RGB = { r: 0, g: 255, b: 0 }
): void {
  for (let py = 0; py < height; py++) {
    for (let px = 0; px < width; px++) {
      setPixel(img, x + px, y + py, color);
    }
  }
}

export function fillCircle(
  img: ImageData,
  centerX: number,
  centerY: number,
  radius: number,
  color: RGB = { r: 0, g: 255, b: 0 }
): void {
  const rSquared = radius * radius;
  for (let y = -radius; y <= radius; y++) {
    for (let x = -radius; x <= radius; x++) {
      if (x * x + y * y <= rSquared) {
        setPixel(img, centerX + x, centerY + y, color);
      }
    }
  }
}

export interface EllipseOptions extends DrawOptions {
  filled?: boolean;
}

export function drawEllipse(
  img: ImageData,
  centerX: number,
  centerY: number,
  radiusX: number,
  radiusY: number,
  options: EllipseOptions = {}
): void {
  const {
    color = { r: 0, g: 255, b: 0 },
    thickness = 1,
    filled = false,
  } = options;

  if (filled) {
    for (let y = -radiusY; y <= radiusY; y++) {
      for (let x = -radiusX; x <= radiusX; x++) {
        if (
          (x * x) / (radiusX * radiusX) + (y * y) / (radiusY * radiusY) <=
          1
        ) {
          setPixel(img, centerX + x, centerY + y, color);
        }
      }
    }
    return;
  }

  const drawEllipsePoints = (x: number, y: number) => {
    setPixel(img, centerX + x, centerY + y, color);
    setPixel(img, centerX - x, centerY + y, color);
    setPixel(img, centerX + x, centerY - y, color);
    setPixel(img, centerX - x, centerY - y, color);
  };

  let x = 0;
  let y = radiusY;
  let rx2 = radiusX * radiusX;
  let ry2 = radiusY * radiusY;
  let twoRx2 = 2 * rx2;
  let twoRy2 = 2 * ry2;
  let p;
  let px = 0;
  let py = twoRx2 * y;

  for (let t = 0; t < thickness; t++) {
    const currentRx = radiusX - Math.floor(thickness / 2) + t;
    const currentRy = radiusY - Math.floor(thickness / 2) + t;
    if (currentRx < 0 || currentRy < 0) continue;

    x = 0;
    y = currentRy;
    rx2 = currentRx * currentRx;
    ry2 = currentRy * currentRy;
    twoRx2 = 2 * rx2;
    twoRy2 = 2 * ry2;
    px = 0;
    py = twoRx2 * y;

    p = ry2 - rx2 * currentRy + 0.25 * rx2;
    while (px < py) {
      drawEllipsePoints(x, y);
      x++;
      px += twoRy2;
      if (p < 0) {
        p += ry2 + px;
      } else {
        y--;
        py -= twoRx2;
        p += ry2 + px - py;
      }
    }

    p = ry2 * (x + 0.5) * (x + 0.5) + rx2 * (y - 1) * (y - 1) - rx2 * ry2;
    while (y >= 0) {
      drawEllipsePoints(x, y);
      y--;
      py -= twoRx2;
      if (p > 0) {
        p += rx2 - py;
      } else {
        x++;
        px += twoRy2;
        p += rx2 - py + px;
      }
    }
  }
}

export interface PolygonOptions extends DrawOptions {
  filled?: boolean;
}

export function drawPolygon(
  img: ImageData,
  points: Array<{ x: number; y: number }>,
  options: PolygonOptions = {}
): void {
  if (points.length < 2) return;

  const {
    color = { r: 0, g: 255, b: 0 },
    thickness = 2,
    filled = false,
  } = options;

  if (filled) {
    if (points.length < 3) return;

    let minY = points[0].y;
    let maxY = points[0].y;
    for (const p of points) {
      if (p.y < minY) minY = p.y;
      if (p.y > maxY) maxY = p.y;
    }

    for (let y = Math.floor(minY); y <= Math.ceil(maxY); y++) {
      const intersections: number[] = [];

      for (let i = 0; i < points.length; i++) {
        const p1 = points[i];
        const p2 = points[(i + 1) % points.length];

        if ((p1.y <= y && p2.y > y) || (p2.y <= y && p1.y > y)) {
          const x = p1.x + ((y - p1.y) * (p2.x - p1.x)) / (p2.y - p1.y);
          intersections.push(x);
        }
      }

      intersections.sort((a, b) => a - b);

      for (let i = 0; i < intersections.length; i += 2) {
        if (i + 1 < intersections.length) {
          const x1 = Math.floor(intersections[i]);
          const x2 = Math.ceil(intersections[i + 1]);
          for (let x = x1; x <= x2; x++) {
            setPixel(img, x, y, color);
          }
        }
      }
    }
  } else {
    for (let i = 0; i < points.length; i++) {
      const p1 = points[i];
      const p2 = points[(i + 1) % points.length];
      drawLine(img, p1.x, p1.y, p2.x, p2.y, { color, thickness });
    }
  }
}

export function drawArrow(
  img: ImageData,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  options: DrawOptions & { arrowSize?: number } = {}
): void {
  const {
    color = { r: 0, g: 255, b: 0 },
    thickness = 2,
    arrowSize = 10,
  } = options;

  drawLine(img, x1, y1, x2, y2, { color, thickness });

  const angle = Math.atan2(y2 - y1, x2 - x1);
  const arrowAngle = Math.PI / 6;

  const arrowX1 = Math.floor(
    x2 - arrowSize * Math.cos(angle - arrowAngle)
  );
  const arrowY1 = Math.floor(
    y2 - arrowSize * Math.sin(angle - arrowAngle)
  );
  const arrowX2 = Math.floor(
    x2 - arrowSize * Math.cos(angle + arrowAngle)
  );
  const arrowY2 = Math.floor(
    y2 - arrowSize * Math.sin(angle + arrowAngle)
  );

  drawLine(img, x2, y2, arrowX1, arrowY1, { color, thickness });
  drawLine(img, x2, y2, arrowX2, arrowY2, { color, thickness });
}

export function drawCross(
  img: ImageData,
  centerX: number,
  centerY: number,
  size: number,
  options: DrawOptions = {}
): void {
  const { color = { r: 0, g: 255, b: 0 }, thickness = 2 } = options;

  const halfSize = Math.floor(size / 2);
  drawLine(
    img,
    centerX - halfSize,
    centerY,
    centerX + halfSize,
    centerY,
    { color, thickness }
  );
  drawLine(
    img,
    centerX,
    centerY - halfSize,
    centerX,
    centerY + halfSize,
    { color, thickness }
  );
}

export function drawArc(
  img: ImageData,
  centerX: number,
  centerY: number,
  radius: number,
  startAngle: number,
  endAngle: number,
  options: DrawOptions = {}
): void {
  const { color = { r: 0, g: 255, b: 0 }, thickness = 2 } = options;

  const normalizeAngle = (angle: number) => {
    while (angle < 0) angle += 2 * Math.PI;
    while (angle >= 2 * Math.PI) angle -= 2 * Math.PI;
    return angle;
  };

  const start = normalizeAngle(startAngle);
  const end = normalizeAngle(endAngle);

  const angleInRange = (angle: number): boolean => {
    const a = normalizeAngle(angle);
    if (start <= end) {
      return a >= start && a <= end;
    } else {
      return a >= start || a <= end;
    }
  };

  const drawCirclePoint = (x: number, y: number) => {
    const angle = Math.atan2(y, x);
    if (angleInRange(angle)) {
      for (let t = 0; t < thickness; t++) {
        const offset = t - Math.floor(thickness / 2);
        setPixel(img, centerX + x + offset, centerY + y, color);
        setPixel(img, centerX + x, centerY + y + offset, color);
      }
    }
  };

  let x = 0;
  let y = radius;
  let d = 1 - radius;

  const drawSymmetricPoints = (x: number, y: number) => {
    drawCirclePoint(x, y);
    drawCirclePoint(-x, y);
    drawCirclePoint(x, -y);
    drawCirclePoint(-x, -y);
    drawCirclePoint(y, x);
    drawCirclePoint(-y, x);
    drawCirclePoint(y, -x);
    drawCirclePoint(-y, -x);
  };

  drawSymmetricPoints(x, y);

  while (x < y) {
    x++;
    if (d < 0) {
      d += 2 * x + 1;
    } else {
      y--;
      d += 2 * (x - y) + 1;
    }
    drawSymmetricPoints(x, y);
  }
}

export interface TextOptions {
  color?: RGB;
  size?: number;
  font?: "small" | "medium" | "large";
}

const FONT_5X7: { [key: string]: number[][] } = {
  A: [
    [0, 1, 1, 1, 0],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 1, 1, 1, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
  ],
  B: [
    [1, 1, 1, 1, 0],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 1, 1, 1, 0],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 1, 1, 1, 0],
  ],
  C: [
    [0, 1, 1, 1, 0],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 0],
    [1, 0, 0, 0, 0],
    [1, 0, 0, 0, 0],
    [1, 0, 0, 0, 1],
    [0, 1, 1, 1, 0],
  ],
  D: [
    [1, 1, 1, 1, 0],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 1, 1, 1, 0],
  ],
  E: [
    [1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0],
    [1, 0, 0, 0, 0],
    [1, 1, 1, 1, 0],
    [1, 0, 0, 0, 0],
    [1, 0, 0, 0, 0],
    [1, 1, 1, 1, 1],
  ],
  F: [
    [1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0],
    [1, 0, 0, 0, 0],
    [1, 1, 1, 1, 0],
    [1, 0, 0, 0, 0],
    [1, 0, 0, 0, 0],
    [1, 0, 0, 0, 0],
  ],
  G: [
    [0, 1, 1, 1, 0],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 0],
    [1, 0, 1, 1, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [0, 1, 1, 1, 0],
  ],
  H: [
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 1, 1, 1, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
  ],
  I: [
    [1, 1, 1, 1, 1],
    [0, 0, 1, 0, 0],
    [0, 0, 1, 0, 0],
    [0, 0, 1, 0, 0],
    [0, 0, 1, 0, 0],
    [0, 0, 1, 0, 0],
    [1, 1, 1, 1, 1],
  ],
  J: [
    [0, 0, 1, 1, 1],
    [0, 0, 0, 1, 0],
    [0, 0, 0, 1, 0],
    [0, 0, 0, 1, 0],
    [1, 0, 0, 1, 0],
    [1, 0, 0, 1, 0],
    [0, 1, 1, 0, 0],
  ],
  K: [
    [1, 0, 0, 0, 1],
    [1, 0, 0, 1, 0],
    [1, 0, 1, 0, 0],
    [1, 1, 0, 0, 0],
    [1, 0, 1, 0, 0],
    [1, 0, 0, 1, 0],
    [1, 0, 0, 0, 1],
  ],
  L: [
    [1, 0, 0, 0, 0],
    [1, 0, 0, 0, 0],
    [1, 0, 0, 0, 0],
    [1, 0, 0, 0, 0],
    [1, 0, 0, 0, 0],
    [1, 0, 0, 0, 0],
    [1, 1, 1, 1, 1],
  ],
  M: [
    [1, 0, 0, 0, 1],
    [1, 1, 0, 1, 1],
    [1, 0, 1, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
  ],
  N: [
    [1, 0, 0, 0, 1],
    [1, 1, 0, 0, 1],
    [1, 0, 1, 0, 1],
    [1, 0, 0, 1, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
  ],
  O: [
    [0, 1, 1, 1, 0],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [0, 1, 1, 1, 0],
  ],
  P: [
    [1, 1, 1, 1, 0],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 1, 1, 1, 0],
    [1, 0, 0, 0, 0],
    [1, 0, 0, 0, 0],
    [1, 0, 0, 0, 0],
  ],
  Q: [
    [0, 1, 1, 1, 0],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 1, 0, 1],
    [1, 0, 0, 1, 0],
    [0, 1, 1, 0, 1],
  ],
  R: [
    [1, 1, 1, 1, 0],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 1, 1, 1, 0],
    [1, 0, 1, 0, 0],
    [1, 0, 0, 1, 0],
    [1, 0, 0, 0, 1],
  ],
  S: [
    [0, 1, 1, 1, 0],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 0],
    [0, 1, 1, 1, 0],
    [0, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [0, 1, 1, 1, 0],
  ],
  T: [
    [1, 1, 1, 1, 1],
    [0, 0, 1, 0, 0],
    [0, 0, 1, 0, 0],
    [0, 0, 1, 0, 0],
    [0, 0, 1, 0, 0],
    [0, 0, 1, 0, 0],
    [0, 0, 1, 0, 0],
  ],
  U: [
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [0, 1, 1, 1, 0],
  ],
  V: [
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [0, 1, 0, 1, 0],
    [0, 0, 1, 0, 0],
  ],
  W: [
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 1, 0, 1],
    [1, 1, 0, 1, 1],
    [1, 0, 0, 0, 1],
  ],
  X: [
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [0, 1, 0, 1, 0],
    [0, 0, 1, 0, 0],
    [0, 1, 0, 1, 0],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
  ],
  Y: [
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [0, 1, 0, 1, 0],
    [0, 0, 1, 0, 0],
    [0, 0, 1, 0, 0],
    [0, 0, 1, 0, 0],
    [0, 0, 1, 0, 0],
  ],
  Z: [
    [1, 1, 1, 1, 1],
    [0, 0, 0, 0, 1],
    [0, 0, 0, 1, 0],
    [0, 0, 1, 0, 0],
    [0, 1, 0, 0, 0],
    [1, 0, 0, 0, 0],
    [1, 1, 1, 1, 1],
  ],
  "0": [
    [0, 1, 1, 1, 0],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 1, 1],
    [1, 0, 1, 0, 1],
    [1, 1, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [0, 1, 1, 1, 0],
  ],
  "1": [
    [0, 0, 1, 0, 0],
    [0, 1, 1, 0, 0],
    [0, 0, 1, 0, 0],
    [0, 0, 1, 0, 0],
    [0, 0, 1, 0, 0],
    [0, 0, 1, 0, 0],
    [0, 1, 1, 1, 0],
  ],
  "2": [
    [0, 1, 1, 1, 0],
    [1, 0, 0, 0, 1],
    [0, 0, 0, 0, 1],
    [0, 0, 0, 1, 0],
    [0, 0, 1, 0, 0],
    [0, 1, 0, 0, 0],
    [1, 1, 1, 1, 1],
  ],
  "3": [
    [0, 1, 1, 1, 0],
    [1, 0, 0, 0, 1],
    [0, 0, 0, 0, 1],
    [0, 0, 1, 1, 0],
    [0, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [0, 1, 1, 1, 0],
  ],
  "4": [
    [0, 0, 0, 1, 0],
    [0, 0, 1, 1, 0],
    [0, 1, 0, 1, 0],
    [1, 0, 0, 1, 0],
    [1, 1, 1, 1, 1],
    [0, 0, 0, 1, 0],
    [0, 0, 0, 1, 0],
  ],
  "5": [
    [1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0],
    [1, 1, 1, 1, 0],
    [0, 0, 0, 0, 1],
    [0, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [0, 1, 1, 1, 0],
  ],
  "6": [
    [0, 0, 1, 1, 0],
    [0, 1, 0, 0, 0],
    [1, 0, 0, 0, 0],
    [1, 1, 1, 1, 0],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [0, 1, 1, 1, 0],
  ],
  "7": [
    [1, 1, 1, 1, 1],
    [0, 0, 0, 0, 1],
    [0, 0, 0, 1, 0],
    [0, 0, 1, 0, 0],
    [0, 1, 0, 0, 0],
    [0, 1, 0, 0, 0],
    [0, 1, 0, 0, 0],
  ],
  "8": [
    [0, 1, 1, 1, 0],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [0, 1, 1, 1, 0],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [0, 1, 1, 1, 0],
  ],
  "9": [
    [0, 1, 1, 1, 0],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [0, 1, 1, 1, 1],
    [0, 0, 0, 0, 1],
    [0, 0, 0, 1, 0],
    [0, 1, 1, 0, 0],
  ],
  " ": [
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
  ],
};

export function drawText(
  img: ImageData,
  x: number,
  y: number,
  text: string,
  options: TextOptions = {}
): void {
  const { color = { r: 255, g: 255, b: 255 }, size = 1 } = options;

  let currentX = x;
  const charWidth = 5;
  const charHeight = 7;
  const spacing = 1;

  for (const char of text.toUpperCase()) {
    const bitmap = FONT_5X7[char];
    if (!bitmap) {
      currentX += (charWidth + spacing) * size;
      continue;
    }

    for (let row = 0; row < charHeight; row++) {
      for (let col = 0; col < charWidth; col++) {
        if (bitmap[row][col]) {
          for (let sy = 0; sy < size; sy++) {
            for (let sx = 0; sx < size; sx++) {
              setPixel(
                img,
                currentX + col * size + sx,
                y + row * size + sy,
                color
              );
            }
          }
        }
      }
    }

    currentX += (charWidth + spacing) * size;
  }
}
