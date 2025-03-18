
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
  useEffect(() => {
    if (jobs && jobs.length > 0) {
      console.log(`Total jobs available: ${jobs.length}`);
      
      console.log('First 3 jobs with filter fields:', jobs.slice(0, 3).map(job => ({
        id: job.id,
        title: job.title,
        department: `"${job.department}"`,
        departmentType: typeof job.department,
        seniority_level: `"${job.seniority_level}"`,
        seniorityType: typeof job.seniority_level,
        type: `"${job.type}"`,
        typeType: typeof job.type,
        remote_onsite: `"${job.remote_onsite}"`,
        remoteType: typeof job.remote_onsite
      })));
      
      // Check for jobs with senior in the title or seniority level
      const seniorJobs = jobs.filter(job => {
        const title = job.title.toLowerCase();
        const seniority = (job.seniority_level || '').toLowerCase();
        return title.includes('senior') || seniority.includes('senior');
      });
      
      console.log(`Jobs with Senior in title or seniority: ${seniorJobs.length}`);
      if (seniorJobs.length > 0) {
        console.log('Senior Jobs:', seniorJobs.map(job => ({
          id: job.id,
          title: job.title,
          seniority_level: `"${job.seniority_level}"`,
          seniorityType: typeof job.seniority_level
        })));
      }
      
      console.log(`Filtered jobs: ${filteredJobs.length}`);
      
      if (filteredJobs.length > 0) {
        console.log('First filtered job:', {
          id: filteredJobs[0].id,
          title: filteredJobs[0].title,
          department: `"${filteredJobs[0].department}"`,
          seniority_level: `"${filteredJobs[0].seniority_level}"`,
          type: `"${filteredJobs[0].type}"`
        });
      }
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
            <p>Active filters: {filteredJobs.length === 0 && jobs?.length ? (
              <ul className="list-disc pl-5 mt-2">
                {jobs.slice(0, 3).map(job => (
                  <li key={job.id} className="mb-2">
                    <strong>Job:</strong> {job.title}<br />
                    <strong>Department:</strong> "{job.department}" ({typeof job.department})<br />
                    <strong>Seniority:</strong> "{job.seniority_level}" ({typeof job.seniority_level})<br />
                    <strong>Type:</strong> "{job.type}" ({typeof job.type})<br />
                    <strong>Remote:</strong> "{job.remote_onsite}" ({typeof job.remote_onsite})
                  </li>
                ))}
              </ul>
            ) : "None"}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobsList;
