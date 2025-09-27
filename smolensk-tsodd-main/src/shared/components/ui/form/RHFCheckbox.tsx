"use client";

import React from "react";
import { Controller, FieldPath, FieldValues, useFormContext } from "react-hook-form";
import { Checkbox, CheckboxProps, FormControlLabel } from "@mui/material";

type RHFCheckboxProps<T extends FieldValues> = Omit<CheckboxProps, "name"> & {
  name: FieldPath<T>;
  label: React.ReactNode;
};

export function RHFCheckbox<T extends FieldValues>({ name, label, ...props }: RHFCheckboxProps<T>) {
  const { control } = useFormContext<T>();
  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <FormControlLabel
          control={<Checkbox {...props} checked={!!field.value} onChange={(_, v) => field.onChange(v)} />}
          label={label}
        />
      )}
    />
  );
}

export default RHFCheckbox;


