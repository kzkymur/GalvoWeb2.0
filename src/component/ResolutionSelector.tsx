import React, { useCallback, useState } from "react";
import { styled } from "@mui/material/styles";
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
import Box from "@mui/material/Box";
import InputLabel from "@mui/material/InputLabel";
import Item from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import { CanvasId } from "@/store/ctx";
import { useStore } from "@/module/useStore";

type Props = {
  id: CanvasId;
};

const RESOLUTION_KEY = "RESOLUTION_KEY";

export const useResolution = (targetCanvavsId: CanvasId): [Resolution, (v: Resolution) => void] => {
  const [resolution, update] = useStore<Resolution>(
    RESOLUTION_KEY,
    targetCanvavsId,
    resolutionXGA
  );
  return [resolution || { w: 0, h: 0 }, update];
}

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

const StyledSelect = styled(Select<string>)`
  > div {
    padding: 4px !important;
    background: white;
  }
`;

const ResolutionSelector: React.FC<Props> = (props) => {
  const [r, updateResolution] = useResolution(props.id);
  const [resolutionName, setResolutionName] = useState<Catalog>(`${r.w} x ${r.h}`);
  const onChange = useCallback(
    (e: SelectChangeEvent) => {
      setResolutionName(e.target.value);
      updateResolution(Catalog[e.target.value]);
    },
    [updateResolution, setResolutionName]
  );
  return (
    <Box sx={{ minWidth: 120 }}>
      <FormControl fullWidth>
        <InputLabel>Resolution</InputLabel>
        <StyledSelect
          value={resolutionName}
          onChange={onChange}
        >
          {Object.keys(Catalog).map((c) => (
            <Item value={c} key={c}>{c}</Item>
          ))}
        </StyledSelect>
      </FormControl>
    </Box>
  );
};

export default ResolutionSelector;
