
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
  // Log the current value for debugging
  console.log(`FilterSelect (${label}): Current value = "${value}", Has ${options.length} options`);

  const handleValueChange = (newValue: string) => {
    // If the value is "all", convert it to an empty string for consistency
    const valueToSet = newValue === "all" ? "" : newValue;
    console.log(`FilterSelect (${label}): Value changed from "${value}" to "${valueToSet}"`);
    onChange(valueToSet);
  };

  // Function to find the actual option value by case-insensitive matching
  const findMatchingOptionValue = (currentValue: string): string => {
    if (!currentValue) return "all";
    
    // Try to find an exact match first
    const exactMatch = options.find(opt => opt.value === currentValue);
    if (exactMatch) return exactMatch.value;
    
    // Try case-insensitive match
    const caseInsensitiveMatch = options.find(
      opt => opt.value.toLowerCase() === currentValue.toLowerCase()
    );
    if (caseInsensitiveMatch) return caseInsensitiveMatch.value;
    
    // For partial matches (e.g., "senior" might match with "Senior Level")
    const partialMatch = options.find(
      opt => opt.value.toLowerCase().includes(currentValue.toLowerCase()) || 
             currentValue.toLowerCase().includes(opt.value.toLowerCase())
    );
    if (partialMatch) return partialMatch.value;
    
    // If no match found
    console.log(`FilterSelect (${label}): No match found for "${currentValue}" among options`);
    return "all";
  };

  // Get the value to display in the select
  const selectedValue = findMatchingOptionValue(value);

  // Log all available options for this filter (helps with debugging)
  console.log(`FilterSelect (${label}): Available options:`, 
    options.map(opt => `${opt.label} (${opt.value})`).join(', '));
  
  console.log(`FilterSelect (${label}): Selected option value: "${selectedValue}"`);

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
