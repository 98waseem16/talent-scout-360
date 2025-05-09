import { Job } from '../types/job.types';

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
