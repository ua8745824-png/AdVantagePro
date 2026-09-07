import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { 
  ArrowDownToLine, Search, Filter, CheckCircle2, XCircle, 
  Eye, X, ChevronLeft, ChevronRight, FileText, Check 
} from 'lucide-react';

const AdminDeposits = () => {
  const { success, error: toastError } = useToast();

  const [deposits, setDeposits] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Review & Proof Inspection Modals
  const [previewProofUrl, setPreviewProofUrl] = useState(null);
  const [approveModalDeposit, setApproveModalDeposit] = useState(null);
  const [adminNote, setAdminNote] = useState('');
  const [rejectModalDeposit, setRejectModalDeposit] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [processing, setProcessing] = useState(false);

  const loadDeposits = async () => {
    try {
      setLoading(true);
      const res = await api.get(
        `/admin/deposits?page=${page}&pageSize=10&status=${statusFilter}&search=${encodeURIComponent(search)}`
      );
      if (res.data?.data) {
        setDeposits(res.data.data.items || []);
        setTotalPages(res.data.data.totalPages || 1);
      }
    } catch (err) {
      console.error('Failed to load deposits:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDeposits();
  }, [page, statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    loadDeposits();
  };

  const handleApprove = async (e) => {
    e.preventDefault();
    if (!approveModalDeposit) return;

    try {
      setProcessing(true);
      const res = await api.post(`/admin/deposits/${approveModalDeposit.id}/approve`, {
        adminNote: adminNote.trim() || undefined
      });

      if (res.data?.success) {
        success(`Deposit #${approveModalDeposit.id} approved! User wallet credited with ${approveModalDeposit.amount} PKR.`);
        setApproveModalDeposit(null);
        setAdminNote('');
        loadDeposits();
      } else {
        toastError(res.data?.message || 'Approval failed.');
      }
    } catch (err) {
      toastError(err.response?.data?.message || 'Error approving deposit.');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async (e) => {
    e.preventDefault();
    if (!rejectModalDeposit || !rejectionReason.trim()) return;

    try {
      setProcessing(true);
      const res = await api.post(`/admin/deposits/${rejectModalDeposit.id}/reject`, {
        rejectionReason: rejectionReason.trim()
      });

      if (res.data?.success) {
        success(`Deposit #${rejectModalDeposit.id} rejected.`);
        setRejectModalDeposit(null);
        setRejectionReason('');
        loadDeposits();
      } else {
        toastError(res.data?.message || 'Rejection failed.');
      }
    } catch (err) {
      toastError(err.response?.data?.message || 'Error rejecting deposit.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h1 className="font-heading font-black text-2xl sm:text-3xl text-white">
          Deposit Verification Queue
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Review manual transfer screenshots, verify TRX IDs, and approve atomic wallet credits.
        </p>
      </div>

      {/* Search & Filter */}
      <div className="p-6 rounded-3xl bg-slate-900/50 border border-slate-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <form onSubmit={handleSearchSubmit} className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by username, email, transaction reference..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-amber-500 text-black font-bold text-xs hover:bg-amber-400 transition-colors"
          >
            Search
          </button>
        </form>

        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-semibold text-slate-300 focus:outline-none"
        >
          <option value="All">All Statuses</option>
          <option value="Pending">Pending Only</option>
          <option value="Approved">Approved</option>
          <option value="Rejected">Rejected</option>
        </select>
      </div>

      {/* Deposits Table */}
      <div className="p-6 rounded-3xl bg-slate-900/50 border border-slate-800 space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                <th className="pb-3 px-3">Date</th>
                <th className="pb-3 px-3">User & Contact</th>
                <th className="pb-3 px-3">Method</th>
                <th className="pb-3 px-3">TRX Reference</th>
                <th className="pb-3 px-3 text-right">Amount</th>
                <th className="pb-3 px-3 text-center">Proof</th>
                <th className="pb-3 px-3 text-center">Status</th>
                <th className="pb-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {deposits.length > 0 ? (
                deposits.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 px-3 text-slate-400 whitespace-nowrap">
                      {new Date(d.createdAt).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-3">
                      <p className="font-bold text-white">@{d.userName}</p>
                      <p className="text-[10px] text-slate-500">{d.userEmail}</p>
                    </td>
                    <td className="py-3.5 px-3 font-semibold text-slate-300">
                      {d.paymentMethodName}
                    </td>
                    <td className="py-3.5 px-3 font-mono font-bold text-amber-300">
                      {d.transactionReference}
                    </td>
                    <td className="py-3.5 px-3 text-right font-bold text-emerald-400 font-heading">
                      {Number(d.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })} PKR
                    </td>
                    <td className="py-3.5 px-3 text-center">
                      {d.proofFilePath ? (
                        <button
                          onClick={() => setPreviewProofUrl(d.proofFilePath)}
                          className="px-2.5 py-1 rounded-lg bg-indigo-950/60 border border-indigo-500/30 text-indigo-300 hover:text-white flex items-center gap-1 mx-auto text-[10px] font-bold"
                        >
                          <Eye className="w-3 h-3" />
                          <span>View</span>
                        </button>
                      ) : (
                        <span className="text-slate-600">-</span>
                      )}
                    </td>
                    <td className="py-3.5 px-3 text-center">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        d.status === 'Approved'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/50'
                          : d.status === 'Rejected'
                          ? 'bg-rose-950 text-rose-300 border border-rose-800/50'
                          : 'bg-amber-950 text-amber-300 border border-amber-800/50'
                      }`}>
                        {d.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      {d.status === 'Pending' && (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => { setApproveModalDeposit(d); setAdminNote(''); }}
                            className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30 font-bold"
                            title="Approve & Credit Wallet"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => { setRejectModalDeposit(d); setRejectionReason(''); }}
                            className="p-1.5 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/30 hover:bg-rose-500/30 font-bold"
                            title="Reject Deposit"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="text-center py-8 text-slate-500">
                    No deposit requests matching the filter.
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

      {/* Proof Lightbox Modal */}
      {previewProofUrl && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="max-w-2xl w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-heading font-bold text-sm text-white">Payment Receipt Proof</h3>
              <button onClick={() => setPreviewProofUrl(null)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 max-h-[70vh] flex items-center justify-center">
              <img
                src={previewProofUrl}
                alt="Payment Receipt"
                className="max-h-[65vh] w-auto object-contain"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://placehold.co/600x400/0f172a/94a3b8?text=Receipt+Proof+File';
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Approve Modal */}
      {approveModalDeposit && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h3 className="font-heading font-bold text-base text-white">
                Approve Deposit #{approveModalDeposit.id}
              </h3>
              <button onClick={() => setApproveModalDeposit(null)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 space-y-1 text-xs text-emerald-200">
              <p>User: <strong className="text-white">@{approveModalDeposit.userName}</strong></p>
              <p>Amount: <strong className="text-white font-heading text-sm">{approveModalDeposit.amount} PKR</strong></p>
              <p>Ref: <span className="font-mono text-amber-300">{approveModalDeposit.transactionReference}</span></p>
            </div>

            <form onSubmit={handleApprove} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Admin Note (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Verified via Easypaisa portal"
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setApproveModalDeposit(null)}
                  className="flex-1 py-3 rounded-xl border border-slate-800 bg-slate-950 text-xs font-bold text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={processing}
                  className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs disabled:opacity-50"
                >
                  {processing ? 'Crediting Wallet...' : 'Approve & Credit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectModalDeposit && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h3 className="font-heading font-bold text-base text-white">
                Reject Deposit #{rejectModalDeposit.id}
              </h3>
              <button onClick={() => setRejectModalDeposit(null)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleReject} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Mandatory Rejection Reason</label>
                <textarea
                  required
                  rows="3"
                  placeholder="e.g. Transaction ID did not match bank statement..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setRejectModalDeposit(null)}
                  className="flex-1 py-3 rounded-xl border border-slate-800 bg-slate-950 text-xs font-bold text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={processing || !rejectionReason.trim()}
                  className="flex-1 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs disabled:opacity-50"
                >
                  {processing ? 'Rejecting...' : 'Confirm Reject'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDeposits;
