
import { Menu, X } from 'lucide-react';

interface MobileMenuButtonProps {
  isOpen: boolean;
  toggleMenu: () => void;
}

const MobileMenuButton = ({ isOpen, toggleMenu }: MobileMenuButtonProps) => {
  return (
    <button
      className="block md:hidden text-foreground p-2 menu-button rounded-full"
      onClick={toggleMenu}
      aria-label={isOpen ? 'Close menu' : 'Open menu'}
    >
      {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
    </button>
  );
};

export default MobileMenuButton;
