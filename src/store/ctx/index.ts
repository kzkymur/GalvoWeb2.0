import Action, { ActionTypes } from "./actionTypes";

export type CanvasId = number;
export type SerialId = number;
export type GetCtx = () => CanvasRenderingContext2D;
export type WriteSerialPort = (text: string) => Promise<boolean>;

export type State = {
  wasmModule: EmscriptenModule | null;
  writeSerials: Record<SerialId, WriteSerialPort>;
  ctxs: Record<CanvasId, GetCtx>;
};

export const initialState: State = {
  wasmModule: null,
  writeSerials: {},
  ctxs: {},
};

const reducer = (state = initialState, action: Action) => {
  console.log(action);
  switch (action.type) {
    case ActionTypes.setWasmModule: {
      const { module } = action.payload;
      state.wasmModule = module;
      break;
    }

    case ActionTypes.setCtx: {
      const { canvasId, getCtx } = action.payload;
      const ctxs = { ...state.ctxs };
      if (getCtx === undefined) {
        delete ctxs[canvasId];
      } else {
        ctxs[canvasId] = getCtx;
      }
      state.ctxs = ctxs;
      break;
    }

    case ActionTypes.setWriteSerialPort: {
      const { serialId, writeSerialPort } = action.payload;
      const writeSerials = { ...state.writeSerials };
      if (writeSerialPort === undefined) {
        delete writeSerials[serialId];
      } else {
        writeSerials[serialId] = writeSerialPort;
      }
      state.writeSerials = writeSerials;
      break;
    }
  }
  console.log(state);
  return { ...state };
};
export default reducer;
