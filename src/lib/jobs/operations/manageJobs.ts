
import { supabase } from '@/integrations/supabase/client';
import { JobFormData, JobDatabaseFields } from '../../types/job.types';

/**
 * Creates a new job posting with automatic expiration date
 */
export const createJob = async (jobData: JobFormData): Promise<{ success: boolean; id?: string; error?: string }> => {
  try {
    // Prepare the job data for insertion with expiration date
    const jobRecord: Omit<JobDatabaseFields, 'id' | 'created_at' | 'updated_at'> = {
      title: jobData.title,
      company: jobData.company,
      location: jobData.location,
      type: jobData.type,
      salary: jobData.salary,
      description: jobData.description,
      requirements: jobData.requirements,
      benefits: jobData.benefits,
      responsibilities: jobData.responsibilities,
      logo: jobData.logo,
      featured: jobData.featured || false,
      application_url: jobData.application_url,
      user_id: jobData.user_id,
      investment_stage: jobData.investment_stage,
      team_size: jobData.team_size,
      revenue_model: jobData.revenue_model,
      department: jobData.department,
      seniority_level: jobData.seniority_level,
      salary_range: jobData.salary_range,
      equity: jobData.equity,
      remote_onsite: jobData.remote_onsite,
      work_hours: jobData.work_hours,
      visa_sponsorship: jobData.visa_sponsorship,
      hiring_urgency: jobData.hiring_urgency,
      is_draft: jobData.is_draft || false,
      source_url: jobData.source_url
    };

    // Insert the job record - expires_at will be automatically set by database trigger/function
    const { data, error } = await supabase
      .from('job_postings')
      .insert([jobRecord])
      .select('id')
      .single();

    if (error) {
      console.error('Error creating job:', error);
      return { success: false, error: error.message };
    }

    console.log('Job created successfully with ID:', data.id);
    return { success: true, id: data.id };
  } catch (error) {
    console.error('Error creating job:', error);
    return { success: false, error: 'Failed to create job' };
  }
};

/**
 * Updates an existing job posting
 */
export const updateJob = async (
  jobId: string, 
  jobData: Partial<JobFormData>
): Promise<{ success: boolean; error?: string }> => {
  try {
    // Prepare the update data
    const updateData: Partial<JobDatabaseFields> = {
      ...(jobData.title && { title: jobData.title }),
      ...(jobData.company && { company: jobData.company }),
      ...(jobData.location && { location: jobData.location }),
      ...(jobData.type && { type: jobData.type }),
      ...(jobData.salary && { salary: jobData.salary }),
      ...(jobData.description && { description: jobData.description }),
      ...(jobData.requirements && { requirements: jobData.requirements }),
      ...(jobData.benefits && { benefits: jobData.benefits }),
      ...(jobData.responsibilities && { responsibilities: jobData.responsibilities }),
      ...(jobData.logo && { logo: jobData.logo }),
      ...(jobData.featured !== undefined && { featured: jobData.featured }),
      ...(jobData.application_url && { application_url: jobData.application_url }),
      ...(jobData.investment_stage && { investment_stage: jobData.investment_stage }),
      ...(jobData.team_size && { team_size: jobData.team_size }),
      ...(jobData.revenue_model && { revenue_model: jobData.revenue_model }),
      ...(jobData.department && { department: jobData.department }),
      ...(jobData.seniority_level && { seniority_level: jobData.seniority_level }),
      ...(jobData.salary_range && { salary_range: jobData.salary_range }),
      ...(jobData.equity && { equity: jobData.equity }),
      ...(jobData.remote_onsite && { remote_onsite: jobData.remote_onsite }),
      ...(jobData.work_hours && { work_hours: jobData.work_hours }),
      ...(jobData.visa_sponsorship !== undefined && { visa_sponsorship: jobData.visa_sponsorship }),
      ...(jobData.hiring_urgency && { hiring_urgency: jobData.hiring_urgency }),
      ...(jobData.is_draft !== undefined && { is_draft: jobData.is_draft }),
      updated_at: new Date().toISOString()
    };

    const { error } = await supabase
      .from('job_postings')
      .update(updateData)
      .eq('id', jobId);

    if (error) {
      console.error('Error updating job:', error);
      return { success: false, error: error.message };
    }

    console.log('Job updated successfully');
    return { success: true };
  } catch (error) {
    console.error('Error updating job:', error);
    return { success: false, error: 'Failed to update job' };
  }
};

/**
 * Deletes a job posting
 */
export const deleteJob = async (jobId: string): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase
      .from('job_postings')
      .delete()
      .eq('id', jobId);

    if (error) {
      console.error('Error deleting job:', error);
      return { success: false, error: error.message };
    }

    console.log('Job deleted successfully');
    return { success: true };
  } catch (error) {
    console.error('Error deleting job:', error);
    return { success: false, error: 'Failed to delete job' };
  }
};

/**
 * Seeds the database with static job data (for development/testing)
 */
export const seedJobs = async (): Promise<{ success: boolean; error?: string }> => {
  try {
    // Import static jobs data
    const { staticJobs } = await import('../../data/staticJobs');
    
    // Transform static jobs to database format
    const jobRecords = staticJobs.map(job => ({
      id: job.id,
      title: job.title,
      company: job.company,
      location: job.location,
      type: job.type,
      salary: job.salary,
      description: job.description,
      requirements: job.requirements,
      benefits: job.benefits,
      responsibilities: job.responsibilities,
      logo: job.logo,
      featured: job.featured || false,
      application_url: job.application_url,
      investment_stage: job.investment_stage,
      team_size: job.team_size,
      revenue_model: job.revenue_model,
      department: job.department,
      seniority_level: job.seniority_level,
      salary_range: job.salary_range,
      equity: job.equity,
      remote_onsite: job.remote_onsite,
      work_hours: job.work_hours,
      visa_sponsorship: job.visa_sponsorship,
      hiring_urgency: job.hiring_urgency,
      is_draft: job.is_draft || false,
      source_url: job.source_url
    }));

    const { error } = await supabase
      .from('job_postings')
      .upsert(jobRecords, { onConflict: 'id' });

    if (error) {
      console.error('Error seeding jobs:', error);
      return { success: false, error: error.message };
    }

    console.log(`Successfully seeded ${jobRecords.length} jobs`);
    return { success: true };
  } catch (error) {
    console.error('Error seeding jobs:', error);
    return { success: false, error: 'Failed to seed jobs' };
  }
};
