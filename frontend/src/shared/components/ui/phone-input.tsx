import * as React from 'react'
import { CheckIcon, ChevronsUpDown } from 'lucide-react'
import * as RPNInput from 'react-phone-number-input'
import flags from 'react-phone-number-input/flags'
import 'react-phone-number-input/style.css'

import { Button } from '@/shared/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/shared/components/ui/command'
import { Input } from '@/shared/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/components/ui/popover'
import { cn } from '@/shared/lib/utils'

type PhoneInputProps = Omit<React.ComponentProps<'input'>, 'onChange' | 'value' | 'ref'> &
  Omit<RPNInput.Props<typeof RPNInput.default>, 'onChange'> & {
    onChange?: (value: RPNInput.Value) => void
  }

const PhoneInput = React.forwardRef<React.ElementRef<typeof RPNInput.default>, PhoneInputProps>(
  ({ className, onChange, value, ...props }, ref) => {
    return (
      <RPNInput.default
        ref={ref}
        className={cn('flex', className)}
        flagComponent={FlagComponent}
        countrySelectComponent={CountrySelect}
        inputComponent={InputComponent}
        smartCaret={false}
        value={value || undefined}
        onChange={val => onChange?.(val || ('' as RPNInput.Value))}
        {...props}
      />
    )
  }
)
PhoneInput.displayName = 'PhoneInput'

const InputComponent = React.forwardRef<HTMLInputElement, React.ComponentProps<'input'>>(
  ({ className, ...props }, ref) => (
    <Input
      className={cn('rounded-e-lg rounded-s-none', className)}
      {...props}
      ref={ref}
    />
  )
)
InputComponent.displayName = 'InputComponent'

type CountryEntry = { label: string; value: RPNInput.Country | undefined }

type CountrySelectProps = {
  disabled?: boolean
  value: RPNInput.Country
  options: CountryEntry[]
  onChange: (country: RPNInput.Country) => void
}

const CountrySelect = ({ disabled, value: selectedCountry, options: countryList, onChange }: CountrySelectProps) => {
  const [open, setOpen] = React.useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="flex gap-1 rounded-e-none rounded-s-lg border-r-0 px-3 focus:z-10"
          disabled={disabled}
        >
          <FlagComponent country={selectedCountry} countryName={selectedCountry} />
          <ChevronsUpDown className={cn('size-4 shrink-0 opacity-50', disabled && 'hidden')} />
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-[300px] p-0 data-[state=open]:animate-none data-[state=closed]:animate-none" 
        align="start" 
        sideOffset={4}
      >
        <Command loop>
          <CommandInput placeholder="Search country..." className="h-9" />
          <CommandList className="max-h-[200px]">
            <CommandEmpty>No country found.</CommandEmpty>
            <CommandGroup>
              {countryList.map(({ value, label }) =>
                value ? (
                  <CommandItem
                    key={value}
                    value={label}
                    onSelect={() => {
                      onChange(value)
                      setOpen(false)
                    }}
                    className="gap-2"
                  >
                    <FlagComponent country={value} countryName={label} />
                    <span className="flex-1 text-sm">{label}</span>
                    <span className="text-sm text-foreground/50">+{RPNInput.getCountryCallingCode(value)}</span>
                    <CheckIcon
                      className={cn('ml-auto size-4', value === selectedCountry ? 'opacity-100' : 'opacity-0')}
                      aria-hidden="true"
                    />
                  </CommandItem>
                ) : null
              )}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

const FlagComponent = ({ country, countryName }: RPNInput.FlagProps) => {
  const Flag = flags[country]

  return (
    <span className="flex h-4 w-6 overflow-hidden rounded-sm bg-foreground/20 [&_svg:not([class*='size-'])]:size-full">
      {Flag && <Flag title={countryName} />}
    </span>
  )
}

export { PhoneInput }
