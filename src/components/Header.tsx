
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { UserCircle, LogOut, Menu, X, Rocket, Briefcase, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';

const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut, isLoading, resetState } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success("Successfully signed out");
      navigate('/', { replace: true });
    } catch (error) {
      console.error("Sign out error:", error);
      toast.error("Failed to sign out. Please try again.");
    }
  };

  const handleResetState = () => {
    resetState();
    toast.success("Session has been reset");
  };

  // Render authentication section based on auth state
  const renderAuthSection = (isMobile = false) => {
    if (isLoading) {
      return (
        <>
          <Skeleton className={isMobile ? "h-10 w-full mb-3" : "h-10 w-24"} />
          <Button 
            variant="destructive" 
            size={isMobile ? "default" : "sm"} 
            onClick={handleResetState}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Reset Session
          </Button>
        </>
      );
    }
    
    if (user) {
      return (
        <>
          <Link to="/dashboard">
            <Button variant="ghost" size={isMobile ? "default" : "sm"} className="flex items-center gap-2">
              <UserCircle className="h-5 w-5" />
              Dashboard
            </Button>
          </Link>
          <Button
            variant="outline"
            size={isMobile ? "default" : "sm"}
            onClick={handleSignOut}
            className="flex items-center gap-2"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </>
      );
    }
    
    return (
      <>
        <Link to="/auth">
          <Button 
            variant="default" 
            className={isMobile ? "w-full mb-3" : "ml-4"}
          >
            Sign In
          </Button>
        </Link>
        <Button 
          variant="destructive" 
          size={isMobile ? "default" : "sm"} 
          onClick={handleResetState}
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Reset Session
        </Button>
      </>
    );
  };

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        isScrolled ? 'bg-white shadow-md py-3' : 'bg-transparent py-5'
      )}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="font-bold text-2xl text-primary flex items-center">
          <span className="bg-primary text-white p-1 rounded mr-2">
            <Briefcase className="h-5 w-5" />
          </span>
          Launchly
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <Link to="/post-job">
            <Button 
              variant="default" 
              className="flex items-center gap-2 animate-pulse hover:animate-none shadow-lg hover:shadow-xl bg-gradient-to-r from-primary/90 to-primary"
            >
              <Rocket className="h-5 w-5" />
              Post a Startup Job
            </Button>
          </Link>
          
          <div className="flex items-center gap-3">
            {renderAuthSection()}
          </div>
        </nav>

        {/* Mobile Menu Button */}
        <button className="md:hidden text-foreground" onClick={toggleMenu}>
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Navigation */}
      <div
        className={cn(
          'fixed inset-0 bg-white z-40 pt-24 px-6 transition-transform duration-300 md:hidden',
          isMenuOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        <nav className="flex flex-col space-y-6">
          <Link to="/post-job" className="mt-4">
            <Button 
              className="w-full flex items-center justify-center gap-2 animate-pulse hover:animate-none shadow-md hover:shadow-lg bg-gradient-to-r from-primary/90 to-primary"
            >
              <Rocket className="h-5 w-5" />
              Post a Startup Job
            </Button>
          </Link>
          
          <div className="flex flex-col space-y-4">
            {renderAuthSection(true)}
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;
