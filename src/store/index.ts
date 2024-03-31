import { combineReducers, createStore } from "redux";
import ctx from "./ctx";

const root = combineReducers({
  ctx,
});

const store = createStore(root);

export type RootState = ReturnType<typeof store.getState>;

export default store;
