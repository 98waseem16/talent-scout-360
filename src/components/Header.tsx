
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { UserCircle, LogOut, Menu, X, Rocket, Briefcase, Home, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import NotCorporateLogo from '@/components/ui/NotCorporateLogo';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isCheckingAdmin, setIsCheckingAdmin] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut, isLoading } = useAuth();
  const [scrolled, setScrolled] = useState(false);

  // Check admin status
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) {
        setIsAdmin(false);
        setIsCheckingAdmin(false);
        return;
      }

      try {
        const { data, error } = await supabase.rpc('is_admin');
        
        if (error) {
          console.error('Error checking admin status:', error);
          setIsAdmin(false);
        } else {
          setIsAdmin(!!data);
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
      } finally {
        setIsCheckingAdmin(false);
      }
    };

    if (!isLoading) {
      checkAdminStatus();
    }
  }, [user, isLoading]);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  // Add scroll event listener to change header appearance
  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY;
      if (offset > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

  // Render authentication section based on auth state
  const renderAuthSection = (isMobile = false) => {
    if (isLoading) {
      return <Skeleton className={isMobile ? "h-10 w-full" : "h-10 w-24"} />;
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
      <Link to="/auth">
        <Button 
          variant="default" 
          className={isMobile ? "w-full" : ""}
        >
          Sign In
        </Button>
      </Link>
    );
  };

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled ? "bg-background/95 backdrop-blur-md shadow-sm py-2" : "bg-background/80 backdrop-blur-sm py-3"
      )}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="font-bold text-xl text-primary flex items-center gap-2">
          <span className="bg-primary text-white p-1.5 rounded-md">
            <NotCorporateLogo size={16} />
          </span>
          notCorporate
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link 
            to="/" 
            className={`text-sm font-medium transition-colors hover:text-primary ${
              location.pathname === '/' ? 'text-primary' : 'text-muted-foreground'
            }`}
          >
            <div className="flex items-center gap-1.5">
              <Home className="h-4 w-4" />
              <span>Home</span>
            </div>
          </Link>
          
          <Link 
            to="/jobs" 
            className={`text-sm font-medium transition-colors hover:text-primary ${
              location.pathname === '/jobs' ? 'text-primary' : 'text-muted-foreground'
            }`}
          >
            <div className="flex items-center gap-1.5">
              <Briefcase className="h-4 w-4" />
              <span>Browse Jobs</span>
            </div>
          </Link>
          
          <Link to="/post-job">
            <Button 
              variant="default" 
              size="sm"
              className="flex items-center gap-1.5 shadow-md hover:shadow-lg bg-gradient-to-r from-primary/90 to-primary"
            >
              <Rocket className="h-4 w-4" />
              Post a Job
            </Button>
          </Link>

          {/* Admin Dashboard Button - Desktop */}
          {user && isAdmin && !isCheckingAdmin && (
            <Link to="/admin">
              <Button 
                variant="destructive"
                size="sm"
                className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700"
              >
                <ShieldCheck className="h-4 w-4" />
                Admin
              </Button>
            </Link>
          )}
          
          <div className="flex items-center gap-3 ml-4 border-l pl-4 border-border">
            {renderAuthSection()}
          </div>
        </nav>

        {/* Mobile Menu Button */}
        <button className="md:hidden text-foreground p-1.5 rounded-md hover:bg-secondary" onClick={toggleMenu} aria-label="Toggle menu">
          {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Navigation */}
      <div
        className={cn(
          'fixed inset-0 bg-background/98 backdrop-blur-md z-40 pt-20 px-6 transition-transform duration-300 md:hidden',
          isMenuOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        <nav className="flex flex-col space-y-4">
          <Link 
            to="/" 
            className={`text-lg font-medium transition-colors px-3 py-2 rounded-md ${
              location.pathname === '/' ? 'bg-secondary text-primary' : 'text-foreground hover:bg-secondary/60'
            }`}
          >
            <div className="flex items-center gap-3">
              <Home className="h-5 w-5" />
              <span>Home</span>
            </div>
          </Link>
          
          <Link 
            to="/jobs" 
            className={`text-lg font-medium transition-colors px-3 py-2 rounded-md ${
              location.pathname === '/jobs' ? 'bg-secondary text-primary' : 'text-foreground hover:bg-secondary/60'
            }`}
          >
            <div className="flex items-center gap-3">
              <Briefcase className="h-5 w-5" />
              <span>Browse Jobs</span>
            </div>
          </Link>
          
          <Link to="/post-job" className="mt-2">
            <Button 
              className="w-full flex items-center justify-center gap-2 shadow-md hover:shadow-lg bg-gradient-to-r from-primary/90 to-primary"
            >
              <Rocket className="h-5 w-5" />
              Post a Startup Job
            </Button>
          </Link>

          {/* Admin Dashboard Button - Mobile */}
          {user && isAdmin && !isCheckingAdmin && (
            <Link to="/admin" className="mt-2">
              <Button 
                variant="destructive"
                className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700"
              >
                <ShieldCheck className="h-5 w-5" />
                Admin Dashboard
              </Button>
            </Link>
          )}
          
          <div className="flex flex-col space-y-3 pt-4 mt-2 border-t border-border">
            {renderAuthSection(true)}
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;
