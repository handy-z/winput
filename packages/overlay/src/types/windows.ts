export interface RGB { r: number; g: number; b: number }
export interface Rect { left: number; top: number; right: number; bottom: number }
export interface Size { width: number; height: number }
export interface Point { x: number; y: number }
export interface WindowInfo {
  hwnd: number | bigint;
  title: string;
  rect: Rect;
  isFullscreen: boolean;
}
export interface ExtendedWindowInfo extends WindowInfo {
  processId: number;
  isVisible: boolean;
  isMinimized: boolean;
  isMaximized: boolean;
  className: string;
}
