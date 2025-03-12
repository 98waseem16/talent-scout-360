
import React from 'react';
import { Search, MapPin } from 'lucide-react';

interface JobSearchBarProps {
  searchQuery: string;
  locationQuery: string;
  setSearchQuery: (query: string) => void;
  setLocationQuery: (location: string) => void;
}

const JobSearchBar: React.FC<JobSearchBarProps> = ({
  searchQuery,
  locationQuery,
  setSearchQuery,
  setLocationQuery
}) => {
  return (
    <div className="bg-white rounded-xl border border-border shadow-sm p-4 mb-8">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <div className="absolute left-3 top-2.5 text-muted-foreground">
            <Search className="h-5 w-5" />
          </div>
          <input
            type="text"
            placeholder="Job title or keyword"
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-input focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex-1 relative">
          <div className="absolute left-3 top-2.5 text-muted-foreground">
            <MapPin className="h-5 w-5" />
          </div>
          <input
            type="text"
            placeholder="Location or Remote"
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-input focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            value={locationQuery}
            onChange={(e) => setLocationQuery(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
};

export default JobSearchBar;
