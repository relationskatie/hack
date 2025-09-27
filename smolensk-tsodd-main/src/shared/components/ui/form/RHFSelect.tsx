"use client";

import React from "react";
import { Controller, FieldPath, FieldValues, useFormContext } from "react-hook-form";
import { FormControl, InputLabel, Select, SelectProps, FormHelperText } from "@mui/material";

type RHFSelectProps<T extends FieldValues> = Omit<SelectProps, "name" | "labelId"> & {
  name: FieldPath<T>;
  label: string;
};

export function RHFSelect<T extends FieldValues>({ name, label, fullWidth, ...props }: RHFSelectProps<T>) {
  const { control } = useFormContext<T>();
  const labelId = `${String(name)}-label`;

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <FormControl fullWidth={fullWidth} error={!!fieldState.error}>
          <InputLabel id={labelId}>{label}</InputLabel>
          <Select {...props} {...field} labelId={labelId} label={label} variant="outlined" />
          {fieldState.error && <FormHelperText>{fieldState.error.message}</FormHelperText>}
        </FormControl>
      )}
    />
  );
}

export default RHFSelect;


