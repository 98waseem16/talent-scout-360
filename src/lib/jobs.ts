import { supabase } from '@/integrations/supabase/client';
import { uploadFile } from './file-upload';

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  salary_range?: string;
  type: 'Full-time' | 'Part-time' | 'Contract' | 'Remote' | 'Freelance' | 'Internship';
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
  team_size?: string;
  investment_stage?: string;
  remote_onsite?: string;
  work_hours?: string;
  equity?: string;
  hiring_urgency?: string;
  revenue_model?: string;
  visa_sponsorship?: boolean;
  expires_at: string;
}

export const staticJobs: Job[] = [
  {
    id: '1',
    title: 'Senior Frontend Developer',
    company: 'TechVision',
    location: 'San Francisco, CA',
    salary: '$120,000 - $150,000',
    type: 'Full-time',
    posted: '2 days ago',
    description: 'TechVision is looking for a Senior Frontend Developer to join our growing team. You will be responsible for building and maintaining high-quality user interfaces for our web applications.',
    responsibilities: [
      'Develop and implement user interface components using React.js',
      'Optimize applications for maximum speed and scalability',
      'Collaborate with the design team to implement visual elements',
      'Write unit and integration tests for your code'
    ],
    requirements: [
      '5+ years of experience with JavaScript and front-end frameworks',
      'Proficient understanding of React.js and its core principles',
      'Experience with responsive design and CSS frameworks',
      'Familiarity with RESTful APIs and modern front-end build pipelines'
    ],
    benefits: [
      'Competitive salary and equity package',
      'Comprehensive health, dental, and vision insurance',
      'Flexible work hours and remote work options',
      'Professional development budget'
    ],
    logo: '/placeholder.svg',
    featured: true,
    application_url: 'https://techvision.com/careers/senior-frontend-developer'
  },
  {
    id: '2',
    title: 'Product Designer',
    company: 'DesignPulse',
    location: 'Remote',
    salary: '$90,000 - $120,000',
    type: 'Remote',
    posted: '1 week ago',
    description: 'DesignPulse is seeking a talented Product Designer to create stunning user experiences for our digital products. You will collaborate with product managers and engineers to design functional and visually appealing interfaces.',
    responsibilities: [
      'Create wireframes, prototypes, and high-fidelity mockups',
      'Conduct user research and usability testing',
      'Collaborate with engineers to implement designs',
      'Maintain and evolve our design system'
    ],
    requirements: [
      '3+ years of experience in UI/UX design',
      'Proficiency with design tools like Figma or Sketch',
      'Portfolio showcasing your design process and solutions',
      'Understanding of design principles and user-centered design'
    ],
    benefits: [
      'Completely remote work environment',
      'Flexible working hours',
      'Health insurance and wellness programs',
      'Annual company retreats'
    ],
    logo: '/placeholder.svg',
    featured: true,
    application_url: 'https://designpulse.com/careers/product-designer'
  },
  {
    id: '3',
    title: 'Full Stack Engineer',
    company: 'GrowthLabs',
    location: 'New York, NY',
    salary: '$130,000 - $160,000',
    type: 'Full-time',
    posted: '3 days ago',
    description: 'GrowthLabs is looking for a Full Stack Engineer to help build and scale our marketing technology platform. You will work on both the frontend and backend of our applications.',
    responsibilities: [
      'Design and implement features across the entire stack',
      'Build efficient and reusable front-end systems',
      'Work with APIs and improve back-end performance',
      'Collaborate with cross-functional teams'
    ],
    requirements: [
      '4+ years of experience with full stack development',
      'Proficient in JavaScript/TypeScript, React, and Node.js',
      'Experience with SQL and NoSQL databases',
      'Knowledge of cloud services (AWS, GCP, or Azure)'
    ],
    benefits: [
      'Competitive compensation package',
      'Stock options and 401(k) matching',
      'Unlimited PTO policy',
      'Home office stipend and coworking allowance'
    ],
    logo: '/placeholder.svg',
    application_url: 'https://growthlabs.com/careers/full-stack-engineer'
  },
  {
    id: '4',
    title: 'Marketing Manager',
    company: 'BrandElevate',
    location: 'Los Angeles, CA',
    salary: '$85,000 - $105,000',
    type: 'Full-time',
    posted: '5 days ago',
    description: 'BrandElevate is seeking a Marketing Manager to lead our digital marketing efforts. You will be responsible for developing and implementing marketing strategies to increase brand awareness and drive customer acquisition.',
    responsibilities: [
      'Develop and execute marketing campaigns across multiple channels',
      'Manage social media strategy and content calendar',
      'Analyze campaign performance and optimize based on data',
      'Collaborate with content and design teams'
    ],
    requirements: [
      '3+ years of experience in digital marketing',
      'Proficiency with marketing analytics tools',
      'Experience with paid advertising platforms',
      'Strong written and verbal communication skills'
    ],
    benefits: [
      'Competitive salary and bonus structure',
      'Comprehensive benefits package',
      'Professional development opportunities',
      'Hybrid work model (3 days in office, 2 days remote)'
    ],
    logo: '/placeholder.svg',
    application_url: 'https://brandelevate.com/careers/marketing-manager'
  },
  {
    id: '5',
    title: 'DevOps Engineer',
    company: 'CloudNative',
    location: 'Remote',
    salary: '$110,000 - $140,000',
    type: 'Remote',
    posted: '1 day ago',
    description: 'CloudNative is looking for a DevOps Engineer to help automate and optimize our infrastructure. You will work on building and maintaining scalable and secure systems.',
    responsibilities: [
      'Design and implement CI/CD pipelines',
      'Manage cloud infrastructure using Infrastructure as Code',
      'Optimize application performance and reliability',
      'Implement security best practices'
    ],
    requirements: [
      '3+ years of experience in DevOps or SRE roles',
      'Proficiency with cloud platforms (AWS, GCP, or Azure)',
      'Experience with containerization and orchestration tools',
      'Knowledge of monitoring and observability solutions'
    ],
    benefits: [
      'Competitive salary and equity',
      'Remote-first culture with flexible hours',
      'Home office setup allowance',
      'Learning and development budget'
    ],
    logo: '/placeholder.svg',
    featured: true,
    application_url: 'https://cloudnative.com/careers/devops-engineer'
  },
  {
    id: '6',
    title: 'Data Scientist',
    company: 'AnalyticaAI',
    location: 'Boston, MA',
    salary: '$125,000 - $155,000',
    type: 'Full-time',
    posted: '1 week ago',
    description: 'AnalyticaAI is seeking a Data Scientist to join our research team. You will apply statistical and machine learning techniques to solve complex business problems.',
    responsibilities: [
      'Develop and implement machine learning models',
      'Analyze large datasets to extract insights',
      'Collaborate with engineering team to deploy models to production',
      'Communicate findings to stakeholders'
    ],
    requirements: [
      'Master\'s or PhD in a quantitative field',
      'Experience with Python, R, and data science libraries',
      'Knowledge of machine learning algorithms and techniques',
      'Strong problem-solving and analytical skills'
    ],
    benefits: [
      'Competitive compensation package',
      'Health, dental, and vision insurance',
      'Flexible work arrangements',
      'Continuing education assistance'
    ],
    logo: '/placeholder.svg',
    featured: true,
    application_url: 'https://analyticaai.com/careers/data-scientist'
  }
];

