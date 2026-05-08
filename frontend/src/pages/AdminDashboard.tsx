import { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { motion } from 'framer-motion';
import { Users, Briefcase, Heart, Trash2, Shield, TrendingUp } from 'lucide-react';
import type { User, PlatformStats } from '../types';
import { cn } from '../lib/utils';

type Tab = 'overview' | 'users' | 'jobs' | 'matches';

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
    { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'from-primary to-secondary' },
    { label: 'Workers', value: stats.totalWorkers, icon: Users, color: 'from-accent to-accent-dark' },
    { label: 'Jobs', value: stats.totalJobs, icon: Briefcase, color: 'from-info to-blue-700' },
    { label: 'Matches', value: stats.totalMatches, icon: Heart, color: 'from-warning to-orange-600' },
  ] : [];

  if (isLoading) return (
    <div className="min-h-dvh pt-20 flex items-center justify-center">
      <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
    </div>
  );

  return (
    <div className="min-h-dvh pt-20 pb-8 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="mb-6">
            <h1 className="text-2xl font-bold font-heading flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary" /> Admin Dashboard
            </h1>
            <p className="text-surface-400 text-sm">Manage platform users, jobs, and matches</p>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mb-6 p-1 glass rounded-[var(--radius-md)] w-fit">
            {tabs.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={cn('px-4 py-2 text-sm font-medium rounded-[var(--radius-sm)] transition-all cursor-pointer',
                  tab === t.id ? 'gradient-primary text-white' : 'text-surface-400 hover:text-surface-200')}>
                {t.label}
              </button>
            ))}
          </div>

          {/* Overview */}
          {tab === 'overview' && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {statCards.map((s, i) => (
                <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }} className="glass rounded-[var(--radius-lg)] p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className={`w-10 h-10 rounded-[var(--radius-md)] bg-gradient-to-br ${s.color} flex items-center justify-center`}>
                      <s.icon className="h-5 w-5 text-white" />
                    </div>
                    <TrendingUp className="h-4 w-4 text-success" />
                  </div>
                  <div className="text-3xl font-bold font-heading">{s.value}</div>
                  <div className="text-sm text-surface-400">{s.label}</div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Users */}
          {tab === 'users' && (
            <div className="glass rounded-[var(--radius-lg)] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-surface-700/50">
                      <th className="text-left p-4 text-sm font-medium text-surface-400">Name</th>
                      <th className="text-left p-4 text-sm font-medium text-surface-400">Email</th>
                      <th className="text-left p-4 text-sm font-medium text-surface-400">Role</th>
                      <th className="text-left p-4 text-sm font-medium text-surface-400">Joined</th>
                      <th className="text-right p-4 text-sm font-medium text-surface-400">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u.id} className="border-b border-surface-800/50 hover:bg-surface-800/30 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-white text-xs font-bold">{u.fullname[0]}</div>
                            <span className="text-sm font-medium">{u.fullname}</span>
                          </div>
                        </td>
                        <td className="p-4 text-sm text-surface-400">{u.email}</td>
                        <td className="p-4"><Badge variant={u.role === 'admin' ? 'danger' : u.role === 'worker' ? 'primary' : 'accent'}>{u.role}</Badge></td>
                        <td className="p-4 text-sm text-surface-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                        <td className="p-4 text-right">
                          {u.role !== 'admin' && (
                            <Button variant="ghost" size="sm" onClick={() => deleteUser(u.id)} className="text-surface-500 hover:text-danger">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {tab === 'jobs' && <div className="glass rounded-[var(--radius-lg)] p-8 text-center text-surface-400">Job management — coming in next phase</div>}
          {tab === 'matches' && <div className="glass rounded-[var(--radius-lg)] p-8 text-center text-surface-400">Match monitoring — coming in next phase</div>}
        </motion.div>
      </div>
    </div>
  );
}
