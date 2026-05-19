import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { workerAPI, reviewAPI } from '../services/api';
import { Button } from '../components/ui/Button';
import { ImageUpload } from '../components/ui/ImageUpload';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Clock, Phone, Plus, X, Save, Briefcase, Star, ArrowLeft } from 'lucide-react';
import { cn } from '../lib/utils';

const SKILL_OPTIONS = [
  'Electrician', 'Plumber', 'Tutor', 'Graphic Designer', 'Programmer',
  'Cleaner', 'Delivery Rider', 'Carpenter', 'Painter', 'Mechanic',
  'Cook', 'Driver', 'Gardener', 'Photographer', 'Writer',
];

const easeOut = [0.23, 1, 0.32, 1] as const;

export default function WorkerProfile() {
  const { id } = useParams<{ id: string }>();
  const isPublicView = !!id;
  const { user } = useAuth();
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasProfile, setHasProfile] = useState(false);
  
  // Profile Data
  const [profileUser, setProfileUser] = useState<{ fullname: string; email: string; role: string } | null>(null);
  const [formData, setFormData] = useState({
    skills: [] as string[], bio: '', experience: '', location: '',
    availability: 'available' as 'available' | 'busy' | 'offline',
    contactInfo: '', hourlyRate: '', images: [] as string[],
  });
  const [skillInput, setSkillInput] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });

  // Reviews Data
  const [reviews, setReviews] = useState<Array<any>>([]);
  const [averageRating, setAverageRating] = useState(0);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const targetId = isPublicView ? Number(id) : undefined;
        
        // Fetch Profile
        const res = await workerAPI.getProfile(targetId);
        
        if (isPublicView) {
          // In a public view, the response might contain the user info inside the profile or separately.
          // For now, assuming the API returns the worker's user info.
          if (res.data.profile) {
            setProfileUser(res.data.profile.user || { fullname: 'Worker', email: '', role: 'worker' });
          }
        } else {
          setProfileUser(user);
        }

        if (res.data.profile) {
          const p = res.data.profile;
          setFormData({
            skills: p.skills || [], bio: p.bio || '', experience: p.experience || '',
            location: p.location || '', availability: p.availability || 'available',
            contactInfo: p.contactInfo || '', hourlyRate: p.hourlyRate?.toString() || '',
            images: p.images || [],
          });
          setHasProfile(true);
        } else if (!isPublicView) {
          setIsEditing(true);
        }

        // Fetch Reviews if we have a target user ID
        const reviewUserId = isPublicView ? targetId : user?.id;
        if (reviewUserId) {
          const reviewRes = await reviewAPI.getUserReviews(reviewUserId);
          const fetchedReviews = reviewRes.data.reviews || [];
          setReviews(fetchedReviews);
          if (fetchedReviews.length > 0) {
            const sum = fetchedReviews.reduce((acc: number, r: any) => acc + r.rating, 0);
            setAverageRating(sum / fetchedReviews.length);
          }
        }

      } catch (error) {
        console.error("Error fetching profile", error);
        if (!isPublicView) setIsEditing(true);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfileData();
  }, [id, isPublicView, user]);

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
      data.append('bio', formData.bio);
      data.append('experience', formData.experience);
      data.append('location', formData.location);
      data.append('availability', formData.availability);
      data.append('contactInfo', formData.contactInfo);
      data.append('images', JSON.stringify(formData.images));
      if (formData.hourlyRate) data.append('hourlyRate', formData.hourlyRate);
      
      if (hasProfile) await workerAPI.updateProfile(data);
      else { await workerAPI.createProfile(data); setHasProfile(true); }
      
      setIsEditing(false);
      setMessage({ type: 'success', text: 'Profile saved successfully!' });
    } catch { 
      setMessage({ type: 'error', text: 'Failed to save profile.' }); 
    } finally { 
      setIsSaving(false); 
    }
  };

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setIsSubmittingReview(true);
    try {
      await reviewAPI.submitReview({
        workerId: Number(id),
        rating: newReview.rating,
        comment: newReview.comment,
      });
      // Refresh reviews
      const reviewRes = await reviewAPI.getUserReviews(Number(id));
      const fetchedReviews = reviewRes.data.reviews || [];
      setReviews(fetchedReviews);
      if (fetchedReviews.length > 0) {
        const sum = fetchedReviews.reduce((acc: number, r: any) => acc + r.rating, 0);
        setAverageRating(sum / fetchedReviews.length);
      }
      setIsReviewModalOpen(false);
      setNewReview({ rating: 5, comment: '' });
    } catch (error) {
      console.error("Failed to submit review", error);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  if (isLoading) return (
    <div className="min-h-dvh pt-24 flex items-center justify-center bg-surface-950">
      <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const imgBase = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
  const displayUser = profileUser || user;

  return (
    <div className="min-h-dvh pt-24 pb-24 px-6 lg:px-12 bg-surface-950">
      <div className="max-w-6xl mx-auto">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
          <div className="flex items-center gap-4">
            {isPublicView && (
              <button onClick={() => navigate(-1)} className="w-12 h-12 rounded-full bg-surface-900 border border-surface-800 flex items-center justify-center text-surface-400 hover:text-white hover:border-surface-700 transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <div>
              <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-4xl md:text-5xl font-bold font-heading text-white tracking-tight">
                {isPublicView ? 'Worker Profile' : 'Your Profile'}
              </motion.h1>
              <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-surface-400 mt-2 text-lg">
                {isPublicView ? `Learn more about ${displayUser?.fullname?.split(' ')[0]}` : 'Manage your professional presence.'}
              </motion.p>
            </div>
          </div>
          
          {!isPublicView && hasProfile && !isEditing && (
            <Button onClick={() => setIsEditing(true)} className="bg-white text-surface-950 hover:bg-surface-100 shadow-float h-12 px-8">
              Edit Profile
            </Button>
          )}
        </div>

        {message.text && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className={cn('p-4 rounded-2xl border text-sm mb-8 font-medium',
              message.type === 'success' ? 'bg-accent/10 border-accent/20 text-accent' : 'bg-red-500/10 border-red-500/20 text-red-400'
            )}>{message.text}</motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Info Column */}
          <div className="lg:col-span-2 space-y-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: easeOut }} className="bg-surface-900 border border-surface-800 rounded-[2rem] p-8 md:p-10 shadow-float">
              
              <div className="flex flex-col sm:flex-row sm:items-center gap-6 mb-10 pb-8 border-b border-surface-800">
                <div className="w-24 h-24 rounded-[1.5rem] bg-surface-800 border-2 border-surface-700 flex items-center justify-center text-4xl font-bold text-white shadow-inner">
                  {displayUser?.fullname?.[0]?.toUpperCase() || 'W'}
                </div>
                <div>
                  <h2 className="text-3xl font-bold font-heading text-white tracking-tight">{displayUser?.fullname}</h2>
                  <p className="text-surface-400 mt-1">{displayUser?.email}</p>
                  {!isEditing && (
                    <div className="flex items-center gap-3 mt-3">
                      <span className={cn(
                        "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border",
                        formData.availability === 'available' ? 'bg-accent/10 text-accent border-accent/20' : 
                        formData.availability === 'busy' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 
                        'bg-surface-800 text-surface-400 border-surface-700'
                      )}>
                        {formData.availability}
                      </span>
                      {averageRating > 0 && (
                        <div className="flex items-center gap-1 text-accent bg-accent/5 px-3 py-1 rounded-full border border-accent/10">
                          <Star className="w-3.5 h-3.5 fill-accent" />
                          <span className="text-xs font-bold">{averageRating.toFixed(1)}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-8">
                
                {/* Images */}
                <div>
                  <label className="block text-base font-bold text-white mb-4">Portfolio Work</label>
                  {isEditing ? (
                    <ImageUpload images={formData.images} onChange={(images) => setFormData(p => ({ ...p, images }))} maxFiles={5} />
                  ) : formData.images.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {formData.images.map((url, i) => (
                        <div key={i} className={cn('rounded-[1.25rem] overflow-hidden border border-surface-800 bg-surface-800', i === 0 ? 'col-span-2 row-span-2 aspect-square' : 'aspect-square')}>
                          <img src={url.startsWith('/') ? `${imgBase}${url}` : url} alt={`Portfolio ${i + 1}`} className="w-full h-full object-cover mix-blend-luminosity hover:mix-blend-normal hover:scale-105 transition-all duration-500" />
                        </div>
                      ))}
                    </div>
                  ) : <p className="text-surface-500 text-sm bg-surface-800/50 p-6 rounded-2xl border border-surface-800 border-dashed text-center">No portfolio images uploaded.</p>}
                </div>

                {/* Skills */}
                <div>
                  <label className="block text-base font-bold text-white mb-4 flex items-center gap-2"><Briefcase className="w-5 h-5 text-accent" /> Skills & Expertise</label>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {formData.skills.map(skill => (
                      <span key={skill} className="flex items-center gap-2 px-4 py-2 bg-surface-800 border border-surface-700 text-white rounded-full text-sm font-medium">
                        {skill}
                        {isEditing && <button type="button" onClick={() => removeSkill(skill)} className="text-surface-400 hover:text-red-400 transition-colors"><X className="w-4 h-4" /></button>}
                      </span>
                    ))}
                    {formData.skills.length === 0 && !isEditing && <span className="text-sm text-surface-500">No specific skills listed.</span>}
                  </div>
                  {isEditing && (
                    <div className="bg-surface-950 p-5 rounded-2xl border border-surface-800">
                      <div className="flex gap-3 mb-4">
                        <input placeholder="Type a custom skill..." value={skillInput} onChange={e => setSkillInput(e.target.value)}
                          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSkill(skillInput); } }} 
                          className="flex-1 h-12 bg-surface-900 border border-surface-800 rounded-xl px-4 text-white focus:outline-none focus:border-accent" />
                        <Button type="button" variant="secondary" className="w-12 h-12 p-0 rounded-xl bg-surface-800 text-white border-surface-700 hover:bg-surface-700" onClick={() => addSkill(skillInput)}>
                          <Plus className="h-5 w-5" />
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {SKILL_OPTIONS.filter(s => !formData.skills.includes(s)).slice(0, 8).map(s => (
                          <button key={s} type="button" onClick={() => addSkill(s)}
                            className="text-xs px-3 py-1.5 rounded-full bg-surface-800 text-surface-400 hover:bg-accent/10 hover:text-accent border border-surface-700 transition-colors cursor-pointer">
                            + {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Bio & Experience */}
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <label className="block text-base font-bold text-white mb-3">Professional Bio</label>
                    {isEditing ? (
                      <textarea value={formData.bio} onChange={e => setFormData(p => ({ ...p, bio: e.target.value }))} rows={4} placeholder="Tell customers about yourself..."
                        className="w-full px-5 py-4 bg-surface-950 border border-surface-800 rounded-2xl text-white placeholder:text-surface-500 focus:outline-none focus:border-accent resize-none transition-colors" />
                    ) : <p className="text-surface-400 text-sm leading-relaxed whitespace-pre-wrap">{formData.bio || 'No bio provided.'}</p>}
                  </div>
                  <div>
                    <label className="block text-base font-bold text-white mb-3">Experience</label>
                    {isEditing ? (
                      <textarea value={formData.experience} onChange={e => setFormData(p => ({ ...p, experience: e.target.value }))} rows={4} placeholder="Describe your work experience..."
                        className="w-full px-5 py-4 bg-surface-950 border border-surface-800 rounded-2xl text-white placeholder:text-surface-500 focus:outline-none focus:border-accent resize-none transition-colors" />
                    ) : <p className="text-surface-400 text-sm leading-relaxed whitespace-pre-wrap">{formData.experience || 'No experience details provided.'}</p>}
                  </div>
                </div>

                {/* Quick Info */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-surface-800">
                  <div className="bg-surface-950 p-4 rounded-2xl border border-surface-800">
                    <label className="flex items-center gap-1.5 text-xs font-bold text-surface-500 uppercase tracking-wider mb-2"><MapPin className="w-3.5 h-3.5" /> Location</label>
                    {isEditing ? <input value={formData.location} onChange={e => setFormData(p => ({ ...p, location: e.target.value }))} className="w-full bg-transparent text-white text-sm focus:outline-none" placeholder="City..." />
                      : <p className="text-white font-medium text-sm truncate">{formData.location || '—'}</p>}
                  </div>
                  <div className="bg-surface-950 p-4 rounded-2xl border border-surface-800">
                    <label className="flex items-center gap-1.5 text-xs font-bold text-surface-500 uppercase tracking-wider mb-2"><Clock className="w-3.5 h-3.5" /> Status</label>
                    {isEditing ? (
                      <select value={formData.availability} onChange={e => setFormData(p => ({ ...p, availability: e.target.value as any }))}
                        className="w-full bg-transparent text-white text-sm focus:outline-none cursor-pointer">
                        <option value="available">Available</option><option value="busy">Busy</option><option value="offline">Offline</option>
                      </select>
                    ) : <p className="text-white font-medium text-sm capitalize truncate">{formData.availability}</p>}
                  </div>
                  <div className="bg-surface-950 p-4 rounded-2xl border border-surface-800">
                    <label className="flex items-center gap-1.5 text-xs font-bold text-surface-500 uppercase tracking-wider mb-2"><Phone className="w-3.5 h-3.5" /> Contact</label>
                    {isEditing ? <input value={formData.contactInfo} onChange={e => setFormData(p => ({ ...p, contactInfo: e.target.value }))} className="w-full bg-transparent text-white text-sm focus:outline-none" placeholder="Phone/Email" />
                      : <p className="text-white font-medium text-sm truncate">{formData.contactInfo || '—'}</p>}
                  </div>
                  <div className="bg-surface-950 p-4 rounded-2xl border border-surface-800">
                    <label className="flex items-center gap-1.5 text-xs font-bold text-surface-500 uppercase tracking-wider mb-2">Rate / hr</label>
                    {isEditing ? <input type="number" value={formData.hourlyRate} onChange={e => setFormData(p => ({ ...p, hourlyRate: e.target.value }))} className="w-full bg-transparent text-white text-sm focus:outline-none" placeholder="₱0.00" />
                      : <p className="text-white font-medium text-sm truncate">{formData.hourlyRate ? `₱${formData.hourlyRate}` : '—'}</p>}
                  </div>
                </div>

                {isEditing && (
                  <div className="flex gap-4 pt-8">
                    <Button type="submit" isLoading={isSaving} className="flex-1 bg-white text-surface-950 hover:bg-surface-100 h-14 rounded-xl text-lg font-bold"><Save className="w-5 h-5 mr-2" /> Save Profile</Button>
                    {hasProfile && <Button type="button" variant="outline" className="h-14 px-8 rounded-xl border-surface-700 text-white hover:bg-surface-800" onClick={() => setIsEditing(false)}>Cancel</Button>}
                  </div>
                )}
              </form>
            </motion.div>
          </div>

          {/* Reviews Column */}
          <div className="lg:col-span-1 space-y-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2, ease: easeOut }} className="bg-surface-900 border border-surface-800 rounded-[2rem] p-8 shadow-float relative overflow-hidden">
              <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
                <Star className="w-32 h-32 text-white" />
              </div>
              
              <div className="relative z-10 mb-8 pb-6 border-b border-surface-800">
                <h3 className="text-2xl font-bold font-heading text-white mb-2">Client Reviews</h3>
                <div className="flex items-end gap-3">
                  <span className="text-5xl font-bold font-heading text-white">{averageRating > 0 ? averageRating.toFixed(1) : '—'}</span>
                  <div className="pb-1.5">
                    <div className="flex gap-1 mb-1">
                      {[1,2,3,4,5].map(star => (
                        <Star key={star} className={cn("w-4 h-4", star <= Math.round(averageRating) ? "fill-accent text-accent" : "fill-surface-800 text-surface-700")} />
                      ))}
                    </div>
                    <span className="text-xs font-medium text-surface-500 uppercase tracking-widest">{reviews.length} Ratings</span>
                  </div>
                </div>
              </div>

              {isPublicView && user?.role === 'customer' && (
                <Button onClick={() => setIsReviewModalOpen(true)} className="w-full mb-8 bg-surface-800 text-white hover:bg-surface-700 border border-surface-700 h-12">
                  Write a Review
                </Button>
              )}

              <div className="space-y-6">
                {reviews.length === 0 ? (
                  <div className="text-center py-10 opacity-60">
                    <Star className="w-8 h-8 text-surface-600 mx-auto mb-3" />
                    <p className="text-surface-400 text-sm">No reviews yet.</p>
                  </div>
                ) : (
                  reviews.map((review: any) => (
                    <div key={review.id} className="group">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-surface-800 border border-surface-700 flex items-center justify-center text-[10px] font-bold text-surface-400">
                            {review.reviewer?.fullname?.[0] || 'R'}
                          </div>
                          <span className="text-sm font-bold text-white">{review.reviewer?.fullname || 'Reviewer'}</span>
                        </div>
                        <div className="flex gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={cn("w-3 h-3", i < review.rating ? "fill-accent text-accent" : "fill-surface-800 text-surface-800")} />
                          ))}
                        </div>
                      </div>
                      <p className="text-surface-400 text-sm leading-relaxed">"{review.comment}"</p>
                      <div className="mt-4 border-b border-surface-800/50 group-last:border-0" />
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </div>

        </div>
      </div>

      {/* Review Modal */}
      <AnimatePresence>
        {isReviewModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-surface-950/80 backdrop-blur-sm" onClick={() => setIsReviewModalOpen(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-lg bg-surface-900 border border-surface-800 rounded-[2rem] p-8 shadow-2xl">
              <button onClick={() => setIsReviewModalOpen(false)} className="absolute top-6 right-6 text-surface-400 hover:text-white"><X className="w-5 h-5" /></button>
              
              <h2 className="text-2xl font-bold font-heading text-white mb-2">Leave a Review</h2>
              <p className="text-surface-400 text-sm mb-8">Share your experience working with {displayUser?.fullname?.split(' ')[0]}.</p>

              <form onSubmit={submitReview} className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-white mb-3">Rating</label>
                  <div className="flex gap-2">
                    {[1,2,3,4,5].map(star => (
                      <button key={star} type="button" onClick={() => setNewReview(p => ({ ...p, rating: star }))}
                        className="p-1 focus:outline-none transform hover:scale-110 transition-transform">
                        <Star className={cn("w-8 h-8", star <= newReview.rating ? "fill-accent text-accent" : "fill-surface-800 text-surface-700")} />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-white mb-3">Feedback</label>
                  <textarea value={newReview.comment} onChange={e => setNewReview(p => ({ ...p, comment: e.target.value }))} rows={4} placeholder="Describe the quality of work..." required
                    className="w-full px-5 py-4 bg-surface-950 border border-surface-800 rounded-2xl text-white placeholder:text-surface-500 focus:outline-none focus:border-accent resize-none transition-colors" />
                </div>

                <div className="pt-4">
                  <Button type="submit" isLoading={isSubmittingReview} className="w-full bg-white text-surface-950 hover:bg-surface-100 h-14 rounded-xl text-base font-bold">
                    Submit Review
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
