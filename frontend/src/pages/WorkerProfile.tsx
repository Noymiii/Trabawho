import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { workerAPI } from '../services/api';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { motion } from 'framer-motion';
import { User, MapPin, Clock, Phone, Plus, X, Save, Briefcase } from 'lucide-react';
import { cn } from '../lib/utils';

const SKILL_OPTIONS = [
  'Electrician', 'Plumber', 'Tutor', 'Graphic Designer', 'Programmer',
  'Cleaner', 'Delivery Rider', 'Carpenter', 'Painter', 'Mechanic',
  'Cook', 'Driver', 'Gardener', 'Photographer', 'Writer',
];

export default function WorkerProfile() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasProfile, setHasProfile] = useState(false);
  const [skillInput, setSkillInput] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [formData, setFormData] = useState({
    skills: [] as string[], bio: '', experience: '', location: '',
    availability: 'available' as 'available' | 'busy' | 'offline',
    contactInfo: '', hourlyRate: '',
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await workerAPI.getProfile();
        if (res.data.profile) {
          const p = res.data.profile;
          setFormData({
            skills: p.skills || [], bio: p.bio || '', experience: p.experience || '',
            location: p.location || '', availability: p.availability || 'available',
            contactInfo: p.contactInfo || '', hourlyRate: p.hourlyRate?.toString() || '',
          });
          setHasProfile(true);
        } else { setIsEditing(true); }
      } catch { setIsEditing(true); }
      finally { setIsLoading(false); }
    };
    fetchProfile();
  }, []);

  const addSkill = (skill: string) => {
    const t = skill.trim();
    if (t && !formData.skills.includes(t)) setFormData(p => ({ ...p, skills: [...p.skills, t] }));
    setSkillInput('');
  };

  const removeSkill = (skill: string) => {
    setFormData(p => ({ ...p, skills: p.skills.filter(s => s !== skill) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setIsSaving(true); setMessage({ type: '', text: '' });
    try {
      const data = new FormData();
      data.append('skills', JSON.stringify(formData.skills));
      data.append('bio', formData.bio); data.append('experience', formData.experience);
      data.append('location', formData.location); data.append('availability', formData.availability);
      data.append('contactInfo', formData.contactInfo);
      if (formData.hourlyRate) data.append('hourlyRate', formData.hourlyRate);
      if (hasProfile) await workerAPI.updateProfile(data);
      else { await workerAPI.createProfile(data); setHasProfile(true); }
      setIsEditing(false);
      setMessage({ type: 'success', text: 'Profile saved successfully!' });
    } catch { setMessage({ type: 'error', text: 'Failed to save profile.' }); }
    finally { setIsSaving(false); }
  };

  if (isLoading) return (
    <div className="min-h-dvh pt-20 flex items-center justify-center">
      <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
    </div>
  );

  return (
    <div className="min-h-dvh pt-20 pb-8 px-4">
      <div className="max-w-3xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold font-heading">Worker Profile</h1>
              <p className="text-surface-400 text-sm">Showcase your skills and experience</p>
            </div>
            {hasProfile && !isEditing && (
              <Button variant="secondary" onClick={() => setIsEditing(true)}>Edit Profile</Button>
            )}
          </div>

          {message.text && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
              className={cn('p-3 rounded-[var(--radius-sm)] border text-sm mb-6',
                message.type === 'success' ? 'bg-success/10 border-success/20 text-success' : 'bg-danger/10 border-danger/20 text-danger'
              )}>{message.text}</motion.div>
          )}

          <div className="glass rounded-[var(--radius-lg)] p-6 sm:p-8">
            <div className="flex items-center gap-4 mb-8 pb-6 border-b border-surface-700/50">
              <div className="w-16 h-16 rounded-[var(--radius-full)] gradient-primary flex items-center justify-center text-white text-2xl font-bold">
                {user?.fullname?.[0]?.toUpperCase() || 'W'}
              </div>
              <div>
                <h2 className="text-xl font-semibold">{user?.fullname}</h2>
                <p className="text-surface-400 text-sm">{user?.email}</p>
                <Badge variant={formData.availability === 'available' ? 'success' : formData.availability === 'busy' ? 'warning' : 'danger'} className="mt-1">{formData.availability}</Badge>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Skills */}
              <div>
                <label className="block text-sm font-medium text-surface-300 mb-2"><Briefcase className="inline h-4 w-4 mr-1" />Skills</label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {formData.skills.map(skill => (
                    <Badge key={skill} variant="primary" className="gap-1">{skill}
                      {isEditing && <button type="button" onClick={() => removeSkill(skill)} className="cursor-pointer"><X className="h-3 w-3" /></button>}
                    </Badge>
                  ))}
                  {formData.skills.length === 0 && !isEditing && <span className="text-sm text-surface-500">No skills added yet</span>}
                </div>
                {isEditing && (
                  <>
                    <div className="flex gap-2">
                      <Input placeholder="Type a skill..." value={skillInput} onChange={e => setSkillInput(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSkill(skillInput); } }} className="flex-1" />
                      <Button type="button" variant="secondary" size="icon" onClick={() => addSkill(skillInput)}><Plus className="h-4 w-4" /></Button>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {SKILL_OPTIONS.filter(s => !formData.skills.includes(s)).slice(0, 8).map(s => (
                        <button key={s} type="button" onClick={() => addSkill(s)}
                          className="text-xs px-2.5 py-1 rounded-[var(--radius-full)] bg-surface-700 text-surface-400 hover:bg-surface-600 hover:text-surface-200 transition-colors cursor-pointer">+ {s}</button>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Bio */}
              <div>
                <label className="block text-sm font-medium text-surface-300 mb-1.5"><User className="inline h-4 w-4 mr-1" />Short Bio</label>
                {isEditing ? (
                  <textarea value={formData.bio} onChange={e => setFormData(p => ({ ...p, bio: e.target.value }))} rows={3} placeholder="Tell customers about yourself..."
                    className="w-full px-4 py-3 bg-surface-800 border border-surface-600 rounded-[var(--radius-md)] text-surface-100 placeholder:text-surface-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary resize-none" />
                ) : <p className="text-surface-300 text-sm">{formData.bio || 'No bio added'}</p>}
              </div>

              {/* Experience */}
              <div>
                <label className="block text-sm font-medium text-surface-300 mb-1.5">Experience</label>
                {isEditing ? (
                  <textarea value={formData.experience} onChange={e => setFormData(p => ({ ...p, experience: e.target.value }))} rows={3} placeholder="Describe your work experience..."
                    className="w-full px-4 py-3 bg-surface-800 border border-surface-600 rounded-[var(--radius-md)] text-surface-100 placeholder:text-surface-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary resize-none" />
                ) : <p className="text-surface-300 text-sm">{formData.experience || 'No experience listed'}</p>}
              </div>

              {/* Grid fields */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-surface-300 mb-1.5"><MapPin className="inline h-4 w-4 mr-1" />Location</label>
                  {isEditing ? <Input value={formData.location} onChange={e => setFormData(p => ({ ...p, location: e.target.value }))} placeholder="e.g. Manila" />
                    : <p className="text-surface-300 text-sm">{formData.location || 'Not set'}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-300 mb-1.5"><Clock className="inline h-4 w-4 mr-1" />Availability</label>
                  {isEditing ? (
                    <select value={formData.availability} onChange={e => setFormData(p => ({ ...p, availability: e.target.value as 'available' | 'busy' | 'offline' }))}
                      className="w-full h-11 px-4 bg-surface-800 border border-surface-600 rounded-[var(--radius-md)] text-surface-100 focus:outline-none focus:border-primary cursor-pointer">
                      <option value="available">Available</option><option value="busy">Busy</option><option value="offline">Offline</option>
                    </select>
                  ) : <p className="text-surface-300 text-sm capitalize">{formData.availability}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-300 mb-1.5"><Phone className="inline h-4 w-4 mr-1" />Contact Info</label>
                  {isEditing ? <Input value={formData.contactInfo} onChange={e => setFormData(p => ({ ...p, contactInfo: e.target.value }))} placeholder="Phone or email" />
                    : <p className="text-surface-300 text-sm">{formData.contactInfo || 'Not set'}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-300 mb-1.5">Hourly Rate (₱)</label>
                  {isEditing ? <Input type="number" value={formData.hourlyRate} onChange={e => setFormData(p => ({ ...p, hourlyRate: e.target.value }))} placeholder="500" />
                    : <p className="text-surface-300 text-sm">{formData.hourlyRate ? `₱${formData.hourlyRate}/hr` : 'Not set'}</p>}
                </div>
              </div>

              {isEditing && (
                <div className="flex gap-3 pt-4">
                  <Button type="submit" isLoading={isSaving} className="flex-1"><Save className="h-4 w-4" />Save Profile</Button>
                  {hasProfile && <Button type="button" variant="ghost" onClick={() => setIsEditing(false)}>Cancel</Button>}
                </div>
              )}
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
