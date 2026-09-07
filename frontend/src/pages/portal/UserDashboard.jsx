import React, { useState, useEffect } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import api from '../../services/api';
import {
  Wallet, PlayCircle, ArrowDownToLine, ArrowUpFromLine, Users,
  TrendingUp, Award, Clock, ArrowRight, ShieldCheck, Sparkles
} from 'lucide-react';

const UserDashboard = () => {
  const { user } = useAuth();
  const { refreshSummary } = useOutletContext() || {};
  const { theme } = useTheme();

  const [wallet, setWallet] = useState(null);
  const [recentTx, setRecentTx] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const [walletRes, txRes, tasksRes] = await Promise.all([
        api.get('/wallet'),
        api.get('/wallet/transactions?page=1&pageSize=6'),
        api.get('/tasks')
      ]);

      if (walletRes.data?.data) setWallet(walletRes.data.data);
      if (txRes.data?.data?.items) setRecentTx(txRes.data.data.items);
      if (tasksRes.data?.data) setTasks(tasksRes.data.data);
      if (refreshSummary) refreshSummary();
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const availableTasksCount = tasks.filter((t) => t.canStart).length;

  return (
    <div className="space-y-8">
      {/* 1. Welcome Banner */}
      <div 
        className="relative p-6 sm:p-8 rounded-3xl border overflow-hidden shadow-2xl transition-all duration-300"
        style={{
          backgroundColor: 'var(--theme-bg-surface)',
          borderColor: 'var(--theme-border-highlight)',
          boxShadow: 'var(--theme-glow)'
        }}
      >
        <div 
          className="absolute top-0 right-0 w-96 h-96 blur-3xl rounded-full pointer-events-none opacity-20"
          style={{ background: 'var(--theme-gradient-brand)' }}
        />
        
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <div 
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold"
              style={{
                backgroundColor: 'rgba(var(--theme-primary-rgb), 0.12)',
                color: 'var(--theme-primary)'
              }}
            >
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>Personal Rewards Hub</span>
            </div>
            <h1 className="font-heading font-black text-2xl sm:text-3xl" style={{ color: 'var(--theme-text-primary)' }}>
              Welcome back, {user?.fullName || 'User'}!
            </h1>
            <p className="text-xs sm:text-sm max-w-xl" style={{ color: 'var(--theme-text-secondary)' }}>
              You have <span className="font-bold" style={{ color: 'var(--theme-primary)' }}>{availableTasksCount} sponsored tasks</span> ready to watch and earn rewards today.
            </p>
          </div>

          <Link
            to="/portal/tasks"
            className="px-6 py-3.5 rounded-xl text-white text-xs font-bold shadow-lg flex items-center gap-2 hover:scale-105 transition-all"
            style={{
              background: 'var(--theme-gradient-brand)',
              boxShadow: 'var(--theme-glow)'
            }}
          >
            <PlayCircle className="w-4 h-4" />
            <span>Start Watching Now</span>
          </Link>
        </div>
      </div>

      {/* 2. Financial Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Available Balance */}
        <div 
          className="p-6 rounded-2xl border space-y-3 transition-transform hover:scale-[1.02]"
          style={{ backgroundColor: 'var(--theme-bg-surface)', borderColor: 'var(--theme-border)' }}
        >
          <div className="flex items-center justify-between text-xs font-semibold" style={{ color: 'var(--theme-text-secondary)' }}>
            <span>Available Balance</span>
            <Wallet className="w-4 h-4" style={{ color: 'var(--theme-primary)' }} />
          </div>
          <p className="text-2xl font-black font-heading" style={{ color: 'var(--theme-text-primary)' }}>
            {Number(wallet?.availableBalance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })} <span className="text-xs font-normal text-slate-400">PKR</span>
          </p>
          <div className="text-[11px] flex items-center gap-1 font-medium" style={{ color: 'var(--theme-primary)' }}>
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Ready for withdrawal</span>
          </div>
        </div>

        {/* Today's Earnings */}
        <div 
          className="p-6 rounded-2xl border space-y-3 transition-transform hover:scale-[1.02]"
          style={{ backgroundColor: 'var(--theme-bg-surface)', borderColor: 'var(--theme-border)' }}
        >
          <div className="flex items-center justify-between text-xs font-semibold" style={{ color: 'var(--theme-text-secondary)' }}>
            <span>Today's Earnings</span>
            <TrendingUp className="w-4 h-4" style={{ color: 'var(--theme-secondary)' }} />
          </div>
          <p className="text-2xl font-black font-heading" style={{ color: 'var(--theme-secondary)' }}>
            {Number(wallet?.todayEarnings || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })} <span className="text-xs font-normal text-slate-400">PKR</span>
          </p>
          <div className="text-[11px] flex items-center gap-1" style={{ color: 'var(--theme-text-muted)' }}>
            <Clock className="w-3.5 h-3.5" />
            <span>Resets at 00:00 UTC</span>
          </div>
        </div>

        {/* Total Earned */}
        <div 
          className="p-6 rounded-2xl border space-y-3 transition-transform hover:scale-[1.02]"
          style={{ backgroundColor: 'var(--theme-bg-surface)', borderColor: 'var(--theme-border)' }}
        >
          <div className="flex items-center justify-between text-xs font-semibold" style={{ color: 'var(--theme-text-secondary)' }}>
            <span>Total Lifetime Earned</span>
            <Award className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-black font-heading text-amber-300">
            {Number(wallet?.totalEarned || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })} <span className="text-xs font-normal text-slate-400">PKR</span>
          </p>
          <p className="text-[11px]" style={{ color: 'var(--theme-text-muted)' }}>All tasks + referral shares</p>
        </div>

        {/* Referral Earnings */}
        <div 
          className="p-6 rounded-2xl border space-y-3 transition-transform hover:scale-[1.02]"
          style={{ backgroundColor: 'var(--theme-bg-surface)', borderColor: 'var(--theme-border)' }}
        >
          <div className="flex items-center justify-between text-xs font-semibold" style={{ color: 'var(--theme-text-secondary)' }}>
            <span>Referral Commissions</span>
            <Users className="w-4 h-4" style={{ color: 'var(--theme-primary)' }} />
          </div>
          <p className="text-2xl font-black font-heading" style={{ color: 'var(--theme-primary)' }}>
            {Number(wallet?.referralEarnings || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })} <span className="text-xs font-normal text-slate-400">PKR</span>
          </p>
          <p className="text-[11px]" style={{ color: 'var(--theme-text-muted)' }}>10% commission rate</p>
        </div>
      </div>

      {/* 3. Quick Action Hub */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Link
          to="/portal/tasks"
          className="p-4 rounded-2xl border text-center space-y-2 group transition-all hover:scale-105"
          style={{
            backgroundColor: 'var(--theme-bg-surface)',
            borderColor: 'var(--theme-border)'
          }}
        >
          <PlayCircle className="w-6 h-6 mx-auto group-hover:scale-110 transition-transform" style={{ color: 'var(--theme-primary)' }} />
          <p className="text-xs font-bold" style={{ color: 'var(--theme-text-primary)' }}>Watch Tasks</p>
          <p className="text-[10px]" style={{ color: 'var(--theme-text-secondary)' }}>Earn up to 50 PKR / task</p>
        </Link>

        <Link
          to="/portal/deposit"
          className="p-4 rounded-2xl border text-center space-y-2 group transition-all hover:scale-105"
          style={{
            backgroundColor: 'var(--theme-bg-surface)',
            borderColor: 'var(--theme-border)'
          }}
        >
          <ArrowDownToLine className="w-6 h-6 mx-auto group-hover:scale-110 transition-transform" style={{ color: 'var(--theme-secondary)' }} />
          <p className="text-xs font-bold" style={{ color: 'var(--theme-text-primary)' }}>Deposit Funds</p>
          <p className="text-[10px]" style={{ color: 'var(--theme-text-secondary)' }}>Easypaisa, JazzCash, Bank</p>
        </Link>

        <Link
          to="/portal/withdraw"
          className="p-4 rounded-2xl border text-center space-y-2 group transition-all hover:scale-105"
          style={{
            backgroundColor: 'var(--theme-bg-surface)',
            borderColor: 'var(--theme-border)'
          }}
        >
          <ArrowUpFromLine className="w-6 h-6 mx-auto group-hover:scale-110 transition-transform text-amber-400" />
          <p className="text-xs font-bold" style={{ color: 'var(--theme-text-primary)' }}>Withdraw</p>
          <p className="text-[10px]" style={{ color: 'var(--theme-text-secondary)' }}>Min 500 PKR threshold</p>
        </Link>

        <Link
          to="/portal/referrals"
          className="p-4 rounded-2xl border text-center space-y-2 group transition-all hover:scale-105"
          style={{
            backgroundColor: 'var(--theme-bg-surface)',
            borderColor: 'var(--theme-border)'
          }}
        >
          <Users className="w-6 h-6 mx-auto group-hover:scale-110 transition-transform" style={{ color: 'var(--theme-primary)' }} />
          <p className="text-xs font-bold" style={{ color: 'var(--theme-text-primary)' }}>Invite Friends</p>
          <p className="text-[10px]" style={{ color: 'var(--theme-text-secondary)' }}>Get 10% commission</p>
        </Link>
      </div>

      {/* 4. Recent Transactions & Featured Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Ledger History */}
        <div 
          className="lg:col-span-2 p-6 rounded-3xl border space-y-4"
          style={{ backgroundColor: 'var(--theme-bg-surface)', borderColor: 'var(--theme-border)' }}
        >
          <div className="flex items-center justify-between">
            <h3 className="font-heading font-bold text-base" style={{ color: 'var(--theme-text-primary)' }}>Recent Transactions</h3>
            <Link to="/portal/wallet" className="text-xs font-semibold hover:underline" style={{ color: 'var(--theme-primary)' }}>
              View All History
            </Link>
          </div>

          {recentTx.length > 0 ? (
            <div className="divide-y" style={{ borderColor: 'var(--theme-border)' }}>
              {recentTx.map((tx) => {
                const isPositive = tx.amount > 0 && tx.transactionType !== 'WithdrawalReservation' && tx.transactionType !== 'AdminDebit';
                return (
                  <div key={tx.id} className="py-3.5 flex items-center justify-between gap-4">
                    <div className="space-y-0.5 min-w-0">
                      <p className="text-xs font-bold truncate" style={{ color: 'var(--theme-text-primary)' }}>{tx.description}</p>
                      <p className="text-[10px]" style={{ color: 'var(--theme-text-muted)' }}>
                        {new Date(tx.createdAt).toLocaleString()} • {tx.transactionType}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p 
                        className="text-xs font-black font-heading" 
                        style={{ color: isPositive ? 'var(--theme-primary)' : 'var(--theme-text-secondary)' }}
                      >
                        {isPositive ? '+' : '-'}{Number(tx.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })} PKR
                      </p>
                      <p className="text-[10px]" style={{ color: 'var(--theme-text-muted)' }}>
                        Bal: {Number(tx.balanceAfter).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-center py-8" style={{ color: 'var(--theme-text-muted)' }}>No transactions recorded yet.</p>
          )}
        </div>

        {/* Featured Campaign Banner */}
        <div 
          className="p-6 rounded-3xl border space-y-4 flex flex-col justify-between"
          style={{
            backgroundColor: 'var(--theme-bg-surface)',
            borderColor: 'var(--theme-border-highlight)',
            boxShadow: 'var(--theme-glow)'
          }}
        >
          <div className="space-y-3">
            <span 
              className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border"
              style={{
                backgroundColor: 'rgba(var(--theme-primary-rgb), 0.1)',
                borderColor: 'var(--theme-border-highlight)',
                color: 'var(--theme-primary)'
              }}
            >
              Launch Campaign
            </span>
            <h3 className="font-heading font-black text-xl" style={{ color: 'var(--theme-text-primary)' }}>
              Watch Verified Brand Introductions
            </h3>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--theme-text-secondary)' }}>
              Complete your daily video allocations to maximize rewards. New advertiser campaigns are refreshed regularly.
            </p>
          </div>

          <Link
            to="/portal/tasks"
            className="w-full py-3 rounded-xl text-white font-bold text-xs flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
            style={{
              background: 'var(--theme-gradient-brand)',
              boxShadow: 'var(--theme-glow)'
            }}
          >
            <span>Browse All Tasks</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
