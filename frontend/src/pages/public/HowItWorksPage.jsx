import React from 'react';
import { Link } from 'react-router-dom';
import { UserPlus, Play, CheckCircle2, DollarSign, ShieldAlert, ArrowRight } from 'lucide-react';

const HowItWorksPage = () => {
  return (
    <div className="min-h-screen text-slate-100 py-16 sm:py-24 animate-fade-in" style={{ background: 'var(--theme-bg-main)' }}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Header */}
        <div className="text-center space-y-4">
          <span 
            className="text-xs font-bold uppercase tracking-widest px-3.5 py-1.5 rounded-full"
            style={{
              background: 'color-mix(in srgb, var(--theme-primary) 15%, transparent)',
              color: 'var(--theme-primary)',
              border: '1px solid color-mix(in srgb, var(--theme-primary) 30%, transparent)'
            }}
          >
            User Guide
          </span>
          <h1 className="font-heading font-black text-4xl sm:text-5xl text-slate-100 tracking-tight">
            How NOVYRA Works <span className="text-gradient-brand">Step-by-Step</span>
          </h1>
          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Follow this clear step-by-step walkthrough to start watching sponsored content and receiving verified rewards.
          </p>
        </div>

        {/* Steps Detailed */}
        <div className="space-y-6">
          {/* Step 1 */}
          <div 
            className="flex flex-col md:flex-row items-start gap-6 p-8 rounded-3xl glass-card transition-all"
            style={{ background: 'var(--theme-bg-surface)' }}
          >
            <div 
              className="w-14 h-14 rounded-2xl flex items-center justify-center font-heading font-black text-2xl shrink-0"
              style={{
                background: 'color-mix(in srgb, var(--theme-primary) 15%, transparent)',
                color: 'var(--theme-primary)',
                border: '1px solid color-mix(in srgb, var(--theme-primary) 30%, transparent)'
              }}
            >
              1
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-slate-100 font-heading">Create a Free NOVYRA Account</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Sign up with your username, email, and phone number. If a friend invited you, paste their referral code during registration. Account activation is instantaneous with no mandatory initial purchase.
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div 
            className="flex flex-col md:flex-row items-start gap-6 p-8 rounded-3xl glass-card transition-all"
            style={{ background: 'var(--theme-bg-surface)' }}
          >
            <div 
              className="w-14 h-14 rounded-2xl flex items-center justify-center font-heading font-black text-2xl shrink-0"
              style={{
                background: 'color-mix(in srgb, var(--theme-secondary) 15%, transparent)',
                color: 'var(--theme-secondary)',
                border: '1px solid color-mix(in srgb, var(--theme-secondary) 30%, transparent)'
              }}
            >
              2
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-slate-100 font-heading">Browse Available Sponsored Tasks</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Access your User Portal to view active sponsor campaigns. Each task clearly displays its required watch duration (e.g., 30s or 45s) and exact PKR reward amount.
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div 
            className="flex flex-col md:flex-row items-start gap-6 p-8 rounded-3xl glass-card transition-all"
            style={{ background: 'var(--theme-bg-surface)' }}
          >
            <div 
              className="w-14 h-14 rounded-2xl flex items-center justify-center font-heading font-black text-2xl shrink-0"
              style={{
                background: 'color-mix(in srgb, var(--theme-primary) 15%, transparent)',
                color: 'var(--theme-primary)',
                border: '1px solid color-mix(in srgb, var(--theme-primary) 30%, transparent)'
              }}
            >
              3
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-slate-100 font-heading">Watch Until Duration Completes</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Click "Start Task" to begin a secure session. The live progress bar counts down while you watch the content. Once complete, click "Claim Reward" to submit your cryptographic completion nonce.
              </p>
            </div>
          </div>

          {/* Step 4 */}
          <div 
            className="flex flex-col md:flex-row items-start gap-6 p-8 rounded-3xl glass-card transition-all"
            style={{ background: 'var(--theme-bg-surface)' }}
          >
            <div 
              className="w-14 h-14 rounded-2xl flex items-center justify-center font-heading font-black text-2xl shrink-0"
              style={{
                background: 'color-mix(in srgb, var(--theme-secondary) 15%, transparent)',
                color: 'var(--theme-secondary)',
                border: '1px solid color-mix(in srgb, var(--theme-secondary) 30%, transparent)'
              }}
            >
              4
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-slate-100 font-heading">Withdraw Your Funds (Easypaisa / JazzCash / Bank)</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Once your wallet balance reaches the 500 PKR minimum threshold, navigate to the Withdraw tab, select your preferred payout gateway, enter your account details, and submit your request.
              </p>
            </div>
          </div>
        </div>

        {/* Fair Play Box */}
        <div className="p-8 rounded-3xl bg-amber-950/20 border border-amber-500/30 flex items-start gap-4">
          <ShieldAlert className="w-8 h-8 text-amber-400 shrink-0 mt-1" />
          <div className="space-y-2 text-sm">
            <h4 className="font-bold text-amber-200 text-base font-heading">Anti-Fraud & Fair Play Policy</h4>
            <p className="text-slate-300 leading-relaxed">
              Automated scripts, headless browsers, VPN fraud, or fast-forwarding videos will trigger anti-fraud velocity flags and result in account suspension. Please complete tasks honestly.
            </p>
          </div>
        </div>

        {/* Action */}
        <div className="text-center pt-4">
          <Link
            to="/register"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl text-white font-bold text-base shadow-xl transition-all hover:scale-105 active:scale-95"
            style={{
              background: 'var(--theme-gradient-brand)',
              boxShadow: 'var(--theme-glow)'
            }}
          >
            <span>Create Your Free Account Now</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HowItWorksPage;
