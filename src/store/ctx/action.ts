import Action, { ActionTypes } from "./actionTypes";
import { CanvasId, GetCtx } from ".";

export const SetWasmModule: (module: EmscriptenModule) => Action = (
  module
) => ({
  type: ActionTypes.setWasmModule,
  payload: { module },
});

export const SetCtx: (canvasId: CanvasId, getCtx?: GetCtx) => Action = (
  canvasId,
  getCtx
) => ({
  type: ActionTypes.setCtx,
  payload: { canvasId, getCtx },
});
