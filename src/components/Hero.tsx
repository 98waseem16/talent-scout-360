
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
    
    // Build search params
    const searchParams = new URLSearchParams();
    if (query.trim()) searchParams.set('query', query.trim());
    if (location.trim()) searchParams.set('location', location.trim());
    
    // Navigate with proper URL encoding
    const searchString = searchParams.toString();
    const url = searchString ? `/jobs?${searchString}` : '/jobs';
    navigate(url);
  };

  return (
    <section className="relative min-h-[90vh] flex items-center pt-16 sm:pt-20 px-4 sm:px-6 overflow-hidden">
      {/* Enhanced background with layered gradients and animated shapes */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-50/90 via-purple-50/60 to-transparent"></div>
        <div className="absolute top-20 right-10 w-64 h-64 rounded-full bg-gradient-to-br from-purple-200/30 to-blue-200/30 blur-3xl"></div>
        <div className="absolute bottom-10 left-10 w-72 h-72 rounded-full bg-gradient-to-tr from-orange-200/20 to-pink-200/20 blur-3xl"></div>
      </div>
      
      {/* Animated floating elements */}
      <div className="absolute top-1/4 left-1/4 w-6 h-6 rounded-full bg-primary/30 animate-pulse" style={{ animationDelay: '0.5s' }}></div>
      <div className="absolute top-1/3 right-1/4 w-4 h-4 rounded-full bg-destructive/20 animate-pulse" style={{ animationDelay: '1.2s' }}></div>
      <div className="absolute bottom-1/3 right-1/3 w-8 h-8 rounded-full bg-orange-400/20 animate-pulse" style={{ animationDelay: '0.8s' }}></div>
      
      <div className="max-w-3xl mx-auto w-full text-center relative">
        {/* Main content with improved typography and animations */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-medium tracking-tight text-balance animate-fade-in">
          Find your next role at a 
          <span className="bg-gradient-to-r from-primary to-destructive bg-clip-text text-transparent"> fast-growing startup</span>
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground mx-auto mt-4 md:mt-6 max-w-2xl animate-fade-in" style={{animationDelay: '0.2s'}}>
          Discover thousands of startup job opportunities with companies disrupting industries and changing the world.
        </p>
        
        <form 
          onSubmit={handleSearch}
          className="bg-white/80 backdrop-blur-sm shadow-lg rounded-2xl p-4 sm:p-6 border border-border mt-6 md:mt-8 animate-fade-in transition-all hover:shadow-xl"
          style={{animationDelay: '0.4s'}}
        >
          <div className="flex flex-col gap-4">
            <div className="relative">
              <div className="absolute left-3 top-3.5 text-primary">
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
              <div className="absolute left-3 top-3.5 text-primary">
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
              className="bg-gradient-to-r from-primary/90 to-primary border-primary/10 text-white w-full h-full text-base font-medium hover:shadow-lg transition-all"
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

