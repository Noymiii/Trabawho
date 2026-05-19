import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import { messageAPI, matchAPI, contractAPI } from '../services/api';
import { Button } from '../components/ui/Button';
import { ReviewModal } from '../components/reviews/ReviewModal';
import { ContractModal } from '../components/chat/ContractModal';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, MessageCircle, ArrowLeft, CheckCircle2, Star, FileText, Check, X } from 'lucide-react';
import { cn } from '../lib/utils';
import type { Message, Conversation, Contract } from '../types';
import { useToast } from '../contexts/ToastContext';

const easeOut = [0.23, 1, 0.32, 1] as const;

export default function Chat() {
  const { user } = useAuth();
  const { socket } = useSocket();
  const location = useLocation();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeMatchId, setActiveMatchId] = useState<number | null>(location.state?.matchId || null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [showContractModal, setShowContractModal] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isCompleting, setIsCompleting] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const { addToast } = useToast();
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
    const fetchContracts = async () => {
      try { const res = await contractAPI.getByMatch(activeMatchId); setContracts(res.data || []); }
      catch { /* */ }
    };
    fetchMessages();
    fetchContracts();
    socket?.emit('join-match', activeMatchId);
  }, [activeMatchId, socket]);

  useEffect(() => {
    if (!socket) return;
    const handleMessage = (msg: Message) => {
      if (msg.matchId === activeMatchId) setMessages(prev => [...prev, msg]);
    };
    const handleContractProposed = (contract: Contract) => {
      if (contract.matchId === activeMatchId) {
        setContracts(prev => {
          const updated = prev.map(c => c.status === 'pending' ? { ...c, status: 'rejected' as const } : c);
          return [...updated, contract];
        });
      }
    };
    const handleContractUpdated = (data: { id: number; matchId: number; status: 'accepted' | 'rejected' }) => {
      if (data.matchId === activeMatchId) {
        setContracts(prev => prev.map(c => c.id === data.id ? { ...c, status: data.status } : c));
      }
    };
    
    socket.on('message-received', handleMessage);
    socket.on('contract-proposed', handleContractProposed);
    socket.on('contract-updated', handleContractUpdated);
    
    return () => { 
      socket.off('message-received', handleMessage); 
      socket.off('contract-proposed', handleContractProposed);
      socket.off('contract-updated', handleContractUpdated);
    };
  }, [socket, activeMatchId]);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, contracts]);

  const handleAcceptContract = async (id: number) => {
    try {
      await contractAPI.updateStatus(id, 'accepted');
      setContracts(prev => prev.map(c => c.id === id ? { ...c, status: 'accepted' } : c));
      addToast({ type: 'success', title: 'Contract Accepted', message: 'You have accepted the proposed terms.' });
    } catch (err: any) {
      addToast({ type: 'error', title: 'Error', message: err.response?.data?.message || 'Failed to accept contract.' });
    }
  };

  const handleRejectContract = async (id: number) => {
    try {
      await contractAPI.updateStatus(id, 'rejected');
      setContracts(prev => prev.map(c => c.id === id ? { ...c, status: 'rejected' } : c));
      addToast({ type: 'info', title: 'Contract Rejected', message: 'You have rejected the proposed terms.' });
    } catch (err: any) {
      addToast({ type: 'error', title: 'Error', message: err.response?.data?.message || 'Failed to reject contract.' });
    }
  };

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

  const handleCompleteJob = async () => {
    if (!activeMatchId) return;
    setIsCompleting(true);
    try {
      await matchAPI.updateStatus(activeMatchId, 'completed');
      // Update local conversation state
      setConversations(prev => prev.map(c => 
        c.matchId === activeMatchId ? { ...c, matchStatus: 'completed' } : c
      ));
      setShowReviewModal(true);
    } catch (err) {
      console.error('Failed to complete job:', err);
    } finally {
      setIsCompleting(false);
    }
  };

  const activeConv = conversations.find(c => c.matchId === activeMatchId);
  const isCompleted = activeConv?.matchStatus === 'completed';

  // Determine the reviewee ID (the other user in the match)
  const revieweeId = activeConv?.otherUser?.id;

  return (
    <>
    {showContractModal && activeConv && (
      <ContractModal
        isOpen={showContractModal}
        onClose={() => setShowContractModal(false)}
        matchId={activeConv.matchId}
        onSuccess={(newContract) => setContracts(prev => [...prev, newContract])}
      />
    )}
    {showReviewModal && activeConv && revieweeId && (
      <ReviewModal
        matchId={activeConv.matchId}
        revieweeId={revieweeId}
        revieweeName={activeConv.otherUser.fullname}
        onComplete={() => {
          setShowReviewModal(false);
        }}
        onSkip={() => setShowReviewModal(false)}
      />
    )}
    <div className="min-h-dvh pt-16 bg-surface-950">
      <div className="max-w-6xl mx-auto h-[calc(100dvh-4rem)] flex p-4 lg:p-6">
        <div className="w-full h-full bg-surface-900 border border-surface-800 rounded-3xl flex overflow-hidden shadow-float">
          {/* Sidebar */}
          <div className={cn(
            'w-full md:w-80 border-r border-surface-800 flex flex-col bg-surface-900/50',
            activeMatchId ? 'hidden md:flex' : 'flex'
          )}>
            <div className="p-6 border-b border-surface-800">
              <h2 className="text-xl font-bold font-heading flex items-center gap-3 text-white tracking-tight">
                <MessageCircle className="h-6 w-6 text-accent" /> Messages
              </h2>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {isLoading ? (
                <div className="flex justify-center py-8"><div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" /></div>
              ) : conversations.length === 0 ? (
                <div className="p-8 text-center flex flex-col items-center justify-center h-full">
                  <div className="w-16 h-16 rounded-full bg-surface-800 flex items-center justify-center mb-4 border border-surface-700">
                    <MessageCircle className="h-8 w-8 text-surface-500" />
                  </div>
                  <p className="text-white font-semibold mb-1 text-base">No conversations yet</p>
                  <p className="text-surface-500 text-sm">Match with someone to start chatting</p>
                </div>
              ) : (
                conversations.map(conv => (
                  <button key={conv.matchId} onClick={() => setActiveMatchId(conv.matchId)}
                    className={cn(
                      'w-full flex items-center gap-4 p-5 border-b border-surface-800 hover:bg-surface-800/80 transition-colors duration-200 cursor-pointer text-left',
                      activeMatchId === conv.matchId && 'bg-surface-800'
                    )}
                    style={{ transitionTimingFunction: 'var(--ease-out)' }}
                  >
                    <div className="w-12 h-12 rounded-full bg-surface-800 border border-surface-700 flex items-center justify-center text-surface-400 font-bold text-base shrink-0">
                      {conv.otherUser.fullname[0]}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-white truncate">{conv.otherUser.fullname}</p>
                      <p className="text-xs text-surface-400 truncate mt-1">{conv.lastMessage?.message || 'No messages yet'}</p>
                    </div>
                    {conv.matchStatus === 'completed' ? (
                      <CheckCircle2 className="w-5 h-5 text-accent shrink-0" />
                    ) : conv.unreadCount > 0 ? (
                      <span className="w-5 h-5 rounded-full bg-accent text-white text-xs flex items-center justify-center font-bold">{conv.unreadCount}</span>
                    ) : null}
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className={cn('flex-1 flex flex-col bg-surface-950/50 relative', !activeMatchId ? 'hidden md:flex' : 'flex')}>
            {!activeMatchId ? (
              <div className="flex-1 flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-accent/5 via-surface-950 to-transparent opacity-50" />
                <div className="text-center flex flex-col items-center relative z-10">
                  <div className="w-20 h-20 rounded-3xl bg-surface-900 border border-surface-800 flex items-center justify-center mb-6 shadow-float transform rotate-3">
                    <MessageCircle className="h-8 w-8 text-surface-500" />
                  </div>
                  <h3 className="text-xl font-bold font-heading text-white mb-2">Select a conversation</h3>
                  <p className="text-surface-400 text-sm max-w-[200px]">Choose a match from the sidebar to start sending messages</p>
                </div>
              </div>
            ) : (
              <>
                {/* Chat Header */}
                <div className="px-6 py-5 border-b border-surface-800 flex items-center gap-4 bg-surface-900/80 backdrop-blur-md z-10">
                  <button onClick={() => setActiveMatchId(null)} className="md:hidden p-2 -ml-2 rounded-xl hover:bg-surface-800 transition-colors cursor-pointer text-surface-400">
                    <ArrowLeft className="h-6 w-6" />
                  </button>
                  <div className="w-10 h-10 rounded-full bg-surface-800 border border-surface-700 flex items-center justify-center text-surface-300 text-base font-bold">
                    {activeConv?.otherUser.fullname[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold font-heading text-base text-white">{activeConv?.otherUser.fullname}</p>
                    <p className="text-xs font-medium text-accent capitalize">{activeConv?.otherUser.role}</p>
                  </div>
                  {/* Action buttons */}
                  {isCompleted ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setShowReviewModal(true)}
                        className="flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 text-accent text-sm font-bold hover:bg-accent/20 transition-colors cursor-pointer"
                      >
                        <Star className="w-4 h-4" /> Leave Review
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setShowContractModal(true)}
                        className="flex items-center gap-2 px-4 py-2 rounded-full bg-surface-800 hover:bg-surface-700 text-white text-sm font-bold border border-surface-700 transition-colors cursor-pointer"
                      >
                        <FileText className="w-4 h-4 mr-1.5" /> Propose Contract
                      </button>
                      <Button
                        onClick={handleCompleteJob}
                        isLoading={isCompleting}
                        className="bg-accent/10 border border-accent/20 text-accent hover:bg-accent/20 text-sm font-bold rounded-full px-4 py-2 h-auto"
                      >
                        <CheckCircle2 className="w-4 h-4 mr-1.5" /> Complete Job
                      </Button>
                    </div>
                  )}
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                  <AnimatePresence initial={false}>
                    {(() => {
                      const feedItems = [
                        ...messages.map(m => ({ type: 'message' as const, id: m.id, createdAt: m.createdAt, data: m })),
                        ...contracts.map(c => ({ type: 'contract' as const, id: c.id, createdAt: c.createdAt, data: c }))
                      ].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

                      return feedItems.map((item, idx) => {
                        const showTime = idx === 0 || new Date(item.createdAt).getTime() - new Date(feedItems[idx - 1].createdAt).getTime() > 5 * 60 * 1000;
                        
                        if (item.type === 'message') {
                          const msg = item.data as Message;
                          const isSender = msg.senderId === user?.id;
                          return (
                            <div key={`msg-${msg.id}`} className="flex flex-col">
                              {showTime && (
                                <div className="text-center my-4">
                                  <span className="text-[10px] font-semibold tracking-wider uppercase text-surface-500 bg-surface-900 px-3 py-1 rounded-full border border-surface-800">
                                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                </div>
                              )}
                              <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                transition={{ duration: 0.3, ease: easeOut }}
                                className={cn('flex', isSender ? 'justify-end' : 'justify-start')}
                              >
                                <div className={cn(
                                  'max-w-[75%] px-5 py-3 rounded-2xl text-[15px] leading-relaxed shadow-sm',
                                  isSender
                                    ? 'bg-white text-surface-950 rounded-br-sm'
                                    : 'bg-surface-800 border border-surface-700 text-white rounded-bl-sm'
                                )}>
                                  <p>{msg.message}</p>
                                </div>
                              </motion.div>
                            </div>
                          );
                        } else {
                          const contract = item.data as Contract;
                          const isProposer = contract.proposerId === user?.id;
                          
                          return (
                            <div key={`contract-${contract.id}`} className="flex flex-col">
                              {showTime && (
                                <div className="text-center my-4">
                                  <span className="text-[10px] font-semibold tracking-wider uppercase text-surface-500 bg-surface-900 px-3 py-1 rounded-full border border-surface-800">
                                    {new Date(contract.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                </div>
                              )}
                              <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                transition={{ duration: 0.3, ease: easeOut }}
                                className="flex justify-center my-2"
                              >
                                <div className={cn(
                                  'w-full max-w-sm rounded-2xl p-5 border text-white shadow-lg backdrop-blur-md relative overflow-hidden',
                                  contract.status === 'accepted' 
                                    ? 'bg-accent/10 border-accent/20 text-accent-light' 
                                    : contract.status === 'rejected'
                                    ? 'bg-danger/10 border-danger/20 text-danger-light'
                                    : 'bg-surface-900 border-surface-800'
                                )}>
                                  <div className="flex items-start gap-3">
                                    <div className={cn(
                                      'w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5',
                                      contract.status === 'accepted'
                                        ? 'bg-accent/20 text-accent'
                                        : contract.status === 'rejected'
                                        ? 'bg-danger/20 text-danger'
                                        : 'bg-surface-800 text-surface-400'
                                    )}>
                                      <FileText className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex justify-between items-start mb-1">
                                        <h4 className="font-bold text-sm">Contract Proposal</h4>
                                        <span className={cn(
                                          'text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border',
                                          contract.status === 'accepted'
                                            ? 'bg-accent/20 border-accent/30 text-accent'
                                            : contract.status === 'rejected'
                                            ? 'bg-danger/20 border-danger/30 text-danger'
                                            : 'bg-surface-850 border-surface-700 text-surface-400'
                                        )}>
                                          {contract.status}
                                        </span>
                                      </div>
                                      <p className="text-[10px] text-surface-400 mb-3">
                                        Proposed by {isProposer ? 'you' : contract.proposer?.fullname || 'the other party'}
                                      </p>
                                      <div className="bg-surface-950/60 border border-surface-850 rounded-xl p-3 mb-3">
                                        <div className="text-xs text-surface-400 mb-1">Scope / Terms:</div>
                                        <div className="text-sm text-white font-medium leading-relaxed mb-2">{contract.description}</div>
                                        <div className="flex items-baseline gap-1 text-accent font-bold text-lg">
                                          <span className="text-xs font-semibold">₱</span>
                                          {parseFloat(contract.price.toString()).toLocaleString()}
                                        </div>
                                      </div>

                                      {/* Action Buttons for receiver when pending */}
                                      {contract.status === 'pending' && !isProposer && (
                                        <div className="flex gap-2">
                                          <button
                                            onClick={() => handleRejectContract(contract.id)}
                                            className="flex-1 py-2 px-3 rounded-lg border border-danger/30 text-danger hover:bg-danger/10 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                                          >
                                            <X className="w-3.5 h-3.5" /> Reject
                                          </button>
                                          <button
                                            onClick={() => handleAcceptContract(contract.id)}
                                            className="flex-1 py-2 px-3 rounded-lg bg-accent text-white hover:bg-accent-light text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-float"
                                          >
                                            <Check className="w-3.5 h-3.5" /> Accept
                                          </button>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </motion.div>
                            </div>
                          );
                        }
                      });
                    })()}
                  </AnimatePresence>
                  <div ref={messagesEndRef} />
                </div>

                {/* Completed Banner */}
                {isCompleted && (
                  <div className="px-6 py-3 bg-accent/5 border-t border-accent/10 flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-accent" />
                    <span className="text-sm font-semibold text-accent">This job has been completed</span>
                  </div>
                )}

                {/* Input */}
                <div className="p-4 md:p-6 border-t border-surface-800 bg-surface-900/50 backdrop-blur-md">
                  <form onSubmit={e => { e.preventDefault(); sendMessage(); }} className="flex gap-3">
                    <input value={newMessage} onChange={e => setNewMessage(e.target.value)} placeholder={isCompleted ? 'Job completed — send a follow-up...' : 'Type a message...'}
                      className="flex-1 h-12 px-5 bg-surface-950 border border-surface-800 rounded-full text-white placeholder:text-surface-500 focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/10 text-[15px] font-medium transition-all duration-300"
                    />
                    <Button type="submit" size="icon" className="w-12 h-12 rounded-full shrink-0 bg-white text-surface-950 hover:bg-surface-100 disabled:opacity-50 disabled:bg-surface-800 disabled:text-surface-500 transition-colors" disabled={!newMessage.trim()}>
                      <Send className="h-5 w-5" />
                    </Button>
                  </form>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
