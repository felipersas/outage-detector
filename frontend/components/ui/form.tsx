import * as React from "react";
import { Controller } from "react-hook-form";
import type { ControllerProps, FieldPath, FieldValues } from "react-hook-form";
import {
  FormContext,
  FormFieldContext,
  FormItemContext,
  useFormField,
} from "@/components/ui/form-context";
import type { UseFormReturn } from "react-hook-form";

// ─── Form ───────────────────────────────────────────────────────────────────────

export function Form<
  TFieldValues extends FieldValues = FieldValues,
  TContext = unknown,
>(props: UseFormReturn<TFieldValues, TContext> & { children: React.ReactNode }) {
  const { children, ...formProps } = props as any;
  return <FormContext.Provider value={formProps}>{children}</FormContext.Provider>;
}

// ─── FormField ───────────────────────────────────────────────────────────────────

const FormField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  ...props
}: ControllerProps<TFieldValues, TName>) => {
  return (
    <FormFieldContext value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext>
  );
};

// ─── FormItem ───────────────────────────────────────────────────────────────────

const FormItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const id = React.useId();

  return (
    <FormItemContext value={{ id }}>
      <div ref={ref} className={className} {...props} />
    </FormItemContext>
  );
});
FormItem.displayName = "FormItem";

// ─── FormLabel ───────────────────────────────────────────────────────────────────

const FormLabel = React.forwardRef<
  HTMLLabelElement,
  React.LabelHTMLAttributes<HTMLLabelElement>
>(({ className, ...props }, ref) => {
  const { error, formItemId } = useFormField();

  return (
    <label
      ref={ref}
      className={className}
      htmlFor={formItemId}
      data-error={!!error}
      {...props}
    />
  );
});
FormLabel.displayName = "FormLabel";

// ─── FormControl ─────────────────────────────────────────────────────────────────

const FormControl = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ ...props }, ref) => {
  const { error, formItemId, formDescriptionId, formMessageId } =
    useFormField();

  return (
    <div
      ref={ref}
      id={formItemId}
      aria-describedby={
        !error
          ? `${formDescriptionId}`
          : `${formDescriptionId} ${formMessageId}`
      }
      aria-invalid={!!error}
      {...props}
    />
  );
});
FormControl.displayName = "FormControl";

// ─── FormDescription ─────────────────────────────────────────────────────────────

const FormDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => {
  const { formDescriptionId } = useFormField();

  return (
    <p
      ref={ref}
      id={formDescriptionId}
      className={className}
      {...props}
    />
  );
});
FormDescription.displayName = "FormDescription";

// ─── FormMessage ─────────────────────────────────────────────────────────────────

const FormMessage = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, children, ...props }, ref) => {
  const { error, formMessageId } = useFormField();
  const body = error ? String(error?.message) : children;

  if (!body) {
    return null;
  }

  return (
    <p
      ref={ref}
      id={formMessageId}
      className={className}
      {...props}
    >
      {body}
    </p>
  );
});
FormMessage.displayName = "FormMessage";

// ─── Exports ─────────────────────────────────────────────────────────────────────

export {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
};
