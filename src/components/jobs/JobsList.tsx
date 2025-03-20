
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import JobCard from '@/components/JobCard';
import { Job } from '@/lib/types/job.types';

interface JobsListProps {
  jobs: Job[] | undefined;
  isLoading: boolean;
  error: unknown;
  filteredJobs: Job[];
}

const JobsList: React.FC<JobsListProps> = ({ jobs, isLoading, error, filteredJobs }) => {
  // Debug the filtered jobs
  console.log(`JobsList: Rendering ${filteredJobs.length} filtered jobs out of ${jobs?.length || 0} total jobs`);
  
  // Display loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        {[...Array(5)].map((_, index) => (
          <div key={index} className="bg-white shadow-sm border border-border rounded-xl p-6">
            <div className="flex items-start gap-4">
              <Skeleton className="h-12 w-12 rounded-md" />
              <div className="flex-1">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2 mb-4" />
                <div className="flex flex-wrap gap-3">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-16" />
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
      <div className="text-center py-16">
        <h3 className="text-xl mb-2">Error loading jobs</h3>
        <p className="text-muted-foreground">
          Please try refreshing the page
        </p>
      </div>
    );
  }

  // Display empty state or job results
  return (
    <div className="space-y-6">
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
        <div className="text-center py-16">
          <h3 className="text-xl mb-2">No jobs found</h3>
          <p className="text-muted-foreground">
            Try adjusting your search criteria or filters
          </p>
        </div>
      )}
    </div>
  );
};

export default JobsList;
