import React from 'react';
import { Link } from 'react-router-dom';
import NovyraLogo from '../common/NovyraLogo';
import { ShieldCheck, Lock, AlertCircle, Sparkles } from 'lucide-react';

const Footer = () => {
  return (
    <footer 
      className="border-t transition-colors duration-300"
      style={{ backgroundColor: 'var(--theme-bg-main)', borderColor: 'var(--theme-border)', color: 'var(--theme-text-secondary)' }}
    >
      {/* Ethical Compliance Banner */}
      <div 
        className="border-b py-4 px-4 sm:px-6 lg:px-8"
        style={{ borderColor: 'var(--theme-border)', backgroundColor: 'var(--theme-bg-surface)' }}
      >
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 shrink-0" style={{ color: 'var(--theme-primary)' }} />
            <span className="font-semibold" style={{ color: 'var(--theme-primary)' }}>Ethical & Transparent Platform Policy:</span>
            <span style={{ color: 'var(--theme-text-secondary)' }}>All tasks are sponsored by verified advertisers. Task rewards are strictly performance-based.</span>
          </div>
          <div className="flex items-center gap-2" style={{ color: 'var(--theme-text-muted)' }}>
            <AlertCircle className="w-4 h-4 shrink-0" style={{ color: 'var(--theme-secondary)' }} />
            <span>NOVYRA does NOT promise or guarantee fixed returns. Deposits are not financial investments.</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Column 1: Brand */}
          <div className="space-y-4 md:col-span-1">
            <Link to="/" className="flex items-center gap-3 group">
              <NovyraLogo className="w-9 h-9" />
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
            </Link>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--theme-text-secondary)' }}>
              International-grade Watch & Earn platform. Verifiable advertiser engagement, prompt PKR payouts, and zero hidden tricks.
            </p>
            <div className="flex items-center gap-2 text-xs font-medium" style={{ color: 'var(--theme-text-muted)' }}>
              <Lock className="w-3.5 h-3.5" style={{ color: 'var(--theme-primary)' }} />
              <span>TLS 1.3 Encrypted & LocalDB Ledger Backed</span>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--theme-text-primary)' }}>Platform</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="hover:opacity-80 transition-opacity">Home</Link></li>
              <li><Link to="/how-it-works" className="hover:opacity-80 transition-opacity">How It Works</Link></li>
              <li><Link to="/about" className="hover:opacity-80 transition-opacity">About Us</Link></li>
              <li><Link to="/faq" className="hover:opacity-80 transition-opacity">Frequently Asked Questions</Link></li>
              <li><Link to="/contact" className="hover:opacity-80 transition-opacity">Contact Support</Link></li>
            </ul>
          </div>

          {/* Column 3: Payment Rails */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--theme-text-primary)' }}>Supported Rails</h4>
            <ul className="space-y-2 text-sm" style={{ color: 'var(--theme-text-secondary)' }}>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--theme-primary)' }}></span>
                <span>Easypaisa (QR / Title Verification)</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--theme-secondary)' }}></span>
                <span>JazzCash (Instant Mobile Payouts)</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--theme-primary)' }}></span>
                <span>1Link & All Pakistan Banks (IBFT)</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--theme-secondary)' }}></span>
                <span>USDT TRC20 (Direct Crypto Settlement)</span>
              </li>
            </ul>
          </div>

          {/* Column 4: Legal & Fair Play */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--theme-text-primary)' }}>Fair Play & Legal</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/terms" className="hover:opacity-80 transition-opacity">Terms of Service</Link></li>
              <li><Link to="/privacy" className="hover:opacity-80 transition-opacity">Privacy Policy</Link></li>
              <li><span className="text-xs">Zero-Bot Detection Enforcement</span></li>
              <li><span className="text-xs">Strict Anti-Fraud & 1-Account Rule</span></li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div 
          className="mt-12 pt-8 border-t flex flex-col sm:flex-row items-center justify-between gap-4 text-xs"
          style={{ borderColor: 'var(--theme-border)', color: 'var(--theme-text-muted)' }}
        >
          <p>© {new Date().getFullYear()} NOVYRA Platform. All rights reserved.</p>
          <p className="flex items-center gap-2">
            <span>Built with integrity for genuine audience attention.</span>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
