import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/Button';
import { MapPin, Briefcase, X, ArrowRight, DollarSign, Calendar, Type } from 'lucide-react';
import { jobAPI } from '../../services/api';
import { cn } from '../../lib/utils';

const SKILL_OPTIONS = [
  'Electrician', 'Plumber', 'Tutor', 'Graphic Designer', 'Programmer',
  'Cleaner', 'Delivery Rider', 'Carpenter', 'Painter', 'Mechanic',
  'Cook', 'Driver', 'Gardener', 'Photographer', 'Writer',
];

const springTransition = { type: "spring", stiffness: 400, damping: 30 } as const;
const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: springTransition as any },
  exit: { opacity: 0, y: -20, transition: { duration: 0.2 } as any }
};

interface CustomerOnboardingProps {
  onComplete: () => void;
  onSkip: () => void;
}

export function CustomerOnboarding({ onComplete, onSkip }: CustomerOnboardingProps) {
  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Form State
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [skillRequired, setSkillRequired] = useState('');
  const [budget, setBudget] = useState('');
  const [description, setDescription] = useState('');
  const [schedule, setSchedule] = useState('');

  const nextStep = () => setStep((s) => s + 1);
  const prevStep = () => setStep((s) => s - 1);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError('');
    try {
      await jobAPI.create({
        title,
        location,
        skillRequired,
        budget: budget ? parseFloat(budget) : null,
        description,
        schedule,
      });
      onComplete();
    } catch (err) {
      console.error('Job creation error:', err);
      setError('Failed to post your job. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 lg:p-12 bg-surface-950/80 backdrop-blur-2xl">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[80vw] h-[80vw] max-w-[1000px] max-h-[1000px] bg-accent/10 rounded-full blur-[160px] translate-x-1/3 -translate-y-1/3 mix-blend-screen" />
        <div className="absolute bottom-0 left-0 w-[60vw] h-[60vw] max-w-[800px] max-h-[800px] bg-blue-500/10 rounded-full blur-[140px] -translate-x-1/3 translate-y-1/3 mix-blend-screen" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.98, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={springTransition}
        className="relative w-full max-w-3xl bg-surface-950/50 border border-surface-800 rounded-[2rem] shadow-2xl overflow-hidden backdrop-blur-xl"
      >
        {/* Cinematic Progress Bar */}
        <div className="absolute top-0 left-0 w-full h-1 bg-surface-900 z-10">
          <motion.div
            className="h-full bg-gradient-to-r from-accent to-accent-light"
            initial={{ width: '0%' }}
            animate={{ width: `${(step / 3) * 100}%` }}
            transition={springTransition}
          />
        </div>

        {/* Skip button on top right */}
        <button 
          onClick={onSkip}
          className="absolute top-6 right-6 p-2 text-surface-500 hover:text-white bg-surface-900/50 hover:bg-surface-800 rounded-full transition-colors z-20"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-8 sm:p-12 md:p-16 min-h-[500px] flex flex-col justify-center">
          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div key="step0" {...fadeUp} className="text-center">
                <div className="w-24 h-24 bg-surface-900 border border-surface-800 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-inner shadow-black/50 rotate-[4deg]">
                  <Briefcase className="w-10 h-10 text-accent" />
                </div>
                <h2 className="text-4xl md:text-6xl font-bold font-heading text-white tracking-tight mb-6">
                  Post Your First Job
                </h2>
                <p className="text-surface-400 text-lg md:text-xl leading-relaxed mb-12 max-w-xl mx-auto">
                  To start matching with our vetted network of professionals, you need to post a job. Tell us what you need done.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <Button onClick={onSkip} variant="outline" className="w-full sm:w-auto bg-surface-900/50 border-surface-800 text-surface-300 hover:text-white h-16 px-12 rounded-2xl text-lg font-bold">
                    Skip for now
                  </Button>
                  <Button onClick={nextStep} className="w-full sm:w-auto bg-white text-surface-950 hover:bg-surface-100 h-16 px-12 rounded-2xl text-lg font-bold">
                    Create Job <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </div>
              </motion.div>
            )}

            {step === 1 && (
              <motion.div key="step1" {...fadeUp} className="max-w-xl mx-auto w-full">
                <div className="mb-10">
                  <span className="text-accent font-bold tracking-widest uppercase text-xs mb-3 block">Step 1 of 3</span>
                  <h2 className="text-4xl font-bold font-heading text-white mb-3">The Basics</h2>
                  <p className="text-surface-400 text-lg">Give your job a clear title and location.</p>
                </div>

                <div className="space-y-6 mb-12">
                  <div>
                    <label className="block text-sm font-bold text-white mb-3">Job Title</label>
                    <div className="relative">
                      <Type className="absolute left-5 top-1/2 -translate-y-1/2 text-surface-500 w-5 h-5" />
                      <input
                        autoFocus
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g. Need an experienced Plumber"
                        className="w-full pl-14 pr-6 py-5 bg-surface-900/50 border border-surface-800 rounded-2xl text-white text-lg placeholder:text-surface-600 focus:outline-none focus:border-accent focus:bg-surface-900 transition-all shadow-inner"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-white mb-3">Location</label>
                    <div className="relative">
                      <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 text-surface-500 w-5 h-5" />
                      <input
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="e.g. Quezon City, Metro Manila"
                        className="w-full pl-14 pr-6 py-5 bg-surface-900/50 border border-surface-800 rounded-2xl text-white text-lg placeholder:text-surface-600 focus:outline-none focus:border-accent focus:bg-surface-900 transition-all shadow-inner"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button variant="outline" onClick={prevStep} className="h-16 px-8 rounded-2xl border-surface-800 text-surface-300 hover:text-white bg-surface-900/50">Back</Button>
                  <Button onClick={nextStep} disabled={!title.trim() || !location.trim()} className="flex-1 bg-white text-surface-950 hover:bg-surface-100 h-16 rounded-2xl text-lg font-bold shadow-[0_0_40px_rgba(255,255,255,0.1)]">
                    Continue
                  </Button>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="step2" {...fadeUp} className="max-w-2xl mx-auto w-full">
                <div className="mb-10">
                  <span className="text-accent font-bold tracking-widest uppercase text-xs mb-3 block">Step 2 of 3</span>
                  <h2 className="text-4xl font-bold font-heading text-white mb-3">Requirements</h2>
                  <p className="text-surface-400 text-lg">What specific skill is required and what is your budget?</p>
                </div>

                <div className="space-y-8 mb-12">
                  <div>
                    <label className="block text-sm font-bold text-white mb-3">Primary Skill Required</label>
                    <div className="flex flex-wrap gap-2 max-h-56 overflow-y-auto p-2 bg-surface-900/20 border border-surface-800 rounded-2xl custom-scrollbar">
                      {SKILL_OPTIONS.map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setSkillRequired(s)}
                          className={cn(
                            "text-xs px-4 py-2.5 rounded-full border transition-all font-bold cursor-pointer",
                            skillRequired === s 
                              ? "bg-accent/10 border-accent/50 text-accent" 
                              : "bg-surface-900 text-surface-400 border-surface-800 hover:bg-surface-800 hover:text-white"
                          )}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-white mb-3">Budget (Optional)</label>
                    <div className="relative">
                      <DollarSign className="absolute left-5 top-1/2 -translate-y-1/2 text-surface-500 w-5 h-5" />
                      <input
                        type="number"
                        value={budget}
                        onChange={(e) => setBudget(e.target.value)}
                        placeholder="e.g. 1500"
                        className="w-full pl-14 pr-6 py-5 bg-surface-900/50 border border-surface-800 rounded-2xl text-white text-lg placeholder:text-surface-600 focus:outline-none focus:border-accent focus:bg-surface-900 transition-all shadow-inner"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button variant="outline" onClick={prevStep} className="h-16 px-8 rounded-2xl border-surface-800 text-surface-300 hover:text-white bg-surface-900/50">Back</Button>
                  <Button onClick={nextStep} disabled={!skillRequired.trim()} className="flex-1 bg-white text-surface-950 hover:bg-surface-100 h-16 rounded-2xl text-lg font-bold shadow-[0_0_40px_rgba(255,255,255,0.1)]">
                    Continue
                  </Button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="step3" {...fadeUp} className="max-w-xl mx-auto w-full">
                <div className="mb-10">
                  <span className="text-accent font-bold tracking-widest uppercase text-xs mb-3 block">Step 3 of 3</span>
                  <h2 className="text-4xl font-bold font-heading text-white mb-3">The Details</h2>
                  <p className="text-surface-400 text-lg">Provide a description and timeframe for the job.</p>
                </div>

                <div className="space-y-6 mb-12">
                  <div>
                    <label className="block text-sm font-bold text-white mb-3">Schedule / Timeframe (Optional)</label>
                    <div className="relative">
                      <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 text-surface-500 w-5 h-5" />
                      <input
                        value={schedule}
                        onChange={(e) => setSchedule(e.target.value)}
                        placeholder="e.g. This Saturday morning"
                        className="w-full pl-14 pr-6 py-5 bg-surface-900/50 border border-surface-800 rounded-2xl text-white text-lg placeholder:text-surface-600 focus:outline-none focus:border-accent focus:bg-surface-900 transition-all shadow-inner"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-white mb-3">Job Description</label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={5}
                      placeholder="Describe the task, tools needed, or any specific requirements..."
                      className="w-full px-6 py-6 bg-surface-900/50 border border-surface-800 rounded-[2rem] text-white text-lg placeholder:text-surface-600 focus:outline-none focus:border-accent resize-none transition-all shadow-inner leading-relaxed"
                    />
                  </div>
                </div>

                {error && <p className="text-red-400 bg-red-400/10 border border-red-400/20 p-4 rounded-xl text-sm font-medium mb-6 flex items-center gap-2"><X className="w-4 h-4"/> {error}</p>}

                <div className="flex gap-4">
                  <Button variant="outline" onClick={prevStep} disabled={isSubmitting} className="h-16 px-8 rounded-2xl border-surface-800 text-surface-300 hover:text-white bg-surface-900/50">Back</Button>
                  <Button onClick={handleSubmit} isLoading={isSubmitting} disabled={!description.trim()} className="flex-1 bg-accent text-accent-foreground hover:bg-accent-light h-16 rounded-2xl text-lg font-bold shadow-[0_0_40px_rgba(var(--color-accent),0.3)]">
                    {isSubmitting ? 'Posting Job...' : 'Post Job'}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
