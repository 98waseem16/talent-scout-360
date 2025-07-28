import React from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { getCategoryByDepartment } from '@/lib/categories';

interface CategoryBreadcrumbProps {
  currentCategory: string;
  onClearCategory: () => void;
}

const CategoryBreadcrumb: React.FC<CategoryBreadcrumbProps> = ({ 
  currentCategory, 
  onClearCategory 
}) => {
  if (!currentCategory) return null;

  const categoryConfig = getCategoryByDepartment(currentCategory);
  const displayName = categoryConfig?.name || currentCategory;

  return (
    <div className="mb-4 bg-white rounded-lg border border-border p-3">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <button 
          onClick={onClearCategory}
          className="flex items-center gap-1 hover:text-primary transition-colors"
        >
          <Home className="w-4 h-4" />
          All Jobs
        </button>
        <ChevronRight className="w-4 h-4" />
        <span className="text-foreground font-medium">{displayName}</span>
      </div>
    </div>
  );
};

export default CategoryBreadcrumb;