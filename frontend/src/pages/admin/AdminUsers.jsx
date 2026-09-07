import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { 
  Users, Search, Filter, ShieldAlert, ShieldCheck, 
  X, Check, ChevronLeft, ChevronRight, UserX, UserCheck 
} from 'lucide-react';

const AdminUsers = () => {
  const { success, error: toastError } = useToast();

  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [roleFilter, setRoleFilter] = useState('All');
  const [loading, setLoading] = useState(true);

  // Suspend Modal
  const [suspendModalUser, setSuspendModalUser] = useState(null);
  const [suspendReason, setSuspendReason] = useState('');
  const [submittingSuspend, setSubmittingSuspend] = useState(false);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get(
        `/admin/users?page=${page}&pageSize=12&search=${encodeURIComponent(search)}&status=${statusFilter}&role=${roleFilter}`
      );
      if (res.data?.data) {
        setUsers(res.data.data.items || []);
        setTotalPages(res.data.data.totalPages || 1);
      }
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [page, statusFilter, roleFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    loadUsers();
  };

  const handleSuspend = async (e) => {
    e.preventDefault();
    if (!suspendModalUser || !suspendReason.trim()) return;

    try {
      setSubmittingSuspend(true);
      const res = await api.post(`/admin/users/${suspendModalUser.id}/suspend`, JSON.stringify(suspendReason.trim()), {
        headers: { 'Content-Type': 'application/json' }
      });

      if (res.data?.success) {
        success(`User @${suspendModalUser.username} suspended.`);
        setSuspendModalUser(null);
        setSuspendReason('');
        loadUsers();
      } else {
        toastError(res.data?.message || 'Suspension failed.');
      }
    } catch (err) {
      toastError(err.response?.data?.message || 'Error suspending user.');
    } finally {
      setSubmittingSuspend(false);
    }
  };

  const handleActivate = async (userId, username) => {
    try {
      const res = await api.post(`/admin/users/${userId}/activate`);
      if (res.data?.success) {
        success(`User @${username} activated.`);
        loadUsers();
      } else {
        toastError(res.data?.message || 'Activation failed.');
      }
    } catch (err) {
      toastError(err.response?.data?.message || 'Error activating user.');
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Title */}
      <div>
        <h1 className="font-heading font-black text-2xl sm:text-3xl text-slate-100">
          User Directory & <span className="text-gradient-brand">Account Controls</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Search, audit, activate, or suspend user accounts across the NOVYRA platform.
        </p>
      </div>

      {/* Filter & Search Bar */}
      <div 
        className="p-6 rounded-3xl glass-card flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4"
        style={{ background: 'var(--theme-bg-surface)' }}
      >
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by username, email, phone, referral code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none"
              style={{
                background: 'var(--theme-bg-main)',
                border: '1px solid var(--theme-border)'
              }}
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl text-white font-bold text-xs shadow-md transition-all hover:scale-[1.02] active:scale-95"
            style={{
              background: 'var(--theme-gradient-brand)',
              boxShadow: 'var(--theme-glow)'
            }}
          >
            Search
          </button>
        </form>

        {/* Filters */}
        <div className="flex items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-300 focus:outline-none"
            style={{
              background: 'var(--theme-bg-main)',
              border: '1px solid var(--theme-border)'
            }}
          >
            <option value="All" className="bg-slate-900 text-white">All Statuses</option>
            <option value="Active" className="bg-slate-900 text-white">Active</option>
            <option value="Suspended" className="bg-slate-900 text-white">Suspended</option>
            <option value="Inactive" className="bg-slate-900 text-white">Inactive</option>
          </select>

          <select
            value={roleFilter}
            onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
            className="px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-300 focus:outline-none"
            style={{
              background: 'var(--theme-bg-main)',
              border: '1px solid var(--theme-border)'
            }}
          >
            <option value="All" className="bg-slate-900 text-white">All Roles</option>
            <option value="User" className="bg-slate-900 text-white">User</option>
            <option value="Admin" className="bg-slate-900 text-white">Admin</option>
            <option value="SuperAdmin" className="bg-slate-900 text-white">SuperAdmin</option>
            <option value="FinanceAdmin" className="bg-slate-900 text-white">FinanceAdmin</option>
            <option value="SupportAgent" className="bg-slate-900 text-white">SupportAgent</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div 
        className="p-6 rounded-3xl glass-card space-y-4"
        style={{ background: 'var(--theme-bg-surface)' }}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800/80 text-slate-400 font-bold uppercase tracking-wider">
                <th className="pb-3 px-3">User & Contact</th>
                <th className="pb-3 px-3">Referral Code</th>
                <th className="pb-3 px-3">Roles</th>
                <th className="pb-3 px-3 text-center">Status</th>
                <th className="pb-3 px-3">Registered At</th>
                <th className="pb-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {users.length > 0 ? (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 px-3">
                      <p className="font-bold text-slate-100">{u.fullName}</p>
                      <p className="text-[10px] text-slate-400 font-mono">@{u.username} • {u.email}</p>
                      <p className="text-[10px] text-slate-500 font-mono">{u.phoneNumber}</p>
                    </td>
                    <td className="py-3.5 px-3 font-mono font-bold text-amber-300">
                      {u.referralCode}
                    </td>
                    <td className="py-3.5 px-3">
                      <div className="flex flex-wrap gap-1">
                        {u.roles?.map((r) => (
                          <span 
                            key={r} 
                            className="px-2 py-0.5 rounded-md text-[10px] font-bold text-slate-300"
                            style={{
                              background: 'var(--theme-bg-main)',
                              border: '1px solid var(--theme-border)'
                            }}
                          >
                            {r}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3.5 px-3 text-center">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        u.isSuspended
                          ? 'bg-rose-950 text-rose-300 border border-rose-800/50'
                          : u.isActive
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/50'
                          : 'bg-slate-800 text-slate-400'
                      }`}>
                        {u.isSuspended ? 'Suspended' : (u.isActive ? 'Active' : 'Inactive')}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-slate-400">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      {u.isSuspended ? (
                        <button
                          onClick={() => handleActivate(u.id, u.username)}
                          className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold hover:bg-emerald-500/30 transition-all flex items-center gap-1.5 ml-auto hover:scale-105 active:scale-95"
                        >
                          <UserCheck className="w-3.5 h-3.5" />
                          <span>Activate</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => { setSuspendModalUser(u); setSuspendReason(''); }}
                          className="px-3 py-1.5 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[11px] font-bold hover:bg-rose-500/30 transition-all flex items-center gap-1.5 ml-auto hover:scale-105 active:scale-95"
                        >
                          <UserX className="w-3.5 h-3.5" />
                          <span>Suspend</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-slate-500">
                    No users matching the query.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
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

      {/* Suspend Modal */}
      {suspendModalUser && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div 
            className="w-full max-w-md glass-card rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 animate-scale-up"
            style={{
              background: 'var(--theme-bg-surface)',
              borderColor: 'var(--theme-border)'
            }}
          >
            <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
              <h3 className="font-heading font-bold text-base text-slate-100">
                Suspend @{suspendModalUser.username}
              </h3>
              <button onClick={() => setSuspendModalUser(null)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSuspend} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Mandatory Suspension Reason</label>
                <textarea
                  required
                  rows="3"
                  placeholder="e.g. Rapid automation bot script violation..."
                  value={suspendReason}
                  onChange={(e) => setSuspendReason(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl text-xs text-white focus:outline-none"
                  style={{
                    background: 'var(--theme-bg-main)',
                    border: '1px solid var(--theme-border)'
                  }}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSuspendModalUser(null)}
                  className="flex-1 py-3 rounded-xl text-xs font-bold text-slate-300 transition-colors"
                  style={{
                    background: 'var(--theme-bg-main)',
                    border: '1px solid var(--theme-border)'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingSuspend || !suspendReason.trim()}
                  className="flex-1 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs disabled:opacity-50 transition-all hover:scale-[1.02] active:scale-95"
                >
                  {submittingSuspend ? 'Suspending...' : 'Confirm Suspend'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
