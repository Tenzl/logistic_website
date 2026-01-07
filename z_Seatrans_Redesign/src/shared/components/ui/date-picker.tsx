"use client"

import * as React from "react"
import { format } from "date-fns"
import { ChevronDownIcon } from "lucide-react"

import { cn } from "@/shared/lib/utils"
import { Button } from "@/shared/components/ui/button"
import { Calendar } from "@/shared/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/components/ui/popover"

interface DatePickerProps {
  id?: string
  value?: string
  onChange?: (date: string) => void
  placeholder?: string
  disabled?: boolean
  required?: boolean
  className?: string
}

export function DatePicker({
  id,
  value,
  onChange,
  placeholder = "Select date",
  disabled = false,
  required = false,
  className,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false)
  const [date, setDate] = React.useState<Date | undefined>(
    value ? new Date(value) : undefined
  )

  const handleSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate)
    if (selectedDate && onChange) {
      // Format as YYYY-MM-DD for form submission
      const formattedDate = format(selectedDate, "yyyy-MM-dd")
      onChange(formattedDate)
    } else if (!selectedDate && onChange) {
      onChange("")
    }
    setOpen(false)
  }

  // Update internal state when value prop changes
  React.useEffect(() => {
    if (value) {
      setDate(new Date(value))
    } else {
      setDate(undefined)
    }
  }, [value])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          className={cn(
            "w-full justify-between text-left font-normal bg-white",
            !date && "text-muted-foreground",
            className
          )}
          disabled={disabled}
        >
          {date ? date.toLocaleDateString() : placeholder}
          <ChevronDownIcon />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto overflow-hidden p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          captionLayout="dropdown"
          onSelect={handleSelect}
        />
      </PopoverContent>
    </Popover>
  )
}
