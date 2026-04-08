import { forwardRef, ButtonHTMLAttributes } from 'react';
import { cn } from './cn';

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'ghost' | 'accent';
  size?: 'sm' | 'md' | 'lg';
  label: string;
}

const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    { className, variant = 'default', size = 'md', label, children, ...props },
    ref
  ) => {
    const variants = {
      default: 'text-text-secondary hover:text-text hover:bg-surface-hover',
      ghost: 'text-text-secondary hover:text-text',
      accent: 'text-accent hover:text-accent-hover hover:bg-accent/10',
    };

    const sizes = {
      sm: 'w-8 h-8',
      md: 'w-10 h-10',
      lg: 'w-12 h-12',
    };

    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-full transition-all duration-150',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          'active:scale-90',
          variants[variant],
          sizes[size],
          className
        )}
        aria-label={label}
        {...props}
      >
        {children}
      </button>
    );
  }
);

IconButton.displayName = 'IconButton';

export { IconButton };
