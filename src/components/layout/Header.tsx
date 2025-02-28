
import { NavLink, useNavigate } from 'react-router-dom';
import { LogIn, LogOut, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { usePrivy } from '@privy-io/react-auth';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const { login: privyLogin, authenticated } = usePrivy();
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (isMenuOpen && !target.closest('.mobile-menu') && !target.closest('.menu-button')) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  // Close menu when navigating
  useEffect(() => {
    return () => {
      setIsMenuOpen(false);
    };
  }, [navigate]);

  const handleAuthAction = async () => {
    if (authenticated) {
      await logout();
      navigate('/');
    } else {
      privyLogin();
    }
  };

  return (
    <header 
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300 py-3 md:py-4 px-4 md:px-6 lg:px-10',
        isScrolled ? 'glass-morphism shadow-md' : 'bg-transparent'
      )}
    >
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo */}
        <NavLink 
          to="/" 
          className="flex items-center gap-1 md:gap-2 font-bold text-lg md:text-xl lg:text-2xl"
        >
          <img 
            src="/lovable-uploads/3c0d4a69-03a7-4f9f-b704-73bcc535ddef.png" 
            alt="AI Marketplace Logo" 
            className="h-7 md:h-8 lg:h-10"
          />
          <span className="text-gradient">AI Marketplace</span>
        </NavLink>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <NavLink
            to="/leaderboard"
            className={({ isActive }) => cn(
              'px-3 py-1.5 rounded-full transition-all duration-300',
              isActive 
                ? 'text-primary font-medium bg-primary/10'
                : 'text-foreground/80 hover:text-foreground hover:bg-foreground/5'
            )}
          >
            Leaderboard
          </NavLink>
          
          <NavLink
            to="/contribute"
            className={({ isActive }) => cn(
              'px-3 py-1.5 rounded-full transition-all duration-300',
              isActive 
                ? 'text-primary font-medium bg-primary/10'
                : 'text-foreground/80 hover:text-foreground hover:bg-foreground/5'
            )}
          >
            Contribute
          </NavLink>
          
          <NavLink
            to="/request"
            className={({ isActive }) => cn(
              'px-3 py-1.5 rounded-full transition-all duration-300',
              isActive 
                ? 'text-primary font-medium bg-primary/10'
                : 'text-foreground/80 hover:text-foreground hover:bg-foreground/5'
            )}
          >
            Request Data
          </NavLink>
          
          {user && (
            <NavLink
              to="/dashboard"
              className={({ isActive }) => cn(
                'px-3 py-1.5 rounded-full transition-all duration-300',
                isActive 
                  ? 'text-primary font-medium bg-primary/10'
                  : 'text-foreground/80 hover:text-foreground hover:bg-foreground/5'
              )}
            >
              Dashboard
            </NavLink>
          )}
          
          <Button 
            onClick={handleAuthAction}
            variant="default"
            className="px-4 py-2 rounded-full font-medium flex items-center justify-center gap-2 transition-all"
          >
            {authenticated ? (
              <>
                <LogOut className="w-4 h-4" />
                Sign Out
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                Sign In
              </>
            )}
          </Button>
        </nav>

        {/* Mobile Menu Button */}
        <button
          className="block md:hidden text-foreground p-2 menu-button rounded-full"
          onClick={toggleMenu}
          aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
        >
          {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="fixed inset-0 top-[56px] md:top-[72px] bg-background/95 backdrop-blur-sm z-40 animate-fade-in md:hidden mobile-menu">
            <nav className="flex flex-col items-start gap-3 p-4">
              <NavLink
                to="/leaderboard"
                onClick={() => setIsMenuOpen(false)}
                className={({ isActive }) => cn(
                  'flex w-full px-4 py-3 rounded-lg transition-all duration-300 animate-slide-up',
                  isActive
                    ? 'text-primary font-medium bg-primary/10'
                    : 'text-foreground/80 hover:text-foreground hover:bg-foreground/5'
                )}
              >
                Leaderboard
              </NavLink>
              
              <NavLink
                to="/contribute"
                onClick={() => setIsMenuOpen(false)}
                className={({ isActive }) => cn(
                  'flex w-full px-4 py-3 rounded-lg transition-all duration-300 animate-slide-up',
                  isActive
                    ? 'text-primary font-medium bg-primary/10'
                    : 'text-foreground/80 hover:text-foreground hover:bg-foreground/5'
                )}
                style={{ animationDelay: '50ms' }}
              >
                Contribute
              </NavLink>
              
              <NavLink
                to="/request"
                onClick={() => setIsMenuOpen(false)}
                className={({ isActive }) => cn(
                  'flex w-full px-4 py-3 rounded-lg transition-all duration-300 animate-slide-up',
                  isActive
                    ? 'text-primary font-medium bg-primary/10'
                    : 'text-foreground/80 hover:text-foreground hover:bg-foreground/5'
                )}
                style={{ animationDelay: '100ms' }}
              >
                Request Data
              </NavLink>
              
              {user && (
                <NavLink
                  to="/dashboard"
                  onClick={() => setIsMenuOpen(false)}
                  className={({ isActive }) => cn(
                    'flex w-full px-4 py-3 rounded-lg transition-all duration-300 animate-slide-up',
                    isActive
                      ? 'text-primary font-medium bg-primary/10'
                      : 'text-foreground/80 hover:text-foreground hover:bg-foreground/5'
                  )}
                  style={{ animationDelay: '150ms' }}
                >
                  Dashboard
                </NavLink>
              )}
              
              <Button 
                onClick={() => {
                  setIsMenuOpen(false);
                  handleAuthAction();
                }}
                variant="default"
                className="w-full px-4 py-3 rounded-lg font-medium flex items-center gap-2 transition-all animate-slide-up mt-2"
                style={{ animationDelay: user ? '200ms' : '150ms' }}
              >
                {authenticated ? (
                  <>
                    <LogOut className="w-5 h-5" />
                    Sign Out
                  </>
                ) : (
                  <>
                    <LogIn className="w-5 h-5" />
                    Sign In
                  </>
                )}
              </Button>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
