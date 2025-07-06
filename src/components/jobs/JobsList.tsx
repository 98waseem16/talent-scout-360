
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import JobCard from '@/components/JobCard';
import { Job } from '@/lib/types/job.types';
import { useIsMobile } from "@/hooks/use-mobile";

interface JobsListProps {
  jobs: Job[] | undefined;
  isLoading: boolean;
  error: unknown;
  filteredJobs: Job[];
}

const JobsList: React.FC<JobsListProps> = ({ jobs, isLoading, error, filteredJobs }) => {
  const isMobile = useIsMobile();

  // Mobile-optimized loading skeleton
  if (isLoading) {
    return (
      <div className="space-y-3 sm:space-y-4 md:space-y-6">
        {[...Array(5)].map((_, index) => (
          <div key={index} className="bg-white shadow-sm border border-border rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6">
            <div className="flex items-start gap-3 sm:gap-4">
              <Skeleton className="h-10 w-10 sm:h-12 sm:w-12 rounded-md flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <Skeleton className="h-4 sm:h-5 md:h-6 w-3/4 mb-2" />
                <Skeleton className="h-3 sm:h-4 w-1/2 mb-3 sm:mb-4" />
                <div className="flex flex-wrap gap-2 sm:gap-3">
                  <Skeleton className="h-3 sm:h-4 w-16 sm:w-20" />
                  <Skeleton className="h-3 sm:h-4 w-20 sm:w-24" />
                  <Skeleton className="h-3 sm:h-4 w-12 sm:w-16" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Display error state
  if (error) {
    return (
      <div className="text-center py-12 sm:py-16">
        <div className="bg-white rounded-lg sm:rounded-xl border border-border p-6 sm:p-8">
          <h3 className="text-lg sm:text-xl mb-2">Error loading jobs</h3>
          <p className="text-sm sm:text-base text-muted-foreground">
            Please try refreshing the page
          </p>
        </div>
      </div>
    );
  }

  // Display empty state or job results with mobile-optimized spacing
  return (
    <div className="space-y-3 sm:space-y-4 md:space-y-6">
      {filteredJobs.length > 0 ? (
        filteredJobs.map((job, index) => (
          <JobCard 
            key={job.id} 
            job={job} 
            index={index} 
            featured={job.featured}
          />
        ))
      ) : (
        <div className="text-center py-12 sm:py-16">
          <div className="bg-white rounded-lg sm:rounded-xl border border-border p-6 sm:p-8">
            <h3 className="text-lg sm:text-xl mb-2">No jobs found</h3>
            <p className="text-sm sm:text-base text-muted-foreground">
              Try adjusting your search criteria or filters
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobsList;
