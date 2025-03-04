
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin } from 'lucide-react';

const Hero: React.FC = () => {
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/jobs?query=${encodeURIComponent(query)}&location=${encodeURIComponent(location)}`);
  };

  return (
    <section className="relative min-h-[90vh] flex items-center pt-20 px-6">
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-blue-50 to-transparent" />
      
      <div className="max-w-7xl mx-auto w-full">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <div className="space-y-6 md:pe-6">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-medium tracking-tight text-balance">
              Find your next role at a fast-growing startup
            </h1>
            <p className="text-xl text-muted-foreground max-w-md">
              Discover thousands of startup job opportunities with companies disrupting industries and changing the world.
            </p>
            
            <form 
              onSubmit={handleSearch}
              className="bg-white shadow-lg rounded-2xl p-4 md:p-6 border border-border mt-8"
            >
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <div className="absolute left-3 top-3.5 text-muted-foreground">
                    <Search className="h-5 w-5" />
                  </div>
                  <input
                    type="text"
                    placeholder="Startup role or technology"
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-input focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                </div>
                
                <div className="flex-1 relative">
                  <div className="absolute left-3 top-3.5 text-muted-foreground">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <input
                    type="text"
                    placeholder="Location or Remote"
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-input focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="mt-4 flex flex-col sm:flex-row gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-primary hover:bg-primary/90 text-white font-medium py-3 px-6 rounded-lg transition-colors smooth-transition active:scale-[0.98]"
                >
                  Find Startup Jobs
                </button>
                
                <button
                  type="button"
                  onClick={() => navigate('/post-job')}
                  className="flex-1 bg-white border border-primary text-primary hover:bg-primary/5 font-medium py-3 px-6 rounded-lg transition-colors smooth-transition active:scale-[0.98]"
                >
                  Post a Startup Job
                </button>
              </div>
            </form>
          </div>
          
          <div className="hidden md:block relative">
            <div className="absolute top-0 right-0 -z-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
            <img 
              src="/placeholder.svg" 
              alt="Startup job search illustration" 
              className="max-w-full rounded-xl shadow-2xl"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
