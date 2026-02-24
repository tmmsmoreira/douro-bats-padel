'use client';

import * as React from 'react';
import { Switch as SwitchPrimitive } from 'radix-ui';

import { cn } from '@/lib/utils';

function Switch({
  className,
  size = 'default',
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root> & {
  size?: 'sm' | 'default';
}) {
  const [isChecked, setIsChecked] = React.useState(props.checked || props.defaultChecked || false);
  const [enableTransition, setEnableTransition] = React.useState(false);

  React.useEffect(() => {
    if (props.checked !== undefined) {
      setIsChecked(props.checked);
    }
  }, [props.checked]);

  React.useEffect(() => {
    // Enable transition after a short delay to prevent initial animation
    const timer = setTimeout(() => {
      setEnableTransition(true);
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      data-size={size}
      className={cn(
        'cursor-pointer peer data-[state=checked]:bg-primary data-[state=unchecked]:bg-input focus-visible:border-ring focus-visible:ring-ring/50 dark:data-[state=unchecked]:bg-input/80 group/switch inline-flex shrink-0 items-center rounded-full border border-transparent shadow-xs transition-colors outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 data-[size=default]:h-[1.15rem] data-[size=default]:w-8 data-[size=sm]:h-3.5 data-[size=sm]:w-6',
        className
      )}
      {...props}
      onCheckedChange={(checked) => {
        setIsChecked(checked);
        props.onCheckedChange?.(checked);
      }}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          'bg-background dark:data-[state=unchecked]:bg-foreground dark:data-[state=checked]:bg-primary-foreground pointer-events-none block rounded-full ring-0 group-data-[size=default]/switch:size-4 group-data-[size=sm]/switch:size-3'
        )}
        style={{
          transform: isChecked ? 'translateX(calc(100% - 2px))' : 'translateX(0)',
          transition: enableTransition ? 'transform 200ms cubic-bezier(0.4, 0, 0.2, 1)' : 'none',
        }}
      />
    </SwitchPrimitive.Root>
  );
}

export { Switch };
