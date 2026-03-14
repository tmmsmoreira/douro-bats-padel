/**
 * LoadingButton component
 * A Button variant that shows a loading spinner when isLoading is true
 */

import * as React from 'react';
import { Button, buttonVariants } from './button';
import { Spinner } from './spinner';
import { cn } from '@/lib/utils';
import type { VariantProps } from 'class-variance-authority';

export interface LoadingButtonProps
  extends React.ComponentProps<'button'>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
  loadingText?: string;
  asChild?: boolean;
  animate?: boolean;
}

const LoadingButton = React.forwardRef<HTMLButtonElement, LoadingButtonProps>(
  (
    {
      children,
      isLoading = false,
      loadingText,
      disabled,
      className,
      variant,
      size,
      asChild,
      animate,
      ...props
    },
    ref
  ) => {
    return (
      <Button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(isLoading && 'cursor-wait', className)}
        variant={variant}
        size={size}
        asChild={asChild}
        animate={animate}
        {...props}
      >
        {isLoading && (
          <div aria-hidden="true">
            <Spinner />
          </div>
        )}
        {isLoading ? loadingText || children : children}
      </Button>
    );
  }
);

LoadingButton.displayName = 'LoadingButton';

export { LoadingButton };
