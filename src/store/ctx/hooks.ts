import { useMemo } from "react";
import { useSelector } from "react-redux";
import { CanvasId, SerialId, WriteSerialPort } from ".";
import { RootState } from "..";
import ModuleWrapper from "@/wasm/wrapper";

export const useWasmModule = (): EmscriptenModule | null => {
  const wasmModule = useSelector((s: RootState) => s.ctx.wasmModule);
  return wasmModule;
};

export const useWasmWrapper = (): ModuleWrapper | null => {
  const wasmModule = useWasmModule();
  const moduleWrapper = useMemo(() => {
    if (wasmModule === null) return null;
    return new ModuleWrapper(wasmModule);
  }, [wasmModule]);
  return moduleWrapper;
};

export const useCtxIds = (): CanvasId[] => {
  const ctxs = useSelector((s: RootState) => s.ctx.ctxs);
  const idList = useMemo(() => {
    return Object.keys(ctxs).map(Number) as CanvasId[];
  }, [ctxs]);
  return idList;
};

export const useCtx = (id: CanvasId): CanvasRenderingContext2D | null => {
  const ctxs = useSelector((s: RootState) => s.ctx.ctxs);
  const ctx = useMemo(() => {
    const getCtx = ctxs[id];
    if (getCtx !== undefined) {
      return getCtx();
    } else return null;
  }, [ctxs, id]);
  return ctx;
};

export const useSerialIds = (): SerialId[] => {
  const serials = useSelector((s: RootState) => s.ctx.writeSerials);
  const idList = useMemo(() => {
    return Object.keys(serials).map(Number) as SerialId[];
  }, [serials]);
  return idList;
};

export const useWriteSerial = (id: SerialId): WriteSerialPort | null => {
  const serials = useSelector((s: RootState) => s.ctx.writeSerials);
  const writeSerial = useMemo(() => {
    const writeSerial = serials[id];
    if (writeSerial !== undefined) {
      return writeSerial;
    } else return null;
  }, [serials, id]);
  return writeSerial;
};
