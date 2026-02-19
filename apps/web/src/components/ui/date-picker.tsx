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
import { CalendarIcon } from 'lucide-react';

function formatDate(date: Date | undefined) {
  if (!date) {
    return '';
  }

  return date.toLocaleDateString('en-US', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

function isValidDate(date: Date | undefined) {
  if (!date) {
    return false;
  }
  return !isNaN(date.getTime());
}

interface DatePickerProps {
  value?: Date;
  onChange?: (date: Date | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  id?: string;
}

export function DatePicker({
  value,
  onChange,
  placeholder = 'Select date',
  disabled,
  id,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);
  const [date, setDate] = React.useState<Date | undefined>(value);
  const [month, setMonth] = React.useState<Date | undefined>(value);
  const [inputValue, setInputValue] = React.useState(formatDate(value));

  // Sync with external value changes
  React.useEffect(() => {
    setDate(value);
    setMonth(value);
    setInputValue(formatDate(value));
  }, [value]);

  return (
    <InputGroup>
      <InputGroupInput
        id={id}
        value={inputValue}
        placeholder={placeholder}
        disabled={disabled}
        onChange={(e) => {
          const newDate = new Date(e.target.value);
          setInputValue(e.target.value);
          if (isValidDate(newDate)) {
            setDate(newDate);
            setMonth(newDate);
            if (onChange) {
              onChange(newDate);
            }
          }
        }}
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown') {
            e.preventDefault();
            setOpen(true);
          }
        }}
      />
      <InputGroupAddon align="inline-end">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <InputGroupButton
              variant="ghost"
              size="icon-xs"
              aria-label="Select date"
              disabled={disabled}
            >
              <CalendarIcon />
              <span className="sr-only">Select date</span>
            </InputGroupButton>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end" alignOffset={-8} sideOffset={10}>
            <Calendar
              mode="single"
              selected={date}
              month={month}
              onMonthChange={setMonth}
              onSelect={(selectedDate) => {
                setDate(selectedDate);
                setInputValue(formatDate(selectedDate));
                if (onChange) {
                  onChange(selectedDate);
                }
                setOpen(false);
              }}
            />
          </PopoverContent>
        </Popover>
      </InputGroupAddon>
    </InputGroup>
  );
}
