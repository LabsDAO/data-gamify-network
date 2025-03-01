
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { usePrivy } from '@privy-io/react-auth';
import DesktopNavigation from './navigation/DesktopNavigation';
import MobileNavigation from './navigation/MobileNavigation';
import MobileMenuButton from './navigation/MobileMenuButton';
import { NavLink } from 'react-router-dom';

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
      <div className="container mx-auto flex justify-center items-center">
        <div className="flex justify-between items-center w-full max-w-7xl">
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
          <DesktopNavigation 
            handleAuthAction={handleAuthAction}
            authenticated={authenticated}
          />

          {/* Mobile Menu Button */}
          <MobileMenuButton 
            isOpen={isMenuOpen} 
            toggleMenu={toggleMenu} 
          />

          {/* Mobile Menu */}
          <MobileNavigation 
            isMenuOpen={isMenuOpen}
            setIsMenuOpen={setIsMenuOpen}
            handleAuthAction={handleAuthAction}
            authenticated={authenticated}
          />
        </div>
      </div>
    </header>
  );
};

export default Header;
