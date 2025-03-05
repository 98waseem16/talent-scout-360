
import React from 'react';
import { Zap } from 'lucide-react';
import { Switch } from '@/components/ui/switch';

interface FeaturedOptionProps {
  featured: boolean;
  handleSwitchChange: (name: string, checked: boolean) => void;
}

const FeaturedOption: React.FC<FeaturedOptionProps> = ({ featured, handleSwitchChange }) => {
  return (
    <>
      <div className="space-y-1 pt-4 border-t">
        <h2 className="text-xl font-medium">Visibility Options</h2>
        <p className="text-sm text-muted-foreground">
          Control how your job posting appears on our platform
        </p>
      </div>
      
      <div className="space-y-2">
        <label htmlFor="featured-job" className="flex items-center space-x-2 text-sm font-medium">
          <Zap className="h-5 w-5 text-amber-500" />
          <span>Feature this job in the Trending Section</span>
          <span className="ml-2 text-xs px-2 py-1 bg-amber-100 text-amber-700 rounded-full">Premium</span>
        </label>
        <div className="flex items-center space-x-2">
          <Switch
            id="featured-job"
            checked={featured}
            onCheckedChange={(checked) => handleSwitchChange('featured', checked)}
          />
          <span className="text-sm text-muted-foreground">
            {featured ? 'Your job will appear in the Trending Jobs section' : 'Standard job visibility'}
          </span>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Featured jobs receive up to 5x more visibility and applicants.
        </p>
      </div>
    </>
  );
};

export default FeaturedOption;
