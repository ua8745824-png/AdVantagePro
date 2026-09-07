import React, { useState } from 'react';
import { Search, ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';

const FaqPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [openFaq, setOpenFaq] = useState(0);

  const allFaqs = [
    {
      category: 'General',
      q: 'What is NOVYRA?',
      a: 'NOVYRA is an international Watch & Earn platform that connects brand advertisers with users. Users earn real PKR rewards for viewing verified sponsor videos and completing interactive tasks.'
    },
    {
      category: 'General',
      q: 'Is registration completely free?',
      a: 'Yes, registration is 100% free. There are no mandatory upfront fees or subscription packages required to start earning rewards from sponsor tasks.'
    },
    {
      category: 'Earnings',
      q: 'How much can I earn per day?',
      a: 'Individual daily earnings depend on the number of active sponsor campaigns available, task difficulty, and daily user limits (e.g. up to 15 tasks/day). Earnings are performance-based and are not guaranteed fixed returns.'
    },
    {
      category: 'Earnings',
      q: 'How do referral commissions work?',
      a: 'You earn a 10% lifetime commission from eligible task rewards completed by users who register using your referral code. The commission is funded by the campaign allocation and is credited atomically to your balance.'
    },
    {
      category: 'Withdrawals',
      q: 'What is the minimum withdrawal limit and payout methods?',
      a: 'The minimum withdrawal is 500 PKR. You can withdraw directly to Easypaisa, JazzCash, 1Link Pakistani bank accounts, and USDT TRC20.'
    },
    {
      category: 'Withdrawals',
      q: 'How long does withdrawal processing take?',
      a: 'Most withdrawal requests are reviewed and processed by our finance team within 1 to 24 business hours.'
    },
    {
      category: 'Deposits',
      q: 'Why does NOVYRA have a deposit feature?',
      a: 'The deposit option allows advertisers to fund brand campaigns and users to utilize wallet services. Deposits are NOT investment schemes and do not yield interest or guaranteed ROI.'
    },
    {
      category: 'Security',
      q: 'What happens if I use bots, multiple accounts, or VPNs?',
      a: 'Our Anti-Fraud engine monitors session duration integrity and velocity anomalies. Violations lead to task rejection and permanent account suspension.'
    }
  ];

  const filteredFaqs = allFaqs.filter(
    (f) =>
      f.q.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.a.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen text-slate-100 py-16 sm:py-24 animate-fade-in" style={{ background: 'var(--theme-bg-main)' }}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-4">
          <span 
            className="text-xs font-bold uppercase tracking-widest px-3.5 py-1.5 rounded-full"
            style={{
              background: 'color-mix(in srgb, var(--theme-primary) 15%, transparent)',
              color: 'var(--theme-primary)',
              border: '1px solid color-mix(in srgb, var(--theme-primary) 30%, transparent)'
            }}
          >
            Help & Knowledge Base
          </span>
          <h1 className="font-heading font-black text-4xl sm:text-5xl text-slate-100 tracking-tight">
            Frequently Asked <span className="text-gradient-brand">Questions</span>
          </h1>
          <p className="text-base text-slate-300 max-w-xl mx-auto">
            Find immediate answers to common questions about rewards, withdrawals, and account safety.
          </p>

          {/* Search Input */}
          <div className="pt-4 max-w-md mx-auto relative">
            <Search className="w-5 h-5 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search topics (e.g., withdrawal, referral, tasks)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 rounded-2xl text-sm text-white placeholder-slate-500 focus:outline-none transition-colors shadow-inner"
              style={{
                background: 'var(--theme-bg-surface)',
                border: '1px solid var(--theme-border)'
              }}
            />
          </div>
        </div>

        {/* FAQ List */}
        <div className="space-y-4">
          {filteredFaqs.length > 0 ? (
            filteredFaqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="rounded-3xl glass-card overflow-hidden transition-all"
                  style={{
                    background: 'var(--theme-bg-surface)',
                    borderColor: isOpen ? 'color-mix(in srgb, var(--theme-primary) 50%, var(--theme-border))' : 'var(--theme-border)'
                  }}
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full p-6 text-left flex items-center justify-between gap-4 focus:outline-none"
                  >
                    <div className="flex items-center gap-3">
                      <span 
                        className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full"
                        style={{
                          background: 'var(--theme-bg-main)',
                          color: 'var(--theme-primary)',
                          border: '1px solid var(--theme-border)'
                        }}
                      >
                        {faq.category}
                      </span>
                      <span className="font-semibold text-slate-100 text-base">{faq.q}</span>
                    </div>
                    {isOpen ? (
                      <ChevronUp className="w-5 h-5 shrink-0" style={{ color: 'var(--theme-primary)' }} />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-slate-500 shrink-0" />
                    )}
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-6 text-sm text-slate-300 leading-relaxed border-t border-slate-800/60 pt-4">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div 
              className="text-center py-12 p-6 rounded-3xl glass-card text-slate-400"
              style={{ background: 'var(--theme-bg-surface)' }}
            >
              No matching questions found for "{searchTerm}".
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FaqPage;
