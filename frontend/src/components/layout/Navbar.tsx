import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/Button';
import {
  Home,
  User,
  Briefcase,
  Heart,
  MessageCircle,
  Shield,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMobileMenuOpen(false);
  };

  const navLinks = isAuthenticated
    ? [
        { path: '/dashboard', label: 'Dashboard', icon: Home },
        ...(user?.role === 'worker'
          ? [{ path: '/profile', label: 'Profile', icon: User }]
          : [{ path: '/post-job', label: 'Post Job', icon: Briefcase }]),
        { path: '/swipe', label: 'Match', icon: Heart },
        { path: '/chat', label: 'Chat', icon: MessageCircle },
        ...(user?.role === 'admin'
          ? [{ path: '/admin', label: 'Admin', icon: Shield }]
          : []),
      ]
    : [];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 z-30 bg-surface-900 border-b border-surface-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to={isAuthenticated ? '/dashboard' : '/'} className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary-gradient flex items-center justify-center shadow-glow-primary">
              <Heart className="h-4 w-4 text-white" fill="white" />
            </div>
            <span className="text-xl font-bold font-heading text-surface-100 tracking-tight">TRABAWHO</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all duration-200',
                  isActive(link.path)
                    ? 'text-primary bg-primary/10'
                    : 'text-surface-400 hover:text-surface-100 hover:bg-surface-800'
                )}
              >
                <link.icon className="h-4 w-4" />
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <div className="text-sm">
                  <span className="text-surface-400">Hi, </span>
                  <span className="text-surface-100 font-medium">
                    {user?.fullname?.split(' ')[0]}
                  </span>
                </div>
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>
                  Login
                </Button>
                <Button size="sm" onClick={() => navigate('/register')}>
                  Get Started
                </Button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 text-surface-400 hover:text-surface-100 cursor-pointer"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-surface-900 border-t border-surface-800 overflow-hidden"
          >
            <div className="px-4 py-3 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all',
                    isActive(link.path)
                      ? 'text-primary bg-primary/10'
                      : 'text-surface-400 hover:text-surface-100 hover:bg-surface-800'
                  )}
                >
                  <link.icon className="h-5 w-5" />
                  {link.label}
                </Link>
              ))}
              {isAuthenticated ? (
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 w-full px-3 py-2.5 rounded-[var(--radius-sm)] text-sm font-medium text-danger hover:bg-danger/10 transition-all cursor-pointer"
                >
                  <LogOut className="h-5 w-5" />
                  Logout
                </button>
              ) : (
                <div className="pt-2 space-y-2">
                  <Button
                    variant="ghost"
                    size="md"
                    className="w-full"
                    onClick={() => { navigate('/login'); setIsMobileMenuOpen(false); }}
                  >
                    Login
                  </Button>
                  <Button
                    size="md"
                    className="w-full"
                    onClick={() => { navigate('/register'); setIsMobileMenuOpen(false); }}
                  >
                    Get Started
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
