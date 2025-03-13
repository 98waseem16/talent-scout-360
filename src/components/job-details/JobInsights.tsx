
import React, { useEffect } from 'react';
import { 
  Briefcase, 
  Building2, 
  Users, 
  TrendingUp, 
  Clock, 
  MapPin, 
  DollarSign,
  Zap,
  BarChart4,
  Globe,
  Percent,
  Award
} from 'lucide-react';
import type { Job } from '@/lib/types/job.types';

interface JobInsightsProps {
  job: Job;
}

const JobInsights: React.FC<JobInsightsProps> = ({ job }) => {
  useEffect(() => {
    // Log the full job data to debug what fields are actually available
    console.log('JobInsights component - full job data:', job);
  }, [job]);

  // Helper to check if a field has a value
  const hasValue = (value: any): boolean => {
    return value !== undefined && value !== null && value !== '';
  };

  // Function to create each insight item
  const InsightItem = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: React.ReactNode }) => (
    <div className="flex items-start gap-3 pb-3">
      <div className="text-primary mt-0.5">
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-sm text-muted-foreground">{value}</p>
      </div>
    </div>
  );

  // Return early with fallback if no job data
  if (!job || Object.keys(job).length === 0) {
    console.error('JobInsights: No job data available');
    return (
      <div className="bg-white rounded-xl border border-border shadow-sm p-6">
        <h2 className="text-xl font-medium mb-4">Job Insights</h2>
        <p className="text-sm text-muted-foreground">No job details available</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-border shadow-sm p-6">
      <h2 className="text-xl font-medium mb-4">Job Insights</h2>
      
      <div className="space-y-1">
        {/* Always show job type */}
        <InsightItem 
          icon={<Briefcase className="h-4 w-4" />} 
          label="Job Type" 
          value={job.job_type || job.type || "Not specified"}
        />
        
        {/* Department */}
        {hasValue(job.department) && (
          <InsightItem 
            icon={<Building2 className="h-4 w-4" />} 
            label="Department" 
            value={job.department}
          />
        )}
        
        {/* Seniority level */}
        {hasValue(job.seniority_level) && (
          <InsightItem 
            icon={<Award className="h-4 w-4" />} 
            label="Seniority" 
            value={job.seniority_level}
          />
        )}
        
        {/* Team size */}
        {hasValue(job.team_size) && (
          <InsightItem 
            icon={<Users className="h-4 w-4" />} 
            label="Team Size" 
            value={job.team_size}
          />
        )}
        
        {/* Investment stage */}
        {hasValue(job.investment_stage) && (
          <InsightItem 
            icon={<TrendingUp className="h-4 w-4" />} 
            label="Investment Stage" 
            value={job.investment_stage}
          />
        )}
        
        {/* Remote/onsite */}
        {hasValue(job.remote_onsite) && (
          <InsightItem 
            icon={<MapPin className="h-4 w-4" />} 
            label="Work Location" 
            value={job.remote_onsite}
          />
        )}
        
        {/* Salary range */}
        {hasValue(job.salary_range) && (
          <InsightItem 
            icon={<DollarSign className="h-4 w-4" />} 
            label="Salary Range" 
            value={job.salary_range}
          />
        )}
        
        {/* Work hours */}
        {hasValue(job.work_hours) && (
          <InsightItem 
            icon={<Clock className="h-4 w-4" />} 
            label="Work Hours" 
            value={job.work_hours}
          />
        )}
        
        {/* Equity */}
        {hasValue(job.equity) && (
          <InsightItem 
            icon={<Percent className="h-4 w-4" />} 
            label="Equity" 
            value={job.equity}
          />
        )}
        
        {/* Hiring urgency */}
        {hasValue(job.hiring_urgency) && (
          <InsightItem 
            icon={<Zap className="h-4 w-4" />} 
            label="Hiring Timeline" 
            value={job.hiring_urgency}
          />
        )}
        
        {/* Revenue model */}
        {hasValue(job.revenue_model) && (
          <InsightItem 
            icon={<BarChart4 className="h-4 w-4" />} 
            label="Revenue Model" 
            value={job.revenue_model}
          />
        )}
        
        {/* Visa sponsorship - include even if not available */}
        <InsightItem 
          icon={<Globe className="h-4 w-4" />} 
          label="Visa Sponsorship" 
          value={job.visa_sponsorship ? "Available" : "Not Available"}
        />
      </div>
    </div>
  );
};

export default JobInsights;
