import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { UserCircle, LogOut, Menu, X, Rocket, Briefcase, UserPlus } from 'lucide-react';

const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const { user, signOut } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

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
          
          {user ? (
            <div className="flex items-center gap-3">
              <Link to="/dashboard">
                <Button variant="ghost" size="sm" className="flex items-center gap-2">
                  <UserCircle className="h-5 w-5" />
                  Dashboard
                </Button>
              </Link>
              <Button
                variant="outline"
                size="sm"
                onClick={() => signOut()}
                className="flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/auth" className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors">
                <LogIn className="h-4 w-4" />
                Sign In
              </Link>
              <Link to="/auth">
                <Button className="flex items-center gap-2">
                  <UserPlus className="h-4 w-4" />
                  Create Account
                </Button>
              </Link>
            </div>
          )}
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
          
          {user ? (
            <>
              <Link 
                to="/dashboard"
                className="text-lg hover:text-primary transition-colors"
              >
                Dashboard
              </Link>
              <Button
                variant="outline"
                onClick={() => signOut()}
                className="flex items-center justify-center gap-2 mt-4"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </Button>
            </>
          ) : (
            <>
              <Link to="/auth" className="mt-4">
                <Button className="w-full flex items-center gap-2">
                  <UserPlus className="h-5 w-5" />
                  Create Account
                </Button>
              </Link>
              <Link to="/auth?signin=true" className="text-lg text-center hover:text-primary transition-colors">
                Already have an account? Sign In
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
