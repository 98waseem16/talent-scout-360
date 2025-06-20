
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { JobFormData } from '@/lib/types/job.types';

export const useJobFormData = (id?: string) => {
  const { user } = useAuth();
  
  // Initialize form data with default values
  const [formData, setFormData] = useState<JobFormData>({
    title: '',
    company: '',
    location: '',
    type: 'Full-time',
    description: '',
    responsibilities: [''],
    requirements: [''],
    benefits: [''],
    logo: '',
    application_url: '',
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
  });
  
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [isEditMode] = useState(!!id);
  
  // Fetch existing job data if in edit mode
  useEffect(() => {
    const fetchJobData = async () => {
      if (!id) return;
      
      try {
        const { data, error } = await supabase
          .from('job_postings')
          .select('*')
          .eq('id', id)
          .maybeSingle();
        
        if (error) {
          throw error;
        }
        
        if (!data) {
          toast.error('Job not found');
          return;
        }
        
        // Ensure arrays have at least one empty item
        const ensureArrayWithItem = (arr?: string[] | null) => {
          return (arr && arr.length > 0) ? arr : [''];
        };
        
        setFormData({
          ...data,
          responsibilities: ensureArrayWithItem(data.responsibilities),
          requirements: ensureArrayWithItem(data.requirements),
          benefits: ensureArrayWithItem(data.benefits),
        });
      } catch (error: any) {
        console.error('Error fetching job data:', error);
        toast.error(`Failed to load job data: ${error.message}`);
      }
    };
    
    fetchJobData();
  }, [id]);
  
  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle select changes
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle switch changes
  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData(prev => ({ ...prev, [name]: checked }));
  };
  
  // Handle list items (responsibilities, requirements, benefits)
  const handleListChange = (index: number, value: string, field: 'responsibilities' | 'requirements' | 'benefits') => {
    setFormData(prev => {
      const updatedList = [...prev[field]];
      updatedList[index] = value;
      return { ...prev, [field]: updatedList };
    });
  };
  
  const addListItem = (field: 'responsibilities' | 'requirements' | 'benefits') => {
    setFormData(prev => {
      const updatedList = [...prev[field], ''];
      return { ...prev, [field]: updatedList };
    });
  };
  
  const removeListItem = (index: number, field: 'responsibilities' | 'requirements' | 'benefits') => {
    setFormData(prev => {
      const updatedList = [...prev[field]];
      updatedList.splice(index, 1);
      
      // Ensure there's always at least one empty item
      if (updatedList.length === 0) {
        updatedList.push('');
      }
      
      return { ...prev, [field]: updatedList };
    });
  };
  
  // Handle logo upload
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
