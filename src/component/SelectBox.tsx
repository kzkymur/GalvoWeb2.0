import React, { useCallback, useMemo } from "react";
import Box from "@mui/material/Box";
import InputLabel from "@mui/material/InputLabel";
import Item from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import styled from "styled-components";

type Props = {
  onChange: (v: string) => void;
  value: string;
  values: string[];
  label?: string;
  labels?: string[];
  minWidth?: number;
  width?: number | undefined;
  height?: number | undefined;
};

const defaultProps: Required<
  Pick<Props, "minWidth" | "label" | "width" | "height">
> = {
  minWidth: 120,
  label: "",
  width: -1,
  height: 32,
} as const;

const StyledSelect = styled(Select<string>)`
  > div {
    padding: 4px !important;
    background: white;
  }
`;

const SelectBox: React.FC<Props> = (recievedProps) => {
  const props = useMemo<Required<Props>>(
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
        minWidth: props.minWidth,
        width: props.width,
        height: props.height,
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
