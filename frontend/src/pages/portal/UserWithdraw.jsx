import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { useTheme } from '../../context/ThemeContext';
import { 
  ArrowUpFromLine, Wallet, Calculator, Lock 
} from 'lucide-react';

const UserWithdraw = () => {
  const { refreshSummary } = useOutletContext() || {};
  const { success, error: toastError } = useToast();
  const { theme } = useTheme();

  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selectedMethodId, setSelectedMethodId] = useState('');
  const [amount, setAmount] = useState('');
  const [accountTitle, setAccountTitle] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [bankName, setBankName] = useState('');

  const [feePreview, setFeePreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [userWithdrawals, setUserWithdrawals] = useState([]);
  const [availableBalance, setAvailableBalance] = useState(0);

  const loadData = async () => {
    try {
      const [methodsRes, withdrawalsRes, walletRes] = await Promise.all([
        api.get('/paymentmethods'),
        api.get('/withdrawals?page=1&pageSize=10'),
        api.get('/wallet')
      ]);

      if (methodsRes.data?.data) {
        setPaymentMethods(methodsRes.data.data);
        if (methodsRes.data.data.length > 0 && !selectedMethodId) {
          setSelectedMethodId(methodsRes.data.data[0].id.toString());
        }
      }

      if (withdrawalsRes.data?.data?.items) {
        setUserWithdrawals(withdrawalsRes.data.data.items);
      }

      if (walletRes.data?.data) {
        setAvailableBalance(walletRes.data.data.availableBalance || 0);
      }
    } catch (err) {
      console.error('Failed to load withdrawal data:', err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Update Fee Preview dynamically when amount or method changes
  useEffect(() => {
    const numAmount = parseFloat(amount);
    if (!selectedMethodId || isNaN(numAmount) || numAmount <= 0) {
      setFeePreview(null);
      return;
    }

    const fetchFeePreview = async () => {
      try {
        const res = await api.get(`/withdrawals/fee-preview?paymentMethodId=${selectedMethodId}&amount=${numAmount}`);
        if (res.data?.data) {
          setFeePreview(res.data.data);
        }
      } catch (err) {
        setFeePreview(null);
      }
    };

    const debounce = setTimeout(fetchFeePreview, 300);
    return () => clearTimeout(debounce);
  }, [selectedMethodId, amount]);

  const handleSubmitWithdrawal = async (e) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount < 500) {
      toastError('Minimum withdrawal is 500 PKR.');
      return;
    }

    if (numAmount > availableBalance) {
      toastError(`Insufficient available balance (${availableBalance} PKR).`);
      return;
    }

    if (!accountTitle.trim() || !accountNumber.trim()) {
      toastError('Account Title and Account Number are mandatory.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.post('/withdrawals', {
        paymentMethodId: parseInt(selectedMethodId, 10),
        requestedAmount: numAmount,
        payoutAccountTitle: accountTitle.trim(),
        payoutAccountNumber: accountNumber.trim(),
        payoutBankName: bankName.trim() || undefined
      });

      if (res.data?.success) {
        success('Withdrawal request submitted! Funds have been reserved in your wallet.');
        setAmount('');
        setAccountTitle('');
        setAccountNumber('');
        setBankName('');
        setFeePreview(null);
        loadData();
        if (refreshSummary) refreshSummary();
      } else {
        toastError(res.data?.message || 'Withdrawal failed.');
      }
    } catch (err) {
      toastError(err.response?.data?.message || 'Withdrawal request error.');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedMethod = paymentMethods.find((pm) => pm.id.toString() === selectedMethodId);

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h1 className="font-heading font-black text-2xl sm:text-3xl" style={{ color: 'var(--theme-text-primary)' }}>
          Request Payout / Withdrawal
        </h1>
        <p className="text-xs sm:text-sm mt-1" style={{ color: 'var(--theme-text-secondary)' }}>
          Withdraw your verified available rewards to Easypaisa, JazzCash, 1Link Banks, or USDT.
        </p>
      </div>

      {/* Main Form & Preview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Withdrawal Form (7 cols) */}
        <div 
          className="lg:col-span-7 p-8 rounded-3xl border shadow-xl backdrop-blur-xl space-y-6"
          style={{ backgroundColor: 'var(--theme-bg-surface)', borderColor: 'var(--theme-border)' }}
        >
          <div className="flex items-center justify-between pb-4 border-b" style={{ borderColor: 'var(--theme-border)' }}>
            <div>
              <p className="text-xs font-semibold" style={{ color: 'var(--theme-text-secondary)' }}>Available for Withdrawal</p>
              <p className="text-2xl font-black font-heading" style={{ color: 'var(--theme-primary)' }}>
                {Number(availableBalance).toLocaleString(undefined, { minimumFractionDigits: 2 })} PKR
              </p>
            </div>
            <div 
              className="p-3 rounded-2xl border shadow-md"
              style={{
                backgroundColor: 'rgba(var(--theme-primary-rgb), 0.12)',
                borderColor: 'var(--theme-border-highlight)',
                color: 'var(--theme-primary)'
              }}
            >
              <Wallet className="w-6 h-6" />
            </div>
          </div>

          <form onSubmit={handleSubmitWithdrawal} className="space-y-5">
            {/* Payout Gateway */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold" style={{ color: 'var(--theme-text-secondary)' }}>Payout Method</label>
              <select
                value={selectedMethodId}
                onChange={(e) => setSelectedMethodId(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border text-sm font-semibold focus:outline-none cursor-pointer"
                style={{
                  backgroundColor: 'var(--theme-bg-elevated)',
                  borderColor: 'var(--theme-border)',
                  color: 'var(--theme-text-primary)'
                }}
              >
                {paymentMethods.map((pm) => (
                  <option key={pm.id} value={pm.id} style={{ backgroundColor: 'var(--theme-bg-surface)', color: 'var(--theme-text-primary)' }}>
                    {pm.name} ({pm.type}) — Min {pm.minWithdrawal} PKR
                  </option>
                ))}
              </select>
            </div>

            {/* Requested Amount */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <label className="font-semibold" style={{ color: 'var(--theme-text-secondary)' }}>Amount (PKR)</label>
                <button
                  type="button"
                  onClick={() => setAmount(availableBalance.toString())}
                  className="font-bold hover:underline"
                  style={{ color: 'var(--theme-primary)' }}
                >
                  Max Balance
                </button>
              </div>
              <input
                type="number"
                required
                min={selectedMethod?.minWithdrawal || 500}
                max={selectedMethod?.maxWithdrawal || 500000}
                step="any"
                placeholder={`Min ${selectedMethod?.minWithdrawal || 500} PKR`}
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

            {/* Account Title */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold" style={{ color: 'var(--theme-text-secondary)' }}>Account Holder Title / Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Ali Ahmed"
                value={accountTitle}
                onChange={(e) => setAccountTitle(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border text-sm transition-all focus:outline-none"
                style={{
                  backgroundColor: 'var(--theme-bg-elevated)',
                  borderColor: 'var(--theme-border)',
                  color: 'var(--theme-text-primary)'
                }}
                onFocus={(e) => e.target.style.borderColor = 'var(--theme-primary)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--theme-border)'}
              />
            </div>

            {/* Account Number */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold" style={{ color: 'var(--theme-text-secondary)' }}>
                {selectedMethod?.type === 'Crypto' ? 'USDT TRC20 Address' : 'Account Number / Mobile Number / IBAN'}
              </label>
              <input
                type="text"
                required
                placeholder={selectedMethod?.type === 'Crypto' ? 'TRC20 Wallet Address' : '03001234567 or PK00...'}
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
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

            {/* Bank Name */}
            {selectedMethod?.type === 'Bank' && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold" style={{ color: 'var(--theme-text-secondary)' }}>Bank Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Meezan Bank, HBL, UBL"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border text-sm transition-all focus:outline-none"
                  style={{
                    backgroundColor: 'var(--theme-bg-elevated)',
                    borderColor: 'var(--theme-border)',
                    color: 'var(--theme-text-primary)'
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--theme-primary)'}
                  onBlur={(e) => e.target.style.borderColor = 'var(--theme-border)'}
                />
              </div>
            )}

            <button
              type="submit"
              disabled={submitting || (feePreview && !feePreview.isEligible)}
              className="w-full py-4 rounded-xl text-white font-bold text-sm shadow-xl transition-all disabled:opacity-40 flex items-center justify-center gap-2 hover:scale-[1.02]"
              style={{
                background: 'var(--theme-gradient-brand)',
                boxShadow: 'var(--theme-glow)'
              }}
            >
              {submitting ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <ArrowUpFromLine className="w-4 h-4" />
                  <span>Request Payout</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right: Real-time Fee & Reservation Preview (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div 
            className="p-6 rounded-3xl border space-y-4 shadow-md"
            style={{ backgroundColor: 'var(--theme-bg-surface)', borderColor: 'var(--theme-border)' }}
          >
            <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider" style={{ color: 'var(--theme-primary)' }}>
              <Calculator className="w-4 h-4" />
              <span>Real-Time Fee & Net Payout Breakdown</span>
            </div>

            {feePreview ? (
              <div className="space-y-3 pt-2 text-xs">
                <div className="flex justify-between py-2 border-b" style={{ borderColor: 'var(--theme-border)', color: 'var(--theme-text-secondary)' }}>
                  <span>Gross Requested:</span>
                  <span className="font-bold font-heading" style={{ color: 'var(--theme-text-primary)' }}>{feePreview.requestedAmount} PKR</span>
                </div>
                <div className="flex justify-between py-2 border-b" style={{ borderColor: 'var(--theme-border)', color: 'var(--theme-text-secondary)' }}>
                  <span>Platform Processing Fee:</span>
                  <span className="text-rose-400 font-mono">-{feePreview.totalFee} PKR</span>
                </div>
                <div 
                  className="flex justify-between py-3 rounded-xl border px-4 font-bold text-sm"
                  style={{
                    backgroundColor: 'rgba(var(--theme-primary-rgb), 0.1)',
                    borderColor: 'var(--theme-border-highlight)',
                    color: 'var(--theme-primary)'
                  }}
                >
                  <span>Net Amount Sent to You:</span>
                  <span className="text-base font-black font-heading">
                    {feePreview.netAmount} PKR
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-xs py-6 text-center" style={{ color: 'var(--theme-text-muted)' }}>
                Enter an amount above to view real-time fee calculations and net payout.
              </p>
            )}
          </div>

          {/* Fund Reservation Explainer */}
          <div 
            className="p-6 rounded-3xl border space-y-3"
            style={{ backgroundColor: 'var(--theme-bg-surface)', borderColor: 'var(--theme-border)' }}
          >
            <div className="flex items-center gap-2 font-bold text-xs" style={{ color: 'var(--theme-secondary)' }}>
              <Lock className="w-4 h-4" />
              <span>Fund Reservation Mechanism</span>
            </div>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--theme-text-secondary)' }}>
              When you submit a withdrawal, the requested amount moves from <strong style={{ color: 'var(--theme-text-primary)' }}>Available Balance</strong> to <strong style={{ color: 'var(--theme-text-primary)' }}>Reserved Balance</strong>. If a request is rejected for incorrect bank info, funds are automatically refunded back to your available balance.
            </p>
          </div>
        </div>
      </div>

      {/* Withdrawal Submissions History */}
      <div 
        className="p-6 rounded-3xl border space-y-4"
        style={{ backgroundColor: 'var(--theme-bg-surface)', borderColor: 'var(--theme-border)' }}
      >
        <h3 className="font-heading font-bold text-base" style={{ color: 'var(--theme-text-primary)' }}>Withdrawal History & Status</h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b font-bold uppercase tracking-wider text-[11px]" style={{ borderColor: 'var(--theme-border)', color: 'var(--theme-text-muted)' }}>
                <th className="pb-3 px-3">Date</th>
                <th className="pb-3 px-3">Gateway</th>
                <th className="pb-3 px-3">Account Title & Number</th>
                <th className="pb-3 px-3 text-right">Requested</th>
                <th className="pb-3 px-3 text-right">Net Payout</th>
                <th className="pb-3 px-3 text-center">Status</th>
                <th className="pb-3 px-3">Transaction Ref / TXID</th>
              </tr>
            </thead>
            <tbody className="divide-y font-medium" style={{ borderColor: 'var(--theme-border)' }}>
              {userWithdrawals.length > 0 ? (
                userWithdrawals.map((w) => (
                  <tr key={w.id} className="transition-colors hover:bg-white/5">
                    <td className="py-3 px-3 whitespace-nowrap" style={{ color: 'var(--theme-text-secondary)' }}>
                      {new Date(w.createdAt).toLocaleString()}
                    </td>
                    <td className="py-3 px-3 font-bold" style={{ color: 'var(--theme-text-primary)' }}>{w.paymentMethodName}</td>
                    <td className="py-3 px-3" style={{ color: 'var(--theme-text-secondary)' }}>
                      <p className="font-bold" style={{ color: 'var(--theme-text-primary)' }}>{w.payoutAccountTitle}</p>
                      <p className="text-[10px] font-mono" style={{ color: 'var(--theme-text-muted)' }}>{w.payoutAccountNumber}</p>
                    </td>
                    <td className="py-3 px-3 text-right" style={{ color: 'var(--theme-text-secondary)' }}>
                      {Number(w.requestedAmount).toLocaleString(undefined, { minimumFractionDigits: 2 })} PKR
                    </td>
                    <td className="py-3 px-3 text-right font-bold font-heading" style={{ color: 'var(--theme-primary)' }}>
                      {Number(w.netAmount).toLocaleString(undefined, { minimumFractionDigits: 2 })} PKR
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span 
                        className="px-2.5 py-0.5 rounded-full text-[10px] font-bold border"
                        style={{
                          backgroundColor: w.status === 'Paid' ? 'rgba(var(--theme-primary-rgb), 0.1)' : 'rgba(245, 158, 11, 0.1)',
                          borderColor: w.status === 'Paid' ? 'var(--theme-primary)' : 'rgba(245, 158, 11, 0.4)',
                          color: w.status === 'Paid' ? 'var(--theme-primary)' : '#f59e0b'
                        }}
                      >
                        {w.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono max-w-xs truncate" style={{ color: 'var(--theme-text-muted)' }}>
                      {w.transactionReference || w.rejectionReason || '-'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center py-8" style={{ color: 'var(--theme-text-muted)' }}>
                    No withdrawal requests submitted yet.
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

export default UserWithdraw;
