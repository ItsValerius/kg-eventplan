import type { AnyFieldApi } from "@tanstack/react-form";
import type { ReactNode } from "react";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";

// What the control needs to be labelled and tied to its error.
export type ControlProps = {
  id: string;
  name: string;
  onBlur: () => void;
  "aria-invalid": true | undefined;
  "aria-describedby": string | undefined;
};

// Label, control and first error of one TanStack Form field. Errors show once the form was
// submitted and then follow each change.
export function FormField({
  field,
  id = field.name,
  label,
  optional = false,
  invalid: forced = false,
  className,
  children,
}: {
  field: AnyFieldApi;
  id?: string;
  label: string;
  optional?: boolean;
  // Marks the field even without an error of its own, e.g. when the server refused.
  invalid?: boolean;
  className?: string;
  children: (control: ControlProps) => ReactNode;
}) {
  const invalid = field.state.meta.isTouched && !field.state.meta.isValid;
  return (
    <Field data-invalid={invalid || forced || undefined} className={className}>
      <FieldLabel htmlFor={id} className="gap-1 text-xs font-semibold">
        {label}
        {optional && <span className="font-normal text-muted-foreground">(optional)</span>}
      </FieldLabel>
      {children({
        id,
        name: field.name,
        onBlur: field.handleBlur,
        "aria-invalid": invalid || undefined,
        "aria-describedby": invalid ? `${id}-error` : undefined,
      })}
      {invalid && (
        <FieldError
          id={`${id}-error`}
          className="text-xs"
          errors={field.state.meta.errors.slice(0, 1)}
        />
      )}
    </Field>
  );
}

// Moves focus to the first field, in form order, that failed validation.
export function focusFirstInvalid<F extends string>(
  form: { getFieldMeta: (field: F) => { errors: unknown[] } | undefined },
  fields: readonly F[],
  id: (field: F) => string = (field) => field,
) {
  const first = fields.find((field) => form.getFieldMeta(field)?.errors.length);
  if (first) document.getElementById(id(first))?.focus();
  return first;
}
