
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const ErrorState: React.FC = () => {
  return (
    <div className="text-center py-12">
      <h1 className="text-2xl font-medium mb-4">Job Not Found</h1>
      <p className="text-muted-foreground mb-8">The job listing you're looking for doesn't exist or has been removed.</p>
      <Link 
        to="/jobs" 
        className="inline-flex items-center text-primary hover:underline"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to all jobs
      </Link>
    </div>
  );
};

export default ErrorState;
