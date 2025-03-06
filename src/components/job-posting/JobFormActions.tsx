
import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface JobFormActionsProps {
  isSubmitting: boolean;
  isEditMode: boolean;
}

const JobFormActions: React.FC<JobFormActionsProps> = ({ isSubmitting, isEditMode }) => {
  return (
    <div className="pt-6">
      <Button 
        type="submit" 
        className="w-full md:w-auto" 
        size="lg"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {isEditMode ? 'Updating Job...' : 'Posting Job...'}
          </>
        ) : isEditMode ? "Update Job" : "Post Job"}
      </Button>
    </div>
  );
};

export default JobFormActions;
