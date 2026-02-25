'use client';

import * as React from 'react';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '@/components/ui/input-group';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ClockIcon } from 'lucide-animated';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMediaQuery } from '@/hooks/use-media-query';

function formatTime(date: Date | undefined) {
  if (!date) {
    return '';
  }

  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

function parseTimeString(timeString: string, baseDate?: Date): Date | undefined {
  if (!timeString) return undefined;

  const [hours, minutes] = timeString.split(':').map(Number);
  if (isNaN(hours) || isNaN(minutes)) return undefined;

  // Use the provided base date or create a new one
  // This ensures the time is set on the correct date
  const date = baseDate ? new Date(baseDate) : new Date();
  date.setHours(hours, minutes, 0, 0);
  return date;
}

interface TimePickerProps {
  value?: Date;
  onChange?: (date: Date | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  id?: string;
}

export function TimePicker({
  value,
  onChange,
  placeholder = 'Select time',
  disabled,
  id,
}: TimePickerProps) {
  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState(formatTime(value));
  const isMobile = useMediaQuery('(max-width: 768px)');

  // Sync with external value changes
  React.useEffect(() => {
    setInputValue(formatTime(value));
  }, [value]);

  // Generate time options (every 15 minutes)
  const timeOptions = React.useMemo(() => {
    const options: string[] = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        const h = hour.toString().padStart(2, '0');
        const m = minute.toString().padStart(2, '0');
        options.push(`${h}:${m}`);
      }
    }
    return options;
  }, []);

  const handleTimeSelect = (timeOption: string) => {
    setInputValue(timeOption);
    const parsedTime = parseTimeString(timeOption, value);
    if (parsedTime && onChange) {
      onChange(parsedTime);
    }
    setOpen(false);
  };

  const timeListComponent = (
    <div className="max-h-[300px] overflow-y-auto p-1">
      {timeOptions.map((timeOption) => {
        const isSelected = inputValue === timeOption;
        return (
          <button
            key={timeOption}
            type="button"
            className={cn(
              'relative flex w-full cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground',
              isSelected && 'bg-accent text-accent-foreground font-medium'
            )}
            onClick={() => handleTimeSelect(timeOption)}
          >
            <span className="flex-1 font-mono">{timeOption}</span>
            {isSelected && <Check size={16} />}
          </button>
        );
      })}
    </div>
  );

  return (
    <InputGroup>
      <InputGroupInput
        id={id}
        value={inputValue}
        placeholder={placeholder}
        disabled={disabled}
        onChange={(e) => {
          const newValue = e.target.value;
          setInputValue(newValue);

          // Only parse and trigger onChange if we have a complete time (HH:MM format)
          if (newValue.match(/^\d{2}:\d{2}$/)) {
            const parsedTime = parseTimeString(newValue, value);
            if (parsedTime && onChange) {
              onChange(parsedTime);
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
              aria-label="Select time"
              disabled={disabled}
              onClick={() => setOpen(true)}
            >
              <ClockIcon size={16} />
              <span className="sr-only">Select time</span>
            </InputGroupButton>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Select time</DialogTitle>
                </DialogHeader>
                {timeListComponent}
              </DialogContent>
            </Dialog>
          </>
        ) : (
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <InputGroupButton
                variant="ghost"
                size="icon-xs"
                aria-label="Select time"
                disabled={disabled}
              >
                <ClockIcon size={16} />
                <span className="sr-only">Select time</span>
              </InputGroupButton>
            </PopoverTrigger>
            <PopoverContent
              className="w-auto overflow-hidden p-0"
              align="end"
              alignOffset={-8}
              sideOffset={10}
            >
              {timeListComponent}
            </PopoverContent>
          </Popover>
        )}
      </InputGroupAddon>
    </InputGroup>
  );
}
