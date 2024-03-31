import React, { useCallback, useMemo } from "react";
import { styled } from "styled-components";
import Box from "@mui/material/Box";
import InputLabel from "@mui/material/InputLabel";
import Item from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import { CanvasId } from "@/store/ctx";
import { useCtxIds } from "@/store/ctx/hooks";
import { useStore } from "@/module/useStore";

export type Props = {
  keyName: string;
  exceptedIds: CanvasId[];
};

const StyledSelect = styled(Select<string>)`
  > div {
    padding: 4px !important;
    background: white;
  }
`;

const CanavsIdSelector: React.FC<Props> = (props) => {
  const ctxIds = useCtxIds();
  const filteredIds = useMemo(
    () => ctxIds.filter((id) => !props.exceptedIds.includes(id)),
    [ctxIds, props.exceptedIds]
  );
  const [originalId, setOriginalId] = useStore<number>(
    props.keyName
  );
  const selectOriginalId = useCallback(
    (e: SelectChangeEvent) => {
      setOriginalId(Number(e.target.value));
    },
    [setOriginalId]
  );

  return (
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
  );
};

export default CanavsIdSelector;
