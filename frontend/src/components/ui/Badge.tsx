import { cn } from '../../lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'accent' | 'success' | 'warning' | 'danger' | 'muted';
  className?: string;
}

const variantStyles: Record<string, string> = {
  primary: 'bg-primary/8 text-primary border-primary/12',
  accent: 'bg-accent/10 text-accent border-accent/15',
  success: 'bg-success/10 text-success border-success/15',
  warning: 'bg-warning/10 text-warning border-warning/15',
  danger: 'bg-danger/10 text-danger border-danger/15',
  muted: 'bg-surface-100 text-surface-500 border-surface-200',
};

export function Badge({ children, variant = 'muted', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold rounded-full border',
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
