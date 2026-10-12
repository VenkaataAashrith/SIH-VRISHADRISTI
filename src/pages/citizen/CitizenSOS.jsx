import React, { useState, useEffect } from 'react';
import { useDemo } from '../../context/DemoContext';
import { SOS_CATEGORIES } from '../../data/mockCitizenData';
import SimulationBadge from '../../components/common/SimulationBadge';
import {
  AlertOctagon,
  CheckCircle2,
  ShieldAlert,
  ShieldCheck,
  ArrowLeft,
  Send,
  PhoneCall,
  Clock,
  AlertTriangle,
  MessageSquarePlus,
  RefreshCw
} from 'lucide-react';

export default function CitizenSOS() {
  const { navigateTo, addSOS, activeTab, setActiveTab, selectedLocation, citizenUser, lastSosSentId } = useDemo();
  const [selectedCategory, setSelectedCategory] = useState('Flooding');
  const [additionalNote, setAdditionalNote] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [confirmedId, setConfirmedId] = useState('#1048');

  // Anti-Spam Cooldown & Append Note State
  const [cooldownRemaining, setCooldownRemaining] = useState(0);
  const [spamAttemptCount, setSpamAttemptCount] = useState(0);
  const [showSpamWarning, setShowSpamWarning] = useState(false);
  const [appendNoteText, setAppendNoteText] = useState('');
  const [appendSuccess, setAppendSuccess] = useState(false);

  // Cooldown timer tick down
  useEffect(() => {
    let timer;
    if (cooldownRemaining > 0) {
      timer = setInterval(() => {
        setCooldownRemaining((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [cooldownRemaining]);

  const handleSendSOS = async () => {
    // If citizen is in cooldown -> Anti-Spam protection triggers
    if (cooldownRemaining > 0) {
      setSpamAttemptCount((prev) => prev + 1);
      setShowSpamWarning(true);
      return;
    }

    const id = await addSOS(selectedCategory, additionalNote);
    setConfirmedId(id || '#1048');
    setIsSubmitted(true);
    setCooldownRemaining(45); // 45 seconds anti-spam rate limiter hold
  };

  const handleAppendUpdate = () => {
    if (!appendNoteText.trim()) return;
    setAppendSuccess(true);
    setAppendNoteText('');
    setTimeout(() => setAppendSuccess(false), 4000);
  };

  return (
    <div className="citizen-mobile-viewport" style={{ paddingBottom: '70px' }}>
      {/* Top Header */}
      <div
        style={{
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid rgba(239, 68, 68, 0.3)',
          background: 'rgba(20, 10, 16, 0.95)',
          position: 'sticky',
          top: '46px',
          zIndex: 800,
          backdropFilter: 'blur(12px)'
        }}
      >
        <button
          onClick={() => {
            setActiveTab('home');
            navigateTo('citizen-home');
          }}
          style={{ color: '#F87171', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px' }}
        >
          <ArrowLeft size={16} /> Home
        </button>

        <h1 style={{ fontSize: '16px', color: '#FFFFFF', fontWeight: 800 }}>
          Emergency SOS
        </h1>

        <SimulationBadge text="EMERGENCY DISPATCH" />
      </div>

      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
        
        {/* CITIZEN VERIFICATION BADGE BANNER */}
        <div
          style={{
            padding: '10px 14px',
            borderRadius: '10px',
            background: citizenUser?.isVerified
              ? 'rgba(16, 185, 129, 0.12)'
              : 'rgba(234, 179, 8, 0.12)',
            border: citizenUser?.isVerified
              ? '1px solid rgba(16, 185, 129, 0.35)'
              : '1px solid rgba(234, 179, 8, 0.35)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '12px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {citizenUser?.isVerified ? (
              <>
                <ShieldCheck size={16} color="#10B981" />
                <span style={{ color: '#A7F3D0', fontWeight: 700 }}>
                  Aadhaar Verified Citizen • High Priority Dispatch
                </span>
              </>
            ) : (
              <>
                <ShieldAlert size={16} color="#EAB308" />
                <span style={{ color: '#FDE047', fontWeight: 600 }}>
                  Unverified Profile • Standard Triage
                </span>
              </>
            )}
          </div>

          {!citizenUser?.isVerified && (
            <button
              onClick={() => navigateTo('citizen-profile')}
              style={{ color: '#38BDF8', fontWeight: 700, fontSize: '11px', textDecoration: 'underline' }}
            >
              Verify Profile →
            </button>
          )}
        </div>

        {/* ANTI-SPAM MODAL / ALERT IF USER ATTEMPTS TO SPAM */}
        {showSpamWarning && (
          <div
            style={{
              padding: '14px 16px',
              borderRadius: '12px',
              background: 'rgba(239, 68, 68, 0.18)',
              border: '1.5px solid #EF4444',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#FCA5A5', fontWeight: 800, fontSize: '13px' }}>
                <AlertTriangle size={18} color="#EF4444" />
                ANTI-SPAM FREQUENCY HOLD ACTIVE
              </div>
              <button
                onClick={() => setShowSpamWarning(false)}
                style={{ color: '#FCA5A5', fontSize: '14px', fontWeight: 800 }}
              >
                ✕
              </button>
            </div>

            <p style={{ fontSize: '12px', color: '#FECACA', lineHeight: 1.4 }}>
              Your emergency distress signal (<strong>{confirmedId}</strong>) is already live on the GHMC Command Center radar. Rapidly pressing the SOS button congests dispatch channels.
            </p>

            <div style={{ fontSize: '11px', color: '#94A3B8', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Clock size={12} /> Cooldown remaining: <strong>{cooldownRemaining}s</strong> before next dispatch transmission.
            </div>
          </div>
        )}

        {/* If SOS was Sent -> Show Confirmation State with Live Dispatch Tracking & Updates */}
        {isSubmitted ? (
          <div
            className="glass-panel"
            style={{
              padding: '24px 18px',
              textAlign: 'center',
              border: '2px solid #10B981',
              boxShadow: '0 0 30px rgba(16, 185, 129, 0.25)',
              borderRadius: '18px'
            }}
          >
            <div
              style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                background: 'rgba(16, 185, 129, 0.15)',
                border: '2px solid #10B981',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#10B981',
                fontSize: '28px',
                marginBottom: '12px'
              }}
            >
              ✓
            </div>

            <h2 style={{ fontSize: '22px', color: '#10B981', fontWeight: 800, marginBottom: '4px' }}>
              ✓ SOS TRANSMITTED
            </h2>

            <div
              style={{
                display: 'inline-block',
                background: 'rgba(15, 23, 42, 0.8)',
                border: '1px solid rgba(56, 189, 248, 0.3)',
                borderRadius: '8px',
                padding: '5px 12px',
                fontSize: '13px',
                fontFamily: 'var(--font-mono)',
                color: '#38BDF8',
                fontWeight: 700,
                marginBottom: '14px'
              }}
            >
              Incident Token: {confirmedId}
            </div>

            <p style={{ color: '#E2E8F0', fontSize: '13px', lineHeight: 1.5, marginBottom: '16px' }}>
              Your GPS coordinates and hazard telemetry are locked with the Disaster Response Command Grid.
            </p>

            {/* Smart Staged Dispatch Explanation for Citizen */}
            <div
              style={{
                background: 'rgba(15, 23, 42, 0.85)',
                border: '1px solid rgba(56, 189, 248, 0.2)',
                borderRadius: '10px',
                padding: '12px',
                textAlign: 'left',
                marginBottom: '16px',
                fontSize: '12px',
                color: '#CBD5E1',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px'
              }}
            >
              <div><strong>Reported Hazard:</strong> {selectedCategory}</div>
              <div><strong>Location Geofence:</strong> {selectedLocation}</div>
              <div><strong>Smart Protocol:</strong> <span style={{ color: '#38BDF8', fontWeight: 700 }}>Stage 1 Recon Unit Dispatched (First Responders on scene in ~4 mins)</span></div>
              <div><strong>Escalation Fleet:</strong> <span style={{ color: '#94A3B8' }}>Heavy NDRF boats on standby upon Stage 1 arrival</span></div>
            </div>

            {/* APPEND SITUATIONAL UPDATE (Anti-Spam alternative) */}
            <div style={{ background: 'rgba(255, 255, 255, 0.03)', borderRadius: '10px', padding: '12px', textAlign: 'left', marginBottom: '16px' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#F8FAFC', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <MessageSquarePlus size={14} color="#38BDF8" />
                Add Urgent Status Update to this Incident
              </div>
              <div style={{ display: 'flex', gap: '6px' }}>
                <input
                  type="text"
                  value={appendNoteText}
                  onChange={(e) => setAppendNoteText(e.target.value)}
                  placeholder="e.g. Water reached stairs, 1 child inside"
                  style={{
                    flex: 1,
                    padding: '8px 10px',
                    background: 'rgba(15, 23, 42, 0.9)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '6px',
                    color: '#FFFFFF',
                    fontSize: '12px'
                  }}
                />
                <button
                  onClick={handleAppendUpdate}
                  className="btn-primary"
                  style={{ padding: '8px 12px', fontSize: '11px', whiteSpace: 'nowrap' }}
                >
                  Post Update
                </button>
              </div>
              {appendSuccess && (
                <div style={{ fontSize: '11px', color: '#10B981', marginTop: '4px', fontWeight: 600 }}>
                  ✓ Update appended to Incident {confirmedId} command stream!
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button
                onClick={() => navigateTo('officer-live')}
                className="btn-primary"
                style={{ width: '100%', padding: '12px', fontSize: '13px' }}
              >
                Inspect on Officer Command Screen →
              </button>

              <button
                onClick={() => {
                  if (cooldownRemaining > 0) {
                    setShowSpamWarning(true);
                  } else {
                    setIsSubmitted(false);
                  }
                }}
                className="btn-secondary"
                style={{
                  width: '100%',
                  padding: '10px',
                  fontSize: '12px',
                  opacity: cooldownRemaining > 0 ? 0.7 : 1
                }}
              >
                {cooldownRemaining > 0 ? `Cooldown Active (${cooldownRemaining}s)` : 'Send Another Emergency Report'}
              </button>
            </div>
          </div>
        ) : (
          /* Normal SOS Trigger View */
          <>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '38px', marginBottom: '6px' }} className="animate-pulse-dot">
                🚨
              </div>

              <h2 style={{ fontSize: '20px', color: '#FFFFFF', fontWeight: 800, marginBottom: '4px' }}>
                Are you in immediate danger?
              </h2>

              <p style={{ fontSize: '12px', color: '#94A3B8' }}>
                Press the emergency button below to transmit your location coordinates and threat type to field NDRF/GHMC responders.
              </p>
            </div>

            {/* Large SEND SOS Button with Cooldown & Anti-Spam Badge */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={handleSendSOS}
                className="sos-button-hero"
                style={{
                  padding: '20px 18px',
                  fontSize: '18px',
                  letterSpacing: '0.04em',
                  opacity: cooldownRemaining > 0 ? 0.75 : 1
                }}
              >
                <AlertOctagon size={26} />
                {cooldownRemaining > 0 ? `TRANSMITTING... (${cooldownRemaining}s)` : 'SEND SOS NOW'}
              </button>
            </div>

            {/* What is happening category selector */}
            <div style={{ marginTop: '6px' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#CBD5E1', textTransform: 'uppercase', marginBottom: '10px', letterSpacing: '0.04em' }}>
                What is happening?
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginBottom: '14px' }}>
                {SOS_CATEGORIES.map((cat) => {
                  const isSelected = selectedCategory === cat.label;
                  return (
                    <div
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.label)}
                      style={{
                        padding: '12px',
                        borderRadius: '12px',
                        background: isSelected ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                        border: isSelected ? '1.5px solid #EF4444' : '1px solid rgba(255, 255, 255, 0.08)',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px'
                      }}
                    >
                      <div style={{ fontSize: '20px' }}>{cat.icon}</div>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: isSelected ? '#FFFFFF' : '#CBD5E1' }}>
                        {cat.label}
                      </div>
                      <div style={{ fontSize: '10px', color: '#64748B', lineHeight: 1.2 }}>
                        {cat.description}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Optional brief details */}
              <div>
                <label style={{ fontSize: '12px', color: '#94A3B8', display: 'block', marginBottom: '6px' }}>
                  Additional details (optional)
                </label>
                <input
                  type="text"
                  value={additionalNote}
                  onChange={(e) => setAdditionalNote(e.target.value)}
                  placeholder="e.g. Water entering ground floor, 2 seniors inside"
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    background: 'rgba(15, 23, 42, 0.8)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: '8px',
                    color: '#FFFFFF',
                    fontSize: '13px'
                  }}
                />
              </div>
            </div>

            <div
              style={{
                fontSize: '11px',
                color: '#64748B',
                textAlign: 'center',
                padding: '8px 12px',
                background: 'rgba(255, 255, 255, 0.02)',
                borderRadius: '8px'
              }}
            >
              Direct emergency telemetry linked with GHMC Disaster Response Center. Anti-Spam protection active.
            </div>
          </>
        )}

      </div>

      {/* FIXED BOTTOM NAVIGATION */}
      <nav className="citizen-bottom-nav">
        <button
          onClick={() => {
            setActiveTab('home');
            navigateTo('citizen-home');
          }}
          className={`citizen-nav-item ${activeTab === 'home' ? 'active' : ''}`}
        >
          <span style={{ fontSize: '18px' }}>🏠</span>
          <span>Home</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('map');
            navigateTo('citizen-map');
          }}
          className={`citizen-nav-item ${activeTab === 'map' ? 'active' : ''}`}
        >
          <span style={{ fontSize: '18px' }}>🗺️</span>
          <span>Map</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('alerts');
            navigateTo('citizen-alerts');
          }}
          className={`citizen-nav-item ${activeTab === 'alerts' ? 'active' : ''}`}
        >
          <span style={{ fontSize: '18px' }}>🔔</span>
          <span>Alerts</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('sos');
            navigateTo('citizen-sos');
          }}
          className={`citizen-nav-item sos-item ${activeTab === 'sos' ? 'active' : ''}`}
        >
          <span style={{ fontSize: '18px' }}>🆘</span>
          <span>SOS</span>
        </button>
      </nav>
    </div>
  );
}
