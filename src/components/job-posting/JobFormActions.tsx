
import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

interface JobFormActionsProps {
  isSubmitting: boolean;
  isEditMode: boolean;
  isFromScraper?: boolean;
}

const JobFormActions: React.FC<JobFormActionsProps> = ({ 
  isSubmitting, 
  isEditMode,
  isFromScraper = false
}) => {
  return (
    <div className="flex items-center justify-between border-t pt-6">
      <Button asChild variant="outline">
        <Link to="/dashboard">Cancel</Link>
      </Button>
      
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {isEditMode ? 'Updating...' : 'Creating...'}
          </>
        ) : (
          <>
            {isEditMode ? 
              (isFromScraper ? 'Publish Job' : 'Update Job') : 
              'Create Job'}
          </>
        )}
      </Button>
    </div>
  );
};

export default JobFormActions;
