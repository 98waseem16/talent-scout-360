import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { CATEGORY_CONFIG } from '@/lib/categories';

interface CategoryCount {
  department: string;
  count: number;
}

interface CategoryWithCount {
  name: string;
  icon: any;
  department: string;
  slug: string;
  count: number;
}

export const useCategoryData = () => {
  const { data: categoryCounts, isLoading, error } = useQuery({
    queryKey: ['category-counts'],
    queryFn: async (): Promise<CategoryCount[]> => {
      const { data, error } = await supabase
        .from('job_postings')
        .select('department')
        .eq('is_draft', false)
        .eq('is_expired', false)
        .not('department', 'is', null);

      if (error) throw error;

      // Count departments
      const counts: Record<string, number> = {};
      data.forEach(job => {
        counts[job.department] = (counts[job.department] || 0) + 1;
      });

      return Object.entries(counts).map(([department, count]) => ({
        department,
        count
      }));
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  // Merge category config with real counts
  const categoriesWithCounts: CategoryWithCount[] = CATEGORY_CONFIG.map(category => {
    const countData = categoryCounts?.find(c => c.department === category.department);
    return {
      ...category,
      count: countData?.count || 0
    };
  }).filter(category => category.count > 0) // Only show categories with jobs
    .sort((a, b) => b.count - a.count); // Sort by count descending

  return {
    categories: categoriesWithCounts,
    isLoading,
    error
  };
};