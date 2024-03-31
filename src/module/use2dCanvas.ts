import { RefObject, useEffect, useRef, useState } from "react";
import { Resolution } from "@/module/camera";

export const use2dCanvas = (
  resolution?: Resolution
): [RefObject<HTMLCanvasElement>, CanvasRenderingContext2D | null] => {
  const ref = useRef<HTMLCanvasElement>(null);
  const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);

  useEffect(() => {
    if (ref.current === null) return;

    if (resolution) {
      ref.current.width = resolution.w;
      ref.current.height = resolution.h;
    }

    setCtx(ref.current.getContext("2d"));
  }, [ref.current, resolution]);

  return [ref, ctx];
};
