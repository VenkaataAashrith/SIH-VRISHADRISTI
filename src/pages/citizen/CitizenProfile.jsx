import React, { useState } from 'react';
import { useDemo } from '../../context/DemoContext';
import {
  User,
  Phone,
  MapPin,
  Globe,
  Bookmark,
  ArrowLeft,
  LogOut,
  Edit3,
  Check,
  ShieldCheck,
  ShieldAlert,
  CreditCard,
  Lock,
  CheckCircle2,
  RefreshCw,
  FileCheck,
  AlertCircle
} from 'lucide-react';
import SimulationBadge from '../../components/common/SimulationBadge';

export default function CitizenProfile() {
  const { navigateTo, citizenUser, setCitizenUser, selectedLocation } = useDemo();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(citizenUser?.name || 'Aashrith');
  const [mobile, setMobile] = useState(citizenUser?.mobile || '+91 9876543210');
  const [language, setLanguage] = useState(citizenUser?.language || 'English');

  // Verification Form State
  const [verificationMode, setVerificationMode] = useState('AADHAAR'); // 'AADHAAR' | 'PAN'
  const [rawAadhaar, setRawAadhaar] = useState(citizenUser?.aadhaarNumber ? citizenUser.aadhaarNumber.replace(/\D/g, '') : '');
  const [rawPan, setRawPan] = useState(citizenUser?.panNumber || '');
  const [isVerifying, setIsVerifying] = useState(false);
  const [otpStep, setOtpStep] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [verifyError, setVerifyError] = useState('');
  const [verifySuccessMsg, setVerifySuccessMsg] = useState('');
  const [showVerifyModal, setShowVerifyModal] = useState(false);

  // Format Aadhaar with spaces (XXXX XXXX XXXX)
  const formatAadhaar = (val) => {
    const cleaned = val.replace(/\D/g, '').slice(0, 12);
    return cleaned.replace(/(\d{4})(?=\d)/g, '$1 ');
  };

  // Format PAN in uppercase alphanumeric (ABCDE1234F)
  const formatPan = (val) => {
    return val.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10);
  };

  const handleSave = () => {
    setCitizenUser((prev) => ({
      ...prev,
      name,
      mobile,
      language
    }));
    setIsEditing(false);
  };

  const handleLogout = () => {
    navigateTo('landing');
  };

  // Start Verification Process
  const handleInitiateVerification = () => {
    setVerifyError('');
    if (verificationMode === 'AADHAAR') {
      const cleaned = rawAadhaar.replace(/\D/g, '');
      if (cleaned.length !== 12) {
        setVerifyError('Please enter a valid 12-digit Aadhaar Number.');
        return;
      }
    } else {
      const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
      if (!panRegex.test(rawPan.trim().toUpperCase())) {
        setVerifyError('Please enter a valid 10-character PAN (e.g. ABCDE1234F).');
        return;
      }
    }

    setIsVerifying(true);
    // Simulate OTP dispatch from UIDAI / NSDL
    setTimeout(() => {
      setIsVerifying(false);
      setOtpStep(true);
      setOtpCode('482910'); // Auto-filled demo OTP
    }, 900);
  };

  // Confirm Verification
  const handleConfirmVerification = () => {
    if (otpCode.length < 4) {
      setVerifyError('Please enter the 6-digit OTP.');
      return;
    }

    setIsVerifying(true);
    setVerifyError('');

    setTimeout(() => {
      setIsVerifying(false);
      setOtpStep(false);
      setShowVerifyModal(false);

      const cleanedAadhaar = rawAadhaar.replace(/\D/g, '');
      const maskedAadhaar = cleanedAadhaar.length === 12
        ? `XXXX-XXXX-${cleanedAadhaar.slice(-4)}`
        : citizenUser?.aadhaarNumber || 'XXXX-XXXX-8921';
      
      const cleanPan = rawPan.trim().toUpperCase() || citizenUser?.panNumber || 'ABCDE1234F';

      setCitizenUser((prev) => ({
        ...prev,
        isVerified: true,
        aadhaarNumber: verificationMode === 'AADHAAR' ? maskedAadhaar : (prev.aadhaarNumber || 'XXXX-XXXX-8921'),
        panNumber: verificationMode === 'PAN' ? cleanPan : (prev.panNumber || 'ABCDE1234F'),
        verifiedDocType: verificationMode,
        verificationDate: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
      }));

      setVerifySuccessMsg('Identity successfully verified via official Government Registry!');
      setTimeout(() => setVerifySuccessMsg(''), 5000);
    }, 1100);
  };

  const handleResetVerification = () => {
    setCitizenUser((prev) => ({
      ...prev,
      isVerified: false,
      aadhaarNumber: '',
      panNumber: '',
      verifiedDocType: null,
      verificationDate: null
    }));
    setRawAadhaar('');
    setRawPan('');
    setOtpStep(false);
  };

  return (
    <div className="citizen-mobile-viewport" style={{ paddingBottom: '30px' }}>
      {/* Header */}
      <div
        style={{
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          background: 'rgba(11, 18, 32, 0.95)',
          position: 'sticky',
          top: '46px',
          zIndex: 800,
          backdropFilter: 'blur(12px)'
        }}
      >
        <button
          onClick={() => navigateTo('citizen-home')}
          style={{ color: '#94A3B8', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px' }}
        >
          <ArrowLeft size={16} /> Back
        </button>

        <h1 style={{ fontSize: '17px', color: '#F8FAFC', fontWeight: 700 }}>
          My Profile
        </h1>

        <SimulationBadge text="CITIZEN ID" />
      </div>

      <div style={{ padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* Verification Success Toast */}
        {verifySuccessMsg && (
          <div
            style={{
              padding: '12px 16px',
              borderRadius: '10px',
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid #10B981',
              color: '#34D399',
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <CheckCircle2 size={18} color="#10B981" />
            <span>{verifySuccessMsg}</span>
          </div>
        )}

        {/* Avatar & Main Identity Card */}
        <div className="glass-panel" style={{ padding: '24px 18px', textAlign: 'center' }}>
          <div
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: citizenUser?.isVerified
                ? 'linear-gradient(135deg, #059669, #10B981)'
                : 'linear-gradient(135deg, #0284C7, #38BDF8)',
              margin: '0 auto 14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '36px',
              border: citizenUser?.isVerified ? '3px solid #10B981' : '3px solid rgba(56, 189, 248, 0.5)',
              boxShadow: citizenUser?.isVerified ? '0 4px 16px rgba(16, 185, 129, 0.35)' : '0 4px 16px rgba(56, 189, 248, 0.25)'
            }}
          >
            {citizenUser?.isVerified ? '🛡️' : '👤'}
          </div>

          {isEditing ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxWidth: '280px', margin: '0 auto' }}>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full Name"
                style={{
                  padding: '8px 12px',
                  background: 'rgba(15, 23, 42, 0.8)',
                  border: '1px solid #38BDF8',
                  borderRadius: '8px',
                  color: '#FFFFFF',
                  textAlign: 'center',
                  fontSize: '16px',
                  fontWeight: 700
                }}
              />
              <input
                type="text"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                placeholder="Mobile"
                style={{
                  padding: '8px 12px',
                  background: 'rgba(15, 23, 42, 0.8)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '8px',
                  color: '#CBD5E1',
                  textAlign: 'center',
                  fontSize: '13px'
                }}
              />
            </div>
          ) : (
            <>
              <h2 style={{ fontSize: '20px', color: '#F8FAFC', fontWeight: 800, marginBottom: '4px' }}>
                {citizenUser?.name || 'Aashrith'}
              </h2>
              <div style={{ fontSize: '13px', color: '#94A3B8', fontFamily: 'var(--font-mono)' }}>
                {citizenUser?.mobile || '+91 9876543210'}
              </div>
            </>
          )}

          {/* DYNAMIC VERIFICATION BADGE */}
          <div style={{ marginTop: '14px', display: 'flex', justifyContent: 'center' }}>
            {citizenUser?.isVerified ? (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'rgba(16, 185, 129, 0.15)',
                  border: '1px solid #10B981',
                  color: '#34D399',
                  padding: '6px 14px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: 700
                }}
              >
                <ShieldCheck size={15} color="#10B981" />
                Verified Citizen (Govt ID Linked)
              </span>
            ) : (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'rgba(239, 68, 68, 0.12)',
                  border: '1px solid rgba(239, 68, 68, 0.4)',
                  color: '#F87171',
                  padding: '6px 14px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: 600
                }}
              >
                <ShieldAlert size={15} color="#EF4444" />
                Unverified Citizen Profile
              </span>
            )}
          </div>
        </div>

        {/* SECTION 1: CITIZEN VERIFICATION (AADHAAR / PAN) */}
        <div
          className="glass-panel"
          style={{
            padding: '20px 18px',
            border: citizenUser?.isVerified ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(234, 179, 8, 0.35)',
            background: citizenUser?.isVerified
              ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, rgba(15, 23, 42, 0.8) 100%)'
              : 'linear-gradient(135deg, rgba(234, 179, 8, 0.06) 0%, rgba(15, 23, 42, 0.8) 100%)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CreditCard size={18} color={citizenUser?.isVerified ? '#10B981' : '#EAB308'} />
              <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#FFFFFF', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                Identity Verification (Aadhaar / PAN)
              </h3>
            </div>
            <SimulationBadge text="KYC PORTAL" />
          </div>

          {citizenUser?.isVerified ? (
            /* VERIFIED STATE DETAILS */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ fontSize: '12px', color: '#94A3B8' }}>
                Your identity is authenticated with official government records. In emergency situations, your SOS alerts receive verified priority routing at the Officer Command Center.
              </div>

              <div
                style={{
                  background: 'rgba(15, 23, 42, 0.9)',
                  border: '1px solid rgba(16, 185, 129, 0.25)',
                  borderRadius: '10px',
                  padding: '12px 14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}
              >
                {citizenUser?.aadhaarNumber && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '13px' }}>
                    <span style={{ color: '#94A3B8' }}>Aadhaar Number:</span>
                    <span style={{ color: '#F8FAFC', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                      {citizenUser.aadhaarNumber}
                    </span>
                  </div>
                )}

                {citizenUser?.panNumber && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '13px' }}>
                    <span style={{ color: '#94A3B8' }}>PAN Card:</span>
                    <span style={{ color: '#F8FAFC', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                      {citizenUser.panNumber}
                    </span>
                  </div>
                )}

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px', paddingTop: '4px', borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
                  <span style={{ color: '#64748B' }}>Verified Date:</span>
                  <span style={{ color: '#10B981', fontWeight: 600 }}>
                    {citizenUser?.verificationDate || '12 Sep 2026'} • UIDAI Validated
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
                <button
                  onClick={() => setShowVerifyModal(true)}
                  className="btn-secondary"
                  style={{ flex: 1, padding: '9px', fontSize: '12px' }}
                >
                  Update / Re-verify
                </button>
                <button
                  onClick={handleResetVerification}
                  style={{
                    padding: '9px 14px',
                    borderRadius: '8px',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    background: 'rgba(239, 68, 68, 0.08)',
                    color: '#F87171',
                    fontSize: '12px',
                    fontWeight: 600
                  }}
                >
                  Unlink
                </button>
              </div>
            </div>
          ) : (
            /* UNVERIFIED STATE CALL TO ACTION */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ fontSize: '12px', color: '#CBD5E1', lineHeight: 1.4 }}>
                Please provide your <strong>12-digit Aadhaar Number</strong> or <strong>10-character PAN Card</strong> to unlock the <em>Verified Citizen</em> badge and prevent emergency dispatch false-alarm delays.
              </div>

              <button
                onClick={() => setShowVerifyModal(true)}
                className="btn-primary"
                style={{
                  width: '100%',
                  padding: '12px',
                  fontSize: '13px',
                  background: 'linear-gradient(135deg, #0284C7, #0EA5E9)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  fontWeight: 700
                }}
              >
                <Lock size={15} /> VERIFY WITH AADHAAR / PAN NOW
              </button>
            </div>
          )}
        </div>

        {/* Profile Details List */}
        <div className="glass-panel" style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Primary Location */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <MapPin size={18} color="#38BDF8" />
              <div>
                <div style={{ fontSize: '11px', color: '#94A3B8', textTransform: 'uppercase' }}>Primary Location</div>
                <div style={{ fontSize: '14px', color: '#F8FAFC', fontWeight: 600 }}>{selectedLocation}</div>
              </div>
            </div>
            <button
              onClick={() => navigateTo('citizen-location')}
              style={{ fontSize: '12px', color: '#38BDF8', fontWeight: 600 }}
            >
              Edit
            </button>
          </div>

          <div style={{ height: '1px', background: 'rgba(255, 255, 255, 0.06)' }} />

          {/* Language */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Globe size={18} color="#8B5CF6" />
              <div>
                <div style={{ fontSize: '11px', color: '#94A3B8', textTransform: 'uppercase' }}>Alert Language</div>
                <div style={{ fontSize: '14px', color: '#F8FAFC', fontWeight: 600 }}>{language}</div>
              </div>
            </div>
            {isEditing ? (
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                style={{
                  background: '#0F172A',
                  color: '#FFFFFF',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '6px',
                  padding: '4px 8px',
                  fontSize: '12px'
                }}
              >
                <option value="English">English</option>
                <option value="Telugu">Telugu (తెలుగు)</option>
                <option value="Hindi">Hindi (हिंदी)</option>
              </select>
            ) : null}
          </div>

          <div style={{ height: '1px', background: 'rgba(255, 255, 255, 0.06)' }} />

          {/* Saved Locations */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <Bookmark size={16} color="#EAB308" />
              <div style={{ fontSize: '12px', color: '#CBD5E1', fontWeight: 600, textTransform: 'uppercase' }}>
                Saved Locations
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingLeft: '24px' }}>
              <div style={{ fontSize: '13px', color: '#E2E8F0' }}>
                <strong>Home:</strong> Pragathi Nagar, Kukatpally (500072)
              </div>
              <div style={{ fontSize: '13px', color: '#E2E8F0' }}>
                <strong>College:</strong> JNTUH University Campus, Kukatpally (500085)
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons: EDIT PROFILE / LOG OUT */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {isEditing ? (
            <button
              onClick={handleSave}
              className="btn-success"
              style={{ width: '100%', padding: '12px', fontSize: '14px' }}
            >
              <Check size={16} /> SAVE CHANGES
            </button>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="btn-secondary"
              style={{ width: '100%', padding: '12px', fontSize: '14px' }}
            >
              <Edit3 size={16} /> EDIT PROFILE
            </button>
          )}

          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '10px',
              border: '1px solid rgba(239, 68, 68, 0.35)',
              background: 'rgba(239, 68, 68, 0.08)',
              color: '#F87171',
              fontSize: '14px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            <LogOut size={16} /> LOG OUT
          </button>
        </div>

      </div>

      {/* VERIFICATION MODAL */}
      {showVerifyModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
            background: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px'
          }}
        >
          <div
            className="glass-panel"
            style={{
              width: '100%',
              maxWidth: '420px',
              padding: '24px',
              border: '1.5px solid #38BDF8',
              boxShadow: '0 0 30px rgba(56, 189, 248, 0.25)',
              borderRadius: '16px'
            }}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldCheck size={20} color="#38BDF8" />
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#FFFFFF' }}>
                  Citizen Identity Verification
                </h3>
              </div>
              <button
                onClick={() => {
                  setShowVerifyModal(false);
                  setOtpStep(false);
                  setVerifyError('');
                }}
                style={{ color: '#94A3B8', fontSize: '18px', fontWeight: 700 }}
              >
                ✕
              </button>
            </div>

            {verifyError && (
              <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid #EF4444', color: '#FCA5A5', padding: '8px 12px', borderRadius: '8px', fontSize: '12px', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <AlertCircle size={14} />
                <span>{verifyError}</span>
              </div>
            )}

            {!otpStep ? (
              /* STEP 1: ENTER AADHAAR OR PAN NUMBER */
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Mode Selector Tabs */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', background: 'rgba(15, 23, 42, 0.8)', padding: '4px', borderRadius: '10px' }}>
                  <button
                    onClick={() => {
                      setVerificationMode('AADHAAR');
                      setVerifyError('');
                    }}
                    style={{
                      padding: '8px',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: 700,
                      border: 'none',
                      background: verificationMode === 'AADHAAR' ? '#0284C7' : 'transparent',
                      color: verificationMode === 'AADHAAR' ? '#FFFFFF' : '#94A3B8',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    Aadhaar (UIDAI)
                  </button>
                  <button
                    onClick={() => {
                      setVerificationMode('PAN');
                      setVerifyError('');
                    }}
                    style={{
                      padding: '8px',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: 700,
                      border: 'none',
                      background: verificationMode === 'PAN' ? '#0284C7' : 'transparent',
                      color: verificationMode === 'PAN' ? '#FFFFFF' : '#94A3B8',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    PAN Card (NSDL)
                  </button>
                </div>

                {verificationMode === 'AADHAAR' ? (
                  <div>
                    <label style={{ fontSize: '12px', color: '#CBD5E1', display: 'block', marginBottom: '6px' }}>
                      12-Digit Aadhaar Number
                    </label>
                    <input
                      type="text"
                      maxLength={14}
                      value={formatAadhaar(rawAadhaar)}
                      onChange={(e) => setRawAadhaar(e.target.value)}
                      placeholder="e.g. 5489 1234 9876"
                      style={{
                        width: '100%',
                        padding: '12px 14px',
                        background: 'rgba(15, 23, 42, 0.9)',
                        border: '1px solid rgba(56, 189, 248, 0.4)',
                        borderRadius: '8px',
                        color: '#FFFFFF',
                        fontSize: '15px',
                        fontFamily: 'var(--font-mono)',
                        letterSpacing: '0.08em'
                      }}
                    />
                    <div style={{ fontSize: '11px', color: '#64748B', marginTop: '4px' }}>
                      Secure 256-bit UIDAI authentication simulation.
                    </div>
                  </div>
                ) : (
                  <div>
                    <label style={{ fontSize: '12px', color: '#CBD5E1', display: 'block', marginBottom: '6px' }}>
                      10-Character PAN Card Number
                    </label>
                    <input
                      type="text"
                      maxLength={10}
                      value={formatPan(rawPan)}
                      onChange={(e) => setRawPan(e.target.value)}
                      placeholder="e.g. ABCDE1234F"
                      style={{
                        width: '100%',
                        padding: '12px 14px',
                        background: 'rgba(15, 23, 42, 0.9)',
                        border: '1px solid rgba(56, 189, 248, 0.4)',
                        borderRadius: '8px',
                        color: '#FFFFFF',
                        fontSize: '15px',
                        fontFamily: 'var(--font-mono)',
                        letterSpacing: '0.08em'
                      }}
                    />
                    <div style={{ fontSize: '11px', color: '#64748B', marginTop: '4px' }}>
                      Income Tax Department NSDL registry verification.
                    </div>
                  </div>
                )}

                <div style={{ fontSize: '11px', color: '#94A3B8', background: 'rgba(255, 255, 255, 0.03)', padding: '10px', borderRadius: '8px' }}>
                  🔒 <strong>Privacy Assurance:</strong> Identity details are encrypted and utilized solely to validate genuine citizen emergencies during extreme weather events.
                </div>

                <button
                  onClick={handleInitiateVerification}
                  disabled={isVerifying}
                  className="btn-primary"
                  style={{ width: '100%', padding: '12px', fontSize: '13px', fontWeight: 700 }}
                >
                  {isVerifying ? 'Connecting to Govt Registry...' : 'Send Verification OTP →'}
                </button>
              </div>
            ) : (
              /* STEP 2: ENTER OTP */
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '28px', marginBottom: '6px' }}>📲</div>
                  <h4 style={{ fontSize: '15px', fontWeight: 800, color: '#FFFFFF', marginBottom: '4px' }}>
                    Enter 6-Digit OTP
                  </h4>
                  <div style={{ fontSize: '12px', color: '#94A3B8' }}>
                    OTP sent to Aadhaar-linked mobile <strong>{citizenUser?.mobile || '+91 98765 43210'}</strong>
                  </div>
                </div>

                <div>
                  <input
                    type="text"
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="482910"
                    style={{
                      width: '100%',
                      padding: '12px',
                      background: 'rgba(15, 23, 42, 0.9)',
                      border: '1px solid #10B981',
                      borderRadius: '8px',
                      color: '#34D399',
                      fontSize: '20px',
                      fontFamily: 'var(--font-mono)',
                      textAlign: 'center',
                      letterSpacing: '0.2em',
                      fontWeight: 800
                    }}
                  />
                  <div style={{ fontSize: '11px', color: '#10B981', textAlign: 'center', marginTop: '4px' }}>
                    ✓ Demo OTP pre-filled: 482910
                  </div>
                </div>

                <button
                  onClick={handleConfirmVerification}
                  disabled={isVerifying}
                  className="btn-success"
                  style={{ width: '100%', padding: '12px', fontSize: '14px', fontWeight: 700 }}
                >
                  {isVerifying ? 'Validating Registry Signature...' : '✓ CONFIRM & VERIFY CITIZEN'}
                </button>

                <button
                  onClick={() => setOtpStep(false)}
                  style={{ background: 'transparent', border: 'none', color: '#94A3B8', fontSize: '12px', cursor: 'pointer' }}
                >
                  ← Back to document entry
                </button>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
