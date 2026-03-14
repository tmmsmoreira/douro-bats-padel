/**
 * NumberField component
 * A specialized Field variant for number inputs
 */

import React from 'react';
import { Field, FieldLabel, FieldDescription, FieldError } from './field';
import { Input } from './input';
import { cn } from '@/lib/utils';

export interface NumberFieldProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string;
  description?: string;
  error?: string;
  containerClassName?: string;
}

export const NumberField = React.forwardRef<HTMLInputElement, NumberFieldProps>(
  ({ label, description, error, containerClassName, className, id, ...props }, ref) => {
    const fieldId = id || `field-${label.toLowerCase().replace(/\s+/g, '-')}`;

    return (
      <Field className={containerClassName}>
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
        {description && !error && <FieldDescription>{description}</FieldDescription>}
        {error && <FieldError id={`${fieldId}-error`}>{error}</FieldError>}
      </Field>
    );
  }
);

NumberField.displayName = 'NumberField';
