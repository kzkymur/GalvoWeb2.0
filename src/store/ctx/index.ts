import Action, { ActionTypes } from "./actionTypes";

export type CanvasId = number;
export type GetCtx = () => CanvasRenderingContext2D;

export type State = {
  wasmModule: EmscriptenModule | null;
  ctxs: Record<CanvasId, GetCtx>;
};

export const initialState: State = {
  wasmModule: null,
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
  }
  console.log(state);
  return { ...state };
};
export default reducer;
