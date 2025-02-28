
import { LogIn, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface AuthButtonProps {
  authenticated: boolean;
  onClick: () => void;
  className?: string;
  style?: React.CSSProperties;
  mobile?: boolean;
}

const AuthButton = ({ authenticated, onClick, className, style, mobile = false }: AuthButtonProps) => {
  return (
    <Button 
      onClick={onClick}
      variant="default"
      className={cn(
        mobile 
          ? "w-full px-4 py-3 rounded-lg font-medium flex items-center gap-2 transition-all animate-slide-up mt-2" 
          : "px-4 py-2 rounded-full font-medium flex items-center justify-center gap-2 transition-all",
        className
      )}
      style={style}
    >
      {authenticated ? (
        <>
          <LogOut className={mobile ? "w-5 h-5" : "w-4 h-4"} />
          Sign Out
        </>
      ) : (
        <>
          <LogIn className={mobile ? "w-5 h-5" : "w-4 h-4"} />
          Sign In
        </>
      )}
    </Button>
  );
};

export default AuthButton;
