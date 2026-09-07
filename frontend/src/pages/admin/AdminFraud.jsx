import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { 
  AlertTriangle, ShieldAlert, CheckCircle2, 
  X, Filter, ChevronLeft, ChevronRight, Eye 
} from 'lucide-react';

const AdminFraud = () => {
  const { success, error: toastError } = useToast();

  const [flags, setFlags] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('All');
  const [riskFilter, setRiskFilter] = useState('All');
  const [loading, setLoading] = useState(true);

  // Review Modal
  const [reviewModalFlag, setReviewModalFlag] = useState(null);
  const [reviewStatus, setReviewStatus] = useState('Resolved');
  const [adminNote, setAdminNote] = useState('');
  const [processing, setProcessing] = useState(false);

  const loadFlags = async () => {
    try {
      setLoading(true);
      const res = await api.get(
        `/admin/fraud/flags?page=${page}&pageSize=12&status=${statusFilter}&riskLevel=${riskFilter}`
      );
      if (res.data?.data) {
        setFlags(res.data.data.items || []);
        setTotalPages(res.data.data.totalPages || 1);
      }
    } catch (err) {
      console.error('Failed to load fraud flags:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFlags();
  }, [page, statusFilter, riskFilter]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewModalFlag) return;

    try {
      setProcessing(true);
      const res = await api.post(
        `/admin/fraud/flags/${reviewModalFlag.id}/review?status=${reviewStatus}`,
        JSON.stringify(adminNote.trim()),
        { headers: { 'Content-Type': 'application/json' } }
      );

      if (res.data?.success) {
        success(`Fraud flag #${reviewModalFlag.id} updated to ${reviewStatus}.`);
        setReviewModalFlag(null);
        setAdminNote('');
        loadFlags();
      } else {
        toastError(res.data?.message || 'Review failed.');
      }
    } catch (err) {
      toastError(err.response?.data?.message || 'Error updating fraud flag.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h1 className="font-heading font-black text-2xl sm:text-3xl text-white">
          Anti-Fraud Alarms & Risk Heuristics
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Automated risk engine flags rapid task duration violations, abnormal velocity, and session anomalies.
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
          <option value="UnderReview">Under Review</option>
          <option value="Resolved">Resolved</option>
          <option value="FalsePositive">False Positive</option>
          <option value="Ignored">Ignored</option>
        </select>

        <select
          value={riskFilter}
          onChange={(e) => { setRiskFilter(e.target.value); setPage(1); }}
          className="px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-semibold text-slate-300 focus:outline-none"
        >
          <option value="All">All Risk Levels</option>
          <option value="Critical">Critical</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>
      </div>

      {/* Flags Table */}
      <div className="p-6 rounded-3xl bg-slate-900/50 border border-slate-800 space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                <th className="pb-3 px-3">Date</th>
                <th className="pb-3 px-3">Flagged User</th>
                <th className="pb-3 px-3">Flag Type</th>
                <th className="pb-3 px-3 text-center">Risk Level</th>
                <th className="pb-3 px-3">Violation Reason</th>
                <th className="pb-3 px-3 text-center">Status</th>
                <th className="pb-3 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {flags.length > 0 ? (
                flags.map((f) => (
                  <tr key={f.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 px-3 text-slate-400 whitespace-nowrap">
                      {new Date(f.createdAt).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-3">
                      <p className="font-bold text-white">@{f.username}</p>
                      <p className="text-[10px] text-slate-500">{f.email}</p>
                    </td>
                    <td className="py-3.5 px-3 font-mono font-bold text-indigo-300">
                      {f.flagType}
                    </td>
                    <td className="py-3.5 px-3 text-center">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        f.riskLevel === 'Critical'
                          ? 'bg-rose-950 text-rose-300 border border-rose-800/80 animate-pulse'
                          : f.riskLevel === 'High'
                          ? 'bg-orange-950 text-orange-300 border border-orange-800/80'
                          : 'bg-amber-950 text-amber-300 border border-amber-800/80'
                      }`}>
                        {f.riskLevel}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-slate-300 max-w-xs">
                      {f.reason}
                    </td>
                    <td className="py-3.5 px-3 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        f.status === 'Open' ? 'bg-rose-950 text-rose-300 border border-rose-800/50' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {f.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      <button
                        onClick={() => { setReviewModalFlag(f); setReviewStatus(f.status); setAdminNote(f.adminNote || ''); }}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-bold"
                      >
                        Review
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-slate-500">
                    No fraud alerts registered. Platform integrity is nominal.
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

      {/* Review Modal */}
      {reviewModalFlag && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h3 className="font-heading font-bold text-base text-white">
                Review Fraud Flag #{reviewModalFlag.id}
              </h3>
              <button onClick={() => setReviewModalFlag(null)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-rose-950/30 border border-rose-500/30 space-y-1 text-xs text-rose-200">
              <p>User: <strong className="text-white">@{reviewModalFlag.username}</strong></p>
              <p>Type: <span className="font-mono">{reviewModalFlag.flagType}</span> [{reviewModalFlag.riskLevel}]</p>
              <p className="pt-1 text-slate-300">{reviewModalFlag.reason}</p>
            </div>

            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Set Resolution Status</label>
                <select
                  value={reviewStatus}
                  onChange={(e) => setReviewStatus(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-semibold text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="UnderReview">Under Review</option>
                  <option value="Resolved">Resolved (Sanction Applied)</option>
                  <option value="FalsePositive">False Positive (Dismissed)</option>
                  <option value="Ignored">Ignored</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Admin Review Note</label>
                <textarea
                  rows="3"
                  placeholder="e.g. Confirmed session duration spoofing..."
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setReviewModalFlag(null)}
                  className="flex-1 py-3 rounded-xl border border-slate-800 bg-slate-950 text-xs font-bold text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={processing}
                  className="flex-1 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs disabled:opacity-50"
                >
                  {processing ? 'Saving...' : 'Update Resolution'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminFraud;
