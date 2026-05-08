// User types
export interface User {
  id: number;
  fullname: string;
  email: string;
  role: 'customer' | 'worker' | 'admin';
  avatar?: string;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  fullname: string;
  email: string;
  password: string;
  role: 'customer' | 'worker';
}

// Worker Profile
export interface WorkerProfile {
  id: number;
  userId: number;
  skills: string[];
  bio: string;
  experience: string;
  location: string;
  availability: 'available' | 'busy' | 'offline';
  contactInfo: string;
  hourlyRate?: number;
  user?: User;
}

// Job
export interface Job {
  id: number;
  customerId: number;
  title: string;
  description: string;
  skillRequired: string;
  budget: number;
  location: string;
  schedule: string;
  status: 'open' | 'matched' | 'completed' | 'cancelled';
  createdAt: string;
  customer?: User;
}

// Swipe
export interface SwipeAction {
  targetId: number;
  targetType: 'worker' | 'job';
  direction: 'left' | 'right';
}

// Match
export interface Match {
  id: number;
  workerId: number;
  customerId: number;
  jobId: number;
  status: 'matched' | 'completed' | 'cancelled';
  createdAt: string;
  worker?: User & { profile?: WorkerProfile };
  customer?: User;
  job?: Job;
}

// Message
export interface Message {
  id: number;
  senderId: number;
  receiverId: number;
  matchId: number;
  message: string;
  isRead: boolean;
  createdAt: string;
  sender?: User;
}

// Conversation (for chat list)
export interface Conversation {
  matchId: number;
  otherUser: User;
  lastMessage?: Message;
  unreadCount: number;
}

// Admin Stats
export interface PlatformStats {
  totalUsers: number;
  totalWorkers: number;
  totalCustomers: number;
  totalJobs: number;
  totalMatches: number;
  activeJobs: number;
}
