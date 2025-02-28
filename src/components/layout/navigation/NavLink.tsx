
import { NavLink as RouterLink } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface NavLinkProps {
  to: string;
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  style?: React.CSSProperties;
  mobile?: boolean;
}

const NavLink = ({ to, children, onClick, className, style, mobile = false }: NavLinkProps) => {
  return (
    <RouterLink
      to={to}
      onClick={onClick}
      className={({ isActive }) => cn(
        mobile ? 'flex w-full px-4 py-3 rounded-lg transition-all duration-300 animate-slide-up' 
              : 'px-3 py-1.5 rounded-full transition-all duration-300',
        isActive 
          ? 'text-primary font-medium bg-primary/10'
          : 'text-foreground/80 hover:text-foreground hover:bg-foreground/5',
        className
      )}
      style={style}
    >
      {children}
    </RouterLink>
  );
};

export default NavLink;
