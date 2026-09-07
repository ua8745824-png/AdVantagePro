import React, { useState } from 'react';
import { Mail, MessageSquare, Phone, MapPin, Send, CheckCircle2 } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

const ContactPage = () => {
  const { success } = useToast();
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    success('Your inquiry has been received. Our team will get back to you shortly.');
  };

  return (
    <div className="min-h-screen text-slate-100 py-16 sm:py-24 animate-fade-in" style={{ background: 'var(--theme-bg-main)' }}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-4">
          <span 
            className="text-xs font-bold uppercase tracking-widest px-3.5 py-1.5 rounded-full"
            style={{
              background: 'color-mix(in srgb, var(--theme-primary) 15%, transparent)',
              color: 'var(--theme-primary)',
              border: '1px solid color-mix(in srgb, var(--theme-primary) 30%, transparent)'
            }}
          >
            Get In Touch
          </span>
          <h1 className="font-heading font-black text-4xl sm:text-5xl text-slate-100 tracking-tight">
            Contact Support & <span className="text-gradient-brand">Inquiries</span>
          </h1>
          <p className="text-base text-slate-300 max-w-xl mx-auto">
            Have questions about advertiser campaigns or technical assistance? Our support team is here to assist you.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Contact Details */}
          <div className="space-y-6">
            <div 
              className="p-6 rounded-3xl glass-card space-y-3 transition-all"
              style={{ background: 'var(--theme-bg-surface)' }}
            >
              <Mail className="w-6 h-6" style={{ color: 'var(--theme-primary)' }} />
              <h4 className="font-bold text-slate-100 text-base font-heading">Email Us</h4>
              <p className="text-xs text-slate-400">support@novyra.internal</p>
              <p className="text-xs text-slate-400">advertisers@novyra.internal</p>
            </div>

            <div 
              className="p-6 rounded-3xl glass-card space-y-3 transition-all"
              style={{ background: 'var(--theme-bg-surface)' }}
            >
              <MessageSquare className="w-6 h-6 text-emerald-400" />
              <h4 className="font-bold text-slate-100 text-base font-heading">In-Portal Ticket Desk</h4>
              <p className="text-xs text-slate-400">
                Registered users can open direct support tickets from their User Portal for fast priority resolution.
              </p>
            </div>

            <div 
              className="p-6 rounded-3xl glass-card space-y-3 transition-all"
              style={{ background: 'var(--theme-bg-surface)' }}
            >
              <MapPin className="w-6 h-6" style={{ color: 'var(--theme-secondary)' }} />
              <h4 className="font-bold text-slate-100 text-base font-heading">Regional Headquarters</h4>
              <p className="text-xs text-slate-400">
                Islamabad & Lahore Technology Parks, Pakistan
              </p>
            </div>
          </div>

          {/* Form */}
          <div 
            className="md:col-span-2 p-8 rounded-3xl glass-card"
            style={{ background: 'var(--theme-bg-surface)' }}
          >
            {submitted ? (
              <div className="py-12 text-center space-y-4">
                <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto animate-bounce" />
                <h3 className="text-2xl font-bold text-slate-100 font-heading">Thank You!</h3>
                <p className="text-sm text-slate-300 max-w-md mx-auto">
                  Your message has been safely delivered to our operations desk. We typically respond within a few hours.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="px-6 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-xs font-bold text-slate-200 hover:text-white transition-all"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Your Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ali Khan"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl text-sm text-white focus:outline-none"
                      style={{
                        background: 'var(--theme-bg-main)',
                        border: '1px solid var(--theme-border)'
                      }}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Email Address</label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. ali@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl text-sm text-white focus:outline-none"
                      style={{
                        background: 'var(--theme-bg-main)',
                        border: '1px solid var(--theme-border)'
                      }}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Subject</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Advertiser partnership inquiry"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl text-sm text-white focus:outline-none"
                    style={{
                      background: 'var(--theme-bg-main)',
                      border: '1px solid var(--theme-border)'
                    }}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Message</label>
                  <textarea
                    required
                    rows="5"
                    placeholder="Please provide details about your inquiry..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl text-sm text-white focus:outline-none"
                    style={{
                      background: 'var(--theme-bg-main)',
                      border: '1px solid var(--theme-border)'
                    }}
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl text-white font-bold text-sm shadow-lg transition-all flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-95"
                  style={{
                    background: 'var(--theme-gradient-brand)',
                    boxShadow: 'var(--theme-glow)'
                  }}
                >
                  <span>Send Message</span>
                  <Send className="w-4 h-4" />
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
