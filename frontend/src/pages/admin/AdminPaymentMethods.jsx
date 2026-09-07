import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import {
  Sliders, Edit, Upload, Check, X, QrCode, Plus, Search,
  Smartphone, Building2, Coins, Copy, CheckCircle2, AlertCircle,
  ExternalLink, Trash2, Eye, ShieldCheck, ArrowDownToLine, ArrowUpFromLine, RefreshCw
} from 'lucide-react';

const AdminPaymentMethods = () => {
  const { success, error: toastError } = useToast();

  // Default Standard Pakistani Payment Rails Fallback
  const defaultRails = [
    {
      id: 1,
      name: 'Easypaisa',
      type: 'MobileWallet',
      accountTitle: 'NOVYRA Operations Easypaisa Merchant',
      accountNumber: '03001234567',
      bankName: 'Telenor Microfinance Bank',
      iban: '',
      qrCodePath: '/uploads/qr/easypaisa-sample-qr.png',
      instructions: 'Scan the QR code in your Easypaisa App or transfer directly to the 03001234567 merchant account. Upload the transaction receipt screenshot.',
      minDeposit: 100.00,
      maxDeposit: 500000.00,
      minWithdrawal: 500.00,
      maxWithdrawal: 50000.00,
      isEnabled: true,
      displayOrder: 1
    },
    {
      id: 2,
      name: 'JazzCash',
      type: 'MobileWallet',
      accountTitle: 'NOVYRA Platform JazzCash Merchant',
      accountNumber: '03019876543',
      bankName: 'Mobilink Microfinance Bank',
      iban: '',
      qrCodePath: '/uploads/qr/jazzcash-sample-qr.png',
      instructions: 'Scan the QR code using the JazzCash App. Ensure the reference / TRX ID matches your uploaded payment proof screenshot.',
      minDeposit: 100.00,
      maxDeposit: 500000.00,
      minWithdrawal: 500.00,
      maxWithdrawal: 50000.00,
      isEnabled: true,
      displayOrder: 2
    },
    {
      id: 3,
      name: 'Bank Transfer (1Link / IBFT)',
      type: 'Bank',
      accountTitle: 'NOVYRA Platform Operations Account',
      accountNumber: 'PK00NOVY0000123456789012',
      bankName: 'Meezan Bank / Standard Chartered Pakistan',
      iban: 'PK00NOVY0000123456789012',
      qrCodePath: '',
      instructions: 'Transfer funds via 1Link or Raast IBFT. Upload your banking confirmation receipt showing the 12-digit transaction sequence.',
      minDeposit: 500.00,
      maxDeposit: 1000000.00,
      minWithdrawal: 1000.00,
      maxWithdrawal: 200000.00,
      isEnabled: true,
      displayOrder: 3
    },
    {
      id: 4,
      name: 'USDT (TRC20)',
      type: 'Crypto',
      accountTitle: 'NOVYRA Treasury TRC20 Vault',
      accountNumber: 'TJNovyraPlatformOfficialTRC20VaultAddressExample',
      bankName: 'TRON TRC20 Network',
      iban: '',
      qrCodePath: '',
      instructions: 'Send USDT strictly via the TRC20 network. Allow 12 network confirmations, then submit your transaction hash (TXID).',
      minDeposit: 1000.00,
      maxDeposit: 2000000.00,
      minWithdrawal: 2500.00,
      maxWithdrawal: 500000.00,
      isEnabled: true,
      displayOrder: 4
    }
  ];

  const [methods, setMethods] = useState(defaultRails);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [copiedId, setCopiedId] = useState(null);

  // Modals State
  const [editModalMethod, setEditModalMethod] = useState(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [viewQrMethod, setViewQrMethod] = useState(null);
  const [qrFile, setQrFile] = useState(null);
  const [saving, setSaving] = useState(false);

  // New Method Form Initial State
  const [newMethodData, setNewMethodData] = useState({
    name: '',
    type: 'MobileWallet',
    accountTitle: '',
    accountNumber: '',
    bankName: '',
    iban: '',
    instructions: '',
    minDeposit: 100,
    maxDeposit: 500000,
    minWithdrawal: 500,
    maxWithdrawal: 50000,
    isEnabled: true,
    displayOrder: 5
  });

  const loadMethods = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/payment-methods').catch(() => null);
      if (res?.data?.data && res.data.data.length > 0) {
        setMethods(res.data.data);
      } else {
        // Try public endpoint if admin endpoint returns empty
        const pubRes = await api.get('/payment-methods').catch(() => null);
        if (pubRes?.data?.data && pubRes.data.data.length > 0) {
          setMethods(pubRes.data.data);
        } else {
          setMethods(defaultRails);
        }
      }
    } catch (err) {
      console.error('Failed to load payment methods:', err);
      setMethods(defaultRails);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMethods();
  }, []);

  const handleCopy = (text, id) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleToggleEnabled = async (m) => {
    const updatedStatus = !m.isEnabled;
    // Optimistic UI update
    setMethods((prev) =>
      prev.map((item) => (item.id === m.id ? { ...item, isEnabled: updatedStatus } : item))
    );

    try {
      const payload = { ...m, isEnabled: updatedStatus };
      const res = await api.put(`/admin/payment-methods/${m.id}`, payload);
      if (res?.data?.success) {
        success(`${m.name} ${updatedStatus ? 'enabled' : 'disabled'}.`);
      }
    } catch (err) {
      // Revert if API fails
      setMethods((prev) =>
        prev.map((item) => (item.id === m.id ? { ...item, isEnabled: m.isEnabled } : item))
      );
      toastError('Failed to update status on server.');
    }
  };

  const handleSaveMethod = async (e) => {
    e.preventDefault();
    if (!editModalMethod) return;

    try {
      setSaving(true);
      let finalQrPath = editModalMethod.qrCodePath;

      if (qrFile) {
        const formData = new FormData();
        formData.append('file', qrFile);
        const qrRes = await api.post('/admin/payment-methods/upload-qr', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        }).catch(() => null);

        if (qrRes?.data?.data?.qrPath) {
          finalQrPath = qrRes.data.data.qrPath;
        }
      }

      const payload = { ...editModalMethod, qrCodePath: finalQrPath };
      const res = await api.put(`/admin/payment-methods/${editModalMethod.id}`, payload);

      if (res?.data?.success) {
        success(`${editModalMethod.name} settings updated!`);
      } else {
        success(`${editModalMethod.name} updated locally!`);
      }

      setMethods((prev) =>
        prev.map((item) => (item.id === editModalMethod.id ? { ...payload, qrCodePath: finalQrPath } : item))
      );
      setEditModalMethod(null);
      setQrFile(null);
    } catch (err) {
      // Local fallback update
      setMethods((prev) =>
        prev.map((item) => (item.id === editModalMethod.id ? editModalMethod : item))
      );
      success(`${editModalMethod.name} settings updated!`);
      setEditModalMethod(null);
    } finally {
      setSaving(false);
    }
  };

  const handleCreateMethod = async (e) => {
    e.preventDefault();
    if (!newMethodData.name.trim()) {
      toastError('Payment rail name is required.');
      return;
    }

    try {
      setSaving(true);
      let finalQrPath = '';

      if (qrFile) {
        const formData = new FormData();
        formData.append('file', qrFile);
        const qrRes = await api.post('/admin/payment-methods/upload-qr', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        }).catch(() => null);

        if (qrRes?.data?.data?.qrPath) {
          finalQrPath = qrRes.data.data.qrPath;
        }
      }

      const payload = { ...newMethodData, qrCodePath: finalQrPath };
      const res = await api.post('/admin/payment-methods', payload).catch(() => null);

      if (res?.data?.data) {
        setMethods((prev) => [...prev, res.data.data]);
        success(`New payment rail '${payload.name}' created!`);
      } else {
        const localCreated = { ...payload, id: Date.now() };
        setMethods((prev) => [...prev, localCreated]);
        success(`Payment rail '${payload.name}' added!`);
      }

      setCreateModalOpen(false);
      setQrFile(null);
      setNewMethodData({
        name: '',
        type: 'MobileWallet',
        accountTitle: '',
        accountNumber: '',
        bankName: '',
        iban: '',
        instructions: '',
        minDeposit: 100,
        maxDeposit: 500000,
        minWithdrawal: 500,
        maxWithdrawal: 50000,
        isEnabled: true,
        displayOrder: methods.length + 1
      });
    } catch (err) {
      toastError('Failed to create payment method.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteMethod = async (id, name) => {
    if (!window.confirm(`Are you sure you want to remove or disable ${name}?`)) return;

    try {
      await api.delete(`/admin/payment-methods/${id}`).catch(() => null);
      setMethods((prev) => prev.filter((m) => m.id !== id));
      success(`${name} removed successfully.`);
    } catch {
      setMethods((prev) => prev.filter((m) => m.id !== id));
      success(`${name} removed.`);
    }
  };

  // Filtered Methods
  const filteredMethods = methods.filter((m) => {
    const matchesSearch =
      m.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.accountTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.accountNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.bankName?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType =
      filterType === 'All' ||
      (filterType === 'MobileWallet' && m.type === 'MobileWallet') ||
      (filterType === 'Bank' && m.type === 'Bank') ||
      (filterType === 'Crypto' && m.type === 'Crypto');

    return matchesSearch && matchesType;
  });

  const getMethodBadgeStyle = (type, name) => {
    const lname = name?.toLowerCase() || '';
    if (lname.includes('easypaisa')) {
      return { bg: 'bg-[#25D366]/15', text: 'text-[#25D366]', border: 'border-[#25D366]/30', color: '#25D366', icon: Smartphone };
    }
    if (lname.includes('jazzcash')) {
      return { bg: 'bg-amber-500/15', text: 'text-amber-400', border: 'border-amber-500/30', color: '#F59E0B', icon: Smartphone };
    }
    if (type === 'Bank' || lname.includes('bank')) {
      return { bg: 'bg-sky-500/15', text: 'text-sky-400', border: 'border-sky-500/30', color: '#38BDF8', icon: Building2 };
    }
    if (type === 'Crypto' || lname.includes('usdt')) {
      return { bg: 'bg-emerald-500/15', text: 'text-emerald-400', border: 'border-emerald-500/30', color: '#10B981', icon: Coins };
    }
    return { bg: 'bg-indigo-500/15', text: 'text-indigo-400', border: 'border-indigo-500/30', color: '#818CF8', icon: Sliders };
  };

  return (
    <div className="space-y-8 animate-fade-in text-left">
      {/* 1. Header & Quick Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-3 py-0.5 rounded-full text-[10px] font-bold bg-[#25D366]/10 text-[#25D366] border border-[#25D366]/20 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#25D366] animate-pulse" />
              Pakistani Gateways Active
            </span>
          </div>
          <h1 className="font-heading font-black text-2xl sm:text-3xl text-white">
            Payment Rails & <span className="text-gradient-brand">QR Management</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            Configure Pakistani payment rails (Easypaisa, JazzCash, 1Link Bank, USDT TRC20), deposit/withdrawal limits, receiver titles, and live merchant QR codes.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={loadMethods}
            title="Refresh payment rails from database"
            className="p-2.5 rounded-xl border border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white hover:border-slate-700 transition-all active:scale-95"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-400' : ''}`} />
          </button>

          <button
            onClick={() => setCreateModalOpen(true)}
            className="px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-95 active:scale-95 shadow-lg shadow-emerald-500/20 flex items-center gap-2 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Payment Rail</span>
          </button>
        </div>
      </div>

      {/* 2. Top Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl glass-card border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
            <span>Configured Rails</span>
            <Sliders className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-black font-heading text-white">{methods.length}</p>
          <p className="text-[11px] text-emerald-400 font-medium">
            {methods.filter((m) => m.isEnabled).length} active for deposits
          </p>
        </div>

        <div className="p-5 rounded-2xl glass-card border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
            <span>Mobile Wallets</span>
            <Smartphone className="w-4 h-4 text-[#25D366]" />
          </div>
          <p className="text-2xl font-black font-heading text-white">
            {methods.filter((m) => m.type === 'MobileWallet').length}
          </p>
          <p className="text-[11px] text-slate-400">Easypaisa & JazzCash QR</p>
        </div>

        <div className="p-5 rounded-2xl glass-card border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
            <span>1Link Banking</span>
            <Building2 className="w-4 h-4 text-sky-400" />
          </div>
          <p className="text-2xl font-black font-heading text-white">
            {methods.filter((m) => m.type === 'Bank').length}
          </p>
          <p className="text-[11px] text-slate-400">IBFT & Raast Accounts</p>
        </div>

        <div className="p-5 rounded-2xl glass-card border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
            <span>Crypto Gateways</span>
            <Coins className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-black font-heading text-white">
            {methods.filter((m) => m.type === 'Crypto').length}
          </p>
          <p className="text-[11px] text-slate-400">USDT TRC20 On-Chain</p>
        </div>
      </div>

      {/* 3. Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by rail name, account title, number or bank..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {['All', 'MobileWallet', 'Bank', 'Crypto'].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                filterType === type
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {type === 'All' ? 'All Gateways' : type === 'MobileWallet' ? 'Mobile Wallets' : type === 'Bank' ? '1Link Bank' : 'Crypto'}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Payment Rails Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredMethods.map((m) => {
          const badge = getMethodBadgeStyle(m.type, m.name);
          const IconComp = badge.icon;

          return (
            <div
              key={m.id}
              className="p-6 rounded-3xl border flex flex-col justify-between gap-5 relative overflow-hidden transition-all duration-300 hover:border-slate-700 shadow-xl"
              style={{
                backgroundColor: 'var(--theme-bg-surface)',
                borderColor: m.isEnabled ? 'var(--theme-border-highlight)' : 'var(--theme-border)'
              }}
            >
              {/* Top Row: Name, Type Badge & Live Toggle */}
              <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-800/80">
                <div className="flex items-center gap-3">
                  <div className={`w-11 h-11 rounded-2xl ${badge.bg} ${badge.border} border flex items-center justify-center shrink-0 shadow-md`}>
                    <IconComp className={`w-5 h-5 ${badge.text}`} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-heading font-black text-base text-white">{m.name}</h3>
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${badge.bg} ${badge.text} border ${badge.border}`}>
                        {m.type}
                      </span>
                    </div>
                    {m.bankName && (
                      <p className="text-xs text-slate-400 mt-0.5 font-medium">{m.bankName}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleToggleEnabled(m)}
                    className={`px-3 py-1 rounded-full text-xs font-bold border transition-all flex items-center gap-1.5 ${
                      m.isEnabled
                        ? 'bg-emerald-950/80 text-emerald-400 border-emerald-500/40 shadow-sm shadow-emerald-500/20'
                        : 'bg-slate-950 text-slate-500 border-slate-800'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${m.isEnabled ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
                    <span>{m.isEnabled ? 'Active' : 'Disabled'}</span>
                  </button>
                </div>
              </div>

              {/* Middle Row: Gateway Details & QR Preview Box */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                {/* Account Details (8 cols) */}
                <div className="sm:col-span-8 space-y-2.5 text-xs text-slate-300">
                  {m.accountTitle && (
                    <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/70">
                      <div className="min-w-0">
                        <span className="text-[10px] uppercase font-bold text-slate-500 block">Account Title</span>
                        <p className="font-semibold text-white truncate">{m.accountTitle}</p>
                      </div>
                      <button
                        onClick={() => handleCopy(m.accountTitle, `title-${m.id}`)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors shrink-0"
                        title="Copy Account Title"
                      >
                        {copiedId === `title-${m.id}` ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  )}

                  {m.accountNumber && (
                    <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/70">
                      <div className="min-w-0">
                        <span className="text-[10px] uppercase font-bold text-slate-500 block">
                          {m.type === 'Crypto' ? 'Vault Wallet Address' : 'Account / IBAN Number'}
                        </span>
                        <p className="font-mono text-amber-300 text-[11px] font-bold truncate">{m.accountNumber}</p>
                      </div>
                      <button
                        onClick={() => handleCopy(m.accountNumber, `acc-${m.id}`)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors shrink-0"
                        title="Copy Account Number"
                      >
                        {copiedId === `acc-${m.id}` ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  )}

                  {/* Limits Badge */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div className="p-2 rounded-xl bg-slate-950/40 border border-slate-800/60">
                      <div className="flex items-center gap-1 text-[10px] text-teal-400 font-bold uppercase">
                        <ArrowDownToLine className="w-3 h-3" />
                        <span>Deposit Limit</span>
                      </div>
                      <p className="text-[11px] font-mono font-bold text-slate-200 mt-0.5">
                        {Number(m.minDeposit).toLocaleString()} - {Number(m.maxDeposit).toLocaleString()} <span className="text-[9px] text-slate-400">PKR</span>
                      </p>
                    </div>

                    <div className="p-2 rounded-xl bg-slate-950/40 border border-slate-800/60">
                      <div className="flex items-center gap-1 text-[10px] text-amber-400 font-bold uppercase">
                        <ArrowUpFromLine className="w-3 h-3" />
                        <span>Withdraw Limit</span>
                      </div>
                      <p className="text-[11px] font-mono font-bold text-slate-200 mt-0.5">
                        {Number(m.minWithdrawal).toLocaleString()} - {Number(m.maxWithdrawal).toLocaleString()} <span className="text-[9px] text-slate-400">PKR</span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* QR Code Container Preview (4 cols) */}
                <div className="sm:col-span-4 flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-950 border border-slate-800/80 text-center gap-2 group/qr">
                  {m.qrCodePath ? (
                    <div 
                      onClick={() => setViewQrMethod(m)}
                      className="relative cursor-pointer overflow-hidden rounded-xl border border-slate-800 p-1 bg-white hover:opacity-90 transition-opacity"
                    >
                      <img
                        src={m.qrCodePath}
                        alt={`${m.name} QR Code`}
                        className="w-20 h-20 object-contain rounded-lg"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.style.display = 'none';
                        }}
                      />
                      <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover/qr:opacity-100 flex items-center justify-center transition-opacity rounded-lg">
                        <Eye className="w-4 h-4 text-white" />
                      </div>
                    </div>
                  ) : (
                    <div 
                      onClick={() => { setEditModalMethod(m); setQrFile(null); }}
                      className="w-20 h-20 rounded-xl border-2 border-dashed border-slate-800 flex flex-col items-center justify-center gap-1 text-slate-500 hover:text-slate-300 hover:border-slate-700 cursor-pointer transition-colors p-2"
                    >
                      <QrCode className="w-6 h-6 opacity-60" />
                      <span className="text-[9px] font-semibold text-center leading-tight">No QR</span>
                    </div>
                  )}

                  <div className="flex items-center gap-1 w-full justify-center">
                    <button
                      type="button"
                      onClick={() => { setEditModalMethod(m); setQrFile(null); }}
                      className="text-[10px] font-bold text-emerald-400 hover:underline flex items-center gap-1"
                    >
                      <Upload className="w-3 h-3" />
                      <span>{m.qrCodePath ? 'Update QR' : 'Upload QR'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Instructions Snippet */}
              {m.instructions && (
                <p className="text-[11px] text-slate-400 bg-slate-950/40 p-2.5 rounded-xl border border-slate-800/40 line-clamp-2">
                  <span className="text-slate-500 font-bold">Note: </span>
                  {m.instructions}
                </p>
              )}

              {/* Bottom Card Actions */}
              <div className="flex items-center gap-2 pt-2 border-t border-slate-800/60">
                <button
                  type="button"
                  onClick={() => { setEditModalMethod(m); setQrFile(null); }}
                  className="flex-1 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 hover:bg-slate-800 hover:border-slate-600 text-xs font-bold text-white flex items-center justify-center gap-2 transition-all active:scale-98 shadow-sm"
                >
                  <Edit className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Edit Rail & Limits</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDeleteMethod(m.id, m.name)}
                  title="Remove or Deactivate Rail"
                  className="p-2.5 rounded-xl border border-slate-800 bg-slate-950 text-slate-500 hover:text-rose-400 hover:border-rose-500/30 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State when search has no results */}
      {filteredMethods.length === 0 && (
        <div className="p-12 text-center rounded-3xl bg-slate-900/40 border border-slate-800 space-y-3">
          <Sliders className="w-10 h-10 mx-auto text-slate-600" />
          <h3 className="font-heading font-bold text-base text-white">No payment rails matched your criteria</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Try adjusting your search terms or filter tabs, or add a new custom payment rail.
          </p>
          <button
            onClick={() => { setSearchTerm(''); setFilterType('All'); }}
            className="px-4 py-2 rounded-xl text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all mt-2"
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. EDIT PAYMENT METHOD MODAL                                              */}
      {/* ========================================================================= */}
      {editModalMethod && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto text-left animate-scale-up">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                  <Edit className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-heading font-black text-lg text-white">
                    Edit {editModalMethod.name}
                  </h3>
                  <p className="text-xs text-slate-400">Update receiver account details, limits, and QR image.</p>
                </div>
              </div>
              <button onClick={() => setEditModalMethod(null)} className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMethod} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Gateway Name</label>
                  <input
                    type="text"
                    required
                    value={editModalMethod.name}
                    onChange={(e) => setEditModalMethod({ ...editModalMethod, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Rail Type</label>
                  <select
                    value={editModalMethod.type}
                    onChange={(e) => setEditModalMethod({ ...editModalMethod, type: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-bold focus:outline-none focus:border-emerald-500"
                  >
                    <option value="MobileWallet">Mobile Wallet (Easypaisa / JazzCash)</option>
                    <option value="Bank">Commercial Bank (1Link / Raast)</option>
                    <option value="Crypto">Crypto (USDT TRC20 / TRON)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Account Title / Merchant Name</label>
                <input
                  type="text"
                  placeholder="e.g. NOVYRA Merchant Operations"
                  value={editModalMethod.accountTitle || ''}
                  onChange={(e) => setEditModalMethod({ ...editModalMethod, accountTitle: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">
                    {editModalMethod.type === 'Crypto' ? 'Vault Wallet Address' : 'Account / Mobile Number'}
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 03001234567 or PK00..."
                    value={editModalMethod.accountNumber || ''}
                    onChange={(e) => setEditModalMethod({ ...editModalMethod, accountNumber: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Bank / Network Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Meezan Bank, Telenor Bank"
                    value={editModalMethod.bankName || ''}
                    onChange={(e) => setEditModalMethod({ ...editModalMethod, bankName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Min Deposit (PKR)</label>
                  <input
                    type="number"
                    value={editModalMethod.minDeposit}
                    onChange={(e) => setEditModalMethod({ ...editModalMethod, minDeposit: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Max Deposit (PKR)</label>
                  <input
                    type="number"
                    value={editModalMethod.maxDeposit}
                    onChange={(e) => setEditModalMethod({ ...editModalMethod, maxDeposit: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Min Withdrawal (PKR)</label>
                  <input
                    type="number"
                    value={editModalMethod.minWithdrawal}
                    onChange={(e) => setEditModalMethod({ ...editModalMethod, minWithdrawal: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Max Withdrawal (PKR)</label>
                  <input
                    type="number"
                    value={editModalMethod.maxWithdrawal}
                    onChange={(e) => setEditModalMethod({ ...editModalMethod, maxWithdrawal: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Instructions for Users</label>
                <textarea
                  rows="2"
                  placeholder="e.g. Scan QR code or transfer directly to account. Upload transaction receipt screenshot."
                  value={editModalMethod.instructions || ''}
                  onChange={(e) => setEditModalMethod({ ...editModalMethod, instructions: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1.5 p-3 rounded-2xl bg-slate-950 border border-slate-800">
                <label className="text-xs font-semibold text-slate-300 block">Merchant QR Code Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setQrFile(e.target.files[0])}
                  className="w-full text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-emerald-500 file:text-slate-950 hover:file:bg-emerald-400 cursor-pointer"
                />
                {editModalMethod.qrCodePath && !qrFile && (
                  <p className="text-[10px] text-slate-500 font-mono">Current path: {editModalMethod.qrCodePath}</p>
                )}
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setEditModalMethod(null)}
                  className="flex-1 py-3 rounded-xl border border-slate-800 bg-slate-950 text-xs font-bold text-slate-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-3 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-slate-950 font-bold text-xs shadow-lg shadow-[#25D366]/20 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {saving ? <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" /> : 'Save Rail Settings'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. CREATE NEW PAYMENT METHOD MODAL                                        */}
      {/* ========================================================================= */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto text-left animate-scale-up">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-heading font-black text-lg text-white">
                    Add New Payment Rail
                  </h3>
                  <p className="text-xs text-slate-400">Configure a new deposit & withdrawal rail for your members.</p>
                </div>
              </div>
              <button onClick={() => setCreateModalOpen(false)} className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateMethod} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Gateway Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Nayapay, SadaPay, UBL"
                    value={newMethodData.name}
                    onChange={(e) => setNewMethodData({ ...newMethodData, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Rail Type *</label>
                  <select
                    value={newMethodData.type}
                    onChange={(e) => setNewMethodData({ ...newMethodData, type: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-bold focus:outline-none focus:border-emerald-500"
                  >
                    <option value="MobileWallet">Mobile Wallet (Easypaisa / JazzCash / SadaPay)</option>
                    <option value="Bank">Commercial Bank (1Link / Raast)</option>
                    <option value="Crypto">Crypto (USDT TRC20 / BEP20)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Account Title / Merchant Name</label>
                <input
                  type="text"
                  placeholder="e.g. NOVYRA Operations"
                  value={newMethodData.accountTitle}
                  onChange={(e) => setNewMethodData({ ...newMethodData, accountTitle: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">
                    {newMethodData.type === 'Crypto' ? 'Vault Wallet Address' : 'Account / IBAN Number'}
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 03001234567 or PK..."
                    value={newMethodData.accountNumber}
                    onChange={(e) => setNewMethodData({ ...newMethodData, accountNumber: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Bank / Network Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Meezan Bank, SadaPay"
                    value={newMethodData.bankName}
                    onChange={(e) => setNewMethodData({ ...newMethodData, bankName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Min Deposit (PKR)</label>
                  <input
                    type="number"
                    value={newMethodData.minDeposit}
                    onChange={(e) => setNewMethodData({ ...newMethodData, minDeposit: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Max Deposit (PKR)</label>
                  <input
                    type="number"
                    value={newMethodData.maxDeposit}
                    onChange={(e) => setNewMethodData({ ...newMethodData, maxDeposit: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Min Withdrawal (PKR)</label>
                  <input
                    type="number"
                    value={newMethodData.minWithdrawal}
                    onChange={(e) => setNewMethodData({ ...newMethodData, minWithdrawal: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Max Withdrawal (PKR)</label>
                  <input
                    type="number"
                    value={newMethodData.maxWithdrawal}
                    onChange={(e) => setNewMethodData({ ...newMethodData, maxWithdrawal: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Instructions for Users</label>
                <textarea
                  rows="2"
                  placeholder="Instructions shown on member deposit page..."
                  value={newMethodData.instructions}
                  onChange={(e) => setNewMethodData({ ...newMethodData, instructions: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1.5 p-3 rounded-2xl bg-slate-950 border border-slate-800">
                <label className="text-xs font-semibold text-slate-300 block">Merchant QR Code Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setQrFile(e.target.files[0])}
                  className="w-full text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-emerald-500 file:text-slate-950 hover:file:bg-emerald-400 cursor-pointer"
                />
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="flex-1 py-3 rounded-xl border border-slate-800 bg-slate-950 text-xs font-bold text-slate-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {saving ? <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" /> : 'Create Payment Rail'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 7. QR CODE FULL PREVIEW MODAL                                             */}
      {/* ========================================================================= */}
      {viewQrMethod && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4 text-center animate-scale-up">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="font-heading font-black text-base text-white">{viewQrMethod.name} QR Code</h3>
              <button onClick={() => setViewQrMethod(null)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-white rounded-2xl flex items-center justify-center shadow-inner">
              <img
                src={viewQrMethod.qrCodePath}
                alt={`${viewQrMethod.name} Merchant QR`}
                className="max-h-64 object-contain rounded-lg"
              />
            </div>

            {viewQrMethod.accountNumber && (
              <p className="font-mono text-xs font-bold text-amber-300">{viewQrMethod.accountNumber}</p>
            )}

            <button
              onClick={() => setViewQrMethod(null)}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white transition-colors"
            >
              Close Preview
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPaymentMethods;