const formatPostedDate = (postedDate: string): string => {
  const now = new Date();
  const posted = new Date(postedDate);
  const diffTime = Math.abs(now.getTime() - posted.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) {
    return 'Today';
  } else if (diffDays === 1) {
    return '1 day ago';
  } else if (diffDays < 7) {
    return `${diffDays} days ago`;
  } else if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return weeks === 1 ? '1 week ago' : `${weeks} weeks ago`;
  } else {
    const months = Math.floor(diffDays / 30);
    return months === 1 ? '1 month ago' : `${months} months ago`;
  }
};

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
      featured: job.featured,
      application_url: job.application_url || '',
      expires_at: job.expires_at || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    }));

    return jobs;
  } catch (error) {
    console.error('Error fetching jobs:', error);
    return staticJobs;
  }
};

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
      featured: job.featured,
      application_url: job.application_url || '',
      expires_at: job.expires_at || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    }));

    return jobs;
  } catch (error) {
    console.error('Error fetching trending jobs:', error);
    return staticJobs.filter(job => job.featured);
  }
};

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
      featured: data.featured,
      application_url: data.application_url || '',
      expires_at: data.expires_at || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    };
  } catch (error) {
    console.error('Error fetching job by ID:', error);
    return staticJobs.find(job => job.id === id);
  }
};

