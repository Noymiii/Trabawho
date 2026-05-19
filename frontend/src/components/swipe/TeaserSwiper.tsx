import { useState } from 'react';
import { motion, useMotionValue, useTransform, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/Button';
import { useNavigate } from 'react-router-dom';
import { X, Heart, MapPin, DollarSign, Briefcase, Sparkles, ArrowRight } from 'lucide-react';

interface TeaserItem {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  tags: string[];
  location: string;
  budget: number;
  availability: string;
  image: string;
}

const MOCK_QUEUE: TeaserItem[] = [
  {
    id: 1,
    title: 'David Reyes',
    subtitle: 'Master Electrician',
    description: '10+ years experience in commercial and residential wiring. Fast, reliable, and always on time.',
    tags: ['Electrician', 'Wiring', 'Troubleshooting'],
    location: 'Quezon City',
    budget: 500,
    availability: 'Available Now',
    image: 'https://picsum.photos/seed/trabawho-david/800/1000'
  },
  {
    id: 2,
    title: 'Maria Santos',
    subtitle: 'Graphic Designer',
    description: 'Specializing in brand identity and UI/UX design. Let\'s build something beautiful together.',
    tags: ['Design', 'UI/UX', 'Branding'],
    location: 'Makati City',
    budget: 800,
    availability: 'Part-time',
    image: 'https://picsum.photos/seed/trabawho-maria/800/1000'
  },
  {
    id: 3,
    title: 'James Lim',
    subtitle: 'Full-stack Developer',
    description: 'React, Node.js, and Postgres expert. I can help bring your next startup idea to life.',
    tags: ['React', 'Node.js', 'Typescript'],
    location: 'BGC, Taguig',
    budget: 1200,
    availability: 'Full-time',
    image: 'https://picsum.photos/seed/trabawho-james/800/1000'
  }
];

export function TeaserSwiper() {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<'left' | 'right' | null>(null);

  const currentItem = MOCK_QUEUE[currentIndex];
  const hasMore = currentIndex < MOCK_QUEUE.length;

  const handleSwipe = (dir: 'left' | 'right') => {
    if (!currentItem) return;
    setDirection(dir);
    
    // Auto advance
    setTimeout(() => {
      setCurrentIndex(prev => prev + 1);
      setDirection(null);
    }, 300);
  };

  return (
    <div className="w-full max-w-md mx-auto relative h-[500px]">
      {!hasMore ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          className="absolute inset-0 bg-surface-900 border border-surface-800 rounded-[2rem] flex flex-col items-center justify-center p-8 text-center shadow-float"
        >
          <div className="w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center mb-6 relative rotate-3 border border-accent/20">
            <Sparkles className="h-10 w-10 text-accent" />
          </div>
          <h3 className="text-3xl font-bold font-heading mb-4 text-white tracking-tight">Sign up to see more</h3>
          <p className="text-surface-400 text-base mb-8 leading-relaxed max-w-[260px]">
            There are thousands of skilled professionals waiting to match with you.
          </p>
          <Button 
            onClick={() => navigate('/register')}
            className="w-full h-14 bg-white text-surface-950 hover:bg-surface-100 rounded-2xl text-lg font-bold shadow-[0_0_30px_rgba(255,255,255,0.1)]"
          >
            Create Free Account <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </motion.div>
      ) : (
        <AnimatePresence>
          {/* Next card preview */}
          {MOCK_QUEUE[currentIndex + 1] && (
            <div className="absolute inset-0 bg-surface-900 border border-surface-800 rounded-[2rem] scale-[0.95] translate-y-4 opacity-40 shadow-2xl" />
          )}

          {/* Current card */}
          {currentItem && (
            <TeaserCard
              key={currentItem.id}
              item={currentItem}
              onSwipe={handleSwipe}
              forcedDirection={direction}
            />
          )}
        </AnimatePresence>
      )}

      {/* Action Buttons */}
      {hasMore && (
        <div className="absolute -bottom-24 inset-x-0 flex items-center justify-center gap-6">
          <button
            onClick={() => handleSwipe('left')}
            className="w-16 h-16 rounded-full bg-surface-900 border border-surface-800 flex items-center justify-center text-danger hover:bg-danger/10 hover:border-danger/40 transition-[background-color,border-color] duration-200 active:scale-90 cursor-pointer shadow-lg"
          >
            <X className="h-7 w-7" />
          </button>
          <button
            onClick={() => handleSwipe('right')}
            className="w-20 h-20 rounded-full bg-accent flex items-center justify-center text-white hover:bg-accent-light transition-colors duration-200 active:scale-90 cursor-pointer shadow-[0_0_30px_rgba(var(--color-accent),0.3)]"
          >
            <Heart className="h-10 w-10" fill="white" />
          </button>
        </div>
      )}
    </div>
  );
}

