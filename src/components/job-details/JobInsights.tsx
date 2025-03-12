
import React from 'react';
import type { Job } from '@/lib/types/job.types';

interface JobInsightsProps {
  job: Job;
}

const JobInsights: React.FC<JobInsightsProps> = ({ job }) => {
  return (
    <section className="bg-white rounded-xl border border-border shadow-sm p-6">
      <h2 className="text-lg font-medium mb-4">Job Insights</h2>
      <div className="space-y-4">
        {job.department && (
          <div>
            <h3 className="text-sm font-medium">Department</h3>
            <p className="text-sm text-muted-foreground">
              {job.department}
            </p>
          </div>
        )}
        
        {job.seniority_level && (
          <div>
            <h3 className="text-sm font-medium">Seniority Level</h3>
            <p className="text-sm text-muted-foreground">
              {job.seniority_level}
            </p>
          </div>
        )}
        
        {job.job_type && (
          <div>
            <h3 className="text-sm font-medium">Job Type</h3>
            <p className="text-sm text-muted-foreground">
              {job.job_type}
            </p>
          </div>
        )}
        
        {job.remote_onsite && (
          <div>
            <h3 className="text-sm font-medium">Work Location</h3>
            <p className="text-sm text-muted-foreground">
              {job.remote_onsite}
            </p>
          </div>
        )}
        
        {job.work_hours && (
          <div>
            <h3 className="text-sm font-medium">Work Hours</h3>
            <p className="text-sm text-muted-foreground">
              {job.work_hours}
            </p>
          </div>
        )}
        
        {job.salary_range && (
          <div>
            <h3 className="text-sm font-medium">Salary Range</h3>
            <p className="text-sm text-muted-foreground">
              {job.salary_range}
            </p>
          </div>
        )}
        
        {job.equity && (
          <div>
            <h3 className="text-sm font-medium">Equity</h3>
            <p className="text-sm text-muted-foreground">
              {job.equity}
            </p>
          </div>
        )}
        
        {job.team_size && (
          <div>
            <h3 className="text-sm font-medium">Team Size</h3>
            <p className="text-sm text-muted-foreground">
              {job.team_size}
            </p>
          </div>
        )}
        
        {job.investment_stage && (
          <div>
            <h3 className="text-sm font-medium">Investment Stage</h3>
            <p className="text-sm text-muted-foreground">
              {job.investment_stage}
            </p>
          </div>
        )}
        
        {job.revenue_model && (
          <div>
            <h3 className="text-sm font-medium">Revenue Model</h3>
            <p className="text-sm text-muted-foreground">
              {job.revenue_model}
            </p>
          </div>
        )}
        
        {job.hiring_urgency && (
          <div>
            <h3 className="text-sm font-medium">Hiring Urgency</h3>
            <p className="text-sm text-muted-foreground">
              {job.hiring_urgency}
            </p>
          </div>
        )}
        
        {job.visa_sponsorship !== undefined && (
          <div>
            <h3 className="text-sm font-medium">Visa Sponsorship</h3>
            <p className="text-sm text-muted-foreground">
              {job.visa_sponsorship ? 'Available' : 'Not Available'}
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default JobInsights;
