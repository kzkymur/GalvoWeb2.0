import TeencyCommunicator from "@/module/teencyInterface";
import { Coordinate } from "../calcHomography";
import { affine } from "../math";
import { Polygon, execPolygon, renderPolygon } from "./polygon";
import { ValueOf } from "..";

export const shotFactory =
  (teency: TeencyCommunicator, cameraToGalvoHomography: number[]): Shot =>
  (cameraPoint: Coordinate) => {
    teency.setGalvoPos(affine(cameraPoint, cameraToGalvoHomography));
  };
export type Shot = (cameraPoint: Coordinate) => void;

export const OperationType = {
  concentrate: "concentrate",
  polygon: "polygon",
} as const;
export type OperationType = ValueOf<typeof OperationType>;

export type OperationId = number;

type OperationBase = {
  id: OperationId;
  color: string;
  time: number;
};

export type ConcentrateOperation = OperationBase & {
  type: typeof OperationType.concentrate;
  content: Coordinate;
};
export type PolygonOperation = OperationBase & {
  type: typeof OperationType.polygon;
  content: Polygon;
};

export type Operation = ConcentrateOperation | PolygonOperation;

export const renderOperation = (
  ctx: CanvasRenderingContext2D,
  operation: Operation
) => {
  switch (operation.type) {
    case OperationType.polygon: {
      renderPolygon(ctx, operation.content, operation.color);
      return;
    }
  }
};

export type StopFlag = { v: boolean };
export const execOperation = async (
  operation: Operation,
  shot: Shot,
  stopFlag: StopFlag,
  setNow: (now: number) => void
) => {
  switch (operation.type) {
    case OperationType.polygon: {
      await execPolygon(shot, operation, stopFlag, setNow);
      return;
    }
  }
};
