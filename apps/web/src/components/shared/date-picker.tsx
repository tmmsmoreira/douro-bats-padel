'use client';

import * as React from 'react';
import { Calendar } from '@/components/ui/calendar';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '@/components/ui/input-group';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CalendarDaysIcon } from 'lucide-animated';
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
  placeholder?: string;
  disabled?: boolean;
  id?: string;
  showHint?: boolean;
  hint?: string;
}

export function DatePicker({
  value,
  onChange,
  placeholder = 'DD/MM/YYYY',
  disabled,
  id,
  showHint = true,
  hint = 'Format: DD/MM/YYYY',
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);
  const [date, setDate] = React.useState<Date | undefined>(value);
  const [inputValue, setInputValue] = React.useState(formatDateInput(value));
  const isMobile = useIsMobile();

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
    />
  );

  return (
    <div className="space-y-1.5">
      <InputGroup>
        <InputGroupInput
          id={id}
          value={inputValue}
          placeholder={placeholder}
          disabled={disabled}
          onChange={handleInputChange}
          onKeyDown={(e) => {
            if (e.key === 'ArrowDown') {
              e.preventDefault();
              setOpen(true);
            }
          }}
          maxLength={10}
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
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="sm:max-w-[425px]" aria-describedby={undefined}>
                  <DialogHeader>
                    <DialogTitle>Select date</DialogTitle>
                  </DialogHeader>
                  <div className="flex justify-center">{calendarComponent}</div>
                </DialogContent>
              </Dialog>
            </>
          ) : (
            <Popover open={open} onOpenChange={setOpen} modal={false}>
              <PopoverTrigger asChild>
                <InputGroupButton
                  variant="ghost"
                  size="icon-xs"
                  aria-label="Select date"
                  disabled={disabled}
                >
                  <CalendarDaysIcon size={16} />
                  <span className="sr-only">Select date</span>
                </InputGroupButton>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end" alignOffset={-8} sideOffset={10}>
                {calendarComponent}
              </PopoverContent>
            </Popover>
          )}
        </InputGroupAddon>
      </InputGroup>
      {showHint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}
