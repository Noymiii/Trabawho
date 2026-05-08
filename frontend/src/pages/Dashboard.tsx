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
} from 'lucide-react';
import { matchAPI, jobAPI } from '../services/api';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ matches: 0, jobs: 0, messages: 0 });
  const [recentMatches, setRecentMatches] = useState<Array<{ id: number; createdAt: string; worker?: { fullname: string }; customer?: { fullname: string }; job?: { title: string } }>>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [matchRes] = await Promise.all([matchAPI.getAll()]);
        const matches = matchRes.data.matches || [];
        setRecentMatches(matches.slice(0, 10)); // Show more for horizontal scroll
        setStats((prev) => ({ ...prev, matches: matches.length }));

        if (user?.role === 'customer') {
          const jobRes = await jobAPI.getMine();
          setStats((prev) => ({ ...prev, jobs: jobRes.data.jobs?.length || 0 }));
        }
      } catch {
        // API might not be ready yet
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [user]);

  return (
    <div className="min-h-dvh pt-24 pb-24 px-4 bg-surface-900 flex justify-center">
      <div className="w-full max-w-md">
        
        {/* Profile Header section */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center mb-10"
        >
          <div className="relative group cursor-pointer hover:scale-105 transition-transform" onClick={() => navigate('/profile')}>
            <div className="w-28 h-28 rounded-full bg-surface-800 border-4 border-surface-900 flex items-center justify-center text-5xl font-bold text-surface-300 shadow-xl overflow-hidden relative">
              {/* Optional background glow inside avatar */}
              <div className="absolute inset-0 bg-primary/10" />
              {user?.fullname?.charAt(0).toUpperCase()}
            </div>
            {/* Online indicator */}
            <div className="absolute bottom-1 right-2 w-6 h-6 bg-success rounded-full border-4 border-surface-900 shadow-sm" />
          </div>
          <h1 className="mt-4 text-2xl font-bold font-heading text-surface-100">{user?.fullname}</h1>
          <p className="text-surface-400 font-medium text-sm capitalize px-4 py-1 mt-2 bg-surface-800 rounded-full">
            {user?.role} Mode
          </p>
        </motion.div>

        {/* Massive Primary CTA */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          whileHover={{ scale: 1.02 }} 
          whileTap={{ scale: 0.98 }} 
          className="mb-10"
        >
          <button 
            onClick={() => navigate('/swipe')} 
            className="w-full relative overflow-hidden rounded-[2rem] p-8 bg-surface-800 border-2 border-primary/20 shadow-sm flex items-center justify-between group cursor-pointer"
          >
            <div className="text-left relative z-10">
              <h2 className="text-surface-100 text-3xl font-bold font-heading mb-1">
                Start Swiping
              </h2>
              <p className="text-surface-400 text-sm font-medium">Discover your next match</p>
            </div>
            <div className="w-14 h-14 rounded-full bg-primary-gradient flex items-center justify-center group-hover:scale-110 transition-transform shadow-glow-primary">
              <ArrowRight className="h-6 w-6 text-white" />
            </div>
          </button>
        </motion.div>

        {/* Match Queue (Horizontal Bubble Scroll) */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-10"
        >
          <div className="flex items-center justify-between mb-4 px-2">
            <h3 className="text-lg font-bold text-surface-100">New Matches</h3>
            <span className="text-primary font-bold text-sm bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
              {stats.matches} Total
            </span>
          </div>
          
          <div className="flex gap-4 overflow-x-auto pb-4 px-2 custom-scrollbar">
            {isLoading ? (
              [1, 2, 3, 4].map(i => (
                <div key={i} className="w-16 h-16 rounded-full bg-surface-800 animate-pulse shrink-0 border-2 border-surface-700" />
              ))
            ) : recentMatches.length > 0 ? (
              recentMatches.map(match => {
                const partnerName = user?.role === 'customer' ? match.worker?.fullname : match.customer?.fullname;
                return (
                  <div key={match.id} className="flex flex-col items-center gap-2 shrink-0 w-16 group">
                    <div className="w-16 h-16 rounded-full bg-surface-800 border-2 border-primary flex items-center justify-center text-xl font-bold text-primary cursor-pointer group-hover:scale-110 transition-transform shadow-md relative">
                      {partnerName?.[0]?.toUpperCase() || '?'}
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-primary rounded-full border-2 border-surface-900 flex items-center justify-center">
                        <Heart className="h-2.5 w-2.5 text-white" fill="white" />
                      </div>
                    </div>
                    <span className="text-xs font-bold text-surface-300 truncate w-full text-center group-hover:text-surface-100 transition-colors">
                      {partnerName?.split(' ')[0]}
                    </span>
                  </div>
                );
              })
            ) : (
              <div className="w-full p-6 border-2 border-dashed border-surface-700 rounded-[2rem] flex flex-col items-center justify-center text-center bg-surface-800/30">
                <div className="w-12 h-12 rounded-full bg-surface-800 flex items-center justify-center mb-3">
                  <Heart className="h-6 w-6 text-surface-500" />
                </div>
                <p className="text-surface-300 font-bold mb-1">It's quiet here</p>
                <p className="text-surface-500 text-xs">Swipe to find matches</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Action Grid */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-2 gap-4"
        >
          <button 
            onClick={() => navigate('/chat')} 
            className="flex flex-col items-center justify-center p-8 rounded-[2rem] bg-surface-800 hover:border-info/30 border-2 border-transparent transition-colors cursor-pointer group shadow-sm"
          >
            <MessageCircle className="h-8 w-8 text-info mb-4 group-hover:scale-110 transition-transform" />
            <span className="font-bold text-surface-100 text-lg mb-1">Messages</span>
            <span className="text-xs font-medium text-info bg-info/10 px-3 py-1 rounded-full">
              {stats.messages} Unread
            </span>
          </button>
          
          <button 
            onClick={() => navigate(user?.role === 'customer' ? '/post-job' : '/profile')} 
            className="flex flex-col items-center justify-center p-8 rounded-[2rem] bg-surface-800 hover:border-accent/30 border-2 border-transparent transition-colors cursor-pointer group shadow-sm"
          >
            {user?.role === 'customer' ? (
              <Briefcase className="h-8 w-8 text-accent mb-4 group-hover:scale-110 transition-transform" />
            ) : (
              <Users className="h-8 w-8 text-accent mb-4 group-hover:scale-110 transition-transform" />
            )}
            <span className="font-bold text-surface-100 text-lg mb-1">
              {user?.role === 'customer' ? 'Post Job' : 'Profile'}
            </span>
            <span className="text-xs font-medium text-accent bg-accent/10 px-3 py-1 rounded-full">
              {user?.role === 'customer' ? `${stats.jobs} Active` : 'Update skills'}
            </span>
          </button>
        </motion.div>
      </div>
    </div>
  );
}
