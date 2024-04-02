import ModuleWrapper from "@/wasm/wrapper";
import { WMF32A } from "@/wasm/memory";
import { sleep } from ".";

type Coordinate = {
  x: number;
  y: number;
};

const GALVO_MIN_X = -65536;
const GALVO_MAX_X = 65536;
const GALVO_MIN_Y = -65536;
const GALVO_MAX_Y = 65536;

export const checkData = (
  arr_1: Uint8Array,
  arr_2: Uint8Array,
  colorThreshold: number
) => {
  const errors = [];
  for (let i = 0, l = arr_1.length; i < l; i += 4) {
    if (
      // only light on
      arr_2[i] - arr_1[i] > colorThreshold &&
      arr_2[i + 1] - arr_1[i + 1] > colorThreshold &&
      arr_2[i + 2] - arr_1[i + 2] > colorThreshold
    ) {
      errors.push(i);
    }
  }
  return errors;
};

export const detectRedPoint = (
  ctx: CanvasRenderingContext2D,
  colorThreshold: number
): [boolean, Coordinate] => {
  const resolutionWidth = ctx.canvas.width;
  const resolutionHeight = ctx.canvas.height;
  const arr_1 = ctx.getImageData(0,0,resolutionWidth, resolutionHeight).data;
  const arr_2 = ctx.getImageData(0,0,resolutionWidth, resolutionHeight).data;
  const errs = checkData(arr_1, arr_2, colorThreshold);
  if (errs.length === 0) return [false, { x: 0, y: 0 }];
  const pErrs = errs.map((e) => ({
    x: (e / 4) % resolutionWidth,
    y: Math.floor(e / 4 / resolutionWidth),
  }));
  return [
    true,
    pErrs.reduce(
      (a, c) => ({
        x: a.x + c.x / errs.length,
        y: a.y + c.y / errs.length,
      }),
      { x: 0, y: 0 }
    ),
  ];
};

export const calcHomography = async (
  module: EmscriptenModule,
  orgCtx: CanvasRenderingContext2D,
  serial: any,
  nDots: number,
  duration: number
): Promise<WMF32A> => {
  duration /= 2;
  const moduleWrapper = new ModuleWrapper(module);
  const dest = new WMF32A(module, 3 * 3);
  const galvoArray: number[] = [];
  const cameraArray: number[] = [];
  const dotsSpanX = (GALVO_MAX_X - GALVO_MIN_X) / (nDots - 1);
  const dotsSpanY = (GALVO_MAX_Y - GALVO_MIN_Y) / (nDots - 1);

  for (let i = 0; i < nDots; i++) {
    const x = Math.floor(dotsSpanX * i);
    for (let j = 0; j < nDots; j++) {
      await sleep(duration);
      const y = Math.floor(dotsSpanY * i);
      serial.shot(x, y);
      await sleep(duration);
      const [detect, camera] = detectRedPoint(orgCtx);
      if (detect) {
        galvoArray.push(x, y);
        cameraArray.push(camera.x, camera.y);
      }
    }
  }

  const galvo = new WMF32A(module, galvoArray.length);
  galvo.data = new Float32Array(galvoArray);
  const camera = new WMF32A(module, galvoArray.length);
  camera.data = new Float32Array(cameraArray);
  moduleWrapper.calcHomography(
    galvo.pointer,
    camera.pointer,
    galvoArray.length,
    dest.pointer
  );
  return dest;
};
