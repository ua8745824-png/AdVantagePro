import React from 'react';

const TermsPage = () => {
  return (
    <div className="min-h-screen text-slate-100 py-16 sm:py-24 animate-fade-in" style={{ background: 'var(--theme-bg-main)' }}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 leading-relaxed">
        <div className="space-y-3">
          <span 
            className="text-xs font-bold uppercase tracking-widest px-3.5 py-1.5 rounded-full"
            style={{
              background: 'color-mix(in srgb, var(--theme-primary) 15%, transparent)',
              color: 'var(--theme-primary)',
              border: '1px solid color-mix(in srgb, var(--theme-primary) 30%, transparent)'
            }}
          >
            Legal & Governance
          </span>
          <h1 className="font-heading font-black text-3xl sm:text-4xl text-slate-100">
            Terms of Service & <span className="text-gradient-brand">Earning Disclaimer</span>
          </h1>
          <p className="text-xs text-slate-400">Last updated: September 2026</p>
        </div>

        <div className="p-6 rounded-3xl bg-amber-950/20 border border-amber-500/30 text-amber-200 text-sm space-y-2">
          <h3 className="font-bold text-base text-amber-300 font-heading">Mandatory Earning & Deposit Disclaimer</h3>
          <p className="leading-relaxed">
            NOVYRA is an advertising engagement reward portal. NOVYRA is NOT an investment company, financial institution, or guaranteed high-yield program. Task rewards are strictly tied to completed advertiser campaigns. Deposits are non-interest-bearing utility funds and MUST NOT be construed as financial investments.
          </p>
        </div>

        <div 
          className="p-8 rounded-3xl glass-card space-y-6 text-sm text-slate-300"
          style={{ background: 'var(--theme-bg-surface)' }}
        >
          <section className="space-y-2">
            <h3 className="text-lg font-bold text-slate-100 font-heading">1. Eligibility & Registration</h3>
            <p className="leading-relaxed">
              Users must be at least 18 years of age. Each individual is permitted to register and operate exactly one account. Creating multiple accounts or operating shared accounts is strictly prohibited.
            </p>
          </section>

          <section id="anti-fraud" className="space-y-2">
            <h3 className="text-lg font-bold text-slate-100 font-heading">2. Anti-Fraud & Fair Use Rules</h3>
            <p className="leading-relaxed">
              Any attempt to manipulate task duration timers, utilize automated macro scripts, emulators, proxy servers, or bots constitutes a violation of these terms. NOVYRA reserves the right to withhold rewards and permanently suspend accounts engaged in abusive practices.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="text-lg font-bold text-slate-100 font-heading">3. Referral System Conduct</h3>
            <p className="leading-relaxed">
              Referral commissions (10%) are earned strictly upon eligible sponsored task completions by referred users. Spamming referral links or misleading prospective users with fake earning guarantees is strictly forbidden.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="text-lg font-bold text-slate-100 font-heading">4. Withdrawals & Settlements</h3>
            <p className="leading-relaxed">
              Withdrawals are subject to minimum balance limits (500 PKR) and verification of payout account titles. NOVYRA is not responsible for losses resulting from user-provided inaccurate account numbers or blockchain addresses.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TermsPage;
