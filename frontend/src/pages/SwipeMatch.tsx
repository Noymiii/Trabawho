import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { swipeAPI } from '../services/api';
import { motion, useMotionValue, useTransform, AnimatePresence } from 'framer-motion';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { X, Heart, MapPin, DollarSign, Briefcase, Star, RotateCcw, Sparkles } from 'lucide-react';

interface SwipeItem {
  id: number;
  type: 'worker' | 'job';
  title: string;
  subtitle: string;
  description: string;
  tags: string[];
  location?: string;
  budget?: number;
  availability?: string;
}

export default function SwipeMatch() {
  const { user } = useAuth();
  const [queue, setQueue] = useState<SwipeItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [showMatch, setShowMatch] = useState(false);
  const [matchName, setMatchName] = useState('');
  const [direction, setDirection] = useState<'left' | 'right' | null>(null);

  useEffect(() => {
    const fetchQueue = async () => {
      try {
        const res = await swipeAPI.getQueue();
        setQueue(res.data.queue || []);
      } catch { /* API not ready */ }
      finally { setIsLoading(false); }
    };
    fetchQueue();
  }, []);

  const currentItem = queue[currentIndex];
  const hasMore = currentIndex < queue.length;

  const handleSwipe = async (dir: 'left' | 'right') => {
    if (!currentItem) return;
    setDirection(dir);
    try {
      const res = await swipeAPI.swipe({
        targetId: currentItem.id,
        targetType: currentItem.type,
        direction: dir,
      });
      if (res.data.matched) {
        setMatchName(currentItem.title);
        setTimeout(() => setShowMatch(true), 400);
      }
    } catch { /* */ }
    setTimeout(() => {
      setCurrentIndex(prev => prev + 1);
      setDirection(null);
    }, 300);
  };

  if (isLoading) return (
    <div className="min-h-dvh pt-20 flex items-center justify-center">
      <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
    </div>
  );

  return (
    <div className="min-h-dvh pt-20 pb-8 px-4">
      <div className="max-w-lg mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold font-heading">
              {user?.role === 'customer' ? 'Find Workers' : 'Find Jobs'}
            </h1>
            <p className="text-surface-400 text-sm mt-1">Swipe right to match, left to skip</p>
          </div>

          {/* Card Stack */}
          <div className="relative h-[480px] mb-6">
            {!hasMore ? (
              <div className="absolute inset-0 glass rounded-[var(--radius-xl)] flex flex-col items-center justify-center p-8 text-center">
                <RotateCcw className="h-16 w-16 text-surface-600 mb-4" />
                <h3 className="text-xl font-semibold font-heading mb-2">No More Cards</h3>
                <p className="text-surface-400 text-sm">Check back later for new {user?.role === 'customer' ? 'workers' : 'jobs'}!</p>
              </div>
            ) : (
              <AnimatePresence>
                {/* Next card preview (behind) */}
                {queue[currentIndex + 1] && (
                  <div className="absolute inset-0 glass rounded-[var(--radius-xl)] scale-[0.95] opacity-50" />
                )}

                {/* Current card */}
                {currentItem && (
                  <SwipeCard
                    key={currentItem.id}
                    item={currentItem}
                    onSwipe={handleSwipe}
                    forcedDirection={direction}
                  />
                )}
              </AnimatePresence>
            )}
          </div>

          {/* Action Buttons */}
          {hasMore && (
            <div className="flex items-center justify-center gap-6">
              <button
                onClick={() => handleSwipe('left')}
                className="w-16 h-16 rounded-full bg-surface-800 border-2 border-danger/30 flex items-center justify-center text-danger hover:bg-danger/10 hover:border-danger transition-all active:scale-90 cursor-pointer"
              >
                <X className="h-7 w-7" />
              </button>
              <button
                onClick={() => handleSwipe('right')}
                className="w-20 h-20 rounded-full gradient-primary flex items-center justify-center text-white hover:shadow-glow-primary transition-all active:scale-90 cursor-pointer"
              >
                <Heart className="h-9 w-9" fill="white" />
              </button>
            </div>
          )}
        </motion.div>

        {/* Match Modal */}
        <Modal isOpen={showMatch} onClose={() => setShowMatch(false)}>
          <div className="text-center py-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', damping: 10, stiffness: 200 }}
            >
              <Sparkles className="h-16 w-16 text-warning mx-auto mb-4" />
            </motion.div>
            <h2 className="text-3xl font-bold font-heading gradient-text mb-2">It's a Match!</h2>
            <p className="text-surface-400 mb-6">
              You and <span className="text-surface-100 font-medium">{matchName}</span> are interested in each other!
            </p>
            <div className="flex gap-3">
              <Button variant="secondary" onClick={() => setShowMatch(false)} className="flex-1">Keep Swiping</Button>
              <Button onClick={() => { setShowMatch(false); window.location.href = '/chat'; }} className="flex-1">Send Message</Button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
}

// Draggable Swipe Card Component
function SwipeCard({ item, onSwipe, forcedDirection }: {
  item: SwipeItem; onSwipe: (dir: 'left' | 'right') => void;
  forcedDirection: 'left' | 'right' | null;
}) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-15, 15]);
  const likeOpacity = useTransform(x, [0, 100], [0, 1]);
  const skipOpacity = useTransform(x, [-100, 0], [1, 0]);

  const handleDragEnd = (_: unknown, info: { offset: { x: number }; velocity: { x: number } }) => {
    const threshold = 100;
    if (info.offset.x > threshold || info.velocity.x > 500) onSwipe('right');
    else if (info.offset.x < -threshold || info.velocity.x < -500) onSwipe('left');
  };

  return (
    <motion.div
      className="absolute inset-0 cursor-grab active:cursor-grabbing"
      style={{ x, rotate }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.9}
      onDragEnd={handleDragEnd}
      animate={forcedDirection === 'right' ? { x: 500, opacity: 0, rotate: 20 } :
               forcedDirection === 'left' ? { x: -500, opacity: 0, rotate: -20 } : {}}
      transition={{ duration: 0.3 }}
      exit={{ opacity: 0 }}
    >
      <div className="w-full h-full glass rounded-[var(--radius-xl)] p-6 flex flex-col relative overflow-hidden">
        {/* Like/Skip overlays */}
        <motion.div style={{ opacity: likeOpacity }}
          className="absolute top-6 left-6 z-10 px-4 py-2 rounded-[var(--radius-md)] border-3 border-success text-success font-bold text-2xl font-heading -rotate-12">
          LIKE
        </motion.div>
        <motion.div style={{ opacity: skipOpacity }}
          className="absolute top-6 right-6 z-10 px-4 py-2 rounded-[var(--radius-md)] border-3 border-danger text-danger font-bold text-2xl font-heading rotate-12">
          SKIP
        </motion.div>

        {/* Card Header */}
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 rounded-[var(--radius-lg)] gradient-primary flex items-center justify-center text-white text-xl font-bold shrink-0">
            {item.title[0]?.toUpperCase()}
          </div>
          <div className="min-w-0">
            <h3 className="text-xl font-bold font-heading truncate">{item.title}</h3>
            <p className="text-surface-400 text-sm truncate">{item.subtitle}</p>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {item.tags.map(tag => (
            <Badge key={tag} variant="primary">{tag}</Badge>
          ))}
        </div>

        {/* Description */}
        <p className="text-surface-300 text-sm leading-relaxed flex-1 line-clamp-6">{item.description}</p>

        {/* Footer info */}
        <div className="mt-4 pt-4 border-t border-surface-700/50 flex flex-wrap gap-4 text-sm text-surface-400">
          {item.location && (
            <span className="flex items-center gap-1"><MapPin className="h-4 w-4" />{item.location}</span>
          )}
          {item.budget && (
            <span className="flex items-center gap-1"><DollarSign className="h-4 w-4" />₱{item.budget}</span>
          )}
          {item.availability && (
            <span className="flex items-center gap-1"><Star className="h-4 w-4" />{item.availability}</span>
          )}
          <span className="flex items-center gap-1">
            <Briefcase className="h-4 w-4" />{item.type === 'worker' ? 'Worker' : 'Job'}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
