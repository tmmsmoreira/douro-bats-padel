'use client';

import * as React from 'react';
import { ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon } from 'lucide-animated';
import { DayPicker, type DropdownProps } from 'react-day-picker';

import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({ className, classNames, showOutsideDays = true, ...props }: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn('p-3', className)}
      classNames={{
        months: 'flex flex-col sm:flex-row space-y-4 sm:space-y-0',
        month: 'space-y-4',
        month_caption: 'justify-center pt-1 relative items-center',
        caption_label: 'text-sm font-medium',
        nav: 'hidden',
        month_grid: 'w-full border-collapse space-y-1',
        weekdays: 'flex',
        weekday: 'text-muted-foreground rounded-md w-9 font-normal text-[0.8rem] text-center',
        week: 'flex mt-2',
        day: 'text-center text-sm p-0 relative w-9 h-9 flex items-center justify-center',
        day_button: cn(
          buttonVariants({ variant: 'ghost' }),
          'h-9 w-9 p-0 font-normal aria-selected:opacity-100'
        ),
        range_end: 'day-range-end',
        selected:
          'bg-primary text-primary-foreground rounded-md hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground',
        today: 'bg-accent rounded-md text-accent-foreground',
        outside:
          'day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30',
        disabled: 'text-muted-foreground opacity-50',
        range_middle: 'aria-selected:bg-accent aria-selected:text-accent-foreground',
        hidden: 'invisible',
        dropdown_root: 'relative inline-flex items-center',
        dropdown:
          'absolute inset-0 w-full appearance-none opacity-0 cursor-pointer z-10 m-0 p-0 text-left',
        dropdowns: 'flex gap-2 items-center justify-center',
        dropdown_month: 'relative inline-flex items-center',
        dropdown_year: 'relative inline-flex items-center',
        chevron: 'fill-current',
        ...classNames,
      }}
      components={{
        Dropdown: (props: DropdownProps) => {
          const { value, onChange, options } = props;
          const selected = options?.find((option) => option.value === value);
          const handleChange = (value: string) => {
            const changeEvent = {
              target: { value },
            } as React.ChangeEvent<HTMLSelectElement>;
            onChange?.(changeEvent);
          };
          return (
            <Select value={value?.toString()} onValueChange={handleChange}>
              <SelectTrigger className="h-8 pr-1.5 focus:ring-0">
                <SelectValue>{selected?.label}</SelectValue>
              </SelectTrigger>
              <SelectContent position="popper" className="max-h-80">
                {options?.map((option, id: number) => (
                  <SelectItem key={`${option.value}-${id}`} value={option.value?.toString() ?? ''}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          );
        },
        Chevron: ({ orientation }) => {
          if (orientation === 'left') {
            return <ChevronLeftIcon size={16} className="h-4 w-4" />;
          }
          if (orientation === 'right') {
            return <ChevronRightIcon size={16} className="h-4 w-4" />;
          }
          if (orientation === 'down') {
            return <ChevronDownIcon size={16} className="h-4 w-4" />;
          }
          return <ChevronRightIcon size={16} className="h-4 w-4" />;
        },
        CaptionLabel: ({ children }) => {
          return (
            <span className="inline-flex items-center gap-1 text-sm font-medium">
              {children}
              <ChevronDownIcon size={16} className="h-3 w-3 opacity-50" />
            </span>
          );
        },
      }}
      {...props}
    />
  );
}
Calendar.displayName = 'Calendar';

export { Calendar };
