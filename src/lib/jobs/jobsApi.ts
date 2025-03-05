
import { supabase } from '@/integrations/supabase/client';
import { Job } from '../types/job.types';
import { staticJobs } from '../data/staticJobs';
import { formatPostedDate } from '../utils/dateUtils';

/**
 * Fetches all jobs from the database
 */
export const getJobs = async (): Promise<Job[]> => {
  try {
    const { data, error } = await supabase
      .from('job_postings')
      .select('*')
      .order('posted', { ascending: false });

    if (error) {
      console.error('Error fetching jobs:', error);
      return staticJobs;
    }

    const jobs = data.map(job => ({
      id: job.id,
      title: job.title,
      company: job.company,
      location: job.location,
      salary: job.salary,
      type: job.type as 'Full-time' | 'Part-time' | 'Contract' | 'Remote',
      posted: formatPostedDate(job.posted),
      description: job.description,
      responsibilities: job.responsibilities,
      requirements: job.requirements,
      benefits: job.benefits,
      logo: job.logo,
      featured: job.featured
    }));

    return jobs;
  } catch (error) {
    console.error('Error fetching jobs:', error);
    return staticJobs;
  }
};

/**
 * Fetches trending (featured) jobs from the database
 */
export const getTrendingJobs = async (): Promise<Job[]> => {
  try {
    const { data, error } = await supabase
      .from('job_postings')
      .select('*')
      .eq('featured', true)
      .order('posted', { ascending: false })
      .limit(3);

    if (error) {
      console.error('Error fetching trending jobs:', error);
      return staticJobs.filter(job => job.featured);
    }

    const jobs = data.map(job => ({
      id: job.id,
      title: job.title,
      company: job.company,
      location: job.location,
      salary: job.salary,
      type: job.type as 'Full-time' | 'Part-time' | 'Contract' | 'Remote',
      posted: formatPostedDate(job.posted),
      description: job.description,
      responsibilities: job.responsibilities,
      requirements: job.requirements,
      benefits: job.benefits,
      logo: job.logo,
      featured: job.featured
    }));

    return jobs;
  } catch (error) {
    console.error('Error fetching trending jobs:', error);
    return staticJobs.filter(job => job.featured);
  }
};

/**
 * Fetches a job by its ID from the database
 */
export const getJobById = async (id: string): Promise<Job | undefined> => {
  try {
    const { data, error } = await supabase
      .from('job_postings')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching job by ID:', error);
      return staticJobs.find(job => job.id === id);
    }

    return {
      id: data.id,
      title: data.title,
      company: data.company,
      location: data.location,
      salary: data.salary,
      type: data.type as 'Full-time' | 'Part-time' | 'Contract' | 'Remote',
      posted: formatPostedDate(data.posted),
      description: data.description,
      responsibilities: data.responsibilities,
      requirements: data.requirements,
      benefits: data.benefits,
      logo: data.logo,
      featured: data.featured
    };
  } catch (error) {
    console.error('Error fetching job by ID:', error);
    return staticJobs.find(job => job.id === id);
  }
};

/**
 * Seeds the database with static job data
 */
export const seedJobs = async () => {
  try {
    const { error } = await supabase.from('job_postings').insert(
      staticJobs.map(job => ({
        title: job.title,
        company: job.company,
        location: job.location,
        salary: job.salary,
        type: job.type,
        description: job.description,
        responsibilities: job.responsibilities,
        requirements: job.requirements,
        benefits: job.benefits,
        logo: job.logo,
        featured: job.featured
      }))
    );

    if (error) throw error;
    console.log('Sample jobs seeded successfully');
  } catch (error) {
    console.error('Error seeding jobs:', error);
  }
};
