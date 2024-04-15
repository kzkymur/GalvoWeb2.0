import { Coordinate } from "./calcHomography";
import { LineSegment } from "./math";

export const renderCopy = (
  ctx: CanvasRenderingContext2D,
  orgCtx: CanvasRenderingContext2D
) => {
  ctx.putImageData(
    orgCtx.getImageData(0, 0, orgCtx.canvas.width, orgCtx.canvas.height),
    0,
    0
  );
};

export const renderDot = (
  ctx: CanvasRenderingContext2D,
  color: string,
  pixel: Coordinate,
  size: number
) => {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(pixel.x, pixel.y, size, 0, 2 * Math.PI);
  ctx.fill();
  ctx.closePath();
};

export const renderLine = (
  ctx: CanvasRenderingContext2D,
  lineSegment: LineSegment,
  width: number,
  color: string
) => {
  const { s, e } = lineSegment;
  ctx.beginPath();
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.moveTo(s.x, s.y);
  ctx.lineTo(e.x, e.y);
  ctx.stroke();
  ctx.closePath();
};
