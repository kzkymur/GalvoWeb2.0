import React, { useCallback, useEffect, useRef, useState } from "react";
import { styled } from "styled-components";
import { Sequencer } from "@/util/sequencer";
import useFpsOptimization from "@/module/useFpsOptimization";
import { renderLine } from "@/util/canvas";
import { LineSegment } from "@/util/math";
import useCounter from "@/module/useCounter";

export type Props = {
  sequencer: Sequencer;
};

const Container = styled.div`
  position: relative;
`;

const SequenceBar = styled.div`
  width: 100%;
  height: 32px;
  display: flex;
`;

const NowIndicator = styled.canvas`
  position: absolute;
  width: 100%;
  height: 32px;
  pointer-events: none;
`;

const Operation = styled.div<{
  $percent: number;
  $color: string;
  $isClicked: boolean;
}>`
  width: ${(props) => props.$percent}%;
  height: 100%;
  border-left: 0.5px solid black;
  border-right: 0.5px solid black;
  background: ${(props) => props.$color};
  &:first-child {
    border-left: 1px solid black;
  }
  &:last-child {
    border-right: 1px solid black;
  }
  ${(props) =>
    props.$isClicked
      ? `
    outline: 3px white solid !important;
    border-radius: 4px;
    z-index: 2;
    `
      : ""}
`;

const Now: React.FC<Props> = (props) => {
  const ref = useRef<HTMLCanvasElement>(null);
  const render = useCallback(() => {
    if (ref.current === null) return;
    const ctx = ref.current.getContext("2d");
    if (ctx === null) return;
    const now = props.sequencer.now;
    const { width, height } = ctx.canvas;
    const s = { x: now * width, y: 0 };
    const e = { x: now * width, y: height };
    ctx.clearRect(0, 0, width, height);
    renderLine(ctx, LineSegment(s, e), 1.5, "#fff");
  }, [props.sequencer]);
  useFpsOptimization(render, 30);
  return <NowIndicator ref={ref} />;
};

const SequencerComponent: React.FC<Props> = (props) => {
  const [clickedIndex, setClickedIndex] = useState(-1);
  const onClick = useCallback((i: number) => () => setClickedIndex(i), []);
  const barRef = useRef<HTMLDivElement>(null);
  const [, increment] = useCounter();
  const onClickOutside = useCallback((e: MouseEvent) => {
    if (
      e.target === null ||
      !(e.target instanceof Element) ||
      barRef.current === null
    )
      return;
    if (!e.target.contains(barRef.current)) return;
    setClickedIndex(-1);
  }, []);
  useEffect(() => {
    window.addEventListener("click", onClickOutside);
    return () => window.removeEventListener("click", onClickOutside);
  }, [onClickOutside]);
  const del = useCallback(() => {
    props.sequencer.remove(clickedIndex);
    increment();
  }, [props.sequencer, clickedIndex, increment]);
  const onBackSpace = useCallback(
    (e: KeyboardEvent) => {
      const key = e.key;
      if (key === "Backspace" || key === "Delete") del();
    },
    [del]
  );
  useEffect(() => {
    window.addEventListener("keydown", onBackSpace);
    return () => window.removeEventListener("keydown", onBackSpace);
  }, [onBackSpace]);
  return (
    <Container>
      <Now sequencer={props.sequencer} />
      <SequenceBar ref={barRef}>
        {props.sequencer.getOperations().map((o, i) => (
          <Operation
            onClick={onClick(i)}
            $percent={(100 * o.time) / props.sequencer.getTotalTime()}
            $color={o.color}
            $isClicked={i === clickedIndex}
            key={i}
          />
        ))}
      </SequenceBar>
    </Container>
  );
};

export default SequencerComponent;
