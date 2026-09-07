import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { 
  LifeBuoy, Plus, MessageSquare, Send, Paperclip, 
  Clock, CheckCircle2, AlertCircle, X, ChevronRight, User, Shield 
} from 'lucide-react';

const UserSupport = () => {
  const { success, error: toastError } = useToast();

  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [loading, setLoading] = useState(true);

  // New Ticket Form Modal State
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newTicket, setNewTicket] = useState({
    subject: '',
    category: 'General',
    priority: 'Medium',
    initialMessage: '',
    attachmentPath: ''
  });
  const [creating, setCreating] = useState(false);

  // Reply State
  const [replyMessage, setReplyMessage] = useState('');
  const [replying, setReplying] = useState(false);

  const loadTickets = async () => {
    try {
      setLoading(true);
      const res = await api.get('/support/tickets?page=1&pageSize=20');
      if (res.data?.data?.items) {
        setTickets(res.data.data.items);
      }
    } catch (err) {
      console.error('Failed to load tickets:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadTicketDetails = async (ticketId) => {
    try {
      const res = await api.get(`/support/tickets/${ticketId}`);
      if (res.data?.data) {
        setSelectedTicket(res.data.data);
      }
    } catch (err) {
      toastError('Failed to load ticket thread.');
    }
  };

  useEffect(() => {
    loadTickets();
  }, []);

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    if (!newTicket.subject.trim() || !newTicket.initialMessage.trim()) {
      toastError('Subject and Message are mandatory.');
      return;
    }

    try {
      setCreating(true);
      const res = await api.post('/support/tickets', newTicket);
      if (res.data?.success) {
        success('Support ticket created successfully!');
        setCreateModalOpen(false);
        setNewTicket({
          subject: '',
          category: 'General',
          priority: 'Medium',
          initialMessage: '',
          attachmentPath: ''
        });
        loadTickets();
      } else {
        toastError(res.data?.message || 'Failed to create ticket.');
      }
    } catch (err) {
      toastError(err.response?.data?.message || 'Ticket creation error.');
    } finally {
      setCreating(false);
    }
  };

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!selectedTicket || !replyMessage.trim()) return;

    try {
      setReplying(true);
      const res = await api.post(`/support/tickets/${selectedTicket.id}/reply`, {
        message: replyMessage.trim()
      });

      if (res.data?.success) {
        success('Reply sent!');
        setReplyMessage('');
        loadTicketDetails(selectedTicket.id);
        loadTickets();
      } else {
        toastError(res.data?.message || 'Failed to send reply.');
      }
    } catch (err) {
      toastError(err.response?.data?.message || 'Reply sending error.');
    } finally {
      setReplying(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Title & Action */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-black text-2xl sm:text-3xl text-slate-100">
            Support Desk & Tickets
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Need help with an account, deposit, or task? Open a ticket to receive direct priority assistance.
          </p>
        </div>

        <button
          onClick={() => setCreateModalOpen(true)}
          className="px-6 py-3 rounded-xl text-white font-bold text-xs flex items-center gap-2 transition-all hover:scale-105 active:scale-95 shadow-lg"
          style={{
            background: 'var(--theme-gradient-brand)',
            boxShadow: 'var(--theme-glow)'
          }}
        >
          <Plus className="w-4 h-4" />
          <span>Open New Ticket</span>
        </button>
      </div>

      {/* Tickets List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tickets.length > 0 ? (
          tickets.map((t) => (
            <div
              key={t.id}
              onClick={() => loadTicketDetails(t.id)}
              className="p-6 rounded-3xl glass-card cursor-pointer transition-all hover:shadow-xl space-y-4 flex flex-col justify-between group"
              style={{
                background: 'var(--theme-bg-surface)',
                borderColor: 'var(--theme-border)'
              }}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold" style={{ color: 'var(--theme-primary)' }}>
                    #{t.ticketNumber}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    t.status === 'Resolved' || t.status === 'Closed'
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/50'
                      : t.status === 'AwaitingUser'
                      ? 'bg-indigo-950 text-indigo-300 border border-indigo-800/50 animate-pulse'
                      : 'bg-amber-950 text-amber-300 border border-amber-800/50'
                  }`}>
                    {t.status}
                  </span>
                </div>

                <h3 className="font-heading font-bold text-sm text-slate-100 group-hover:text-slate-200 transition-colors line-clamp-2">
                  {t.subject}
                </h3>

                <div className="flex items-center gap-2 text-[11px] text-slate-400">
                  <span 
                    className="px-2 py-0.5 rounded-md"
                    style={{ background: 'var(--theme-bg-main)', border: '1px solid var(--theme-border)' }}
                  >
                    {t.category}
                  </span>
                  <span>•</span>
                  <span>{new Date(t.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              <div 
                className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-semibold"
                style={{ color: 'var(--theme-primary)' }}
              >
                <span>View Discussion</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))
        ) : (
          <div 
            className="md:col-span-3 p-12 text-center rounded-3xl glass-card text-slate-400 space-y-2"
            style={{ background: 'var(--theme-bg-surface)' }}
          >
            <MessageSquare className="w-10 h-10 mx-auto text-slate-600" />
            <p className="text-sm font-semibold text-slate-200">No support tickets found</p>
            <p className="text-xs text-slate-500">Have an inquiry? Click "Open New Ticket" above to reach our support team.</p>
          </div>
        )}
      </div>

      {/* 2. Create Ticket Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div 
            className="w-full max-w-lg glass-card rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 animate-scale-up"
            style={{
              background: 'var(--theme-bg-surface)',
              borderColor: 'var(--theme-border)',
              boxShadow: 'var(--theme-glow)'
            }}
          >
            <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
              <h3 className="font-heading font-bold text-lg text-slate-100">
                Open Support Ticket
              </h3>
              <button
                onClick={() => setCreateModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTicket} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Subject</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Deposit confirmation inquiry"
                  value={newTicket.subject}
                  onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl text-sm text-white focus:outline-none"
                  style={{
                    background: 'var(--theme-bg-main)',
                    border: '1px solid var(--theme-border)'
                  }}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Category</label>
                  <select
                    value={newTicket.category}
                    onChange={(e) => setNewTicket({ ...newTicket, category: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl text-xs font-semibold text-white focus:outline-none"
                    style={{
                      background: 'var(--theme-bg-main)',
                      border: '1px solid var(--theme-border)'
                    }}
                  >
                    {['General', 'Deposit', 'Withdrawal', 'TaskReward', 'Account', 'Technical'].map((c) => (
                      <option key={c} value={c} className="bg-slate-900 text-white">{c}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Priority</label>
                  <select
                    value={newTicket.priority}
                    onChange={(e) => setNewTicket({ ...newTicket, priority: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl text-xs font-semibold text-white focus:outline-none"
                    style={{
                      background: 'var(--theme-bg-main)',
                      border: '1px solid var(--theme-border)'
                    }}
                  >
                    {['Low', 'Medium', 'High', 'Urgent'].map((p) => (
                      <option key={p} value={p} className="bg-slate-900 text-white">{p}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Message Description</label>
                <textarea
                  required
                  rows="4"
                  placeholder="Describe your question or issue in detail..."
                  value={newTicket.initialMessage}
                  onChange={(e) => setNewTicket({ ...newTicket, initialMessage: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl text-sm text-white focus:outline-none"
                  style={{
                    background: 'var(--theme-bg-main)',
                    border: '1px solid var(--theme-border)'
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={creating}
                className="w-full py-3.5 rounded-xl text-white font-bold text-xs shadow-lg transition-all disabled:opacity-50 hover:scale-[1.02] active:scale-95"
                style={{
                  background: 'var(--theme-gradient-brand)',
                  boxShadow: 'var(--theme-glow)'
                }}
              >
                {creating ? 'Submitting...' : 'Submit Support Ticket'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 3. Threaded Conversation Viewer Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div 
            className="w-full max-w-2xl glass-card rounded-3xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden animate-scale-up"
            style={{
              background: 'var(--theme-bg-surface)',
              borderColor: 'var(--theme-border)',
              boxShadow: 'var(--theme-glow)'
            }}
          >
            {/* Thread Header */}
            <div className="p-6 border-b border-slate-800/80 flex items-center justify-between shrink-0">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold" style={{ color: 'var(--theme-primary)' }}>
                    #{selectedTicket.ticketNumber}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-950 text-indigo-300 border border-indigo-800/50">
                    {selectedTicket.status}
                  </span>
                </div>
                <h3 className="font-heading font-bold text-base text-slate-100 mt-1">
                  {selectedTicket.subject}
                </h3>
              </div>

              <button
                onClick={() => setSelectedTicket(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Thread Message History */}
            <div className="p-6 space-y-4 overflow-y-auto flex-1">
              {selectedTicket.messages?.map((msg) => {
                const isAdmin = msg.senderRole === 'Admin' || msg.senderRole === 'SupportAgent';
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isAdmin ? 'items-start' : 'items-end'}`}
                  >
                    <div className="flex items-center gap-2 mb-1 text-[11px] text-slate-400">
                      {isAdmin ? (
                        <>
                          <Shield className="w-3.5 h-3.5" style={{ color: 'var(--theme-primary)' }} />
                          <span className="font-bold text-slate-200">NOVYRA Support Rep</span>
                        </>
                      ) : (
                        <>
                          <User className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="font-bold text-slate-300">You</span>
                        </>
                      )}
                      <span>•</span>
                      <span>{new Date(msg.createdAt).toLocaleTimeString()}</span>
                    </div>

                    <div
                      className={`p-4 rounded-2xl text-xs max-w-lg leading-relaxed ${
                        isAdmin
                          ? 'border text-slate-200'
                          : 'text-white shadow-md'
                      }`}
                      style={
                        isAdmin
                          ? {
                              background: 'var(--theme-bg-main)',
                              borderColor: 'var(--theme-border)'
                            }
                          : {
                              background: 'var(--theme-gradient-brand)',
                              boxShadow: 'var(--theme-glow)'
                            }
                      }
                    >
                      {msg.message}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Reply Input Box */}
            <div 
              className="p-4 border-t border-slate-800/80 shrink-0"
              style={{ background: 'var(--theme-bg-main)' }}
            >
              <form onSubmit={handleSendReply} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Type your reply message..."
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  className="flex-1 px-4 py-3 rounded-xl text-xs text-white focus:outline-none"
                  style={{
                    background: 'var(--theme-bg-surface)',
                    border: '1px solid var(--theme-border)'
                  }}
                />
                <button
                  type="submit"
                  disabled={replying || !replyMessage.trim()}
                  className="px-5 py-3 rounded-xl text-white font-bold text-xs disabled:opacity-40 flex items-center gap-2 transition-all shrink-0 hover:scale-[1.02] active:scale-95 shadow-md"
                  style={{
                    background: 'var(--theme-gradient-brand)',
                    boxShadow: 'var(--theme-glow)'
                  }}
                >
                  <Send className="w-4 h-4" />
                  <span>Send</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserSupport;
