
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

  return (
    <Link 
      to={`/jobs/${job.id}`}
      style={{ animationDelay }}
      className={cn(
        "block opacity-0 animate-slide-up w-full rounded-xl overflow-hidden hover-scale",
        featured ? "glass-card" : "bg-white shadow-sm border border-border"
      )}
    >
      <div className="relative p-6">
        {/* Add glow effect only for featured jobs */}
        {(featured || job.featured) && (
          <GlowEffect
            colors={['#9b87f5', '#D946EF', '#F97316', '#0EA5E9']}
            mode="flowHorizontal"
            blur="medium"
            scale={1.2}
            duration={8}
            className="rounded-xl opacity-70 z-0"
          />
        )}
        
        <div className="flex items-start gap-4 relative z-10">
          <div className="h-12 w-12 rounded-md bg-secondary/50 flex items-center justify-center overflow-hidden">
            <img 
              src={job.logo} 
              alt={`${job.company} logo`} 
              className="h-8 w-8 object-contain"
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h3 className={cn(
                "text-lg font-medium truncate px-3 py-1 rounded-full",
                featured || job.featured ? "bg-black/70 text-white shadow-sm" : ""
              )}>
                {job.title}
              </h3>
              {job.featured && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-destructive text-white shadow-sm">
                  Featured
                </span>
              )}
            </div>
            <p className={cn(
              "mt-1 px-3 py-1 rounded-full inline-block",
              featured || job.featured ? "bg-black/60 text-white" : "text-muted-foreground"
            )}>
              {job.company}
            </p>
            
            <div className="mt-3 flex flex-wrap gap-3 text-sm">
              <div className={cn(
                "flex items-center px-2.5 py-1 rounded-full",
                featured || job.featured ? "bg-black/50 text-white" : "bg-secondary text-muted-foreground"
              )}>
                <MapPin className="mr-1 h-3.5 w-3.5" />
                <span>{job.location}</span>
              </div>
              <div className={cn(
                "flex items-center px-2.5 py-1 rounded-full", 
                featured || job.featured ? "bg-black/50 text-white" : "bg-secondary text-muted-foreground"
              )}>
                <DollarSign className="mr-1 h-3.5 w-3.5" />
                <span>{job.salary}</span>
              </div>
              <div className={cn(
                "flex items-center px-2.5 py-1 rounded-full", 
                featured || job.featured ? "bg-black/50 text-white" : "bg-secondary text-muted-foreground"
              )}>
                <Briefcase className="mr-1 h-3.5 w-3.5" />
                <span>{job.type}</span>
              </div>
              <div className={cn(
                "flex items-center px-2.5 py-1 rounded-full", 
                featured || job.featured ? "bg-black/50 text-white" : "bg-secondary text-muted-foreground"
              )}>
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
