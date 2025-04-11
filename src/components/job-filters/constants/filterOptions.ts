
import { FilterOption } from '../types';

// Department options - Using case-consistent values matching the database
export const departmentOptions: FilterOption[] = [
  { label: 'Engineering', value: 'Engineering' },
  { label: 'Product', value: 'Product' },
  { label: 'Design', value: 'Design' },
  { label: 'Marketing', value: 'Marketing' },
  { label: 'Sales', value: 'Sales' },
  { label: 'Operations', value: 'Operations' },
  { label: 'HR', value: 'HR' },
  { label: 'Customer Support', value: 'Customer Support' },
  { label: 'Legal', value: 'Legal' },
  { label: 'Finance', value: 'Finance' },
];

// Seniority options - Matching exactly with database values
export const seniorityOptions: FilterOption[] = [
  { label: 'Internship', value: 'Internship' },
  { label: 'Entry-Level', value: 'Entry-Level' },
  { label: 'Mid-Level', value: 'Mid-Level' },
  { label: 'Senior', value: 'Senior' },
  { label: 'Lead', value: 'Lead' },
  { label: 'Director', value: 'Director' },
  { label: 'VP', value: 'VP' },
  { label: 'C-Level', value: 'C-Level' },
];

// Salary range options - Matching database formats
export const salaryRangeOptions: FilterOption[] = [
  { label: '$40K-$60K', value: '$40k-$60k' },
  { label: '$60K-$80K', value: '$60k-$80k' },
  { label: '$80K-$120K', value: '$80k-$120k' },
  { label: '$120K+', value: '$120k+' },
];

// Team size options
export const teamSizeOptions: FilterOption[] = [
  { label: '1-10', value: '1-10' },
  { label: '11-50', value: '11-50' },
  { label: '51-200', value: '51-200' },
  { label: '201-500', value: '201-500' },
  { label: '501+', value: '501+' },
];

// Investment stage options
export const investmentStageOptions: FilterOption[] = [
  { label: 'Pre-seed', value: 'Pre-seed' },
  { label: 'Seed', value: 'Seed' },
  { label: 'Series A', value: 'Series A' },
  { label: 'Series B', value: 'Series B' },
  { label: 'Series C+', value: 'Series C+' },
  { label: 'Public', value: 'Public' },
  { label: 'Profitable', value: 'Profitable' },
];

// Remote/onsite options
export const remoteOptions: FilterOption[] = [
  { label: 'Fully Remote', value: 'Fully Remote' },
  { label: 'Hybrid', value: 'Hybrid' },
  { label: 'Onsite', value: 'Onsite' },
];

// Job type options - match exactly with type field in Job type
export const jobTypeOptions: FilterOption[] = [
  { label: 'Full-time', value: 'Full-time' },
  { label: 'Part-time', value: 'Part-time' },
  { label: 'Contract', value: 'Contract' },
  { label: 'Remote', value: 'Remote' },
  { label: 'Freelance', value: 'Freelance' },
  { label: 'Internship', value: 'Internship' },
];

// Work hours options
export const workHoursOptions: FilterOption[] = [
  { label: 'Flexible', value: 'Flexible' },
  { label: 'Fixed', value: 'Fixed' },
  { label: 'Async Work', value: 'Async Work' },
];

// Equity options
export const equityOptions: FilterOption[] = [
  { label: 'None', value: 'None' },
  { label: '0.1%-0.5%', value: '0.1%-0.5%' },
  { label: '0.5%-1%', value: '0.5%-1%' },
  { label: '1%+', value: '1%+' },
];

// Hiring urgency options
export const hiringUrgencyOptions: FilterOption[] = [
  { label: 'Immediate Hire', value: 'Immediate Hire' },
  { label: 'Within a Month', value: 'Within a Month' },
  { label: 'Open to Future Applicants', value: 'Open to Future Applicants' },
];

// Revenue model options
export const revenueModelOptions: FilterOption[] = [
  { label: 'SaaS', value: 'SaaS' },
  { label: 'Marketplace', value: 'Marketplace' },
  { label: 'E-commerce', value: 'E-commerce' },
  { label: 'Subscription', value: 'Subscription' },
  { label: 'Advertising', value: 'Advertising' },
  { label: 'Services', value: 'Services' },
];
