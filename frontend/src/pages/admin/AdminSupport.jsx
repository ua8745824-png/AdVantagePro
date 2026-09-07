import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { 
  LifeBuoy, Search, Filter, MessageSquare, 
  Send, User, Shield, X, ChevronLeft, ChevronRight 
} from 'lucide-react';

const AdminSupport = () => {
  const { success, error: toastError } = useToast();

  const [tickets, setTickets] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [loading, setLoading] = useState(true);

  // Thread Modal State
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [replying, setReplying] = useState(false);

  const loadTickets = async () => {
    try {
      setLoading(true);
      const res = await api.get(
        `/admin/support/tickets?page=${page}&pageSize=12&status=${statusFilter}&priority=${priorityFilter}`
      );
      if (res.data?.data) {
        setTickets(res.data.data.items || []);
        setTotalPages(res.data.data.totalPages || 1);
      }
    } catch (err) {
      console.error('Failed to load admin tickets:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadTicketDetails = async (id) => {
    try {
      const res = await api.get(`/support/tickets/${id}`);
      if (res.data?.data) {
        setSelectedTicket(res.data.data);
      }
    } catch (err) {
      toastError('Failed to load thread.');
    }
  };

  useEffect(() => {
    loadTickets();
  }, [page, statusFilter, priorityFilter]);

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!selectedTicket || !replyText.trim()) return;

    try {
      setReplying(true);
      const res = await api.post(`/support/tickets/${selectedTicket.id}/reply`, {
        message: replyText.trim()
      });

      if (res.data?.success) {
        success('Support reply sent to user!');
        setReplyText('');
        loadTicketDetails(selectedTicket.id);
        loadTickets();
      } else {
        toastError(res.data?.message || 'Failed to send reply.');
      }
    } catch (err) {
      toastError(err.response?.data?.message || 'Error sending reply.');
    } finally {
      setReplying(false);
    }
  };

  const handleStatusChange = async (ticketId, newStatus) => {
    try {
      const res = await api.put(`/admin/support/tickets/${ticketId}/status?status=${newStatus}`);
      if (res.data?.success) {
        success(`Ticket marked as ${newStatus}.`);
        if (selectedTicket && selectedTicket.id === ticketId) {
          setSelectedTicket({ ...selectedTicket, status: newStatus });
        }
        loadTickets();
      }
    } catch (err) {
      toastError('Failed to update status.');
    }
  };

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h1 className="font-heading font-black text-2xl sm:text-3xl text-white">
          Support Desk Operations
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Review member tickets, prioritize inquiries, and dispatch official support responses.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="p-6 rounded-3xl bg-slate-900/50 border border-slate-800 flex items-center gap-4">
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-semibold text-slate-300 focus:outline-none"
        >
          <option value="All">All Statuses</option>
          <option value="Open">Open</option>
          <option value="AwaitingAdmin">Awaiting Admin Reply</option>
          <option value="AwaitingUser">Awaiting User Response</option>
          <option value="Resolved">Resolved</option>
          <option value="Closed">Closed</option>
        </select>

        <select
          value={priorityFilter}
          onChange={(e) => { setPriorityFilter(e.target.value); setPage(1); }}
          className="px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-semibold text-slate-300 focus:outline-none"
        >
          <option value="All">All Priorities</option>
          <option value="Urgent">Urgent</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>
      </div>

      {/* Tickets Table */}
      <div className="p-6 rounded-3xl bg-slate-900/50 border border-slate-800 space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                <th className="pb-3 px-3">Ticket #</th>
                <th className="pb-3 px-3">User</th>
                <th className="pb-3 px-3">Subject & Category</th>
                <th className="pb-3 px-3 text-center">Priority</th>
                <th className="pb-3 px-3 text-center">Status</th>
                <th className="pb-3 px-3">Created</th>
                <th className="pb-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {tickets.length > 0 ? (
                tickets.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 px-3 font-mono font-bold text-amber-300">
                      {t.ticketNumber}
                    </td>
                    <td className="py-3.5 px-3">
                      <p className="font-bold text-white">@{t.userName}</p>
                      <p className="text-[10px] text-slate-500">{t.userEmail}</p>
                    </td>
                    <td className="py-3.5 px-3">
                      <p className="font-bold text-slate-200">{t.subject}</p>
                      <span className="text-[10px] text-indigo-400 font-mono">{t.category}</span>
                    </td>
                    <td className="py-3.5 px-3 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        t.priority === 'Urgent' ? 'bg-rose-950 text-rose-300 border border-rose-800/60' : 'bg-slate-800 text-slate-300'
                      }`}>
                        {t.priority}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-center">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        t.status === 'Resolved'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/50'
                          : t.status === 'AwaitingAdmin'
                          ? 'bg-amber-950 text-amber-300 border border-amber-800/50 animate-pulse'
                          : 'bg-slate-800 text-slate-400'
                      }`}>
                        {t.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-slate-400 whitespace-nowrap">
                      {new Date(t.createdAt).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      <button
                        onClick={() => loadTicketDetails(t.id)}
                        className="px-3.5 py-1.5 rounded-xl btn-primary text-white font-bold text-[11px]"
                      >
                        Reply Thread
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-slate-500">
                    No tickets found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>Page {page} of {totalPages}</span>
            <div className="flex gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="p-1.5 rounded-lg border border-slate-800 hover:bg-slate-800 disabled:opacity-30"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="p-1.5 rounded-lg border border-slate-800 hover:bg-slate-800 disabled:opacity-30"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Thread & Reply Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-800 flex items-center justify-between shrink-0">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-amber-300">
                    #{selectedTicket.ticketNumber}
                  </span>
                  <select
                    value={selectedTicket.status}
                    onChange={(e) => handleStatusChange(selectedTicket.id, e.target.value)}
                    className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-[11px] font-bold text-slate-200"
                  >
                    {['Open', 'AwaitingUser', 'AwaitingAdmin', 'Resolved', 'Closed'].map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <h3 className="font-heading font-bold text-base text-white mt-1 truncate max-w-md">
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

            {/* Conversation Timeline */}
            <div className="p-6 space-y-4 overflow-y-auto flex-1">
              {selectedTicket.messages?.map((msg) => {
                const isAdmin = msg.senderRole === 'Admin' || msg.senderRole === 'SupportAgent';
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isAdmin ? 'items-end' : 'items-start'}`}
                  >
                    <div className="flex items-center gap-2 mb-1 text-[11px] text-slate-400">
                      {isAdmin ? (
                        <>
                          <span className="font-bold text-amber-300">Support Agent ({msg.senderName})</span>
                          <Shield className="w-3.5 h-3.5 text-amber-400" />
                        </>
                      ) : (
                        <>
                          <User className="w-3.5 h-3.5 text-indigo-400" />
                          <span className="font-bold text-slate-300">@{selectedTicket.userName}</span>
                        </>
                      )}
                      <span>•</span>
                      <span>{new Date(msg.createdAt).toLocaleTimeString()}</span>
                    </div>

                    <div
                      className={`p-4 rounded-2xl text-xs max-w-lg leading-relaxed ${
                        isAdmin
                          ? 'bg-amber-950/40 border border-amber-500/40 text-amber-100 shadow-md'
                          : 'bg-slate-950 border border-slate-800 text-slate-200'
                      }`}
                    >
                      {msg.message}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Reply Input */}
            <div className="p-4 border-t border-slate-800 bg-slate-950/60 shrink-0">
              <form onSubmit={handleSendReply} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Type official support reply..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="flex-1 px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500"
                />
                <button
                  type="submit"
                  disabled={replying || !replyText.trim()}
                  className="px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs disabled:opacity-40 flex items-center gap-2 shrink-0"
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

export default AdminSupport;
