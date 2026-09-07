import React, { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import NovyraLogo from '../components/common/NovyraLogo';
import { useAuth } from '../context/AuthContext';
import LiveThemeSelector from '../components/common/LiveThemeSelector';
import api from '../../src/services/api';
import {
  Shield, LayoutDashboard, Users, Megaphone, CheckSquare, 
  ArrowDownToLine, ArrowUpFromLine, Sliders, Settings, 
  LifeBuoy, AlertTriangle, FileText, CreditCard, LogOut, Menu, X, ArrowLeft
} from 'lucide-react';

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [kpis, setKpis] = useState(null);

  const fetchKpis = async () => {
    try {
      const res = await api.get('/admin/dashboard/kpis');
      if (res.data?.data) {
        setKpis(res.data.data);
      }
    } catch (err) {
      console.warn('Failed to fetch admin KPIs in layout:', err);
    }
  };

  useEffect(() => {
    fetchKpis();
    const interval = setInterval(fetchKpis, 30000);
    return () => clearInterval(interval);
  }, [location.pathname]);

  const navItems = [
    { label: 'Overview Dashboard', icon: LayoutDashboard, to: '/admin' },
    { label: 'User Directory', icon: Users, to: '/admin/users' },
    { label: 'Sponsor Campaigns', icon: Megaphone, to: '/admin/campaigns' },
    { label: 'Task Management', icon: CheckSquare, to: '/admin/tasks' },
    { label: 'Deposit Reviews', icon: ArrowDownToLine, to: '/admin/deposits', badge: kpis?.pendingDeposits },
    { label: 'Withdrawals Queue', icon: ArrowUpFromLine, to: '/admin/withdrawals', badge: kpis?.pendingWithdrawals },
    { label: 'Manual Adjustments', icon: CreditCard, to: '/admin/adjustments' },
    { label: 'Payment Methods & QR', icon: Sliders, to: '/admin/payment-methods' },
    { label: 'Support Desk', icon: LifeBuoy, to: '/admin/support', badge: kpis?.openSupportTickets },
    { label: 'Anti-Fraud Alarms', icon: AlertTriangle, to: '/admin/fraud', badge: kpis?.openFraudFlags, badgeColor: 'bg-rose-600' },
    { label: 'System Audit Logs', icon: FileText, to: '/admin/audit-logs' },
    { label: 'Platform Settings', icon: Settings, to: '/admin/settings' }
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div 
      className="min-h-screen text-slate-100 flex flex-col md:flex-row transition-colors"
      style={{ background: 'var(--theme-bg-main)' }}
    >
      {/* 1. Desktop Admin Sidebar */}
      <aside 
        className="hidden md:flex flex-col w-64 border-r shrink-0 sticky top-0 h-screen overflow-y-auto transition-colors"
        style={{
          background: 'var(--theme-bg-surface)',
          borderColor: 'var(--theme-border)'
        }}
      >
        <div 
          className="h-20 flex items-center px-6 border-b gap-3"
          style={{ borderColor: 'var(--theme-border)' }}
        >
          <NovyraLogo className="w-8 h-8" />
          <div className="flex flex-col">
            <span className="font-heading font-black text-lg tracking-wider text-gradient-brand">
              NOVYRA ADMIN
            </span>
            <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">
              Control Console
            </span>
          </div>
        </div>

        {/* Admin Profile Chip */}
        <div 
          className="p-3.5 mx-3 my-3 rounded-2xl flex items-center justify-between"
          style={{
            background: 'color-mix(in srgb, var(--theme-primary) 12%, transparent)',
            border: '1px solid color-mix(in srgb, var(--theme-primary) 30%, transparent)'
          }}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <Shield className="w-4 h-4 shrink-0" style={{ color: 'var(--theme-primary)' }} />
            <div className="truncate">
              <p className="text-xs font-bold text-slate-100 truncate">{user?.username}</p>
              <p className="text-[10px] text-slate-400 font-medium">Administrator</p>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.to;
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'text-white font-bold shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-white/[0.03]'
                }`}
                style={
                  isActive
                    ? {
                        background: 'color-mix(in srgb, var(--theme-primary) 18%, transparent)',
                        border: '1px solid color-mix(in srgb, var(--theme-primary) 35%, transparent)',
                        color: 'var(--theme-primary)'
                      }
                    : {}
                }
              >
                <div className="flex items-center gap-3">
                  <Icon 
                    className="w-4 h-4" 
                    style={{ color: isActive ? 'var(--theme-primary)' : undefined }}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge > 0 && (
                  <span 
                    className={`px-2 py-0.5 text-[10px] font-black rounded-full text-white ${item.badgeColor || 'bg-indigo-600'} animate-pulse`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Switch to User Portal / Logout */}
        <div 
          className="p-4 border-t space-y-2"
          style={{ borderColor: 'var(--theme-border)' }}
        >
          <Link
            to="/portal"
            className="w-full flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-white/[0.04] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Switch to User View</span>
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-500/10 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* 2. Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header 
          className="sticky top-0 z-30 h-20 backdrop-blur-xl border-b flex items-center justify-between px-4 sm:px-8 transition-colors"
          style={{
            background: 'color-mix(in srgb, var(--theme-bg-main) 85%, transparent)',
            borderColor: 'var(--theme-border)'
          }}
        >
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-slate-300"
            style={{
              background: 'var(--theme-bg-surface)',
              border: '1px solid var(--theme-border)'
            }}
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Quick Stats Pill */}
          <div className="hidden sm:flex items-center gap-3">
            <span className="text-xs font-bold text-slate-400">Platform Status:</span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/50 border border-emerald-500/30 text-emerald-300 text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Operational (NovyraDb Active)</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <LiveThemeSelector />
            <Link
              to="/portal"
              className="px-4 py-2 rounded-xl text-slate-300 text-xs font-bold transition-all hover:scale-[1.02] active:scale-95"
              style={{
                background: 'var(--theme-bg-surface)',
                border: '1px solid var(--theme-border)'
              }}
            >
              User Portal
            </Link>
          </div>
        </header>

        {/* Page Content View */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl mx-auto w-full">
          <Outlet context={{ refreshKpis: fetchKpis }} />
        </main>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden bg-slate-950/80 backdrop-blur-md flex">
          <div 
            className="w-72 border-r h-full p-6 flex flex-col justify-between overflow-y-auto"
            style={{
              background: 'var(--theme-bg-surface)',
              borderColor: 'var(--theme-border)'
            }}
          >
            <div>
              <div 
                className="flex items-center justify-between pb-6 border-b"
                style={{ borderColor: 'var(--theme-border)' }}
              >
                <span className="font-heading font-black text-gradient-brand text-lg">NOVYRA ADMIN</span>
                <button onClick={() => setMobileMenuOpen(false)}>
                  <X className="w-6 h-6 text-slate-400" />
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
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-semibold ${
                        isActive ? 'font-bold' : 'text-slate-300 hover:bg-white/[0.04]'
                      }`}
                      style={
                        isActive
                          ? {
                              background: 'color-mix(in srgb, var(--theme-primary) 18%, transparent)',
                              color: 'var(--theme-primary)'
                            }
                          : {}
                      }
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </div>
                      {item.badge > 0 && (
                        <span className="px-2 py-0.5 text-[10px] font-black rounded-full bg-amber-500 text-black">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>

            <button
              onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
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

export default AdminLayout;
