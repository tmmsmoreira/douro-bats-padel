"use client"

import * as React from "react"
import { DatePicker } from "@/components/ui/date-picker"
import { TimePicker } from "@/components/ui/time-picker"

interface DateTimePickerProps {
  value?: Date
  onChange?: (date: Date | undefined) => void
  placeholder?: string
  disabled?: boolean
  id?: string
}

export function DateTimePicker({ 
  value, 
  onChange, 
  placeholder = "Select date and time",
  disabled,
  id
}: DateTimePickerProps) {
  const [date, setDate] = React.useState<Date | undefined>(value)
  const [time, setTime] = React.useState<Date | undefined>(value)

  // Sync with external value changes
  React.useEffect(() => {
    setDate(value)
    setTime(value)
  }, [value])

  // Combine date and time when either changes
  const handleDateChange = (newDate: Date | undefined) => {
    setDate(newDate)
    if (newDate && time) {
      const combined = new Date(newDate)
      combined.setHours(time.getHours(), time.getMinutes(), 0, 0)
      if (onChange) {
        onChange(combined)
      }
    } else if (newDate) {
      if (onChange) {
        onChange(newDate)
      }
    } else {
      if (onChange) {
        onChange(undefined)
      }
    }
  }

  const handleTimeChange = (newTime: Date | undefined) => {
    setTime(newTime)
    if (date && newTime) {
      const combined = new Date(date)
      combined.setHours(newTime.getHours(), newTime.getMinutes(), 0, 0)
      if (onChange) {
        onChange(combined)
      }
    } else if (newTime) {
      if (onChange) {
        onChange(newTime)
      }
    } else {
      if (onChange) {
        onChange(undefined)
      }
    }
  }

  return (
    <div className="grid grid-cols-2 gap-2">
      <DatePicker
        id={id ? `${id}-date` : undefined}
        value={date}
        onChange={handleDateChange}
        placeholder="Select date"
        disabled={disabled}
      />
      <TimePicker
        id={id ? `${id}-time` : undefined}
        value={time}
        onChange={handleTimeChange}
        placeholder="Select time"
        disabled={disabled}
      />
    </div>
  )
}

