import { Action } from "redux";
import { CanvasId, GetCtx, SerialId, WriteSerialPort } from ".";

export const ActionTypes = {
  setWasmModule: "SETWASMMODULE",
  setCtx: "SETCTX",
  setWriteSerialPort: "SETWRITESERIALPORT",
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
interface SetWriteSerialPort extends Action {
  type: typeof ActionTypes.setWriteSerialPort;
  payload: {
    serialId: SerialId;
    writeSerialPort: WriteSerialPort | undefined;
  };
}

type ActionType = SetWasmModule | SetCtx | SetWriteSerialPort;

export default ActionType;
