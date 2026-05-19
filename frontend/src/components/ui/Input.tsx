import { cn } from '../../lib/utils';
import type { InputHTMLAttributes } from 'react';
import { forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
  labelClassName?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, id, icon, labelClassName, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="space-y-2 w-full">
        {label && (
          <label
            htmlFor={inputId}
            className={cn("block text-sm font-medium text-surface-700", labelClassName)}
          >
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-400 flex items-center justify-center pointer-events-none">
              {icon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            className={cn(
              'w-full h-12 px-4 bg-card border border-card-border rounded-2xl text-surface-900 placeholder:text-surface-400',
              'transition-[border-color,box-shadow] duration-200',
              'focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              error && 'border-danger focus:border-danger focus:ring-danger/30',
              icon && 'pl-11',
              className
            )}
            style={{ transitionTimingFunction: 'var(--ease-out)' }}
            {...props}
          />
        </div>
        {error && <p className="text-sm text-danger font-medium">{error}</p>}
        {helperText && !error && (
          <p className="text-sm text-surface-400">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
