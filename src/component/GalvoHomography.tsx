import React, { useCallback, useState } from "react";
import { styled } from "styled-components";
import { Button, Slider } from "@mui/material";
import { useF32ArrayPointer } from "@/wasm/memory";
import { useStore } from "@/module/useStore";
import { CanvasId } from "@/store/ctx";
import { useCtx, useWasmModule } from "@/store/ctx/hooks";
import CanvasComponent from "./Canvas";
import { useResolution } from "./ResolutionSelector";
import CanavsIdSelector from "./CanvasIdSelector";
import { calcHomography } from "@/util/calcHomography";

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
  nDots: "nDots",
  durationBetweenShots: "durationBetweenShots",
  originalId: "originalId",
  homography: "homography",
} as const;

const CalibratedCamera: React.FC<Props> = (props) => {
  const module = useWasmModule();
  const [resolution] = useResolution(props.id);
  const [nDots, setNDots] = useStore<number>(keys.nDots, props.id);
  const [duration, setDuration] = useStore<number>(
    keys.durationBetweenShots,
    props.id
  );
  const [isCalcculatingNow, setIsCalculatingNow] = useState(false);
  const updateNDots = useCallback(
    (_: any, value: number | number[]) => {
      setNDots(typeof value === "object" ? value[0] : value);
    },
    [setNDots]
  );
  const updateDuration = useCallback(
    (_: any, value: number | number[]) => {
      setDuration(typeof value === "object" ? value[0] : value);
    },
    [setDuration]
  );
  const [originalId] = useStore<number>(keys.originalId, props.id);
  const [homography, setHomography] = useStore<number[]>(
    keys.homography,
    originalId || 0
  );

  const orgCtx = useCtx(originalId as CanvasId);
  const startCalcHomography = useCallback(async () => {
    if (
      nDots === null ||
      duration === null ||
      module === null ||
      orgCtx === null
    )
      return;
    setIsCalculatingNow(true);
    const homography = await calcHomography(
      module,
      orgCtx,
      resolution,
      nDots,
      duration
    );
    setIsCalculatingNow(false);
    setHomography(Array.from(homography.data));
    homography.clear();
  }, [orgCtx, module, nDots, duration, resolution]);

  const homographyPointer = useF32ArrayPointer(homography, 3 * 3);

  return (
    <div>
      <PanelContainer>
        <p>
          <span>The number of dots for Calc homography</span>
        </p>
        <p>
          <Slider
            value={nDots || 10}
            step={1}
            onChange={updateNDots}
            min={3}
            max={20}
          />
        </p>
        <p>
          <span>Duration between shot dots: {duration} ms</span>
        </p>
        <p>
          <Slider
            value={duration || 10}
            step={50}
            onChange={updateDuration}
            min={200}
            max={1000}
          />
        </p>
        <PanelFooter>
          <CanavsIdSelector
            exceptedIds={[props.id]}
            keyName={`${keys.originalId}-${props.id}`}
          />
          <Button
            disabled={
              isCalcculatingNow ||
              orgCtx === null ||
              nDots === null ||
              duration === null
            }
            onClick={startCalcHomography}
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
