import { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { motion } from 'framer-motion';
import { ArrowRight, Users, MessageCircle, Briefcase, Zap } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const easeOut = [0.23, 1, 0.32, 1] as const;

const heroStagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.12, delayChildren: 0.3 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { duration: 0.9, ease: easeOut } },
};

const images = [
  'https://picsum.photos/seed/trabawho-hero/1920/1080',
  'https://picsum.photos/seed/trabawho-work/800/800',
  'https://picsum.photos/seed/trabawho-connect/800/800',
];

import { TeaserSwiper } from '../components/swipe/TeaserSwiper';

export default function Landing() {
  const navigate = useNavigate();
  const scrubRef = useRef<HTMLDivElement>(null);

  // GSAP: Scrubbing Text Reveal
  useEffect(() => {
    if (!scrubRef.current) return;
    const words = scrubRef.current.querySelectorAll('.scrub-word');
    gsap.set(words, { opacity: 0.1 });

    gsap.to(words, {
      opacity: 1,
      stagger: 0.15,
      ease: 'none',
      scrollTrigger: {
        trigger: scrubRef.current,
        start: 'top 70%',
        end: 'bottom 40%',
        scrub: 1,
      },
    });

    return () => ScrollTrigger.getAll().forEach(t => t.kill());
  }, []);

  const scrubText = "We built the fastest way to connect skilled workers with people who need them. No job boards. No endless scrolling. Just swipe, match, and get to work.";
  const scrubWords = scrubText.split(' ');

  return (
    <main className="overflow-x-hidden w-full max-w-full bg-surface-50 text-surface-950 font-sans">
      
      {/* ─── ATTENTION: Cinematic Center Hero ─── */}
      <section className="relative min-h-[100dvh] flex flex-col items-center justify-center text-center px-6 py-16 md:py-32">
        {/* Background wash */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ 
            backgroundImage: `url(${images[0]})`,
            filter: 'grayscale(100%) contrast(125%) brightness(30%)',
          }} 
        />
        <div className="absolute inset-0 bg-gradient-to-b from-surface-950/60 via-surface-950/40 to-surface-50" />

        <motion.div 
          className="relative z-10 w-full max-w-6xl mx-auto"
          variants={heroStagger}
          initial="hidden"
          animate="show"
        >
          <motion.h1 
            variants={fadeUp}
            className="text-[clamp(3.5rem,8vw,8rem)] font-extrabold font-heading leading-[0.9] tracking-tighter text-white text-balance mb-10"
          >
            Find skilled{' '}
            <span 
              className="hidden sm:inline-block w-20 md:w-36 h-[clamp(2rem,4vw,4rem)] rounded-full align-middle bg-cover bg-center mx-2 border border-white/20"
              style={{ backgroundImage: `url(${images[1]})`, filter: 'grayscale(80%) contrast(110%)' }}
            />
            {' '}workers fast.
          </motion.h1>
          
          <motion.p variants={fadeUp} className="text-lg md:text-xl text-white/60 max-w-[55ch] mx-auto mb-14 leading-relaxed text-pretty">
            The high-agency platform for Metro Manila. Swipe to match with professionals, message directly, hire instantly.
          </motion.p>
          
          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button 
              size="lg" 
              onClick={() => navigate('/register')} 
              className="h-14 px-10 text-base bg-white text-surface-950 hover:bg-surface-100 shadow-float"
            >
              Start Matching <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              onClick={() => navigate('/login')}
              className="h-14 px-10 text-base border-white/20 text-white hover:bg-white/10"
            >
              Sign In
            </Button>
          </motion.div>
        </motion.div>
      </section>

      {/* ─── INTEREST: Infinite Marquee ─── */}
      <section className="py-10 border-y border-card-border overflow-hidden bg-white select-none">
        <div className="relative flex overflow-hidden">
          <div className="flex shrink-0 gap-16 animate-marquee">
            {Array(3).fill(['Electricians', 'Plumbers', 'Designers', 'Tutors', 'Carpenters', 'Mechanics', 'Developers', 'Cleaners']).flat().map((skill, i) => (
              <span key={i} className="text-2xl md:text-3xl font-heading font-bold text-surface-200 uppercase tracking-[0.2em] whitespace-nowrap">{skill}</span>
            ))}
          </div>
          <div className="flex shrink-0 gap-16 animate-marquee" aria-hidden="true">
            {Array(3).fill(['Electricians', 'Plumbers', 'Designers', 'Tutors', 'Carpenters', 'Mechanics', 'Developers', 'Cleaners']).flat().map((skill, i) => (
              <span key={`d-${i}`} className="text-2xl md:text-3xl font-heading font-bold text-surface-200 uppercase tracking-[0.2em] whitespace-nowrap">{skill}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ─── INTEREST: Gapless Bento Grid ─── */}
      <section className="py-24 md:py-48 px-6 lg:px-12 bg-surface-950">
        <div className="max-w-[1400px] mx-auto">
          <h2 className="text-4xl md:text-6xl font-bold font-heading text-white tracking-tighter leading-none mb-16 md:mb-24 max-w-3xl text-balance">
            The architecture of modern work
          </h2>
          
          {/* 4-col gapless grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 auto-rows-[220px] border border-surface-800 rounded-[2rem] overflow-hidden bg-surface-950">
            
            {/* Card 1: 2x2 hero card */}
            <div className="col-span-1 md:col-span-2 row-span-2 p-8 md:p-12 flex flex-col justify-between overflow-hidden relative group cursor-pointer border-b md:border-b-0 md:border-r border-surface-800 bg-surface-900/30 hover:bg-surface-900/80 transition-colors duration-500">
              <div 
                className="absolute inset-0 bg-cover bg-center opacity-[0.03] group-hover:opacity-10 mix-blend-luminosity group-hover:scale-105 transition-all duration-700 ease-out" 
                style={{ backgroundImage: `url(${images[2]})` }}
              />
              <Users className="h-8 w-8 md:h-10 md:w-10 text-white relative z-10 opacity-70 group-hover:opacity-100 group-hover:text-accent transition-all duration-500" />
              <div className="relative z-10 mt-auto transform group-hover:-translate-y-2 transition-transform duration-500 ease-out">
                <h3 className="text-3xl md:text-4xl font-heading font-bold text-white mb-3 tracking-tight">Vetted Talent</h3>
                <p className="text-surface-400 max-w-sm text-sm md:text-base leading-relaxed group-hover:text-surface-300 transition-colors duration-500">Access a curated network of skilled professionals across Metro Manila. Verified and ready.</p>
              </div>
            </div>
            
            {/* Card 2: 1x2 tall card */}
            <div className="col-span-1 row-span-2 p-6 md:p-10 flex flex-col justify-between overflow-hidden relative group cursor-pointer border-b md:border-b-0 md:border-r border-surface-800 bg-surface-900/10 hover:bg-surface-900/60 transition-colors duration-500">
              <div className="absolute top-0 right-0 p-8 transform translate-x-4 -translate-y-4 opacity-0 group-hover:opacity-10 group-hover:translate-x-0 group-hover:translate-y-0 transition-all duration-500">
                <MessageCircle className="w-48 h-48 text-accent" />
              </div>
              <MessageCircle className="h-6 w-6 md:h-8 md:w-8 text-surface-500 group-hover:text-white transition-colors duration-500 relative z-10" />
              <div className="relative z-10 transform group-hover:-translate-y-2 transition-transform duration-500 ease-out">
                <h3 className="text-xl md:text-2xl font-heading font-bold text-white tracking-tight mb-2">Direct Chat</h3>
                <p className="text-surface-500 text-sm leading-relaxed group-hover:text-surface-400 transition-colors duration-500">No middlemen. Coordinate timelines directly.</p>
              </div>
            </div>
            
            {/* Card 3: 1x1 */}
            <div className="col-span-1 row-span-1 p-6 md:p-10 flex flex-col justify-between overflow-hidden relative group cursor-pointer border-b border-surface-800 bg-surface-900/10 hover:bg-surface-900/60 transition-colors duration-500">
              <Briefcase className="h-6 w-6 md:h-8 md:w-8 text-surface-500 group-hover:text-white transition-colors duration-500 relative z-10" />
              <h3 className="text-lg md:text-xl font-heading font-bold text-white tracking-tight relative z-10 transform group-hover:-translate-y-1 transition-transform duration-500 ease-out">Post Jobs</h3>
            </div>
            
            {/* Card 4: 1x1 */}
            <div className="col-span-1 row-span-1 p-6 md:p-10 flex flex-col justify-between overflow-hidden relative group cursor-pointer bg-surface-900/20 hover:bg-surface-900/80 transition-colors duration-500">
              <Zap className="h-6 w-6 md:h-8 md:w-8 text-surface-500 group-hover:text-accent transition-colors duration-500 relative z-10" />
              <h3 className="text-lg md:text-xl font-heading font-bold text-white tracking-tight relative z-10 transform group-hover:-translate-y-1 transition-transform duration-500 ease-out">Instant Match</h3>
            </div>
          </div>
        </div>
      </section>

      {/* ─── DESIRE: GSAP Scrubbing Text Reveal ─── */}
      <section className="py-32 md:py-48 px-6 lg:px-12 bg-surface-950">
        <div className="max-w-[1400px] mx-auto">
          <div ref={scrubRef} className="max-w-4xl mx-auto">
            <p className="text-3xl md:text-5xl font-heading font-bold leading-tight tracking-tight text-balance">
              {scrubWords.map((word, i) => (
                <span key={i} className="scrub-word text-white inline-block mr-[0.3em]">{word}</span>
              ))}
            </p>
          </div>
        </div>
      </section>

      {/* ─── ACTION: Interactive Teaser Swiper ─── */}
      <section className="relative bg-surface-950 border-t border-surface-800 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/2 right-0 w-[800px] h-[800px] bg-accent/5 rounded-full blur-[120px] translate-x-1/3 -translate-y-1/2" />
        </div>
        <div className="max-w-[1400px] mx-auto grid lg:grid-cols-2 gap-16 lg:gap-24 px-6 lg:px-12 items-center py-32 md:py-48 relative z-10">
          
          {/* Left Text */}
          <div className="flex flex-col justify-center">
            <div className="inline-block px-4 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-accent font-bold text-sm tracking-widest uppercase mb-8 w-max">
              Try It Out
            </div>
            <h2 className="text-4xl md:text-6xl font-bold font-heading text-white leading-[1.1] tracking-tighter mb-8 text-balance">
              Match with top talent in seconds.
            </h2>
            <p className="text-surface-400 text-lg md:text-xl max-w-lg leading-relaxed text-pretty mb-10">
              No endless job boards. Swipe right to like a professional, swipe left to pass. If they like your job posting back, it's a match.
            </p>
          </div>

          {/* Interactive Swiper */}
          <div className="w-full flex justify-center lg:justify-end">
            <TeaserSwiper />
          </div>
        </div>
      </section>

      {/* ─── ACTION: Massive CTA Footer ─── */}
      <section className="py-32 md:py-48 px-6 lg:px-12 bg-surface-950 text-center">
        <div className="max-w-[1400px] mx-auto">
          <h2 className="text-5xl md:text-7xl font-bold font-heading text-white tracking-tighter leading-none mb-8 text-balance">
            Ready to get started?
          </h2>
          <p className="text-surface-400 text-lg max-w-[45ch] mx-auto mb-14 leading-relaxed">
            No credit card required. Setup takes 2 minutes.
          </p>
          <Button 
            size="lg"
            onClick={() => navigate('/register')}
            className="h-16 px-12 text-lg bg-white text-surface-950 hover:bg-surface-100 shadow-float"
          >
            Join TRABAWHO <ArrowRight className="h-5 w-5 ml-3" />
          </Button>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="py-12 md:py-16 px-6 lg:px-12 bg-surface-950 border-t border-surface-800">
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center">
              <span className="text-surface-950 font-heading font-bold text-sm">T</span>
            </div>
            <span className="font-heading font-bold text-white text-lg tracking-tight">TRABAWHO</span>
          </div>
          <p className="text-surface-500 text-xs">&copy; 2026 TRABAWHO. All rights reserved.</p>
        </div>
      </footer>
      
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-100%); }
        }
        .animate-marquee {
          animation: marquee 25s linear infinite;
        }
      `}</style>
    </main>
  );
}
