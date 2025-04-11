
import { JobFilters as JobFiltersType } from '@/hooks/filters/types';

export interface FilterOption {
  label: string;
  value: string;
}

export interface JobFiltersProps {
  filters: JobFiltersType;
  setFilters: (field: string, value: string | boolean) => void;
  clearAllFilters: () => void;
}
