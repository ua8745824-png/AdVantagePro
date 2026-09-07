import React, { useState } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { CreditCard, AlertTriangle, CheckCircle2, ShieldCheck, ArrowRight } from 'lucide-react';

const AdminAdjustments = () => {
  const { success, error: toastError } = useToast();

  const [formData, setFormData] = useState({
    userId: '',
    adjustmentType: 'Credit',
    amount: '',
    reason: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const numUserId = parseInt(formData.userId, 10);
    const numAmount = parseFloat(formData.amount);

    if (isNaN(numUserId) || numUserId <= 0) {
      toastError('Valid Target User ID is required.');
      return;
    }

    if (isNaN(numAmount) || numAmount <= 0) {
      toastError('Adjustment amount must be strictly positive.');
      return;
    }

    if (!formData.reason.trim() || formData.reason.length < 5) {
      toastError('A comprehensive audit reason is mandatory (min 5 chars).');
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.post('/admin/wallet/adjust', {
        userId: numUserId,
        adjustmentType: formData.adjustmentType,
        amount: numAmount,
        reason: formData.reason.trim()
      });

      if (res.data?.success && res.data?.data) {
        setResult(res.data.data);
        success(`User #${numUserId} balance successfully adjusted (${formData.adjustmentType} ${numAmount} PKR).`);
        setFormData({ userId: '', adjustmentType: 'Credit', amount: '', reason: '' });
      } else {
        toastError(res.data?.message || 'Adjustment failed.');
      }
    } catch (err) {
      toastError(err.response?.data?.message || 'Error processing balance adjustment.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h1 className="font-heading font-black text-2xl sm:text-3xl text-white">
          Manual Wallet Balance Adjustments
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Perform controlled administrative credits or debits. Every adjustment creates an immutable ledger entry and audit log.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Form Card (7 cols) */}
        <div className="lg:col-span-7 p-8 rounded-3xl bg-slate-900/50 border border-slate-800 shadow-xl space-y-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Target User ID</label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 2"
                  value={formData.userId}
                  onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white font-mono focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Adjustment Type</label>
                <select
                  value={formData.adjustmentType}
                  onChange={(e) => setFormData({ ...formData, adjustmentType: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-sm font-bold text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="Credit">Credit (+ Increase Balance)</option>
                  <option value="Debit">Debit (- Decrease Balance)</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Adjustment Amount (PKR)</label>
              <input
                type="number"
                required
                min="1"
                step="any"
                placeholder="e.g. 50.00"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-sm font-heading font-bold text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Audit Trail Reason (Mandatory)
              </label>
              <textarea
                required
                rows="3"
                placeholder="e.g. Promotional bonus credit or manual correction for missed campaign task #102..."
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-sm shadow-xl shadow-amber-500/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submitting ? (
                <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <CreditCard className="w-4 h-4" />
                  <span>Execute Balance Adjustment</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Info & Result (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {result && (
            <div className="p-6 rounded-3xl bg-emerald-950/40 border border-emerald-500/40 space-y-3 animate-fade-in">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                <CheckCircle2 className="w-5 h-5" />
                <span>Adjustment Executed Successfully</span>
              </div>
              <div className="space-y-1.5 text-xs text-slate-300 pt-2 border-t border-emerald-800/40 font-mono">
                <p>Transaction ID: #{result.id}</p>
                <p>Type: {result.transactionType}</p>
                <p>Amount: {result.amount} PKR</p>
                <p>Balance Before: {result.balanceBefore} PKR</p>
                <p className="text-emerald-300 font-bold">Balance After: {result.balanceAfter} PKR</p>
              </div>
            </div>
          )}

          <div className="p-6 rounded-3xl bg-slate-900/50 border border-slate-800 space-y-3 text-xs text-slate-400 leading-relaxed">
            <div className="flex items-center gap-2 text-amber-400 font-bold">
              <ShieldCheck className="w-4 h-4" />
              <span>Immutable Ledger Guarantee</span>
            </div>
            <p>
              Direct balance mutation without audit logs is disabled by the database engine. All manual credits or debits generate double-entry rows in <code className="text-slate-300 font-mono">WalletTransactions</code> and <code className="text-slate-300 font-mono">AuditLogs</code>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAdjustments;
