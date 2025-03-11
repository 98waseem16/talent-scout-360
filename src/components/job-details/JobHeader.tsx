
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Bookmark, Share2, MapPin, DollarSign, Briefcase, Clock } from 'lucide-react';
import type { Job } from '@/lib/types/job.types';

interface JobHeaderProps {
  job: Job;
  handleApply: () => void;
}

const JobHeader: React.FC<JobHeaderProps> = ({ job, handleApply }) => {
  return (
    <>
      {/* Back button */}
      <Link 
        to="/jobs" 
        className="inline-flex items-center text-muted-foreground hover:text-primary mb-8 transition-colors"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to all jobs
      </Link>
      
      {/* Job Header */}
      <div className="bg-white rounded-xl border border-border shadow-sm p-6 md:p-8 mb-8">
        <div className="flex flex-col md:flex-row items-start gap-6">
          <div className="h-16 w-16 flex-shrink-0 rounded-md bg-secondary/50 flex items-center justify-center overflow-hidden">
            <img src={job.logo} alt={`${job.company} logo`} className="h-10 w-10 object-contain" />
          </div>
          
          <div className="flex-1">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-medium mb-1">{job.title}</h1>
                <p className="text-lg text-muted-foreground mb-4">{job.company}</p>
                
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-6">
                  <div className="flex items-center">
                    <MapPin className="mr-1 h-4 w-4" />
                    <span>{job.location}</span>
                  </div>
                  <div className="flex items-center">
                    <DollarSign className="mr-1 h-4 w-4" />
                    <span>{job.salary}</span>
                  </div>
                  <div className="flex items-center">
                    <Briefcase className="mr-1 h-4 w-4" />
                    <span>{job.type}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="mr-1 h-4 w-4" />
                    <span>Posted {job.posted}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2">
                <button className="p-2 rounded-full hover:bg-secondary transition-colors" title="Save Job">
                  <Bookmark className="h-5 w-5" />
                </button>
                <button className="p-2 rounded-full hover:bg-secondary transition-colors" title="Share Job">
                  <Share2 className="h-5 w-5" />
                </button>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <button 
                onClick={handleApply}
                className="bg-primary hover:bg-primary/90 text-white font-medium px-6 py-2.5 rounded-lg transition-colors active:scale-[0.98]"
              >
                Apply Now
              </button>
              <a
                href={`https://maps.google.com/?q=${encodeURIComponent(job.location)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-secondary hover:bg-secondary/80 text-foreground font-medium px-6 py-2.5 rounded-lg transition-colors text-center"
              >
                View Location
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default JobHeader;
