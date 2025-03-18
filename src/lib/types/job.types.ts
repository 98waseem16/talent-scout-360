export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  type: string; // Changed from literal type union to accept any string
  posted: string;
  description: string;
  responsibilities: string[];
  requirements: string[];
  benefits: string[];
  logo: string;
  featured?: boolean;
  application_url: string;
  department?: string;
  seniority_level?: string;
  salary_range?: string;
  team_size?: string;
  investment_stage?: string;
  remote_onsite?: string;
  work_hours?: string;
  equity?: string;
  hiring_urgency?: string;
  revenue_model?: string;
  visa_sponsorship?: boolean;
}

export interface JobFormData {
  title: string;
  company: string;
  location?: string;
  type?: string;
  salary?: string;
  description?: string;
  responsibilities?: string[];
  requirements?: string[];
  benefits?: string[];
  logo?: string;
  featured?: boolean;
  application_url?: string;
  user_id: string;
  department?: string;
  seniority_level?: string;
  salary_range?: string;
  team_size?: string;
  investment_stage?: string;
  remote_onsite?: string;
  work_hours?: string;
  equity?: string;
  hiring_urgency?: string;
  revenue_model?: string;
  visa_sponsorship?: boolean;
}

export interface JobDatabaseFields {
  id?: string;
  title: string;
  company: string;
  location?: string;
  type?: string;
  salary?: string;
  posted?: string;
  description?: string;
  responsibilities?: string[];
  requirements?: string[];
  benefits?: string[];
  logo?: string;
  featured?: boolean;
  application_url?: string;
  user_id: string;
  department?: string;
  seniority_level?: string;
  salary_range?: string;
  team_size?: string;
  investment_stage?: string;
  remote_onsite?: string;
  work_hours?: string;
  equity?: string;
  hiring_urgency?: string;
  revenue_model?: string;
  visa_sponsorship?: boolean;
  created_at?: string;
}
