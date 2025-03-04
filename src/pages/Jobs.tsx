
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Search, MapPin, Filter, X } from 'lucide-react';
import JobCard from '@/components/JobCard';
import { jobs } from '@/lib/jobs';

const Jobs: React.FC = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialQuery = queryParams.get('query') || '';
  const initialLocation = queryParams.get('location') || '';

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [locationQuery, setLocationQuery] = useState(initialLocation);
  const [jobType, setJobType] = useState<string[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const toggleJobType = (type: string) => {
    setJobType(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type) 
        : [...prev, type]
    );
  };

  const clearFilters = () => {
    setSearchQuery('');
    setLocationQuery('');
    setJobType([]);
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = searchQuery === '' || 
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.description.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesLocation = locationQuery === '' ||
      job.location.toLowerCase().includes(locationQuery.toLowerCase());
      
    const matchesType = jobType.length === 0 ||
      jobType.includes(job.type);
      
    return matchesSearch && matchesLocation && matchesType;
  });

  // Update URL with search params
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('query', searchQuery);
    if (locationQuery) params.set('location', locationQuery);
    
    const newUrl = `${location.pathname}${params.toString() ? `?${params.toString()}` : ''}`;
    window.history.replaceState({}, '', newUrl);
  }, [searchQuery, locationQuery, location.pathname]);

  return (
    <main className="min-h-screen pt-24 pb-16 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start gap-8">
          {/* Filters - Mobile Toggle */}
          <button
            className="md:hidden flex items-center text-foreground bg-white border border-border rounded-lg px-4 py-2 shadow-sm"
            onClick={() => setIsFilterOpen(!isFilterOpen)}
          >
            <Filter className="h-5 w-5 mr-2" />
            {isFilterOpen ? "Hide Filters" : "Show Filters"}
          </button>
          
          {/* Filters Sidebar */}
          <aside 
            className={`w-full md:w-64 md:sticky top-24 transition-all duration-300 ${
              isFilterOpen ? 'max-h-[800px] opacity-100' : 'max-h-0 md:max-h-[800px] opacity-0 md:opacity-100 overflow-hidden md:overflow-visible'
            }`}
          >
            <div className="bg-white rounded-xl border border-border shadow-sm p-5 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium">Filters</h3>
                <button 
                  onClick={clearFilters}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Clear all
                </button>
              </div>
              
              <div className="space-y-5">
                <div>
                  <h4 className="text-sm font-medium mb-2">Job Type</h4>
                  <div className="space-y-2">
                    {['Full-time', 'Part-time', 'Contract', 'Remote'].map(type => (
                      <label key={type} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={jobType.includes(type)}
                          onChange={() => toggleJobType(type)}
                          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary/20"
                        />
                        <span className="text-sm">{type}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </aside>
          
          {/* Main Content */}
          <div className="flex-1">
            {/* Search Bar */}
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
            
            {/* Results Count */}
            <div className="mb-6 flex justify-between items-center">
              <h2 className="text-xl font-medium">
                {filteredJobs.length} {filteredJobs.length === 1 ? 'Job' : 'Jobs'} Found
              </h2>
              
              {/* Active Filters */}
              {(searchQuery || locationQuery || jobType.length > 0) && (
                <div className="flex flex-wrap gap-2">
                  {searchQuery && (
                    <div className="inline-flex items-center bg-secondary text-sm rounded-full px-3 py-1">
                      <span className="mr-1">"{searchQuery}"</span>
                      <button 
                        onClick={() => setSearchQuery('')}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                  
                  {locationQuery && (
                    <div className="inline-flex items-center bg-secondary text-sm rounded-full px-3 py-1">
                      <span className="mr-1">{locationQuery}</span>
                      <button 
                        onClick={() => setLocationQuery('')}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                  
                  {jobType.map(type => (
                    <div 
                      key={type}
                      className="inline-flex items-center bg-secondary text-sm rounded-full px-3 py-1"
                    >
                      <span className="mr-1">{type}</span>
                      <button 
                        onClick={() => toggleJobType(type)}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Job Listings */}
            <div className="space-y-6">
              {filteredJobs.length > 0 ? (
                filteredJobs.map((job, index) => (
                  <JobCard key={job.id} job={job} index={index} />
                ))
              ) : (
                <div className="text-center py-16">
                  <h3 className="text-xl mb-2">No jobs found</h3>
                  <p className="text-muted-foreground">
                    Try adjusting your search criteria or filters
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Jobs;
