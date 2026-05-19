import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, X, Send } from 'lucide-react';
import { Button } from '../ui/Button';
import { reviewAPI } from '../../services/api';
import { cn } from '../../lib/utils';

const springTransition = { type: "spring", stiffness: 400, damping: 30 } as const;

interface ReviewModalProps {
  matchId: number;
  revieweeId: number;
  revieweeName: string;
  onComplete: () => void;
  onSkip: () => void;
}

export function ReviewModal({ matchId: _, revieweeId, revieweeName, onComplete, onSkip }: ReviewModalProps) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (rating === 0) return;
    setIsSubmitting(true);
    setError('');
    try {
      await reviewAPI.submitReview({
        workerId: revieweeId,
        rating,
        comment: comment.trim() || undefined,
      });
      onComplete();
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Failed to submit review. Please try again.';
      setError(msg);
      setIsSubmitting(false);
    }
  };

  const displayRating = hoveredRating || rating;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-6 bg-surface-950/80 backdrop-blur-2xl">
        {/* Background glow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/2 left-1/2 w-[60vw] h-[60vw] max-w-[800px] max-h-[800px] bg-accent/10 rounded-full blur-[160px] -translate-x-1/2 -translate-y-1/2 mix-blend-screen" />
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          transition={springTransition}
          className="relative w-full max-w-lg bg-surface-950/60 border border-surface-800 rounded-[2rem] shadow-2xl overflow-hidden backdrop-blur-xl"
        >
          {/* Skip/close button */}
          <button
            onClick={onSkip}
            className="absolute top-5 right-5 p-2 text-surface-500 hover:text-white bg-surface-900/50 hover:bg-surface-800 rounded-full transition-colors z-20"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="p-8 sm:p-10 md:p-12">
            {/* Header */}
            <div className="text-center mb-10">
              <div className="w-20 h-20 bg-surface-900 border border-surface-800 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner shadow-black/50 rotate-[-3deg]">
                <Star className="w-9 h-9 text-accent" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold font-heading text-white tracking-tight mb-3">
                How was your experience?
              </h2>
              <p className="text-surface-400 text-base md:text-lg leading-relaxed max-w-sm mx-auto">
                Leave a review for <span className="text-white font-semibold">{revieweeName}</span> to help the community.
              </p>
            </div>

            {/* Star Rating */}
            <div className="flex justify-center gap-2 mb-3">
              {[1, 2, 3, 4, 5].map((star) => (
                <motion.button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-1 cursor-pointer focus:outline-none"
                >
                  <Star
                    className={cn(
                      "w-10 h-10 transition-colors duration-200",
                      star <= displayRating
                        ? "fill-accent text-accent"
                        : "fill-surface-800 text-surface-700"
                    )}
                  />
                </motion.button>
              ))}
            </div>
            <p className="text-center text-sm font-medium text-surface-500 mb-8 h-5">
              {displayRating === 1 && 'Poor'}
              {displayRating === 2 && 'Below Average'}
              {displayRating === 3 && 'Average'}
              {displayRating === 4 && 'Great'}
              {displayRating === 5 && 'Excellent'}
            </p>

            {/* Comment */}
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              placeholder="Share your experience (optional)..."
              className="w-full px-6 py-5 bg-surface-900/50 border border-surface-800 rounded-2xl text-white text-base placeholder:text-surface-600 focus:outline-none focus:border-accent resize-none transition-all shadow-inner leading-relaxed mb-6"
            />

            {error && (
              <p className="text-red-400 bg-red-400/10 border border-red-400/20 p-3 rounded-xl text-sm font-medium mb-6 flex items-center gap-2">
                <X className="w-4 h-4 shrink-0" /> {error}
              </p>
            )}

            {/* Actions */}
            <div className="flex gap-4">
              <Button
                variant="outline"
                onClick={onSkip}
                className="h-14 px-8 rounded-2xl border-surface-800 text-surface-300 hover:text-white bg-surface-900/50"
              >
                Skip
              </Button>
              <Button
                onClick={handleSubmit}
                isLoading={isSubmitting}
                disabled={rating === 0}
                className="flex-1 bg-accent text-accent-foreground hover:bg-accent-light h-14 rounded-2xl text-lg font-bold shadow-[0_0_40px_rgba(var(--color-accent),0.3)]"
              >
                <Send className="w-5 h-5 mr-2" /> Submit Review
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
