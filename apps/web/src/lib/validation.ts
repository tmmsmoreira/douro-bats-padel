/**
 * Form validation utilities
 * Provides reusable validation functions for common form fields
 */

export type ValidationResult = {
  isValid: boolean;
  error?: string;
};

export type Validator<T = string> = (
  value: T,
  options?: Record<string, unknown>
) => ValidationResult;

/**
 * Validation helpers
 */
export const validators = {
  /**
   * Validates that a value is not empty
   */
  required: (message = 'This field is required'): Validator => {
    return (value: string) => {
      const isValid = value !== undefined && value !== null && value.trim() !== '';
      return {
        isValid,
        error: isValid ? undefined : message,
      };
    };
  },

  /**
   * Validates minimum length
   */
  minLength: (min: number, message?: string): Validator => {
    return (value: string) => {
      const isValid = value.length >= min;
      return {
        isValid,
        error: isValid ? undefined : message || `Must be at least ${min} characters`,
      };
    };
  },

  /**
   * Validates maximum length
   */
  maxLength: (max: number, message?: string): Validator => {
    return (value: string) => {
      const isValid = value.length <= max;
      return {
        isValid,
        error: isValid ? undefined : message || `Must be at most ${max} characters`,
      };
    };
  },

  /**
   * Validates email format
   */
  email: (message = 'Invalid email address'): Validator => {
    return (value: string) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const isValid = emailRegex.test(value);
      return {
        isValid,
        error: isValid ? undefined : message,
      };
    };
  },

  /**
   * Validates URL format
   */
  url: (message = 'Invalid URL'): Validator => {
    return (value: string) => {
      if (!value) return { isValid: true }; // Optional URL
      try {
        new URL(value);
        return { isValid: true };
      } catch {
        return { isValid: false, error: message };
      }
    };
  },

  /**
   * Validates number range
   */
  numberRange: (min: number, max: number, message?: string): Validator<number> => {
    return (value: number) => {
      const isValid = value >= min && value <= max;
      return {
        isValid,
        error: isValid ? undefined : message || `Must be between ${min} and ${max}`,
      };
    };
  },

  /**
   * Validates minimum number
   */
  min: (min: number, message?: string): Validator<number> => {
    return (value: number) => {
      const isValid = value >= min;
      return {
        isValid,
        error: isValid ? undefined : message || `Must be at least ${min}`,
      };
    };
  },

  /**
   * Validates maximum number
   */
  max: (max: number, message?: string): Validator<number> => {
    return (value: number) => {
      const isValid = value <= max;
      return {
        isValid,
        error: isValid ? undefined : message || `Must be at most ${max}`,
      };
    };
  },

  /**
   * Validates date is in the future
   */
  futureDate: (message = 'Date must be in the future'): Validator<Date | string> => {
    return (value: Date | string) => {
      const date = typeof value === 'string' ? new Date(value) : value;
      const isValid = date > new Date();
      return {
        isValid,
        error: isValid ? undefined : message,
      };
    };
  },

  /**
   * Validates date is after another date
   */
  afterDate: (compareDate: Date | string, message?: string): Validator<Date | string> => {
    return (value: Date | string) => {
      const date = typeof value === 'string' ? new Date(value) : value;
      const compare = typeof compareDate === 'string' ? new Date(compareDate) : compareDate;
      const isValid = date > compare;
      return {
        isValid,
        error: isValid ? undefined : message || 'Date must be after the specified date',
      };
    };
  },

  /**
   * Custom validator
   */
  custom: <T = string>(validatorFn: (value: T) => boolean, message: string): Validator<T> => {
    return (value: T) => {
      const isValid = validatorFn(value);
      return {
        isValid,
        error: isValid ? undefined : message,
      };
    };
  },
};
