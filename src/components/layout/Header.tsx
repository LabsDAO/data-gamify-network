
import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Menu, X, Upload, Database, Award, Search, FileText, Home } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const isMobile = useIsMobile();

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

  useEffect(() => {
    if (isMenuOpen && isMobile) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isMenuOpen, isMobile]);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  const navItems = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Dashboard', path: '/dashboard', icon: Database },
    { name: 'Upload', path: '/upload', icon: Upload },
    { name: 'Preprocess', path: '/preprocess', icon: FileText },
    { name: 'Register IP', path: '/register', icon: FileText },
    { name: 'Leaderboard', path: '/leaderboard', icon: Award },
    { name: 'Search', path: '/search', icon: Search },
  ];

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
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all duration-300',
                isActive 
                  ? 'text-primary font-medium bg-primary/10'
                  : 'text-foreground/80 hover:text-foreground hover:bg-foreground/5'
              )}
            >
              <item.icon className="w-4 h-4" />
              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>

        {/* Mobile Menu Button */}
        <button
          className="block md:hidden text-foreground p-2"
          onClick={toggleMenu}
          aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
        >
          {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="fixed inset-0 top-[72px] bg-background/95 backdrop-blur-sm z-40 animate-fade-in md:hidden">
            <nav className="flex flex-col items-start gap-2 p-6">
              {navItems.map((item, index) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  style={{ animationDelay: `${index * 50}ms` }}
                  className={({ isActive }) => cn(
                    'flex items-center gap-2 w-full px-4 py-3 rounded-lg transition-all duration-300 animate-slide-up',
                    isActive
                      ? 'text-primary font-medium bg-primary/10'
                      : 'text-foreground/80 hover:text-foreground hover:bg-foreground/5'
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="text-lg">{item.name}</span>
                </NavLink>
              ))}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
