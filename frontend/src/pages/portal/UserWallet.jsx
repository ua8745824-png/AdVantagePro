import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useTheme } from '../../context/ThemeContext';
import { 
  Wallet, TrendingUp, Award, ArrowDownToLine, ArrowUpFromLine, 
  Users, Filter, Calendar, ShieldCheck, ChevronLeft, ChevronRight 
} from 'lucide-react';

const UserWallet = () => {
  const { theme } = useTheme();
  const [summary, setSummary] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filterType, setFilterType] = useState('All');
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const [walletRes, txRes] = await Promise.all([
        api.get('/wallet'),
        api.get(`/wallet/transactions?page=${page}&pageSize=12&type=${filterType}`)
      ]);

      if (walletRes.data?.data) setSummary(walletRes.data.data);
      if (txRes.data?.data) {
        setTransactions(txRes.data.data.items || []);
        setTotalPages(txRes.data.data.totalPages || 1);
      }
    } catch (err) {
      console.error('Failed to load wallet data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [page, filterType]);

  const txTypes = [
    'All', 'TaskReward', 'Deposit', 'WithdrawalReservation', 
    'WithdrawalPaid', 'WithdrawalRefund', 'ReferralCommission', 'AdminCredit', 'AdminDebit'
  ];

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h1 className="font-heading font-black text-2xl sm:text-3xl" style={{ color: 'var(--theme-text-primary)' }}>
          Wallet & Financial Ledger
        </h1>
        <p className="text-xs sm:text-sm mt-1" style={{ color: 'var(--theme-text-secondary)' }}>
          Review your real-time balance breakdown and cryptographic audit trail of all transactions.
        </p>
      </div>

      {/* Balance Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {/* Available Balance */}
        <div 
          className="p-6 rounded-3xl border space-y-2 shadow-xl transition-transform hover:scale-[1.02]"
          style={{
            backgroundColor: 'var(--theme-bg-surface)',
            borderColor: 'var(--theme-border-highlight)',
            boxShadow: 'var(--theme-glow)'
          }}
        >
          <div className="flex items-center justify-between text-xs font-semibold" style={{ color: 'var(--theme-primary)' }}>
            <span>Available Balance</span>
            <Wallet className="w-5 h-5" style={{ color: 'var(--theme-primary)' }} />
          </div>
          <p className="text-3xl font-black font-heading" style={{ color: 'var(--theme-text-primary)' }}>
            {Number(summary?.availableBalance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })} <span className="text-sm font-normal text-slate-400">PKR</span>
          </p>
          <p className="text-[11px]" style={{ color: 'var(--theme-text-secondary)' }}>Immediately eligible for withdrawal</p>
        </div>

        {/* Reserved Balance */}
        <div 
          className="p-6 rounded-3xl border space-y-2 transition-transform hover:scale-[1.02]"
          style={{ backgroundColor: 'var(--theme-bg-surface)', borderColor: 'var(--theme-border)' }}
        >
          <div className="flex items-center justify-between text-xs font-semibold text-amber-400">
            <span>Reserved Balance</span>
            <ArrowUpFromLine className="w-5 h-5 text-amber-400" />
          </div>
          <p className="text-3xl font-black font-heading text-amber-300">
            {Number(summary?.reservedBalance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })} <span className="text-sm font-normal text-slate-400">PKR</span>
          </p>
          <p className="text-[11px]" style={{ color: 'var(--theme-text-secondary)' }}>Held during pending withdrawal processing</p>
        </div>

        {/* Total Withdrawn */}
        <div 
          className="p-6 rounded-3xl border space-y-2 transition-transform hover:scale-[1.02]"
          style={{ backgroundColor: 'var(--theme-bg-surface)', borderColor: 'var(--theme-border)' }}
        >
          <div className="flex items-center justify-between text-xs font-semibold" style={{ color: 'var(--theme-secondary)' }}>
            <span>Total Withdrawn</span>
            <Award className="w-5 h-5" style={{ color: 'var(--theme-secondary)' }} />
          </div>
          <p className="text-3xl font-black font-heading" style={{ color: 'var(--theme-secondary)' }}>
            {Number(summary?.totalWithdrawn || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })} <span className="text-sm font-normal text-slate-400">PKR</span>
          </p>
          <p className="text-[11px]" style={{ color: 'var(--theme-text-secondary)' }}>Dispatched payouts to your accounts</p>
        </div>
      </div>

      {/* Ledger Table Section */}
      <div 
        className="p-6 rounded-3xl border space-y-6"
        style={{ backgroundColor: 'var(--theme-bg-surface)', borderColor: 'var(--theme-border)' }}
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h3 className="font-heading font-bold text-lg" style={{ color: 'var(--theme-text-primary)' }}>Immutable Ledger History</h3>

          {/* Type Filter Select */}
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5" style={{ color: 'var(--theme-primary)' }} />
            <select
              value={filterType}
              onChange={(e) => { setFilterType(e.target.value); setPage(1); }}
              className="px-3.5 py-1.5 rounded-xl border text-xs font-semibold focus:outline-none cursor-pointer"
              style={{
                backgroundColor: 'var(--theme-bg-elevated)',
                borderColor: 'var(--theme-border)',
                color: 'var(--theme-text-primary)'
              }}
            >
              {txTypes.map((t) => (
                <option key={t} value={t} style={{ backgroundColor: 'var(--theme-bg-surface)', color: 'var(--theme-text-primary)' }}>
                  {t === 'All' ? 'All Ledger Types' : t}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Ledger Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b text-[11px] font-bold uppercase tracking-wider" style={{ borderColor: 'var(--theme-border)', color: 'var(--theme-text-muted)' }}>
                <th className="pb-3 px-3">Date & Time</th>
                <th className="pb-3 px-3">Category</th>
                <th className="pb-3 px-3">Description</th>
                <th className="pb-3 px-3 text-right">Amount</th>
                <th className="pb-3 px-3 text-right">Balance After</th>
              </tr>
            </thead>
            <tbody className="divide-y text-xs" style={{ borderColor: 'var(--theme-border)' }}>
              {transactions.length > 0 ? (
                transactions.map((tx) => {
                  const isPositive = tx.amount > 0 && tx.transactionType !== 'WithdrawalReservation' && tx.transactionType !== 'AdminDebit';
                  return (
                    <tr key={tx.id} className="transition-colors hover:bg-white/5">
                      <td className="py-3 px-3" style={{ color: 'var(--theme-text-secondary)' }}>
                        {new Date(tx.createdAt).toLocaleString()}
                      </td>
                      <td className="py-3 px-3">
                        <span 
                          className="px-2.5 py-0.5 rounded-md text-[10px] font-bold border"
                          style={{
                            backgroundColor: 'rgba(var(--theme-primary-rgb), 0.1)',
                            borderColor: 'var(--theme-border-highlight)',
                            color: 'var(--theme-primary)'
                          }}
                        >
                          {tx.transactionType}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-medium max-w-xs truncate" style={{ color: 'var(--theme-text-primary)' }}>
                        {tx.description}
                      </td>
                      <td className="py-3 px-3 text-right font-black font-heading">
                        <span style={{ color: isPositive ? 'var(--theme-primary)' : 'var(--theme-text-secondary)' }}>
                          {isPositive ? '+' : '-'}{Number(tx.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })} PKR
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right font-mono" style={{ color: 'var(--theme-text-muted)' }}>
                        {Number(tx.balanceAfter).toLocaleString(undefined, { minimumFractionDigits: 2 })} PKR
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="5" className="py-8 text-center" style={{ color: 'var(--theme-text-muted)' }}>
                    No ledger records match the selected filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="pt-4 border-t flex items-center justify-between text-xs" style={{ borderColor: 'var(--theme-border)' }}>
            <span style={{ color: 'var(--theme-text-muted)' }}>Page {page} of {totalPages}</span>
            <div className="flex gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 rounded-lg border flex items-center gap-1 disabled:opacity-40 transition-all"
                style={{
                  borderColor: 'var(--theme-border)',
                  backgroundColor: 'var(--theme-bg-elevated)',
                  color: 'var(--theme-text-secondary)'
                }}
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Prev</span>
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="px-3 py-1.5 rounded-lg border flex items-center gap-1 disabled:opacity-40 transition-all"
                style={{
                  borderColor: 'var(--theme-border)',
                  backgroundColor: 'var(--theme-bg-elevated)',
                  color: 'var(--theme-text-secondary)'
                }}
              >
                <span>Next</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserWallet;
