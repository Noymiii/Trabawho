import { cn } from '../../lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'accent' | 'success' | 'warning' | 'danger' | 'neutral';
  className?: string;
}

const variantClasses = {
  primary: 'bg-primary/20 text-primary border-primary/30',
  accent: 'bg-accent/20 text-accent border-accent/30',
  success: 'bg-success/20 text-success border-success/30',
  warning: 'bg-warning/20 text-warning border-warning/30',
  danger: 'bg-danger/20 text-danger border-danger/30',
  neutral: 'bg-surface-700 text-surface-300 border-surface-600',
};

export function Badge({ children, variant = 'neutral', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-[var(--radius-full)] border',
        variantClasses[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
