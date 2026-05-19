import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldAlert, FileText, Check } from 'lucide-react';
import { Button } from '../ui/Button';
import { contractAPI } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';

interface ContractModalProps {
  isOpen: boolean;
  onClose: () => void;
  matchId: number;
  onSuccess: (contract: any) => void;
}

const easeOut = [0.23, 1, 0.32, 1] as const;

export function ContractModal({ isOpen, onClose, matchId, onSuccess }: ContractModalProps) {
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!price || !description) {
      addToast({
        type: 'error',
        title: 'Validation Error',
        message: 'Please fill in all fields.',
      });
      return;
    }

    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum <= 0) {
      addToast({
        type: 'error',
        title: 'Validation Error',
        message: 'Please enter a valid price greater than 0.',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await contractAPI.propose({
        matchId,
        price: priceNum,
        description,
      });
      addToast({
        type: 'success',
        title: 'Contract Proposed',
        message: 'The contract terms have been proposed to the other party.',
      });
      onSuccess(res.data);
      onClose();
      setPrice('');
      setDescription('');
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Submission Failed',
        message: error.response?.data?.message || 'Could not send the proposal. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-surface-950/80 backdrop-blur-sm"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 16 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 16 }}
            transition={{ duration: 0.4, ease: easeOut }}
            className="w-full max-w-lg bg-surface-900 border border-surface-800 rounded-3xl p-6 shadow-2xl relative z-10 overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-accent/5 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-xl font-bold font-heading text-white">Propose Contract</h3>
                  <p className="text-xs text-surface-400">Formalize your agreement terms & price</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-surface-800 hover:bg-surface-700 flex items-center justify-center text-surface-400 hover:text-white transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-surface-400 mb-2">Agreed Price (₱)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-400 font-medium">₱</span>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    placeholder="0.00"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full pl-8 pr-4 py-3 bg-surface-950 border border-surface-800 rounded-xl text-white placeholder-surface-600 focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/50 transition-all font-medium"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-surface-400 mb-2">Scope of Work / Terms</label>
                <textarea
                  rows={4}
                  placeholder="Specify deliverables, schedule, or other terms agreed upon..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-3 bg-surface-950 border border-surface-800 rounded-xl text-white placeholder-surface-600 focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/50 transition-all text-sm leading-relaxed"
                  required
                />
              </div>

              <div className="bg-surface-950/50 border border-surface-800/80 rounded-2xl p-4 flex gap-3">
                <ShieldAlert className="h-5 w-5 text-warning shrink-0 mt-0.5" />
                <div className="text-xs text-surface-400 leading-relaxed">
                  <span className="text-white font-semibold">Important Note:</span> Once proposed, the other party will be notified in the chat to Accept or Reject these terms. Accepting formulates a binding match contract on the platform.
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="flex-1 border-surface-700 text-white hover:bg-surface-800"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="accent"
                  disabled={isSubmitting}
                  className="flex-1 font-bold text-white flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Check className="h-4 w-4" />
                      Send Proposal
                    </>
                  )}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
