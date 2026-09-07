import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { 
  Bell, CheckCheck, Award, ArrowDownToLine, 
  ArrowUpFromLine, Users, LifeBuoy, AlertTriangle, ShieldCheck 
} from 'lucide-react';

const UserNotifications = () => {
  const { refreshSummary } = useOutletContext() || {};
  const { success } = useToast();

  const [notifications, setNotifications] = useState([]);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/notifications?page=1&pageSize=30&unreadOnly=${unreadOnly}`);
      if (res.data?.data?.items) {
        setNotifications(res.data.data.items);
      }
      if (refreshSummary) refreshSummary();
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, [unreadOnly]);

  const handleMarkAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      if (refreshSummary) refreshSummary();
    } catch (err) {
      console.error('Failed to mark read:', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      success('All notifications marked as read.');
      if (refreshSummary) refreshSummary();
    } catch (err) {
      console.error('Failed to mark all read:', err);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'TaskReward': return <Award className="w-5 h-5 text-emerald-400" />;
      case 'ReferralCommission': return <Users className="w-5 h-5 text-amber-400" />;
      case 'DepositApproved': return <ArrowDownToLine className="w-5 h-5 text-teal-400" />;
      case 'WithdrawalUpdate': return <ArrowUpFromLine className="w-5 h-5" style={{ color: 'var(--theme-primary)' }} />;
      case 'SecurityAlert': return <AlertTriangle className="w-5 h-5 text-rose-400" />;
      case 'SupportUpdate': return <LifeBuoy className="w-5 h-5 text-cyan-400" />;
      default: return <Bell className="w-5 h-5" style={{ color: 'var(--theme-primary)' }} />;
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-black text-2xl sm:text-3xl text-slate-100">
            Notifications Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time feed of task verifications, instant commission credits, deposits, and support alerts.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setUnreadOnly(!unreadOnly)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              unreadOnly
                ? 'text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
            style={
              unreadOnly
                ? {
                    background: 'var(--theme-gradient-brand)',
                    boxShadow: 'var(--theme-glow)'
                  }
                : {
                    background: 'var(--theme-bg-surface)',
                    border: '1px solid var(--theme-border)'
                  }
            }
          >
            {unreadOnly ? 'Showing Unread Only' : 'Show All'}
          </button>

          <button
            onClick={handleMarkAllRead}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-300 hover:text-white flex items-center gap-2 transition-all hover:scale-[1.02] active:scale-95"
            style={{
              background: 'var(--theme-bg-surface)',
              border: '1px solid var(--theme-border)'
            }}
          >
            <CheckCheck className="w-4 h-4 text-emerald-400" />
            <span>Mark All Read</span>
          </button>
        </div>
      </div>

      {/* Notifications Feed */}
      <div 
        className="p-6 rounded-3xl glass-card space-y-3"
        style={{ background: 'var(--theme-bg-surface)' }}
      >
        {notifications.length > 0 ? (
          notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => !n.isRead && handleMarkAsRead(n.id)}
              className={`p-4 rounded-2xl border transition-all flex items-start gap-4 cursor-pointer ${
                n.isRead
                  ? 'text-slate-400 hover:bg-white/[0.02]'
                  : 'text-slate-100 shadow-md'
              }`}
              style={{
                background: n.isRead
                  ? 'var(--theme-bg-main)'
                  : 'color-mix(in srgb, var(--theme-primary) 8%, var(--theme-bg-main))',
                borderColor: n.isRead
                  ? 'var(--theme-border)'
                  : 'color-mix(in srgb, var(--theme-primary) 35%, transparent)'
              }}
            >
              <div 
                className="p-2.5 rounded-xl shrink-0"
                style={{
                  background: 'var(--theme-bg-surface)',
                  border: '1px solid var(--theme-border)'
                }}
              >
                {getIcon(n.type)}
              </div>

              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <h4 className={`text-xs font-bold ${n.isRead ? 'text-slate-300' : 'text-slate-100'}`}>
                    {n.title}
                  </h4>
                  <span className="text-[10px] text-slate-500 whitespace-nowrap">
                    {new Date(n.createdAt).toLocaleString()}
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">{n.message}</p>
              </div>

              {!n.isRead && (
                <span 
                  className="w-2.5 h-2.5 rounded-full shrink-0 mt-1"
                  style={{
                    background: 'var(--theme-primary)',
                    boxShadow: 'var(--theme-glow)'
                  }}
                />
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-12 text-slate-500 space-y-2">
            <Bell className="w-10 h-10 mx-auto text-slate-600" />
            <p className="text-sm font-semibold text-slate-200">No notifications to display</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserNotifications;
