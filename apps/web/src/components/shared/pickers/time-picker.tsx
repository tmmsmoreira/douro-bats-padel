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
import { useIsMobile } from '@/hooks/use-media-query';

function formatTime(date: Date | undefined): string {
  if (!date) {
    return '';
  }
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

function parseTimeString(timeString: string, baseDate?: Date): Date | undefined {
  if (!timeString) return undefined;

  const match = timeString.match(/^(\d{2}):(\d{2})$/);
  if (!match) return undefined;

  const hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  if (hours > 23 || minutes > 59) return undefined;

  const date = baseDate ? new Date(baseDate) : new Date();
  date.setHours(hours, minutes, 0, 0);
  return date;
}

interface TimePickerProps {
  value?: Date;
  onChange?: (date: Date | undefined) => void;
  onBlur?: () => void;
  placeholder?: string;
  disabled?: boolean;
  id?: string;
  'aria-invalid'?: boolean;
}

export function TimePicker({
  value,
  onChange,
  onBlur,
  placeholder = 'HH:MM',
  disabled,
  id,
  'aria-invalid': ariaInvalid,
}: TimePickerProps) {
  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState(formatTime(value));
  const isMobile = useIsMobile();

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newValue = e.target.value;

    // Only allow digits and colons
    newValue = newValue.replace(/[^\d:]/g, '');

    // Limit to HH:MM format (5 characters)
    if (newValue.length > 5) {
      newValue = newValue.slice(0, 5);
    }

    // Auto-insert colon after HH
    if (newValue.length === 2 && inputValue.length === 1) {
      newValue += ':';
    }

    setInputValue(newValue);

    // Try to parse the time if it matches the full format
    const parsedTime = parseTimeString(newValue, value);
    if (parsedTime) {
      if (onChange) {
        onChange(parsedTime);
      }
    } else if (newValue === '') {
      if (onChange) {
        onChange(undefined);
      }
    }
  };

  const timeListComponent = (
    <div className="max-h-[300px] overflow-y-auto p-1" tabIndex={-1}>
      {timeOptions.map((timeOption) => {
        const isSelected = inputValue === timeOption;
        return (
          <button
            key={timeOption}
            type="button"
            tabIndex={-1}
            className={cn(
              'relative flex w-full cursor-default select-none items-center gap-2 rounded-sm py-1.5 pr-8 pl-2 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground',
              isSelected && 'bg-accent/50'
            )}
            onMouseDown={(e) => {
              e.preventDefault(); // Prevent focus
              handleTimeSelect(timeOption);
            }}
          >
            <span className="flex-1 font-mono">{timeOption}</span>
            {isSelected && (
              <span className="absolute right-2 flex size-3.5 items-center justify-center">
                <Check className="size-4" />
              </span>
            )}
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
        aria-invalid={ariaInvalid}
        onChange={handleInputChange}
        onBlur={() => {
          if (inputValue && !parseTimeString(inputValue, value)) {
            setInputValue(formatTime(value));
          }
          onBlur?.();
        }}
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown') {
            e.preventDefault();
            setOpen(true);
          }
        }}
        maxLength={5}
        inputMode="numeric"
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
              <DialogContent className="sm:max-w-[425px]" aria-describedby={undefined}>
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
                animate={false}
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
