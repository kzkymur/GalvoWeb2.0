import React, { useCallback, useEffect } from "react";
import { useDispatch } from "react-redux";
import { styled } from "styled-components";
import "./Home.css";
import { use2dCanvas } from "@/module/use2dCanvas";
import { Resolution } from "@/module/camera";
import { SetCtx } from "@/store/ctx/action";
import { CanvasId } from "@/store/ctx";
import ResolutionSelector, { useResolution } from "./ResolutionSelector";
import { Checkbox } from "@mui/material";
import { useStore } from "@/module/useStore";

type Props = {
  id: CanvasId;
};

const Container = styled.div<{
  $resolution: Resolution;
}>`
  width: 100%;
  position: relative;
  border: 1px solid;
  &::before {
    content: "";
    display: block;
    padding-top: ${(props) =>
      (props.$resolution.h / props.$resolution.w) * 100}%;
  }
`;

const StyledCanvas = styled.canvas<{
  $isVisible: boolean;
}>`
  position: absolute;
  width: 100%;
  height: 100%;
  display: ${(props) => (props.$isVisible ? "block" : "none")};
  top: 0;
  z-index: 1;
`;

const CheckboxContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  z-index: 2;
`;
const ResolutionContainer = styled.div`
  position: absolute;
  margin: 8px;
  top: 0;
  right: 0;
  z-index: 2;
`;

const IS_VISIBLE_KEY = "IS_VISIBLE";

const CanvasComponent: React.FC<Props> = (props) => {
  const dispatch = useDispatch();
  const [resolution] = useResolution(props.id);
  const [canvasRef, ctx] = use2dCanvas(resolution);
  const [isVisible, setIsVisible] = useStore<boolean>(
    IS_VISIBLE_KEY,
    props.id,
    true
  );
  const onVisibleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setIsVisible(Boolean(e.target.checked));
    }, [setIsVisible]);

  useEffect(() => {
    if (ctx !== null) {
      dispatch(SetCtx(props.id, () => ctx));
    } else {
      dispatch(SetCtx(props.id));
    }
    return () => {
      dispatch(SetCtx(props.id));
    };
  }, [props.id, ctx]);

  return (
    <Container $resolution={resolution}>
      <StyledCanvas
        ref={canvasRef}
        $isVisible={isVisible || false}
        width={resolution.w}
        height={resolution.h}
      />
      <CheckboxContainer>
        <Checkbox defaultChecked onChange={onVisibleChange} />
      </CheckboxContainer>
      <ResolutionContainer>
        <ResolutionSelector id={props.id} />
      </ResolutionContainer>
    </Container>
  );
};

export default CanvasComponent;
