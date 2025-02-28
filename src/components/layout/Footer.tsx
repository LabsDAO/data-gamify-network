
import { cn } from '@/lib/utils';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full py-8 px-6 mt-auto">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex flex-col items-center md:items-start">
            <div className="font-bold text-xl mb-2">
              <span className="text-gradient">LabsMarket.ai</span>
            </div>
            <p className="text-sm text-muted-foreground text-center md:text-left">
              Where Real Effort Meets Reward
            </p>
          </div>

          <div className="flex flex-col items-center gap-4">
            <div className="flex gap-4">
              <a 
                href="#" 
                className={cn(
                  "text-sm text-foreground/80 hover:text-primary transition-colors",
                )}
              >
                Privacy Policy
              </a>
              <a 
                href="#" 
                className={cn(
                  "text-sm text-foreground/80 hover:text-primary transition-colors",
                )}
              >
                Terms of Service
              </a>
              <a 
                href="#" 
                className={cn(
                  "text-sm text-foreground/80 hover:text-primary transition-colors",
                )}
              >
                Contact
              </a>
            </div>
            <p className="text-xs text-muted-foreground">
              © {currentYear} LabsMarket.ai. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
