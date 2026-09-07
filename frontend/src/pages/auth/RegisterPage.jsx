import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import NovyraLogo from '../../components/common/NovyraLogo';
import { GoogleIcon, TelegramIcon } from '../../components/common/SocialIcons';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useTheme } from '../../context/ThemeContext';
import { 
  User, Mail, Phone, Lock, Gift, ArrowRight, AlertCircle, 
  CheckCircle2, Eye, EyeOff, ShieldCheck 
} from 'lucide-react';

const RegisterPage = () => {
  const { register, loginWithGoogle, loginWithTelegram } = useAuth();
  const { error: toastError, success: toastSuccess } = useToast();
  const { theme } = useTheme();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    phoneNumber: '',
    password: '',
    referralCode: '',
    acceptTerms: true
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const ref = searchParams.get('ref');
    if (ref) {
      setFormData((prev) => ({ ...prev, referralCode: ref.toUpperCase() }));
    }
  }, [searchParams]);

  const handleSocialRegister = async (type) => {
    setErrorMsg('');
    setLoading(true);
    try {
      let res;
      if (type === 'google') {
        const email = `user_${Math.random().toString(36).substring(2, 7)}@gmail.com`;
        res = await loginWithGoogle({
          email,
          fullName: 'New Google Member',
          referralCode: formData.referralCode || undefined
        });
      } else {
        const handle = `novyra_user_${Math.random().toString(36).substring(2, 6)}`;
        res = await loginWithTelegram({
          telegramId: Math.floor(100000000 + Math.random() * 900000000).toString(),
          username: handle,
          firstName: 'Telegram',
          lastName: 'Member',
          referralCode: formData.referralCode || undefined
        });
      }

      if (res.success) {
        toastSuccess('Account created successfully! Welcome to NOVYRA.');
        navigate('/portal');
      } else {
        setErrorMsg(res.message);
        toastError(res.message);
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Social sign-up failed. Please try again.';
      setErrorMsg(msg);
      toastError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.acceptTerms) {
      setErrorMsg('You must accept the terms of service and fair play guidelines.');
      return;
    }

    if (formData.password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);

    try {
      const res = await register(
        formData.fullName,
        formData.username,
        formData.email,
        formData.phoneNumber,
        formData.password,
        formData.referralCode
      );

      if (res.success) {
        toastSuccess('Account created successfully! Welcome to NOVYRA.');
        navigate('/portal');
      } else {
        setErrorMsg(res.message);
        toastError(res.message);
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed. Please check your information.';
      setErrorMsg(msg);
      toastError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden transition-colors duration-300"
      style={{ backgroundColor: 'var(--theme-bg-main)' }}
    >
      {/* Subtle Fintech Ambient Mesh Gradients */}
      <div 
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[650px] h-[350px] rounded-full blur-[140px] pointer-events-none opacity-20"
        style={{ background: 'var(--theme-gradient-brand)' }}
      />
      <div 
        className="absolute -bottom-20 left-0 w-96 h-96 rounded-full blur-[130px] pointer-events-none opacity-15"
        style={{ backgroundColor: 'var(--theme-secondary)' }}
      />

      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md flex justify-center text-center z-10 px-4">
        <Link to="/" className="inline-flex items-center focus:outline-none">
          <NovyraLogo size="lg" showText={true} showTagline={true} />
        </Link>
      </div>

      {/* Register Card */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10 px-4">
        <div 
          className="p-8 sm:p-9 rounded-3xl border shadow-xl backdrop-blur-2xl transition-all duration-300"
          style={{
            backgroundColor: 'var(--theme-bg-surface)',
            borderColor: 'var(--theme-border)',
            boxShadow: 'var(--theme-glow)'
          }}
        >
          <div className="mb-6 space-y-1 text-left">
            <h2 className="text-xl font-heading font-black" style={{ color: 'var(--theme-text-primary)' }}>
              Create Your Account
            </h2>
            <p className="text-xs" style={{ color: 'var(--theme-text-secondary)' }}>
              Join to engage with verified sponsor campaigns and earn real payouts.
            </p>
          </div>

          {errorMsg && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-200 text-xs flex items-center gap-2.5 animate-slide-up">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Quick 1-Click Social Sign-Up */}
          <div className="space-y-3 mb-4">
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                id="btn-register-google"
                onClick={() => handleSocialRegister('google')}
                disabled={loading}
                className="py-2.5 px-3 rounded-xl border font-bold text-xs flex items-center justify-center gap-2 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                style={{
                  backgroundColor: 'var(--theme-bg-elevated)',
                  borderColor: 'var(--theme-border)',
                  color: 'var(--theme-text-primary)'
                }}
              >
                <GoogleIcon className="w-4 h-4 shrink-0" />
                <span>Google</span>
              </button>

              <button
                type="button"
                id="btn-register-telegram"
                onClick={() => handleSocialRegister('telegram')}
                disabled={loading}
                className="py-2.5 px-3 rounded-xl border font-bold text-xs flex items-center justify-center gap-2 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                style={{
                  backgroundColor: 'var(--theme-bg-elevated)',
                  borderColor: 'var(--theme-border)',
                  color: 'var(--theme-text-primary)'
                }}
              >
                <TelegramIcon className="w-4 h-4 shrink-0" />
                <span>Telegram</span>
              </button>
            </div>

            {/* Divider */}
            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t" style={{ borderColor: 'var(--theme-border)' }}></div>
              <span className="flex-shrink mx-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Or register with email
              </span>
              <div className="flex-grow border-t" style={{ borderColor: 'var(--theme-border)' }}></div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5 text-left">
            {/* Full Name */}
            <div className="space-y-1">
              <label className="text-xs font-semibold" style={{ color: 'var(--theme-text-secondary)' }}>
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Ali Ahmed"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm transition-all focus:outline-none"
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

            {/* Username & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold" style={{ color: 'var(--theme-text-secondary)' }}>
                  Username
                </label>
                <input
                  type="text"
                  required
                  placeholder="aliahmed1"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border text-sm transition-all focus:outline-none"
                  style={{
                    backgroundColor: 'var(--theme-bg-elevated)',
                    borderColor: 'var(--theme-border)',
                    color: 'var(--theme-text-primary)'
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--theme-primary)'}
                  onBlur={(e) => e.target.style.borderColor = 'var(--theme-border)'}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold" style={{ color: 'var(--theme-text-secondary)' }}>
                  Phone (Easypaisa/Jazz)
                </label>
                <input
                  type="text"
                  required
                  placeholder="03001234567"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border text-sm transition-all focus:outline-none"
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

            {/* Email */}
            <div className="space-y-1">
              <label className="text-xs font-semibold" style={{ color: 'var(--theme-text-secondary)' }}>
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="ali@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm transition-all focus:outline-none"
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

            {/* Password */}
            <div className="space-y-1">
              <label className="text-xs font-semibold" style={{ color: 'var(--theme-text-secondary)' }}>
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Min 6 characters"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-10 pr-11 py-2.5 rounded-xl border text-sm transition-all focus:outline-none"
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
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Referral Code */}
            <div className="space-y-1">
              <label className="text-xs font-semibold" style={{ color: 'var(--theme-text-secondary)' }}>
                Referral Code (Optional)
              </label>
              <div className="relative">
                <Gift className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="e.g. NOV-ABC123"
                  value={formData.referralCode}
                  onChange={(e) => setFormData({ ...formData, referralCode: e.target.value.toUpperCase() })}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm font-mono transition-all focus:outline-none"
                  style={{
                    backgroundColor: 'var(--theme-bg-elevated)',
                    borderColor: 'var(--theme-border)',
                    color: 'var(--theme-primary)'
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--theme-primary)'}
                  onBlur={(e) => e.target.style.borderColor = 'var(--theme-border)'}
                />
              </div>
            </div>

            {/* Accept Terms */}
            <div className="pt-1 flex items-start gap-2">
              <input
                type="checkbox"
                id="terms"
                checked={formData.acceptTerms}
                onChange={(e) => setFormData({ ...formData, acceptTerms: e.target.checked })}
                className="mt-1 rounded accent-indigo-600"
              />
              <label htmlFor="terms" className="text-[11px] text-slate-400 leading-tight">
                I agree to the <Link to="/terms" className="underline" style={{ color: 'var(--theme-primary)' }}>Terms of Service</Link> and understand earnings are performance-based.
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
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
                  <span>Create Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Login Link */}
          <div 
            className="mt-6 pt-5 border-t text-center"
            style={{ borderColor: 'var(--theme-border)' }}
          >
            <p className="text-xs" style={{ color: 'var(--theme-text-secondary)' }}>
              Already have an account?{' '}
              <Link 
                to="/login" 
                className="font-bold hover:underline transition-opacity ml-1"
                style={{ color: 'var(--theme-primary)' }}
              >
                Sign In
              </Link>
            </p>
          </div>

          {/* Security Badge */}
          <div className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <span>256-bit encrypted security & verified transactions</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
