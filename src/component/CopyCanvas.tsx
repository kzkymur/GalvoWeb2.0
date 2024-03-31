import React, { useCallback, useEffect, useMemo } from "react";
import { styled } from "styled-components";
import "./Home.css";
import Box from "@mui/material/Box";
import InputLabel from "@mui/material/InputLabel";
import Item from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import CanvasComponent from "./Canvas";
import { CanvasId } from "@/store/ctx";
import { useCtx, useCtxIds } from "@/store/ctx/hooks";
import { useStore } from "@/module/useStore";
import {useResolution} from "./ResolutionSelector";

export type Props = {
  id: CanvasId;
};

const PanelContainer = styled.div`
  padding: 8px;
`;
const StyledSelect = styled(Select<string>)`
  > div {
    padding: 4px !important;
    background: white;
  }
`;

const keys = {
  nImagesUsedForCalib: "nImagesUsedForCalib",
  durationBetweenGetImages: "durationBetweenGetImages",
  originalId: "originalId",
  innerParam: "innerParam",
  distCoeffs: "distCoeffs",
} as const;

const CalibratedCamera: React.FC<Props> = (props) => {
  const ctx = useCtx(props.id);
  const ctxIds = useCtxIds();
  const filteredIds = useMemo(
    () => ctxIds.filter((id) => id !== props.id),
    [ctxIds, props.id]
  );
  const [originalId, setOriginalId] = useStore<number>(
    keys.originalId,
    props.id
  );
  const [orgResolution] = useResolution((originalId || 0) as CanvasId);
  const selectOriginalId = useCallback(
    (e: SelectChangeEvent) => {
      setOriginalId(Number(e.target.value));
    },
    [setOriginalId]
  );
  const orgCtx = useCtx((originalId) as CanvasId);

  const render = useCallback(() => {
      if (ctx === null || orgCtx===null) return;
    ctx.putImageData(
    orgCtx.getImageData(0, 0, orgResolution.w, orgResolution.h)
, 0, 0);
      }, [ctx, orgCtx])

  useEffect(() => {
      const loop = window.setInterval(render, 1000 / 30);
      return window.clearInterval(loop);
      }, [render])

  return (
    <div>
      <PanelContainer>
          <Box sx={{ minWidth: 120 }}>
            <FormControl fullWidth>
              <InputLabel>Resolution</InputLabel>
              <StyledSelect value={String(originalId || 0)} onChange={selectOriginalId}>
                {filteredIds.map((id) => (
                  <Item value={id} key={id}>
                    #{id}
                  </Item>
                ))}
              </StyledSelect>
            </FormControl>
          </Box>
      </PanelContainer>
      <CanvasComponent id={props.id} />
    </div>
  );
};

export default CalibratedCamera;
