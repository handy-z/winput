import type { WindowInfo, ExtendedWindowInfo, Rect, Size } from "../types/windows";
declare const STYLES: {
    WS_OVERLAPPED: number;
    WS_POPUP: number;
    WS_CHILD: number;
    WS_MINIMIZE: number;
    WS_VISIBLE: number;
    WS_DISABLED: number;
    WS_CLIPSIBLINGS: number;
    WS_CLIPCHILDREN: number;
    WS_MAXIMIZE: number;
    WS_CAPTION: number;
    WS_BORDER: number;
    WS_DLGFRAME: number;
    WS_VSCROLL: number;
    WS_HSCROLL: number;
    WS_SYSMENU: number;
    WS_THICKFRAME: number;
    WS_GROUP: number;
    WS_TABSTOP: number;
    WS_MINIMIZEBOX: number;
    WS_MAXIMIZEBOX: number;
};
declare const EX_STYLES: {
    WS_EX_DLGMODALFRAME: number;
    WS_EX_NOPARENTNOTIFY: number;
    WS_EX_TOPMOST: number;
    WS_EX_ACCEPTFILES: number;
    WS_EX_TRANSPARENT: number;
    WS_EX_MDICHILD: number;
    WS_EX_TOOLWINDOW: number;
    WS_EX_WINDOWEDGE: number;
    WS_EX_CLIENTEDGE: number;
    WS_EX_CONTEXTHELP: number;
    WS_EX_RIGHT: number;
    WS_EX_LEFT: number;
    WS_EX_RTLREADING: number;
    WS_EX_LTRREADING: number;
    WS_EX_LEFTSCROLLBAR: number;
    WS_EX_RIGHTSCROLLBAR: number;
    WS_EX_CONTROLPARENT: number;
    WS_EX_STATICEDGE: number;
    WS_EX_APPWINDOW: number;
    WS_EX_LAYERED: number;
    WS_EX_NOINHERITLAYOUT: number;
    WS_EX_NOREDIRECTIONBITMAP: number;
    WS_EX_LAYOUTRTL: number;
    WS_EX_COMPOSITED: number;
    WS_EX_NOACTIVATE: number;
};
export interface CreateWindowOptions {
    windowName?: string;
    className?: string;
    styles?: (keyof typeof STYLES)[];
    exStyles?: (keyof typeof EX_STYLES)[];
    x?: number;
    y?: number;
    width?: number;
    height?: number;
}
export declare function createWindow(options?: CreateWindowOptions): bigint | null;
export declare function createWindowEx(options?: CreateWindowOptions): bigint | null;
/**
 * Registers a custom window class.
 * This is necessary for cleaner custom windows without default system backgrounds.
 *
 * @param className - Name of the class to register
 * @param backgroundBrush - Background brush handle (default: NULL/Transparent)
 * @returns Atom identifying the class, or 0 on failure
 */
