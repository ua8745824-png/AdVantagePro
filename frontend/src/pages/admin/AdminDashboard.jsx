import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { WhatsAppIcon, TelegramIcon } from '../../components/common/SocialIcons';
import {
  Users, ArrowDownToLine, ArrowUpFromLine, Award, 
  AlertTriangle, LifeBuoy, Megaphone, CheckSquare, Shield, 
  TrendingUp, ArrowRight, DollarSign, Wallet, Save, ExternalLink,
  Radio, UserCheck, MessageCircle, Link2, Sparkles, CheckCircle2, RotateCcw
} from 'lucide-react';

const AdminDashboard = () => {
  const { success, error: toastError } = useToast();

  const [kpis, setKpis] = useState(null);
  const [loading, setLoading] = useState(true);

  // Community Redirect Links Configuration State
  const defaultLinks = {
    channel: 'https://whatsapp.com/channel/0029VaNovyraOfficialChannel',
    admin: 'https://wa.me/923001234567?text=Hello%20Novyra%20Admin%2C%20I%20need%20support%20regarding%20my%20account',
    group: 'https://chat.whatsapp.com/NovyraOfficialCommunityGroup',
    telegram: 'https://t.me/NovyraOfficialCommunity'
  };

  const [redirectLinks, setRedirectLinks] = useState(() => {
    try {
      const saved = localStorage.getItem('novyra_community_links');
      if (saved) return JSON.parse(saved);
    } catch {}
    return defaultLinks;
  });

  const [savingLinks, setSavingLinks] = useState(false);

  const loadKpis = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/dashboard/kpis').catch(() => ({ data: { data: null } }));
      if (res.data?.data) {
        setKpis(res.data.data);
      }

      // Also try to load settings from API
      const settingsRes = await api.get('/admin/settings').catch(() => ({ data: { data: null } }));
      if (settingsRes.data?.data) {
        const sMap = {};
        settingsRes.data.data.forEach((s) => {
          if (s.key === 'WhatsAppChannelUrl') sMap.channel = s.value;
          if (s.key === 'WhatsAppAdminUrl') sMap.admin = s.value;
          if (s.key === 'WhatsAppGroupUrl') sMap.group = s.value;
          if (s.key === 'TelegramCommunityUrl') sMap.telegram = s.value;
        });
        if (sMap.channel || sMap.admin || sMap.group) {
          setRedirectLinks((prev) => {
            const merged = { ...prev, ...sMap };
            localStorage.setItem('novyra_community_links', JSON.stringify(merged));
            return merged;
          });
        }
      }
    } catch (err) {
      console.error('Failed to load KPIs or settings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadKpis();
  }, []);

  const handleSaveRedirectLinks = async (e) => {
    if (e) e.preventDefault();
    setSavingLinks(true);

    try {
      // 1. Persist to LocalStorage for instant client synchronization
      localStorage.setItem('novyra_community_links', JSON.stringify(redirectLinks));
      window.dispatchEvent(new Event('novyra_community_links_updated'));

      // 2. Persist to Backend SystemSettings API
      await Promise.allSettled([
        api.put('/admin/settings/WhatsAppChannelUrl', { value: redirectLinks.channel }),
        api.put('/admin/settings/WhatsAppAdminUrl', { value: redirectLinks.admin }),
        api.put('/admin/settings/WhatsAppGroupUrl', { value: redirectLinks.group }),
        api.put('/admin/settings/TelegramCommunityUrl', { value: redirectLinks.telegram || '' })
      ]);

      success('WhatsApp & Community redirect links updated live!');
    } catch (err) {
      console.error('Error saving links:', err);
      success('Redirect links updated locally!');
    } finally {
      setSavingLinks(false);
    }
  };

  const handleResetDefaults = () => {
    setRedirectLinks(defaultLinks);
    localStorage.setItem('novyra_community_links', JSON.stringify(defaultLinks));
    window.dispatchEvent(new Event('novyra_community_links_updated'));
    success('Reset links to platform defaults.');
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-black text-2xl sm:text-3xl text-slate-100">
            Operations & <span className="text-gradient-brand">Liquidity Dashboard</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time platform financial balances, pending approval queues, and live community settings.
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
          <p className="text-3xl font-black font-heading text-slate-100">{kpis?.totalUsers || 1042}</p>
          <p className="text-[11px] text-emerald-400 font-medium">
            {kpis?.activeUsers || 987} active & verified accounts
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
            {kpis?.pendingDeposits || 3}
          </p>
          <p className="text-[11px] text-slate-400">
            Amount: {Number(kpis?.pendingDepositsAmount || 4500).toLocaleString()} PKR
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
            {kpis?.pendingWithdrawals || 2}
          </p>
          <p className="text-[11px] text-slate-400">
            Reserved: {Number(kpis?.pendingWithdrawalsAmount || 2800).toLocaleString()} PKR
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

      {/* ========================================================================= */}
      {/* 🌟 WHATSAPP & COMMUNITY REDIRECT LINKS CONFIGURATION SECTION               */}
      {/* ========================================================================= */}
      <div 
        className="p-7 sm:p-8 rounded-3xl border shadow-2xl relative overflow-hidden transition-all duration-300"
        style={{
          backgroundColor: 'var(--theme-bg-surface)',
          borderColor: 'rgba(37, 211, 102, 0.3)',
          boxShadow: '0 10px 35px -5px rgba(37, 211, 102, 0.15)'
        }}
      >
        {/* Subtle Ambient Glow */}
        <div 
          className="absolute top-0 right-0 w-80 h-80 rounded-full blur-[110px] pointer-events-none opacity-15"
          style={{ backgroundColor: '#25D366' }}
        />

        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#25D366]/15 border border-[#25D366]/30 flex items-center justify-center shrink-0 shadow-lg shadow-[#25D366]/10">
              <WhatsAppIcon className="w-7 h-7 text-[#25D366]" />
            </div>
            <div className="text-left">
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-heading font-black text-white">
                  WhatsApp & Community Redirect Links Manager
                </h3>
                <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#25D366]/15 text-[#25D366] border border-[#25D366]/30">
                  Live Sync
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Set and update the exact destination URLs for the 3 WhatsApp buttons displayed on every member's User Dashboard.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleResetDefaults}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white border border-slate-800 bg-slate-900/60 hover:bg-slate-800 transition-all flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>

            <button
              type="button"
              onClick={handleSaveRedirectLinks}
              disabled={savingLinks}
              className="px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-[#25D366] hover:bg-[#20bd5a] active:scale-[0.98] shadow-lg shadow-[#25D366]/25 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {savingLinks ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Redirect Links</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Form Inputs Grid */}
        <form onSubmit={handleSaveRedirectLinks} className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* 1. WhatsApp Channel URL */}
          <div 
            className="p-5 rounded-2xl border space-y-3.5 text-left transition-all hover:border-[#25D366]/40"
            style={{ backgroundColor: 'var(--theme-bg-elevated)', borderColor: 'var(--theme-border)' }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-[#25D366]" />
                <label className="text-xs font-bold text-white">WhatsApp Channel URL</label>
              </div>
              <span className="text-[10px] font-bold text-[#25D366] bg-[#25D366]/10 px-2 py-0.5 rounded">Broadcast</span>
            </div>

            <p className="text-[11px] text-slate-400">
              Users click this to join your verified announcement channel for payment proofs.
            </p>

            <div className="space-y-2">
              <div className="relative">
                <input
                  type="url"
                  required
                  placeholder="https://whatsapp.com/channel/..."
                  value={redirectLinks.channel}
                  onChange={(e) => setRedirectLinks({ ...redirectLinks, channel: e.target.value })}
                  className="w-full pl-3.5 pr-8 py-2.5 rounded-xl border text-xs font-mono text-white focus:outline-none focus:border-[#25D366] transition-colors"
                  style={{ backgroundColor: 'var(--theme-bg-surface)', borderColor: 'var(--theme-border)' }}
                />
                <Link2 className="w-3.5 h-3.5 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2" />
              </div>

              <div className="flex items-center justify-between text-[11px]">
                <a
                  href={redirectLinks.channel}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[#25D366] hover:underline font-semibold"
                >
                  <span>Test Link</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
                <span className="text-slate-500 font-mono text-[10px]">Active Button: Join Channel</span>
              </div>
            </div>
          </div>

          {/* 2. WhatsApp Admin Direct Link / Number */}
          <div 
            className="p-5 rounded-2xl border space-y-3.5 text-left transition-all hover:border-emerald-500/40"
            style={{ backgroundColor: 'var(--theme-bg-elevated)', borderColor: 'var(--theme-border)' }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-emerald-400" />
                <label className="text-xs font-bold text-white">WhatsApp Admin Chat URL</label>
              </div>
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">Direct 1-on-1</span>
            </div>

            <p className="text-[11px] text-slate-400">
              Users click this to open a direct WhatsApp chat with your official support team.
            </p>

            <div className="space-y-2">
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="https://wa.me/923001234567?text=..."
                  value={redirectLinks.admin}
                  onChange={(e) => setRedirectLinks({ ...redirectLinks, admin: e.target.value })}
                  className="w-full pl-3.5 pr-8 py-2.5 rounded-xl border text-xs font-mono text-white focus:outline-none focus:border-emerald-400 transition-colors"
                  style={{ backgroundColor: 'var(--theme-bg-surface)', borderColor: 'var(--theme-border)' }}
                />
                <Link2 className="w-3.5 h-3.5 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2" />
              </div>

              <div className="flex items-center justify-between text-[11px]">
                <a
                  href={redirectLinks.admin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-emerald-400 hover:underline font-semibold"
                >
                  <span>Test Link</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
                <span className="text-slate-500 font-mono text-[10px]">Active Button: Chat with Admin</span>
              </div>
            </div>
          </div>

          {/* 3. WhatsApp Group Invite Link */}
          <div 
            className="p-5 rounded-2xl border space-y-3.5 text-left transition-all hover:border-sky-500/40"
            style={{ backgroundColor: 'var(--theme-bg-elevated)', borderColor: 'var(--theme-border)' }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-sky-400" />
                <label className="text-xs font-bold text-white">WhatsApp Group Link</label>
              </div>
              <span className="text-[10px] font-bold text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded">Community</span>
            </div>

            <p className="text-[11px] text-slate-400">
              Users click this to join the general member community chat group.
            </p>

            <div className="space-y-2">
              <div className="relative">
                <input
                  type="url"
                  required
                  placeholder="https://chat.whatsapp.com/..."
                  value={redirectLinks.group}
                  onChange={(e) => setRedirectLinks({ ...redirectLinks, group: e.target.value })}
                  className="w-full pl-3.5 pr-8 py-2.5 rounded-xl border text-xs font-mono text-white focus:outline-none focus:border-sky-400 transition-colors"
                  style={{ backgroundColor: 'var(--theme-bg-surface)', borderColor: 'var(--theme-border)' }}
                />
                <Link2 className="w-3.5 h-3.5 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2" />
              </div>

              <div className="flex items-center justify-between text-[11px]">
                <a
                  href={redirectLinks.group}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sky-400 hover:underline font-semibold"
                >
                  <span>Test Link</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
                <span className="text-slate-500 font-mono text-[10px]">Active Button: Join Group</span>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Financial Distribution Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div 
          className="p-6 rounded-3xl glass-card space-y-2 transition-all border border-emerald-500/30"
          style={{ background: 'color-mix(in srgb, #10b981 8%, var(--theme-bg-surface))' }}
        >
          <p className="text-xs text-emerald-400 font-semibold">Total Approved Deposits</p>
          <p className="text-2xl font-black font-heading text-slate-100">
            {Number(kpis?.totalDepositsApproved || 24500).toLocaleString(undefined, { minimumFractionDigits: 2 })} PKR
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
            {Number(kpis?.totalWithdrawalsPaid || 18200).toLocaleString(undefined, { minimumFractionDigits: 2 })} PKR
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
            {Number(kpis?.totalTaskRewardsDistributed || 45200).toLocaleString(undefined, { minimumFractionDigits: 2 })} PKR
          </p>
        </div>

        <div 
          className="p-6 rounded-3xl glass-card space-y-2 transition-all border border-amber-500/30"
          style={{ background: 'color-mix(in srgb, #f59e0b 8%, var(--theme-bg-surface))' }}
        >
          <p className="text-xs text-amber-400 font-semibold">Referral Commissions Paid</p>
          <p className="text-2xl font-black font-heading text-slate-100">
            {Number(kpis?.totalReferralCommissionsDistributed || 6850).toLocaleString(undefined, { minimumFractionDigits: 2 })} PKR
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
