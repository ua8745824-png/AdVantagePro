import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import NovyraLogo from '../common/NovyraLogo';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import LiveThemeSelector from '../common/LiveThemeSelector';
import { Menu, X, Globe, User, Shield, LogOut, ChevronDown, LayoutDashboard } from 'lucide-react';

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const navLinks = [
    { label: t('nav.home') || 'Home', to: '/' },
    { label: t('nav.howItWorks') || 'How It Works', to: '/how-it-works' },
    { label: t('nav.about') || 'About Us', to: '/about' },
    { label: t('nav.faq') || 'FAQ', to: '/faq' },
    { label: t('nav.contact') || 'Contact', to: '/contact' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-slate-950/70 border-b border-slate-800/80 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center focus:outline-none">
            <NovyraLogo size="md" showText={true} showTagline={true} />
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="text-sm font-semibold text-slate-300 hover:text-white transition-colors duration-200 hover:translate-y-[-1px]"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right Action Menu */}
          <div className="hidden md:flex items-center gap-3">
            {/* Live Theme Selector */}
            <LiveThemeSelector />

            {/* Language Switcher */}
            <div className="relative">
              <button
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900/60 hover:bg-slate-800/80 text-xs font-semibold text-slate-300 hover:text-white transition-all"
              >
                <Globe className="w-3.5 h-3.5 text-indigo-400" />
                <span className="uppercase">{language}</span>
                <ChevronDown className="w-3 h-3 text-slate-500" />
              </button>

              {langDropdownOpen && (
                <div className="absolute right-0 mt-2 w-36 py-1.5 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl z-50 backdrop-blur-xl animate-fade-in">
                  <button
                    onClick={() => { setLanguage('en'); setLangDropdownOpen(false); }}
                    className={`w-full px-3 py-1.5 text-left text-xs font-medium flex items-center justify-between hover:bg-slate-800/60 ${
                      language === 'en' ? 'text-indigo-400 font-bold bg-indigo-950/30' : 'text-slate-300'
                    }`}
                  >
                    English (EN)
                  </button>
                  <button
                    onClick={() => { setLanguage('ur'); setLangDropdownOpen(false); }}
                    className={`w-full px-3 py-1.5 text-left text-xs font-medium flex items-center justify-between hover:bg-slate-800/60 font-urdu ${
                      language === 'ur' ? 'text-indigo-400 font-bold bg-indigo-950/30' : 'text-slate-300'
                    }`}
                  >
                    اردو (UR)
                  </button>
                  <button
                    onClick={() => { setLanguage('roman'); setLangDropdownOpen(false); }}
                    className={`w-full px-3 py-1.5 text-left text-xs font-medium flex items-center justify-between hover:bg-slate-800/60 ${
                      language === 'roman' ? 'text-indigo-400 font-bold bg-indigo-950/30' : 'text-slate-300'
                    }`}
                  >
                    Roman Urdu
                  </button>
                </div>
              )}
            </div>

            {/* Auth Buttons */}
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                {isAdmin ? (
                  <Link
                    to="/admin"
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold transition-all shadow-lg shadow-amber-500/5"
                  >
                    <Shield className="w-3.5 h-3.5" />
                    Admin Console
                  </Link>
                ) : (
                  <Link
                    to="/portal"
                    className="flex items-center gap-2 px-4 py-2 rounded-xl btn-primary text-white text-xs font-bold transition-all"
                  >
                    <LayoutDashboard className="w-3.5 h-3.5" />
                    Portal Dashboard
                  </Link>
                )}

                <button
                  onClick={handleLogout}
                  title="Sign Out"
                  className="p-2 rounded-xl border border-slate-800 bg-slate-900/60 text-slate-400 hover:text-rose-400 hover:border-rose-500/30 transition-all"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="text-sm font-semibold text-slate-300 hover:text-white px-4 py-2 rounded-xl hover:bg-white/[0.05] transition-colors"
                >
                  {t('nav.login') || 'Sign In'}
                </Link>
                <Link
                  to="/register"
                  className="btn-primary text-sm font-bold transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                >
                  <span className="relative z-10 flex items-center gap-1.5">
                    {t('nav.register') || 'Get Started'}
                  </span>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl border border-slate-800 bg-slate-900/80 text-slate-300 hover:text-white focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-800/90 bg-slate-950/95 backdrop-blur-2xl px-6 py-6 space-y-4 animate-fade-in">
          <nav className="flex flex-col gap-3">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileMenuOpen(false)}
                className="text-base font-semibold text-slate-300 hover:text-white py-2 border-b border-slate-900"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="pt-2 flex flex-col gap-3">
            <div className="flex items-center justify-between py-1">
              <span className="text-xs font-bold text-slate-400">Appearance Theme:</span>
              <LiveThemeSelector />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setLanguage('en')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg border transition-all ${
                  language === 'en' ? 'btn-primary text-white border-transparent' : 'border-slate-800 text-slate-400'
                }`}
                style={language !== 'en' ? { backgroundColor: 'var(--theme-bg-surface)' } : {}}
              >
                English
              </button>
              <button
                onClick={() => setLanguage('ur')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg border font-urdu transition-all ${
                  language === 'ur' ? 'btn-primary text-white border-transparent' : 'border-slate-800 text-slate-400'
                }`}
                style={language !== 'ur' ? { backgroundColor: 'var(--theme-bg-surface)' } : {}}
              >
                اردو
              </button>
              <button
                onClick={() => setLanguage('roman')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg border transition-all ${
                  language === 'roman' ? 'btn-primary text-white border-transparent' : 'border-slate-800 text-slate-400'
                }`}
                style={language !== 'roman' ? { backgroundColor: 'var(--theme-bg-surface)' } : {}}
              >
                Roman
              </button>
            </div>

            {isAuthenticated ? (
              <div className="flex flex-col gap-2 pt-2">
                {isAdmin ? (
                  <Link
                    to="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center py-3 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 text-sm font-bold"
                  >
                    Admin Console
                  </Link>
                ) : (
                  <Link
                    to="/portal"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center py-3 rounded-xl btn-primary text-white text-sm font-bold"
                  >
                    Portal Dashboard
                  </Link>
                )}
                <button
                  onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                  className="w-full py-3 rounded-xl border border-rose-500/30 text-rose-400 bg-rose-500/10 text-sm font-bold"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2 pt-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-3 rounded-xl border border-slate-800 text-slate-200 text-sm font-semibold"
                  style={{ backgroundColor: 'var(--theme-bg-surface)' }}
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-3 rounded-xl btn-primary text-white text-sm font-bold"
                >
                  Create Free Account
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
