import ModuleWrapper, { F32AP } from "@/wasm/wrapper";
import { WMF32A, WMU32A, WMU8A } from "@/wasm/memory";
import { Resolution } from "@/module/camera";
import { sleep } from ".";

export const transform = (
  module: EmscriptenModule,
  orgCtx: CanvasRenderingContext2D,
  resolution: Resolution,
  mapX: F32AP,
  mapY: F32AP
): WMU8A => {
  const moduleWrapper = new ModuleWrapper(module);
  const orgImg = new WMU8A(module, resolution.w * resolution.h * 4);
  orgImg.data = orgCtx.getImageData(0, 0, resolution.w, resolution.h).data;
  const dest = new WMU8A(module, resolution.w * resolution.h * 4);
  moduleWrapper.undistort(
    orgImg.pointer,
    resolution.w,
    resolution.h,
    mapX,
    mapY,
    dest.pointer
  );
  orgImg.clear();
  return dest;
};

export const detect = (
  module: EmscriptenModule,
  ctx: CanvasRenderingContext2D,
  resolution: Resolution
): [boolean, WMF32A] => {
  const moduleWrapper = new ModuleWrapper(module);
  const p = new WMU8A(module, resolution.w * resolution.h * 4);
  const cornersImgDest = new WMF32A(module, 7 * 11 * 2);
  p.data = ctx.getImageData(0, 0, resolution.w, resolution.h).data;
  const result = moduleWrapper.findChessboardCorners(
    p.pointer,
    resolution.w,
    resolution.h,
    cornersImgDest.pointer
  );
  p.clear();
  if (!result) cornersImgDest.clear();
  return [result, cornersImgDest];
};

export const calcUndistMap = (
  module: EmscriptenModule,
  resolution: Resolution,
  intrPointer: F32AP,
  distPointer: F32AP
): [WMF32A, WMF32A] => {
  const moduleWrapper = new ModuleWrapper(module);
  const mapX = new WMF32A(module, resolution.w * resolution.h);
  const mapY = new WMF32A(module, resolution.w * resolution.h);
  moduleWrapper.calcUndistMap(
    intrPointer,
    distPointer,
    resolution.w,
    resolution.h,
    mapX.pointer,
    mapY.pointer
  );
  return [mapX, mapY];
};

export const calcIntr = (
  module: EmscriptenModule,
  resolution: Resolution,
  cornerImgs: WMF32A[]
): [boolean, WMF32A, WMF32A] => {
  const moduleWrapper = new ModuleWrapper(module);
  const len = cornerImgs.length;
  const cornerImgsPointer = new WMU32A(module, len);
  const cornerImgPointers = new Uint32Array(len);
  cornerImgs.forEach((ci, i) => {
    cornerImgPointers[i] = ci.pointer;
  });
  cornerImgsPointer.data = cornerImgPointers;
  const intrMatDest = new WMF32A(module, 3 * 3);
  const distCoeffsDest = new WMF32A(module, 8);
  const result = [
    moduleWrapper.calcInnerParams(
      cornerImgsPointer.pointer,
      len,
      resolution.w,
      resolution.h,
      intrMatDest.pointer,
      distCoeffsDest.pointer
    ),
    intrMatDest,
    distCoeffsDest,
  ] as [boolean, WMF32A, WMF32A];
  cornerImgsPointer.clear();
  return result;
};

export const calibration = async (
  module: EmscriptenModule,
  orgCtx: CanvasRenderingContext2D,
  resolution: Resolution,
  nImages: number,
  duration: number
): Promise<[WMF32A, WMF32A]> => {
  const cornerImgMemories = [];
  while (cornerImgMemories.length < nImages) {
    const [successed, cornerImgMemory] = detect(module, orgCtx, resolution);
    if (successed) {
      cornerImgMemories.push(cornerImgMemory);
    }
    if (cornerImgMemories.length === nImages) break;
    await sleep(duration);
  }
  const [successed, cameraMat, distCoeff] = calcIntr(
    module,
    resolution,
    cornerImgMemories
  );
  if (!successed) {
    throw new Error("Camera calibration is Failed");
  }
  return [cameraMat, distCoeff];
};
