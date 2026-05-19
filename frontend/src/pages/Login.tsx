import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { motion } from 'framer-motion';
import { Mail, Lock } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useState } from 'react';

const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const easeOut = [0.23, 1, 0.32, 1] as const;
const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: easeOut } },
};

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    setServerError('');
    try {
      await login(data.email, data.password);
      navigate('/dashboard');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setServerError(error.response?.data?.message || 'Invalid email or password');
    }
  };

  return (
    <div className="min-h-dvh flex bg-surface-950">
      {/* Left: Brand panel */}
      <div className="hidden lg:flex lg:w-[45%] bg-surface-900 border-r border-surface-800 p-16 flex-col justify-between">
        <div>
          <div className="flex items-center gap-2.5 mb-24">
            <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center border border-white/5">
              <span className="text-white font-heading font-bold text-sm">T</span>
            </div>
            <span className="text-lg font-bold font-heading text-white tracking-tight">TRABAWHO</span>
          </div>
          <h2 className="text-3xl font-bold font-heading text-white tracking-tight mb-4 leading-tight">
            Good to see you again.
          </h2>
          <p className="text-surface-400 leading-relaxed max-w-sm">
            Sign in to check your matches, continue conversations, and discover new opportunities.
          </p>
        </div>
        <p className="text-surface-500 text-sm">&copy; 2026 TRABAWHO</p>
      </div>

      {/* Right: Form */}
      <div className="flex-1 flex items-center justify-center px-6 pt-20 pb-8 relative">
        {/* Glow effect */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md h-[400px] bg-accent/5 rounded-full blur-[100px] pointer-events-none" />
        
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          className="w-full max-w-sm relative z-10"
        >
          {/* Mobile logo */}
          <motion.div variants={fadeUp} className="lg:hidden text-center mb-10">
            <div className="inline-flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-surface-800 border border-surface-700 flex items-center justify-center">
                <span className="text-white font-heading font-bold text-sm">T</span>
              </div>
              <span className="text-lg font-bold font-heading text-white tracking-tight">TRABAWHO</span>
            </div>
          </motion.div>

          <motion.div variants={fadeUp}>
            <h1 className="text-2xl font-bold font-heading text-white mb-1">Sign in</h1>
            <p className="text-surface-400 text-sm mb-8">Enter your credentials to continue</p>
          </motion.div>

          <motion.div variants={fadeUp} className="space-y-5">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {serverError && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, ease: easeOut }}
                  className="p-3.5 rounded-xl bg-danger/10 border border-danger/20 text-danger text-sm font-medium"
                >
                  {serverError}
                </motion.div>
              )}

              <Input
                label="Email"
                type="email"
                icon={<Mail className="h-4 w-4 text-surface-400" />}
                placeholder="you@example.com"
                error={errors.email?.message}
                className="bg-surface-900 border-surface-800 text-white placeholder:text-surface-600 focus:border-accent/50 focus:ring-accent/10"
                labelClassName="text-surface-300"
                {...register('email')}
              />

              <Input
                label="Password"
                type="password"
                icon={<Lock className="h-4 w-4 text-surface-400" />}
                placeholder="Your password"
                error={errors.password?.message}
                className="bg-surface-900 border-surface-800 text-white placeholder:text-surface-600 focus:border-accent/50 focus:ring-accent/10"
                labelClassName="text-surface-300"
                {...register('password')}
              />

              <Button type="submit" isLoading={isSubmitting} className="w-full bg-white text-surface-950 hover:bg-surface-100" size="lg">
                Sign In
              </Button>
            </form>

            <p className="text-sm text-surface-500 text-center pt-2">
              No account yet?{' '}
              <Link
                to="/register"
                className="text-accent hover:text-accent-light font-medium transition-colors duration-150"
              >
                Create one
              </Link>
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
