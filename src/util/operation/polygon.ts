import { Coordinate } from "../calcHomography";
import {
  LineSegment,
  distance,
  getCentroid,
  getCrossPoint,
  getTheta,
  isOnLineSegment,
  roundTheta,
} from "../math";
import { Brand, sleep } from "..";
import { renderDot } from "../canvas";
import { hsl } from "../color";
import { PolygonOperation, Shot, StopFlag } from ".";

// this is with ordered;
export type Polygon = Brand<Coordinate[], "polygon">;

export const getThetaForSort = (lineSegment: LineSegment) =>
  roundTheta(-getTheta(lineSegment) + Math.PI);

export const makePolygon = (pArray: Coordinate[]): Polygon => {
  if (pArray.length < 3) throw new Error("invalid points");
  const O = { x: 0, y: 0 };
  const remains = pArray
    .map((p) => ({ ...p, d: distance(O, p) }))
    .sort((a, b) => a.d - b.d);
  const polygon = [remains.splice(0, 1)[0]] as Coordinate[];

  while (remains.length !== 0) {
    const s = polygon[polygon.length - 1];
    remains.sort(
      (a, b) =>
        getThetaForSort(LineSegment(s, a)) - getThetaForSort(LineSegment(s, b))
    );
    console.log({ ...s });
    console.log(
      remains.map((p) => ({
        ...p,
        t: getThetaForSort(LineSegment(s, p)),
      }))
    );
    polygon.push(remains.splice(0, 1)[0]);
  }

  return polygon as Polygon;
};

export class CreatePolygonKit {
  private pointStack: Coordinate[] = [];
  public readonly ctx: CanvasRenderingContext2D;
  public readonly color: string;
  constructor(ctx: CanvasRenderingContext2D, color?: string) {
    this.ctx = ctx;
    this.color = color || hsl(Math.random());
  }
  public push(p: Coordinate) {
    this.pointStack.push(p);
  }
  public getNowLength() {
    return this.pointStack.length;
  }
  public isValid() {
    return this.getNowLength() >= 3;
  }
  public clear() {
    this.pointStack = [];
  }
  public make(): Polygon {
    return makePolygon(this.pointStack);
  }
  public render() {
    this.pointStack.forEach((p) => {
      renderDot(this.ctx, this.color, p, 8);
    });
  }
}

export const renderPolygon = (
  ctx: CanvasRenderingContext2D,
  polygon: Polygon,
  color: string
) => {
  ctx.fillStyle = color;
  ctx.beginPath();
  polygon.forEach((p) => {
    ctx.lineTo(p.x, p.y);
  });
  ctx.lineTo(polygon[0].x, polygon[0].y);
  ctx.fill();
  ctx.closePath();
};

export const execPolygon = async (
  shot: Shot,
  polygon: PolygonOperation,
  stopFlag: StopFlag,
  setNow: (now: number) => void,
  fps: number = 100
) => {
  const { time, content } = polygon;
  const lines = content
    .slice(0, content.length - 1)
    .reduce(
      (a, _, i) => [...a, { s: content[i], e: content[i + 1] }],
      [] as LineSegment[]
    );
  lines.push({ s: content[content.length - 1], e: content[0] });
  const center = getCentroid(content);
  const start = performance.now();
  let now = performance.now();
  let i = 0;
  while (now - start < time) {
    setNow((now - start) / time);
    if (stopFlag.v) return;
    const slope = Math.tan(((now - start) / time) * Math.PI * 2);
    const line: LineSegment = {
      s: { x: -100, y: slope * (-100 - center.x) + center.y },
      e: { x: 10000, y: slope * (10000 - center.x) + center.y },
    };
    const crossPoints: Coordinate[] = lines
      .map((l) => getCrossPoint(line, l))
      .filter(
        (p, i) => p !== null && isOnLineSegment(p, lines[i], 0.5)
      ) as Coordinate[];
    if (crossPoints.length) shot(crossPoints[i % 2] || crossPoints[0]);
    await sleep(1000 / fps);
    now = performance.now();
    i++;
  }
};
