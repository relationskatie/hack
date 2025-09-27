"use client";

import React from "react";
import { FieldValues, FormProvider, UseFormReturn, SubmitHandler } from "react-hook-form";

type RHFFormProps<
  TFieldValues extends FieldValues = FieldValues,
  TContext = any,
  TTransformedValues extends FieldValues = TFieldValues
> = {
  methods: UseFormReturn<TFieldValues, TContext, TTransformedValues>;
  onSubmit: SubmitHandler<TTransformedValues>;
  children: React.ReactNode;
  className?: string;
};

export function RHFForm<
  TFieldValues extends FieldValues = FieldValues,
  TContext = any,
  TTransformedValues extends FieldValues = TFieldValues
>({ methods, onSubmit, children, className }: RHFFormProps<TFieldValues, TContext, TTransformedValues>) {
  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} className={className}>
        {children}
      </form>
    </FormProvider>
  );
}

export default RHFForm;


