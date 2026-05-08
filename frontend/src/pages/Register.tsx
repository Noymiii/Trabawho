import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { motion } from 'framer-motion';
import { Heart, Mail, Lock, User, Briefcase, Wrench } from 'lucide-react';
import { cn } from '../lib/utils';

export default function Register() {
  const [fullname, setFullname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'customer' | 'worker'>('worker');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await register(fullname, email, password, role);
      navigate('/dashboard');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-dvh flex items-center justify-center px-4 pt-16 pb-8 bg-surface-900">

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-gradient mb-4 shadow-glow-primary">
            <Heart className="h-8 w-8 text-white" fill="white" />
          </div>
          <h1 className="text-2xl font-bold font-heading">Join TRABAWHO</h1>
          <p className="text-surface-400 mt-1">Create your account and start matching</p>
        </div>

        {/* Form Card */}
        <div className="card p-8 sm:p-10">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-xl bg-danger/10 border border-danger/20 text-danger text-sm font-medium"
              >
                {error}
              </motion.div>
            )}

            {/* Role Selector */}
            <div>
              <label className="block text-sm font-medium text-surface-300 mb-2">
                I want to...
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('worker')}
                  className={cn(
                    'flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer',
                    role === 'worker'
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-surface-600 text-surface-400 hover:border-surface-500'
                  )}
                >
                  <Wrench className="h-6 w-6" />
                  <span className="text-sm font-bold">Find Work</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRole('customer')}
                  className={cn(
                    'flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer',
                    role === 'customer'
                      ? 'border-accent bg-accent/10 text-accent'
                      : 'border-surface-600 text-surface-400 hover:border-surface-500'
                  )}
                >
                  <Briefcase className="h-6 w-6" />
                  <span className="text-sm font-bold">Hire Workers</span>
                </button>
              </div>
            </div>

            <Input
              label="Full Name"
              type="text"
              icon={<User className="h-4 w-4" />}
              placeholder="Juan Dela Cruz"
              value={fullname}
              onChange={(e) => setFullname(e.target.value)}
              required
            />

            <Input
              label="Email"
              type="email"
              icon={<Mail className="h-4 w-4" />}
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Input
              label="Password"
              type="password"
              icon={<Lock className="h-4 w-4" />}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />

            <Button type="submit" isLoading={isLoading} className="w-full" size="lg">
              Create Account
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-surface-400">
              Already have an account?{' '}
              <Link
                to="/login"
                className="text-primary hover:text-primary-light font-medium transition-colors"
              >
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
