import React from 'react';
import { Shield, Target, Award, HeartHandshake, Eye, CheckCircle } from 'lucide-react';

const AboutPage = () => {
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
            About NOVYRA
          </span>
          <h1 className="font-heading font-black text-4xl sm:text-5xl text-slate-100 tracking-tight">
            Connecting Verified Attention with <span className="text-gradient-brand">Real Rewards</span>
          </h1>
          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            NOVYRA is built to bridge digital advertisers with active audiences across Pakistan and international markets through fair, verifiable engagement.
          </p>
        </div>

        {/* Vision & Mission */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div 
            className="p-8 rounded-3xl glass-card space-y-4 transition-all"
            style={{ background: 'var(--theme-bg-surface)' }}
          >
            <div 
              className="w-12 h-12 rounded-2xl flex items-center justify-center"
              style={{
                background: 'color-mix(in srgb, var(--theme-primary) 15%, transparent)',
                color: 'var(--theme-primary)',
                border: '1px solid color-mix(in srgb, var(--theme-primary) 30%, transparent)'
              }}
            >
              <Eye className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-100 font-heading">Our Vision</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              To establish a clean, ethical advertising ecosystem where users are respected for their time and attention, and brands obtain measurable consumer impressions without fraudulent bot traffic.
            </p>
          </div>

          <div 
            className="p-8 rounded-3xl glass-card space-y-4 transition-all"
            style={{ background: 'var(--theme-bg-surface)' }}
          >
            <div 
              className="w-12 h-12 rounded-2xl flex items-center justify-center"
              style={{
                background: 'color-mix(in srgb, var(--theme-secondary) 15%, transparent)',
                color: 'var(--theme-secondary)',
                border: '1px solid color-mix(in srgb, var(--theme-secondary) 30%, transparent)'
              }}
            >
              <Target className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-100 font-heading">Our Mission</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Empower people with a transparent mechanism to earn supplementary income online while providing Pakistani and global merchants with verifiable interactive campaign reach.
            </p>
          </div>
        </div>

        {/* Core Principles */}
        <div className="space-y-8">
          <h2 className="text-2xl font-bold text-slate-100 text-center font-heading">
            Our Core Principles
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div 
              className="p-6 rounded-3xl glass-card"
              style={{ background: 'var(--theme-bg-surface)' }}
            >
              <Shield className="w-8 h-8 text-emerald-400 mb-3" />
              <h4 className="font-bold text-slate-100 text-base font-heading">Ethical Transparency</h4>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                No unrealistic ROI promises. No deceptive investment schemes. All rewards are backed by actual advertiser budget allocations.
              </p>
            </div>

            <div 
              className="p-6 rounded-3xl glass-card"
              style={{ background: 'var(--theme-bg-surface)' }}
            >
              <Award className="w-8 h-8 text-amber-400 mb-3" />
              <h4 className="font-bold text-slate-100 text-base font-heading">Cryptographic Fairness</h4>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Every task completion is cryptographically timed and validated server-side to maintain a level playing field for everyone.
              </p>
            </div>

            <div 
              className="p-6 rounded-3xl glass-card"
              style={{ background: 'var(--theme-bg-surface)' }}
            >
              <HeartHandshake className="w-8 h-8 mb-3" style={{ color: 'var(--theme-primary)' }} />
              <h4 className="font-bold text-slate-100 text-base font-heading">Reliable Settlements</h4>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Funds are reserved upon withdrawal request and promptly paid through trusted Pakistani rails like Easypaisa, JazzCash, and Banks.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
