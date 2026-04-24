'use client';

import * as React from 'react';
import { useLocale } from 'next-intl';
import { Calendar } from '@/components/ui/calendar';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '@/components/ui/input-group';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { CalendarDaysIcon } from 'lucide-animated';
import { X } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-media-query';

function formatDateInput(date: Date | undefined): string {
  if (!date) {
    return '';
  }
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${day}/${month}/${year}`;
}

function parseDateInput(input: string): Date | undefined {
  if (!input) return undefined;

  // Match DD/MM/YYYY format
  const match = input.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) return undefined;

  const day = parseInt(match[1], 10);
  const month = parseInt(match[2], 10) - 1; // Month is 0-indexed
  const year = parseInt(match[3], 10);

  const date = new Date(year, month, day);

  // Validate the date is real (e.g., not 31/02/2024)
  if (date.getDate() !== day || date.getMonth() !== month || date.getFullYear() !== year) {
    return undefined;
  }

  return date;
}

interface DatePickerProps {
  value?: Date;
  onChange?: (date: Date | undefined) => void;
  onBlur?: () => void;
  placeholder?: string;
  disabled?: boolean;
  id?: string;
  'aria-invalid'?: boolean;
  variant?: 'input' | 'pill';
}

export function DatePicker({
  value,
  onChange,
  onBlur,
  placeholder,
  disabled,
  id,
  'aria-invalid': ariaInvalid,
  variant = 'input',
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);
  const [date, setDate] = React.useState<Date | undefined>(value);
  const [inputValue, setInputValue] = React.useState(formatDateInput(value));
  const isMobile = useIsMobile();
  const locale = useLocale();
  const inputPlaceholder = placeholder ?? 'DD/MM/YYYY';

  // Sync with external value changes
  React.useEffect(() => {
    setDate(value);
    setInputValue(formatDateInput(value));
  }, [value]);

  const handleSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate);
    setInputValue(formatDateInput(selectedDate));
    if (onChange) {
      onChange(selectedDate);
    }
    setOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newValue = e.target.value;

    // Only allow digits and forward slashes
    newValue = newValue.replace(/[^\d/]/g, '');

    // Limit to DD/MM/YYYY format (10 characters)
    if (newValue.length > 10) {
      newValue = newValue.slice(0, 10);
    }

    // Auto-insert slashes after DD and MM
    if (newValue.length === 2 && inputValue.length === 1) {
      newValue += '/';
    } else if (newValue.length === 5 && inputValue.length === 4) {
      newValue += '/';
    }

    setInputValue(newValue);

    // Try to parse the date if it matches the full format
    const parsedDate = parseDateInput(newValue);
    if (parsedDate) {
      setDate(parsedDate);
      if (onChange) {
        onChange(parsedDate);
      }
    } else if (newValue === '') {
      setDate(undefined);
      if (onChange) {
        onChange(undefined);
      }
    }
  };

  const calendarComponent = (
    <Calendar
      mode="single"
      captionLayout="dropdown"
      selected={date}
      onSelect={handleSelect}
      startMonth={new Date(1900, 0)}
      endMonth={new Date(2100, 11)}
      className={isMobile ? 'w-full' : undefined}
      formatters={
        isMobile
          ? {
              formatMonthDropdown: (d) => d.toLocaleString('default', { month: 'long' }),
            }
          : undefined
      }
    />
  );

  if (variant === 'pill') {
    const pillLabel = value
      ? new Date(value).toLocaleDateString(locale, { month: 'short', day: 'numeric' })
      : (placeholder ?? 'Select date');

    const pillContent = (
      <>
        <CalendarDaysIcon size={16} className="h-4 w-4" />
        {pillLabel}
        {value && !disabled && (
          <span
            role="button"
            tabIndex={-1}
            aria-label="Clear date"
            className="ml-1 -mr-1 hover:opacity-70 transition-opacity cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              setDate(undefined);
              setInputValue('');
              onChange?.(undefined);
            }}
          >
            <X className="h-3 w-3" />
          </span>
        )}
      </>
    );

    const pillClass = 'rounded-full gap-2 h-9 px-4';

    if (isMobile) {
      return (
        <>
          <Button
            type="button"
            variant={value ? 'secondary' : 'outline'}
            size="sm"
            disabled={disabled}
            onClick={() => setOpen(true)}
            className={pillClass}
            animate={false}
          >
            {pillContent}
          </Button>
          <Drawer open={open} onOpenChange={setOpen}>
            <DrawerContent aria-describedby={undefined}>
              <DrawerHeader>
                <DrawerTitle>Select date</DrawerTitle>
              </DrawerHeader>
              <div className="flex justify-center pb-4">{calendarComponent}</div>
            </DrawerContent>
          </Drawer>
        </>
      );
    }

    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant={value ? 'secondary' : 'outline'}
            size="sm"
            disabled={disabled}
            className={pillClass}
            animate={false}
          >
            {pillContent}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto overflow-hidden p-0" align="start">
          {calendarComponent}
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <InputGroup>
      <InputGroupInput
        id={id}
        value={inputValue}
        placeholder={inputPlaceholder}
        disabled={disabled}
        aria-invalid={ariaInvalid}
        onChange={handleInputChange}
        onBlur={() => {
          if (inputValue && !parseDateInput(inputValue)) {
            setInputValue(formatDateInput(value));
          }
          onBlur?.();
        }}
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown') {
            e.preventDefault();
            setOpen(true);
          }
        }}
        maxLength={10}
        inputMode="numeric"
      />
      <InputGroupAddon align="inline-end">
        {isMobile ? (
          <>
            <InputGroupButton
              variant="ghost"
              size="icon-xs"
              aria-label="Select date"
              disabled={disabled}
              onClick={() => setOpen(true)}
            >
              <CalendarDaysIcon size={16} />
              <span className="sr-only">Select date</span>
            </InputGroupButton>
            <Drawer open={open} onOpenChange={setOpen}>
              <DrawerContent aria-describedby={undefined}>
                <DrawerHeader>
                  <DrawerTitle>Select date</DrawerTitle>
                </DrawerHeader>
                <div className="flex justify-center pb-4">{calendarComponent}</div>
              </DrawerContent>
            </Drawer>
          </>
        ) : (
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <InputGroupButton
                variant="ghost"
                size="icon-xs"
                aria-label="Select date"
                disabled={disabled}
                animate={false}
              >
                <CalendarDaysIcon size={16} />
                <span className="sr-only">Select date</span>
              </InputGroupButton>
            </PopoverTrigger>
            <PopoverContent className="w-auto overflow-hidden p-0">
              {calendarComponent}
            </PopoverContent>
          </Popover>
        )}
      </InputGroupAddon>
    </InputGroup>
  );
}
