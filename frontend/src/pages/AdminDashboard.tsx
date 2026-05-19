import { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { motion } from 'framer-motion';
import { Users, Briefcase, Heart, Trash2, Shield, TrendingUp } from 'lucide-react';
import type { User, PlatformStats } from '../types';
import { cn } from '../lib/utils';

type Tab = 'overview' | 'users' | 'jobs' | 'matches';

const easeOut = [0.23, 1, 0.32, 1] as const;

export default function AdminDashboard() {
  const [tab, setTab] = useState<Tab>('overview');
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, usersRes] = await Promise.all([adminAPI.getStats(), adminAPI.getUsers()]);
        setStats(statsRes.data); setUsers(usersRes.data.users || []);
      } catch { /* */ }
      finally { setIsLoading(false); }
    };
    fetchData();
  }, []);

  const deleteUser = async (id: number) => {
    if (!confirm('Delete this user? This cannot be undone.')) return;
    try { await adminAPI.deleteUser(id); setUsers(prev => prev.filter(u => u.id !== id)); } catch { /* */ }
  };

  const tabs: { id: Tab; label: string }[] = [
    { id: 'overview', label: 'Overview' }, { id: 'users', label: 'Users' },
    { id: 'jobs', label: 'Jobs' }, { id: 'matches', label: 'Matches' },
  ];

  const statCards = stats ? [
    { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'bg-primary' },
    { label: 'Workers', value: stats.totalWorkers, icon: Users, color: 'bg-accent' },
    { label: 'Jobs', value: stats.totalJobs, icon: Briefcase, color: 'bg-blue-600' },
    { label: 'Matches', value: stats.totalMatches, icon: Heart, color: 'bg-warning' },
  ] : [];

  if (isLoading) return (
    <div className="min-h-dvh pt-20 flex items-center justify-center bg-surface-950">
      <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-dvh pt-20 pb-8 px-4 bg-surface-950">
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: easeOut }}>
          <div className="mb-6">
            <h1 className="text-2xl font-bold font-heading flex items-center gap-2 text-white">
              <Shield className="h-6 w-6 text-accent" /> Admin Dashboard
            </h1>
            <p className="text-surface-400 text-sm mt-1">Manage platform users, jobs, and matches</p>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mb-6 p-1 bg-surface-900 rounded-xl w-fit border border-surface-800">
            {tabs.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={cn('px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-150 cursor-pointer',
                  tab === t.id ? 'bg-surface-800 shadow-sm text-accent font-semibold' : 'text-surface-400 hover:text-white')}
                style={{ transitionTimingFunction: 'var(--ease-out)' }}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Overview */}
          {tab === 'overview' && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {statCards.map((s, i) => (
                <motion.div key={s.label}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08, duration: 0.4, ease: easeOut }}
                  className="card p-5"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shadow-sm", 
                      s.label === 'Total Users' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' :
                      s.label === 'Workers' ? 'bg-accent/10 text-accent border border-accent/20' :
                      s.label === 'Jobs' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                      'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    )}>
                      <s.icon className="h-5 w-5" />
                    </div>
                    <TrendingUp className="h-4 w-4 text-success" />
                  </div>
                  <div className="text-3xl font-bold font-heading text-white">{s.value}</div>
                  <div className="text-sm font-medium text-surface-400 mt-1">{s.label}</div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Users */}
          {tab === 'users' && (
            <div className="card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-surface-800 bg-surface-900/40">
                      <th className="text-left p-4 text-xs font-semibold text-surface-400 uppercase tracking-wider">Name</th>
                      <th className="text-left p-4 text-xs font-semibold text-surface-400 uppercase tracking-wider">Email</th>
                      <th className="text-left p-4 text-xs font-semibold text-surface-400 uppercase tracking-wider">Role</th>
                      <th className="text-left p-4 text-xs font-semibold text-surface-400 uppercase tracking-wider">Joined</th>
                      <th className="text-right p-4 text-xs font-semibold text-surface-400 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-800">
                    {users.map((u, i) => (
                      <motion.tr
                        key={u.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.03, duration: 0.3, ease: easeOut }}
                        className="hover:bg-surface-800 transition-colors duration-150"
                      >
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-surface-800 border border-surface-700 flex items-center justify-center text-surface-400 text-xs font-bold">{u.fullname[0]?.toUpperCase()}</div>
                            <span className="text-sm font-semibold text-white">{u.fullname}</span>
                          </div>
                        </td>
                        <td className="p-4 text-sm text-surface-400">{u.email}</td>
                        <td className="p-4"><Badge variant={u.role === 'admin' ? 'danger' : u.role === 'worker' ? 'primary' : 'accent'}>{u.role}</Badge></td>
                        <td className="p-4 text-sm text-surface-400 font-medium">{new Date(u.createdAt).toLocaleDateString()}</td>
                        <td className="p-4 text-right">
                          {u.role !== 'admin' && (
                            <Button variant="ghost" size="icon" onClick={() => deleteUser(u.id)} className="text-surface-400 hover:text-danger hover:bg-danger/10 h-8 w-8">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {tab === 'jobs' && <div className="card p-12 text-center text-surface-400 font-medium">Job management — coming in next phase</div>}
          {tab === 'matches' && <div className="card p-12 text-center text-surface-400 font-medium">Match monitoring — coming in next phase</div>}
        </motion.div>
      </div>
    </div>
  );
}