export const uploadCompanyLogo = async (file: File): Promise<string> => {
  try {
    console.log('Starting logo upload process:', file.name, file.type, file.size);
    
    // Validate file is an image
    if (!file.type.startsWith('image/')) {
      throw new Error('Invalid logo format. Please upload an image file.');
    }
    
    // Validate file size (max 2MB)
    const maxSizeInBytes = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSizeInBytes) {
      throw new Error('Logo file is too large. Maximum size is 2MB.');
    }
    
    // Get the current user session to ensure we're authenticated
    const { data: sessionData } = await supabase.auth.getSession();
    
    if (!sessionData.session) {
      throw new Error('Authentication required to upload logos. Please sign in.');
    }
    
    // Generate a unique filename with timestamp and sanitized original name
    const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9_.]/g, '')}`;
    console.log('Generated file name for storage:', fileName);
    
    // Attempt to upload the file
    console.log('Attempting to upload logo to Supabase storage...');
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('logos')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true, // Use upsert true to overwrite if file exists
      });
      
    if (uploadError) {
      console.error('Supabase storage upload error:', uploadError);
      console.log('Error details:', JSON.stringify(uploadError, null, 2));
      
      // Detailed error handling
      if (uploadError.message.includes('bucket') || uploadError.message.includes('Bucket')) {
        throw new Error(`Storage bucket not properly configured: ${uploadError.message}`);
      }
      
      if (uploadError.message.includes('permission') || uploadError.message.includes('auth')) {
        throw new Error(`Permission denied when uploading logo: ${uploadError.message}. Make sure you're signed in.`);
      }
      
      if (uploadError.message.includes('policy')) {
        throw new Error(`Storage policy error: ${uploadError.message}. Please contact support.`);
      }
      
      // Generic error with message
      throw new Error(`Error uploading logo: ${uploadError.message}`);
    }
    
    if (!uploadData || !uploadData.path) {
      throw new Error('Upload failed: No file data returned');
    }
    
    // Get public URL
    const { data: urlData } = supabase.storage
      .from('logos')
      .getPublicUrl(fileName);
      
    if (!urlData || !urlData.publicUrl) {
      throw new Error('Failed to get public URL for uploaded logo');
    }
    
    console.log('Logo upload successful, public URL:', urlData.publicUrl);
    return urlData.publicUrl;
  } catch (error: any) {
    console.error('Error in uploadCompanyLogo function:', error);
    console.log('Full error object:', JSON.stringify(error, null, 2));
    
    // Provide a user-friendly error message
    if (error instanceof Error) {
      throw error;
    } else if (typeof error === 'object') {
      throw new Error(error.message || 'Unknown upload error');
    } else {
      throw new Error(String(error) || 'Unknown upload error');
    }
  }
};

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
        featured: job.featured,
        application_url: job.application_url,
        expires_at: job.expires_at || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      }))
    );

    if (error) throw error;
    console.log('Sample jobs seeded successfully');
  } catch (error) {
    console.error('Error seeding jobs:', error);
  }
};
