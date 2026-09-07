import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { useTheme } from '../../context/ThemeContext';
import { 
  ArrowDownToLine, Upload, Copy, Check, AlertCircle 
} from 'lucide-react';

const UserDeposit = () => {
  const { refreshSummary } = useOutletContext() || {};
  const { success, error: toastError } = useToast();
  const { theme } = useTheme();

  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [amount, setAmount] = useState('');
  const [transactionRef, setTransactionRef] = useState('');
  const [proofFile, setProofFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [copiedField, setCopiedField] = useState(null);
  const [userDeposits, setUserDeposits] = useState([]);
  const [loadingDeposits, setLoadingDeposits] = useState(true);

  const loadData = async () => {
    try {
      const [methodsRes, depositsRes] = await Promise.all([
        api.get('/paymentmethods'),
        api.get('/deposits?page=1&pageSize=10')
      ]);

      if (methodsRes.data?.data) {
        setPaymentMethods(methodsRes.data.data);
        if (methodsRes.data.data.length > 0 && !selectedMethod) {
          setSelectedMethod(methodsRes.data.data[0]);
        }
      }

      if (depositsRes.data?.data?.items) {
        setUserDeposits(depositsRes.data.data.items);
      }
    } catch (err) {
      console.error('Failed to load deposit data:', err);
    } finally {
      setLoadingDeposits(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCopy = (text, fieldName) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    success(`Copied to clipboard: ${text}`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toastError('File size exceeds 5MB limit.');
        return;
      }
      setProofFile(file);
    }
  };

  const handleSubmitDeposit = async (e) => {
    e.preventDefault();
    if (!selectedMethod) return;

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount < selectedMethod.minDeposit || numAmount > selectedMethod.maxDeposit) {
      toastError(`Deposit amount must be between ${selectedMethod.minDeposit} and ${selectedMethod.maxDeposit} PKR.`);
      return;
    }

    if (!transactionRef.trim()) {
      toastError('Transaction Reference / TRX ID is required.');
      return;
    }

    if (!proofFile) {
      toastError('Please upload a screenshot receipt of your transfer.');
      return;
    }

    try {
      setSubmitting(true);

      // 1. Upload proof file first
      const formData = new FormData();
      formData.append('file', proofFile);

      const uploadRes = await api.post('/deposits/upload-proof', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (!uploadRes.data?.success || !uploadRes.data?.data?.filePath) {
        toastError(uploadRes.data?.message || 'Proof upload failed.');
        return;
      }

      const proofPath = uploadRes.data.data.filePath;

      // 2. Submit Deposit Request
      const depositRes = await api.post('/deposits', {
        paymentMethodId: selectedMethod.id,
        amount: numAmount,
        transactionReference: transactionRef.trim(),
        proofFilePath: proofPath
      });

      if (depositRes.data?.success) {
        success('Deposit request submitted successfully! It will be reviewed by admin.');
        setAmount('');
        setTransactionRef('');
        setProofFile(null);
        loadData();
        if (refreshSummary) refreshSummary();
      } else {
        toastError(depositRes.data?.message || 'Failed to submit deposit.');
      }
    } catch (err) {
      toastError(err.response?.data?.message || 'Deposit submission error.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h1 className="font-heading font-black text-2xl sm:text-3xl" style={{ color: 'var(--theme-text-primary)' }}>
          Deposit Funds
        </h1>
        <p className="text-xs sm:text-sm mt-1" style={{ color: 'var(--theme-text-secondary)' }}>
          Submit manual deposits via Easypaisa, JazzCash, 1Link Bank Transfer, or USDT TRC20.
        </p>
      </div>

      {/* Mandatory Disclaimer */}
      <div 
        className="p-4 rounded-2xl border text-xs flex items-start gap-3"
        style={{
          backgroundColor: 'rgba(var(--theme-primary-rgb), 0.08)',
          borderColor: 'var(--theme-border-highlight)'
        }}
      >
        <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" style={{ color: 'var(--theme-primary)' }} />
        <div>
          <p className="font-bold" style={{ color: 'var(--theme-primary)' }}>Important Deposit Notice</p>
          <p className="mt-0.5" style={{ color: 'var(--theme-text-secondary)' }}>
            Deposits on NOVYRA are non-interest-bearing utility credits used for advertiser campaign creation and platform services. Deposits are NOT investments and do NOT offer guaranteed daily ROI.
          </p>
        </div>
      </div>

      {/* Main Grid: Steps & Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Step 1 & Method Details (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Method Selector */}
          <div 
            className="p-6 rounded-3xl border space-y-4"
            style={{ backgroundColor: 'var(--theme-bg-surface)', borderColor: 'var(--theme-border)' }}
          >
            <h3 className="font-heading font-bold text-sm" style={{ color: 'var(--theme-text-primary)' }}>
              1. Select Payment Method
            </h3>

            <div className="grid grid-cols-2 gap-3">
              {paymentMethods.map((pm) => {
                const isSelected = selectedMethod?.id === pm.id;
                return (
                  <button
                    key={pm.id}
                    onClick={() => setSelectedMethod(pm)}
                    className={`p-3.5 rounded-2xl border text-left transition-all ${
                      isSelected ? 'shadow-md' : 'hover:opacity-80'
                    }`}
                    style={{
                      backgroundColor: isSelected ? 'rgba(var(--theme-primary-rgb), 0.15)' : 'var(--theme-bg-elevated)',
                      borderColor: isSelected ? 'var(--theme-primary)' : 'var(--theme-border)',
                      color: isSelected ? 'var(--theme-primary)' : 'var(--theme-text-secondary)'
                    }}
                  >
                    <p className="text-xs font-bold">{pm.name}</p>
                    <p className="text-[10px] mt-0.5" style={{ color: 'var(--theme-text-muted)' }}>{pm.type}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Payment Account Details & QR */}
          {selectedMethod && (
            <div 
              className="p-6 rounded-3xl border space-y-4"
              style={{ backgroundColor: 'var(--theme-bg-surface)', borderColor: 'var(--theme-border)' }}
            >
              <h3 className="font-heading font-bold text-sm" style={{ color: 'var(--theme-text-primary)' }}>
                2. Transfer Instructions
              </h3>

              {/* Instructions Text */}
              <p 
                className="text-xs leading-relaxed p-3.5 rounded-xl border"
                style={{
                  backgroundColor: 'var(--theme-bg-elevated)',
                  borderColor: 'var(--theme-border)',
                  color: 'var(--theme-text-secondary)'
                }}
              >
                {selectedMethod.instructions}
              </p>

              {/* Limits */}
              <div className="flex justify-between text-xs font-medium pt-1" style={{ color: 'var(--theme-text-secondary)' }}>
                <span>Min: {Number(selectedMethod.minDeposit).toLocaleString()} PKR</span>
                <span>Max: {Number(selectedMethod.maxDeposit).toLocaleString()} PKR</span>
              </div>

              {/* Account Title */}
              {selectedMethod.accountTitle && (
                <div 
                  className="p-3 rounded-xl border flex items-center justify-between"
                  style={{ backgroundColor: 'var(--theme-bg-elevated)', borderColor: 'var(--theme-border)' }}
                >
                  <div>
                    <p className="text-[10px] uppercase font-bold" style={{ color: 'var(--theme-text-muted)' }}>Account Title</p>
                    <p className="text-xs font-bold" style={{ color: 'var(--theme-text-primary)' }}>{selectedMethod.accountTitle}</p>
                  </div>
                  <button
                    onClick={() => handleCopy(selectedMethod.accountTitle, 'title')}
                    className="p-1.5 rounded-lg hover:opacity-80 transition-opacity"
                    style={{ color: 'var(--theme-text-secondary)' }}
                  >
                    {copiedField === 'title' ? <Check className="w-4 h-4" style={{ color: 'var(--theme-primary)' }} /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              )}

              {/* Account Number / IBAN */}
              {selectedMethod.accountNumber && (
                <div 
                  className="p-3 rounded-xl border flex items-center justify-between"
                  style={{ backgroundColor: 'var(--theme-bg-elevated)', borderColor: 'var(--theme-border)' }}
                >
                  <div className="min-w-0 pr-2">
                    <p className="text-[10px] uppercase font-bold" style={{ color: 'var(--theme-text-muted)' }}>
                      {selectedMethod.type === 'Crypto' ? 'USDT TRC20 Address' : 'Account / IBAN Number'}
                    </p>
                    <p className="text-xs font-mono font-bold truncate" style={{ color: 'var(--theme-primary)' }}>
                      {selectedMethod.accountNumber}
                    </p>
                  </div>
                  <button
                    onClick={() => handleCopy(selectedMethod.accountNumber, 'accNum')}
                    className="p-1.5 rounded-lg hover:opacity-80 transition-opacity shrink-0"
                    style={{ color: 'var(--theme-text-secondary)' }}
                  >
                    {copiedField === 'accNum' ? <Check className="w-4 h-4" style={{ color: 'var(--theme-primary)' }} /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right: Step 3 Deposit Form (7 cols) */}
        <div className="lg:col-span-7">
          <div 
            className="p-8 rounded-3xl border shadow-xl backdrop-blur-xl"
            style={{ backgroundColor: 'var(--theme-bg-surface)', borderColor: 'var(--theme-border)' }}
          >
            <h3 className="font-heading font-bold text-base mb-6" style={{ color: 'var(--theme-text-primary)' }}>
              3. Submit Deposit Verification Form
            </h3>

            <form onSubmit={handleSubmitDeposit} className="space-y-5">
              {/* Amount */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold" style={{ color: 'var(--theme-text-secondary)' }}>Deposit Amount (PKR)</label>
                <input
                  type="number"
                  required
                  min={selectedMethod?.minDeposit || 100}
                  max={selectedMethod?.maxDeposit || 1000000}
                  step="any"
                  placeholder={`Min ${selectedMethod?.minDeposit || 100} PKR`}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border text-sm font-heading font-bold transition-all focus:outline-none"
                  style={{
                    backgroundColor: 'var(--theme-bg-elevated)',
                    borderColor: 'var(--theme-border)',
                    color: 'var(--theme-text-primary)'
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--theme-primary)'}
                  onBlur={(e) => e.target.style.borderColor = 'var(--theme-border)'}
                />
              </div>

              {/* Transaction Reference */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold" style={{ color: 'var(--theme-text-secondary)' }}>
                  Transaction Reference / TRX ID / Bank Sequence
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 29384729183 or Blockchain TXID"
                  value={transactionRef}
                  onChange={(e) => setTransactionRef(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border text-sm font-mono transition-all focus:outline-none"
                  style={{
                    backgroundColor: 'var(--theme-bg-elevated)',
                    borderColor: 'var(--theme-border)',
                    color: 'var(--theme-text-primary)'
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--theme-primary)'}
                  onBlur={(e) => e.target.style.borderColor = 'var(--theme-border)'}
                />
              </div>

              {/* Proof File Upload */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold" style={{ color: 'var(--theme-text-secondary)' }}>
                  Payment Receipt Screenshot (Max 5MB)
                </label>
                <div 
                  className="p-6 border-2 border-dashed rounded-2xl text-center cursor-pointer relative transition-all"
                  style={{
                    backgroundColor: 'var(--theme-bg-elevated)',
                    borderColor: 'var(--theme-border)'
                  }}
                >
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <Upload className="w-8 h-8 mx-auto mb-2" style={{ color: 'var(--theme-primary)' }} />
                  <p className="text-xs font-bold" style={{ color: 'var(--theme-text-primary)' }}>
                    {proofFile ? proofFile.name : 'Click or Drag receipt image here'}
                  </p>
                  <p className="text-[10px] mt-1" style={{ color: 'var(--theme-text-muted)' }}>JPG, PNG, WEBP, or PDF</p>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-4 rounded-xl text-white font-bold text-sm shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 hover:scale-[1.02]"
                style={{
                  background: 'var(--theme-gradient-brand)',
                  boxShadow: 'var(--theme-glow)'
                }}
              >
                {submitting ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <ArrowDownToLine className="w-4 h-4" />
                    <span>Submit Deposit for Approval</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* 4. Deposit Submission History */}
      <div 
        className="p-6 rounded-3xl border space-y-4"
        style={{ backgroundColor: 'var(--theme-bg-surface)', borderColor: 'var(--theme-border)' }}
      >
        <h3 className="font-heading font-bold text-base" style={{ color: 'var(--theme-text-primary)' }}>Your Deposit Submissions</h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b font-bold uppercase tracking-wider text-[11px]" style={{ borderColor: 'var(--theme-border)', color: 'var(--theme-text-muted)' }}>
                <th className="pb-3 px-3">Date</th>
                <th className="pb-3 px-3">Method</th>
                <th className="pb-3 px-3">TRX Ref</th>
                <th className="pb-3 px-3 text-right">Amount</th>
                <th className="pb-3 px-3 text-center">Status</th>
                <th className="pb-3 px-3">Admin Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y font-medium" style={{ borderColor: 'var(--theme-border)' }}>
              {userDeposits.length > 0 ? (
                userDeposits.map((dep) => (
                  <tr key={dep.id} className="transition-colors hover:bg-white/5">
                    <td className="py-3 px-3 whitespace-nowrap" style={{ color: 'var(--theme-text-secondary)' }}>
                      {new Date(dep.createdAt).toLocaleString()}
                    </td>
                    <td className="py-3 px-3 font-bold" style={{ color: 'var(--theme-text-primary)' }}>{dep.paymentMethodName}</td>
                    <td className="py-3 px-3 font-mono" style={{ color: 'var(--theme-text-secondary)' }}>{dep.transactionReference}</td>
                    <td className="py-3 px-3 text-right font-bold font-heading" style={{ color: 'var(--theme-primary)' }}>
                      {Number(dep.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })} PKR
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span 
                        className="px-2.5 py-0.5 rounded-full text-[10px] font-bold border"
                        style={{
                          backgroundColor: dep.status === 'Approved' ? 'rgba(var(--theme-primary-rgb), 0.1)' : 'rgba(245, 158, 11, 0.1)',
                          borderColor: dep.status === 'Approved' ? 'var(--theme-primary)' : 'rgba(245, 158, 11, 0.4)',
                          color: dep.status === 'Approved' ? 'var(--theme-primary)' : '#f59e0b'
                        }}
                      >
                        {dep.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 max-w-xs truncate" style={{ color: 'var(--theme-text-muted)' }}>
                      {dep.rejectionReason || dep.adminNote || '-'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-8" style={{ color: 'var(--theme-text-muted)' }}>
                    No deposit requests submitted yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UserDeposit;
