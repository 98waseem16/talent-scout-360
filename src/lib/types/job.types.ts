
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
}

export interface JobFormData {
  title: string;
  company: string;
  location: string;
  type: string;
  description: string;
  responsibilities?: string;
  requirements: string;
  benefits: string;
  logo: string;
  featured?: boolean;
  application_url: string;
  contact_email: string;
  salary: string;
  user_id?: string;
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
}
