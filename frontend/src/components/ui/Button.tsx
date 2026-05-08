import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';
import { Loader2 } from 'lucide-react';
import type { ButtonHTMLAttributes } from 'react';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-900',
  {
    variants: {
      variant: {
        primary:
          'bg-primary-gradient text-white hover:opacity-90 active:scale-[0.98] focus-visible:ring-primary shadow-glow-primary',
        secondary:
          'bg-surface-700 text-surface-100 hover:bg-surface-600 active:scale-[0.98] focus-visible:ring-surface-500',
        accent:
          'bg-accent text-surface-900 hover:bg-accent-dark active:scale-[0.98] focus-visible:ring-accent',
        ghost:
          'text-surface-300 hover:text-surface-100 hover:bg-surface-800 focus-visible:ring-surface-500',
        danger:
          'bg-danger text-white hover:bg-red-600 active:scale-[0.98] focus-visible:ring-danger',
        outline:
          'border-2 border-primary text-primary hover:bg-primary/10 focus-visible:ring-primary',
      },
      size: {
        sm: 'h-9 px-4 text-sm rounded-full',
        md: 'h-12 px-6 text-sm rounded-full font-bold tracking-wide',
        lg: 'h-14 px-8 text-base rounded-full font-bold tracking-wide',
        icon: 'h-12 w-12 rounded-full',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
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
      className={cn(buttonVariants({ variant, size, className }))}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
}
