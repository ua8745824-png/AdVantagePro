import React, { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import NovyraLogo from '../components/common/NovyraLogo';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import LiveThemeSelector from '../components/common/LiveThemeSelector';
import api from '../services/api';
import {
  LayoutDashboard, PlayCircle, Wallet, ArrowDownToLine, ArrowUpFromLine,
  Users, Bell, LifeBuoy, User, LogOut, Menu, X, Globe, Sparkles, ChevronDown
} from 'lucide-react';

const UserLayout = () => {
  const { user, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [walletSummary, setWalletSummary] = useState({ availableBalance: 0, reservedBalance: 0 });
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchSummary = async () => {
    try {
      const [walletRes, notifRes] = await Promise.all([
        api.get('/wallet'),
        api.get('/notifications/unread-count')
      ]);
      if (walletRes.data?.data) {
        setWalletSummary(walletRes.data.data);
      }
      if (notifRes.data?.data !== undefined) {
        setUnreadCount(notifRes.data.data);
      }
    } catch (err) {
      console.warn('Failed to fetch wallet/notification summary in layout:', err);
    }
  };

  useEffect(() => {
    fetchSummary();
    const interval = setInterval(fetchSummary, 30000); // 30s poll
    return () => clearInterval(interval);
  }, [location.pathname]);

  const navItems = [
    { label: 'Dashboard', icon: LayoutDashboard, to: '/portal' },
    { label: 'Watch & Earn', icon: PlayCircle, to: '/portal/tasks' },
    { label: 'Wallet & Ledger', icon: Wallet, to: '/portal/wallet' },
    { label: 'Deposit Funds', icon: ArrowDownToLine, to: '/portal/deposit' },
    { label: 'Withdraw', icon: ArrowUpFromLine, to: '/portal/withdraw' },
    { label: 'Referral Program', icon: Users, to: '/portal/referrals' },
    { label: 'Support Desk', icon: LifeBuoy, to: '/portal/support' },
    { label: 'Notifications', icon: Bell, to: '/portal/notifications', badge: unreadCount },
    { label: 'Account Profile', icon: User, to: '/portal/profile' }
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row">
      {/* 1. Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-950 border-r border-slate-900 shrink-0 sticky top-0 h-screen overflow-y-auto">
        {/* Brand */}
        <div className="h-20 flex items-center px-6 border-b border-slate-900 gap-3">
          <NovyraLogo className="w-8 h-8" />
          <div className="flex flex-col">
            <span className="font-heading font-black text-xl tracking-wider bg-gradient-to-r from-violet-400 via-indigo-300 to-amber-300 bg-clip-text text-transparent">
              NOVYRA
            </span>
            <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500 -mt-0.5">
              User Portal
            </span>
          </div>
        </div>

        {/* User Mini Card */}
        <div className="p-4 mx-3 my-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center font-black text-sm text-white shrink-0 shadow-md">
            {user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-white truncate">{user?.fullName || 'User'}</p>
            <p className="text-[11px] text-slate-400 font-mono truncate">@{user?.username || 'user'}</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.to;
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-violet-600/20 to-indigo-600/20 border border-indigo-500/40 text-white font-bold shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-400' : 'text-slate-500'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge > 0 && (
                  <span className="px-2 py-0.5 text-[10px] font-black rounded-full bg-indigo-600 text-white animate-pulse">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-slate-900 space-y-2">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/30 border border-transparent transition-all"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* 2. Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="sticky top-0 z-30 h-20 bg-slate-950/80 backdrop-blur-xl border-b border-slate-900 flex items-center justify-between px-4 sm:px-8">
          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            className="md:hidden p-2 rounded-xl border border-slate-800 bg-slate-900 text-slate-300"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Balance Widget */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Available:</span>
              <span className="text-sm font-black font-heading">
                {Number(walletSummary.availableBalance).toLocaleString(undefined, { minimumFractionDigits: 2 })} PKR
              </span>
            </div>

            {walletSummary.reservedBalance > 0 && (
              <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-amber-950/40 border border-amber-500/30 text-amber-300">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">Reserved:</span>
                <span className="text-sm font-black font-heading">
                  {Number(walletSummary.reservedBalance).toLocaleString(undefined, { minimumFractionDigits: 2 })} PKR
                </span>
              </div>
            )}
          </div>

          {/* Quick Right Actions */}
          <div className="flex items-center gap-3">
            {/* Live Theme Selector */}
            <LiveThemeSelector />

            {/* Notifications Shortcut */}
            <Link
              to="/portal/notifications"
              className="relative p-2.5 rounded-xl border border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-slate-300 transition-colors"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-black flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </Link>

            {/* Quick Watch Task Button */}
            <Link
              to="/portal/tasks"
              className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-xs font-bold shadow-lg shadow-indigo-600/20 hover:scale-105 transition-all"
            >
              <PlayCircle className="w-3.5 h-3.5" />
              <span>Watch & Earn</span>
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl mx-auto w-full">
          <Outlet context={{ refreshSummary: fetchSummary }} />
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden bg-slate-950/80 backdrop-blur-md flex">
          <div className="w-72 bg-slate-950 border-r border-slate-800 h-full p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-6 border-b border-slate-900">
                <Link to="/" className="flex items-center gap-2">
                  <NovyraLogo className="w-7 h-7" />
                  <span className="font-heading font-black text-lg text-white">NOVYRA</span>
                </Link>
                <button
                  onClick={() => setMobileSidebarOpen(false)}
                  className="p-1 text-slate-400 hover:text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <nav className="mt-6 space-y-1.5">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.to;
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      onClick={() => setMobileSidebarOpen(false)}
                      className={`flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-semibold ${
                        isActive
                          ? 'bg-indigo-600 text-white font-bold'
                          : 'text-slate-300 hover:bg-slate-900'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </div>
                      {item.badge > 0 && (
                        <span className="px-2 py-0.5 text-[10px] font-black rounded-full bg-white text-indigo-900">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>

            <button
              onClick={() => { handleLogout(); setMobileSidebarOpen(false); }}
              className="w-full py-3 rounded-xl border border-rose-500/30 text-rose-400 bg-rose-500/10 text-xs font-bold"
            >
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserLayout;
