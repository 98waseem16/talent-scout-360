
import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Briefcase, MapPin, DollarSign, Clock } from 'lucide-react';
import type { Job } from '@/lib/jobs';
import { GlowEffect } from '@/components/ui/glow-effect';

interface JobCardProps {
  job: Job;
  index?: number;
  featured?: boolean;
}

const JobCard: React.FC<JobCardProps> = ({ job, index = 0, featured = false }) => {
  // Calculate animation delay based on index
  const animationDelay = `${index * 0.1}s`;
  const isFeatured = featured || job.featured;

  return (
    <Link 
      to={`/jobs/${job.id}`}
      style={{ animationDelay }}
      className={cn(
        "block opacity-0 animate-slide-up w-full rounded-xl overflow-hidden hover-scale relative",
        isFeatured ? "glass-card border border-transparent" : "bg-white shadow-sm border border-border"
      )}
    >
      {/* Add glow effect only for featured jobs, and only on the edges */}
      {isFeatured && (
        <div className="absolute inset-0 -z-10 rounded-xl overflow-hidden">
          <GlowEffect
            colors={['#9b87f5', '#D946EF', '#F97316', '#0EA5E9']}
            mode="flowHorizontal"
            blur="medium"
            scale={1.1}
            duration={8}
            className="absolute -inset-1"
          />
        </div>
      )}
      
      <div className="relative p-6 z-10 bg-white/80 backdrop-blur-sm rounded-xl">
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 rounded-md bg-secondary/50 flex items-center justify-center overflow-hidden">
            <img 
              src={job.logo} 
              alt={`${job.company} logo`} 
              className="h-8 w-8 object-contain"
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-lg font-medium truncate text-foreground">
                {job.title}
              </h3>
              {isFeatured && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-destructive text-white shadow-sm">
                  Featured
                </span>
              )}
            </div>
            <p className="text-muted-foreground">
              {job.company}
            </p>
            
            <div className="mt-3 flex flex-wrap gap-3 text-sm text-muted-foreground">
              <div className="flex items-center">
                <MapPin className="mr-1 h-3.5 w-3.5" />
                <span>{job.location}</span>
              </div>
              <div className="flex items-center">
                <DollarSign className="mr-1 h-3.5 w-3.5" />
                <span>{job.salary}</span>
              </div>
              <div className="flex items-center">
                <Briefcase className="mr-1 h-3.5 w-3.5" />
                <span>{job.type}</span>
              </div>
              <div className="flex items-center">
                <Clock className="mr-1 h-3.5 w-3.5" />
                <span>{job.posted}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default JobCard;
