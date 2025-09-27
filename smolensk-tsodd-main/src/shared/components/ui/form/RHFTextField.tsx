"use client";

import React from "react";
import { Controller, FieldPath, FieldValues, useFormContext } from "react-hook-form";
import { TextField, TextFieldProps } from "@mui/material";

type RHFTextFieldProps<T extends FieldValues> = Omit<TextFieldProps, "name"> & {
  name: FieldPath<T>;
};

export function RHFTextField<T extends FieldValues>({ name, ...props }: RHFTextFieldProps<T>) {
  const { control } = useFormContext<T>();
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <TextField
          {...props}
          {...field}
          error={!!fieldState.error}
          helperText={fieldState.error?.message || props.helperText}
        />
      )}
    />
  );
}

export default RHFTextField;


