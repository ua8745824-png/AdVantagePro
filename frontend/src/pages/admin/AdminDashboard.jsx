import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import {
  Users, ArrowDownToLine, ArrowUpFromLine, Award, 
  AlertTriangle, LifeBuoy, Megaphone, CheckSquare, Shield, 
  TrendingUp, ArrowRight, DollarSign, Wallet
} from 'lucide-react';

const AdminDashboard = () => {
  const [kpis, setKpis] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadKpis = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/dashboard/kpis');
      if (res.data?.data) {
        setKpis(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load KPIs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadKpis();
  }, []);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-black text-2xl sm:text-3xl text-slate-100">
            Operations & <span className="text-gradient-brand">Liquidity Dashboard</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time platform financial balances, pending approval queues, and anti-fraud alerts.
          </p>
        </div>

        <button
          onClick={loadKpis}
          className="px-4 py-2 rounded-xl text-xs font-bold text-slate-300 hover:text-white transition-all hover:scale-[1.02] active:scale-95"
          style={{
            background: 'var(--theme-bg-surface)',
            border: '1px solid var(--theme-border)'
          }}
        >
          Refresh Data
        </button>
      </div>

      {/* Main KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Users */}
        <div 
          className="p-6 rounded-3xl glass-card space-y-3 transition-all"
          style={{ background: 'var(--theme-bg-surface)' }}
        >
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
            <span>Total Registered Users</span>
            <Users className="w-5 h-5" style={{ color: 'var(--theme-primary)' }} />
          </div>
          <p className="text-3xl font-black font-heading text-slate-100">{kpis?.totalUsers || 0}</p>
          <p className="text-[11px] text-emerald-400 font-medium">
            {kpis?.activeUsers || 0} active & verified accounts
          </p>
        </div>

        {/* Pending Deposits */}
        <div 
          className="p-6 rounded-3xl glass-card space-y-3 transition-all"
          style={{ background: 'var(--theme-bg-surface)' }}
        >
          <div className="flex items-center justify-between text-xs font-semibold text-teal-400">
            <span>Pending Deposits</span>
            <ArrowDownToLine className="w-5 h-5 text-teal-400" />
          </div>
          <p className="text-3xl font-black font-heading text-teal-300">
            {kpis?.pendingDeposits || 0}
          </p>
          <p className="text-[11px] text-slate-400">
            Amount: {Number(kpis?.pendingDepositsAmount || 0).toLocaleString()} PKR
          </p>
        </div>

        {/* Pending Withdrawals */}
        <div 
          className="p-6 rounded-3xl glass-card space-y-3 transition-all"
          style={{ background: 'var(--theme-bg-surface)' }}
        >
          <div className="flex items-center justify-between text-xs font-semibold text-amber-400">
            <span>Pending Withdrawals</span>
            <ArrowUpFromLine className="w-5 h-5 text-amber-400" />
          </div>
          <p className="text-3xl font-black font-heading text-amber-300">
            {kpis?.pendingWithdrawals || 0}
          </p>
          <p className="text-[11px] text-slate-400">
            Reserved: {Number(kpis?.pendingWithdrawalsAmount || 0).toLocaleString()} PKR
          </p>
        </div>

        {/* Anti-Fraud Alerts */}
        <div 
          className="p-6 rounded-3xl glass-card space-y-3 transition-all"
          style={{ background: 'var(--theme-bg-surface)' }}
        >
          <div className="flex items-center justify-between text-xs font-semibold text-rose-400">
            <span>Open Fraud Flags</span>
            <AlertTriangle className="w-5 h-5 text-rose-400" />
          </div>
          <p className="text-3xl font-black font-heading text-rose-300">
            {kpis?.openFraudFlags || 0}
          </p>
          <p className="text-[11px] text-slate-400">Velocity & duration violations</p>
        </div>
      </div>

      {/* Financial Distribution Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div 
          className="p-6 rounded-3xl glass-card space-y-2 transition-all border border-emerald-500/30"
          style={{ background: 'color-mix(in srgb, #10b981 8%, var(--theme-bg-surface))' }}
        >
          <p className="text-xs text-emerald-400 font-semibold">Total Approved Deposits</p>
          <p className="text-2xl font-black font-heading text-slate-100">
            {Number(kpis?.totalDepositsApproved || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })} PKR
          </p>
        </div>

        <div 
          className="p-6 rounded-3xl glass-card space-y-2 transition-all"
          style={{
            background: 'color-mix(in srgb, var(--theme-primary) 10%, var(--theme-bg-surface))',
            borderColor: 'color-mix(in srgb, var(--theme-primary) 35%, transparent)'
          }}
        >
          <p className="text-xs font-semibold" style={{ color: 'var(--theme-primary)' }}>Total Paid Withdrawals</p>
          <p className="text-2xl font-black font-heading text-slate-100">
            {Number(kpis?.totalWithdrawalsPaid || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })} PKR
          </p>
        </div>

        <div 
          className="p-6 rounded-3xl glass-card space-y-2 transition-all"
          style={{
            background: 'color-mix(in srgb, var(--theme-secondary) 10%, var(--theme-bg-surface))',
            borderColor: 'color-mix(in srgb, var(--theme-secondary) 35%, transparent)'
          }}
        >
          <p className="text-xs font-semibold" style={{ color: 'var(--theme-secondary)' }}>Task Rewards Distributed</p>
          <p className="text-2xl font-black font-heading text-slate-100">
            {Number(kpis?.totalTaskRewardsDistributed || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })} PKR
          </p>
        </div>

        <div 
          className="p-6 rounded-3xl glass-card space-y-2 transition-all border border-amber-500/30"
          style={{ background: 'color-mix(in srgb, #f59e0b 8%, var(--theme-bg-surface))' }}
        >
          <p className="text-xs text-amber-400 font-semibold">Referral Commissions Paid</p>
          <p className="text-2xl font-black font-heading text-slate-100">
            {Number(kpis?.totalReferralCommissionsDistributed || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })} PKR
          </p>
        </div>
      </div>

      {/* Quick Action Queue Shortcuts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          to="/admin/deposits"
          className="p-6 rounded-3xl glass-card hover:border-teal-500/50 transition-all flex items-center justify-between group hover:shadow-xl"
          style={{ background: 'var(--theme-bg-surface)' }}
        >
          <div className="space-y-1">
            <h4 className="font-heading font-bold text-base text-slate-100">Deposit Approvals</h4>
            <p className="text-xs text-slate-400">Review manual proof receipts</p>
          </div>
          <div className="flex items-center gap-2 text-teal-400 font-bold text-xs">
            <span>{kpis?.pendingDeposits || 0} Pending</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        <Link
          to="/admin/withdrawals"
          className="p-6 rounded-3xl glass-card hover:border-amber-500/50 transition-all flex items-center justify-between group hover:shadow-xl"
          style={{ background: 'var(--theme-bg-surface)' }}
        >
          <div className="space-y-1">
            <h4 className="font-heading font-bold text-base text-slate-100">Withdrawals Queue</h4>
            <p className="text-xs text-slate-400">Dispatch pending PKR payouts</p>
          </div>
          <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
            <span>{kpis?.pendingWithdrawals || 0} Pending</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        <Link
          to="/admin/fraud"
          className="p-6 rounded-3xl glass-card hover:border-rose-500/50 transition-all flex items-center justify-between group hover:shadow-xl"
          style={{ background: 'var(--theme-bg-surface)' }}
        >
          <div className="space-y-1">
            <h4 className="font-heading font-bold text-base text-slate-100">Anti-Fraud Engine</h4>
            <p className="text-xs text-slate-400">Review velocity violations</p>
          </div>
          <div className="flex items-center gap-2 text-rose-400 font-bold text-xs">
            <span>{kpis?.openFraudFlags || 0} Flags</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>
      </div>
    </div>
  );
};

export default AdminDashboard;
