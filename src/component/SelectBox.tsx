import React, { useCallback, useMemo } from "react";
import styled from "styled-components";
import Box from "@mui/material/Box";
import InputLabel from "@mui/material/InputLabel";
import Item from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select, { SelectChangeEvent } from "@mui/material/Select";

type Props = {
  onChange: (v: string) => void;
  value: string;
  values: string[];
  label?: string;
  labels?: string[];
  minWidth?: number;
  maxWidth?: number | undefined;
  maxHeight?: number | undefined;
};

const defaultProps: Required<Pick<Props, "minWidth" | "label">> = {
  minWidth: 120,
  label: "",
} as const;

const StyledSelect = styled(Select<string>)`
  > div {
    padding: 4px !important;
    background: white;
  }
`;

const SelectBox: React.FC<Props> = (recievedProps) => {
  const props = useMemo<Props & { labels: string[] }>(
    () => ({
      ...defaultProps,
      labels: recievedProps.values,
      ...recievedProps,
    }),
    [recievedProps]
  );
  const onChange = useCallback(
    (e: SelectChangeEvent) => {
      props.onChange(e.target.value);
    },
    [props.onChange]
  );
  return (
    <Box
      sx={{
        display: "block",
        minWidth: props.minWidth,
        maxWidth: props.maxWidth,
        maxHeight: props.maxHeight,
      }}
    >
      <FormControl fullWidth>
        {props.label && <InputLabel>{props.label}</InputLabel>}
        <StyledSelect value={props.value} onChange={onChange}>
          {props.values.map((v, i) => (
            <Item value={v} key={v}>
              {props.labels[i]}
            </Item>
          ))}
        </StyledSelect>
      </FormControl>
    </Box>
  );
};

export default SelectBox;
