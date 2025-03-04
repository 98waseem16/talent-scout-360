
import React from 'react';
import Hero from '@/components/Hero';
import TrendingJobs from '@/components/TrendingJobs';
import { CheckCircle, Download, BarChart4 } from 'lucide-react';

const Index: React.FC = () => {
  const features = [
    {
      icon: <BarChart4 className="h-6 w-6 text-primary" />,
      title: 'AI-Powered Job Matching',
      description: 'Our intelligent algorithms match your skills and experience with the perfect job opportunities.'
    },
    {
      icon: <Download className="h-6 w-6 text-primary" />,
      title: 'One-Click Applications',
      description: 'Apply to jobs with a single click using your saved profile and resume.'
    },
    {
      icon: <CheckCircle className="h-6 w-6 text-primary" />,
      title: 'Verified Employers',
      description: 'All companies on our platform are verified to ensure legitimate job opportunities.'
    }
  ];

  return (
    <main className="min-h-screen pt-16">
      <Hero />
      <TrendingJobs />
      
      {/* How It Works Section */}
      <section className="py-16 md:py-24 px-6 bg-secondary">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-medium mb-4">How Launchly Jobs Works</h2>
            <p className="text-muted-foreground text-lg">
              We've simplified the job search process to help you find and land your dream job.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="bg-white p-8 rounded-xl shadow-sm border border-border hover-scale"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-medium mb-3">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-16 md:py-24 px-6 relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/5 to-transparent" />
        <div className="max-w-7xl mx-auto relative">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-medium mb-4">Ready to find your next opportunity?</h2>
            <p className="text-muted-foreground text-lg mb-8">
              Join thousands of job seekers who have found their dream jobs through Launchly.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="/jobs" 
                className="bg-primary hover:bg-primary/90 text-white font-medium py-3 px-8 rounded-lg transition-colors smooth-transition"
              >
                Browse Jobs
              </a>
              <a 
                href="/post-job" 
                className="bg-white border border-primary text-primary hover:bg-primary/5 font-medium py-3 px-8 rounded-lg transition-colors smooth-transition"
              >
                Post a Job
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Index;
