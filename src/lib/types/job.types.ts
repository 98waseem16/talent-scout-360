
export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  type: 'Full-time' | 'Part-time' | 'Contract' | 'Remote' | 'Freelance' | 'Internship';
  posted: string;
  description: string;
  responsibilities: string[];
  requirements: string[];
  benefits: string[];
  logo: string;
  featured?: boolean;
  application_url: string;
  user_id?: string;
  investment_stage?: string;
  team_size?: string;
  revenue_model?: string;
  department?: string;
  seniority_level?: string;
  salary_range?: string;
  equity?: string;
  remote_onsite?: string;
  work_hours?: string;
  visa_sponsorship?: boolean;
  hiring_urgency?: string;
  job_type?: string;  // Added this for backward compatibility
  is_draft?: boolean; // Added for draft status
  source_url?: string; // Added for tracking scraped jobs
  scraped_at?: string; // Added for tracking when job was scraped
  scraping_job_id?: string; // Added for linking to scraping job
  expires_at?: string; // Added for job expiration
  is_expired?: boolean; // Added for job expiration status
}

export interface JobFormData {
  title: string;
  company: string;
  location: string;
  type: string;
  description: string;
  responsibilities: string[];
  requirements: string[];
  benefits: string[];
  logo: string;
  featured?: boolean;
  application_url: string;
  contact_email?: string;
  salary: string;
  user_id?: string;
  investment_stage?: string;
  team_size?: string;
  revenue_model?: string;
  department?: string;
  seniority_level?: string;
  salary_range?: string;
  equity?: string;
  remote_onsite?: string;
  work_hours?: string;
  visa_sponsorship?: boolean;
  hiring_urgency?: string;
  is_draft?: boolean; // Added for draft status
  source_url?: string; // Added for tracking scraped jobs
  expires_at?: string; // Added for job expiration
  is_expired?: boolean; // Added for job expiration status
}

export interface JobDatabaseFields {
  id?: string;
  title: string;
  company: string;
  location: string;
  type: string;
  salary: string;
  description: string;
  requirements: string[];
  benefits: string[];
  responsibilities: string[];
  logo: string;
  featured: boolean;
  application_url: string;
  user_id?: string;
  posted?: string;
  created_at?: string;
  updated_at?: string;
  investment_stage?: string;
  team_size?: string;
  revenue_model?: string;
  department?: string;
  seniority_level?: string;
  salary_range?: string;
  equity?: string;
  remote_onsite?: string;
  work_hours?: string;
  visa_sponsorship?: boolean;
  hiring_urgency?: string;
  is_draft?: boolean; // Added for draft status
  source_url?: string; // Added for tracking scraped jobs
  scraped_at?: string; // Added for tracking when job was scraped
  scraping_job_id?: string; // Added for linking to scraping job
  expires_at: string; // Made required to match database schema
  is_expired: boolean; // Made required to match database schema
}
