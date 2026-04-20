/**
 * NumberField component
 * A specialized Field variant for number inputs
 */

import React from 'react';
import { Field, FieldLabel } from './field';
import { FieldFeedback } from './field-feedback';
import { Input } from './input';
import { cn } from '@/lib/utils';

export interface NumberFieldProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'type'
> {
  label: string;
  description?: string;
  error?: string;
  containerClassName?: string;
}

export const NumberField = React.forwardRef<HTMLInputElement, NumberFieldProps>(
  ({ label, description, error, containerClassName, className, id, ...props }, ref) => {
    const fieldId = id || `field-${label.toLowerCase().replace(/\s+/g, '-')}`;

    return (
      <Field className={containerClassName} data-invalid={!!error}>
        <FieldLabel htmlFor={fieldId}>{label}</FieldLabel>
        <Input
          ref={ref}
          id={fieldId}
          type="number"
          className={cn(error && 'border-destructive', className)}
          aria-invalid={!!error}
          aria-describedby={
            error ? `${fieldId}-error` : description ? `${fieldId}-description` : undefined
          }
          {...props}
        />
        <FieldFeedback
          error={error}
          description={description}
          errorId={`${fieldId}-error`}
          descriptionId={`${fieldId}-description`}
        />
      </Field>
    );
  }
);

NumberField.displayName = 'NumberField';
