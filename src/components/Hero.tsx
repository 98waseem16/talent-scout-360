
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin } from 'lucide-react';
import { Button as MovingBorderButton } from '@/components/ui/moving-border';
import { useIsMobile } from '@/hooks/use-mobile';

const Hero: React.FC = () => {
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('');
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/jobs?query=${encodeURIComponent(query)}&location=${encodeURIComponent(location)}`);
  };

  return (
    <section className="relative min-h-[90vh] flex items-center pt-16 sm:pt-20 px-4 sm:px-6">
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-blue-50 to-transparent" />
      
      <div className="max-w-3xl mx-auto w-full text-center">
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-medium tracking-tight text-balance">
          Find your next role at a fast-growing startup
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground mx-auto mt-4 md:mt-6 max-w-2xl">
          Discover thousands of startup job opportunities with companies disrupting industries and changing the world.
        </p>
        
        <form 
          onSubmit={handleSearch}
          className="bg-white shadow-lg rounded-2xl p-4 sm:p-6 border border-border mt-6 md:mt-8"
        >
          <div className="flex flex-col gap-4">
            <div className="relative">
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
            
            <div className="relative">
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
          
          <div className="mt-4">
            <MovingBorderButton
              type="submit"
              containerClassName="w-full h-14"
              borderClassName="bg-[radial-gradient(#0EA5E9_40%,transparent_60%)]"
              className="bg-white border-primary/10 text-primary w-full h-full text-base font-medium"
            >
              Find Startup Jobs
            </MovingBorderButton>
          </div>
        </form>
      </div>
    </section>
  );
};

export default Hero;
