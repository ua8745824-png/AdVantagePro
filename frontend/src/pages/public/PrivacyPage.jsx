import React from 'react';

const PrivacyPage = () => {
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
            Privacy & Data Security
          </span>
          <h1 className="font-heading font-black text-3xl sm:text-4xl text-slate-100">
            Privacy <span className="text-gradient-brand">Policy</span>
          </h1>
          <p className="text-xs text-slate-400">Last updated: September 2026</p>
        </div>

        <div 
          className="p-8 rounded-3xl glass-card space-y-6 text-sm text-slate-300"
          style={{ background: 'var(--theme-bg-surface)' }}
        >
          <section className="space-y-2">
            <h3 className="text-lg font-bold text-slate-100 font-heading">1. Information We Collect</h3>
            <p className="leading-relaxed">
              We collect information necessary to deliver our services, including your name, email address, phone number, payment details (for withdrawal processing), and session completion metadata (timestamp, IP address, user-agent for fraud prevention).
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="text-lg font-bold text-slate-100 font-heading">2. How We Use Information</h3>
            <p className="leading-relaxed">
              Your information is used to authenticate sessions, calculate and credit task rewards, process deposits and payouts, respond to support inquiries, and protect against bot traffic.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="text-lg font-bold text-slate-100 font-heading">3. Data Protection & Encryption</h3>
            <p className="leading-relaxed">
              All traffic between your browser and NOVYRA is encrypted using TLS 1.3. Passwords and sensitive session hashes are protected with industry-standard cryptographic algorithms.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="text-lg font-bold text-slate-100 font-heading">4. Contacting the Privacy Officer</h3>
            <p className="leading-relaxed">
              If you have inquiries regarding your personal data or wish to exercise data rights, reach us at privacy@novyra.internal.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPage;
