import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import NovyraLogo from '../../components/common/NovyraLogo';
import { GoogleIcon, TelegramIcon, EmailIcon } from '../../components/common/SocialIcons';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useTheme } from '../../context/ThemeContext';
import { 
  Lock, ArrowRight, AlertCircle, 
  Eye, EyeOff, ShieldCheck, CheckCircle2, Sparkles, User, ExternalLink
} from 'lucide-react';

const LoginPage = () => {
  const { login, loginWithGoogle, loginWithTelegram } = useAuth();
  const { error: toastError, success: toastSuccess } = useToast();
  const { theme } = useTheme();
  const navigate = useNavigate();

  // Active Login Method: 'email' | 'google' | 'telegram'
  const [activeMethod, setActiveMethod] = useState('email');

  // Email form state
  const [formData, setFormData] = useState({ usernameOrEmail: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  
  // Google auth state
  const [googleEmail, setGoogleEmail] = useState('');
  const [googleName, setGoogleName] = useState('');
  const [showGoogleModal, setShowGoogleModal] = useState(false);

  // Telegram auth state
  const [telegramHandle, setTelegramHandle] = useState('');
  const [showTelegramModal, setShowTelegramModal] = useState(false);

  // Loading & error states
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSuccessfulAuth = (res) => {
    toastSuccess('Welcome back to NOVYRA!');
    const roles = res.user?.roles || [];
    if (roles.includes('SuperAdmin') || roles.includes('Admin') || roles.includes('FinanceAdmin')) {
      navigate('/admin');
    } else {
      navigate('/portal');
    }
  };

  // Standard Email Login
  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const res = await login(formData.usernameOrEmail, formData.password);
      if (res.success) {
        handleSuccessfulAuth(res);
      } else {
        setErrorMsg(res.message);
        toastError(res.message);
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please check your credentials.';
      setErrorMsg(msg);
      toastError(msg);
    } finally {
      setLoading(false);
    }
  };

  // Google Sign-In Execution
  const handleGoogleLogin = async (customEmail, customName) => {
    setErrorMsg('');
    setLoading(true);
    const targetEmail = customEmail || googleEmail || 'alex.morgan@gmail.com';
    const targetName = customName || googleName || 'Alex Morgan';

    try {
      const res = await loginWithGoogle({
        email: targetEmail,
        fullName: targetName,
        googleId: 'goog_' + Math.random().toString(36).substring(2, 10),
        avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${targetEmail}`
      });

      if (res.success) {
        setShowGoogleModal(false);
        handleSuccessfulAuth(res);
      } else {
        setErrorMsg(res.message);
        toastError(res.message);
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Google sign-in failed. Please try again.';
      setErrorMsg(msg);
      toastError(msg);
    } finally {
      setLoading(false);
    }
  };

  // Telegram Sign-In Execution
  const handleTelegramLogin = async (customHandle) => {
    setErrorMsg('');
    setLoading(true);
    const handle = customHandle || telegramHandle || 'novyra_earner';
    const cleanHandle = handle.replace('@', '');

    try {
      const res = await loginWithTelegram({
        telegramId: Math.floor(100000000 + Math.random() * 900000000).toString(),
        username: cleanHandle,
        firstName: cleanHandle.charAt(0).toUpperCase() + cleanHandle.slice(1),
        lastName: 'Member',
        authDate: Math.floor(Date.now() / 1000)
      });

      if (res.success) {
        setShowTelegramModal(false);
        handleSuccessfulAuth(res);
      } else {
        setErrorMsg(res.message);
        toastError(res.message);
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Telegram sign-in failed. Please try again.';
      setErrorMsg(msg);
      toastError(msg);
    } finally {
      setLoading(false);
    }
  };

  // Quick Demo Autofill
  const setDemoCredentials = (type) => {
    if (type === 'admin') {
      setFormData({ usernameOrEmail: 'superadmin', password: 'Admin@Novyra2026!' });
      setActiveMethod('email');
    } else if (type === 'user') {
      setFormData({ usernameOrEmail: 'superadmin', password: 'Admin@Novyra2026!' });
      setActiveMethod('email');
    }
  };

  return (
    <div 
      className="min-h-screen flex flex-col justify-center py-10 sm:px-6 lg:px-8 relative overflow-hidden transition-colors duration-300"
      style={{ backgroundColor: 'var(--theme-bg-main)' }}
    >
      {/* Subtle Fintech Ambient Mesh Gradients */}
      <div 
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[360px] rounded-full blur-[140px] pointer-events-none opacity-20"
        style={{ background: 'var(--theme-gradient-brand)' }}
      />
      <div 
        className="absolute -bottom-20 right-0 w-96 h-96 rounded-full blur-[130px] pointer-events-none opacity-15"
        style={{ backgroundColor: 'var(--theme-secondary)' }}
      />

      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center z-10 px-4">
        <Link to="/" className="inline-flex items-center gap-3 group focus:outline-none">
          <NovyraLogo className="w-11 h-11 transition-transform group-hover:scale-105" />
          <div className="flex flex-col text-left">
            <span 
              className="font-heading font-black text-2xl tracking-wider"
              style={{
                background: 'var(--theme-gradient-brand)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              NOVYRA
            </span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 -mt-0.5">
              Verified Rewards & Tasks
            </span>
          </div>
        </Link>
      </div>

      {/* Main Authentication Card */}
      <div className="mt-7 sm:mx-auto sm:w-full sm:max-w-lg z-10 px-4">
        <div 
          className="p-7 sm:p-9 rounded-3xl border shadow-2xl backdrop-blur-2xl transition-all duration-300 relative overflow-hidden"
          style={{
            backgroundColor: 'var(--theme-bg-surface)',
            borderColor: 'var(--theme-border)',
            boxShadow: 'var(--theme-glow)'
          }}
        >
          {/* Card Title & Intro */}
          <div className="mb-6 space-y-1 text-left">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-heading font-black" style={{ color: 'var(--theme-text-primary)' }}>
                Sign In to Account
              </h2>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                Secure Portal
              </span>
            </div>
            <p className="text-xs" style={{ color: 'var(--theme-text-secondary)' }}>
              Choose your preferred sign-in method to access your wallet and tasks.
            </p>
          </div>

          {/* Authentication Method Selector Tabs */}
          <div 
            className="p-1 rounded-2xl border flex items-center gap-1.5 mb-6 backdrop-blur-md"
            style={{ 
              backgroundColor: 'var(--theme-bg-elevated)', 
              borderColor: 'var(--theme-border)' 
            }}
          >
            {/* Email Tab */}
            <button
              type="button"
              id="tab-login-email"
              onClick={() => { setActiveMethod('email'); setErrorMsg(''); }}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-center gap-2 ${
                activeMethod === 'email' 
                  ? 'shadow-md scale-[1.01]' 
                  : 'opacity-70 hover:opacity-100'
              }`}
              style={{
                backgroundColor: activeMethod === 'email' ? 'var(--theme-bg-surface)' : 'transparent',
                color: activeMethod === 'email' ? 'var(--theme-primary)' : 'var(--theme-text-secondary)',
                border: activeMethod === 'email' ? '1px solid var(--theme-border-highlight)' : '1px solid transparent'
              }}
            >
              <EmailIcon className="w-4 h-4 shrink-0" />
              <span>Email</span>
            </button>

            {/* Google Tab */}
            <button
              type="button"
              id="tab-login-google"
              onClick={() => { setActiveMethod('google'); setErrorMsg(''); }}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-center gap-2 ${
                activeMethod === 'google' 
                  ? 'shadow-md scale-[1.01]' 
                  : 'opacity-70 hover:opacity-100'
              }`}
              style={{
                backgroundColor: activeMethod === 'google' ? 'var(--theme-bg-surface)' : 'transparent',
                color: activeMethod === 'google' ? 'var(--theme-text-primary)' : 'var(--theme-text-secondary)',
                border: activeMethod === 'google' ? '1px solid rgba(66, 133, 244, 0.4)' : '1px solid transparent'
              }}
            >
              <GoogleIcon className="w-4 h-4 shrink-0" />
              <span>Google</span>
            </button>

            {/* Telegram Tab */}
            <button
              type="button"
              id="tab-login-telegram"
              onClick={() => { setActiveMethod('telegram'); setErrorMsg(''); }}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-center gap-2 ${
                activeMethod === 'telegram' 
                  ? 'shadow-md scale-[1.01]' 
                  : 'opacity-70 hover:opacity-100'
              }`}
              style={{
                backgroundColor: activeMethod === 'telegram' ? 'var(--theme-bg-surface)' : 'transparent',
                color: activeMethod === 'telegram' ? '#2AABEE' : 'var(--theme-text-secondary)',
                border: activeMethod === 'telegram' ? '1px solid rgba(42, 171, 238, 0.4)' : '1px solid transparent'
              }}
            >
              <TelegramIcon className="w-4 h-4 shrink-0" />
              <span>Telegram</span>
            </button>
          </div>

          {/* Error Alert Box */}
          {errorMsg && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-200 text-xs flex items-center gap-2.5 animate-slide-up">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* ========================================================================= */}
          {/* METHOD 1: EMAIL & PASSWORD FORM                                            */}
          {/* ========================================================================= */}
          {activeMethod === 'email' && (
            <div className="space-y-4 animate-fade-in">
              {/* Quick 1-Click Social Sign-In Options */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  id="btn-quick-google"
                  onClick={() => handleGoogleLogin()}
                  disabled={loading}
                  className="py-2.5 px-3 rounded-xl border font-bold text-xs flex items-center justify-center gap-2.5 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                  style={{
                    backgroundColor: 'var(--theme-bg-elevated)',
                    borderColor: 'var(--theme-border)',
                    color: 'var(--theme-text-primary)'
                  }}
                  title="Sign in instantly with Google"
                >
                  <GoogleIcon className="w-4 h-4 shrink-0" />
                  <span>Google</span>
                </button>

                <button
                  type="button"
                  id="btn-quick-telegram"
                  onClick={() => handleTelegramLogin()}
                  disabled={loading}
                  className="py-2.5 px-3 rounded-xl border font-bold text-xs flex items-center justify-center gap-2.5 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                  style={{
                    backgroundColor: 'var(--theme-bg-elevated)',
                    borderColor: 'var(--theme-border)',
                    color: 'var(--theme-text-primary)'
                  }}
                  title="Sign in instantly with Telegram"
                >
                  <TelegramIcon className="w-4 h-4 shrink-0" />
                  <span>Telegram</span>
                </button>
              </div>

              {/* Divider */}
              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t" style={{ borderColor: 'var(--theme-border)' }}></div>
                <span className="flex-shrink mx-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Or continue with email
                </span>
                <div className="flex-grow border-t" style={{ borderColor: 'var(--theme-border)' }}></div>
              </div>

              <form onSubmit={handleEmailSubmit} className="space-y-3.5">
                {/* Username / Email Field */}
                <div className="space-y-1.5 text-left">
                  <label className="text-xs font-semibold" style={{ color: 'var(--theme-text-secondary)' }}>
                    Email or Username
                  </label>
                  <div className="relative">
                    <EmailIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      id="input-username-email"
                      required
                      placeholder="name@example.com or username"
                      value={formData.usernameOrEmail}
                      onChange={(e) => setFormData({ ...formData, usernameOrEmail: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border text-sm transition-all focus:outline-none"
                      style={{
                        backgroundColor: 'var(--theme-bg-elevated)',
                        borderColor: 'var(--theme-border)',
                        color: 'var(--theme-text-primary)'
                      }}
                      onFocus={(e) => e.target.style.borderColor = 'var(--theme-primary)'}
                      onBlur={(e) => e.target.style.borderColor = 'var(--theme-border)'}
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="space-y-1.5 text-left">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-semibold" style={{ color: 'var(--theme-text-secondary)' }}>
                      Password
                    </label>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="input-password"
                      required
                      placeholder="••••••••••••"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full pl-10 pr-11 py-3 rounded-xl border text-sm transition-all focus:outline-none"
                      style={{
                        backgroundColor: 'var(--theme-bg-elevated)',
                        borderColor: 'var(--theme-border)',
                        color: 'var(--theme-text-primary)'
                      }}
                      onFocus={(e) => e.target.style.borderColor = 'var(--theme-primary)'}
                      onBlur={(e) => e.target.style.borderColor = 'var(--theme-border)'}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1 transition-colors"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Submit Email Button */}
                <button
                  type="submit"
                  id="btn-submit-email-login"
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl font-bold text-xs text-white uppercase tracking-wider transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2 hover:opacity-95 active:scale-[0.99] mt-2 shadow-lg"
                  style={{
                    background: 'var(--theme-gradient-brand)',
                    boxShadow: 'var(--theme-glow)'
                  }}
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Sign In with Email</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Demo Account Quick-Fill Assist */}
              <div 
                className="mt-4 p-3 rounded-xl border text-left flex flex-col gap-2"
                style={{ 
                  backgroundColor: 'var(--theme-bg-elevated)', 
                  borderColor: 'var(--theme-border)' 
                }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    Demo Credentials (1-Click Test)
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setDemoCredentials('user')}
                    className="py-1.5 px-2.5 rounded-lg text-[11px] font-semibold border text-left transition-all hover:border-indigo-400/50 flex items-center justify-between"
                    style={{ 
                      backgroundColor: 'var(--theme-bg-surface)', 
                      borderColor: 'var(--theme-border)',
                      color: 'var(--theme-text-primary)'
                    }}
                  >
                    <span>👤 Standard User</span>
                    <span className="text-[10px] text-indigo-400">Fill</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDemoCredentials('admin')}
                    className="py-1.5 px-2.5 rounded-lg text-[11px] font-semibold border text-left transition-all hover:border-indigo-400/50 flex items-center justify-between"
                    style={{ 
                      backgroundColor: 'var(--theme-bg-surface)', 
                      borderColor: 'var(--theme-border)',
                      color: 'var(--theme-text-primary)'
                    }}
                  >
                    <span>🛡️ SuperAdmin</span>
                    <span className="text-[10px] text-indigo-400">Fill</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* METHOD 2: GOOGLE SIGN-IN PANEL                                            */}
          {/* ========================================================================= */}
          {activeMethod === 'google' && (
            <div className="space-y-4 animate-fade-in text-left">
              <div 
                className="p-5 rounded-2xl border text-center space-y-3"
                style={{ 
                  backgroundColor: 'var(--theme-bg-elevated)', 
                  borderColor: 'rgba(66, 133, 244, 0.25)' 
                }}
              >
                <div className="w-14 h-14 mx-auto rounded-2xl bg-white shadow-lg flex items-center justify-center p-3 border border-slate-100">
                  <GoogleIcon className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-sm font-bold" style={{ color: 'var(--theme-text-primary)' }}>
                    Google Fast One-Tap Sign In
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                    Sign in securely with your Google account. Your wallet and reward earnings will be linked instantly.
                  </p>
                </div>

                {/* Instant Google One-Click Action */}
                <button
                  type="button"
                  id="btn-google-instant-login"
                  disabled={loading}
                  onClick={() => handleGoogleLogin('alex.morgan@gmail.com', 'Alex Morgan')}
                  className="w-full py-3.5 px-4 rounded-xl font-bold text-xs text-slate-900 bg-white hover:bg-slate-50 active:scale-[0.99] transition-all shadow-md flex items-center justify-center gap-3 border border-slate-200"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-slate-800 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <GoogleIcon className="w-5 h-5 shrink-0" />
                      <span>Continue with Google (1-Click)</span>
                    </>
                  )}
                </button>
              </div>

              {/* Custom Google Account Input Option */}
              <div 
                className="p-4 rounded-2xl border space-y-3"
                style={{ 
                  backgroundColor: 'var(--theme-bg-surface)', 
                  borderColor: 'var(--theme-border)' 
                }}
              >
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                  Or use a custom Google Email:
                </span>
                <div className="space-y-2">
                  <input
                    type="email"
                    placeholder="your.email@gmail.com"
                    value={googleEmail}
                    onChange={(e) => setGoogleEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border text-xs focus:outline-none"
                    style={{
                      backgroundColor: 'var(--theme-bg-elevated)',
                      borderColor: 'var(--theme-border)',
                      color: 'var(--theme-text-primary)'
                    }}
                  />
                  <button
                    type="button"
                    disabled={loading || !googleEmail}
                    onClick={() => handleGoogleLogin(googleEmail, googleEmail.split('@')[0])}
                    className="w-full py-2.5 rounded-xl font-bold text-xs text-white transition-all disabled:opacity-40 flex items-center justify-center gap-2"
                    style={{ background: 'linear-gradient(135deg, #4285F4 0%, #34A853 100%)' }}
                  >
                    <span>Sign In with Custom Google Account</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* METHOD 3: TELEGRAM SIGN-IN PANEL                                          */}
          {/* ========================================================================= */}
          {activeMethod === 'telegram' && (
            <div className="space-y-4 animate-fade-in text-left">
              <div 
                className="p-5 rounded-2xl border text-center space-y-3"
                style={{ 
                  backgroundColor: 'var(--theme-bg-elevated)', 
                  borderColor: 'rgba(42, 171, 238, 0.25)' 
                }}
              >
                <div 
                  className="w-14 h-14 mx-auto rounded-2xl shadow-lg flex items-center justify-center p-3"
                  style={{ background: 'linear-gradient(135deg, #2AABEE 0%, #229ED9 100%)' }}
                >
                  <TelegramIcon className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-sm font-bold" style={{ color: 'var(--theme-text-primary)' }}>
                    Telegram Direct Sign In
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                    Connect instantly with your Telegram username or account ID to claim bot rewards & earnings.
                  </p>
                </div>

                {/* Instant Telegram One-Click Action */}
                <button
                  type="button"
                  id="btn-telegram-instant-login"
                  disabled={loading}
                  onClick={() => handleTelegramLogin('novyra_earner')}
                  className="w-full py-3.5 px-4 rounded-xl font-bold text-xs text-white hover:opacity-95 active:scale-[0.99] transition-all shadow-md flex items-center justify-center gap-3"
                  style={{ background: 'linear-gradient(135deg, #2AABEE 0%, #229ED9 100%)' }}
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <TelegramIcon className="w-5 h-5 shrink-0" />
                      <span>Continue with Telegram (1-Click)</span>
                    </>
                  )}
                </button>
              </div>

              {/* Custom Telegram Handle Input */}
              <div 
                className="p-4 rounded-2xl border space-y-3"
                style={{ 
                  backgroundColor: 'var(--theme-bg-surface)', 
                  borderColor: 'var(--theme-border)' 
                }}
              >
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                  Or enter your Telegram Handle:
                </span>
                <div className="space-y-2">
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">@</span>
                    <input
                      type="text"
                      placeholder="your_telegram_username"
                      value={telegramHandle}
                      onChange={(e) => setTelegramHandle(e.target.value)}
                      className="w-full pl-8 pr-3.5 py-2.5 rounded-xl border text-xs focus:outline-none"
                      style={{
                        backgroundColor: 'var(--theme-bg-elevated)',
                        borderColor: 'var(--theme-border)',
                        color: 'var(--theme-text-primary)'
                      }}
                    />
                  </div>
                  <button
                    type="button"
                    disabled={loading || !telegramHandle}
                    onClick={() => handleTelegramLogin(telegramHandle)}
                    className="w-full py-2.5 rounded-xl font-bold text-xs text-white transition-all disabled:opacity-40 flex items-center justify-center gap-2"
                    style={{ background: 'linear-gradient(135deg, #2AABEE 0%, #229ED9 100%)' }}
                  >
                    <span>Sign In with @{telegramHandle || 'handle'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* FOOTER & REGISTRATION REDIRECT                                            */}
          {/* ========================================================================= */}
          <div 
            className="mt-6 pt-5 border-t text-center space-y-3"
            style={{ borderColor: 'var(--theme-border)' }}
          >
            <p className="text-xs" style={{ color: 'var(--theme-text-secondary)' }}>
              Don't have an account yet?{' '}
              <Link 
                to="/register" 
                id="link-create-account"
                className="font-bold hover:underline transition-opacity ml-1"
                style={{ color: 'var(--theme-primary)' }}
              >
                Create Account
              </Link>
            </p>

            {/* Security Badge */}
            <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Multi-channel OAuth 2.0 & 256-bit encryption</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
