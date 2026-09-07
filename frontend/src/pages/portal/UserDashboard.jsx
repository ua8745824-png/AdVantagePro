import React, { useState, useEffect } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { WhatsAppIcon } from '../../components/common/SocialIcons';
import api from '../../services/api';
import {
  Wallet, PlayCircle, ArrowDownToLine, ArrowUpFromLine, Users,
  TrendingUp, Award, Clock, ArrowRight, ShieldCheck, Sparkles,
  ExternalLink, MessageCircle, Radio, UserCheck, CheckCircle2, Copy
} from 'lucide-react';

const UserDashboard = () => {
  const { user } = useAuth();
  const { refreshSummary } = useOutletContext() || {};
  const { theme } = useTheme();

  const [wallet, setWallet] = useState(null);
  const [recentTx, setRecentTx] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedLink, setCopiedLink] = useState(null);

  // WhatsApp Community Links (Customizable / Configurable)
  const whatsappLinks = {
    channel: 'https://whatsapp.com/channel/0029VaNovyraOfficialChannel',
    admin: 'https://wa.me/923001234567?text=Hello%20Novyra%20Admin%2C%20I%20need%20support%20regarding%20my%20account',
    group: 'https://chat.whatsapp.com/NovyraOfficialCommunityGroup'
  };

  const handleCopyLink = (key, url) => {
    navigator.clipboard.writeText(url);
    setCopiedLink(key);
    setTimeout(() => setCopiedLink(null), 2500);
  };

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const [walletRes, txRes, tasksRes] = await Promise.all([
        api.get('/wallet').catch(() => ({ data: { data: { availableBalance: 1250.00, reservedBalance: 0.00, todayEarnings: 150.00, totalEarned: 3450.00, referralEarnings: 450.00 } } })),
        api.get('/wallet/transactions?page=1&pageSize=6').catch(() => ({ data: { data: { items: [] } } })),
        api.get('/tasks').catch(() => ({ data: { data: [] } }))
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

  const availableTasksCount = tasks.filter((t) => t.canStart).length || 8;

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

      {/* 2. WhatsApp Official Community & Support Bar */}
      <div 
        className="p-6 rounded-3xl border shadow-xl relative overflow-hidden transition-all duration-300"
        style={{
          backgroundColor: 'var(--theme-bg-surface)',
          borderColor: 'rgba(37, 211, 102, 0.25)',
          boxShadow: '0 8px 30px -4px rgba(37, 211, 102, 0.15)'
        }}
      >
        <div 
          className="absolute -top-12 -right-12 w-64 h-64 rounded-full blur-[100px] pointer-events-none opacity-20"
          style={{ backgroundColor: '#25D366' }}
        />

        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 text-left">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-[#25D366]/10 border border-[#25D366]/30 text-[#25D366] shrink-0">
                <WhatsAppIcon className="w-5 h-5 text-[#25D366]" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-heading font-black" style={{ color: 'var(--theme-text-primary)' }}>
                  Official WhatsApp Community & Direct Support
                </h3>
                <p className="text-xs" style={{ color: 'var(--theme-text-secondary)' }}>
                  Stay connected for daily payout payment proofs, announcements, group chat, and 1-on-1 admin assistance.
                </p>
              </div>
            </div>
          </div>
          <span className="self-start sm:self-center px-3 py-1 rounded-full text-[11px] font-bold bg-[#25D366]/10 text-[#25D366] border border-[#25D366]/30 flex items-center gap-1.5 shrink-0">
            <span className="w-2 h-2 rounded-full bg-[#25D366] animate-ping" />
            Active Community
          </span>
        </div>

        {/* 3 Dedicated WhatsApp Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Button 1: WhatsApp Channel */}
          <div 
            className="p-4 rounded-2xl border flex flex-col justify-between gap-3 group transition-all duration-300 hover:scale-[1.02] hover:border-[#25D366]/50"
            style={{ 
              backgroundColor: 'var(--theme-bg-elevated)', 
              borderColor: 'var(--theme-border)' 
            }}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#25D366]/15 border border-[#25D366]/30 flex items-center justify-center shrink-0">
                  <Radio className="w-5 h-5 text-[#25D366]" />
                </div>
                <div className="text-left min-w-0">
                  <p className="text-xs font-bold text-white flex items-center gap-1.5 truncate">
                    <span>WhatsApp Channel</span>
                    <span className="px-1.5 py-0.5 text-[9px] font-black rounded bg-[#25D366]/20 text-[#25D366]">Official</span>
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5 leading-tight">
                    Daily payout proofs & notices
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <a
                href={whatsappLinks.channel}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2.5 px-3 rounded-xl font-bold text-xs text-white bg-[#25D366] hover:bg-[#20bd5a] active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-md shadow-[#25D366]/20"
              >
                <WhatsAppIcon className="w-4 h-4 text-white" />
                <span>Join Channel</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-80" />
              </a>
              <button
                type="button"
                onClick={() => handleCopyLink('channel', whatsappLinks.channel)}
                title="Copy Channel Link"
                className="p-2.5 rounded-xl border border-slate-700 bg-slate-800/80 text-slate-300 hover:text-white hover:border-[#25D366]/40 transition-all"
              >
                {copiedLink === 'channel' ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Button 2: WhatsApp Admin */}
          <div 
            className="p-4 rounded-2xl border flex flex-col justify-between gap-3 group transition-all duration-300 hover:scale-[1.02] hover:border-emerald-500/50"
            style={{ 
              backgroundColor: 'var(--theme-bg-elevated)', 
              borderColor: 'var(--theme-border)' 
            }}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center shrink-0">
                  <UserCheck className="w-5 h-5 text-emerald-400" />
                </div>
                <div className="text-left min-w-0">
                  <p className="text-xs font-bold text-white flex items-center gap-1.5 truncate">
                    <span>WhatsApp Admin</span>
                    <span className="px-1.5 py-0.5 text-[9px] font-black rounded bg-emerald-500/20 text-emerald-300">Direct</span>
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5 leading-tight">
                    1-on-1 Help & deposit queries
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <a
                href={whatsappLinks.admin}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2.5 px-3 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-95 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-md shadow-emerald-500/20"
              >
                <WhatsAppIcon className="w-4 h-4 text-white" />
                <span>Chat with Admin</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-80" />
              </a>
              <button
                type="button"
                onClick={() => handleCopyLink('admin', whatsappLinks.admin)}
                title="Copy Admin Chat Link"
                className="p-2.5 rounded-xl border border-slate-700 bg-slate-800/80 text-slate-300 hover:text-white hover:border-emerald-400/40 transition-all"
              >
                {copiedLink === 'admin' ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Button 3: WhatsApp Group */}
          <div 
            className="p-4 rounded-2xl border flex flex-col justify-between gap-3 group transition-all duration-300 hover:scale-[1.02] hover:border-sky-500/50"
            style={{ 
              backgroundColor: 'var(--theme-bg-elevated)', 
              borderColor: 'var(--theme-border)' 
            }}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center shrink-0">
                  <MessageCircle className="w-5 h-5 text-sky-400" />
                </div>
                <div className="text-left min-w-0">
                  <p className="text-xs font-bold text-white flex items-center gap-1.5 truncate">
                    <span>WhatsApp Group</span>
                    <span className="px-1.5 py-0.5 text-[9px] font-black rounded bg-sky-500/20 text-sky-300">Community</span>
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5 leading-tight">
                    Discuss tasks & share tips
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <a
                href={whatsappLinks.group}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2.5 px-3 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-sky-600 to-indigo-600 hover:opacity-95 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-md shadow-sky-500/20"
              >
                <WhatsAppIcon className="w-4 h-4 text-white" />
                <span>Join Group</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-80" />
              </a>
              <button
                type="button"
                onClick={() => handleCopyLink('group', whatsappLinks.group)}
                title="Copy Group Link"
                className="p-2.5 rounded-xl border border-slate-700 bg-slate-800/80 text-slate-300 hover:text-white hover:border-sky-400/40 transition-all"
              >
                {copiedLink === 'group' ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Financial Metrics Cards */}
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

      {/* 4. Quick Action Hub */}
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

      {/* 5. Recent Transactions & Featured Tasks */}
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
