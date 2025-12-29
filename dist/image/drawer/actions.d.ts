import type { RGB, ImageData } from "../../types";
export interface DrawOptions {
    color?: RGB;
    thickness?: number;
}
export declare function setPixel(img: ImageData, px: number, py: number, color: RGB): void;
export declare function drawRectangle(img: ImageData, x: number, y: number, width: number, height: number, options?: DrawOptions): void;
export declare function drawCircle(img: ImageData, centerX: number, centerY: number, radius: number, options?: DrawOptions): void;
export declare function drawLine(img: ImageData, x1: number, y1: number, x2: number, y2: number, options?: DrawOptions): void;
export declare function fillRectangle(img: ImageData, x: number, y: number, width: number, height: number, color?: RGB): void;
export declare function fillCircle(img: ImageData, centerX: number, centerY: number, radius: number, color?: RGB): void;
export interface EllipseOptions extends DrawOptions {
    filled?: boolean;
}
export declare function drawEllipse(img: ImageData, centerX: number, centerY: number, radiusX: number, radiusY: number, options?: EllipseOptions): void;
export interface PolygonOptions extends DrawOptions {
    filled?: boolean;
}
export declare function drawPolygon(img: ImageData, points: Array<{
    x: number;
    y: number;
}>, options?: PolygonOptions): void;
export declare function drawArrow(img: ImageData, x1: number, y1: number, x2: number, y2: number, options?: DrawOptions & {
    arrowSize?: number;
}): void;
export declare function drawCross(img: ImageData, centerX: number, centerY: number, size: number, options?: DrawOptions): void;
export declare function drawArc(img: ImageData, centerX: number, centerY: number, radius: number, startAngle: number, endAngle: number, options?: DrawOptions): void;
export interface TextOptions {
    color?: RGB;
    size?: number;
    font?: "small" | "medium" | "large";
}
export declare function drawText(img: ImageData, x: number, y: number, text: string, options?: TextOptions): void;
//# sourceMappingURL=actions.d.ts.map