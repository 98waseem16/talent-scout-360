
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

  // Ensure selected value is valid or defaults to "all"
  // This handles cases where the value might not exactly match any option
  const selectedValue = value && options.some(opt => 
    opt.value.toLowerCase() === value.toLowerCase()
  ) ? value : "all";

  // Log all available options for this filter (helps with debugging)
  console.log(`FilterSelect (${label}): Available options:`, 
    options.map(opt => `${opt.label} (${opt.value})`).join(', '));

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
