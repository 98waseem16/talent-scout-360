
import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Briefcase, MapPin, DollarSign, Clock, AlertCircle } from 'lucide-react';
import type { Job } from '@/lib/jobs';
import { GlowEffect } from '@/components/ui/glow-effect';
import { formatPostedDate } from '@/lib/utils/dateUtils';

interface JobCardProps {
  job: Job;
  index?: number;
  featured?: boolean;
}

const JobCard: React.FC<JobCardProps> = ({ job, index = 0, featured = false }) => {
  // Calculate animation delay based on index
  const animationDelay = `${index * 0.1}s`;
  const isFeatured = featured || job.featured;
  
  // Calculate days until expiration
  const daysUntilExpiration = job.expires_at ? 
    Math.ceil((new Date(job.expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : 
    null;
  
  // Determine if job is expiring soon (within 7 days)
  const isExpiringSoon = daysUntilExpiration !== null && daysUntilExpiration <= 7;

  return (
    <Link 
      to={`/jobs/${job.id}`}
      style={{ animationDelay }}
      className={cn(
        "block opacity-0 animate-slide-up w-full relative",
        "hover-scale"
      )}
    >
      {/* Glow effect container that's slightly larger than the card */}
      {isFeatured && (
        <div className="absolute -inset-1 rounded-xl overflow-hidden">
          <GlowEffect
            colors={['#9b87f5', '#D946EF', '#F97316', '#0EA5E9']}
            mode="flowHorizontal"
            blur="medium"
            scale={1.2}
            duration={8}
          />
        </div>
      )}
      
      {/* Actual card content with background */}
      <div className={cn(
        "relative z-10 p-6 rounded-xl overflow-hidden",
        isFeatured ? "bg-white/90 backdrop-blur-sm border border-transparent" : "bg-white shadow-sm border border-border"
      )}>
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
              <div className="flex gap-2 flex-shrink-0">
                {isFeatured && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-destructive text-white shadow-sm">
                    Featured
                  </span>
                )}
                {isExpiringSoon && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 shadow-sm whitespace-nowrap">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    {daysUntilExpiration === 0 ? 'Expires today' : 
                      daysUntilExpiration === 1 ? 'Expires tomorrow' : 
                      `Expires in ${daysUntilExpiration} days`}
                  </span>
                )}
              </div>
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
