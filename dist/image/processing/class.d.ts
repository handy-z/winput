import type { ImageData } from "../../types/image";
export declare class ImageProcessing {
    protected imageData: ImageData;
    constructor(imageData: ImageData);
    clone(): this;
    grayscale(): this;
    brightness(factor: number): this;
    contrast(factor: number): this;
    blur(radius?: number): this;
    sharpen(): this;
    edges(): this;
    dilate(pixels?: number): this;
    erode(pixels?: number): this;
    erode2dilate(pixels?: number): this;
    dilate2erode(pixels?: number): this;
    invert(): this;
    sepia(): this;
    hue(degrees: number): this;
    saturate(factor: number): this;
    rotate(degrees: number): this;
    flip(horizontal?: boolean, vertical?: boolean): this;
    crop(x: number, y: number, w: number, h: number): this;
    resize(newWidth: number, newHeight: number, algorithm?: "nearest" | "bilinear"): this;
    threshold(value?: number): this;
    adaptiveThreshold(blockSize?: number): this;
    medianFilter(radius?: number): this;
    bilateralFilter(spatialSigma?: number, rangeSigma?: number): this;
    histogram(): {
        r: number[];
        g: number[];
        b: number[];
    };
    autoLevel(): this;
    overlay(overlayImg: ImageData, x?: number, y?: number, alpha?: number): this;
    blend(img2: ImageData, mode?: "multiply" | "screen" | "overlay" | "add" | "subtract"): this;
    denoise(strength?: "light" | "medium" | "heavy"): this;
    toPixels(): [number, number, number, number][];
}
//# sourceMappingURL=class.d.ts.map