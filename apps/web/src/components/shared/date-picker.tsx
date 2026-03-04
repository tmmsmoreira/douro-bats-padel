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
import { useMediaQuery } from '@/hooks/use-media-query';

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
  const isMobile = useMediaQuery('(max-width: 768px)');

  // Sync with external value changes
  React.useEffect(() => {
    setDate(value);
    setMonth(value);
    setInputValue(formatDate(value));
  }, [value]);

  const handleSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate);
    setInputValue(formatDate(selectedDate));
    if (onChange) {
      onChange(selectedDate);
    }
    setOpen(false);
  };

  const calendarComponent = (
    <Calendar
      mode="single"
      selected={date}
      month={month}
      onMonthChange={setMonth}
      onSelect={handleSelect}
    />
  );

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
          <Popover open={open} onOpenChange={setOpen}>
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
  );
}
