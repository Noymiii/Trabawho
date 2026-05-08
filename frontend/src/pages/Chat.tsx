import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import { messageAPI } from '../services/api';
import { Button } from '../components/ui/Button';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, MessageCircle, ArrowLeft } from 'lucide-react';
import { cn } from '../lib/utils';
import type { Message, Conversation } from '../types';

export default function Chat() {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeMatchId, setActiveMatchId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchConversations = async () => {
      try { const res = await messageAPI.getConversations(); setConversations(res.data.conversations || []); }
      catch { /* */ } finally { setIsLoading(false); }
    };
    fetchConversations();
  }, []);

  useEffect(() => {
    if (!activeMatchId) return;
    const fetchMessages = async () => {
      try { const res = await messageAPI.getByMatch(activeMatchId); setMessages(res.data.messages || []); }
      catch { /* */ }
    };
    fetchMessages();
    socket?.emit('join-match', activeMatchId);
  }, [activeMatchId, socket]);

  useEffect(() => {
    if (!socket) return;
    const handleMessage = (msg: Message) => {
      if (msg.matchId === activeMatchId) setMessages(prev => [...prev, msg]);
    };
    socket.on('message-received', handleMessage);
    return () => { socket.off('message-received', handleMessage); };
  }, [socket, activeMatchId]);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !activeMatchId) return;
    const activeConv = conversations.find(c => c.matchId === activeMatchId);
    if (!activeConv) return;
    socket?.emit('send-message', {
      matchId: activeMatchId, receiverId: activeConv.otherUser.id, message: newMessage.trim(),
    });
    setMessages(prev => [...prev, {
      id: Date.now(), senderId: user!.id, receiverId: activeConv.otherUser.id,
      matchId: activeMatchId, message: newMessage.trim(), isRead: false, createdAt: new Date().toISOString(),
    }]);
    setNewMessage('');
  };

  const activeConv = conversations.find(c => c.matchId === activeMatchId);

  return (
    <div className="min-h-dvh pt-16">
      <div className="max-w-5xl mx-auto h-[calc(100dvh-4rem)] flex">
        {/* Sidebar - Conversations */}
        <div className={cn(
          'w-full md:w-80 border-r border-surface-700/50 flex flex-col bg-surface-900/50',
          activeMatchId ? 'hidden md:flex' : 'flex'
        )}>
          <div className="p-4 border-b border-surface-700/50">
            <h2 className="text-lg font-semibold font-heading flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-primary" /> Messages
            </h2>
          </div>
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="flex justify-center py-8"><div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" /></div>
            ) : conversations.length === 0 ? (
              <div className="p-6 text-center">
                <MessageCircle className="h-12 w-12 text-surface-600 mx-auto mb-3" />
                <p className="text-surface-400 text-sm">No conversations yet</p>
                <p className="text-surface-500 text-xs mt-1">Match with someone to start chatting!</p>
              </div>
            ) : (
              conversations.map(conv => (
                <button key={conv.matchId} onClick={() => setActiveMatchId(conv.matchId)}
                  className={cn(
                    'w-full flex items-center gap-3 p-4 border-b border-surface-800/50 hover:bg-surface-800/50 transition-colors cursor-pointer text-left',
                    activeMatchId === conv.matchId && 'bg-surface-800/70'
                  )}>
                  <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-white font-bold text-sm shrink-0">
                    {conv.otherUser.fullname[0]}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{conv.otherUser.fullname}</p>
                    <p className="text-xs text-surface-500 truncate">{conv.lastMessage?.message || 'No messages yet'}</p>
                  </div>
                  {conv.unreadCount > 0 && (
                    <span className="w-5 h-5 rounded-full bg-primary text-white text-xs flex items-center justify-center">{conv.unreadCount}</span>
                  )}
                </button>
              ))
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className={cn('flex-1 flex flex-col', !activeMatchId ? 'hidden md:flex' : 'flex')}>
          {!activeMatchId ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageCircle className="h-16 w-16 text-surface-600 mx-auto mb-3" />
                <p className="text-surface-400">Select a conversation</p>
              </div>
            </div>
          ) : (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-surface-700/50 flex items-center gap-3 glass">
                <button onClick={() => setActiveMatchId(null)} className="md:hidden p-1 cursor-pointer"><ArrowLeft className="h-5 w-5" /></button>
                <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-white text-sm font-bold">
                  {activeConv?.otherUser.fullname[0]}
                </div>
                <div>
                  <p className="font-medium text-sm">{activeConv?.otherUser.fullname}</p>
                  <p className="text-xs text-surface-500">{activeConv?.otherUser.role}</p>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                <AnimatePresence initial={false}>
                  {messages.map(msg => (
                    <motion.div key={msg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                      className={cn('flex', msg.senderId === user?.id ? 'justify-end' : 'justify-start')}>
                      <div className={cn(
                        'max-w-[75%] px-4 py-2.5 rounded-[var(--radius-lg)] text-sm',
                        msg.senderId === user?.id
                          ? 'gradient-primary text-white rounded-br-sm'
                          : 'bg-surface-800 text-surface-200 rounded-bl-sm'
                      )}>
                        <p>{msg.message}</p>
                        <p className={cn('text-[10px] mt-1', msg.senderId === user?.id ? 'text-white/60' : 'text-surface-500')}>
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-4 border-t border-surface-700/50 glass">
                <form onSubmit={e => { e.preventDefault(); sendMessage(); }} className="flex gap-2">
                  <input value={newMessage} onChange={e => setNewMessage(e.target.value)} placeholder="Type a message..."
                    className="flex-1 h-11 px-4 bg-surface-800 border border-surface-600 rounded-[var(--radius-full)] text-surface-100 placeholder:text-surface-500 focus:outline-none focus:border-primary text-sm" />
                  <Button type="submit" size="icon" className="rounded-full shrink-0" disabled={!newMessage.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
