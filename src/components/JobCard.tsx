
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Briefcase, MapPin, DollarSign, Clock, Heart, ExternalLink } from 'lucide-react';
import type { Job } from '@/lib/types/job.types';
import { formatPostedDate } from '@/lib/utils/dateUtils';
import { useSavedJobs } from '@/hooks/useSavedJobs';

interface JobCardProps {
  job: Job;
  index?: number;
  featured?: boolean;
}

const JobCard: React.FC<JobCardProps> = ({ job, index = 0, featured = false }) => {
  const [isHovered, setIsHovered] = useState(false);
  const { isSaved, toggleSave } = useSavedJobs();
  const saved = isSaved(job.id);
  
  // Calculate animation delay based on index for staggered animation
  const animationDelay = `${index * 0.1}s`;
  const isFeatured = featured || job.featured;

  const handleSaveClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleSave(job.id, job.title);
  };

  const handleQuickApply = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    window.open(job.application_url, '_blank');
  };

  return (
    <div
      style={{ animationDelay }}
      className={cn(
        "block opacity-0 animate-slide-up w-full relative group cursor-pointer",
        "transition-all duration-300 ease-in-out"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Shimmer effect for featured jobs */}
      {isFeatured && (
        <div className="absolute inset-0 rounded-xl shimmer opacity-30 pointer-events-none" />
      )}
      
      <Link to={`/jobs/${job.id}`} className="block">
        {/* Main card with enhanced hover effects */}
        <div className={cn(
          "relative z-10 p-6 rounded-xl overflow-hidden",
          "transform transition-all duration-300 ease-out",
          "hover-lift-shadow",
          isFeatured 
            ? "bg-white border border-primary/20 shadow-md animate-glow" 
            : "bg-white shadow-sm border border-border hover:shadow-lg",
          isHovered && "border-primary/30"
        )}>
          {/* Save button - appears on hover */}
          <button
            onClick={handleSaveClick}
            className={cn(
              "absolute top-4 right-4 z-20 p-2 rounded-full transition-all duration-300",
              "bg-white/80 backdrop-blur-sm border border-border/50",
              "hover:bg-white hover:border-primary/30 hover:scale-110",
              isHovered ? "opacity-100 animate-bounce-in" : "opacity-0",
              saved && "opacity-100"
            )}
            title={saved ? "Remove from saved jobs" : "Save job"}
          >
            <Heart 
              className={cn(
                "h-4 w-4 transition-all duration-200",
                saved 
                  ? "fill-red-500 text-red-500 animate-heart-beat" 
                  : "text-muted-foreground hover:text-red-500"
              )} 
            />
          </button>

          <div className="flex items-start gap-4 stagger-children">
            {/* Enhanced logo container with hover scale */}
            <div className="h-12 w-12 rounded-md bg-gradient-to-br from-secondary/30 to-secondary/60 flex items-center justify-center overflow-hidden">
              <img 
                src={job.logo} 
                alt={`${job.company} logo`} 
                className="h-8 w-8 object-contain logo-hover-scale"
                style={{ '--stagger': '0' } as React.CSSProperties}
              />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div style={{ '--stagger': '1' } as React.CSSProperties}>
                  <h3 className={cn(
                    "text-lg font-medium truncate transition-colors duration-200",
                    isHovered ? "text-primary" : "text-foreground"
                  )}>
                    {job.title}
                  </h3>
                  {isFeatured && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-destructive text-white shadow-sm mt-1">
                      Featured
                    </span>
                  )}
                </div>
              </div>
              
              <p 
                className="text-muted-foreground mb-3"
                style={{ '--stagger': '2' } as React.CSSProperties}
              >
                {job.company}
              </p>
              
              <div 
                className="flex flex-wrap gap-3 text-sm text-muted-foreground"
                style={{ '--stagger': '3' } as React.CSSProperties}
              >
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

          {/* Quick apply button - slides up on hover */}
          <div className="relative mt-4 h-0 overflow-hidden">
            <button
              onClick={handleQuickApply}
              className={cn(
                "w-full py-2 px-4 bg-primary text-white rounded-lg",
                "flex items-center justify-center gap-2",
                "transition-all duration-300 ease-out",
                "hover:bg-primary/90 active:scale-[0.98]",
                "slide-up-on-hover"
              )}
            >
              <span className="font-medium">Quick Apply</span>
              <ExternalLink className="h-4 w-4" />
            </button>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default JobCard;
