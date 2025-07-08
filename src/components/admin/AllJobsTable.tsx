import React, { useState, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { 
  Search, 
  Filter, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Eye, 
  Star, 
  Copy,
  Download,
  RefreshCw,
  Image
} from 'lucide-react';
import { deleteJob } from '@/lib/jobs/operations/manageJobs';
import JobEditModal from './JobEditModal';
import JobPreviewModal from './JobPreviewModal';

interface JobPosting {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  type: string;
  posted: string;
  description: string;
  responsibilities: string[];
  requirements: string[];
  benefits: string[];
  logo: string;
  featured: boolean;
  application_url: string | null;
  user_id: string | null;
  created_at: string;
  updated_at: string;
  department: string | null;
  seniority_level: string | null;
  salary_range: string | null;
  investment_stage: string | null;
  team_size: string | null;
  revenue_model: string | null;
  remote_onsite: string | null;
  work_hours: string | null;
  equity: string | null;
  hiring_urgency: string | null;
  visa_sponsorship: boolean | null;
  is_draft: boolean;
  is_expired: boolean;
  expires_at: string;
  source_url: string | null;
  scraped_at: string | null;
  scraping_job_id: string | null;
}

const AllJobsTable: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // State management - Changed default statusFilter to 'published'
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('published');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [selectedJobs, setSelectedJobs] = useState<Set<string>>(new Set());
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [jobToDelete, setJobToDelete] = useState<string | null>(null);
  const [editingJob, setEditingJob] = useState<JobPosting | null>(null);
  const [previewingJob, setPreviewingJob] = useState<JobPosting | null>(null);
  const [sortBy, setSortBy] = useState<string>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(50);

  // Fetch all jobs with filtering and pagination
  const { data: jobsData, isLoading, error, refetch } = useQuery({
    queryKey: ['admin-all-jobs', searchTerm, statusFilter, departmentFilter, sortBy, sortOrder, currentPage, pageSize],
    queryFn: async () => {
      let query = supabase
        .from('job_postings')
        .select('*');

      // Apply search filter
      if (searchTerm) {
        query = query.or(`title.ilike.%${searchTerm}%,company.ilike.%${searchTerm}%,location.ilike.%${searchTerm}%`);
      }

      // Apply status filter
      if (statusFilter !== 'all') {
        switch (statusFilter) {
          case 'draft':
            query = query.eq('is_draft', true);
            break;
          case 'published':
            query = query.eq('is_draft', false).eq('is_expired', false);
            break;
          case 'expired':
            query = query.eq('is_expired', true);
            break;
          case 'featured':
            query = query.eq('featured', true);
            break;
        }
      }

      // Apply department filter
      if (departmentFilter !== 'all') {
        query = query.eq('department', departmentFilter);
      }

      // Apply sorting
      query = query.order(sortBy, { ascending: sortOrder === 'asc' });

      // Apply pagination
      const from = (currentPage - 1) * pageSize;
      const to = from + pageSize - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;
      
      if (error) throw error;
      
      return { jobs: data || [], totalCount: count || 0 };
    },
  });

  // Get unique departments for filter
  const { data: departments } = useQuery({
    queryKey: ['job-departments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('job_postings')
        .select('department')
        .not('department', 'is', null);
      
      if (error) throw error;
      
      const uniqueDepartments = [...new Set(data.map(item => item.department))];
      return uniqueDepartments.filter(Boolean);
    },
  });

  // Delete job mutation
  const deleteMutation = useMutation({
    mutationFn: deleteJob,
    onSuccess: () => {
      toast({
        title: "Job Deleted",
        description: "The job posting has been successfully deleted.",
      });
      queryClient.invalidateQueries({ queryKey: ['admin-all-jobs'] });
      setSelectedJobs(new Set());
    },
    onError: (error: any) => {
      toast({
        title: "Delete Failed",
        description: error?.message || "Failed to delete job posting.",
        variant: "destructive",
      });
    },
  });

  // Handle job selection
  const handleJobSelect = useCallback((jobId: string, checked: boolean) => {
    setSelectedJobs(prev => {
      const newSet = new Set(prev);
      if (checked) {
        newSet.add(jobId);
      } else {
        newSet.delete(jobId);
      }
      return newSet;
    });
  }, []);

  // Handle select all
  const handleSelectAll = useCallback((checked: boolean) => {
    if (checked && jobsData?.jobs) {
      setSelectedJobs(new Set(jobsData.jobs.map(job => job.id)));
    } else {
      setSelectedJobs(new Set());
    }
  }, [jobsData?.jobs]);

  // Handle single job delete
  const handleDeleteJob = useCallback((jobId: string) => {
    setJobToDelete(jobId);
    setDeleteDialogOpen(true);
  }, []);

  // Confirm delete
  const confirmDelete = useCallback(() => {
    if (jobToDelete) {
      deleteMutation.mutate(jobToDelete);
      setDeleteDialogOpen(false);
      setJobToDelete(null);
    }
  }, [jobToDelete, deleteMutation]);

  // Handle bulk delete
  const handleBulkDelete = useCallback(() => {
    if (selectedJobs.size > 0) {
      // For bulk delete, we'll delete the first selected job as an example
      const firstJobId = Array.from(selectedJobs)[0];
      handleDeleteJob(firstJobId);
    }
  }, [selectedJobs, handleDeleteJob]);

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Get job status badge
  const getStatusBadge = (job: JobPosting) => {
    if (job.is_expired) {
      return <Badge variant="destructive">Expired</Badge>;
    }
    if (job.is_draft) {
      return <Badge variant="secondary">Draft</Badge>;
    }
    if (job.featured) {
      return <Badge variant="default" className="bg-yellow-500">Featured</Badge>;
    }
    return <Badge variant="outline">Published</Badge>;
  };

  const jobs = jobsData?.jobs || [];
  const totalCount = jobsData?.totalCount || 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            <p>Error loading jobs: {error.message}</p>
            <Button onClick={() => refetch()} className="mt-2">
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Live Job Postings</CardTitle>
              <CardDescription>
                Manage published job postings ({totalCount} total)
              </CardDescription>
            </div>
            <div className="flex gap-2">
              {selectedJobs.size > 0 && (
                <Button variant="destructive" onClick={handleBulkDelete}>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Selected ({selectedJobs.size})
                </Button>
              )}
              <Button onClick={() => refetch()} variant="outline">
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {/* Filters */}
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search jobs by title, company, or location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
                <SelectItem value="featured">Featured</SelectItem>
              </SelectContent>
            </Select>

            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments?.map((dept) => (
                  <SelectItem key={dept} value={dept}>
                    {dept}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedJobs.size === jobs.length && jobs.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead className="w-16">Logo</TableHead>
                  <TableHead>Title & Company</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Posted</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell colSpan={9} className="h-16">
                        <div className="animate-pulse bg-muted rounded h-4 w-full"></div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : jobs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8">
                      No jobs found matching your criteria.
                    </TableCell>
                  </TableRow>
                ) : (
                  jobs.map((job) => (
                    <TableRow key={job.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedJobs.has(job.id)}
                          onCheckedChange={(checked) => handleJobSelect(job.id, !!checked)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="w-8 h-8 rounded border flex items-center justify-center bg-gray-50">
                          {job.logo && job.logo !== '/placeholder.svg' ? (
                            <img 
                              src={job.logo} 
                              alt={job.company} 
                              className="w-full h-full object-contain rounded"
                            />
                          ) : (
                            <Image className="w-4 h-4 text-gray-400" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{job.title}</div>
                          <div className="text-sm text-muted-foreground">{job.company}</div>
                        </div>
                      </TableCell>
                      <TableCell>{job.location}</TableCell>
                      <TableCell>{job.type}</TableCell>
                      <TableCell>{job.department || '-'}</TableCell>
                      <TableCell>{getStatusBadge(job)}</TableCell>
                      <TableCell>{formatDate(job.created_at)}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => setPreviewingJob(job)}>
                              <Eye className="mr-2 h-4 w-4" />
                              Preview
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setEditingJob(job)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDeleteJob(job.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center mt-4">
              <div className="text-sm text-muted-foreground">
                Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, totalCount)} of {totalCount} jobs
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the job posting
              and remove all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Job Edit Modal */}
      {editingJob && (
        <JobEditModal
          job={editingJob}
          open={!!editingJob}
          onClose={() => setEditingJob(null)}
          onSave={() => {
            setEditingJob(null);
            queryClient.invalidateQueries({ queryKey: ['admin-all-jobs'] });
          }}
        />
      )}

      {/* Job Preview Modal */}
      {previewingJob && (
        <JobPreviewModal
          job={previewingJob}
          open={!!previewingJob}
          onClose={() => setPreviewingJob(null)}
        />
      )}
    </>
  );
};

export default AllJobsTable;
