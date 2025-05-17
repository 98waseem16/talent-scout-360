
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
    <section className="py-20 md:py-28 px-6 relative overflow-hidden">
      {/* Subtle background elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute right-0 top-1/4 w-72 h-72 bg-gradient-to-br from-primary/5 to-blue-300/5 rounded-full blur-3xl"></div>
        <div className="absolute left-1/4 bottom-1/4 w-96 h-96 bg-gradient-to-tr from-purple-200/10 to-primary/5 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto">
        <div className="flex flex-wrap items-baseline justify-between mb-12 gap-4">
          <div className="space-y-2">
            <h2 className="text-3xl md:text-4xl font-medium bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text">
              <span className="text-transparent">Trending Opportunities</span>
            </h2>
            <p className="text-muted-foreground max-w-xl">
              Discover the most in-demand startup roles that top talent is applying to right now
            </p>
          </div>
          <Link 
            to="/jobs" 
            className="group text-primary flex items-center hover:text-primary/80 font-medium transition-colors"
          >
            View all jobs
            <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
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
          <div className="text-center py-12 bg-white/50 backdrop-blur-sm rounded-xl border border-border p-8">
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
