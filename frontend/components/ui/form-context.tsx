import * as React from "react";
import type {
  ControllerProps,
  FieldPath,
  FieldValues,
  UseFormReturn,
} from "react-hook-form";

type FormFieldContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  name: TName;
};

export const FormFieldContext = React.createContext<FormFieldContextValue>(
  {} as FormFieldContextValue
);

type FormItemContextValue = {
  id: string;
};

export const FormItemContext = React.createContext<FormItemContextValue>(
  {} as FormItemContextValue
);

export const FormContext = React.createContext<UseFormReturn | null>(null);

// ─── Hook: useFormField ─────────────────────────────────────────────────────────

export const useFormField = () => {
  const fieldContext = React.useContext(FormFieldContext);
  const itemContext = React.useContext(FormItemContext);
  const formContext = React.useContext(FormContext);

  if (!fieldContext) {
    throw new Error("useFormField should be used within <FormField>");
  }

  if (!formContext) {
    throw new Error("useFormField should be used within <Form>");
  }

  const { getFieldState, formState } = formContext;
  const fieldState = getFieldState(fieldContext.name, formState);

  const { id } = itemContext;

  return {
    id,
    name: fieldContext.name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    ...fieldState,
  };
};

// ─── Hook: useFormContext ─────────────────────────────────────────────────────────

export const useFormContext = () => {
  const context = React.useContext(FormContext);

  if (!context) {
    throw new Error("useFormContext should be used within <Form>");
  }

  return context;
};
