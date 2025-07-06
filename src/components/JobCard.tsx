
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Briefcase, MapPin, DollarSign, Heart, ExternalLink } from 'lucide-react';
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
        <div className="absolute inset-0 rounded-lg sm:rounded-xl shimmer opacity-30 pointer-events-none" />
      )}
      
      <Link to={`/jobs/${job.id}`} className="block">
        {/* Main card with mobile-first responsive design */}
        <div className={cn(
          "relative z-10 p-3 sm:p-4 md:p-6 rounded-lg sm:rounded-xl overflow-hidden",
          "transform transition-all duration-300 ease-out",
          "hover-lift-shadow",
          isFeatured 
            ? "bg-white border border-primary/20 shadow-md animate-glow" 
            : "bg-white shadow-sm border border-border hover:shadow-lg",
          isHovered && "border-primary/30"
        )}>
          {/* Save button - mobile optimized touch target */}
          <button
            onClick={handleSaveClick}
            className={cn(
              "absolute top-2 right-2 sm:top-3 sm:right-3 md:top-4 md:right-4 z-20",
              "p-2 sm:p-2.5 rounded-full transition-all duration-300 touch-target",
              "bg-white/90 backdrop-blur-sm border border-border/50",
              "hover:bg-white hover:border-primary/30 active:scale-95",
              "md:hover:scale-110",
              isHovered ? "opacity-100 animate-bounce-in" : "opacity-0 sm:opacity-0",
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

          <div className="flex items-start gap-3 sm:gap-4 stagger-children">
            {/* Mobile-optimized logo container */}
            <div className="h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0 rounded-md bg-gradient-to-br from-secondary/30 to-secondary/60 flex items-center justify-center overflow-hidden">
              <img 
                src={job.logo} 
                alt={`${job.company} logo`} 
                className="h-6 w-6 sm:h-8 sm:w-8 object-contain logo-hover-scale"
                style={{ '--stagger': '0' } as React.CSSProperties}
              />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div 
                  className="flex-1 min-w-0"
                  style={{ '--stagger': '1' } as React.CSSProperties}
                >
                  <h3 className={cn(
                    "text-base sm:text-lg font-medium leading-tight mb-1",
                    "line-clamp-2 transition-colors duration-200",
                    isHovered ? "text-primary" : "text-foreground"
                  )}>
                    {job.title}
                  </h3>
                  {isFeatured && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-destructive text-white shadow-sm">
                      Featured
                    </span>
                  )}
                </div>
              </div>
              
              <p 
                className="text-sm sm:text-base text-muted-foreground mb-2 sm:mb-3 truncate"
                style={{ '--stagger': '2' } as React.CSSProperties}
                title={job.company}
              >
                {job.company}
              </p>
              
              {/* Mobile-optimized job details with better spacing */}
              <div 
                className="flex flex-wrap gap-2 sm:gap-3 text-xs sm:text-sm text-muted-foreground"
                style={{ '--stagger': '3' } as React.CSSProperties}
              >
                <div className="flex items-center min-w-0">
                  <MapPin className="mr-1 h-3 w-3 sm:h-3.5 sm:w-3.5 flex-shrink-0" />
                  <span className="truncate">{job.location}</span>
                </div>
                <div className="flex items-center">
                  <DollarSign className="mr-1 h-3 w-3 sm:h-3.5 sm:w-3.5 flex-shrink-0" />
                  <span className="truncate">{job.salary}</span>
                </div>
                <div className="flex items-center">
                  <Briefcase className="mr-1 h-3 w-3 sm:h-3.5 sm:w-3.5 flex-shrink-0" />
                  <span className="truncate">{job.type}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick apply button - mobile optimized */}
          <div className="relative mt-3 sm:mt-4 h-0 overflow-hidden">
            <button
              onClick={handleQuickApply}
              className={cn(
                "w-full py-2.5 sm:py-2 px-4 bg-primary text-white rounded-lg",
                "flex items-center justify-center gap-2",
                "transition-all duration-300 ease-out touch-target",
                "hover:bg-primary/90 active:scale-[0.98]",
                "slide-up-on-hover text-sm sm:text-base font-medium"
              )}
            >
              <span>Quick Apply</span>
              <ExternalLink className="h-4 w-4" />
            </button>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default JobCard;
