
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface AnimatedNumberProps {
  value: number;
  duration?: number;
  className?: string;
  prefix?: string;
  suffix?: string;
}

const AnimatedNumber = ({
  value,
  duration = 1000,
  className,
  prefix = '',
  suffix = ''
}: AnimatedNumberProps) => {
  const [displayValue, setDisplayValue] = useState(0);
  
  useEffect(() => {
    let startTime: number | null = null;
    const startValue = displayValue;
    const endValue = value;
    
    const animateValue = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const currentValue = Math.floor(startValue + progress * (endValue - startValue));
      
      setDisplayValue(currentValue);
      
      if (progress < 1) {
        window.requestAnimationFrame(animateValue);
      }
    };
    
    window.requestAnimationFrame(animateValue);
    
    return () => {
      startTime = null;
    };
  }, [value, duration]);
  
  return (
    <span className={cn('transition-all duration-200', className)}>
      {prefix}{displayValue}{suffix}
    </span>
  );
};

export default AnimatedNumber;
