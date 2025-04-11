
import { Job } from '@/lib/types/job.types';

export interface JobFilters {
  department: string;
  seniority: string;
  salaryRange: string;
  teamSize: string;
  investmentStage: string;
  remote: string;
  jobType: string;
  workHours: string;
  equity: string;
  hiringUrgency: string;
  revenueModel: string;
  visaSponsorship: boolean;
  [key: string]: string | boolean; // Index signature to allow Record-like access
}

export interface UseJobFiltersReturn {
  searchQuery: string;
  locationQuery: string;
  filters: JobFilters;
  isFilterOpen: boolean;
  activeFilters: { type: string; label: string }[];
  filteredJobs: Job[];
  setSearchQuery: (query: string) => void;
  setLocationQuery: (location: string) => void;
  setFilters: (field: string, value: string | boolean) => void;
  setIsFilterOpen: (isOpen: boolean) => void;
  clearFilters: () => void;
  clearAllFilters: () => void;
  removeFilter: (type: string) => void;
}

// Field mappings from UI filters to database fields
export const FIELD_MAPPINGS: Record<string, string> = {
  department: 'department',
  seniority: 'seniority_level',  // UI 'seniority' filter maps to DB 'seniority_level' field
  salaryRange: 'salary_range',
  teamSize: 'team_size',
  investmentStage: 'investment_stage',
  remote: 'remote_onsite',
  jobType: 'type',
  workHours: 'work_hours',
  equity: 'equity',
  hiringUrgency: 'hiring_urgency',
  revenueModel: 'revenue_model',
  visaSponsorship: 'visa_sponsorship'
};
