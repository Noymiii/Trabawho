import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useSocket } from '../contexts/SocketContext';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';
import type { Message } from '../types';

export function GlobalNotificationListener() {
  const { socket, isConnected } = useSocket();
  const { addToast } = useToast();
  const { user } = useAuth();
  const location = useLocation();

  useEffect(() => {
    if (!socket || !isConnected) return;

    const handleMessageReceived = (msg: Message) => {
      // Don't toast if the user sent it
      if (msg.senderId === user?.id) return;

      // Don't toast if the user is already on the chat page.
      // A more robust check could verify if they have the specific matchId open, 
      // but suppressing all message toasts while on /chat is a safe baseline.
      if (location.pathname === '/chat') return;

      addToast({
        type: 'info',
        title: 'New Message',
        message: msg.message,
      });
    };

    socket.on('message-received', handleMessageReceived);

    return () => {
      socket.off('message-received', handleMessageReceived);
    };
  }, [socket, isConnected, addToast, user, location.pathname]);

  return null;
}
