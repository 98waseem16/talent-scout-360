import { supabase } from '@/integrations/supabase/client';
import { Job } from '../../types/job.types';
import { staticJobs } from '../../data/staticJobs';
import { mapDatabaseFieldsToJob } from '../utils/jobMappers';

/**
 * Fetches all jobs from the database
 */
export const getJobs = async (): Promise<Job[]> => {
  try {
    console.log('Fetching jobs from database...');
    const { data, error } = await supabase
      .from('job_postings')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching jobs:', error);
      return staticJobs;
    }

    if (!data || data.length === 0) {
      console.log('No jobs found in database, returning static jobs');
      return staticJobs;
    }

    // Log first job data to debug with enhanced field checking
    if (data[0]) {
      console.log('DEBUG - Sample job from database - raw record:', data[0]);
      console.log('DEBUG - Raw seniority_level value:', data[0].seniority_level);
      console.log('DEBUG - Raw seniority_level type:', typeof data[0].seniority_level);
    }
    
    // Log entire job data for analysis
    console.log('DEBUG - All jobs field values for filtering:', data.map(job => ({
      id: job.id, 
      title: job.title,
      seniority_level: job.seniority_level,
      seniority_level_type: typeof job.seniority_level,
      department: job.department,
      department_type: typeof job.department,
      type: job.type,
      type_type: typeof job.type
    })));
    
    // Map database records to our frontend Job model with special care for string fields
    const jobs = data.map(record => {
      const mappedJob = mapDatabaseFieldsToJob(record);
      return mappedJob;
    }).filter(Boolean) as Job[]; // Filter out any null results

    // Log mapped jobs for debugging
    console.log(`Successfully mapped ${jobs.length} jobs from database`);
    if (jobs.length > 0) {
      console.log('DEBUG - Sample mapped job with all filter fields:', {
        id: jobs[0].id,
        title: jobs[0].title,
        department: `"${jobs[0].department}"`,
        seniority_level: `"${jobs[0].seniority_level}"`,
        type: `"${jobs[0].type}"`,
        salary_range: `"${jobs[0].salary_range}"`,
        team_size: `"${jobs[0].team_size}"`,
        investment_stage: `"${jobs[0].investment_stage}"`,
        remote_onsite: `"${jobs[0].remote_onsite}"`,
        work_hours: `"${jobs[0].work_hours}"`,
        equity: `"${jobs[0].equity}"`,
        hiring_urgency: `"${jobs[0].hiring_urgency}"`,
        revenue_model: `"${jobs[0].revenue_model}"`,
        visa_sponsorship: jobs[0].visa_sponsorship
      });
      
      // Check for jobs with senior in the title or seniority level
      const seniorJobs = jobs.filter(job => {
        const title = job.title.toLowerCase();
        const seniority = job.seniority_level.toLowerCase();
        return title.includes('senior') || seniority.includes('senior');
      });
      
      if (seniorJobs.length > 0) {
        console.log(`Found ${seniorJobs.length} jobs with Senior in title or seniority level:`, 
          seniorJobs.map(job => ({
            title: job.title,
            seniority_level: `"${job.seniority_level}"`,
            hasMatchingSeniority: job.seniority_level.toLowerCase().includes('senior')
          }))
        );
      }
    }
    
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
      .order('created_at', { ascending: false })
      .limit(3);

    if (error) {
      console.error('Error fetching trending jobs:', error);
      return staticJobs.filter(job => job.featured);
    }

    if (!data) {
      return staticJobs.filter(job => job.featured);
    }

    // Map database records to our frontend Job model
    const jobs = data.map(record => mapDatabaseFieldsToJob(record)).filter(Boolean) as Job[];
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
    console.log(`Fetching job with ID ${id} from database...`);
    const { data, error } = await supabase
      .from('job_postings')
      .select('*')
      .eq('id', id)
      .maybeSingle(); // Using maybeSingle() instead of single() to avoid errors when no job is found

    if (error) {
      console.error('Error fetching job by ID:', error);
      return staticJobs.find(job => job.id === id);
    }

    if (!data) {
      console.log(`No job found with ID ${id}, returning static job`);
      return staticJobs.find(job => job.id === id);
    }

    // Log the complete job data from database to verify all fields
    console.log('DEBUG - Job data from database - full record:', data);
    console.log('DEBUG - Raw seniority_level value:', data.seniority_level);
    console.log('DEBUG - Raw seniority_level type:', typeof data.seniority_level);
    
    // Map and return the job with all fields
    const mappedJob = mapDatabaseFieldsToJob(data);
    
    // Log mapped job with all filter fields
    console.log('DEBUG - Job after mapping - all filter fields:', {
      id: mappedJob?.id,
      title: mappedJob?.title,
      department: mappedJob?.department ? `"${mappedJob.department}"` : '""',
      seniority_level: mappedJob?.seniority_level ? `"${mappedJob.seniority_level}"` : '""',
      type: mappedJob?.type ? `"${mappedJob.type}"` : '""',
      salary_range: mappedJob?.salary_range ? `"${mappedJob.salary_range}"` : '""',
      team_size: mappedJob?.team_size ? `"${mappedJob.team_size}"` : '""',
      investment_stage: mappedJob?.investment_stage ? `"${mappedJob.investment_stage}"` : '""',
      remote_onsite: mappedJob?.remote_onsite ? `"${mappedJob.remote_onsite}"` : '""',
      work_hours: mappedJob?.work_hours ? `"${mappedJob.work_hours}"` : '""',
      equity: mappedJob?.equity ? `"${mappedJob.equity}"` : '""',
      hiring_urgency: mappedJob?.hiring_urgency ? `"${mappedJob.hiring_urgency}"` : '""',
      revenue_model: mappedJob?.revenue_model ? `"${mappedJob.revenue_model}"` : '""',
      visa_sponsorship: mappedJob?.visa_sponsorship
    });
    
    return mappedJob;
  } catch (error) {
    console.error('Error fetching job by ID:', error);
    return staticJobs.find(job => job.id === id);
  }
};
