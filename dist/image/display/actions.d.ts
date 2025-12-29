import { ImageData } from "../../types/image";
import type { Image } from "../class";
export declare function imshow(windowName: string, img: Image | ImageData, waitKey?: number): void;
export declare function destroyWindow(windowName: string): void;
export declare function destroyAllWindows(): void;
export declare function waitKey(timeout?: number): Promise<number>;
//# sourceMappingURL=actions.d.ts.map