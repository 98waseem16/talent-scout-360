
import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import JobCard from './JobCard';
import { getTrendingJobs } from '@/lib/jobs';
import { Skeleton } from '@/components/ui/skeleton';

const TrendingJobs: React.FC = () => {
  const { data: trendingJobs, isLoading, error } = useQuery({
    queryKey: ['trendingJobs'],
    queryFn: getTrendingJobs,
  });

  return (
    <section className="py-16 md:py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-wrap items-baseline justify-between mb-8 gap-4">
          <h2 className="text-2xl md:text-3xl font-medium">Trending Jobs</h2>
          <Link 
            to="/jobs" 
            className="text-primary flex items-center hover:underline font-medium smooth-transition"
          >
            View all jobs
            <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, index) => (
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
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Failed to load trending jobs. Please try again later.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trendingJobs && trendingJobs.length > 0 ? (
              trendingJobs.map((job, index) => (
                <JobCard 
                  key={job.id} 
                  job={job} 
                  index={index}
                  featured={true}
                />
              ))
            ) : (
              <div className="col-span-3 text-center py-12">
                <p className="text-muted-foreground">No trending jobs found.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default TrendingJobs;
