import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getJobs } from '@/lib/jobs/operations/fetchJobs';
import { useJobFilters } from '@/hooks/filters';
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from '@/lib/utils';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import JobSearchBar from '@/components/jobs/JobSearchBar';
import ActiveFilters from '@/components/jobs/ActiveFilters';
import FilterToggle from '@/components/jobs/FilterToggle';
import FilterSidebar from '@/components/jobs/FilterSidebar';
import JobsList from '@/components/jobs/JobsList';
import JobsCount from '@/components/jobs/JobsCount';
import CategoryBreadcrumb from '@/components/CategoryBreadcrumb';
import { Job } from '@/lib/types/job.types';
import { CATEGORY_MAPPINGS } from '@/lib/categories';

const Jobs: React.FC = () => {
  const isMobile = useIsMobile();
  const { data: jobs, isLoading, error } = useQuery({
    queryKey: ['jobs'],
    queryFn: getJobs,
  });
  
  const {
    searchQuery,
    locationQuery,
    filters,
    isFilterOpen,
    activeFilters,
    filteredJobs,
    currentCategory,
    setSearchQuery,
    setLocationQuery,
    setFilters,
    setIsFilterOpen,
    clearFilters,
    clearAllFilters,
    removeFilter
  } = useJobFilters(jobs as Job[] | undefined);

  // Get current department from category
  const currentDepartment = currentCategory ? CATEGORY_MAPPINGS[currentCategory] : '';

  const handleClearCategory = () => {
    clearFilters(); // Clear all filters, not just category
  };

  // Mobile-optimized padding with better safe area handling
  const contentPaddingClass = isMobile ? 'pb-20 safe-bottom' : 'pb-16';

  return (
    <>
      <Header />
      <main className={cn(
        "min-h-screen pt-20 sm:pt-24 px-3 sm:px-4 md:px-6",
        contentPaddingClass
      )}>
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start gap-4 sm:gap-6 md:gap-8">
            {/* Filters Sidebar */}
            <FilterSidebar 
              isFilterOpen={isFilterOpen}
              setIsFilterOpen={setIsFilterOpen}
              filters={filters}
              setFilters={setFilters}
              clearAllFilters={clearAllFilters}
            />
            
            {/* Main Content */}
            <div className="flex-1 w-full">
              {/* Category Breadcrumb */}
              <CategoryBreadcrumb 
                currentCategory={currentDepartment}
                onClearCategory={handleClearCategory}
              />

              {/* Search Bar */}
              <JobSearchBar 
                searchQuery={searchQuery}
                locationQuery={locationQuery}
                setSearchQuery={setSearchQuery}
                setLocationQuery={setLocationQuery}
              />
              
              {/* Results Count & Active Filters - Mobile optimized */}
              <div className="mb-4 sm:mb-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
                  <JobsCount count={filteredJobs.length} isLoading={isLoading} />
                  
                  {/* Active Filters */}
                  <ActiveFilters 
                    activeFilters={activeFilters}
                    removeFilter={removeFilter}
                    clearFilters={clearFilters}
                  />
                </div>
              </div>
              
              {/* Job Listings */}
              <JobsList 
                jobs={jobs as Job[] | undefined}
                isLoading={isLoading}
                error={error}
                filteredJobs={filteredJobs} 
              />
            </div>
          </div>
        </div>
      </main>
      
      {/* Mobile Filter Toggle Button */}
      <FilterToggle 
        isFilterOpen={isFilterOpen} 
        setIsFilterOpen={setIsFilterOpen} 
      />
      
      <Footer />
    </>
  );
};

export default Jobs;
