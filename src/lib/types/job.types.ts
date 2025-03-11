
export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  type: 'Full-time' | 'Part-time' | 'Contract' | 'Remote';
  posted: string;
  description: string;
  responsibilities: string[];
  requirements: string[];
  benefits: string[];
  logo: string;
  featured?: boolean;
  user_id?: string;
  investment_stage?: string;
  team_size?: string;
  revenue_model?: string;
  department?: string;
  seniority_level?: string;
  job_type?: string;
  salary_range?: string;
  equity?: string;
  remote_onsite?: string;
  work_hours?: string;
  visa_sponsorship?: boolean;
  hiring_urgency?: string;
  application_url: string; // Added required field
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
  application_url: string; // Added required field
  contact_email?: string;
  salary: string;
  user_id?: string;
  investment_stage?: string;
  team_size?: string;
  revenue_model?: string;
  department?: string;
  seniority_level?: string;
  job_type?: string;
  salary_range?: string;
  equity?: string;
  remote_onsite?: string;
  work_hours?: string;
  visa_sponsorship?: boolean;
  hiring_urgency?: string;
}

// Define a type mapping our frontend model to the database schema
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
  user_id?: string;
  posted?: string;
  created_at?: string;
  updated_at?: string;
  investment_stage?: string;
  team_size?: string;
  revenue_model?: string;
  department?: string;
  seniority_level?: string;
  job_type?: string;
  salary_range?: string;
  equity?: string;
  remote_onsite?: string;
  work_hours?: string;
  visa_sponsorship?: boolean;
  hiring_urgency?: string;
}
