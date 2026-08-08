import React, { useState, useEffect } from 'react';
import { 
  ArrowRight, 
  Send, 
  ShieldAlert, 
  Sparkles, 
  CheckCircle, 
  Check, 
  AlertCircle, 
  X, 
  FileText, 
  CreditCard, 
  User, 
  Clock, 
  ArrowLeft,
  UserPlus,
  Users as UsersIcon,
  ShieldCheck,
  Zap,
  Info
} from 'lucide-react';

const quickContacts = [
  { name: 'Rahul Sharma', email: 'rahul@example.com' },
  { name: 'Priya Patel', email: 'priya@example.com' },
  { name: 'Amit Verma', email: 'amit@example.com' }
];

export default function Transfers({ user }) {
  const [accounts, setAccounts] = useState([]);
  const [selectedSource, setSelectedSource] = useState(null);
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [activeTab, setActiveTab] = useState('transfer'); // 'transfer', 'manage-payees', 'add-payee'

  // Navigation states inside 'transfer'
  const [transferType, setTransferType] = useState('beneficiary'); // 'beneficiary', 'direct-email', 'own'
  const [selectedBeneficiary, setSelectedBeneficiary] = useState(null);
  const [selectedTarget, setSelectedTarget] = useState(null);
  const [recipientEmail, setRecipientEmail] = useState('');
  const [recipientName, setRecipientName] = useState('');
  
  // Realtime lookup state
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState('');
  const [recipientVerified, setRecipientVerified] = useState(false);

  // Form states (transfer)
  const [amount, setAmount] = useState('');
  const [remarks, setRemarks] = useState('');
  const [step, setStep] = useState(1); // 1: Select/Amount, 2: Review/OTP, 3: Success

  // Form states (Add Beneficiary)
  const [payeeName, setPayeeName] = useState('');
  const [payeeAccNum, setPayeeAccNum] = useState('');
  const [payeeConfirmAccNum, setPayeeConfirmAccNum] = useState('');
  const [payeeAccType, setPayeeAccType] = useState('savings');
  const [payeeIfsc, setPayeeIfsc] = useState('');
  const [payeeType, setPayeeType] = useState('other_bank'); // 'within_bank', 'other_bank'
  const [payeeCustId, setPayeeCustId] = useState(user ? user.email : '');
  const [payeePassword, setPayeePassword] = useState('');
  const [payeeOtp, setPayeeOtp] = useState('');
  const [payeeSentCode, setPayeeSentCode] = useState('');
  const [payeeOtpSent, setPayeeOtpSent] = useState(false);
  const [payeeError, setPayeeError] = useState('');
  const [payeeSuccess, setPayeeSuccess] = useState('');

  // 2FA states (transfer verification)
  const [otpCode, setOtpCode] = useState('');
  const [sentCode, setSentCode] = useState('');
  const [otpMessage, setOtpMessage] = useState('');
  const [otpError, setOtpError] = useState('');

  // Transaction results
  const [loading, setLoading] = useState(false);
  const [transactionDetails, setTransactionDetails] = useState(null);
  const [generalError, setGeneralError] = useState('');
  
  // Custom test SMS phone inputs
  const [payeePhone, setPayeePhone] = useState('');
  const [transferPhone, setTransferPhone] = useState('');

  // Timer refresh helper
  const [timeTicker, setTimeTicker] = useState(0);

  useEffect(() => {
    fetchAccounts();
    fetchBeneficiaries();
    
    // Start countdown timer updates
    const interval = setInterval(() => {
      setTimeTicker(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Update target when source changes
  useEffect(() => {
    if (selectedSource && selectedTarget && selectedSource.accountNumber === selectedTarget.accountNumber) {
      setSelectedTarget(null);
    }
  }, [selectedSource]);

  const fetchAccounts = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/account', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success && data.accounts) {
        setAccounts(data.accounts);
        if (data.accounts.length > 0) {
          setSelectedSource(data.accounts[0]);
        }
      } else {
        fallbackMockAccounts();
      }
    } catch (e) {
      fallbackMockAccounts();
    }
  };

  const fetchBeneficiaries = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/beneficiaries', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success && data.beneficiaries) {
        setBeneficiaries(data.beneficiaries);
      }
    } catch (e) {
      console.warn('Could not fetch beneficiaries:', e.message);
    }
  };

  const fallbackMockAccounts = () => {
    const list = [
      { id: 1, accountType: 'savings', accountNumber: '1234 5678 9012 3456', balance: 545220.50 },
      { id: 2, accountType: 'checking', accountNumber: '2345 6789 0123 4567', balance: 215000.00 }
    ];
    setAccounts(list);
    setSelectedSource(list[0]);
  };

  // Perform realtime name lookup
  const verifyRecipientEmail = async (emailToVerify) => {
    const email = (emailToVerify || recipientEmail).trim().toLowerCase();
    if (!email) return;

    setLookupLoading(true);
    setLookupError('');
    setRecipientVerified(false);
    setRecipientName('');

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/transfer/lookup-recipient?email=${encodeURIComponent(email)}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success) {
        setRecipientName(data.recipient.name);
        setRecipientVerified(true);
      } else {
        setLookupError(data.message || 'User not found or invalid.');
      }
    } catch (err) {
      setLookupError('Network connection issue during recipient verification.');
    } finally {
      setLookupLoading(false);
    }
  };

  // Add Beneficiary Actions
  const triggerAddPayeeOtp = async () => {
    setPayeeError('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/transfer/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ phone: payeePhone || user?.phone })
      });
      const data = await res.json();
      if (data.success) {
        setPayeeSentCode(data.otpCode);
        setPayeeOtpSent(true);
        console.log(`[SmartBank Add Beneficiary OTP via SMS]: ${data.otpCode}`);
      } else {
        setPayeeError(data.message || 'Failed to send OTP via SMS.');
      }
    } catch (e) {
      setPayeeError('Failed to connect to SMS delivery server.');
    }
  };

  const handleAddBeneficiary = async (e) => {
    e.preventDefault();
    setPayeeError('');
    setPayeeSuccess('');

    if (payeeAccNum !== payeeConfirmAccNum) {
      setPayeeError('Account numbers do not match.');
      return;
    }

    if (!/^[a-zA-Z0-9]{11}$/.test(payeeIfsc)) {
      setPayeeError('IFSC Code must be exactly 11 characters (alphanumeric).');
      return;
    }

    if (payeeOtp !== payeeSentCode) {
      setPayeeError('Incorrect security OTP validation code.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/beneficiaries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: payeeName,
          accountNumber: payeeAccNum,
          confirmAccountNumber: payeeConfirmAccNum,
          accountType: payeeAccType,
          ifscCode: payeeIfsc,
          beneficiaryType: payeeType,
          customerId: payeeCustId,
          password: payeePassword,
          otpCode: payeeOtp,
          sentCode: payeeSentCode
        })
      });

      const data = await res.json();
      if (data.success) {
        setPayeeSuccess(data.message);
        // Reset payee inputs
        setPayeeName('');
        setPayeeAccNum('');
        setPayeeConfirmAccNum('');
        setPayeeIfsc('');
        setPayeePassword('');
        setPayeeOtp('');
        setPayeeOtpSent(false);
        fetchBeneficiaries(); // Reload payees list
        
        // Redirect to list after 2 seconds
        setTimeout(() => {
          setActiveTab('manage-payees');
          setPayeeSuccess('');
        }, 2000);
      } else {
        setPayeeError(data.message || 'Failed to register beneficiary.');
      }
    } catch (err) {
      setPayeeError('Server error occurred while adding beneficiary.');
    }
  };

  const handleDemoBypassActivate = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/beneficiaries/${id}/activate-demo`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success) {
        fetchBeneficiaries(); // Reload list
      }
    } catch (e) {
      console.warn('Demo activation failed:', e.message);
    }
  };

  // Helper: check time difference for countdown
  const getPayeeCountdownInfo = (payee) => {
    if (payee.status === 'active') return { active: true };
    
    const createdTime = new Date(payee.createdAt).getTime();
    const timeDiffMs = Date.now() - createdTime;
    const coolingMs = 30 * 60 * 1000;
    
    if (timeDiffMs >= coolingMs) {
      return { active: true }; // Needs refresh/auto-activation
    }
    
    const remainingSecTotal = Math.floor((coolingMs - timeDiffMs) / 1000);
    const min = Math.floor(remainingSecTotal / 60);
    const sec = remainingSecTotal % 60;
    
    return {
      active: false,
      text: `${min}m ${String(sec).padStart(2, '0')}s`
    };
  };

  // 24 Hour Cooling off calculation
  const getRemainingCoolingLimit = (payee) => {
    if (payee.status !== 'active' || !payee.activatedAt) return 0;
    
    const activatedTime = new Date(payee.activatedAt).getTime();
    const hrsSinceActivation = (Date.now() - activatedTime) / (1000 * 60 * 60);
    
    if (hrsSinceActivation >= 24) return null; // limit no longer applies
    return 50000; // Total allowable limit
  };

  const validateTransferInitiate = async () => {
    setGeneralError('');
    if (!selectedSource) {
      setGeneralError('Please select a funding source account.');
      return;
    }

    let targetNameText = '';
    let targetDetailText = '';

    if (transferType === 'beneficiary') {
      if (!selectedBeneficiary) {
        setGeneralError('Please select a registered beneficiary.');
        return;
      }
      
      const timeInfo = getPayeeCountdownInfo(selectedBeneficiary);
      if (!timeInfo.active) {
        setGeneralError('Pending Activation: You cannot transfer funds to a beneficiary during the 30-minute security cooling period.');
        return;
      }

      targetNameText = selectedBeneficiary.name;
      targetDetailText = `${selectedBeneficiary.accountType.toUpperCase()} (•••• ${selectedBeneficiary.accountNumber.slice(-4)}) - IFSC: ${selectedBeneficiary.ifscCode}`;
    } else if (transferType === 'own') {
      if (!selectedTarget) {
        setGeneralError('Please select a target account.');
        return;
      }
      targetNameText = `Own Account (${selectedTarget.accountType.toUpperCase()})`;
      targetDetailText = selectedTarget.accountNumber;
    } else {
      if (!recipientEmail) {
        setGeneralError('Please enter a recipient email.');
        return;
      }
      if (!recipientVerified) {
        setGeneralError('Please verify the email recipient.');
        return;
      }
      targetNameText = recipientName;
      targetDetailText = recipientEmail;
    }

    const amtValue = parseFloat(amount);
    if (isNaN(amtValue) || amtValue <= 0) {
      setGeneralError('Please enter a valid transfer amount.');
      return;
    }
    if (amtValue > parseFloat(selectedSource.balance)) {
      setGeneralError(`Insufficient balance. Available: ₹${parseFloat(selectedSource.balance).toFixed(2)}`);
      return;
    }

    // Trigger OTP and await confirmation of delivery
    const otpSent = await triggerTransferOtp();
    if (otpSent) {
      setStep(2);
    }
  };

  const triggerTransferOtp = async () => {
    setOtpError('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/transfer/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ phone: transferPhone || user?.phone })
      });
      const data = await res.json();
      if (data.success) {
        setSentCode(data.otpCode);
        setOtpMessage(`A secure transaction authorization OTP code has been sent via SMS.`);
        console.log(`[SmartBank Transfer Verification OTP via SMS]: ${data.otpCode}`);
        return true;
      } else {
        setGeneralError(data.message || 'Failed to dispatch transaction OTP.');
        return false;
      }
    } catch (e) {
      setGeneralError('Failed to connect to SMS verification service.');
      return false;
    }
  };

  const handleConfirmTransfer = async (e) => {
    e.preventDefault();
    setOtpError('');
    setGeneralError('');

    if (otpCode !== sentCode) {
      setOtpError('Invalid security verification code. Please check your console/terminal.');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const payload = {
        amount: parseFloat(amount),
        description: remarks || 'Funds Transfer via Portal',
        sourceAccountNumber: selectedSource.accountNumber,
        recipientEmail: transferType === 'direct-email' ? recipientEmail : null,
        targetAccountNumber: transferType === 'own' 
          ? selectedTarget.accountNumber 
          : (transferType === 'beneficiary' ? selectedBeneficiary.accountNumber : null)
      };

      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (data.success) {
        setTransactionDetails({
          reference: 'TRX-' + Math.floor(1000000 + Math.random() * 9000000),
          date: new Date().toLocaleString(),
          amount: parseFloat(amount),
          remarks: remarks || 'Funds Transfer via Portal',
          fee: 0.00,
          sourceName: selectedSource.accountType.toUpperCase() + ` (•••• ${selectedSource.accountNumber.slice(-4)})`,
          targetName: transferType === 'own' 
            ? selectedTarget.accountType.toUpperCase() + ` (•••• ${selectedTarget.accountNumber.slice(-4)})`
            : (transferType === 'beneficiary' ? selectedBeneficiary.name : recipientName)
        });
        setStep(3);
        fetchAccounts(); // Update account balances
        fetchBeneficiaries(); // Update transferred amounts limit
      } else {
        setGeneralError(data.message || 'Transfer transaction rejected by server.');
        setStep(1);
      }
    } catch (err) {
      setGeneralError('Connection to server failed. Transaction aborted.');
      setStep(1);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickContactClick = (contact) => {
    setTransferType('direct-email');
    setRecipientEmail(contact.email);
    verifyRecipientEmail(contact.email);
  };

  const resetForm = () => {
    setAmount('');
    setRemarks('');
    setRecipientEmail('');
    setRecipientName('');
    setRecipientVerified(false);
    setSelectedTarget(null);
    setSelectedBeneficiary(null);
    setOtpCode('');
    setSentCode('');
    setStep(1);
    setGeneralError('');
  };

  const formatCardNumber = (num) => {
    return num.replace(/\s?/g, '').replace(/(\d{4})/g, '$1 ').trim();
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      
      {/* Top Navigation Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', marginBottom: '32px', gap: '8px' }}>
        <button
          onClick={() => { setActiveTab('transfer'); resetForm(); }}
          style={{
            padding: '12px 20px',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'transfer' ? '3px solid var(--primary)' : 'none',
            color: activeTab === 'transfer' ? '#fff' : 'var(--text-muted)',
            fontWeight: 600,
            fontSize: '0.95rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Send size={16} />
          <span>Make Transfer</span>
        </button>

        <button
          onClick={() => { setActiveTab('manage-payees'); fetchBeneficiaries(); }}
          style={{
            padding: '12px 20px',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'manage-payees' ? '3px solid var(--primary)' : 'none',
            color: activeTab === 'manage-payees' ? '#fff' : 'var(--text-muted)',
            fontWeight: 600,
            fontSize: '0.95rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <UsersIcon size={16} />
          <span>Manage Beneficiary</span>
        </button>

        <button
          onClick={() => { setActiveTab('add-payee'); }}
          style={{
            padding: '12px 20px',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'add-payee' ? '3px solid var(--primary)' : 'none',
            color: activeTab === 'add-payee' ? '#fff' : 'var(--text-muted)',
            fontWeight: 600,
            fontSize: '0.95rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <UserPlus size={16} />
          <span>Add a Beneficiary</span>
        </button>
      </div>

      {generalError && (
        <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--danger)', padding: '14px 18px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--danger)', marginBottom: '24px', fontSize: '0.85rem' }}>
          <AlertCircle size={18} />
          <span>{generalError}</span>
        </div>
      )}

      {/* TAB 1: MAKE TRANSFER */}
      {activeTab === 'transfer' && (
        <div>
          {/* Stepper Header for Transfer step tracking */}
          {step < 3 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', padding: '0 16px' }}>
              {[
                { label: 'Beneficiary & Amount', stepNum: 1 },
                { label: '2FA Verification', stepNum: 2 },
                { label: 'Status & Receipt', stepNum: 3 }
              ].map((item, idx) => {
                const isActive = step === item.stepNum;
                const isCompleted = step > item.stepNum;
                return (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', opacity: isActive || isCompleted ? 1 : 0.4 }}>
                    <div style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      background: isCompleted ? 'var(--success)' : isActive ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                      border: isActive ? '1px solid var(--accent)' : '1px solid var(--border-color)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      color: '#fff'
                    }}>
                      {isCompleted ? <Check size={14} /> : item.stepNum}
                    </div>
                    <span style={{ fontSize: '0.85rem', fontWeight: isActive ? 700 : 500 }}>{item.label}</span>
                    {idx < 2 && <ArrowRight size={14} style={{ marginLeft: '12px', opacity: 0.3 }} />}
                  </div>
                );
              })}
            </div>
          )}

          {step === 1 && (
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '24px' }}>
              
              {/* Form Input fields */}
              <div className="glass-panel" style={{ padding: '32px' }}>
                {generalError && (
                  <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--danger)', padding: '12px 16px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--danger)', fontSize: '0.8rem', marginBottom: '20px', fontWeight: 600 }}>
                    <AlertCircle size={18} style={{ flexShrink: 0 }} />
                    <span>{generalError}</span>
                  </div>
                )}

                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CreditCard size={18} style={{ color: 'var(--accent)' }} />
                  <span>Select Funding Account</span>
                </h3>

                {/* Account Cards selector */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '28px' }}>
                  {accounts.map(acc => {
                    const isSelected = selectedSource?.accountNumber === acc.accountNumber;
                    return (
                      <div
                        key={acc.id}
                        onClick={() => setSelectedSource(acc)}
                        style={{
                          padding: '16px 20px',
                          borderRadius: '14px',
                          border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                          background: isSelected ? 'rgba(124, 58, 237, 0.08)' : 'rgba(255,255,255,0.01)',
                          cursor: 'pointer',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <div>
                          <h4 style={{ textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent)' }}>
                            {acc.accountType} account
                          </h4>
                          <p style={{ fontSize: '0.9rem', fontWeight: 600, color: '#fff', marginTop: '4px' }}>
                            {formatCardNumber(acc.accountNumber)}
                          </p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Available Balance</p>
                          <p style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fff', marginTop: '2px' }}>
                            ₹{parseFloat(acc.balance).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <User size={18} style={{ color: 'var(--accent)' }} />
                  <span>Select Destination Type</span>
                </h3>

                {/* Tab select grouping */}
                <div style={{ display: 'flex', background: 'rgba(255,255,255,0.02)', padding: '4px', borderRadius: '10px', border: '1px solid var(--border-color)', marginBottom: '24px' }}>
                  {[
                    { id: 'beneficiary', label: 'Registered Payee' },
                    { id: 'direct-email', label: 'Direct Transfer (Email)' },
                    { id: 'own', label: 'My Own Accounts' }
                  ].map(t => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setTransferType(t.id)}
                      style={{
                        flex: 1,
                        padding: '10px 4px',
                        borderRadius: '8px',
                        background: transferType === t.id ? 'rgba(255,255,255,0.05)' : 'transparent',
                        border: 'none',
                        color: transferType === t.id ? '#fff' : 'var(--text-muted)',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>

                {/* Dests configurations */}
                {transferType === 'beneficiary' && (
                  <div style={{ marginBottom: '24px' }}>
                    <label className="form-label" htmlFor="select-payee">Choose Registered Beneficiary</label>
                    <select
                      id="select-payee"
                      className="form-input"
                      value={selectedBeneficiary ? selectedBeneficiary.id : ''}
                      onChange={e => setSelectedBeneficiary(beneficiaries.find(b => String(b.id) === e.target.value))}
                      style={{ background: '#0b0d19', color: '#fff', cursor: 'pointer' }}
                    >
                      <option value="">Select registered beneficiary</option>
                      {beneficiaries.map(b => {
                        const timeInfo = getPayeeCountdownInfo(b);
                        const isPending = !timeInfo.active;
                        return (
                          <option key={b.id} value={b.id}>
                            {b.name} - {b.accountNumber} ({b.beneficiaryType === 'within_bank' ? 'Within Bank' : 'Other Bank'}) {isPending ? `[Pending - active in ${timeInfo.text}]` : '[Active]'}
                          </option>
                        );
                      })}
                    </select>

                    {selectedBeneficiary && (() => {
                      const timeInfo = getPayeeCountdownInfo(selectedBeneficiary);
                      const limit = getRemainingCoolingLimit(selectedBeneficiary);
                      return (
                        <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {!timeInfo.active ? (
                            <div style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid var(--warning)', padding: '10px 14px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--warning)', fontSize: '0.75rem' }}>
                              <Clock size={16} />
                              <span>Activation Cooling Period active. Recipient activates in: <strong>{timeInfo.text}</strong></span>
                            </div>
                          ) : (
                            <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid var(--success)', padding: '10px 14px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--success)', fontSize: '0.75rem' }}>
                              <ShieldCheck size={16} />
                              <span>Beneficiary is active!</span>
                            </div>
                          )}

                          {limit !== null && timeInfo.active && (
                            <div style={{ background: 'rgba(124, 58, 237, 0.08)', border: '1px solid var(--border-glow)', padding: '10px 14px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent)', fontSize: '0.75rem' }}>
                              <ShieldAlert size={16} />
                              <span>First 24h Limit Active: Max ₹50,000 can be transferred (Cooling Cap).</span>
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                )}

                {transferType === 'own' && (
                  <div style={{ marginBottom: '24px' }}>
                    <label className="form-label" htmlFor="transfer-own-target">Destination Account</label>
                    <select
                      id="transfer-own-target"
                      className="form-input"
                      value={selectedTarget ? selectedTarget.accountNumber : ''}
                      onChange={e => setSelectedTarget(accounts.find(a => a.accountNumber === e.target.value))}
                      style={{ background: '#0b0d19', color: '#fff', cursor: 'pointer' }}
                    >
                      <option value="">Select target account</option>
                      {accounts
                        .filter(a => a.accountNumber !== selectedSource?.accountNumber)
                        .map(a => (
                          <option key={a.id} value={a.accountNumber}>
                            {a.accountType.toUpperCase()} - {a.accountNumber} (₹{parseFloat(a.balance).toFixed(2)})
                          </option>
                        ))}
                    </select>
                  </div>
                )}

                {transferType === 'direct-email' && (
                  <div style={{ marginBottom: '24px' }}>
                    <label className="form-label" htmlFor="recipient-direct-email">Recipient Email Address</label>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <input
                        id="recipient-direct-email"
                        type="email"
                        className="form-input"
                        placeholder="jatin@example.com"
                        value={recipientEmail}
                        onChange={e => {
                          setRecipientEmail(e.target.value);
                          setRecipientVerified(false);
                          setLookupError('');
                        }}
                        style={{ flexGrow: 1 }}
                      />
                      <button
                        type="button"
                        onClick={() => verifyRecipientEmail()}
                        disabled={lookupLoading}
                        className="btn-secondary"
                        style={{ padding: '0 16px', borderRadius: '10px' }}
                      >
                        {lookupLoading ? 'Checking...' : 'Verify'}
                      </button>
                    </div>

                    {recipientVerified && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--success)', fontSize: '0.8rem', marginTop: '10px', fontWeight: 600 }}>
                        <CheckCircle size={16} />
                        <span>Verified User: {recipientName}</span>
                      </div>
                    )}

                    {lookupError && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--danger)', fontSize: '0.8rem', marginTop: '10px', fontWeight: 600 }}>
                        <AlertCircle size={16} />
                        <span>{lookupError}</span>
                      </div>
                    )}
                  </div>
                )}

                <div style={{ marginBottom: '24px' }}>
                  <label className="form-label" htmlFor="transfer-amt-input">Amount (INR)</label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', fontSize: '1.5rem', fontWeight: 700, color: 'var(--accent)' }}>₹</span>
                    <input
                      id="transfer-amt-input"
                      type="number"
                      className="form-input"
                      placeholder="0.00"
                      value={amount}
                      onChange={e => setAmount(e.target.value)}
                      style={{ paddingLeft: '36px', fontSize: '1.5rem', fontWeight: 700 }}
                      required
                    />
                  </div>
                  
                  {/* Chips */}
                  <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                    {[1000, 5000, 10000, 50000].map(val => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setAmount(val.toString())}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '8px',
                          background: 'rgba(255,255,255,0.03)',
                          border: '1px solid var(--border-color)',
                          color: 'var(--accent)',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        +₹{val.toLocaleString('en-IN')}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ marginBottom: '28px' }}>
                  <label className="form-label" htmlFor="transfer-remark-input">Remarks (Optional)</label>
                  <input
                    id="transfer-remark-input"
                    type="text"
                    className="form-input"
                    placeholder="Utilities, bill payment, friendly transfer..."
                    value={remarks}
                    onChange={e => setRemarks(e.target.value)}
                  />
                </div>

                <div style={{ marginBottom: '28px' }}>
                  <label className="form-label" htmlFor="transfer-phone-input-step1">Mobile Phone (For SMS OTP Delivery)</label>
                  <input
                    id="transfer-phone-input-step1"
                    type="text"
                    className="form-input"
                    placeholder={user?.phone || "+919876543210"}
                    value={transferPhone}
                    onChange={e => setTransferPhone(e.target.value)}
                  />
                </div>

                <button
                  type="button"
                  onClick={validateTransferInitiate}
                  className="btn-primary"
                  style={{ width: '100%', padding: '14px', justifyContent: 'center', fontWeight: 700 }}
                >
                  <span>Initiate Security Check</span>
                  <ArrowRight size={16} />
                </button>
              </div>

              {/* Side helper panels */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div className="glass-panel" style={{ padding: '24px' }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '16px' }}>Quick Contacts</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {quickContacts.map((contact, i) => (
                      <div
                        key={i}
                        onClick={() => handleQuickContactClick(contact)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          padding: '10px 14px',
                          background: 'rgba(255,255,255,0.01)',
                          borderRadius: '10px',
                          border: '1px solid var(--border-color)',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                        className="quick-contact-card"
                      >
                        <div style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          background: 'var(--primary-glow)',
                          color: 'var(--accent)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.8rem',
                          fontWeight: 700
                        }}>
                          {contact.name[0]}
                        </div>
                        <div style={{ textAlign: 'left', overflow: 'hidden' }}>
                          <p style={{ fontSize: '0.8rem', fontWeight: 600, color: '#fff' }}>{contact.name}</p>
                          <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '140px' }}>
                            {contact.email}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="glass-panel" style={{ padding: '20px', background: 'linear-gradient(135deg, rgba(124,58,237,0.03) 0%, rgba(79,70,229,0.03) 100%)', fontSize: '0.8rem', lineHeight: 1.4, color: 'var(--text-muted)' }}>
                  <h5 style={{ fontWeight: 700, color: '#fff', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Info size={14} style={{ color: 'var(--accent)' }} />
                    <span>Transaction Regulations</span>
                  </h5>
                  <p style={{ marginBottom: '8px' }}>
                    ● <strong>30-Minute Cooling Period</strong> applies to all new beneficiary registrations before funds can be released.
                  </p>
                  <p>
                    ● <strong>₹50,000 Cooling-Off Cap</strong>: The maximum transfer limit is capped at ₹50,000 for the first 24 hours after activation.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: REVIEW & OTP */}
          {step === 2 && (
            <div className="glass-panel" style={{ padding: '32px', maxWidth: '600px', margin: '0 auto' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
                <button onClick={() => setStep(1)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                  <ArrowLeft size={20} />
                </button>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Confirm Transaction Details</h3>
              </div>

              {/* Review Summary */}
              <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '16px 20px', marginBottom: '24px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '10px 0', color: 'var(--text-muted)', fontWeight: 500 }}>Funding Source:</td>
                      <td style={{ padding: '10px 0', textAlign: 'right', fontWeight: 600 }}>
                        {selectedSource?.accountType.toUpperCase()} ({selectedSource?.accountNumber})
                      </td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '10px 0', color: 'var(--text-muted)', fontWeight: 500 }}>Destination:</td>
                      <td style={{ padding: '10px 0', textAlign: 'right', fontWeight: 600 }}>
                        {transferType === 'own' ? `Own Account (${selectedTarget?.accountNumber})` : (transferType === 'beneficiary' ? `${selectedBeneficiary.name} (${selectedBeneficiary.accountNumber})` : `${recipientName} (${recipientEmail})`)}
                      </td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '10px 0', color: 'var(--text-muted)', fontWeight: 500 }}>Transfer Amount:</td>
                      <td style={{ padding: '10px 0', textAlign: 'right', fontWeight: 700, fontSize: '1.05rem', color: '#fff' }}>
                        ₹{parseFloat(amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '10px 0', color: 'var(--text-muted)', fontWeight: 500 }}>Transfer Fee:</td>
                      <td style={{ padding: '10px 0', textAlign: 'right', color: 'var(--success)', fontWeight: 600 }}>₹0.00 (Free)</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '10px 0', color: 'var(--text-muted)', fontWeight: 700 }}>Total Debit Amount:</td>
                      <td style={{ padding: '10px 0', textAlign: 'right', fontWeight: 800, fontSize: '1.15rem', color: 'var(--accent)' }}>
                        ₹{parseFloat(amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <form onSubmit={handleConfirmTransfer} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ background: 'rgba(124, 58, 237, 0.08)', border: '1px solid var(--border-glow)', padding: '16px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--accent)', fontSize: '0.8rem' }}>
                  <ShieldAlert size={18} style={{ flexShrink: 0 }} />
                  <span>{otpMessage}</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label className="form-label" htmlFor="transfer-phone-input">Mobile Phone (For SMS OTP Delivery)</label>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <input
                      id="transfer-phone-input"
                      type="text"
                      className="form-input"
                      placeholder={user?.phone || "+919876543210"}
                      value={transferPhone}
                      onChange={e => setTransferPhone(e.target.value)}
                      style={{ flexGrow: 1 }}
                    />
                    <button
                      type="button"
                      onClick={triggerTransferOtp}
                      className="btn-secondary"
                      style={{ padding: '0 16px', borderRadius: '10px', whiteSpace: 'nowrap' }}
                    >
                      Resend SMS OTP
                    </button>
                  </div>
                </div>

                <div>
                  <label className="form-label" htmlFor="transfer-otp-input" style={{ textAlign: 'center', marginBottom: '10px' }}>Enter 2FA Transaction OTP</label>
                  <input
                    id="transfer-otp-input"
                    type="text"
                    className="form-input"
                    placeholder="••••••"
                    value={otpCode}
                    onChange={e => setOtpCode(e.target.value)}
                    maxLength={6}
                    style={{ textAlign: 'center', letterSpacing: '0.4em', fontSize: '1.6rem', fontWeight: 700 }}
                    required
                  />
                  {otpError && (
                    <p style={{ color: 'var(--danger)', fontSize: '0.75rem', marginTop: '6px', fontWeight: 600 }}>
                      {otpError}
                    </p>
                  )}
                  <span style={{ fontSize: '0.75rem', color: 'var(--accent)', display: 'block', marginTop: '6px', textAlign: 'center', fontWeight: 600 }}>
                    Demo Verification OTP: {sentCode}
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary"
                  style={{ width: '100%', padding: '14px', justifyContent: 'center', fontWeight: 700 }}
                >
                  <span>{loading ? 'Executing Transaction...' : 'Authorize Transaction'}</span>
                  <Send size={16} />
                </button>
              </form>
            </div>
          )}

          {/* STEP 3: SUCCESS RECEIPT */}
          {step === 3 && transactionDetails && (
            <div className="glass-panel" style={{ padding: '32px', maxWidth: '550px', margin: '0 auto', textAlign: 'center' }}>
              <div style={{ position: 'relative', display: 'inline-flex', marginBottom: '20px' }}>
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '80px', height: '80px', background: 'rgba(16, 185, 129, 0.2)', filter: 'blur(15px)', borderRadius: '50%' }} />
                <CheckCircle size={64} style={{ color: 'var(--success)', position: 'relative' }} />
              </div>

              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', marginBottom: '4px' }}>Transaction Approved</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '28px' }}>
                Funds have been routed and credited to the destination account successfully.
              </p>

              {/* Receipt layout */}
              <div style={{ background: '#0b0d19', border: '1px dashed var(--border-color)', borderRadius: '12px', padding: '24px', textAlign: 'left', marginBottom: '28px', position: 'relative', overflow: 'hidden' }}>
                
                <div style={{ position: 'absolute', top: '-10px', right: '-10px', opacity: 0.05, transform: 'rotate(25deg)' }}>
                  <FileText size={150} />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '12px', marginBottom: '12px' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 800, letterSpacing: '0.05em', color: 'var(--accent)' }}>SMARTBANK PORTAL RECEIPT</span>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>OFFICIAL RECORD</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.8rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Reference Number:</span>
                    <span style={{ fontWeight: 600, color: '#fff' }}>{transactionDetails.reference}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Date & Time:</span>
                    <span style={{ fontWeight: 600, color: '#fff' }}>{transactionDetails.date}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>From Account:</span>
                    <span style={{ fontWeight: 600, color: '#fff' }}>{transactionDetails.sourceName}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>To Destination:</span>
                    <span style={{ fontWeight: 600, color: '#fff' }}>{transactionDetails.targetName}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Remarks:</span>
                    <span style={{ fontWeight: 600, color: '#fff' }}>{transactionDetails.remarks}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '10px', marginTop: '6px' }}>
                    <span style={{ color: 'var(--text-muted)', fontWeight: 700 }}>Total Transferred:</span>
                    <span style={{ fontWeight: 800, color: 'var(--success)', fontSize: '1.1rem' }}>
                      ₹{transactionDetails.amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => window.print()}
                  className="btn-secondary"
                  style={{ flex: 1, justifyContent: 'center', gap: '8px' }}
                >
                  <FileText size={16} />
                  <span>Print Receipt</span>
                </button>
                <button
                  onClick={resetForm}
                  className="btn-primary"
                  style={{ flex: 1, justifyContent: 'center' }}
                >
                  <span>Make Another Transfer</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: MANAGE BENEFICIARIES */}
      {activeTab === 'manage-payees' && (
        <div className="glass-panel" style={{ padding: '32px' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '8px' }}>Registered Beneficiaries</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '24px' }}>
            View and manage authorized payees. Newly added beneficiaries require a 30-minute cooling window before they become active.
          </p>

          {beneficiaries.length === 0 ? (
            <div style={{ padding: '40px 0', textDecoration: 'none', textAlign: 'center' }}>
              <UsersIcon size={48} style={{ color: 'var(--text-muted)', opacity: 0.3, marginBottom: '12px' }} />
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No registered beneficiaries found.</p>
              <button
                onClick={() => setActiveTab('add-payee')}
                className="btn-primary"
                style={{ marginTop: '16px', fontSize: '0.85rem', padding: '8px 16px' }}
              >
                Add Your First Payee
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {beneficiaries.map(payee => {
                const timeInfo = getPayeeCountdownInfo(payee);
                const isActive = timeInfo.active;
                return (
                  <div
                    key={payee.id}
                    style={{
                      padding: '18px 24px',
                      borderRadius: '14px',
                      border: '1px solid var(--border-color)',
                      background: 'rgba(255,255,255,0.01)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '16px'
                    }}
                  >
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                      <div style={{
                        width: '44px',
                        height: '44px',
                        borderRadius: '50%',
                        background: isActive ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                        color: isActive ? 'var(--success)' : 'var(--warning)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700
                      }}>
                        {payee.name[0]}
                      </div>
                      <div style={{ textAlign: 'left' }}>
                        <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff' }}>{payee.name}</h4>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                          Account: {payee.accountNumber} ({payee.accountType.toUpperCase()}) | IFSC: {payee.ifscCode}
                        </p>
                        <span className={`badge ${isActive ? 'badge-success' : 'badge-warning'}`} style={{ marginTop: '6px', display: 'inline-block' }}>
                          {isActive ? 'Active' : 'Activation Pending'}
                        </span>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                      {!isActive ? (
                        <>
                          <div style={{ fontSize: '0.8rem', color: 'var(--warning)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Clock size={14} />
                            <span>Activates in {timeInfo.text}</span>
                          </div>
                          <button
                            onClick={() => handleDemoBypassActivate(payee.id)}
                            className="btn-secondary"
                            style={{ padding: '6px 12px', fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '4px', border: '1px solid var(--border-glow)' }}
                          >
                            <Zap size={10} />
                            <span>Activate Now (Demo Bypass)</span>
                          </button>
                        </>
                      ) : (
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '4px', textAlign: 'right' }}>
                          <span>Activated: {new Date(payee.activatedAt || payee.createdAt).toLocaleDateString()}</span>
                          {getRemainingCoolingLimit(payee) !== null && (
                            <span style={{ color: 'var(--accent)', fontWeight: 600 }}>Cooling Limit: ₹50,000 cap active</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: ADD BENEFICIARY */}
      {activeTab === 'add-payee' && (
        <div className="glass-panel" style={{ padding: '32px', maxWidth: '700px', margin: '0 auto' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '6px' }}>Register New Beneficiary</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '28px' }}>
            Verify credentials and secure your account while adding a new payee.
          </p>

          {payeeError && (
            <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--danger)', padding: '12px 16px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--danger)', marginBottom: '20px', fontSize: '0.8rem' }}>
              <AlertCircle size={16} />
              <span>{payeeError}</span>
            </div>
          )}

          {payeeSuccess && (
            <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid var(--success)', padding: '12px 16px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--success)', marginBottom: '20px', fontSize: '0.8rem' }}>
              <CheckCircle size={16} />
              <span>{payeeSuccess}</span>
            </div>
          )}

          <form onSubmit={handleAddBeneficiary} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label className="form-label" htmlFor="payee-name-input">Beneficiary Name</label>
                <input
                  id="payee-name-input"
                  type="text"
                  className="form-input"
                  placeholder="Rahul Sharma"
                  value={payeeName}
                  onChange={e => setPayeeName(e.target.value)}
                  required
                />
              </div>
              
              <div>
                <label className="form-label" htmlFor="payee-type-select">Beneficiary Type</label>
                <select
                  id="payee-type-select"
                  className="form-input"
                  value={payeeType}
                  onChange={e => setPayeeType(e.target.value)}
                  style={{ background: '#0b0d19', cursor: 'pointer' }}
                >
                  <option value="other_bank">Transfer to other bank (NEFT/RTGS/IMPS)</option>
                  <option value="within_bank">Within SmartBank</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label className="form-label" htmlFor="payee-acc-input">Account Number</label>
                <input
                  id="payee-acc-input"
                  type="text"
                  className="form-input"
                  placeholder="3456789012345"
                  value={payeeAccNum}
                  onChange={e => setPayeeAccNum(e.target.value)}
                  required
                />
              </div>
              
              <div>
                <label className="form-label" htmlFor="payee-confirm-acc-input">Confirm Account Number</label>
                <input
                  id="payee-confirm-acc-input"
                  type="text"
                  className="form-input"
                  placeholder="Confirm Account Number"
                  value={payeeConfirmAccNum}
                  onChange={e => setPayeeConfirmAccNum(e.target.value)}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label className="form-label" htmlFor="payee-acctype-select">Account Type</label>
                <select
                  id="payee-acctype-select"
                  className="form-input"
                  value={payeeAccType}
                  onChange={e => setPayeeAccType(e.target.value)}
                  style={{ background: '#0b0d19', cursor: 'pointer' }}
                >
                  <option value="savings">Savings Account</option>
                  <option value="current">Current Account</option>
                  <option value="overdraft">Overdraft Account</option>
                </select>
              </div>
              
              <div>
                <label className="form-label" htmlFor="payee-ifsc-input">IFSC Code</label>
                <input
                  id="payee-ifsc-input"
                  type="text"
                  className="form-input"
                  placeholder="SBIN0001234"
                  value={payeeIfsc}
                  onChange={e => setPayeeIfsc(e.target.value)}
                  maxLength={11}
                  required
                />
              </div>
            </div>

            {/* Verification Credentials */}
            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '20px', marginTop: '10px' }}>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--accent)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ShieldCheck size={16} />
                <span>SmartBank Security Authorization</span>
              </h4>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label className="form-label" htmlFor="payee-custid-input">Customer ID</label>
                  <input
                    id="payee-custid-input"
                    type="text"
                    className="form-input"
                    placeholder="Enter Customer ID"
                    value={payeeCustId}
                    onChange={e => setPayeeCustId(e.target.value)}
                    required
                  />
                </div>
                
                <div>
                  <label className="form-label" htmlFor="payee-password-input">NetBanking Password / IPIN</label>
                  <input
                    id="payee-password-input"
                    type="password"
                    className="form-input"
                    placeholder="••••••••"
                    value={payeePassword}
                    onChange={e => setPayeePassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label className="form-label" htmlFor="payee-phone-input">Mobile Phone (For SMS OTP Delivery)</label>
                <input
                  id="payee-phone-input"
                  type="text"
                  className="form-input"
                  placeholder={user?.phone || "+919876543210"}
                  value={payeePhone}
                  onChange={e => setPayeePhone(e.target.value)}
                />
              </div>

              <div>
                <label className="form-label" htmlFor="payee-otp-input">One-Time Password (OTP)</label>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <input
                    id="payee-otp-input"
                    type="text"
                    className="form-input"
                    placeholder="Enter 6-digit OTP"
                    value={payeeOtp}
                    onChange={e => setPayeeOtp(e.target.value)}
                    maxLength={6}
                    style={{ flexGrow: 1 }}
                    required
                  />
                  <button
                    type="button"
                    onClick={triggerAddPayeeOtp}
                    className="btn-secondary"
                    style={{ padding: '0 16px', borderRadius: '10px', whiteSpace: 'nowrap' }}
                  >
                    {payeeOtpSent ? 'Resend OTP' : 'Get OTP'}
                  </button>
                </div>

                {payeeOtpSent && (
                  <span style={{ fontSize: '0.75rem', color: 'var(--accent)', display: 'block', marginTop: '6px', fontWeight: 600 }}>
                    Demo Registration OTP Code: {payeeSentCode} (Sent to registered mobile)
                  </span>
                )}
              </div>
            </div>

            <button
              type="submit"
              className="btn-primary"
              style={{ width: '100%', padding: '14px', justifyContent: 'center', fontWeight: 700, marginTop: '16px' }}
            >
              <UserPlus size={18} />
              <span>Authorize & Register Payee</span>
            </button>
          </form>
        </div>
      )}

    </div>
  );
}
