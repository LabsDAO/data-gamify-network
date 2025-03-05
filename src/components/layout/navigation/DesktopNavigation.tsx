
import { useAuth } from '@/hooks/useAuth';
import NavLink from './NavLink';
import AuthButton from './AuthButton';

interface DesktopNavigationProps {
  handleAuthAction: () => void;
  authenticated: boolean;
}

const DesktopNavigation = ({ handleAuthAction, authenticated }: DesktopNavigationProps) => {
  const { user } = useAuth();
  
  return (
    <nav className="hidden md:flex items-center gap-6">
      <NavLink to="/leaderboard">
        Leaderboard
      </NavLink>
      
      <NavLink to="/contribute">
        Contribute
      </NavLink>
      
      <NavLink to="/agents">
        AI Agents
      </NavLink>
      
      <NavLink to="/request">
        Request Data
      </NavLink>
      
      <NavLink to="/agents">
        AI Agents
      </NavLink>
      
      <NavLink to="/dataset-marketplace">
        Datasets
      </NavLink>
      
      {user && (
        <>
          <NavLink to="/dashboard">
            Dashboard
          </NavLink>
          
          <NavLink to="/my-agents">
            My Agents
          </NavLink>
          
          <NavLink to="/ip-management">
            IP Management
          </NavLink>
        </>
      )}
      
      <AuthButton 
        authenticated={authenticated}
        onClick={handleAuthAction}
      />
    </nav>
  );
};

export default DesktopNavigation;
