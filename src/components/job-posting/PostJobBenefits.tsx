
import React from 'react';
import { Users, Clock, Globe } from 'lucide-react';

const PostJobBenefits: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <div className="flex items-start space-x-3">
        <Users className="h-6 w-6 text-primary mt-0.5" />
        <div>
          <h3 className="font-medium">Reach Top Talent</h3>
          <p className="text-sm text-muted-foreground">
            Connect with motivated candidates actively seeking startup opportunities
          </p>
        </div>
      </div>
      
      <div className="flex items-start space-x-3">
        <Clock className="h-6 w-6 text-primary mt-0.5" />
        <div>
          <h3 className="font-medium">Quick Setup</h3>
          <p className="text-sm text-muted-foreground">
            Create and publish your job posting in just a few minutes
          </p>
        </div>
      </div>
      
      <div className="flex items-start space-x-3">
        <Globe className="h-6 w-6 text-primary mt-0.5" />
        <div>
          <h3 className="font-medium">Wide Distribution</h3>
          <p className="text-sm text-muted-foreground">
            Your job will be shared across our partner networks for maximum visibility
          </p>
        </div>
      </div>
    </div>
  );
};

export default PostJobBenefits;
