
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  MapPin, 
  Calendar, 
  DollarSign, 
  Building, 
  Users, 
  Clock, 
  Globe,
  ExternalLink,
  Star,
  CheckCircle
} from 'lucide-react';

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
  created_at: string;
}

interface JobPreviewModalProps {
  job: JobPosting;
  open: boolean;
  onClose: () => void;
}

const JobPreviewModal: React.FC<JobPreviewModalProps> = ({ job, open, onClose }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusBadge = () => {
    if (job.is_expired) {
      return <Badge variant="destructive">Expired</Badge>;
    }
    if (job.is_draft) {
      return <Badge variant="secondary">Draft</Badge>;
    }
    if (job.featured) {
      return <Badge variant="default" className="bg-yellow-500">
        <Star className="w-3 h-3 mr-1" />
        Featured
      </Badge>;
    }
    return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
      <CheckCircle className="w-3 h-3 mr-1" />
      Published
    </Badge>;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <DialogTitle className="text-2xl font-bold">{job.title}</DialogTitle>
              <DialogDescription className="text-lg font-medium text-foreground mt-1">
                {job.company}
              </DialogDescription>
            </div>
            <div className="flex flex-col gap-2 items-end">
              {getStatusBadge()}
              <div className="text-sm text-muted-foreground">
                ID: {job.id.slice(0, 8)}...
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Key Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="w-5 h-5" />
                Job Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Location</p>
                    <p className="text-sm text-muted-foreground">{job.location}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Type</p>
                    <p className="text-sm text-muted-foreground">{job.type}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Salary</p>
                    <p className="text-sm text-muted-foreground">{job.salary}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Posted</p>
                    <p className="text-sm text-muted-foreground">{formatDate(job.created_at)}</p>
                  </div>
                </div>
              </div>

              {/* Additional Details */}
              {(job.department || job.seniority_level || job.remote_onsite || job.salary_range) && (
                <>
                  <Separator className="my-4" />
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {job.department && (
                      <div>
                        <p className="text-sm font-medium">Department</p>
                        <p className="text-sm text-muted-foreground">{job.department}</p>
                      </div>
                    )}
                    
                    {job.seniority_level && (
                      <div>
                        <p className="text-sm font-medium">Seniority</p>
                        <p className="text-sm text-muted-foreground">{job.seniority_level}</p>
                      </div>
                    )}
                    
                    {job.remote_onsite && (
                      <div>
                        <p className="text-sm font-medium">Work Model</p>
                        <p className="text-sm text-muted-foreground">{job.remote_onsite}</p>
                      </div>
                    )}
                    
                    {job.salary_range && (
                      <div>
                        <p className="text-sm font-medium">Salary Range</p>
                        <p className="text-sm text-muted-foreground">{job.salary_range}</p>
                      </div>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Job Description */}
          <Card>
            <CardHeader>
              <CardTitle>Job Description</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none">
                <p className="whitespace-pre-wrap">{job.description}</p>
              </div>
            </CardContent>
          </Card>

          {/* Responsibilities */}
          {job.responsibilities.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Responsibilities</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {job.responsibilities.map((responsibility, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{responsibility}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Requirements */}
          {job.requirements.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Requirements</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {job.requirements.map((requirement, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{requirement}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Benefits */}
          {job.benefits.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Benefits</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {job.benefits.map((benefit, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Star className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Company Details */}
          {(job.team_size || job.investment_stage || job.equity || job.visa_sponsorship) && (
            <Card>
              <CardHeader>
                <CardTitle>Company Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {job.team_size && (
                    <div>
                      <p className="text-sm font-medium">Team Size</p>
                      <p className="text-sm text-muted-foreground">{job.team_size}</p>
                    </div>
                  )}
                  
                  {job.investment_stage && (
                    <div>
                      <p className="text-sm font-medium">Investment Stage</p>
                      <p className="text-sm text-muted-foreground">{job.investment_stage}</p>
                    </div>
                  )}
                  
                  {job.equity && (
                    <div>
                      <p className="text-sm font-medium">Equity</p>
                      <p className="text-sm text-muted-foreground">{job.equity}</p>
                    </div>
                  )}
                  
                  {job.visa_sponsorship !== null && (
                    <div>
                      <p className="text-sm font-medium">Visa Sponsorship</p>
                      <p className="text-sm text-muted-foreground">
                        {job.visa_sponsorship ? 'Available' : 'Not Available'}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Technical Information */}
          <Card>
            <CardHeader>
              <CardTitle>Technical Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium">Created</p>
                  <p className="text-muted-foreground">{formatDate(job.created_at)}</p>
                </div>
                <div>
                  <p className="font-medium">Expires</p>
                  <p className="text-muted-foreground">{formatDate(job.expires_at)}</p>
                </div>
                {job.application_url && (
                  <div className="col-span-2">
                    <p className="font-medium">Application URL</p>
                    <a 
                      href={job.application_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 flex items-center gap-1 break-all"
                    >
                      {job.application_url}
                      <ExternalLink className="w-3 h-3 flex-shrink-0" />
                    </a>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end gap-4 pt-4 border-t">
            {job.application_url && (
              <Button variant="outline" asChild>
                <a href={job.application_url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View Application
                </a>
              </Button>
            )}
            <Button onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default JobPreviewModal;
