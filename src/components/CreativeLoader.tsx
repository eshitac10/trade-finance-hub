import React from 'react';
import { cn } from '@/lib/utils';

interface CreativeLoaderProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}

const CreativeLoader: React.FC<CreativeLoaderProps> = ({ 
  className = '', 
  size = 'md',
  text = 'Loading...'
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-16 h-16',
    lg: 'w-24 h-24'
  };

  return (
    <div className={cn("flex flex-col items-center justify-center gap-4", className)}>
      <div className="relative">
        {/* Outer spinning ring */}
        <div className={cn(
          "rounded-full border-4 border-primary/20 border-t-primary animate-spin",
          sizeClasses[size]
        )} />
        
        {/* Inner pulsing circle */}
        <div className={cn(
          "absolute inset-0 m-auto rounded-full bg-primary/30 animate-pulse",
          size === 'sm' ? 'w-4 h-4' : size === 'md' ? 'w-8 h-8' : 'w-12 h-12'
        )} />
        
        {/* Orbiting dots */}
        <div className="absolute inset-0 animate-spin" style={{ animationDuration: '2s' }}>
          <div className={cn(
            "absolute top-0 left-1/2 -translate-x-1/2 rounded-full bg-primary",
            size === 'sm' ? 'w-2 h-2' : size === 'md' ? 'w-3 h-3' : 'w-4 h-4'
          )} />
        </div>
      </div>
      
      {text && (
        <p className="text-muted-foreground font-medium animate-pulse">
          {text}
        </p>
      )}
    </div>
  );
};

export default CreativeLoader;
