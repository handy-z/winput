import type { RGB } from "./windows";

/**
 * Pen drawing style
 */
export enum PenStyle {
  SOLID = 0,      // PS_SOLID
  DASH = 1,       // PS_DASH
  DOT = 2,        // PS_DOT
  DASHDOT = 3,    // PS_DASHDOT
  DASHDOTDOT = 4, // PS_DASHDOTDOT
}

/**
 * Options for creating a pen
 */
export interface PenOptions {
  /** RGB color for the pen */
  color: RGB;
  /** Width of the pen in pixels (default: 1) */
  width?: number;
  /** Drawing style (default: SOLID) */
  style?: PenStyle;
}

/**
 * Options for creating an overlay window
 */
export interface OverlayOptions {
  /** X position of the overlay window (default: 0) */
  x?: number;
  /** Y position of the overlay window (default: 0) */
  y?: number;
  /** Width of the overlay window (default: screen width) */
  width?: number;
  /** Height of the overlay window (default: screen height) */
  height?: number;
  /** Whether the overlay should be click-through (default: true) */
  clickThrough?: boolean;
  /** Whether the overlay should be topmost (default: true) */
  topmost?: boolean;
}

/**
 * Fill mode for polygon regions
 */
export enum FillMode {
  ALTERNATE = 1, // ALTERNATE
  WINDING = 2,   // WINDING
}

/**
 * Text alignment options
 */
export enum TextAlignment {
  LEFT = 0,     // TA_LEFT
  CENTER = 6,   // TA_CENTER
  RIGHT = 2,    // TA_RIGHT
  TOP = 0,      // TA_TOP
  BASELINE = 24, // TA_BASELINE
  BOTTOM = 8,   // TA_BOTTOM
}

/**
 * Options for text drawing
 */
export interface TextOptions {
  /** Font size in pixels (default: 16) */
  size?: number;
  /** Font family name (default: "Arial") */
  fontFamily?: string;
  /** Bold text (default: false) */
  bold?: boolean;
  /** Italic text (default: false) */
  italic?: boolean;
  /** Underline text (default: false) */
  underline?: boolean;
  /** Text alignment (default: LEFT | TOP) */
  alignment?: number;
  /** Background mode - true for transparent (default: true) */
  transparent?: boolean;
}