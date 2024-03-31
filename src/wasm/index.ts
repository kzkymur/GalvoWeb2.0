import Wasm from "@wasm";
import { WMU8A } from "./memory";
import ModuleWrapper from "./wrapper";
import { useEffect, useRef } from "react";

const useWasmCode = () => {
  const ref = useRef<ModuleWrapper | null>(null);

  useEffect(() => {
    Wasm().then((Module: any) => {
      const mw = new ModuleWrapper(Module);
      ref.current = mw;

      // test code
      const origin = new WMU8A(Module, 4);
      const result = new WMU8A(Module, 4);
      const source = new Uint8Array([11, 22, 33, 44]);
      console.log(source);
      origin.data = source;
      console.log(origin.data);
      mw.timesBy2(origin.pointer, 1, 1, result.pointer);
      console.log(result.data);
    });
  }, []);

  return ref;
};

export default useWasmCode;
