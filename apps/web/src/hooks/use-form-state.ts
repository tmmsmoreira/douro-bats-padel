/**
 * Form state management hook
 * Provides a simplified API for managing form state with validation
 */

import { useState, useCallback } from 'react';
import type { Validator, ValidationResult } from '@/lib/validation';

export type FieldConfig<T> = {
  initialValue: T;
  validators?: Validator<T>[];
};

export type FormConfig<T extends Record<string, any>> = {
  [K in keyof T]: FieldConfig<T[K]>;
};

export type FormErrors<T extends Record<string, any>> = {
  [K in keyof T]?: string;
};

export type FormTouched<T extends Record<string, any>> = {
  [K in keyof T]?: boolean;
};

export function useFormState<T extends Record<string, any>>(config: FormConfig<T>) {
  // Extract initial values from config
  const initialValues = Object.entries(config).reduce((acc, [key, fieldConfig]) => {
    acc[key as keyof T] = (fieldConfig as FieldConfig<any>).initialValue;
    return acc;
  }, {} as T);

  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<FormErrors<T>>({});
  const [touched, setTouched] = useState<FormTouched<T>>({});

  /**
   * Validate a single field
   */
  const validateField = useCallback(
    (name: keyof T, value: any): ValidationResult => {
      const fieldConfig = config[name] as FieldConfig<any>;
      if (!fieldConfig.validators || fieldConfig.validators.length === 0) {
        return { isValid: true };
      }

      // Run all validators and return the first error
      for (const validator of fieldConfig.validators) {
        const result = validator(value);
        if (!result.isValid) {
          return result;
        }
      }

      return { isValid: true };
    },
    [config]
  );

  /**
   * Validate all fields
   */
  const validateAll = useCallback((): boolean => {
    const newErrors: FormErrors<T> = {};
    let isValid = true;

    Object.keys(config).forEach((key) => {
      const fieldName = key as keyof T;
      const result = validateField(fieldName, values[fieldName]);
      if (!result.isValid) {
        newErrors[fieldName] = result.error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  }, [config, values, validateField]);

  /**
   * Update a single field value
   */
  const setValue = useCallback(
    (name: keyof T, value: any) => {
      setValues((prev) => ({ ...prev, [name]: value }));

      // Validate on change if field has been touched
      if (touched[name]) {
        const result = validateField(name, value);
        setErrors((prev) => ({
          ...prev,
          [name]: result.error,
        }));
      }
    },
    [touched, validateField]
  );

  /**
   * Update multiple field values at once
   */
  const setValues = useCallback((newValues: Partial<T>) => {
    setValues((prev) => ({ ...prev, ...newValues }));
  }, []);

  /**
   * Mark a field as touched
   */
  const setFieldTouched = useCallback(
    (name: keyof T, isTouched = true) => {
      setTouched((prev) => ({ ...prev, [name]: isTouched }));

      // Validate on blur
      if (isTouched) {
        const result = validateField(name, values[name]);
        setErrors((prev) => ({
          ...prev,
          [name]: result.error,
        }));
      }
    },
    [values, validateField]
  );

  /**
   * Reset form to initial values
   */
  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  }, [initialValues]);

  /**
   * Get field props for easy binding
   */
  const getFieldProps = useCallback(
    (name: keyof T) => ({
      value: values[name],
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setValue(name, e.target.value);
      },
      onBlur: () => setFieldTouched(name, true),
      error: touched[name] ? errors[name] : undefined,
    }),
    [values, errors, touched, setValue, setFieldTouched]
  );

  return {
    values,
    errors,
    touched,
    setValue,
    setValues,
    setFieldTouched,
    validateField,
    validateAll,
    reset,
    getFieldProps,
    isValid: Object.keys(errors).length === 0,
  };
}
