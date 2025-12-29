import type { ImageData } from "../../types/image";
export declare class ImageDisplay {
    protected imageData: ImageData;
    constructor(imageData: ImageData);
    /**
     * Displays this image in a window (similar to OpenCV's cv2.imshow).
     *
     * @param windowName - Name of the window (default: "Image")
     * @param waitKey - Time to wait in milliseconds (0 = wait for key press, undefined = return immediately)
     * @returns {this} This instance for chaining
     * @example
     * ```typescript
     * const img = await image.load("photo.png");
     * img.display().show("My Window");
     *
     * // With wait
     * img.display().show("My Window", 0); // Wait for key press
     * ```
     */
    show(windowName?: string, waitKey?: number): this;
    /**
     * Destroys a specific window.
     *
     * @param windowName - Name of the window to destroy
     * @returns {this} This instance for chaining
     * @example
     * ```typescript
     * img.display().show("Window 1").destroyWindow("Window 1");
     * ```
     */
    destroyWindow(windowName: string): this;
    /**
     * Destroys all windows.
     *
     * @returns {this} This instance for chaining
     * @example
     * ```typescript
     * img.display().destroyAllWindows();
     * ```
     */
    destroyAllWindows(): this;
}
//# sourceMappingURL=class.d.ts.map