export declare function registerWindowClass(className: string, backgroundBrush?: number | bigint | null): number;
export declare function getActiveWindow(): WindowInfo | null;
export declare function getWindowTitle(hwnd?: number | bigint): string;
export declare function getWindowRect(hwnd: number | bigint): Rect | null;
export declare function isWindowVisible(hwnd: number | bigint): boolean;
export declare function setForeground(hwnd: number | bigint): boolean;
export declare function findWindow(title: string): bigint | null;
export declare function waitForWindow(title: string, timeout?: number): Promise<bigint | null>;
export declare function getWindowProcessId(hwnd: number | bigint): number;
export declare function getClassName(hwnd: number | bigint): string;
export declare function isWindowMinimized(hwnd: number | bigint): boolean;
export declare function isWindowMaximized(hwnd: number | bigint): boolean;
export declare function minimizeWindow(hwnd: number | bigint): boolean;
export declare function maximizeWindow(hwnd: number | bigint): boolean;
export declare function restoreWindow(hwnd: number | bigint): boolean;
export declare function showWindow(hwnd: number | bigint): boolean;
export declare function hideWindow(hwnd: number | bigint): boolean;
export declare function closeWindow(hwnd: number | bigint): boolean;
export declare function moveWindow(hwnd: number | bigint, x: number, y: number, width: number, height: number, repaint?: boolean): boolean;
export declare function centerWindow(hwnd: number | bigint): boolean;
export declare function getClientRect(hwnd: number | bigint): Rect | null;
export declare function getWindowSize(hwnd: number | bigint): Size | null;
export declare function getClientSize(hwnd: number | bigint): Size | null;
export declare function isWindow(hwnd: number | bigint): boolean;
export declare function getExtendedWindowInfo(hwnd: number | bigint): ExtendedWindowInfo | null;
export declare function waitForWindowClose(hwnd: number | bigint, timeout?: number): Promise<boolean>;
export declare function focusWindow(hwnd: number | bigint, timeout?: number): Promise<boolean>;
export declare function enumWindows(): ExtendedWindowInfo[];
export declare function enumChildWindows(parentHwnd: number | bigint): bigint[];
export declare function flashWindow(hwnd: number | bigint, invert?: boolean): boolean;
export declare function setWindowOpacity(hwnd: number | bigint, opacity: number): boolean;
export declare function setWindowTopmost(hwnd: number | bigint, enable: boolean): boolean;
export declare function setWindowTitle(hwnd: number | bigint, title: string): boolean;
export declare function setWindowEnabled(hwnd: number | bigint, enabled: boolean): boolean;
export declare function redrawWindow(hwnd: number | bigint): boolean;
export declare function moveWindowToBottom(hwnd: number | bigint): boolean;
export declare function moveWindowToTop(hwnd: number | bigint): boolean;
export declare function getWindowProcessPath(hwnd: number | bigint): string;
export declare function clientToScreen(hwnd: number | bigint, x: number, y: number): {
    x: number;
    y: number;
} | null;
export declare function screenToClient(hwnd: number | bigint, x: number, y: number): {
    x: number;
    y: number;
} | null;
export declare function activateWindow(hwnd: number | bigint): boolean;
export declare function waitActiveWindow(hwnd: number | bigint, timeout?: number): Promise<boolean>;
export declare function waitNotActiveWindow(hwnd: number | bigint, timeout?: number): Promise<boolean>;
export declare function killWindow(hwnd: number | bigint): boolean;
export declare function getWindowStyle(hwnd: number | bigint): number;
export declare function setWindowStyle(hwnd: number | bigint, style: keyof typeof STYLES): number;
export declare function getWindowExStyle(hwnd: number | bigint): number;
export declare function setWindowExStyle(hwnd: number | bigint, style: keyof typeof EX_STYLES): number;
export declare function getWindowMinMax(hwnd: number | bigint): number;
export declare function getWindowList(): bigint[];
export declare function getWindowCount(): number;
export declare function minimizeAll(): void;
export declare function getWindowProcessName(hwnd: number | bigint): string;
export declare function getWindowText(hwnd: number | bigint): string;
export declare function setWindowRegionRect(hwnd: number | bigint, x: number, y: number, w: number, h: number, redraw?: boolean): boolean;
export declare function setWindowRegionEllipse(hwnd: number | bigint, x: number, y: number, w: number, h: number, redraw?: boolean): boolean;
export declare function setWindowRegionRound(hwnd: number | bigint, x: number, y: number, w: number, h: number, rw: number, rh: number, redraw?: boolean): boolean;
export declare function setWindowRegionPolygon(hwnd: number | bigint, points: {
    x: number;
    y: number;
}[], fillMode?: number, redraw?: boolean): boolean;
export declare function resetWindowRegion(hwnd: number | bigint, redraw?: boolean): boolean;
export {};
//# sourceMappingURL=actions.d.ts.map