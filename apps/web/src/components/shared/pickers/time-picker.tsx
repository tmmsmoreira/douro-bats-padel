'use client';

import * as React from 'react';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '@/components/ui/input-group';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { ClockIcon } from 'lucide-animated';
import { Check, ChevronDown, ChevronUp, X } from 'lucide-react';
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
  variant?: 'input' | 'pill';
}

export function TimePicker({
  value,
  onChange,
  onBlur,
  placeholder,
  disabled,
  id,
  'aria-invalid': ariaInvalid,
  variant = 'input',
}: TimePickerProps) {
  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState(formatTime(value));
  const isMobile = useIsMobile();
  const inputPlaceholder = placeholder ?? 'HH:MM';

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

  const renderTimeList = (surfaceClass: string) => (
    <TimeList
      options={timeOptions}
      selected={inputValue}
      onSelect={handleTimeSelect}
      surfaceClass={surfaceClass}
    />
  );

  if (variant === 'pill') {
    const pillLabel = value ? formatTime(value) : (placeholder ?? 'Select time');

    const pillContent = (
      <>
        <ClockIcon size={16} className="h-4 w-4" />
        {pillLabel}
        {value && !disabled && (
          <span
            role="button"
            tabIndex={-1}
            aria-label="Clear time"
            className="ml-1 -mr-1 hover:opacity-70 transition-opacity cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
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
                <DrawerTitle>Select time</DrawerTitle>
              </DrawerHeader>
              {renderTimeList('from-background')}
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
          {renderTimeList('from-popover')}
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
              animate={false}
            >
              <ClockIcon size={16} />
              <span className="sr-only">Select time</span>
            </InputGroupButton>
            <Drawer open={open} onOpenChange={setOpen}>
              <DrawerContent aria-describedby={undefined}>
                <DrawerHeader>
                  <DrawerTitle>Select time</DrawerTitle>
                </DrawerHeader>
                {renderTimeList('from-background')}
              </DrawerContent>
            </Drawer>
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
              {renderTimeList('from-popover')}
            </PopoverContent>
          </Popover>
        )}
      </InputGroupAddon>
    </InputGroup>
  );
}

interface TimeListProps {
  options: string[];
  selected: string;
  onSelect: (value: string) => void;
  surfaceClass: string;
}

function TimeList({ options, selected, onSelect, surfaceClass }: TimeListProps) {
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const [canScrollUp, setCanScrollUp] = React.useState(false);
  const [canScrollDown, setCanScrollDown] = React.useState(false);

  const updateIndicators = React.useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollUp(el.scrollTop > 0);
    setCanScrollDown(el.scrollTop + el.clientHeight < el.scrollHeight - 1);
  }, []);

  React.useLayoutEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const selectedEl = el.querySelector<HTMLButtonElement>('[data-selected="true"]');
    if (selectedEl) {
      el.scrollTop = Math.max(
        0,
        selectedEl.offsetTop - el.clientHeight / 2 + selectedEl.clientHeight / 2
      );
    }
    updateIndicators();
  }, [updateIndicators]);

  return (
    <div className="relative">
      <div
        aria-hidden
        className={cn(
          'pointer-events-none absolute inset-x-0 top-0 z-10 flex h-7 items-center justify-center bg-linear-to-b to-transparent transition-opacity duration-150',
          surfaceClass,
          canScrollUp ? 'opacity-100' : 'opacity-0'
        )}
      >
        <ChevronUp className="size-4 text-muted-foreground" />
      </div>
      <div
        ref={scrollRef}
        onScroll={updateIndicators}
        className="max-h-[300px] overflow-y-auto p-1"
        tabIndex={-1}
      >
        {options.map((option) => {
          const isSelected = selected === option;
          return (
            <button
              key={option}
              data-selected={isSelected}
              type="button"
              tabIndex={-1}
              className={cn(
                'relative flex w-full cursor-default select-none items-center justify-center rounded-sm px-8 py-2 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground',
                isSelected && 'bg-accent/50'
              )}
              onMouseDown={(e) => {
                e.preventDefault();
                onSelect(option);
              }}
            >
              <span className="tabular-nums">{option}</span>
              {isSelected && (
                <span className="absolute right-2 flex size-3.5 items-center justify-center">
                  <Check className="size-4" />
                </span>
              )}
            </button>
          );
        })}
      </div>
      <div
        aria-hidden
        className={cn(
          'pointer-events-none absolute inset-x-0 bottom-0 z-10 flex h-7 items-center justify-center bg-linear-to-t to-transparent transition-opacity duration-150',
          surfaceClass,
          canScrollDown ? 'opacity-100' : 'opacity-0'
        )}
      >
        <ChevronDown className="size-4 text-muted-foreground" />
      </div>
    </div>
  );
}
