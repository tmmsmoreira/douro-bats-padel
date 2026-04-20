/**
 * SelectField component
 * A specialized Field variant for select inputs
 */

import React from 'react';
import { Field, FieldLabel } from './field';
import { FieldFeedback } from './field-feedback';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';

export interface SelectFieldOption {
  value: string;
  label: string;
}

export interface SelectFieldProps {
  label: string;
  description?: string;
  error?: string;
  containerClassName?: string;
  placeholder?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  options: SelectFieldOption[];
  disabled?: boolean;
  id?: string;
}

export const SelectField = React.forwardRef<HTMLButtonElement, SelectFieldProps>(
  (
    {
      label,
      description,
      error,
      containerClassName,
      placeholder,
      value,
      onValueChange,
      options,
      disabled,
      id,
    },
    ref
  ) => {
    const fieldId = id || `field-${label.toLowerCase().replace(/\s+/g, '-')}`;

    return (
      <Field className={containerClassName} data-invalid={!!error}>
        <FieldLabel htmlFor={fieldId}>{label}</FieldLabel>
        <Select value={value} onValueChange={onValueChange} disabled={disabled}>
          <SelectTrigger
            ref={ref}
            id={fieldId}
            aria-invalid={!!error}
            aria-describedby={
              error ? `${fieldId}-error` : description ? `${fieldId}-description` : undefined
            }
          >
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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

SelectField.displayName = 'SelectField';
