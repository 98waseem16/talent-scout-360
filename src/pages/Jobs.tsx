
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search, MapPin, Filter, X, Loader2 } from 'lucide-react';
import JobCard from '@/components/JobCard';
import { getJobs } from '@/lib/jobs';
import { Skeleton } from '@/components/ui/skeleton';
import JobFilters from '@/components/job-filters/JobFilters';

const Jobs: React.FC = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialQuery = queryParams.get('query') || '';
  const initialLocation = queryParams.get('location') || '';

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [locationQuery, setLocationQuery] = useState(initialLocation);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  const [filters, setFilters] = useState({
    department: '',
    seniority: '',
    salaryRange: '',
    teamSize: '',
    investmentStage: '',
    remote: '',
    jobType: '',
    workHours: '',
    equity: '',
    hiringUrgency: '',
    revenueModel: '',
    visaSponsorship: false
  });

  const { data: jobs, isLoading, error } = useQuery({
    queryKey: ['jobs'],
    queryFn: getJobs,
  });

  const clearFilters = () => {
    setSearchQuery('');
    setLocationQuery('');
    clearAllFilters();
  };

  const clearAllFilters = () => {
    setFilters({
      department: '',
      seniority: '',
      salaryRange: '',
      teamSize: '',
      investmentStage: '',
      remote: '',
      jobType: '',
      workHours: '',
      equity: '',
      hiringUrgency: '',
      revenueModel: '',
      visaSponsorship: false
    });
  };

  const filteredJobs = jobs?.filter(job => {
    // Basic text search filters
    const matchesSearch = searchQuery === '' || 
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.description.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesLocation = locationQuery === '' ||
      job.location.toLowerCase().includes(locationQuery.toLowerCase());
    
    // Advanced filters
    const matchesDepartment = filters.department === '' || 
      job.department?.toLowerCase() === filters.department.toLowerCase();
      
    const matchesSeniority = filters.seniority === '' || 
      job.seniority_level?.toLowerCase() === filters.seniority.toLowerCase();
      
    const matchesSalaryRange = filters.salaryRange === '' || 
      job.salary_range?.toLowerCase() === filters.salaryRange.toLowerCase();
      
    const matchesTeamSize = filters.teamSize === '' || 
      job.team_size?.toLowerCase() === filters.teamSize.toLowerCase();
      
    const matchesInvestmentStage = filters.investmentStage === '' || 
      job.investment_stage?.toLowerCase() === filters.investmentStage.toLowerCase();
      
    const matchesRemote = filters.remote === '' || 
      job.remote_onsite?.toLowerCase() === filters.remote.toLowerCase();
      
    const matchesJobType = filters.jobType === '' || 
      job.job_type?.toLowerCase() === filters.jobType.toLowerCase();
      
    const matchesWorkHours = filters.workHours === '' || 
      job.work_hours?.toLowerCase() === filters.workHours.toLowerCase();
      
    const matchesEquity = filters.equity === '' || 
      job.equity?.toLowerCase() === filters.equity.toLowerCase();
      
    const matchesHiringUrgency = filters.hiringUrgency === '' || 
      job.hiring_urgency?.toLowerCase() === filters.hiringUrgency.toLowerCase();
      
    const matchesRevenueModel = filters.revenueModel === '' || 
      job.revenue_model?.toLowerCase() === filters.revenueModel.toLowerCase();
      
    const matchesVisaSponsorship = !filters.visaSponsorship || 
      job.visa_sponsorship === true;
    
    return matchesSearch && matchesLocation && 
      matchesDepartment && matchesSeniority && matchesSalaryRange && 
      matchesTeamSize && matchesInvestmentStage && matchesRemote && 
      matchesJobType && matchesWorkHours && matchesEquity && 
      matchesHiringUrgency && matchesRevenueModel && matchesVisaSponsorship;
  }) || [];

  // Update URL with search params
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('query', searchQuery);
    if (locationQuery) params.set('location', locationQuery);
    
    const newUrl = `${location.pathname}${params.toString() ? `?${params.toString()}` : ''}`;
    window.history.replaceState({}, '', newUrl);
  }, [searchQuery, locationQuery, location.pathname]);

  // Generate the active filters display
  const activeFilters = [
    ...(searchQuery ? [{ type: 'search', label: `"${searchQuery}"` }] : []),
    ...(locationQuery ? [{ type: 'location', label: locationQuery }] : []),
    ...(filters.department ? [{ type: 'department', label: filters.department }] : []),
    ...(filters.seniority ? [{ type: 'seniority', label: filters.seniority }] : []),
    ...(filters.salaryRange ? [{ type: 'salaryRange', label: filters.salaryRange }] : []),
    ...(filters.teamSize ? [{ type: 'teamSize', label: filters.teamSize }] : []),
    ...(filters.investmentStage ? [{ type: 'investmentStage', label: filters.investmentStage }] : []),
    ...(filters.remote ? [{ type: 'remote', label: filters.remote }] : []),
    ...(filters.jobType ? [{ type: 'jobType', label: filters.jobType }] : []),
    ...(filters.workHours ? [{ type: 'workHours', label: filters.workHours }] : []),
    ...(filters.equity ? [{ type: 'equity', label: filters.equity }] : []),
    ...(filters.hiringUrgency ? [{ type: 'hiringUrgency', label: filters.hiringUrgency }] : []),
    ...(filters.revenueModel ? [{ type: 'revenueModel', label: filters.revenueModel }] : []),
    ...(filters.visaSponsorship ? [{ type: 'visaSponsorship', label: 'Visa Sponsorship' }] : [])
  ];

  const removeFilter = (type: string) => {
    if (type === 'search') {
      setSearchQuery('');
    } else if (type === 'location') {
      setLocationQuery('');
    } else {
      setFilters(prev => ({ 
        ...prev, 
        [type]: type === 'visaSponsorship' ? false : '' 
      }));
    }
  };

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
              isFilterOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 md:max-h-[2000px] opacity-0 md:opacity-100 overflow-hidden md:overflow-visible'
            }`}
          >
            <div className="bg-white rounded-xl border border-border shadow-sm p-5 mb-6">
              <JobFilters 
                filters={filters} 
                setFilters={setFilters} 
                clearAllFilters={clearAllFilters} 
              />
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
            
            {/* Results Count & Active Filters */}
            <div className="mb-6">
              {isLoading ? (
                <Skeleton className="h-8 w-32" />
              ) : (
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <h2 className="text-xl font-medium">
                    {filteredJobs.length} {filteredJobs.length === 1 ? 'Job' : 'Jobs'} Found
                  </h2>
                  
                  {/* Active Filters */}
                  {activeFilters.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2 sm:mt-0">
                      {activeFilters.map((filter, index) => (
                        <div key={index} className="inline-flex items-center bg-secondary text-sm rounded-full px-3 py-1">
                          <span className="mr-1">{filter.label}</span>
                          <button 
                            onClick={() => removeFilter(filter.type)}
                            className="text-muted-foreground hover:text-foreground"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                      
                      {activeFilters.length > 1 && (
                        <button 
                          onClick={clearFilters}
                          className="inline-flex items-center bg-primary/10 text-primary text-sm rounded-full px-3 py-1 hover:bg-primary/20 transition-colors"
                        >
                          Clear all
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {/* Job Listings */}
            {isLoading ? (
              <div className="space-y-6">
                {[...Array(5)].map((_, index) => (
                  <div key={index} className="bg-white shadow-sm border border-border rounded-xl p-6">
                    <div className="flex items-start gap-4">
                      <Skeleton className="h-12 w-12 rounded-md" />
                      <div className="flex-1">
                        <Skeleton className="h-6 w-3/4 mb-2" />
                        <Skeleton className="h-4 w-1/2 mb-4" />
                        <div className="flex flex-wrap gap-3">
                          <Skeleton className="h-4 w-20" />
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-4 w-16" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-16">
                <h3 className="text-xl mb-2">Error loading jobs</h3>
                <p className="text-muted-foreground">
                  Please try refreshing the page
                </p>
              </div>
            ) : (
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
            )}
          </div>
        </div>
      </div>
    </main>
  );
};

export default Jobs;
