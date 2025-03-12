
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

interface JobsCountProps {
  count: number;
  isLoading: boolean;
}

const JobsCount: React.FC<JobsCountProps> = ({ count, isLoading }) => {
  if (isLoading) {
    return <Skeleton className="h-8 w-32" />;
  }

  return (
    <h2 className="text-xl font-medium">
      {count} {count === 1 ? 'Job' : 'Jobs'} Found
    </h2>
  );
};

export default JobsCount;
