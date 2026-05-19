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
import { AnimatePresence, motion } from 'framer-motion';

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
        { path: '/profile', label: 'Profile', icon: User },
        ...(user?.role === 'customer'
          ? [{ path: '/post-job', label: 'Post Job', icon: Briefcase }]
          : []),
        { path: '/swipe', label: 'Match', icon: Heart },
        { path: '/chat', label: 'Chat', icon: MessageCircle },
        ...(user?.role === 'admin'
          ? [{ path: '/admin', label: 'Admin', icon: Shield }]
          : []),
      ]
    : [];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 z-30 bg-surface-950/80 backdrop-blur-xl border-b border-surface-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo — typographic mark, no icon */}
          <Link to={isAuthenticated ? '/dashboard' : '/'} className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center">
              <span className="text-surface-950 font-heading font-bold text-sm">T</span>
            </div>
            <span className="text-lg font-bold font-heading text-white tracking-tight">TRABAWHO</span>
          </Link>
 
          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium',
                  'transition-[color,background-color] duration-150',
                  isActive(link.path)
                    ? 'text-accent bg-accent/8 font-semibold'
                    : 'text-surface-400 hover:text-white hover:bg-surface-900'
                )}
                style={{ transitionTimingFunction: 'var(--ease-out)' }}
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
                  <span className="text-surface-500">Hi, </span>
                  <span className="text-white font-medium">
                    {user?.fullname?.split(' ')[0]}
                  </span>
                </div>
                <Button variant="ghost" size="sm" onClick={handleLogout} className="text-surface-400 hover:text-white">
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => navigate('/login')} className="text-surface-400 hover:text-white">
                  Login
                </Button>
                <Button size="sm" onClick={() => navigate('/register')} className="bg-white text-surface-950 hover:bg-surface-100">
                  Get Started
                </Button>
              </div>
            )}
          </div>
 
          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 text-surface-400 hover:text-white cursor-pointer rounded-lg hover:bg-surface-900 transition-colors duration-150"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>
 
      {/* Mobile Menu — slide from top with opacity, no height animation */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
            className="md:hidden bg-surface-950 border-t border-surface-900 shadow-card"
          >
            <div className="px-4 py-3 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors duration-150',
                    isActive(link.path)
                      ? 'text-accent bg-accent/8 font-semibold'
                      : 'text-surface-400 hover:text-white hover:bg-surface-900'
                  )}
                >
                  <link.icon className="h-5 w-5" />
                  {link.label}
                </Link>
              ))}
              {isAuthenticated ? (
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-danger hover:bg-danger/8 transition-colors cursor-pointer"
                >
                  <LogOut className="h-5 w-5" />
                  Logout
                </button>
              ) : (
                <div className="pt-2 space-y-2">
                  <Button
                    variant="ghost"
                    size="md"
                    className="w-full text-surface-400 hover:text-white"
                    onClick={() => { navigate('/login'); setIsMobileMenuOpen(false); }}
                  >
                    Login
                  </Button>
                  <Button
                    size="md"
                    className="w-full bg-white text-surface-950 hover:bg-surface-100"
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
