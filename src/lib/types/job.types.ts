
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
  location: string; // Changed from optional to required
  type: string; // Changed from optional to required
  salary: string; // Changed from optional to required
  description: string; // Changed from optional to required
  responsibilities: string[]; // Changed from optional to required
  requirements: string[]; // Changed from optional to required
  benefits: string[]; // Changed from optional to required
  logo: string; // Changed from optional to required
  featured?: boolean;
  application_url: string; // Changed from optional to required
  user_id?: string; // Changed from required to optional for initialization
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
  location: string; // Changed from optional to required
  type: string; // Changed from optional to required
  salary: string; // Changed from optional to required
  posted?: string;
  description: string; // Changed from optional to required
  responsibilities: string[]; // Changed from optional to required
  requirements: string[]; // Changed from optional to required
  benefits: string[]; // Changed from optional to required
  logo: string; // Changed from optional to required
  featured?: boolean;
  application_url: string; // Changed from optional to required
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
