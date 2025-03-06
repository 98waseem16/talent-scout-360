
import React from 'react';

interface JobFormHeaderProps {
  isEditMode: boolean;
}

const JobFormHeader: React.FC<JobFormHeaderProps> = ({ isEditMode }) => {
  return (
    <>
      <h1 className="text-3xl font-medium mb-2">
        {isEditMode ? 'Edit Job Listing' : 'Post a Startup Job'}
      </h1>
      <p className="text-muted-foreground mb-6">
        {isEditMode 
          ? 'Update your job listing with the latest information'
          : 'Reach thousands of qualified candidates looking to join innovative startups'}
      </p>
    </>
  );
};

export default JobFormHeader;
