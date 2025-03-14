
import React, { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getJobs } from '@/lib/jobs';
import { useJobFilters } from '@/hooks/useJobFilters';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import JobSearchBar from '@/components/jobs/JobSearchBar';
import ActiveFilters from '@/components/jobs/ActiveFilters';
import FilterToggle from '@/components/jobs/FilterToggle';
import FilterSidebar from '@/components/jobs/FilterSidebar';
import JobsList from '@/components/jobs/JobsList';
import JobsCount from '@/components/jobs/JobsCount';

const Jobs: React.FC = () => {
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
    setSearchQuery,
    setLocationQuery,
    setFilters,
    setIsFilterOpen,
    clearFilters,
    clearAllFilters,
    removeFilter
  } = useJobFilters(jobs);

  // Debug logging to check the data and filters
  useEffect(() => {
    if (jobs) {
      console.log('Jobs data:', jobs);
      console.log('Current filters:', filters);
      console.log('Filtered jobs count:', filteredJobs.length);
    }
  }, [jobs, filters, filteredJobs]);

  return (
    <>
      <Header />
      <main className="min-h-screen pt-24 pb-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start gap-8">
            {/* Filters - Mobile Toggle */}
            <FilterToggle 
              isFilterOpen={isFilterOpen} 
              setIsFilterOpen={setIsFilterOpen} 
            />
            
            {/* Filters Sidebar */}
            <FilterSidebar 
              isFilterOpen={isFilterOpen}
              filters={filters}
              setFilters={setFilters}
              clearAllFilters={clearAllFilters}
            />
            
            {/* Main Content */}
            <div className="flex-1">
              {/* Search Bar */}
              <JobSearchBar 
                searchQuery={searchQuery}
                locationQuery={locationQuery}
                setSearchQuery={setSearchQuery}
                setLocationQuery={setLocationQuery}
              />
              
              {/* Results Count & Active Filters */}
              <div className="mb-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <JobsCount count={filteredJobs.length} isLoading={isLoading} />
                  
                  {/* Active Filters */}
                  <ActiveFilters 
                    activeFilters={activeFilters}
                    removeFilter={removeFilter}
                    clearAllFilters={clearAllFilters}
                  />
                </div>
              </div>
              
              {/* Job Listings */}
              <JobsList 
                jobs={jobs}
                isLoading={isLoading}
                error={error}
                filteredJobs={filteredJobs}
              />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default Jobs;
