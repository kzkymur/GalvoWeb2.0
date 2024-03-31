import React, { useCallback, useState } from "react";
import styled from "styled-components";
import Box from "@mui/material/Box";
import InputLabel from "@mui/material/InputLabel";
import Item from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import { Button } from "@mui/material";
import useNodeMap from "@/module/useNodeMap";
import { NodeKey, NodeList, isNodeKey } from "./Nodes";

const Container = styled.div`
  padding: 8px;
  display: flex;
  column-gap: 8px;
  width: 300px;
  height: 36px;

  .MuiOutlinedInput-input {
    padding: 8.7px;
  }
`;

const AddNode: React.FC = () => {
  const [_, add] = useNodeMap();
  const [label, setLabel] = useState<string>("");
  const selectOriginalId = useCallback(
    (e: SelectChangeEvent) => setLabel(e.target.value as NodeKey),
    [setLabel]
  );
  const onClickAddButton = useCallback(() => {
    if (isNodeKey(label)) add(label);
  }, [add, label]);

  return (
    <Container>
      <Box sx={{ minWidth: 120 }}>
        <FormControl fullWidth>
          <InputLabel>Node</InputLabel>
          <Select value={label} onChange={selectOriginalId}>
            {Object.keys(NodeList).map((label) => (
              <Item value={label} key={label}>
                {label}
              </Item>
            ))}
          </Select>
        </FormControl>
      </Box>
      <Button onClick={onClickAddButton} variant="contained">
        ADD
      </Button>
    </Container>
  );
};

export default AddNode;
