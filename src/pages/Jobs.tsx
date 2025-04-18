
import React from 'react';
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
import { Job } from '@/lib/types/job.types';

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
  } = useJobFilters(jobs as Job[] | undefined);

  // Add debug logging for jobs and filters
  React.useEffect(() => {
    if (jobs) {
      console.log(`📊 Total jobs loaded: ${jobs.length}`);
      console.log(`📊 Jobs after filtering: ${filteredJobs.length}`);
      
      if (filters.seniority) {
        const seniorJobs = jobs.filter(job => job.seniority_level?.toLowerCase() === filters.seniority.toLowerCase());
        console.log(`🔍 Jobs with seniority "${filters.seniority}": ${seniorJobs.length}`);
        seniorJobs.forEach(job => {
          console.log(`  - ${job.title} (seniority: "${job.seniority_level}")`);
        });
      }
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
      <Footer />
    </>
  );
};

export default Jobs;
