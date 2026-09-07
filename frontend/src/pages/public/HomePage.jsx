import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { 
  PlayCircle, CheckCircle, Wallet, ArrowRight, ShieldCheck, 
  TrendingUp, Users, Award, HelpCircle, ChevronDown, ChevronUp,
  Sparkles, Smartphone, Check, Zap, AlertCircle 
} from 'lucide-react';

const HomePage = () => {
  const { t } = useLanguage();
  const { theme } = useTheme();

  // Calculator State (ESTIMATE ONLY)
  const [dailyTasksCount, setDailyTasksCount] = useState(8);
  const [avgTaskReward, setAvgTaskReward] = useState(15);
  const [referralCount, setReferralCount] = useState(5);

  // FAQ Accordion State
  const [openFaq, setOpenFaq] = useState(null);

  // Calculations
  const dailyDirectEst = dailyTasksCount * avgTaskReward;
  const monthlyDirectEst = dailyDirectEst * 30;
  const monthlyReferralEst = referralCount * 8 * 15 * 0.10 * 30; // 10% commission
  const totalMonthlyEst = monthlyDirectEst + monthlyReferralEst;

  const faqs = [
    {
      q: 'How does NOVYRA generate funds for user rewards?',
      a: 'NOVYRA partners with verified digital advertisers, brands, and content publishers who allocate advertising budgets. When you watch verified videos or complete sponsored tasks, advertisers pay the platform, and a direct reward portion is credited to your wallet balance.'
    },
    {
      q: 'Are task rewards or profits guaranteed?',
      a: 'No. NOVYRA does not promise fixed returns or guaranteed profits. Earnings are strictly performance-based depending on available sponsor campaigns, task duration, and successful completion according to fair-use rules.'
    },
    {
      q: 'What is the minimum withdrawal threshold?',
      a: 'The minimum withdrawal is 500 PKR. Payouts are supported via Easypaisa, JazzCash, all Pakistani bank accounts (1Link/IBFT), and USDT TRC20.'
    },
    {
      q: 'How does the referral program work?',
      a: 'When you invite friends using your unique referral code, you earn a 10% commission on the rewards they earn upon completing eligible sponsored tasks. Referral commission is strictly funded from advertiser campaign allocations.'
    },
    {
      q: 'Is there a limit on daily task completions?',
      a: 'Yes. To protect advertiser authenticity and ensure platform sustainability, each user has a default daily limit of 15 tasks and a daily earning cap (e.g. 500 PKR/day).'
    }
  ];

  return (
    <div 
      className="flex flex-col min-h-screen transition-colors duration-300 overflow-hidden"
      style={{ backgroundColor: 'var(--theme-bg-main)', color: 'var(--theme-text-primary)' }}
    >
      {/* 1. HERO SECTION */}
      <section className="relative pt-16 pb-24 lg:pt-24 lg:pb-32 overflow-hidden">
        {/* Ambient Glows */}
        <div 
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[650px] h-[350px] blur-[140px] rounded-full pointer-events-none opacity-25" 
          style={{ background: 'var(--theme-gradient-brand)' }}
        />
        <div 
          className="absolute top-1/3 -right-40 w-96 h-96 blur-[120px] rounded-full pointer-events-none opacity-20" 
          style={{ backgroundColor: 'var(--theme-secondary)' }}
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Badge */}
          <div 
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs font-semibold backdrop-blur-md mb-8 animate-fade-in"
            style={{
              borderColor: 'var(--theme-border-highlight)',
              backgroundColor: 'var(--theme-bg-surface)',
              color: 'var(--theme-primary)'
            }}
          >
            <Sparkles className="w-3.5 h-3.5" style={{ color: 'var(--theme-primary)' }} />
            <span>Next-Gen Transparent Watch & Earn Platform</span>
          </div>

          {/* Heading */}
          <h1 className="font-heading font-black text-4xl sm:text-6xl lg:text-7xl tracking-tight max-w-4xl mx-auto leading-[1.1]" style={{ color: 'var(--theme-text-primary)' }}>
            Engage with Brands.{' '}
            <span 
              style={{
                background: 'var(--theme-gradient-brand)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              Earn Verifiable Rewards.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mt-6 text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed" style={{ color: 'var(--theme-text-secondary)' }}>
            Watch verified sponsored content, complete interactive brand surveys, and receive real PKR payouts directly to Easypaisa, JazzCash, or Bank Account.
          </p>

          {/* CTA Group */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/register"
              className="w-full sm:w-auto px-8 py-4 rounded-xl text-white font-bold text-base shadow-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
              style={{
                background: 'var(--theme-gradient-brand)',
                boxShadow: 'var(--theme-glow)'
              }}
            >
              <span>Create Free Account</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/how-it-works"
              className="w-full sm:w-auto px-8 py-4 rounded-xl border font-bold text-base backdrop-blur-md transition-all flex items-center justify-center gap-2 hover:scale-[1.02]"
              style={{
                borderColor: 'var(--theme-border)',
                backgroundColor: 'var(--theme-bg-surface)',
                color: 'var(--theme-text-primary)'
              }}
            >
              <span>How It Works</span>
            </Link>
          </div>

          {/* Quick Metrics Bar */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div 
              className="p-5 rounded-2xl border backdrop-blur-xl transition-transform hover:scale-105"
              style={{ backgroundColor: 'var(--theme-bg-surface)', borderColor: 'var(--theme-border)' }}
            >
              <p className="text-2xl font-black font-heading" style={{ color: 'var(--theme-text-primary)' }}>500+ PKR</p>
              <p className="text-xs font-medium mt-0.5" style={{ color: 'var(--theme-text-secondary)' }}>Min Payout Threshold</p>
            </div>
            <div 
              className="p-5 rounded-2xl border backdrop-blur-xl transition-transform hover:scale-105"
              style={{ backgroundColor: 'var(--theme-bg-surface)', borderColor: 'var(--theme-border)' }}
            >
              <p className="text-2xl font-black font-heading" style={{ color: 'var(--theme-primary)' }}>10%</p>
              <p className="text-xs font-medium mt-0.5" style={{ color: 'var(--theme-text-secondary)' }}>Referral Commission</p>
            </div>
            <div 
              className="p-5 rounded-2xl border backdrop-blur-xl transition-transform hover:scale-105"
              style={{ backgroundColor: 'var(--theme-bg-surface)', borderColor: 'var(--theme-border)' }}
            >
              <p className="text-2xl font-black font-heading" style={{ color: 'var(--theme-secondary)' }}>100%</p>
              <p className="text-xs font-medium mt-0.5" style={{ color: 'var(--theme-text-secondary)' }}>Verified Advertisers</p>
            </div>
            <div 
              className="p-5 rounded-2xl border backdrop-blur-xl transition-transform hover:scale-105"
              style={{ backgroundColor: 'var(--theme-bg-surface)', borderColor: 'var(--theme-border)' }}
            >
              <p className="text-2xl font-black font-heading" style={{ color: 'var(--theme-primary)' }}>0 PKR</p>
              <p className="text-xs font-medium mt-0.5" style={{ color: 'var(--theme-text-secondary)' }}>Joining Fee (Free)</p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. HOW IT WORKS (3-STEP PROCESS) */}
      <section 
        className="py-20 border-y relative"
        style={{ borderColor: 'var(--theme-border)', backgroundColor: 'var(--theme-bg-surface)' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="font-heading text-xs uppercase tracking-widest font-bold" style={{ color: 'var(--theme-primary)' }}>
              Simple & Transparent
            </h2>
            <p className="font-heading font-black text-3xl sm:text-4xl mt-2" style={{ color: 'var(--theme-text-primary)' }}>
              Three Steps to Complete & Earn
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div 
              className="relative p-8 rounded-2xl border transition-all duration-300 group hover:scale-[1.02]"
              style={{
                backgroundColor: 'var(--theme-bg-elevated)',
                borderColor: 'var(--theme-border)'
              }}
            >
              <div 
                className="w-14 h-14 rounded-xl flex items-center justify-center text-xl font-black mb-6 group-hover:scale-110 transition-transform shadow-md"
                style={{
                  backgroundColor: 'rgba(var(--theme-primary-rgb), 0.1)',
                  color: 'var(--theme-primary)',
                  borderColor: 'var(--theme-border-highlight)'
                }}
              >
                <PlayCircle className="w-7 h-7" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--theme-primary)' }}>Step 01</span>
              <h3 className="text-xl font-bold mt-1" style={{ color: 'var(--theme-text-primary)' }}>Watch & Interact</h3>
              <p className="text-sm mt-2 leading-relaxed" style={{ color: 'var(--theme-text-secondary)' }}>
                Select from verified brand videos, sponsor advertisements, or partner surveys. Watch for the designated timer duration.
              </p>
            </div>

            {/* Step 2 */}
            <div 
              className="relative p-8 rounded-2xl border transition-all duration-300 group hover:scale-[1.02]"
              style={{
                backgroundColor: 'var(--theme-bg-elevated)',
                borderColor: 'var(--theme-border)'
              }}
            >
              <div 
                className="w-14 h-14 rounded-xl flex items-center justify-center text-xl font-black mb-6 group-hover:scale-110 transition-transform shadow-md"
                style={{
                  backgroundColor: 'rgba(var(--theme-secondary-rgb), 0.1)',
                  color: 'var(--theme-secondary)',
                  borderColor: 'var(--theme-border-highlight)'
                }}
              >
                <CheckCircle className="w-7 h-7" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--theme-secondary)' }}>Step 02</span>
              <h3 className="text-xl font-bold mt-1" style={{ color: 'var(--theme-text-primary)' }}>Claim Reward</h3>
              <p className="text-sm mt-2 leading-relaxed" style={{ color: 'var(--theme-text-secondary)' }}>
                The cryptographic verification token confirms your completed session, instantly crediting the task reward to your wallet.
              </p>
            </div>

            {/* Step 3 */}
            <div 
              className="relative p-8 rounded-2xl border transition-all duration-300 group hover:scale-[1.02]"
              style={{
                backgroundColor: 'var(--theme-bg-elevated)',
                borderColor: 'var(--theme-border)'
              }}
            >
              <div 
                className="w-14 h-14 rounded-xl flex items-center justify-center text-xl font-black mb-6 group-hover:scale-110 transition-transform shadow-md"
                style={{
                  backgroundColor: 'rgba(var(--theme-primary-rgb), 0.1)',
                  color: 'var(--theme-primary)',
                  borderColor: 'var(--theme-border-highlight)'
                }}
              >
                <Wallet className="w-7 h-7" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--theme-primary)' }}>Step 03</span>
              <h3 className="text-xl font-bold mt-1" style={{ color: 'var(--theme-text-primary)' }}>Withdraw to Account</h3>
              <p className="text-sm mt-2 leading-relaxed" style={{ color: 'var(--theme-text-secondary)' }}>
                Request payouts to Easypaisa, JazzCash, Pakistani Bank Accounts, or USDT once you reach the 500 PKR threshold.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. ESTIMATED EARNINGS CALCULATOR */}
      <section className="py-20 relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div 
            className="p-8 sm:p-12 rounded-3xl border shadow-2xl backdrop-blur-xl"
            style={{
              backgroundColor: 'var(--theme-bg-surface)',
              borderColor: 'var(--theme-border)',
              boxShadow: 'var(--theme-glow)'
            }}
          >
            <div className="text-center max-w-xl mx-auto mb-10">
              <div 
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold mb-3"
                style={{
                  borderColor: 'var(--theme-border-highlight)',
                  backgroundColor: 'rgba(var(--theme-primary-rgb), 0.1)',
                  color: 'var(--theme-primary)'
                }}
              >
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Simulated Potential Estimate (Not a Guarantee)</span>
              </div>
              <h2 className="font-heading font-black text-2xl sm:text-3xl" style={{ color: 'var(--theme-text-primary)' }}>
                Interactive Earnings Calculator
              </h2>
              <p className="text-xs mt-2" style={{ color: 'var(--theme-text-secondary)' }}>
                Estimate how much you could earn based on active participation and referral engagement.
              </p>
            </div>

            {/* Sliders */}
            <div className="space-y-6">
              {/* Slider 1: Daily Tasks */}
              <div>
                <div className="flex justify-between items-center text-sm font-semibold mb-2">
                  <span style={{ color: 'var(--theme-text-secondary)' }}>Daily Tasks Completed:</span>
                  <span className="font-bold" style={{ color: 'var(--theme-primary)' }}>{dailyTasksCount} Tasks / Day</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="15"
                  value={dailyTasksCount}
                  onChange={(e) => setDailyTasksCount(Number(e.target.value))}
                  className="w-full h-2 rounded-lg cursor-pointer accent-indigo-500"
                  style={{ backgroundColor: 'var(--theme-bg-elevated)' }}
                />
              </div>

              {/* Slider 2: Avg Reward per task */}
              <div>
                <div className="flex justify-between items-center text-sm font-semibold mb-2">
                  <span style={{ color: 'var(--theme-text-secondary)' }}>Average Reward per Task:</span>
                  <span className="font-bold" style={{ color: 'var(--theme-primary)' }}>{avgTaskReward} PKR</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="50"
                  step="5"
                  value={avgTaskReward}
                  onChange={(e) => setAvgTaskReward(Number(e.target.value))}
                  className="w-full h-2 rounded-lg cursor-pointer accent-indigo-500"
                  style={{ backgroundColor: 'var(--theme-bg-elevated)' }}
                />
              </div>

              {/* Slider 3: Active Referrals */}
              <div>
                <div className="flex justify-between items-center text-sm font-semibold mb-2">
                  <span style={{ color: 'var(--theme-text-secondary)' }}>Active Friends Referred:</span>
                  <span className="font-bold" style={{ color: 'var(--theme-secondary)' }}>{referralCount} Friends (10% Comm.)</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="50"
                  value={referralCount}
                  onChange={(e) => setReferralCount(Number(e.target.value))}
                  className="w-full h-2 rounded-lg cursor-pointer accent-blue-500"
                  style={{ backgroundColor: 'var(--theme-bg-elevated)' }}
                />
              </div>
            </div>

            {/* Calculation Output Box */}
            <div 
              className="mt-10 p-6 rounded-2xl border grid grid-cols-1 sm:grid-cols-3 gap-6 text-center"
              style={{
                backgroundColor: 'var(--theme-bg-elevated)',
                borderColor: 'var(--theme-border-highlight)'
              }}
            >
              <div>
                <p className="text-xs font-medium" style={{ color: 'var(--theme-text-secondary)' }}>Estimated Daily Earnings</p>
                <p className="text-2xl font-black font-heading mt-1" style={{ color: 'var(--theme-text-primary)' }}>
                  ~{dailyDirectEst.toLocaleString()} PKR
                </p>
              </div>
              <div>
                <p className="text-xs font-medium" style={{ color: 'var(--theme-text-secondary)' }}>Referral Commission (30d)</p>
                <p className="text-2xl font-black font-heading mt-1" style={{ color: 'var(--theme-secondary)' }}>
                  ~{Math.round(monthlyReferralEst).toLocaleString()} PKR
                </p>
              </div>
              <div>
                <p className="text-xs font-medium" style={{ color: 'var(--theme-text-secondary)' }}>Estimated Monthly Total</p>
                <p className="text-2xl font-black font-heading mt-1" style={{ color: 'var(--theme-primary)' }}>
                  ~{Math.round(totalMonthlyEst).toLocaleString()} PKR
                </p>
              </div>
            </div>

            <p className="text-[11px] text-center mt-4" style={{ color: 'var(--theme-text-muted)' }}>
              * Note: Calculations above are strictly illustrative simulations. Actual reward volume varies with advertiser availability, session quality, and daily limits.
            </p>
          </div>
        </div>
      </section>

      {/* 4. TRUST, COMPLIANCE & TRANSPARENCY */}
      <section 
        className="py-20 border-t"
        style={{ borderColor: 'var(--theme-border)', backgroundColor: 'var(--theme-bg-surface)' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="font-heading text-xs uppercase tracking-widest font-bold" style={{ color: 'var(--theme-primary)' }}>
              Built on Trust & Integrity
            </h2>
            <p className="font-heading font-black text-3xl sm:text-4xl mt-2" style={{ color: 'var(--theme-text-primary)' }}>
              Why Users & Advertisers Choose NOVYRA
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div 
              className="p-6 rounded-2xl border transition-all hover:scale-[1.02]"
              style={{ backgroundColor: 'var(--theme-bg-elevated)', borderColor: 'var(--theme-border)' }}
            >
              <ShieldCheck className="w-8 h-8 mb-4" style={{ color: 'var(--theme-primary)' }} />
              <h4 className="text-base font-bold" style={{ color: 'var(--theme-text-primary)' }}>Cryptographic Sessions</h4>
              <p className="text-xs mt-2 leading-relaxed" style={{ color: 'var(--theme-text-secondary)' }}>
                Task sessions utilize single-use nonces and server-side duration auditing to ensure genuine brand attention.
              </p>
            </div>

            <div 
              className="p-6 rounded-2xl border transition-all hover:scale-[1.02]"
              style={{ backgroundColor: 'var(--theme-bg-elevated)', borderColor: 'var(--theme-border)' }}
            >
              <Wallet className="w-8 h-8 mb-4" style={{ color: 'var(--theme-secondary)' }} />
              <h4 className="text-base font-bold" style={{ color: 'var(--theme-text-primary)' }}>Immutable Ledger</h4>
              <p className="text-xs mt-2 leading-relaxed" style={{ color: 'var(--theme-text-secondary)' }}>
                All balance transactions are double-entry recorded with optimistic concurrency tokens to prevent balance discrepancies.
              </p>
            </div>

            <div 
              className="p-6 rounded-2xl border transition-all hover:scale-[1.02]"
              style={{ backgroundColor: 'var(--theme-bg-elevated)', borderColor: 'var(--theme-border)' }}
            >
              <Smartphone className="w-8 h-8 mb-4" style={{ color: 'var(--theme-primary)' }} />
              <h4 className="text-base font-bold" style={{ color: 'var(--theme-text-primary)' }}>Pakistan-First Rails</h4>
              <p className="text-xs mt-2 leading-relaxed" style={{ color: 'var(--theme-text-secondary)' }}>
                Direct integration with Easypaisa, JazzCash, 1Link banking, and USDT TRC20 for fast local settlements.
              </p>
            </div>

            <div 
              className="p-6 rounded-2xl border transition-all hover:scale-[1.02]"
              style={{ backgroundColor: 'var(--theme-bg-elevated)', borderColor: 'var(--theme-border)' }}
            >
              <Users className="w-8 h-8 mb-4" style={{ color: 'var(--theme-secondary)' }} />
              <h4 className="text-base font-bold" style={{ color: 'var(--theme-text-primary)' }}>10% Referral Share</h4>
              <p className="text-xs mt-2 leading-relaxed" style={{ color: 'var(--theme-text-secondary)' }}>
                Earn transparent 10% lifetime commissions from your friends' task completions, funded directly by advertisers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. FAQ ACCORDION */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-12">
            <h2 className="font-heading font-black text-3xl sm:text-4xl" style={{ color: 'var(--theme-text-primary)' }}>
              Frequently Asked Questions
            </h2>
            <p className="text-sm mt-2" style={{ color: 'var(--theme-text-secondary)' }}>
              Everything you need to know about the platform, earnings, and safety rules.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div
                  key={index}
                  className="rounded-2xl border overflow-hidden transition-colors"
                  style={{
                    backgroundColor: 'var(--theme-bg-surface)',
                    borderColor: 'var(--theme-border)'
                  }}
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    className="w-full p-6 text-left flex items-center justify-between gap-4 focus:outline-none"
                  >
                    <span className="font-semibold text-base" style={{ color: 'var(--theme-text-primary)' }}>{faq.q}</span>
                    {isOpen ? (
                      <ChevronUp className="w-5 h-5 shrink-0" style={{ color: 'var(--theme-primary)' }} />
                    ) : (
                      <ChevronDown className="w-5 h-5 shrink-0" style={{ color: 'var(--theme-text-secondary)' }} />
                    )}
                  </button>
                  {isOpen && (
                    <div 
                      className="px-6 pb-6 text-sm leading-relaxed border-t pt-4"
                      style={{
                        borderColor: 'var(--theme-border)',
                        color: 'var(--theme-text-secondary)'
                      }}
                    >
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 6. BOTTOM CTA */}
      <section 
        className="py-20 relative border-t"
        style={{
          borderColor: 'var(--theme-border)',
          background: 'linear-gradient(180deg, var(--theme-bg-main) 0%, var(--theme-bg-surface) 100%)'
        }}
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-heading font-black text-3xl sm:text-5xl tracking-tight" style={{ color: 'var(--theme-text-primary)' }}>
            Ready to Start Watching and Earning?
          </h2>
          <p className="mt-4 text-base sm:text-lg max-w-xl mx-auto" style={{ color: 'var(--theme-text-secondary)' }}>
            Join thousands of active users today. Registration takes less than 60 seconds.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/register"
              className="w-full sm:w-auto px-8 py-4 rounded-xl text-white font-bold text-base shadow-xl transition-all hover:scale-105"
              style={{
                background: 'var(--theme-gradient-brand)',
                boxShadow: 'var(--theme-glow)'
              }}
            >
              Get Started for Free
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
