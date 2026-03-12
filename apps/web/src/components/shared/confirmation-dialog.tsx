'use client';

import * as React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Spinner } from '../ui/spinner';
import { DeleteIcon, DeleteIconHandle } from 'lucide-animated';
import { motion } from 'motion/react';

export interface ConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string | React.ReactNode;
  confirmText?: string;
  confirmingText?: string;
  cancelText?: string;
  onConfirm: () => void;
  variant?: 'default' | 'destructive';
  isLoading?: boolean;
}

export function ConfirmationDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmingText = 'Processing...',
  onConfirm,
  variant = 'default',
  isLoading = false,
}: ConfirmationDialogProps) {
  const deleteIconRef = React.useRef<DeleteIconHandle>(null);

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex flex-col"
          >
            <AlertDialogCancel disabled={isLoading}>{cancelText}</AlertDialogCancel>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex flex-col"
          >
            <AlertDialogAction
              onClick={onConfirm}
              disabled={isLoading}
              className={
                variant === 'destructive'
                  ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
                  : undefined
              }
              onMouseEnter={() => deleteIconRef.current?.startAnimation()}
              onMouseLeave={() => deleteIconRef.current?.stopAnimation()}
            >
              {isLoading ? (
                <>
                  {confirmingText}
                  <Spinner data-icon="inline-start" />
                </>
              ) : (
                <>
                  {variant === 'destructive' && (
                    <DeleteIcon ref={deleteIconRef} size={16} className="h-4 w-4" />
                  )}
                  {confirmText}
                </>
              )}
            </AlertDialogAction>
          </motion.div>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
