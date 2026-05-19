import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Briefcase,
  Users,
  Heart,
  MessageCircle,
  ArrowRight,
  TrendingUp,
  Clock,
  Sparkles
} from 'lucide-react';
import { matchAPI, jobAPI, workerAPI } from '../services/api';
import { WorkerOnboarding } from '../components/onboarding/WorkerOnboarding';
import { CustomerOnboarding } from '../components/onboarding/CustomerOnboarding';

const easeOut = [0.23, 1, 0.32, 1] as const;
const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: easeOut } },
};

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ matches: 0, jobs: 0, messages: 0 });
  const [recentMatches, setRecentMatches] = useState<Array<{ id: number; createdAt: string; worker?: { fullname: string; avatar?: string }; customer?: { fullname: string; avatar?: string }; job?: { title: string } }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [matchRes] = await Promise.all([matchAPI.getAll()]);
      const matches = matchRes.data.matches || [];
      setRecentMatches(matches.slice(0, 10));
      setStats((prev) => ({ ...prev, matches: matches.length }));

      if (user?.role === 'customer') {
        const jobRes = await jobAPI.getMine();
        const jobsCount = jobRes.data.jobs?.length || 0;
        setStats((prev) => ({ ...prev, jobs: jobsCount }));
        if (jobsCount === 0) {
          setShowOnboarding(true);
        }
      } else if (user?.role === 'worker') {
        // Fetch worker profile to check onboarding status
        const profileRes = await workerAPI.getProfile();
        const profile = profileRes.data.profile;
        if (profile && (!profile.location || profile.skills.length === 0)) {
          setShowOnboarding(true);
        }
      }
    } catch {
      // API might not be ready yet
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  return (
    <>
      {showOnboarding && (
        user?.role === 'customer' ? (
          <CustomerOnboarding 
            onComplete={() => {
              setShowOnboarding(false);
              fetchData();
            }}
            onSkip={() => setShowOnboarding(false)}
          />
        ) : (
          <WorkerOnboarding 
            onComplete={() => {
              setShowOnboarding(false);
              fetchData();
            }} 
          />
        )
      )}
      <div className="min-h-dvh pt-24 pb-24 px-6 lg:px-12 bg-surface-950 flex justify-center">
      <div className="w-full max-w-6xl">
        <motion.div variants={stagger} initial="hidden" animate="show" className="mb-12">
          <motion.h1 variants={fadeUp} className="text-4xl md:text-5xl font-bold font-heading text-white tracking-tight mb-2">
            Welcome back, <span className="text-surface-400">{user?.fullname?.split(' ')[0]}</span>
          </motion.h1>
          <motion.p variants={fadeUp} className="text-surface-500 text-lg">
            Here's what's happening with your connections today.
          </motion.p>
        </motion.div>

        {/* Bento Grid */}
        <motion.div variants={stagger} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 auto-rows-[200px] gap-4 md:gap-6">
          
          {/* Card 1: Profile & Stats (2x2 on Desktop, 1x2 on Tablet) */}
          <motion.div variants={fadeUp} className="col-span-1 md:col-span-2 lg:col-span-2 row-span-2 bg-surface-900/40 rounded-[2rem] p-8 md:p-10 border border-surface-800 flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none transition-transform duration-700 group-hover:scale-110 group-hover:-rotate-12">
              <TrendingUp className="w-64 h-64 text-white" />
            </div>
            
            <div className="flex items-center gap-5 relative z-10">
              <button onClick={() => navigate('/profile')} className="relative cursor-pointer group/avatar">
                <div className="w-20 h-20 rounded-[1.25rem] bg-surface-800 flex items-center justify-center text-3xl font-bold text-white overflow-hidden transition-[border-radius,background-color] duration-500 group-hover/avatar:rounded-full group-hover/avatar:bg-accent/20">
                  {user?.avatar ? (
                    <img 
                      src={user.avatar.startsWith('/') ? `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${user.avatar}` : user.avatar} 
                      alt={user?.fullname} 
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    user?.fullname?.charAt(0).toUpperCase()
                  )}
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-accent rounded-full border-[3px] border-surface-900 flex items-center justify-center">
                  <Sparkles className="w-3 h-3 text-white" />
                </div>
              </button>
              <div>
                <h2 className="text-2xl font-bold font-heading text-white tracking-tight">{user?.fullname}</h2>
                <span className="text-accent font-medium text-sm capitalize tracking-wide">
                  {user?.role} Account
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-8 relative z-10">
              <div className="bg-surface-800/50 rounded-2xl p-5 border border-surface-800/50 backdrop-blur-sm">
                <span className="text-surface-500 text-sm font-medium block mb-1">Total Matches</span>
                <span className="text-3xl font-bold font-heading text-white">{stats.matches}</span>
              </div>
              <div className="bg-surface-800/50 rounded-2xl p-5 border border-surface-800/50 backdrop-blur-sm">
                <span className="text-surface-500 text-sm font-medium block mb-1">Unread Messages</span>
                <span className="text-3xl font-bold font-heading text-white">{stats.messages}</span>
              </div>
            </div>
          </motion.div>

          {/* Card 2: Primary Action - Swipe (2x1) */}
          <motion.div variants={fadeUp} onClick={() => navigate('/swipe')} className="col-span-1 md:col-span-2 lg:col-span-2 row-span-1 bg-accent/10 rounded-[2rem] p-8 border border-accent/20 flex items-center justify-between cursor-pointer group hover:bg-accent/20 transition-colors duration-500 overflow-hidden relative">
            <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/4 opacity-10 group-hover:translate-x-0 transition-transform duration-700 ease-out">
              <Heart className="w-48 h-48 text-accent" />
            </div>
            <div className="relative z-10">
              <h2 className="text-3xl font-bold font-heading text-white tracking-tight mb-2 flex items-center gap-3">
                Start Swiping <ArrowRight className="h-6 w-6 text-accent transform group-hover:translate-x-2 transition-transform duration-300" />
              </h2>
              <p className="text-surface-300 text-base max-w-sm">Discover and connect with the best {user?.role === 'customer' ? 'talent' : 'opportunities'} in your area right now.</p>
            </div>
          </motion.div>

          {/* Card 3: Matches Queue (1x2 on Desktop) */}
          <motion.div variants={fadeUp} className="col-span-1 md:col-span-1 lg:col-span-1 row-span-2 bg-surface-900/30 rounded-[2rem] border border-surface-800 p-6 flex flex-col relative overflow-hidden group hover:border-surface-700 transition-colors duration-500">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold font-heading text-white tracking-tight">Recent Matches</h3>
              <div className="w-8 h-8 rounded-full bg-surface-800 flex items-center justify-center">
                <Clock className="w-4 h-4 text-surface-400" />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-4">
              {isLoading ? (
                [1, 2, 3].map(i => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full skeleton shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-20 skeleton rounded" />
                      <div className="h-3 w-12 skeleton rounded" />
                    </div>
                  </div>
                ))
              ) : recentMatches.length > 0 ? (
                recentMatches.map((match, i) => {
                  const partnerName = user?.role === 'customer' ? match.worker?.fullname : match.customer?.fullname;
                  const partnerAvatar = user?.role === 'customer' ? match.worker?.avatar : match.customer?.avatar;
                  return (
                    <motion.div
                      key={match.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1, duration: 0.4, ease: easeOut }}
                      onClick={() => navigate('/chat', { state: { matchId: match.id } })}
                      className="flex items-center gap-3 cursor-pointer group/item"
                    >
                      <div className="w-12 h-12 rounded-full bg-surface-800 border border-surface-700 flex items-center justify-center text-sm font-bold text-surface-400 group-hover/item:border-accent transition-colors duration-200 overflow-hidden shrink-0">
                        {partnerAvatar ? (
                          <img 
                            src={partnerAvatar.startsWith('/') ? `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${partnerAvatar}` : partnerAvatar} 
                            alt={partnerName} 
                            className="w-full h-full object-cover" 
                          />
                        ) : (
                          partnerName?.[0]?.toUpperCase() || '?'
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-white truncate group-hover/item:text-accent transition-colors duration-200">{partnerName}</p>
                        <p className="text-xs text-surface-500 truncate">{match.job?.title || 'New Match'}</p>
                      </div>
                    </motion.div>
                  );
                })
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
                  <Heart className="w-8 h-8 text-surface-500 mb-3" />
                  <p className="text-sm font-medium text-surface-400">No matches yet</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Card 4: Messages Action (1x1) */}
          <motion.div variants={fadeUp} onClick={() => navigate('/chat')} className="col-span-1 md:col-span-2 lg:col-span-1 row-span-1 bg-surface-900/30 rounded-[2rem] p-6 border border-surface-800 flex flex-col justify-between cursor-pointer group hover:bg-surface-900/80 transition-colors duration-500">
            <div className="w-12 h-12 rounded-2xl bg-surface-800 flex items-center justify-center group-hover:scale-110 transition-transform duration-500 ease-out">
              <MessageCircle className="w-6 h-6 text-surface-400 group-hover:text-white transition-colors duration-300" />
            </div>
            <div>
              <h3 className="text-xl font-bold font-heading text-white tracking-tight flex items-center gap-2">
                Messages {stats.messages > 0 && <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />}
              </h3>
              <p className="text-surface-500 text-sm mt-1 group-hover:text-surface-400 transition-colors duration-300">Continue your conversations</p>
            </div>
          </motion.div>

          {/* Card 5: Post Job / Profile (1x1) */}
          <motion.div variants={fadeUp} onClick={() => navigate(user?.role === 'customer' ? '/post-job' : '/profile')} className="col-span-1 md:col-span-2 lg:col-span-1 row-span-1 bg-surface-900/30 rounded-[2rem] p-6 border border-surface-800 flex flex-col justify-between cursor-pointer group hover:bg-surface-900/80 transition-colors duration-500">
            <div className="w-12 h-12 rounded-2xl bg-surface-800 flex items-center justify-center group-hover:scale-110 transition-transform duration-500 ease-out">
              {user?.role === 'customer' ? (
                <Briefcase className="w-6 h-6 text-surface-400 group-hover:text-white transition-colors duration-300" />
              ) : (
                <Users className="w-6 h-6 text-surface-400 group-hover:text-white transition-colors duration-300" />
              )}
            </div>
            <div>
              <h3 className="text-xl font-bold font-heading text-white tracking-tight">
                {user?.role === 'customer' ? 'Manage Jobs' : 'Your Profile'}
              </h3>
              <p className="text-surface-500 text-sm mt-1 group-hover:text-surface-400 transition-colors duration-300">
                {user?.role === 'customer' ? `${stats.jobs} active postings` : 'Update your availability'}
              </p>
            </div>
          </motion.div>

        </motion.div>
      </div>
    </div>
    </>
  );
}
