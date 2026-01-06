export type MouseMoveEvent = {
  event: "move";
  x: number;
  y: number;
  lastX: number;
  lastY: number;
  deltaX: number;
  deltaY: number;
};
export type MouseDownEvent = {
  event: "down";
  button: "left" | "right" | "middle" | "x1" | "x2";
  x: number;
  y: number;
};
export type MouseUpEvent = {
  event: "up";
  button: "left" | "right" | "middle" | "x1" | "x2";
  x: number;
  y: number;
};

export type MouseEvent = MouseMoveEvent | MouseDownEvent | MouseUpEvent;

export type MouseEvents = {
  move: MouseMoveEvent;
  down: MouseDownEvent;
  up: MouseUpEvent;
};

export type MouseCallback = (ev: MouseEvent) => void;
