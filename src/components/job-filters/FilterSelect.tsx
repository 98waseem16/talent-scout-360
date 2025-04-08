
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
  const handleValueChange = (newValue: string) => {
    // If "all" is selected, use empty string to clear the filter
    const valueToSet = newValue === "all" ? "" : newValue;
    onChange(valueToSet);
  };

  // Simple function to find selected value's option or default to "all"
  const getSelectValue = (currentValue: string): string => {
    if (!currentValue) return "all";
    
    // Check if the value exists in options
    const matchingOption = options.find(opt => 
      opt.value.toLowerCase() === currentValue.toLowerCase()
    );
    
    if (matchingOption) {
      return matchingOption.value;
    } else {
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
