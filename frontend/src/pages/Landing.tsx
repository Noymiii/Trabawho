import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { motion } from 'framer-motion';
import {
  Heart,
  ArrowRight,
  Briefcase,
  Users,
  MessageCircle,
  Zap
} from 'lucide-react';

const features = [
  {
    icon: Zap,
    title: 'Swipe to Match',
    description: 'Browse workers or jobs with a fast, fun swipe interface inspired by modern matching apps.',
  },
  {
    icon: Users,
    title: 'Skill-Based Matching',
    description: 'Find the perfect match based on skills, experience, location, and availability.',
  },
  {
    icon: MessageCircle,
    title: 'Instant Chat',
    description: 'Once matched, communicate directly through our built-in messaging system.',
  },
  {
    icon: Briefcase,
    title: 'Post & Discover Jobs',
    description: 'Customers post tasks, workers discover opportunities — simple and efficient.',
  },
];

const steps = [
  { step: '01', title: 'Create Your Profile', desc: 'Sign up as a worker or customer in seconds.' },
  { step: '02', title: 'Browse & Swipe', desc: 'Discover jobs or talented workers with a swipe.' },
  { step: '03', title: 'Get Matched', desc: 'Mutual interest? It\'s a match! Start chatting.' },
];

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-dvh">
      {/* Hero Section */}
      <section className="relative min-h-[90dvh] flex items-center justify-center overflow-hidden pt-20 pb-16 bg-surface-900">
        {/* Clean subtle background accents */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-6 w-full">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="max-w-2xl"
            >
              <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-surface-800 border border-surface-700 mb-8 shadow-sm">
                <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse"></span>
                <span className="text-sm text-surface-200 font-medium tracking-wide">The future of local work</span>
              </div>

              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold font-heading leading-[1.1] mb-6 tracking-tight">
                Match with the perfect <br />
                <span className="gradient-text">skills & talent.</span>
              </h1>

              <p className="text-lg sm:text-xl text-surface-400 mb-10 leading-relaxed font-light">
                TRABAWHO connects skilled professionals with customers effortlessly.
                Experience a premium, intuitive swipe-to-match workflow built for the modern gig economy.
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-4">
                <Button
                  size="lg"
                  onClick={() => navigate('/register')}
                  className="w-full sm:w-auto text-base shadow-glow-primary hover:scale-105 transition-transform"
                >
                  Start Matching
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => navigate('/login')}
                  className="w-full sm:w-auto text-base bg-surface-900/50 backdrop-blur-md hover:bg-surface-800"
                >
                  Sign In
                </Button>
              </div>

              {/* Stats */}
              <div className="mt-12 pt-10 border-t border-surface-800/50 grid grid-cols-3 gap-6">
                {[
                  { value: '5K+', label: 'Active Workers' },
                  { value: '98%', label: 'Match Rate' },
                  { value: '24/7', label: 'Instant Chat' },
                ].map((stat) => (
                  <div key={stat.label}>
                    <div className="text-2xl font-bold text-surface-100 font-heading mb-1">{stat.value}</div>
                    <div className="text-xs text-surface-500 uppercase tracking-wider font-semibold">{stat.label}</div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Right Hero Image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, filter: 'blur(10px)' }}
              animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
              transition={{ duration: 1, delay: 0.2, ease: 'easeOut' }}
              className="relative hidden lg:block"
            >
              <div className="relative card p-2 transform rotate-1 hover:rotate-0 transition-transform duration-500 bg-white">
                <img 
                  src="/hero.png" 
                  alt="Skilled workers collaborating" 
                  className="w-full h-auto rounded-[1.5rem] object-cover shadow-inner opacity-90 hover:opacity-100 transition-opacity"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold font-heading mb-4">
              Why <span className="gradient-text">TRABAWHO</span>?
            </h2>
            <p className="text-surface-400 max-w-xl mx-auto">
              A modern approach to connecting talent with opportunity.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="relative card group hover:border-primary/50 transition-colors duration-300"
              >
                <div className="h-full p-8 flex flex-col items-center text-center">
                  <div className="w-14 h-14 rounded-2xl bg-surface-800 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all duration-300 shadow-sm">
                    <feature.icon className="h-6 w-6 text-primary group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="text-xl font-bold font-heading mb-3 text-surface-100">{feature.title}</h3>
                  <p className="text-surface-400 leading-relaxed">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 px-4 bg-surface-800/30">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold font-heading mb-4">
              How It <span className="gradient-text">Works</span>
            </h2>
          </motion.div>

          <div className="space-y-8">
            {steps.map((step, i) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: i * 0.15, duration: 0.5 }}
                className="card p-8 flex flex-col sm:flex-row items-start sm:items-center gap-6 relative overflow-hidden group hover:border-primary/30 transition-colors"
              >
                <div className="absolute -left-10 -top-10 text-[120px] font-black font-heading text-surface-800 group-hover:text-surface-800/80 transition-colors select-none pointer-events-none">
                  {step.step}
                </div>
                <div className="relative z-10 flex-shrink-0 w-14 h-14 rounded-full bg-primary text-white flex items-center justify-center font-bold text-lg shadow-glow-primary">
                  {step.step}
                </div>
                <div className="relative z-10">
                  <h3 className="text-xl font-bold font-heading mb-2 text-surface-100">{step.title}</h3>
                  <p className="text-surface-400">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto text-center card p-12 sm:p-20 relative overflow-hidden bg-primary-gradient"
        >
          <div className="absolute inset-0 bg-[url('/hero.png')] bg-cover bg-center opacity-10 mix-blend-overlay" />
          
          <div className="relative z-10">
            <h2 className="text-4xl sm:text-5xl font-bold font-heading mb-6 tracking-tight text-white">
              Ready to find your match?
            </h2>
            <p className="text-lg text-white/80 mb-10 max-w-xl mx-auto leading-relaxed">
              Join thousands of professionals and customers already connecting through TRABAWHO. 
              The next great opportunity is just a swipe away.
            </p>
            <Button size="lg" onClick={() => navigate('/register')} className="bg-white text-primary hover:bg-surface-100 text-base px-8 hover:scale-105 transition-transform shadow-lg">
              Create Your Account Now
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-surface-800">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary-gradient flex items-center justify-center">
              <Heart className="h-4 w-4 text-white" fill="white" />
            </div>
            <span className="font-heading font-bold text-surface-100">TRABAWHO</span>
          </div>
          <p className="text-sm text-surface-500">
            © 2026 TRABAWHO. Swipe. Match. Work.
          </p>
        </div>
      </footer>
    </div>
  );
}
