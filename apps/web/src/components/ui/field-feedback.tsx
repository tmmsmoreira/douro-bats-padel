'use client';

import * as React from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { FieldDescription, FieldError } from './field';

interface FieldFeedbackProps {
  error?: string;
  description?: React.ReactNode;
  errorId?: string;
  descriptionId?: string;
}

const EASE_OUT_QUART = [0.165, 0.84, 0.44, 1] as const;
const DURATION = 0.15;

export function FieldFeedback({ error, description, errorId, descriptionId }: FieldFeedbackProps) {
  const prefersReducedMotion = useReducedMotion();

  const variants = prefersReducedMotion
    ? {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
      }
    : {
        initial: { opacity: 0, y: -4 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -4 },
      };

  return (
    <AnimatePresence mode="wait" initial={false}>
      {error ? (
        <motion.div
          key="error"
          initial={variants.initial}
          animate={variants.animate}
          exit={variants.exit}
          transition={{ duration: DURATION, ease: EASE_OUT_QUART }}
        >
          <FieldError id={errorId}>{error}</FieldError>
        </motion.div>
      ) : description ? (
        <motion.div
          key="description"
          initial={variants.initial}
          animate={variants.animate}
          exit={variants.exit}
          transition={{ duration: DURATION, ease: EASE_OUT_QUART }}
        >
          <FieldDescription id={descriptionId}>{description}</FieldDescription>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
