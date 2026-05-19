import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, CheckCircle2, Info, AlertCircle } from 'lucide-react';
import type { ToastMessage } from '../../contexts/ToastContext';
import { cn } from '../../lib/utils';

interface ToastProps {
  toast: ToastMessage;
  onDismiss: () => void;
}

export function Toast({ toast, onDismiss }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss();
    }, 4000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  const Icon = toast.type === 'success' ? CheckCircle2 : toast.type === 'error' ? AlertCircle : Info;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className="pointer-events-auto flex items-start gap-4 p-4 bg-surface-900/90 border border-surface-700 shadow-[0_8px_30px_rgb(0,0,0,0.5)] rounded-2xl backdrop-blur-xl relative overflow-hidden group"
    >
      <div className={cn(
        "absolute top-0 left-0 w-1 h-full",
        toast.type === 'success' ? 'bg-accent' : toast.type === 'error' ? 'bg-danger' : 'bg-blue-500'
      )} />
      
      <div className={cn(
        "shrink-0 mt-0.5",
        toast.type === 'success' ? 'text-accent' : toast.type === 'error' ? 'text-danger' : 'text-blue-500'
      )}>
        <Icon className="w-5 h-5" />
      </div>
      
      <div className="flex-1 min-w-0 pr-6">
        <h4 className="text-sm font-bold text-white mb-0.5">{toast.title}</h4>
        {toast.message && <p className="text-sm text-surface-400 line-clamp-2 leading-relaxed">{toast.message}</p>}
      </div>

      <button
        onClick={onDismiss}
        className="absolute top-4 right-4 p-1 text-surface-500 hover:text-white bg-surface-800/0 hover:bg-surface-800 rounded-full transition-colors opacity-0 group-hover:opacity-100"
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
}
