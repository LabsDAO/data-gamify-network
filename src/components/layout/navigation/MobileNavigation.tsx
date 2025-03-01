
import { useAuth } from '@/hooks/useAuth';
import NavLink from './NavLink';
import AuthButton from './AuthButton';

interface MobileNavigationProps {
  isMenuOpen: boolean;
  setIsMenuOpen: (isOpen: boolean) => void;
  handleAuthAction: () => void;
  authenticated: boolean;
}

const MobileNavigation = ({ 
  isMenuOpen, 
  setIsMenuOpen, 
  handleAuthAction, 
  authenticated 
}: MobileNavigationProps) => {
  const { user } = useAuth();
  
  if (!isMenuOpen) return null;
  
  return (
    <div className="fixed inset-0 top-[56px] md:top-[72px] bg-background/95 backdrop-blur-sm z-40 animate-fade-in md:hidden mobile-menu">
      <nav className="flex flex-col items-start gap-3 p-4">
        <NavLink
          to="/leaderboard"
          onClick={() => setIsMenuOpen(false)}
          mobile
        >
          Leaderboard
        </NavLink>
        
        <NavLink
          to="/contribute"
          onClick={() => setIsMenuOpen(false)}
          mobile
          style={{ animationDelay: '50ms' }}
        >
          Contribute
        </NavLink>
        
        <NavLink
          to="/agents"
          onClick={() => setIsMenuOpen(false)}
          mobile
          style={{ animationDelay: '100ms' }}
        >
          AI Agents
        </NavLink>
        
        <NavLink
          to="/request"
          onClick={() => setIsMenuOpen(false)}
          mobile
          style={{ animationDelay: '150ms' }}
        >
          Request Data
        </NavLink>
        
        {user && (
          <NavLink
            to="/dashboard"
            onClick={() => setIsMenuOpen(false)}
            mobile
            style={{ animationDelay: '200ms' }}
          >
            Dashboard
          </NavLink>
        )}
        
        <AuthButton 
          authenticated={authenticated}
          onClick={() => {
            setIsMenuOpen(false);
            handleAuthAction();
          }}
          mobile
          style={{ animationDelay: user ? '250ms' : '200ms' }}
        />
      </nav>
    </div>
  );
};

export default MobileNavigation;
