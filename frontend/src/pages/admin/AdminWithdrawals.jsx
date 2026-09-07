import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { 
  ArrowUpFromLine, Search, Filter, CheckCircle2, 
  XCircle, Clock, Check, X, Send, ChevronLeft, ChevronRight 
} from 'lucide-react';

const AdminWithdrawals = () => {
  const { success, error: toastError } = useToast();

  const [withdrawals, setWithdrawals] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Modals State
  const [payModalWithdrawal, setPayModalWithdrawal] = useState(null);
  const [txReference, setTxReference] = useState('');
  const [rejectModalWithdrawal, setRejectModalWithdrawal] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [processing, setProcessing] = useState(false);

  const loadWithdrawals = async () => {
    try {
      setLoading(true);
      const res = await api.get(
        `/admin/withdrawals?page=${page}&pageSize=10&status=${statusFilter}&search=${encodeURIComponent(search)}`
      );
      if (res.data?.data) {
        setWithdrawals(res.data.data.items || []);
        setTotalPages(res.data.data.totalPages || 1);
      }
    } catch (err) {
      console.error('Failed to load withdrawals:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWithdrawals();
  }, [page, statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    loadWithdrawals();
  };

  const handleApprove = async (id) => {
    try {
      const res = await api.post(`/admin/withdrawals/${id}/approve`);
      if (res.data?.success) {
        success(`Withdrawal #${id} approved for processing.`);
        loadWithdrawals();
      } else {
        toastError(res.data?.message || 'Approve failed.');
      }
    } catch (err) {
      toastError(err.response?.data?.message || 'Error approving withdrawal.');
    }
  };

  const handleMarkProcessing = async (id) => {
    try {
      const res = await api.post(`/admin/withdrawals/${id}/process`);
      if (res.data?.success) {
        success(`Withdrawal #${id} marked as processing.`);
        loadWithdrawals();
      } else {
        toastError(res.data?.message || 'Update failed.');
      }
    } catch (err) {
      toastError(err.response?.data?.message || 'Error updating status.');
    }
  };

  const handleMarkPaid = async (e) => {
    e.preventDefault();
    if (!payModalWithdrawal || !txReference.trim()) return;

    try {
      setProcessing(true);
      const res = await api.post(`/admin/withdrawals/${payModalWithdrawal.id}/pay`, {
        transactionReference: txReference.trim()
      });

      if (res.data?.success) {
        success(`Withdrawal #${payModalWithdrawal.id} marked as Paid! Reserved funds finalized.`);
        setPayModalWithdrawal(null);
        setTxReference('');
        loadWithdrawals();
      } else {
        toastError(res.data?.message || 'Payment mark failed.');
      }
    } catch (err) {
      toastError(err.response?.data?.message || 'Error marking paid.');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async (e) => {
    e.preventDefault();
    if (!rejectModalWithdrawal || !rejectionReason.trim()) return;

    try {
      setProcessing(true);
      const res = await api.post(`/admin/withdrawals/${rejectModalWithdrawal.id}/reject`, {
        rejectionReason: rejectionReason.trim()
      });

      if (res.data?.success) {
        success(`Withdrawal #${rejectModalWithdrawal.id} rejected. Reserved funds refunded back to user balance.`);
        setRejectModalWithdrawal(null);
        setRejectionReason('');
        loadWithdrawals();
      } else {
        toastError(res.data?.message || 'Rejection failed.');
      }
    } catch (err) {
      toastError(err.response?.data?.message || 'Error rejecting withdrawal.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h1 className="font-heading font-black text-2xl sm:text-3xl text-white">
          Withdrawal Payouts Processing
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Review payout requests, dispatch transfers via Easypaisa/JazzCash/1Link, and record TXIDs.
        </p>
      </div>

      {/* Filter & Search */}
      <div className="p-6 rounded-3xl bg-slate-900/50 border border-slate-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <form onSubmit={handleSearchSubmit} className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by username, account number, or TXID..."
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
          <option value="Pending">Pending</option>
          <option value="Processing">Processing</option>
          <option value="Paid">Paid</option>
          <option value="Rejected">Rejected</option>
        </select>
      </div>

      {/* Withdrawals Table */}
      <div className="p-6 rounded-3xl bg-slate-900/50 border border-slate-800 space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                <th className="pb-3 px-3">Date</th>
                <th className="pb-3 px-3">User</th>
                <th className="pb-3 px-3">Gateway</th>
                <th className="pb-3 px-3">Payout Details</th>
                <th className="pb-3 px-3 text-right">Requested</th>
                <th className="pb-3 px-3 text-right">Net Payout</th>
                <th className="pb-3 px-3 text-center">Status</th>
                <th className="pb-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {withdrawals.length > 0 ? (
                withdrawals.map((w) => (
                  <tr key={w.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 px-3 text-slate-400 whitespace-nowrap">
                      {new Date(w.createdAt).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-3">
                      <p className="font-bold text-white">@{w.userName}</p>
                      <p className="text-[10px] text-slate-500">{w.userEmail}</p>
                    </td>
                    <td className="py-3.5 px-3 font-semibold text-slate-300">
                      {w.paymentMethodName}
                    </td>
                    <td className="py-3.5 px-3">
                      <p className="font-bold text-white">{w.payoutAccountTitle}</p>
                      <p className="text-[10px] font-mono text-amber-300">{w.payoutAccountNumber}</p>
                      {w.payoutBankName && (
                        <p className="text-[10px] text-slate-500">{w.payoutBankName}</p>
                      )}
                    </td>
                    <td className="py-3.5 px-3 text-right text-slate-400">
                      {Number(w.requestedAmount).toFixed(2)} PKR
                    </td>
                    <td className="py-3.5 px-3 text-right font-bold text-emerald-400 font-heading">
                      {Number(w.netAmount).toFixed(2)} PKR
                    </td>
                    <td className="py-3.5 px-3 text-center">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        w.status === 'Paid'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/50'
                          : w.status === 'Rejected'
                          ? 'bg-rose-950 text-rose-300 border border-rose-800/50'
                          : w.status === 'Processing'
                          ? 'bg-indigo-950 text-indigo-300 border border-indigo-800/50'
                          : 'bg-amber-950 text-amber-300 border border-amber-800/50'
                      }`}>
                        {w.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      {(w.status === 'Pending' || w.status === 'Approved' || w.status === 'Processing') && (
                        <div className="flex items-center justify-end gap-1.5">
                          {w.status === 'Pending' && (
                            <button
                              onClick={() => handleMarkProcessing(w.id)}
                              className="px-2.5 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-bold hover:bg-indigo-500/30"
                            >
                              Process
                            </button>
                          )}
                          <button
                            onClick={() => { setPayModalWithdrawal(w); setTxReference(''); }}
                            className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold hover:bg-emerald-500/30"
                          >
                            Mark Paid
                          </button>
                          <button
                            onClick={() => { setRejectModalWithdrawal(w); setRejectionReason(''); }}
                            className="p-1 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/30 hover:bg-rose-500/30"
                            title="Reject & Refund"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="text-center py-8 text-slate-500">
                    No withdrawal requests found.
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

      {/* Mark Paid Modal */}
      {payModalWithdrawal && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h3 className="font-heading font-bold text-base text-white">
                Finalize Payout #{payModalWithdrawal.id}
              </h3>
              <button onClick={() => setPayModalWithdrawal(null)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 space-y-1 text-xs text-emerald-200">
              <p>User: <strong className="text-white">@{payModalWithdrawal.userName}</strong></p>
              <p>Net Payout Amount: <strong className="text-white font-heading text-sm">{payModalWithdrawal.netAmount} PKR</strong></p>
              <p>Account: <span className="font-mono text-amber-300">{payModalWithdrawal.payoutAccountNumber} ({payModalWithdrawal.payoutAccountTitle})</span></p>
            </div>

            <form onSubmit={handleMarkPaid} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Mandatory Bank / TRX Reference ID</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 293847192837 or Blockchain Hash"
                  value={txReference}
                  onChange={(e) => setTxReference(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setPayModalWithdrawal(null)}
                  className="flex-1 py-3 rounded-xl border border-slate-800 bg-slate-950 text-xs font-bold text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={processing || !txReference.trim()}
                  className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs disabled:opacity-50"
                >
                  {processing ? 'Finalizing...' : 'Confirm Paid'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectModalWithdrawal && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h3 className="font-heading font-bold text-base text-white">
                Reject & Refund Withdrawal #{rejectModalWithdrawal.id}
              </h3>
              <button onClick={() => setRejectModalWithdrawal(null)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Rejecting will automatically unlock and refund <strong className="text-emerald-400">{rejectModalWithdrawal.requestedAmount} PKR</strong> back into @{rejectModalWithdrawal.userName}'s available balance.
            </p>

            <form onSubmit={handleReject} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Mandatory Rejection Reason</label>
                <textarea
                  required
                  rows="3"
                  placeholder="e.g. Invalid account title / IBAN mismatch..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setRejectModalWithdrawal(null)}
                  className="flex-1 py-3 rounded-xl border border-slate-800 bg-slate-950 text-xs font-bold text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={processing || !rejectionReason.trim()}
                  className="flex-1 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs disabled:opacity-50"
                >
                  {processing ? 'Processing Refund...' : 'Confirm Reject & Refund'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminWithdrawals;
