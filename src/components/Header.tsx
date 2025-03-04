
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { UserCircle, LogOut, Menu, X, Rocket, Briefcase, UserPlus, LogIn } from 'lucide-react';

const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const handlePostJob = () => {
    navigate('/post-job');
  };

  const handleSignOut = async () => {
    try {
      const success = await signOut();
      if (success) {
        navigate('/');
      }
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        isScrolled ? 'bg-white shadow-md py-3' : 'bg-transparent py-5'
      )}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <Link to="/" className="font-bold text-2xl text-primary flex items-center">
          <span className="bg-primary text-white p-1 rounded mr-2">
            <Briefcase className="h-5 w-5" />
          </span>
          Launchly
        </Link>

        <nav className="hidden md:flex items-center space-x-8">
          <Button 
            variant="default" 
            className="flex items-center gap-2 animate-pulse hover:animate-none shadow-lg hover:shadow-xl bg-gradient-to-r from-primary/90 to-primary"
            onClick={handlePostJob}
          >
            <Rocket className="h-5 w-5" />
            Post a Startup Job
          </Button>
          
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
                onClick={handleSignOut}
                className="flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/auth">
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <LogIn className="h-4 w-4" />
                  Sign In
                </Button>
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

        <button className="md:hidden text-foreground" onClick={toggleMenu}>
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <div
        className={cn(
          'fixed inset-0 bg-white z-40 pt-24 px-6 transition-transform duration-300 md:hidden',
          isMenuOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        <nav className="flex flex-col space-y-6">
          <Button 
            className="w-full flex items-center justify-center gap-2 animate-pulse hover:animate-none shadow-md hover:shadow-lg bg-gradient-to-r from-primary/90 to-primary"
            onClick={handlePostJob}
          >
            <Rocket className="h-5 w-5" />
            Post a Startup Job
          </Button>
          
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
                onClick={handleSignOut}
                className="flex items-center justify-center gap-2 mt-4"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </Button>
            </>
          ) : (
            <>
              <Link to="/auth">
                <Button className="w-full flex items-center gap-2">
                  <UserPlus className="h-5 w-5" />
                  Create Account
                </Button>
              </Link>
              <Link to="/auth" className="text-lg text-center hover:text-primary transition-colors">
                <Button variant="outline" className="w-full flex items-center gap-2">
                  <LogIn className="h-4 w-4" />
                  Sign In
                </Button>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
