'use client';

import * as React from 'react';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '@/components/ui/input-group';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Clock, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

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

function parseTimeString(timeString: string): Date | undefined {
  if (!timeString) return undefined;

  const [hours, minutes] = timeString.split(':').map(Number);
  if (isNaN(hours) || isNaN(minutes)) return undefined;

  const date = new Date();
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
  const [time, setTime] = React.useState<Date | undefined>(value);
  const [inputValue, setInputValue] = React.useState(formatTime(value));

  // Sync with external value changes
  React.useEffect(() => {
    setTime(value);
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

  return (
    <InputGroup>
      <InputGroupInput
        id={id}
        value={inputValue}
        placeholder={placeholder}
        disabled={disabled}
        onChange={(e) => {
          setInputValue(e.target.value);
          const parsedTime = parseTimeString(e.target.value);
          if (parsedTime) {
            setTime(parsedTime);
            if (onChange) {
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
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <InputGroupButton
              variant="ghost"
              size="icon-xs"
              aria-label="Select time"
              disabled={disabled}
            >
              <Clock />
              <span className="sr-only">Select time</span>
            </InputGroupButton>
          </PopoverTrigger>
          <PopoverContent
            className="w-auto overflow-hidden p-0"
            align="end"
            alignOffset={-8}
            sideOffset={10}
          >
            <div className="max-h-[300px] overflow-y-auto p-1">
              {timeOptions.map((timeOption) => {
                const isSelected = inputValue === timeOption;
                return (
                  <button
                    key={timeOption}
                    type="button"
                    className={cn(
                      'relative flex w-full cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
                      isSelected && 'bg-accent text-accent-foreground font-medium'
                    )}
                    onClick={() => {
                      setInputValue(timeOption);
                      const parsedTime = parseTimeString(timeOption);
                      setTime(parsedTime);
                      if (onChange) {
                        onChange(parsedTime);
                      }
                      setOpen(false);
                    }}
                  >
                    <span className="flex-1">{timeOption}</span>
                    {isSelected && <Check className="h-4 w-4" />}
                  </button>
                );
              })}
            </div>
          </PopoverContent>
        </Popover>
      </InputGroupAddon>
    </InputGroup>
  );
}
