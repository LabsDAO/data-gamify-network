
import { NavLink, useNavigate } from 'react-router-dom';
import { LogIn, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { user, handlePrivyLogin } = useAuth();
  const navigate = useNavigate();

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

  return (
    <header 
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300 py-4 px-6 md:px-10',
        isScrolled ? 'glass-morphism shadow-md' : 'bg-transparent'
      )}
    >
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo */}
        <NavLink 
          to="/" 
          className="flex items-center gap-2 font-bold text-xl md:text-2xl"
        >
          <span className="text-gradient">LabsMarket.ai</span>
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
          
          {user ? (
            <button 
              onClick={() => navigate('/dashboard')}
              className="px-4 py-2 bg-primary text-white rounded-full font-medium flex items-center justify-center gap-2 hover:bg-primary/90 transition-all"
            >
              Dashboard
            </button>
          ) : (
            <button 
              onClick={() => handlePrivyLogin()}
              className="px-4 py-2 bg-primary text-white rounded-full font-medium flex items-center justify-center gap-2 hover:bg-primary/90 transition-all"
            >
              <LogIn className="w-4 h-4" />
              Sign In
            </button>
          )}
        </nav>

        {/* Mobile Menu Button */}
        <button
          className="block md:hidden text-foreground p-2 menu-button"
          onClick={toggleMenu}
          aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
        >
          {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="fixed inset-0 top-[72px] bg-background/95 backdrop-blur-sm z-40 animate-fade-in md:hidden mobile-menu">
            <nav className="flex flex-col items-start gap-4 p-6">
              <NavLink
                to="/leaderboard"
                className={({ isActive }) => cn(
                  'flex w-full px-4 py-3 rounded-lg transition-all duration-300 animate-slide-up',
                  isActive
                    ? 'text-primary font-medium bg-primary/10'
                    : 'text-foreground/80 hover:text-foreground hover:bg-foreground/5'
                )}
              >
                Leaderboard
              </NavLink>
              
              {user ? (
                <button 
                  onClick={() => navigate('/dashboard')}
                  className="w-full px-4 py-3 bg-primary text-white rounded-lg font-medium flex items-center gap-2 hover:bg-primary/90 transition-all animate-slide-up"
                  style={{ animationDelay: '50ms' }}
                >
                  Dashboard
                </button>
              ) : (
                <button 
                  onClick={() => handlePrivyLogin()}
                  className="w-full px-4 py-3 bg-primary text-white rounded-lg font-medium flex items-center gap-2 hover:bg-primary/90 transition-all animate-slide-up"
                  style={{ animationDelay: '50ms' }}
                >
                  <LogIn className="w-5 h-5" />
                  Sign In
                </button>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
