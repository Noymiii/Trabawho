import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { swipeAPI } from '../services/api';
import { motion, useMotionValue, useTransform, AnimatePresence } from 'framer-motion';
import { Button } from '../components/ui/Button';
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
  images?: string[];
}

const easeOut = [0.23, 1, 0.32, 1] as const;

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
    <div className="min-h-dvh pt-20 flex items-center justify-center bg-surface-950">
      <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-dvh pt-20 pb-8 px-4 bg-surface-950">
      <div className="max-w-lg mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: easeOut }}
        >
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold font-heading text-white">
              {user?.role === 'customer' ? 'Find Workers' : 'Find Jobs'}
            </h1>
            <p className="text-surface-400 text-sm mt-1">Swipe right to match, left to skip</p>
          </div>

          {/* Card Stack */}
          <div className="relative h-[480px] mb-6">
            {!hasMore ? (
              <div className="absolute inset-0 bg-surface-900 border border-surface-800 rounded-3xl flex flex-col items-center justify-center p-10 text-center shadow-float">
                <div className="w-20 h-20 rounded-full bg-surface-800 flex items-center justify-center mb-6 relative">
                  <RotateCcw className="h-8 w-8 text-surface-400" />
                  <div className="absolute top-0 right-0 w-6 h-6 rounded-full bg-warning border-2 border-surface-900 flex items-center justify-center">
                    <Sparkles className="h-3 w-3 text-surface-950" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold font-heading mb-2 text-white tracking-tight">You've seen them all</h3>
                <p className="text-surface-400 text-sm max-w-[240px] mb-8 leading-relaxed">
                  We're constantly adding new {user?.role === 'customer' ? 'workers' : 'jobs'}. Check back later or update your profile to increase your visibility.
                </p>
                <Button variant="outline" className="border-surface-700 text-white hover:bg-surface-800" onClick={() => window.location.reload()}>Refresh Queue</Button>
              </div>
            ) : (
              <AnimatePresence>
                {/* Next card preview */}
                {queue[currentIndex + 1] && (
                  <div className="absolute inset-0 bg-surface-900 border border-surface-800 rounded-3xl scale-[0.95] opacity-40" />
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
                className="w-14 h-14 rounded-full bg-surface-900 border border-surface-800 flex items-center justify-center text-danger hover:bg-danger/10 hover:border-danger/40 transition-[background-color,border-color] duration-200 active:scale-90 cursor-pointer shadow-sm"
              >
                <X className="h-6 w-6" />
              </button>
              <button
                onClick={() => handleSwipe('right')}
                className="w-18 h-18 rounded-full bg-accent flex items-center justify-center text-white hover:bg-accent-light transition-colors duration-200 active:scale-90 cursor-pointer shadow-float"
              >
                <Heart className="h-8 w-8" fill="white" />
              </button>
            </div>
          )}
        </motion.div>

        {/* Match Modal */}
        <Modal isOpen={showMatch} onClose={() => setShowMatch(false)}>
          <div className="text-center py-6">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3, ease: easeOut }}
            >
              <Sparkles className="h-14 w-14 text-warning mx-auto mb-4" />
            </motion.div>
            <h2 className="text-2xl font-bold font-heading text-white mb-2">It is a Match!</h2>
            <p className="text-surface-400 mb-6 text-sm">
              You and <span className="text-white font-medium">{matchName}</span> are interested in each other.
            </p>
            <div className="flex gap-3">
              <Button variant="outline" className="border-surface-700 text-white hover:bg-surface-800 flex-1" onClick={() => setShowMatch(false)}>Keep Swiping</Button>
              <Button variant="accent" onClick={() => { setShowMatch(false); window.location.href = '/chat'; }} className="flex-1">Send Message</Button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
}

