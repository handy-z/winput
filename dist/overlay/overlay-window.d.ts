import type { Pointer } from "bun:ffi";
import { OverlayOptions } from "../types";
export declare class OverlayWindow {
    private options;
    private hwnd;
    private hdc;
    private x;
    private y;
    private width;
    private height;
    constructor(options?: OverlayOptions);
    create(): boolean;
    getHandle(): bigint;
    getDC(): bigint | Pointer;
    getDimensions(): {
        width: number;
        height: number;
    };
    isValid(): boolean;
    update(): void;
    clear(): void;
    show(): void;
    hide(): void;
    destroy(): void;
}
//# sourceMappingURL=overlay-window.d.ts.map