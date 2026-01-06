import * as actions from "./actions";

class Utils {
  /**
   * Convert RGB color to hex string.
   * @param rgb - RGB color object
   * @returns {string} Hex color string (e.g., "#FF0000")
   */
  rgbToHex = actions.rgbToHex;

  /**
   * Convert hex color string to RGB object.
   * @param hex - Hex color string (e.g., "#FF0000" or "FF0000")
   * @returns {RGB} RGB color object
   */
  hexToRgb = actions.hexToRgb;

  /**
   * Convert RGB color to HSV color.
   * @param r - Red component (0-255)
   * @param g - Green component (0-255)
   * @param b - Blue component (0-255)
   * @returns {HSV} HSV color object
   */
  rgbToHsv = actions.rgbToHsv;

  /**
   * Convert HSV color to RGB color.
   * @param h - Hue component (0-360)
   * @param s - Saturation component (0-1)
   * @param v - Value component (0-1)
   * @returns {RGB} RGB color object
   */
  hsvToRgb = actions.hsvToRgb;

  /**
   * Calculate Euclidean distance between two colors.
   * @param c1 - First RGB color
   * @param c2 - Second RGB color
   * @returns {number} Color distance (0-441.67)
   */
  colorDistance = actions.colorDistance;

  /**
   * Check if two colors are similar within a tolerance.
   * @param c1 - First RGB color
   * @param c2 - Second RGB color
   * @param tolerance - Euclidean distance tolerance
   * @returns {boolean} True if similar
   */
  isColorSimilar = actions.isColorSimilar;

  /**
   * Check if a point is within a rectangle.
   * @param p - Point {x, y}
   * @param r - Rectangle {left, top, right, bottom}
   * @returns {boolean} True if point is inside
   */
  pointInRect = actions.pointInRect;
}

/**
 * Utility functions
 */
export const utils = new Utils();
