
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
        <div>
          <h3 className="text-sm font-medium">Experience Level</h3>
          <p className="text-sm text-muted-foreground">
            Mid-Senior Level
          </p>
        </div>
        <div>
          <h3 className="text-sm font-medium">Industry</h3>
          <p className="text-sm text-muted-foreground">
            Technology, Software Development
          </p>
        </div>
        <div>
          <h3 className="text-sm font-medium">Seniority Level</h3>
          <p className="text-sm text-muted-foreground">
            Mid-Senior Level
          </p>
        </div>
        <div>
          <h3 className="text-sm font-medium">Employment Type</h3>
          <p className="text-sm text-muted-foreground">
            {job.type}
          </p>
        </div>
      </div>
    </section>
  );
};

export default JobInsights;
