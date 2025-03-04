
import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import JobCard from './JobCard';
import { getTrendingJobs } from '@/lib/jobs';

const TrendingJobs: React.FC = () => {
  const trendingJobs = getTrendingJobs();

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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trendingJobs.map((job, index) => (
            <JobCard 
              key={job.id} 
              job={job} 
              index={index}
              featured={true}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrendingJobs;
