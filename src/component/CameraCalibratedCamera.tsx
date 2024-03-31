import React, { useCallback, useEffect, useState } from "react";
import { styled } from "styled-components";
import { Button, Slider } from "@mui/material";
import { useF32ArrayPointer } from "@/wasm/memory";
import { useStore } from "@/module/useStore";
import useFpsOptimization from "@/module/useFpsOptimization";
import { CanvasId } from "@/store/ctx";
import { useCtx, useWasmModule } from "@/store/ctx/hooks";
import { calcUndistMap, calibration, transform } from "@/util/calibrateCamera";
import CanvasComponent from "./Canvas";
import { useResolution } from "./ResolutionSelector";
import CanavsIdSelector from "./CanvasIdSelector";

export type Props = {
  id: CanvasId;
};

const PanelContainer = styled.div`
  padding: 8px;
`;
const PanelFooter = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
`;

const keys = {
  nImagesUsedForCalib: "nImagesUsedForCalib",
  durationBetweenGetImages: "durationBetweenGetImages",
  originalId: "originalId",
  intrMat: "intrMat",
  distCoeffs: "distCoeffs",
  mapX: "mapX",
  mapY: "mapY",
} as const;

const CalibratedCamera: React.FC<Props> = (props) => {
  const module = useWasmModule();
  const [resolution] = useResolution(props.id);
  const [nImages, setNImages] = useStore<number>(
    keys.nImagesUsedForCalib,
    props.id
  );
  const [duration, setDuration] = useStore<number>(
    keys.durationBetweenGetImages,
    props.id
  );
  const [isCalibratingNow, setIsCalibratingNow] = useState(false);
  const updateNImages = useCallback(
    (_: any, value: number | number[]) => {
      setNImages(typeof value === "object" ? value[0] : value);
    },
    [setNImages]
  );
  const updateDuration = useCallback(
    (_: any, value: number | number[]) => {
      setDuration(typeof value === "object" ? value[0] : value);
    },
    [setDuration]
  );
  const ctx = useCtx(props.id);
  const [originalId] = useStore<number>(keys.originalId, props.id);
  const [intrMat, setIntrMat] = useStore<number[]>(
    keys.intrMat,
    originalId || 0
  );
  const [distCoeffs, setDistCoeffs] = useStore<number[]>(
    keys.distCoeffs,
    originalId || 0
  );
  const [mapX, setMapX] = useState<number[]>([]);
  const [mapY, setMapY] = useState<number[]>([]);

  const orgCtx = useCtx(originalId as CanvasId);
  const startCalib = useCallback(async () => {
    if (
      nImages === null ||
      duration === null ||
      module === null ||
      orgCtx === null
    )
      return;
    setIsCalibratingNow(true);
    const [cameraMat, distCoeff] = await calibration(
      module,
      orgCtx,
      resolution,
      nImages,
      duration
    );
    setIsCalibratingNow(false);
    setIntrMat(Array.from(cameraMat.data));
    setDistCoeffs(Array.from(distCoeff.data));
    cameraMat.clear();
    distCoeff.clear();
  }, [orgCtx, module, nImages, duration, resolution]);

  const intrMatPointer = useF32ArrayPointer(intrMat, 3 * 3);
  const distCoeffsPointer = useF32ArrayPointer(distCoeffs, 8);
  const mapXPointer = useF32ArrayPointer(mapX, resolution.w * resolution.h);
  const mapYPointer = useF32ArrayPointer(mapY, resolution.w * resolution.h);

  useEffect(() => {
    if (module === null || intrMatPointer === 0 || distCoeffsPointer === 0)
      return;
    const [mapX, mapY] = calcUndistMap(
      module,
      resolution,
      intrMatPointer,
      distCoeffsPointer
    );
    setMapX(Array.from(mapX.data));
    setMapY(Array.from(mapY.data));
    mapX.clear();
    mapY.clear();
  }, [module, resolution, intrMatPointer, distCoeffsPointer]);

  const renderCalibratedCamera = useCallback(() => {
    if (
      module === null ||
      ctx === null ||
      orgCtx === null ||
      mapXPointer === 0 ||
      mapYPointer === 0
    )
      return;
    const dest = transform(
      module,
      orgCtx,
      resolution,
      mapXPointer,
      mapYPointer
    );
    const imgData = ctx.createImageData(resolution.w, resolution.h);
    imgData.data.set(dest.data);
    ctx.putImageData(imgData, 0, 0);
    dest.clear();
  }, [module, ctx, orgCtx, resolution, mapXPointer, mapYPointer]);

  useFpsOptimization(renderCalibratedCamera);

  return (
    <div>
      <PanelContainer>
        <p>
          <span>The number of images for Calibration: {nImages}</span>
        </p>
        <p>
          <Slider
            value={nImages || 10}
            step={1}
            onChange={updateNImages}
            min={1}
            max={30}
          />
        </p>
        <p>
          <span>Duration between get Images: {duration} ms</span>
        </p>
        <p>
          <Slider
            value={duration || 10}
            step={100}
            onChange={updateDuration}
            min={500}
            max={5000}
          />
        </p>
        <PanelFooter>
          <CanavsIdSelector
            exceptedIds={[props.id]}
            keyName={`${keys.originalId}-${props.id}`}
          />
          <Button
            disabled={
              isCalibratingNow ||
              orgCtx === null ||
              nImages === null ||
              duration === null
            }
            onClick={startCalib}
            variant="contained"
          >
            Calib Start
          </Button>
        </PanelFooter>
      </PanelContainer>
      <CanvasComponent id={props.id} />
    </div>
  );
};

export default CalibratedCamera;
