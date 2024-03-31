import { Action } from "redux";
import { CanvasId, GetCtx } from ".";

export const ActionTypes = {
  setWasmModule: "SETWASMMODULE",
  setCtx: "SETCTX",
} as const;

interface SetWasmModule extends Action {
  type: typeof ActionTypes.setWasmModule;
  payload: {
    module: EmscriptenModule;
  };
}
interface SetCtx extends Action {
  type: typeof ActionTypes.setCtx;
  payload: {
    canvasId: CanvasId;
    getCtx: GetCtx | undefined;
  };
}

type ActionType = SetWasmModule | SetCtx;

export default ActionType;
