import React, { useMemo } from "react";
import { CanvasId } from "@/store/ctx";
import { useCtxIds } from "@/store/ctx/hooks";
import { useStore } from "@/module/useStore";
import SelectBox from "./SelectBox";

export type Props = {
  keyName: string;
  exceptedIds: CanvasId[];
};

const CanavsIdSelector: React.FC<Props> = (props) => {
  const ctxIds = useCtxIds();
  const filteredIds = useMemo(
    () => ctxIds.filter((id) => !props.exceptedIds.includes(id)).map(String),
    [ctxIds, props.exceptedIds]
  );
  const filteredIdLabels = useMemo(
    () => filteredIds.map((v) => `#${v}`),
    [filteredIds]
  );
  const [originalId, setOriginalId] = useStore<number>(props.keyName);

  return (
    <SelectBox
      onChange={(v: string) => setOriginalId(Number(v))}
      value={String(originalId || 0)}
      values={filteredIds}
      labels={filteredIdLabels}
      label="canvas id"
    />
  );
};

export default CanavsIdSelector;
