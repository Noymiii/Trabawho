import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';
import { Loader2 } from 'lucide-react';

const buttonVariants = cva(
  [
    'inline-flex items-center justify-center gap-2 font-semibold cursor-pointer',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-50',
    'transition-[transform,filter,opacity,background-color,color,border-color]',
    'duration-200',
    'active:scale-[0.97]',
  ].join(' '),
  {
    variants: {
      variant: {
        primary:
          'bg-primary text-white hover:bg-primary/90 focus-visible:ring-primary',
        secondary:
          'bg-surface-100 text-surface-800 hover:bg-surface-200 focus-visible:ring-surface-400 shadow-sm border border-surface-200',
        accent:
          'bg-accent text-white hover:bg-accent/90 focus-visible:ring-accent',
        ghost:
          'text-surface-600 hover:text-surface-900 hover:bg-surface-100 focus-visible:ring-surface-400',
        danger:
          'bg-danger text-white hover:opacity-90 focus-visible:ring-danger shadow-sm',
        outline:
          'border border-card-border text-surface-700 hover:bg-surface-50 hover:border-surface-300 focus-visible:ring-surface-300 shadow-sm',
      },
      size: {
        sm: 'h-9 px-4 text-sm rounded-full',
        md: 'h-11 px-6 text-sm rounded-full tracking-wide',
        lg: 'h-13 px-8 text-base rounded-full tracking-wide',
        icon: 'h-11 w-11 rounded-full',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
}

export function Button({
  className,
  variant,
  size,
  isLoading,
  disabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        buttonVariants({ variant, size }),
        isLoading && 'filter blur-[2px] opacity-70 pointer-events-none',
        className
      )}
      disabled={disabled || isLoading}
      style={{ transitionTimingFunction: 'var(--ease-out)' }}
      {...props}
    >
      {isLoading && <Loader2 className="h-4 w-4 animate-spin absolute" />}
      <span className={cn('flex items-center gap-2', isLoading && 'opacity-0')}>{children}</span>
    </button>
  );
}
