import React, { useCallback, useState } from "react";
import {
  Resolution,
  resolution1080p,
  resolution720p,
  resolutionSDTV,
  resolutionSVGA,
  resolutionSXGA,
  resolutionVGA,
  resolutionXGA,
} from "@/module/camera";
import { CanvasId } from "@/store/ctx";
import { useStore } from "@/module/useStore";
import SelectBox from "./SelectBox";

type Props = {
  id: CanvasId;
};

const RESOLUTION_KEY = "RESOLUTION_KEY";

export const useResolution = (
  targetCanvavsId: CanvasId
): [Resolution, (v: Resolution) => void] => {
  const [resolution, update] = useStore<Resolution>(
    RESOLUTION_KEY,
    targetCanvavsId,
    resolutionXGA
  );
  return [resolution || { w: 0, h: 0 }, update];
};

const Catalog: Record<string, Resolution> = {
  "1920 x 1080": resolution1080p,
  "1280 x 960": resolutionSXGA,
  "1280 x 720": resolution720p,
  "1024 x 768": resolutionXGA,
  "800 x 600": resolutionSVGA,
  "720 x 480": resolutionSDTV,
  "640 x 480": resolutionVGA,
} as const;
type Catalog = keyof typeof Catalog;

const ResolutionSelector: React.FC<Props> = (props) => {
  const [r, updateResolution] = useResolution(props.id);
  const [resolutionName, setResolutionName] = useState<Catalog>(
    `${r.w} x ${r.h}`
  );
  const onChange = useCallback(
    (v: string) => {
      setResolutionName(v);
      updateResolution(Catalog[v]);
    },
    [updateResolution, setResolutionName]
  );
  return (
    <SelectBox
      onChange={onChange}
      values={Object.keys(Catalog)}
      value={resolutionName}
      label="resolution"
    />
  );
};

export default ResolutionSelector;
