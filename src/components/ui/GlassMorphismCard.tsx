
import React from 'react';
import { cn } from '@/lib/utils';

interface GlassMorphismCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  gradient?: boolean;
  hoverEffect?: boolean;
  className?: string;
}

const GlassMorphismCard = ({ 
  children, 
  gradient = false,
  hoverEffect = false,
  className,
  ...rest
}: GlassMorphismCardProps) => {
  return (
    <div 
      className={cn(
        'glass-card p-6 transition-all duration-300 ease-in-out',
        gradient && 'animated-gradient-border',
        hoverEffect && 'hover:translate-y-[-5px] hover:shadow-xl',
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
};

export default GlassMorphismCard;