// Draggable Swipe Card
function SwipeCard({ item, onSwipe, forcedDirection }: {
  item: SwipeItem; onSwipe: (dir: 'left' | 'right') => void;
  forcedDirection: 'left' | 'right' | null;
}) {
  const [imageIndex, setImageIndex] = useState(0);
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-12, 12]);
  const likeOpacity = useTransform(x, [0, 100], [0, 1]);
  const skipOpacity = useTransform(x, [-100, 0], [1, 0]);

  const handleDragEnd = (_: unknown, info: { offset: { x: number }; velocity: { x: number } }) => {
    const threshold = 100;
    if (info.offset.x > threshold || info.velocity.x > 500) onSwipe('right');
    else if (info.offset.x < -threshold || info.velocity.x < -500) onSwipe('left');
  };

  const hasImages = item.images && item.images.length > 0;
  
  const handleNextPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasImages && imageIndex < item.images!.length - 1) {
      setImageIndex(prev => prev + 1);
    }
  };

  const handlePrevPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasImages && imageIndex > 0) {
      setImageIndex(prev => prev - 1);
    }
  };

  const currentImagePath = hasImages ? item.images![imageIndex] : null;
  const coverImage = currentImagePath ? (currentImagePath.startsWith('/') ? `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${currentImagePath}` : currentImagePath) : null;

  return (
    <motion.div
      className="absolute inset-0 cursor-grab active:cursor-grabbing"
      style={{ x, rotate }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.9}
      onDragEnd={handleDragEnd}
      animate={forcedDirection === 'right' ? { x: 500, opacity: 0, rotate: 15 } :
        forcedDirection === 'left' ? { x: -500, opacity: 0, rotate: -15 } : {}}
      transition={{ type: 'spring', duration: 0.5, bounce: 0.2 }}
      exit={{ opacity: 0 }}
    >
      <div className="w-full h-full bg-surface-900 rounded-3xl flex flex-col relative overflow-hidden shadow-float border border-surface-800">
        {/* Background Image */}
        {coverImage ? (
          <div className="absolute inset-0">
            <img src={coverImage} alt={item.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-surface-950/90 via-surface-950/30 to-transparent pointer-events-none" />
          </div>
        ) : (
          <div className="absolute inset-0 bg-surface-800" />
        )}

        {/* Tap Zones for Carousel Navigation */}
        {hasImages && item.images!.length > 1 && (
          <>
            <div 
              className="absolute inset-y-0 left-0 w-[40%] z-20 cursor-pointer"
              onClick={handlePrevPhoto}
            />
            <div 
              className="absolute inset-y-0 right-0 w-[60%] z-20 cursor-pointer"
              onClick={handleNextPhoto}
            />
          </>
        )}

        {/* Image indicators */}
        {hasImages && item.images!.length > 1 && (
          <div className="absolute top-4 inset-x-0 flex justify-center gap-1.5 px-4 z-20 pointer-events-none">
            {item.images!.map((_, i) => (
              <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i === imageIndex ? 'bg-white shadow-sm' : 'bg-white/30'}`} />
            ))}
          </div>
        )}

        {/* Like/Skip overlays — solid backgrounds */}
        <motion.div style={{ opacity: likeOpacity }}
          className="absolute top-8 left-6 z-30 px-5 py-1.5 rounded-xl bg-accent text-white font-bold text-2xl font-heading -rotate-12">
          LIKE
        </motion.div>
        <motion.div style={{ opacity: skipOpacity }}
          className="absolute top-8 right-6 z-30 px-5 py-1.5 rounded-xl bg-danger text-white font-bold text-2xl font-heading rotate-12">
          NOPE
        </motion.div>

        {/* Content */}
        <div className={`absolute inset-x-0 bottom-0 p-6 flex flex-col justify-end z-20 text-white`}>
          <div className="flex items-center gap-4 mb-3">
            {!coverImage && (
              <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center text-accent text-xl font-bold shrink-0">
                {item.title[0]?.toUpperCase()}
              </div>
            )}
            <div className="min-w-0">
              <h3 className="text-2xl font-bold font-heading truncate tracking-tight">{item.title}</h3>
              <p className={`text-sm truncate ${coverImage ? 'text-white/75' : 'text-surface-400'}`}>{item.subtitle}</p>
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            {item.tags.map(tag => (
              <span key={tag} className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${coverImage ? 'bg-white/15 text-white' : 'bg-surface-800 text-surface-300 border border-surface-700'}`}>
                {tag}
              </span>
            ))}
          </div>

          <p className={`text-sm leading-relaxed mb-4 line-clamp-2 ${coverImage ? 'text-white/75' : 'text-surface-400'}`}>
            {item.description}
          </p>

          <div className={`pt-3 border-t flex flex-wrap gap-x-4 gap-y-1.5 text-xs font-medium ${coverImage ? 'border-white/15 text-white/80' : 'border-surface-800 text-surface-500'}`}>
            {item.location && (
              <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" />{item.location}</span>
            )}
            {item.budget && (
              <span className="flex items-center gap-1.5"><DollarSign className="h-3.5 w-3.5" />P{item.budget}</span>
            )}
            {item.availability && (
              <span className="flex items-center gap-1.5"><Star className="h-3.5 w-3.5" />{item.availability}</span>
            )}
            <span className="flex items-center gap-1.5">
              <Briefcase className="h-3.5 w-3.5" />{item.type === 'worker' ? 'Worker' : 'Job'}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
