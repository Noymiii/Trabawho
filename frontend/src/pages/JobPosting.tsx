import { useState, useEffect } from 'react';
import { jobAPI } from '../services/api';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { motion } from 'framer-motion';
import { Plus, MapPin, DollarSign, Calendar, Trash2, Briefcase } from 'lucide-react';
import type { Job } from '../types';

export default function JobPosting() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', skillRequired: '', budget: '', location: '', schedule: '' });

  const fetchJobs = async () => {
    try { const res = await jobAPI.getMine(); setJobs(res.data.jobs || []); }
    catch { /* API not ready */ }
    finally { setIsLoading(false); }
  };

  useEffect(() => { fetchJobs(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setIsSaving(true);
    try {
      await jobAPI.create({ ...form, budget: parseFloat(form.budget) || 0 });
      setForm({ title: '', description: '', skillRequired: '', budget: '', location: '', schedule: '' });
      setIsModalOpen(false); fetchJobs();
    } catch { /* handle error */ }
    finally { setIsSaving(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this job posting?')) return;
    try { await jobAPI.delete(id); setJobs(prev => prev.filter(j => j.id !== id)); } catch { /* */ }
  };

  const statusColor = (s: string) => s === 'open' ? 'success' : s === 'matched' ? 'accent' : s === 'completed' ? 'primary' : 'danger';

  return (
    <div className="min-h-dvh pt-20 pb-8 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold font-heading">Job Postings</h1>
              <p className="text-surface-400 text-sm">Create and manage your job listings</p>
            </div>
            <Button onClick={() => setIsModalOpen(true)}><Plus className="h-4 w-4" />Post Job</Button>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-16"><div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" /></div>
          ) : jobs.length === 0 ? (
            <div className="glass rounded-[var(--radius-lg)] p-12 text-center">
              <Briefcase className="h-16 w-16 text-surface-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No jobs posted yet</h3>
              <p className="text-surface-400 text-sm mb-4">Create your first job posting to start finding workers.</p>
              <Button onClick={() => setIsModalOpen(true)}><Plus className="h-4 w-4" />Post Your First Job</Button>
            </div>
          ) : (
            <div className="grid gap-4">
              {jobs.map((job, i) => (
                <motion.div key={job.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  className="glass rounded-[var(--radius-lg)] p-5 hover:shadow-card-hover transition-shadow">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold font-heading truncate">{job.title}</h3>
                        <Badge variant={statusColor(job.status)}>{job.status}</Badge>
                      </div>
                      <p className="text-sm text-surface-400 line-clamp-2 mb-3">{job.description}</p>
                      <div className="flex flex-wrap gap-3 text-xs text-surface-500">
                        <span className="flex items-center gap-1"><Briefcase className="h-3.5 w-3.5" />{job.skillRequired}</span>
                        {job.budget > 0 && <span className="flex items-center gap-1"><DollarSign className="h-3.5 w-3.5" />₱{job.budget}</span>}
                        {job.location && <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{job.location}</span>}
                        {job.schedule && <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{job.schedule}</span>}
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(job.id)} className="text-surface-500 hover:text-danger shrink-0">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Create Job Modal */}
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Post a New Job">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="Job Title" placeholder="e.g. Fix kitchen sink" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} required />
            <div>
              <label className="block text-sm font-medium text-surface-300 mb-1.5">Description</label>
              <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={3} placeholder="Describe what needs to be done..."
                className="w-full px-4 py-3 bg-surface-800 border border-surface-600 rounded-[var(--radius-md)] text-surface-100 placeholder:text-surface-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary resize-none" required />
            </div>
            <Input label="Required Skill" placeholder="e.g. Plumber" value={form.skillRequired} onChange={e => setForm(p => ({ ...p, skillRequired: e.target.value }))} required />
            <div className="grid grid-cols-2 gap-3">
              <Input label="Budget (₱)" type="number" placeholder="500" value={form.budget} onChange={e => setForm(p => ({ ...p, budget: e.target.value }))} />
              <Input label="Location" placeholder="Manila" value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))} />
            </div>
            <Input label="Preferred Schedule" placeholder="Weekday mornings" value={form.schedule} onChange={e => setForm(p => ({ ...p, schedule: e.target.value }))} />
            <Button type="submit" isLoading={isSaving} className="w-full" size="lg">Post Job</Button>
          </form>
        </Modal>
      </div>
    </div>
  );
}
