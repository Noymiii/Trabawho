import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/Button';
import { MapPin, Briefcase, Plus, X, ArrowRight, DollarSign } from 'lucide-react';
import { workerAPI } from '../../services/api';

const SKILL_OPTIONS = [
  'Electrician', 'Plumber', 'Tutor', 'Graphic Designer', 'Programmer',
  'Cleaner', 'Delivery Rider', 'Carpenter', 'Painter', 'Mechanic',
];

const springTransition = { type: "spring", stiffness: 400, damping: 30 } as const;
const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: springTransition as any },
  exit: { opacity: 0, y: -20, transition: { duration: 0.2 } as any }
};

interface WorkerOnboardingProps {
  onComplete: () => void;
}

export function WorkerOnboarding({ onComplete }: WorkerOnboardingProps) {
  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Form State
  const [location, setLocation] = useState('');
  const [hourlyRate, setHourlyRate] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState('');
  const [bio, setBio] = useState('');

  const nextStep = () => setStep((s) => s + 1);
  const prevStep = () => setStep((s) => s - 1);

  const addSkill = (skill: string) => {
    const t = skill.trim();
    if (t && !skills.includes(t)) setSkills([...skills, t]);
    setSkillInput('');
  };

  const removeSkill = (skill: string) => {
    setSkills(skills.filter((s) => s !== skill));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError('');
    try {
      const data = new FormData();
      data.append('location', location);
      data.append('hourlyRate', hourlyRate);
      data.append('skills', JSON.stringify(skills));
      data.append('bio', bio);
      data.append('availability', 'available');

      await workerAPI.updateProfile(data);
      onComplete();
    } catch (err) {
      console.error('Onboarding submit error:', err);
      setError('Failed to save your profile. Please try again.');
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

        <div className="p-8 sm:p-12 md:p-16 min-h-[500px] flex flex-col justify-center">
          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div key="step0" {...fadeUp} className="text-center">
                <div className="w-24 h-24 bg-surface-900 border border-surface-800 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-inner shadow-black/50 rotate-[-4deg]">
                  <Briefcase className="w-10 h-10 text-accent" />
                </div>
                <h2 className="text-4xl md:text-6xl font-bold font-heading text-white tracking-tight mb-6">
                  Set Up Your Profile
                </h2>
                <p className="text-surface-400 text-lg md:text-xl leading-relaxed mb-12 max-w-xl mx-auto">
                  A complete profile builds trust and drastically increases your chances of getting matched with high-quality jobs.
                </p>
                <Button onClick={nextStep} className="bg-white text-surface-950 hover:bg-surface-100 h-16 px-12 rounded-2xl text-lg font-bold">
                  Begin Setup <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </motion.div>
            )}

            {step === 1 && (
              <motion.div key="step1" {...fadeUp} className="max-w-xl mx-auto w-full">
                <div className="mb-10">
                  <span className="text-accent font-bold tracking-widest uppercase text-xs mb-3 block">Step 1 of 3</span>
                  <h2 className="text-4xl font-bold font-heading text-white mb-3">Where are you located?</h2>
                  <p className="text-surface-400 text-lg">Enter your primary operating area and baseline rate.</p>
                </div>

                <div className="space-y-6 mb-12">
                  <div>
                    <label className="block text-sm font-bold text-white mb-3">City / Location</label>
                    <div className="relative">
                      <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 text-surface-500 w-5 h-5" />
                      <input
                        autoFocus
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="e.g. Quezon City, Metro Manila"
                        className="w-full pl-14 pr-6 py-5 bg-surface-900/50 border border-surface-800 rounded-2xl text-white text-lg placeholder:text-surface-600 focus:outline-none focus:border-accent focus:bg-surface-900 transition-all shadow-inner"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-white mb-3">Hourly Rate (Optional)</label>
                    <div className="relative">
                      <DollarSign className="absolute left-5 top-1/2 -translate-y-1/2 text-surface-500 w-5 h-5" />
                      <input
                        type="number"
                        value={hourlyRate}
                        onChange={(e) => setHourlyRate(e.target.value)}
                        placeholder="e.g. 500"
                        className="w-full pl-14 pr-6 py-5 bg-surface-900/50 border border-surface-800 rounded-2xl text-white text-lg placeholder:text-surface-600 focus:outline-none focus:border-accent focus:bg-surface-900 transition-all shadow-inner"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button variant="outline" onClick={prevStep} className="h-16 px-8 rounded-2xl border-surface-800 text-surface-300 hover:text-white bg-surface-900/50">Back</Button>
                  <Button onClick={nextStep} disabled={!location.trim()} className="flex-1 bg-white text-surface-950 hover:bg-surface-100 h-16 rounded-2xl text-lg font-bold shadow-[0_0_40px_rgba(255,255,255,0.1)]">
                    Continue
                  </Button>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="step2" {...fadeUp} className="max-w-2xl mx-auto w-full">
                <div className="mb-10">
                  <span className="text-accent font-bold tracking-widest uppercase text-xs mb-3 block">Step 2 of 3</span>
                  <h2 className="text-4xl font-bold font-heading text-white mb-3">Define your expertise</h2>
                  <p className="text-surface-400 text-lg">Add tags that best describe the services you offer.</p>
                </div>

                <div className="mb-12">
                  <div className="flex gap-3 mb-6">
                    <input
                      autoFocus
                      placeholder="Type a custom skill and press Enter..."
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addSkill(skillInput);
                        }
                      }}
                      className="flex-1 h-16 bg-surface-900/50 border border-surface-800 rounded-2xl px-6 text-white text-lg placeholder:text-surface-600 focus:outline-none focus:border-accent transition-all shadow-inner"
                    />
                    <Button type="button" onClick={() => addSkill(skillInput)} className="w-16 h-16 p-0 rounded-2xl bg-surface-800 text-white border border-surface-700 hover:bg-surface-700">
                      <Plus className="w-6 h-6" />
                    </Button>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-8 p-6 bg-surface-900/30 border border-surface-800 rounded-[2rem] min-h-[100px] shadow-inner shadow-black/20">
                    {skills.length === 0 ? (
                      <span className="text-surface-500 text-base my-auto w-full text-center block">No skills added yet.</span>
                    ) : (
                      skills.map((skill) => (
                        <motion.span 
                          initial={{ scale: 0.8, opacity: 0 }} 
                          animate={{ scale: 1, opacity: 1 }} 
                          key={skill} 
                          className="flex items-center gap-2 pl-5 pr-4 py-3 bg-accent/10 border border-accent/20 text-accent font-bold rounded-full text-sm"
                        >
                          {skill}
                          <button type="button" onClick={() => removeSkill(skill)} className="p-1 hover:bg-accent/20 rounded-full transition-colors">
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </motion.span>
                      ))
                    )}
                  </div>

                  <div>
                    <p className="text-surface-500 text-xs font-bold uppercase tracking-wider mb-4">Popular Suggestions</p>
                    <div className="flex flex-wrap gap-2">
                      {SKILL_OPTIONS.filter((s) => !skills.includes(s)).map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => addSkill(s)}
                          className="text-sm px-5 py-2.5 rounded-full bg-surface-900 text-surface-400 hover:bg-surface-800 hover:text-white border border-surface-800 transition-all font-medium"
                        >
                          + {s}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button variant="outline" onClick={prevStep} className="h-16 px-8 rounded-2xl border-surface-800 text-surface-300 hover:text-white bg-surface-900/50">Back</Button>
                  <Button onClick={nextStep} disabled={skills.length === 0} className="flex-1 bg-white text-surface-950 hover:bg-surface-100 h-16 rounded-2xl text-lg font-bold shadow-[0_0_40px_rgba(255,255,255,0.1)]">
                    Continue
                  </Button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="step3" {...fadeUp} className="max-w-xl mx-auto w-full">
                <div className="mb-10">
                  <span className="text-accent font-bold tracking-widest uppercase text-xs mb-3 block">Step 3 of 3</span>
                  <h2 className="text-4xl font-bold font-heading text-white mb-3">Professional Bio</h2>
                  <p className="text-surface-400 text-lg">Introduce yourself and highlight your experience.</p>
                </div>

                <div className="mb-12">
                  <textarea
                    autoFocus
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={6}
                    placeholder="e.g. I am a certified electrician with 5 years of experience in residential and commercial wiring..."
                    className="w-full px-6 py-6 bg-surface-900/50 border border-surface-800 rounded-[2rem] text-white text-lg placeholder:text-surface-600 focus:outline-none focus:border-accent resize-none transition-all shadow-inner leading-relaxed"
                  />
                </div>

                {error && <p className="text-red-400 bg-red-400/10 border border-red-400/20 p-4 rounded-xl text-sm font-medium mb-6 flex items-center gap-2"><X className="w-4 h-4"/> {error}</p>}

                <div className="flex gap-4">
                  <Button variant="outline" onClick={prevStep} disabled={isSubmitting} className="h-16 px-8 rounded-2xl border-surface-800 text-surface-300 hover:text-white bg-surface-900/50">Back</Button>
                  <Button onClick={handleSubmit} isLoading={isSubmitting} disabled={!bio.trim()} className="flex-1 bg-accent text-accent-foreground hover:bg-accent-light h-16 rounded-2xl text-lg font-bold shadow-[0_0_40px_rgba(var(--color-accent),0.3)]">
                    {isSubmitting ? 'Saving...' : 'Complete Setup'}
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
