import { Briefcase, Code, Palette, Megaphone, Box, Users, Settings, HeadphonesIcon, DollarSign, Building } from 'lucide-react';

// Category mapping from display names to database department values
export const CATEGORY_MAPPINGS: Record<string, string> = {
  'Software Engineering': 'Engineering',
  'Design': 'Design', 
  'Marketing': 'Marketing',
  'Product Management': 'Product',
  'Sales': 'Sales',
  'Operations': 'Operations',
  'Finance': 'Finance',
  'Customer Support': 'Customer Support',
  'HR': 'HR',
  'Other': 'Other'
};

// Reverse mapping for URL generation
export const DEPARTMENT_TO_CATEGORY: Record<string, string> = Object.fromEntries(
  Object.entries(CATEGORY_MAPPINGS).map(([key, value]) => [value, key])
);

// Category configuration with icons and metadata
export const CATEGORY_CONFIG = [
  {
    name: 'Software Engineering',
    icon: Code,
    department: 'Engineering',
    slug: 'software-engineering'
  },
  {
    name: 'Design',
    icon: Palette,
    department: 'Design',
    slug: 'design'
  },
  {
    name: 'Marketing',
    icon: Megaphone,
    department: 'Marketing', 
    slug: 'marketing'
  },
  {
    name: 'Product Management',
    icon: Box,
    department: 'Product',
    slug: 'product-management'
  },
  {
    name: 'Sales',
    icon: DollarSign,
    department: 'Sales',
    slug: 'sales'
  },
  {
    name: 'Operations',
    icon: Settings,
    department: 'Operations',
    slug: 'operations'
  },
  {
    name: 'Finance',
    icon: DollarSign,
    department: 'Finance',
    slug: 'finance'
  },
  {
    name: 'Customer Support',
    icon: HeadphonesIcon,
    department: 'Customer Support',
    slug: 'customer-support'
  },
  {
    name: 'HR',
    icon: Users,
    department: 'HR',
    slug: 'hr'
  },
  {
    name: 'Other',
    icon: Building,
    department: 'Other',
    slug: 'other'
  }
];

// Helper functions
export const getCategoryBySlug = (slug: string) => {
  return CATEGORY_CONFIG.find(cat => cat.slug === slug);
};

export const getCategoryByDepartment = (department: string) => {
  return CATEGORY_CONFIG.find(cat => cat.department === department);
};

export const slugToCategory = (slug: string): string => {
  const category = getCategoryBySlug(slug);
  return category ? category.name : '';
};

export const categoryToSlug = (categoryName: string): string => {
  const category = CATEGORY_CONFIG.find(cat => cat.name === categoryName);
  return category ? category.slug : '';
};