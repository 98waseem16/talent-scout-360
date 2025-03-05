
import React from 'react';
import type { Job } from '@/lib/types/job.types';

interface JobDescriptionProps {
  job: Job;
}

const JobDescription: React.FC<JobDescriptionProps> = ({ job }) => {
  return (
    <section className="bg-white rounded-xl border border-border shadow-sm p-6 md:p-8">
      <h2 className="text-xl font-medium mb-4">Job Description</h2>
      <p className="text-muted-foreground mb-6">{job.description}</p>
      
      <h3 className="text-lg font-medium mb-3">Responsibilities</h3>
      <ul className="list-disc pl-5 space-y-2 text-muted-foreground mb-6">
        {job.responsibilities.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
      
      <h3 className="text-lg font-medium mb-3">Requirements</h3>
      <ul className="list-disc pl-5 space-y-2 text-muted-foreground mb-6">
        {job.requirements.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
      
      <h3 className="text-lg font-medium mb-3">Benefits</h3>
      <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
        {job.benefits.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    </section>
  );
};

export default JobDescription;
