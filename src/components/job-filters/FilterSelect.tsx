
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
    // Log detailed filter change information
    console.log(`Filter changed: ${label || 'unknown'} filter`, {
      filterName: label,
      previousValue: value,
      newValue,
      availableOptions: options.map(o => ({ label: o.label, value: o.value }))
    });
    
    onChange(newValue);
  };

  return (
    <div className="space-y-1">
      {label && (
        <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          {icon}
          {label}
        </label>
      )}
      <Select value={value} onValueChange={handleValueChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All</SelectItem>
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
