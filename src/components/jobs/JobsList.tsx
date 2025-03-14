import React, { useEffect } from 'react';
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
  // Debug log to show all available jobs and their fields
  useEffect(() => {
    if (jobs && jobs.length > 0) {
      console.log(`Total jobs available: ${jobs.length}`);
      console.log('First 3 jobs with filter fields:', jobs.slice(0, 3).map(job => ({
        id: job.id,
        title: job.title,
        department: job.department,
        departmentType: typeof job.department,
        seniority_level: job.seniority_level,
        seniorityType: typeof job.seniority_level,
        job_type: job.job_type,
        type: job.type,
        remote_onsite: job.remote_onsite
      })));
      
      console.log(`Filtered jobs: ${filteredJobs.length}`);
    }
  }, [jobs, filteredJobs]);

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
          <div className="mt-4 p-4 border rounded bg-gray-50 text-left text-sm">
            <p className="font-medium">Debugging Information:</p>
            <p>Total jobs: {jobs?.length || 0}</p>
            {jobs?.length && jobs.length > 0 ? (
              <div className="mt-2">
                <p>Active filters:</p>
                <div className="mt-2 pl-4">
                  {jobs.slice(0, 3).map(job => (
                    <div key={job.id} className="mb-2 border-b pb-2">
                      <p><strong>Job:</strong> {job.title}</p>
                      <p><strong>Seniority:</strong> "{job.seniority_level || ''}" ({typeof job.seniority_level})</p>
                      <p><strong>Department:</strong> "{job.department || ''}" ({typeof job.department})</p>
                      <p><strong>Type:</strong> "{job.job_type || job.type || ''}"</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : "None"}
          </div>
        </div>
      )}
    </div>
  );
};

export default JobsList;
