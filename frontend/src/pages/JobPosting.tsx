import { useState, useEffect } from 'react';
import { jobAPI } from '../services/api';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { ImageUpload } from '../components/ui/ImageUpload';
import { motion } from 'framer-motion';
import { Plus, MapPin, DollarSign, Calendar, Trash2, Briefcase, X, ChevronDown } from 'lucide-react';
import { cn } from '../lib/utils';
import type { Job } from '../types';

const easeOut = [0.23, 1, 0.32, 1] as const;

const SKILL_OPTIONS = [
  'Electrician', 'Plumber', 'Tutor', 'Graphic Designer', 'Programmer',
  'Cleaner', 'Delivery Rider', 'Carpenter', 'Painter', 'Mechanic',
  'Cook', 'Driver', 'Gardener', 'Photographer', 'Writer',
];

export default function JobPosting() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', skillRequired: '', budget: '', location: '', schedule: '', images: [] as string[] });
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const fetchJobs = async () => {
    try { const res = await jobAPI.getMine(); setJobs(res.data.jobs || []); }
    catch { /* API not ready */ }
    finally { setIsLoading(false); }
  };

  useEffect(() => {
    setForm(p => ({ ...p, skillRequired: selectedSkills.join(', ') }));
  }, [selectedSkills]);

  useEffect(() => { fetchJobs(); }, []);

  const handleToggleSkill = (skill: string) => {
    setSelectedSkills(prev => {
      if (prev.includes(skill)) {
        return prev.filter(s => s !== skill);
      } else {
        if (prev.length >= 5) return prev;
        return [...prev, skill];
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedSkills.length < 2 || selectedSkills.length > 5) return;
    setIsSaving(true);
    try {
      await jobAPI.create({ ...form, budget: parseFloat(form.budget) || 0, images: JSON.stringify(form.images) });
      setForm({ title: '', description: '', skillRequired: '', budget: '', location: '', schedule: '', images: [] });
      setSelectedSkills([]);
      setIsDropdownOpen(false);
      setIsModalOpen(false); fetchJobs();
    } catch { /* handle error */ }
    finally { setIsSaving(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this job posting?')) return;
    try { await jobAPI.delete(id); setJobs(prev => prev.filter(j => j.id !== id)); } catch { /* */ }
  };

  const statusColor = (s: string): 'success' | 'accent' | 'muted' | 'danger' =>
    s === 'open' ? 'success' : s === 'matched' ? 'accent' : s === 'completed' ? 'muted' : 'danger';

  return (
    <div className="min-h-dvh pt-20 pb-8 px-4 bg-surface-950">
      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: easeOut }}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold font-heading text-white">Job Postings</h1>
              <p className="text-surface-400 text-sm">Create and manage your job listings</p>
            </div>
            <Button className="bg-white text-surface-950 hover:bg-surface-100" onClick={() => { setSelectedSkills([]); setIsDropdownOpen(false); setIsModalOpen(true); }}><Plus className="h-4 w-4" />Post Job</Button>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-16">
              <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
            </div>
          ) : jobs.length === 0 ? (
            <div className="bg-surface-900 border border-surface-800 rounded-3xl p-12 text-center shadow-float">
              <div className="w-14 h-14 rounded-2xl bg-surface-800 flex items-center justify-center mx-auto mb-4 border border-surface-700">
                <Briefcase className="h-7 w-7 text-surface-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-white">No jobs posted yet</h3>
              <p className="text-surface-400 text-sm mb-5">Create your first job posting to start finding workers.</p>
              <Button className="bg-white text-surface-950 hover:bg-surface-100" onClick={() => { setSelectedSkills([]); setIsDropdownOpen(false); setIsModalOpen(true); }}><Plus className="h-4 w-4" />Post Your First Job</Button>
            </div>
          ) : (
            <div className="bg-surface-900 border border-surface-800 rounded-2xl overflow-hidden divide-y divide-surface-800 shadow-float">
              {jobs.map((job, i) => (
                <motion.div key={job.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05, duration: 0.3, ease: easeOut }}
                  className="p-5 hover:bg-surface-800 transition-colors duration-150"
                  style={{ transitionTimingFunction: 'var(--ease-out)' }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <h3 className="font-semibold font-heading text-white truncate">{job.title}</h3>
                        <Badge variant={statusColor(job.status)}>{job.status}</Badge>
                      </div>
                      <p className="text-sm text-surface-400 line-clamp-2 mb-3">{job.description}</p>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-surface-400 font-medium">
                        <span className="flex items-center gap-2">
                          <Briefcase className="h-3.5 w-3.5 shrink-0 text-accent" />
                          <span className="flex flex-wrap gap-1">
                            {job.skillRequired ? (
                              job.skillRequired.split(',').map(s => (
                                <span key={s} className="px-2 py-0.5 bg-surface-850 border border-surface-700 text-surface-300 rounded-full text-[10px] font-semibold">
                                  {s.trim()}
                                </span>
                              ))
                            ) : (
                              <span className="text-surface-500">None</span>
                            )}
                          </span>
                        </span>
                        {job.budget > 0 && <span className="flex items-center gap-1"><DollarSign className="h-3.5 w-3.5" />P{job.budget}</span>}
                        {job.location && <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{job.location}</span>}
                        {job.schedule && <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{job.schedule}</span>}
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(job.id)} className="text-surface-500 hover:text-danger hover:bg-danger/10 shrink-0">
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
            <Input label="Job Title" placeholder="e.g. Fix kitchen sink" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} required className="bg-surface-900 border-surface-800 text-white placeholder:text-surface-600 focus:border-accent/50 focus:ring-accent/10" labelClassName="text-surface-300" />
            <div>
              <label className="block text-sm font-medium text-surface-300 mb-2">Description</label>
              <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={3} placeholder="Describe what needs to be done..."
                className="w-full px-4 py-3 bg-surface-900 border border-surface-800 rounded-2xl text-white placeholder:text-surface-600 focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/10 resize-none transition-colors" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-300 mb-2">Reference Images</label>
              <ImageUpload images={form.images} onChange={images => setForm(p => ({ ...p, images }))} maxFiles={3} />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-300 mb-2">Required Skills (Select 2 to 5)</label>
              
              {/* Selected skills list */}
              <div className="flex flex-wrap gap-2 mb-3">
                {selectedSkills.map(skill => (
                  <span key={skill} className="flex items-center gap-1.5 px-3.5 py-1.5 bg-accent/10 border border-accent/20 text-accent rounded-full text-xs font-semibold">
                    {skill}
                    <button type="button" onClick={() => handleToggleSkill(skill)} className="text-accent/60 hover:text-accent transition-colors">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
                {selectedSkills.length === 0 && (
                  <span className="text-xs text-surface-500 italic py-1.5">No skills selected yet. Choose at least 2.</span>
                )}
              </div>

              {/* Dropdown Toggle Button */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="w-full h-12 flex items-center justify-between px-4 bg-surface-900 border border-surface-800 rounded-2xl text-left text-sm text-white focus:outline-none focus:border-accent/50 transition-all cursor-pointer"
                >
                  <span className={cn("text-sm", selectedSkills.length > 0 ? "text-white" : "text-surface-600")}>
                    {selectedSkills.length > 0 
                      ? `${selectedSkills.length} skill${selectedSkills.length > 1 ? 's' : ''} selected` 
                      : 'Select required skills...'}
                  </span>
                  <ChevronDown className={cn("h-4 w-4 text-surface-400 transition-transform duration-200", isDropdownOpen && "transform rotate-180")} />
                </button>

                {/* Dropdown Options List */}
                {isDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-30" onClick={() => setIsDropdownOpen(false)} />
                    <div className="absolute left-0 right-0 mt-2 z-40 max-h-56 overflow-y-auto bg-surface-900 border border-surface-800 rounded-2xl p-2 shadow-2xl custom-scrollbar grid grid-cols-2 gap-1.5 animate-in fade-in slide-in-from-top-2 duration-150">
                      {SKILL_OPTIONS.map(skill => {
                        const isSelected = selectedSkills.includes(skill);
                        const isMaxReached = selectedSkills.length >= 5;
                        return (
                          <button
                            key={skill}
                            type="button"
                            disabled={!isSelected && isMaxReached}
                            onClick={() => handleToggleSkill(skill)}
                            className={cn(
                              "w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-between cursor-pointer",
                              isSelected
                                ? "bg-white text-surface-950"
                                : "text-surface-400 hover:bg-surface-800 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                            )}
                          >
                            <span>{skill}</span>
                            {isSelected && <span className="text-[10px]">✓</span>}
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>

              {/* Validation Warning */}
              {selectedSkills.length > 0 && (selectedSkills.length < 2 || selectedSkills.length > 5) && (
                <p className="text-xs text-red-400 font-medium mt-2">
                  Please select between 2 and 5 skills (currently chosen: {selectedSkills.length}).
                </p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input label="Budget (P)" type="number" placeholder="500" value={form.budget} onChange={e => setForm(p => ({ ...p, budget: e.target.value }))} className="bg-surface-900 border-surface-800 text-white placeholder:text-surface-600 focus:border-accent/50 focus:ring-accent/10" labelClassName="text-surface-300" />
              <Input label="Location" placeholder="Manila" value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))} className="bg-surface-900 border-surface-800 text-white placeholder:text-surface-600 focus:border-accent/50 focus:ring-accent/10" labelClassName="text-surface-300" />
            </div>
            <Input label="Preferred Schedule" placeholder="Weekday mornings" value={form.schedule} onChange={e => setForm(p => ({ ...p, schedule: e.target.value }))} className="bg-surface-900 border-surface-800 text-white placeholder:text-surface-600 focus:border-accent/50 focus:ring-accent/10" labelClassName="text-surface-300" />
            <Button 
              type="submit" 
              isLoading={isSaving} 
              disabled={selectedSkills.length < 2 || selectedSkills.length > 5} 
              className="w-full bg-white text-surface-950 hover:bg-surface-100 disabled:opacity-50 disabled:cursor-not-allowed" 
              size="lg"
            >
              Post Job
            </Button>
          </form>
        </Modal>
      </div>
    </div>
  );
}
