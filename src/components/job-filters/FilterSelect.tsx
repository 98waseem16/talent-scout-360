
import React from 'react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';

interface FilterOption {
  label: string;
  value: string;
}

interface FilterSelectProps {
  options: FilterOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  label?: string;
  icon?: React.ReactNode;
}

const FilterSelect: React.FC<FilterSelectProps> = ({ 
  options, 
  value, 
  onChange, 
  placeholder,
  label,
  icon
}) => {
  // Handle value change ensuring consistency
  const handleValueChange = (newValue: string) => {
    console.log(`FilterSelect change: from "${value}" to "${newValue}"`);
    
    // If "all" is selected, use empty string to clear the filter
    const valueToSet = newValue === "all" ? "" : newValue;
    onChange(valueToSet);
  };

  // Gets the display value for the select component
  const getSelectValue = (currentValue: string): string => {
    // Default to "all" for empty values
    if (!currentValue) return "all";
    
    // Log for debugging
    console.log(`FilterSelect options for "${label}":`, options.map(o => o.value).join(', '));
    
    // Check all options with case-insensitive matching
    const matchingOption = options.find(opt => 
      opt.value.toLowerCase() === currentValue.toLowerCase()
    );
    
    if (matchingOption) {
      console.log(`FilterSelect found matching option: "${matchingOption.value}" for "${currentValue}"`);
      return matchingOption.value;
    } else {
      console.log(`FilterSelect no matching option found for "${currentValue}", using "all"`);
      return "all";
    }
  };

  // Get the display value for the select
  const selectedValue = getSelectValue(value);

  return (
    <div className="space-y-1">
      {label && (
        <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          {icon}
          {label}
        </label>
      )}
      <Select value={selectedValue} onValueChange={handleValueChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{placeholder}</SelectItem>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default FilterSelect;