// Draggable Teaser Card (derived from SwipeCard)
function TeaserCard({ item, onSwipe, forcedDirection }: {
  item: TeaserItem; onSwipe: (dir: 'left' | 'right') => void;
  forcedDirection: 'left' | 'right' | null;
}) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-12, 12]);
  const likeOpacity = useTransform(x, [0, 100], [0, 1]);
  const skipOpacity = useTransform(x, [-100, 0], [1, 0]);

  const handleDragEnd = (_: unknown, info: { offset: { x: number }; velocity: { x: number } }) => {
    const threshold = 100;
    if (info.offset.x > threshold || info.velocity.x > 500) onSwipe('right');
    else if (info.offset.x < -threshold || info.velocity.x < -500) onSwipe('left');
  };

  return (
    <motion.div
      className="absolute inset-0 cursor-grab active:cursor-grabbing z-10"
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
      <div className="w-full h-full bg-surface-900 rounded-[2rem] flex flex-col relative overflow-hidden shadow-float border border-surface-800">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img src={item.image} alt={item.title} className="w-full h-full object-cover" draggable={false} />
          <div className="absolute inset-0 bg-gradient-to-t from-surface-950/90 via-surface-950/30 to-transparent pointer-events-none" />
        </div>

        {/* Like/Skip overlays */}
        <motion.div style={{ opacity: likeOpacity }}
          className="absolute top-8 left-6 z-30 px-6 py-2 rounded-2xl bg-accent text-white font-bold text-3xl font-heading -rotate-12 pointer-events-none shadow-lg">
          LIKE
        </motion.div>
        <motion.div style={{ opacity: skipOpacity }}
          className="absolute top-8 right-6 z-30 px-6 py-2 rounded-2xl bg-danger text-white font-bold text-3xl font-heading rotate-12 pointer-events-none shadow-lg">
          NOPE
        </motion.div>

        {/* Content */}
        <div className={`absolute inset-x-0 bottom-0 p-8 flex flex-col justify-end z-20 text-white pointer-events-none`}>
          <div className="flex items-center gap-4 mb-4">
            <div className="min-w-0">
              <h3 className="text-3xl font-bold font-heading truncate tracking-tight text-white drop-shadow-md">{item.title}</h3>
              <p className="text-base truncate text-white/80 font-medium">{item.subtitle}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            {item.tags.map(tag => (
              <span key={tag} className="px-3 py-1 text-xs font-bold tracking-wide uppercase rounded-full bg-white/20 text-white backdrop-blur-sm shadow-sm">
                {tag}
              </span>
            ))}
          </div>

          <p className="text-sm leading-relaxed mb-6 line-clamp-2 text-white/90 drop-shadow-md">
            {item.description}
          </p>

          <div className="pt-4 border-t border-white/20 flex flex-wrap gap-x-5 gap-y-2 text-sm font-bold text-white/90 drop-shadow-md">
            <span className="flex items-center gap-2"><MapPin className="h-4 w-4 text-white" />{item.location}</span>
            <span className="flex items-center gap-2"><DollarSign className="h-4 w-4 text-white" />P{item.budget}</span>
            <span className="flex items-center gap-2"><Briefcase className="h-4 w-4 text-white" />Worker</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
