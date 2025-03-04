
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Briefcase, Search, User, Menu, X } from 'lucide-react';

const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  
  // Close mobile menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { name: 'Jobs', path: '/jobs', icon: <Briefcase className="mr-2 h-4 w-4" /> },
    { name: 'Search', path: '/search', icon: <Search className="mr-2 h-4 w-4" /> },
    { name: 'Account', path: '/account', icon: <User className="mr-2 h-4 w-4" /> },
  ];

  return (
    <header 
      className={cn(
        "fixed top-0 left-0 right-0 z-50 py-4 px-6 transition-all duration-300 ease-in-out",
        isScrolled ? "bg-white/90 backdrop-blur-lg shadow-sm" : "bg-transparent"
      )}
    >
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link 
          to="/" 
          className="text-xl md:text-2xl font-medium flex items-center"
        >
          <span className="bg-primary text-white p-1 rounded mr-2">
            <Briefcase className="h-5 w-5" />
          </span>
          <span className="font-bold">Launchly</span>
          <span className="text-primary">Jobs</span>
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-1">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className={cn(
                "px-4 py-2 rounded-md flex items-center transition-all hover:bg-secondary",
                location.pathname === link.path ? "text-primary font-medium" : "text-foreground"
              )}
            >
              {link.icon}
              {link.name}
            </Link>
          ))}
        </nav>
        
        {/* Mobile Menu Toggle */}
        <button 
          className="md:hidden flex items-center text-foreground p-2"
          onClick={toggleMenu}
          aria-label="Toggle Menu"
        >
          {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>
      
      {/* Mobile Navigation */}
      <div 
        className={cn(
          "md:hidden absolute top-full left-0 right-0 bg-white/95 backdrop-blur-lg shadow-lg transition-all duration-300 ease-in-out overflow-hidden px-6",
          isMenuOpen ? "max-h-60 py-4" : "max-h-0 py-0"
        )}
      >
        <nav className="flex flex-col space-y-2">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className={cn(
                "px-4 py-3 rounded-md flex items-center transition-all hover:bg-secondary",
                location.pathname === link.path ? "text-primary font-medium" : "text-foreground"
              )}
            >
              {link.icon}
              {link.name}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
};

export default Header;
