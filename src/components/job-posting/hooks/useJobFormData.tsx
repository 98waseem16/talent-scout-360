
import { useState, useEffect } from 'react';
import { getJobById } from '@/lib/jobs/jobsApi';
import { toast } from 'sonner';
import { JobFormData } from '@/lib/types/job.types';

export const useJobFormData = (id?: string) => {
  const [formData, setFormData] = useState<JobFormData>({
    title: '',
    company: '',
    location: '',
    type: 'Full-time',
    description: '',
    responsibilities: [''],
    requirements: [''],
    benefits: [''],
    logo: '/placeholder.svg',
    salary: '',
    investment_stage: '',
    team_size: '',
    revenue_model: '',
    department: '',
    seniority_level: '',
    salary_range: '',
    equity: '',
    remote_onsite: '',
    work_hours: '',
    visa_sponsorship: false,
    hiring_urgency: '',
    featured: false,
    application_url: '',
  });

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const isEditMode = !!id;

  useEffect(() => {
    if (isEditMode && id) {
      const fetchJobData = async () => {
        try {
          const jobData = await getJobById(id);
          if (jobData) {
            setFormData({
              title: jobData.title || '',
              company: jobData.company || '',
              location: jobData.location || '',
              type: jobData.type || 'Full-time',
              description: jobData.description || '',
              requirements: jobData.requirements || [''],
              benefits: jobData.benefits || [''],
              responsibilities: jobData.responsibilities || [''],
              logo: jobData.logo || '/placeholder.svg',
              featured: jobData.featured || false,
              salary: jobData.salary || '',
              investment_stage: jobData.investment_stage || '',
              team_size: jobData.team_size || '',
              revenue_model: jobData.revenue_model || '',
              department: jobData.department || '',
              seniority_level: jobData.seniority_level || '',
              salary_range: jobData.salary_range || '',
              equity: jobData.equity || '',
              remote_onsite: jobData.remote_onsite || '',
              work_hours: jobData.work_hours || '',
              visa_sponsorship: jobData.visa_sponsorship || false,
              hiring_urgency: jobData.hiring_urgency || '',
              application_url: jobData.application_url || '',
            });
          }
        } catch (error) {
          console.error('Error fetching job data:', error);
          toast.error('Failed to load job data');
        }
      };

      fetchJobData();
    }
  }, [id, isEditMode]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData(prev => ({ ...prev, [name]: checked }));
  };
  
  const handleListChange = (index: number, value: string, field: 'responsibilities' | 'requirements' | 'benefits') => {
    const newList = [...(formData[field] as string[])];
    newList[index] = value;
    setFormData(prev => ({ ...prev, [field]: newList }));
  };
  
  const addListItem = (field: 'responsibilities' | 'requirements' | 'benefits') => {
    setFormData(prev => ({
      ...prev,
      [field]: [...(prev[field] as string[]), '']
    }));
  };
  
  const removeListItem = (index: number, field: 'responsibilities' | 'requirements' | 'benefits') => {
    if ((formData[field] as string[]).length <= 1) return;
    const newList = [...(formData[field] as string[])];
    newList.splice(index, 1);
    setFormData(prev => ({ ...prev, [field]: newList }));
  };

  const handleLogoChange = (file: File | null) => {
    setLogoFile(file);
  };

  return {
    formData,
    logoFile,
    isEditMode,
    handleInputChange,
    handleSelectChange,
    handleSwitchChange,
    handleListChange,
    addListItem,
    removeListItem,
    handleLogoChange
  };
};
