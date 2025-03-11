import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search, MapPin, Filter, X, Loader2, Building2, Briefcase, DollarSign, Users, Globe } from 'lucide-react';
import JobCard from '@/components/JobCard';
import { getJobs } from '@/lib/jobs';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

const Jobs: React.FC = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialQuery = queryParams.get('query') || '';
  const initialLocation = queryParams.get('location') || '';

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [locationQuery, setLocationQuery] = useState(initialLocation);
  const [jobType, setJobType] = useState<string[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  const [department, setDepartment] = useState<string>('');
  const [seniority, setSeniority] = useState<string>('');
  const [salaryRange, setSalaryRange] = useState<string>('');
  const [teamSize, setTeamSize] = useState<string>('');
  const [investmentStage, setInvestmentStage] = useState<string>('');
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [visaSponsorship, setVisaSponsorship] = useState(false);

  const { data: jobs, isLoading, error } = useQuery({
    queryKey: ['jobs'],
    queryFn: getJobs,
  });

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
    setDepartment('');
    setSeniority('');
    setSalaryRange('');
    setTeamSize('');
    setInvestmentStage('');
    setRemoteOnly(false);
    setVisaSponsorship(false);
  };

  const filteredJobs = jobs?.filter(job => {
    const matchesSearch = searchQuery === '' || 
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.description.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesLocation = locationQuery === '' ||
      job.location.toLowerCase().includes(locationQuery.toLowerCase());
      
    const matchesType = jobType.length === 0 ||
      jobType.includes(job.type);

    const matchesDepartment = !department || job.department === department;
    const matchesSeniority = !seniority || job.seniority_level === seniority;
    const matchesSalary = !salaryRange || job.salary_range === salaryRange;
    const matchesTeamSize = !teamSize || job.team_size === teamSize;
    const matchesInvestment = !investmentStage || job.investment_stage === investmentStage;
    const matchesRemote = !remoteOnly || job.remote_onsite === 'Fully Remote';
    const matchesVisa = !visaSponsorship || job.visa_sponsorship === true;
      
    return matchesSearch && matchesLocation && matchesType && 
           matchesDepartment && matchesSeniority && matchesSalary && 
           matchesTeamSize && matchesInvestment && matchesRemote && matchesVisa;
  }) || [];

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
          <button
            className="md:hidden flex items-center text-foreground bg-white border border-border rounded-lg px-4 py-2 shadow-sm"
            onClick={() => setIsFilterOpen(!isFilterOpen)}
          >
            <Filter className="h-5 w-5 mr-2" />
            {isFilterOpen ? "Hide Filters" : "Show Filters"}
          </button>
          
          <aside 
            className={`w-full md:w-80 md:sticky top-24 transition-all duration-300 ${
              isFilterOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 md:max-h-[2000px] opacity-0 md:opacity-100 overflow-hidden md:overflow-visible'
            }`}
          >
            <div className="bg-white rounded-xl border border-border shadow-sm p-5 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium">Filters</h3>
                <button 
                  onClick={() => {
                    setJobType([]);
                    setDepartment('');
                    setSeniority('');
                    setSalaryRange('');
                    setTeamSize('');
                    setInvestmentStage('');
                    setRemoteOnly(false);
                    setVisaSponsorship(false);
                  }}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Clear all
                </button>
              </div>
              
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    Department
                  </label>
                  <Select value={department} onValueChange={setDepartment}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Departments</SelectItem>
                      <SelectItem value="Engineering">Engineering</SelectItem>
                      <SelectItem value="Design">Design</SelectItem>
                      <SelectItem value="Product">Product</SelectItem>
                      <SelectItem value="Marketing">Marketing</SelectItem>
                      <SelectItem value="Sales">Sales</SelectItem>
                      <SelectItem value="Operations">Operations</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium">
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                    Seniority Level
                  </label>
                  <Select value={seniority} onValueChange={setSeniority}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Levels</SelectItem>
                      <SelectItem value="Internship">Internship</SelectItem>
                      <SelectItem value="Entry-Level">Entry-Level</SelectItem>
                      <SelectItem value="Mid-Level">Mid-Level</SelectItem>
                      <SelectItem value="Senior">Senior</SelectItem>
                      <SelectItem value="Lead">Lead</SelectItem>
                      <SelectItem value="Manager">Manager</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    Salary Range
                  </label>
                  <Select value={salaryRange} onValueChange={setSalaryRange}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Ranges</SelectItem>
                      <SelectItem value="$40K-$60K">$40K-$60K</SelectItem>
                      <SelectItem value="$60K-$80K">$60K-$80K</SelectItem>
                      <SelectItem value="$80K-$120K">$80K-$120K</SelectItem>
                      <SelectItem value="$120K+">$120K+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    Team Size
                  </label>
                  <Select value={teamSize} onValueChange={setTeamSize}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Sizes</SelectItem>
                      <SelectItem value="1-10">1-10</SelectItem>
                      <SelectItem value="11-50">11-50</SelectItem>
                      <SelectItem value="51-200">51-200</SelectItem>
                      <SelectItem value="201-500">201-500</SelectItem>
                      <SelectItem value="500+">500+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    Investment Stage
                  </label>
                  <Select value={investmentStage} onValueChange={setInvestmentStage}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select stage" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Stages</SelectItem>
                      <SelectItem value="Bootstrapped">Bootstrapped</SelectItem>
                      <SelectItem value="Pre-Seed">Pre-Seed</SelectItem>
                      <SelectItem value="Seed">Seed</SelectItem>
                      <SelectItem value="Series A">Series A</SelectItem>
                      <SelectItem value="Series B+">Series B+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-sm font-medium">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    Remote Only
                  </label>
                  <Switch
                    checked={remoteOnly}
                    onCheckedChange={setRemoteOnly}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-sm font-medium">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    Visa Sponsorship
                  </label>
                  <Switch
                    checked={visaSponsorship}
                    onCheckedChange={setVisaSponsorship}
                  />
                </div>
              </div>
            </div>
          </aside>
          
          <div className="flex-1">
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
            
            <div className="mb-6 flex justify-between items-center">
              {isLoading ? (
                <Skeleton className="h-8 w-32" />
              ) : (
                <h2 className="text-xl font-medium">
                  {filteredJobs.length} {filteredJobs.length === 1 ? 'Job' : 'Jobs'} Found
                </h2>
              )}
              
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
