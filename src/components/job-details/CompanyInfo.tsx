
import React from 'react';
import type { Job } from '@/lib/types/job.types';

interface CompanyInfoProps {
  job: Job;
}

const CompanyInfo: React.FC<CompanyInfoProps> = ({ job }) => {
  return (
    <section className="bg-white rounded-xl border border-border shadow-sm p-6">
      <h2 className="text-lg font-medium mb-4">About the Company</h2>
      <div className="flex items-center gap-3 mb-4">
        <div className="h-10 w-10 rounded-md bg-secondary/50 flex items-center justify-center overflow-hidden">
          <img src={job.logo} alt={`${job.company} logo`} className="h-6 w-6 object-contain" />
        </div>
        <div>
          <h3 className="font-medium">{job.company}</h3>
          <a href="#" className="text-sm text-primary hover:underline">View Company Profile</a>
        </div>
      </div>
      <p className="text-sm text-muted-foreground">
        {job.company} is a leading company in the technology sector, focusing on innovation and user experience. 
        With a team of talented professionals, we're dedicated to creating solutions that make a difference.
      </p>
    </section>
  );
};

export default CompanyInfo;
