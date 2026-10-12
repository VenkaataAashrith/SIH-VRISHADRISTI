import React, { useState, useMemo } from 'react';
import { useDemo } from '../../context/DemoContext';
import OfficerHeader from '../../components/officer/OfficerHeader';
import OfficerSidebar from '../../components/officer/OfficerSidebar';
import SimulationBadge from '../../components/common/SimulationBadge';
import { MOCK_RESPONDER_TEAMS } from '../../data/mockOfficerData';
import {
  AlertOctagon,
  TrendingUp,
  Clock,
  ArrowLeft,
  CheckCircle,
  Truck,
  Shield,
  Phone,
  UserCheck,
  X,
  Radio,
  MapPin,
  ShieldCheck,
  ShieldAlert,
  Layers,
  AlertTriangle,
  Send,
  Zap,
  ChevronRight,
  Flame,
  LifeBuoy
} from 'lucide-react';

export default function OfficerLiveSOS() {
  const { navigateTo, sosList, assignTeam, assignStagedDispatch } = useDemo();
  const [selectedSOS, setSelectedSOS] = useState(null);
  const [assigningTarget, setAssigningTarget] = useState(null); // { type: 'SINGLE' | 'CLUSTER', target: ... }
  const [assignedSuccess, setAssignedSuccess] = useState('');
  const [activeFilter, setActiveFilter] = useState('ALL'); // 'ALL' | 'CLUSTERS' | 'VERIFIED' | 'UNASSIGNED'
  const [selectedTeamsForModal, setSelectedTeamsForModal] = useState([]);

  // 1. Group SOS reports by cluster / location to detect spam and multi-citizen incidents
  const clusterGroups = useMemo(() => {
    const map = {};
    sosList.forEach((sos) => {
      const key = sos.clusterKey || sos.location || 'general';
      if (!map[key]) {
        map[key] = {
          clusterKey: key,
          clusterName: sos.clusterName || sos.location,
          location: sos.location,
          items: [],
          verifiedCount: 0,
          unverifiedCount: 0,
          dispatchStage: 'UNASSIGNED',
          assignedUnits: []
        };
      }
      map[key].items.push(sos);
      if (sos.isVerifiedCitizen) {
        map[key].verifiedCount += 1;
      } else {
        map[key].unverifiedCount += 1;
      }

      // Check current cluster dispatch stage
      if (sos.dispatchStage === 'STAGE_2_ESCALATED') {
        map[key].dispatchStage = 'STAGE_2_ESCALATED';
      } else if (sos.dispatchStage === 'STAGE_1_INITIAL' && map[key].dispatchStage !== 'STAGE_2_ESCALATED') {
        map[key].dispatchStage = 'STAGE_1_INITIAL';
      }
      if (sos.assignedUnits && sos.assignedUnits.length > 0) {
        sos.assignedUnits.forEach((u) => {
          if (!map[key].assignedUnits.includes(u)) map[key].assignedUnits.push(u);
        });
      }
    });
    return Object.values(map);
  }, [sosList]);

  // Find multi-SOS clusters (potential spam or mass incident)
  const denseClusters = clusterGroups.filter((g) => g.items.length > 1);

  // Quick Stage 1 Trigger (Dispatch 1-2 Services First)
  const handleQuickStage1 = (clusterOrSos) => {
    const stage1Teams = MOCK_RESPONDER_TEAMS.filter((t) => t.stage === 1).map((t) => t.name);
    const targetKey = clusterOrSos.clusterKey || clusterOrSos.id;
    assignStagedDispatch(targetKey, 1, stage1Teams);
    setAssignedSuccess(`Stage 1 Initial Response Dispatched: ${stage1Teams.join(' & ')} en route to evaluate situation.`);
    setTimeout(() => setAssignedSuccess(''), 5000);
  };

  // Quick Stage 2 Trigger (Escalate to Full Emergency Fleet)
  const handleQuickStage2 = (clusterOrSos) => {
    const stage2Teams = MOCK_RESPONDER_TEAMS.filter((t) => t.stage === 2).map((t) => t.name);
    const targetKey = clusterOrSos.clusterKey || clusterOrSos.id;
    assignStagedDispatch(targetKey, 2, stage2Teams);
    setAssignedSuccess(`Stage 2 Full Escalation Activated: ${stage2Teams.length} heavy multi-agency units deployed.`);
    setTimeout(() => setAssignedSuccess(''), 5000);
  };

  // Open custom dispatch modal
  const openDispatchModal = (item, type = 'SINGLE') => {
    setAssigningTarget({ type, item });
    // Pre-select Stage 1 units by default
    const defaultStage1 = MOCK_RESPONDER_TEAMS.filter((t) => t.stage === 1).map((t) => t.name);
    setSelectedTeamsForModal(defaultStage1);
  };

  // Confirm custom modal dispatch
  const handleCustomDispatchConfirm = (stageNum) => {
    if (!assigningTarget) return;
    const targetKey = assigningTarget.item.clusterKey || assigningTarget.item.id;
    assignStagedDispatch(targetKey, stageNum, selectedTeamsForModal);
    setAssignedSuccess(`Units successfully dispatched to ${assigningTarget.item.location || assigningTarget.item.clusterName}`);
    setAssigningTarget(null);
    setTimeout(() => setAssignedSuccess(''), 5000);
  };

  const toggleTeamSelection = (teamName) => {
    setSelectedTeamsForModal((prev) =>
      prev.includes(teamName) ? prev.filter((t) => t !== teamName) : [...prev, teamName]
    );
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#070B14' }}>
      <OfficerHeader />

      <div className="officer-layout">
        <OfficerSidebar activeItem="sos" />

        <main className="officer-main" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button
                onClick={() => navigateTo('officer-command')}
                style={{ color: '#94A3B8', fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
              >
                <ArrowLeft size={16} /> Command Dashboard
              </button>
              <span style={{ color: '#475569' }}>/</span>
              <h1 style={{ fontSize: '18px', fontWeight: 800, color: '#F8FAFC' }}>
                Live Response Center & Staged Dispatch
              </h1>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <SimulationBadge text="ANTI-SPAM STAGED DISPATCH" />
            </div>
          </div>

          {/* MULTI-SIGNAL SPAM & CONCENTRATION WARNING (Solves User Problem #2) */}
          {denseClusters.length > 0 && (
            <div
              style={{
                padding: '16px 20px',
                borderRadius: '14px',
                background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(249, 115, 22, 0.12) 100%)',
                border: '1.5px solid #EF4444',
                boxShadow: '0 0 20px rgba(239, 68, 68, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '14px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', maxWidth: '780px' }}>
                <div style={{ background: '#EF4444', color: '#FFFFFF', padding: '8px', borderRadius: '10px', display: 'flex' }}>
                  <AlertTriangle size={22} />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ fontSize: '15px', fontWeight: 900, color: '#FFFFFF' }}>
                      HIGH SOS DENSITY / MULTI-SIGNAL CONCENTRATION DETECTED
                    </span>
                    <span className="badge badge-severe" style={{ fontSize: '10px' }}>
                      {denseClusters[0].items.length} SIGNALS IN RADIUS
                    </span>
                  </div>
                  <div style={{ fontSize: '12px', color: '#FECACA', lineHeight: 1.4 }}>
                    <strong>{denseClusters[0].clusterName}:</strong> Multiple emergency SOS signals received from a single location ({denseClusters[0].verifiedCount} Aadhaar/PAN Verified, {denseClusters[0].unverifiedCount} Unverified/Potential Spam).
                  </div>
                  <div style={{ fontSize: '11px', color: '#FDBA74', marginTop: '4px', fontWeight: 600 }}>
                    🛡️ <strong>Recommended Action:</strong> Send <strong>Stage 1 (1–2 Recon / First Responder units)</strong> first to verify ground conditions without exhausting city-wide rescue flotillas. Escalate to Stage 2 heavy fleet upon on-scene confirmation.
                  </div>
                </div>
              </div>

              {/* Quick Staged Action Buttons on Alert */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <button
                  onClick={() => handleQuickStage1(denseClusters[0])}
                  disabled={denseClusters[0].dispatchStage !== 'UNASSIGNED'}
                  className="btn-primary"
                  style={{
                    padding: '8px 16px',
                    fontSize: '12px',
                    background: denseClusters[0].dispatchStage !== 'UNASSIGNED' ? '#334155' : 'linear-gradient(135deg, #0284C7, #0EA5E9)',
                    fontWeight: 800
                  }}
                >
                  {denseClusters[0].dispatchStage === 'STAGE_1_INITIAL' ? '✓ STAGE 1 EN ROUTE' : '⚡ 1. DISPATCH 1-2 FIRST RESPONDERS'}
                </button>

                <button
                  onClick={() => handleQuickStage2(denseClusters[0])}
                  className="btn-danger"
                  style={{
                    padding: '8px 16px',
                    fontSize: '12px',
                    background: denseClusters[0].dispatchStage === 'STAGE_2_ESCALATED' ? '#334155' : 'linear-gradient(135deg, #DC2626, #EF4444)',
                    fontWeight: 800
                  }}
                >
                  {denseClusters[0].dispatchStage === 'STAGE_2_ESCALATED' ? '✓ FULL FLEET ESCALATED' : '🚨 2. ESCALATE FULL FLEET'}
                </button>
              </div>
            </div>
          )}

          {/* Success Message Banner */}
          {assignedSuccess && (
            <div style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid #10B981', color: '#D1FAE5', padding: '12px 18px', borderRadius: '10px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle size={16} color="#10B981" />
              <span>{assignedSuccess}</span>
            </div>
          )}

          {/* Filter Bar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '10px' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => setActiveFilter('ALL')}
                style={{
                  padding: '6px 14px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: 700,
                  border: '1px solid',
                  borderColor: activeFilter === 'ALL' ? '#38BDF8' : 'rgba(255, 255, 255, 0.1)',
                  background: activeFilter === 'ALL' ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
                  color: activeFilter === 'ALL' ? '#38BDF8' : '#94A3B8'
                }}
              >
                All SOS Queue ({sosList.length})
              </button>

              <button
                onClick={() => setActiveFilter('CLUSTERS')}
                style={{
                  padding: '6px 14px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: 700,
                  border: '1px solid',
                  borderColor: activeFilter === 'CLUSTERS' ? '#EF4444' : 'rgba(255, 255, 255, 0.1)',
                  background: activeFilter === 'CLUSTERS' ? 'rgba(239, 68, 68, 0.15)' : 'transparent',
                  color: activeFilter === 'CLUSTERS' ? '#FCA5A5' : '#94A3B8'
                }}
              >
                📍 Location Clusters ({clusterGroups.length})
              </button>

              <button
                onClick={() => setActiveFilter('VERIFIED')}
                style={{
                  padding: '6px 14px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: 700,
                  border: '1px solid',
                  borderColor: activeFilter === 'VERIFIED' ? '#10B981' : 'rgba(255, 255, 255, 0.1)',
                  background: activeFilter === 'VERIFIED' ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
                  color: activeFilter === 'VERIFIED' ? '#34D399' : '#94A3B8'
                }}
              >
                🛡️ Verified Citizens ({sosList.filter((s) => s.isVerifiedCitizen).length})
              </button>
            </div>

            <div style={{ fontSize: '11px', color: '#94A3B8' }}>
              Active Incident Feed • Real-Time Geospatial Synchronization
            </div>
          </div>

          {/* 2-Column Operational Grid: Left = Active SOS Requests & Clusters, Right = Staged Response Units */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.45fr 1fr', gap: '22px' }}>
            
            {/* ACTIVE SOS REQUESTS & LOCATION CLUSTERS */}
            <div className="glass-panel" style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '12px' }}>
                <div>
                  <h2 style={{ fontSize: '15px', color: '#F8FAFC', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    {activeFilter === 'CLUSTERS' ? 'LOCATION CLUSTERS & INCIDENT BUNDLES' : 'ACTIVE EMERGENCY REQUESTS'}
                  </h2>
                  <div style={{ fontSize: '11px', color: '#94A3B8' }}>
                    Prioritize verified citizen telemetry • Staged response ready
                  </div>
                </div>

                <span className="badge badge-severe">
                  {sosList.length} SIGNALS
                </span>
              </div>

              {/* CLUSTER GROUPED VIEW (When activeFilter === 'CLUSTERS') */}
              {activeFilter === 'CLUSTERS' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {clusterGroups.map((cluster) => (
                    <div
                      key={cluster.clusterKey}
                      style={{
                        background: 'rgba(15, 23, 42, 0.85)',
                        border: cluster.items.length > 1 ? '1.5px solid #EF4444' : '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '12px',
                        padding: '16px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <MapPin size={16} color="#38BDF8" />
                          <span style={{ fontSize: '15px', fontWeight: 800, color: '#FFFFFF' }}>
                            {cluster.clusterName}
                          </span>
                          <span className="badge" style={{ background: cluster.items.length > 1 ? 'rgba(239, 68, 68, 0.2)' : 'rgba(56, 189, 248, 0.2)', color: cluster.items.length > 1 ? '#F87171' : '#38BDF8', fontSize: '11px' }}>
                            {cluster.items.length} SOS Report{cluster.items.length > 1 ? 's' : ''}
                          </span>
                        </div>

                        {/* Dispatch Stage Badge */}
                        {cluster.dispatchStage === 'STAGE_2_ESCALATED' ? (
                          <span className="badge badge-severe" style={{ fontSize: '10px' }}>
                            🔴 STAGE 2: FULL FLEET DEPLOYED
                          </span>
                        ) : cluster.dispatchStage === 'STAGE_1_INITIAL' ? (
                          <span className="badge badge-high" style={{ fontSize: '10px' }}>
                            🟡 STAGE 1: FIRST RESPONDER ON SCENE
                          </span>
                        ) : (
                          <span className="badge" style={{ background: 'rgba(234, 179, 8, 0.15)', color: '#EAB308', border: '1px solid rgba(234, 179, 8, 0.3)', fontSize: '10px' }}>
                            Awaiting Dispatch
                          </span>
                        )}
                      </div>

                      {/* Summary of citizens in cluster */}
                      <div style={{ fontSize: '12px', color: '#CBD5E1', display: 'flex', gap: '16px', background: 'rgba(255, 255, 255, 0.03)', padding: '8px 12px', borderRadius: '8px' }}>
                        <div>🛡️ Verified: <strong>{cluster.verifiedCount}</strong></div>
                        <div>⚠️ Unverified / Rapid: <strong>{cluster.unverifiedCount}</strong></div>
                        <div>Units Active: <strong>{cluster.assignedUnits.length > 0 ? cluster.assignedUnits.join(', ') : 'None'}</strong></div>
                      </div>

                      {/* Staged Dispatch Action Bar */}
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', paddingTop: '6px' }}>
                        <button
                          onClick={() => handleQuickStage1(cluster)}
                          disabled={cluster.dispatchStage !== 'UNASSIGNED'}
                          className="btn-primary"
                          style={{
                            padding: '8px 12px',
                            fontSize: '11px',
                            background: cluster.dispatchStage !== 'UNASSIGNED' ? '#334155' : undefined
                          }}
                        >
                          ⚡ 1. Send 1-2 Services First
                        </button>

                        <button
                          onClick={() => handleQuickStage2(cluster)}
                          className="btn-danger"
                          style={{ padding: '8px 12px', fontSize: '11px' }}
                        >
                          🚨 2. Escalate Full Fleet
                        </button>

                        <button
                          onClick={() => openDispatchModal(cluster, 'CLUSTER')}
                          className="btn-secondary"
                          style={{ padding: '8px 12px', fontSize: '11px' }}
                        >
                          Custom Units...
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                /* STANDARD SOS LIST VIEW */
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {sosList
                    .filter((sos) => {
                      if (activeFilter === 'VERIFIED') return sos.isVerifiedCitizen;
                      return true;
                    })
                    .map((sos) => (
                      <div
                        key={sos.id}
                        style={{
                          background: 'rgba(15, 23, 42, 0.8)',
                          border: sos.status === 'Pending' ? '1.5px solid rgba(239, 68, 68, 0.5)' : '1px solid rgba(255, 255, 255, 0.08)',
                          borderRadius: '12px',
                          padding: '16px',
                          display: 'flex',
                          alignItems: 'flex-start',
                          justifyContent: 'space-between',
                          gap: '12px',
                          boxShadow: sos.status === 'Pending' ? '0 0 16px rgba(239, 68, 68, 0.15)' : 'none'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', flex: 1 }}>
                          <div style={{ fontSize: '24px' }}>
                            {sos.category === 'Flooding' ? '🌊' : sos.category === 'Road Blocked' ? '🚧' : '🚑'}
                          </div>

                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                              <span style={{ fontSize: '15px', fontWeight: 800, color: '#FFFFFF', fontFamily: 'var(--font-mono)' }}>
                                {sos.id}
                              </span>
                              <span style={{ fontSize: '14px', fontWeight: 700, color: '#FCA5A5' }}>
                                {sos.category}
                              </span>
                              <span style={{ fontSize: '11px', color: '#94A3B8' }}>
                                • {sos.timeAgo}
                              </span>

                              {/* CITIZEN VERIFICATION BADGE */}
                              {sos.isVerifiedCitizen ? (
                                <span
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    background: 'rgba(16, 185, 129, 0.15)',
                                    border: '1px solid #10B981',
                                    color: '#34D399',
                                    padding: '2px 8px',
                                    borderRadius: '12px',
                                    fontSize: '10px',
                                    fontWeight: 700
                                  }}
                                >
                                  <ShieldCheck size={11} color="#10B981" />
                                  {sos.verificationBadge || 'UIDAI Verified'}
                                </span>
                              ) : (
                                <span
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    background: 'rgba(234, 179, 8, 0.15)',
                                    border: '1px solid rgba(234, 179, 8, 0.3)',
                                    color: '#FDE047',
                                    padding: '2px 8px',
                                    borderRadius: '12px',
                                    fontSize: '10px',
                                    fontWeight: 600
                                  }}
                                >
                                  <ShieldAlert size={11} color="#EAB308" />
                                  Unverified Caller
                                </span>
                              )}
                            </div>

                            <div style={{ fontSize: '12px', color: '#CBD5E1', display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <MapPin size={13} color="#38BDF8" />
                              <span>{sos.location}</span>
                            </div>

                            <div style={{ fontSize: '12px', color: '#94A3B8', marginTop: '2px' }}>
                              "{sos.notes}"
                            </div>

                            {/* Assigned info & Staged tags */}
                            <div style={{ marginTop: '4px' }}>
                              {sos.assignedTo ? (
                                <div style={{ fontSize: '11px', color: '#10B981', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  ✓ Assigned ({sos.dispatchStage === 'STAGE_1_INITIAL' ? 'Stage 1 Recon' : 'Stage 2 Full Fleet'}): {sos.assignedTo}
                                </div>
                              ) : (
                                <div style={{ fontSize: '11px', color: '#EF4444', fontWeight: 700 }}>
                                  ⚠️ Pending responder assignment
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons: VIEW & STAGED DISPATCH */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <button
                            onClick={() => setSelectedSOS(sos)}
                            className="btn-secondary"
                            style={{ padding: '6px 10px', fontSize: '11px' }}
                          >
                            VIEW
                          </button>

                          <button
                            onClick={() => openDispatchModal(sos, 'SINGLE')}
                            className="btn-primary"
                            style={{ padding: '6px 12px', fontSize: '11px', background: sos.assignedTo ? '#334155' : undefined }}
                          >
                            {sos.assignedTo ? 'REASSIGN' : 'DISPATCH'}
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              )}

            </div>

            {/* RESPONSE UNITS & STAGED FLEET STATUS */}
            <div className="glass-panel" style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '12px' }}>
                <h2 style={{ fontSize: '15px', color: '#F8FAFC', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  STAGED RESPONSE SQUADS
                </h2>
                <div style={{ fontSize: '11px', color: '#94A3B8' }}>
                  Tier 1 First Responders (1–2 units) & Tier 2 Heavy Flotilla
                </div>
              </div>

              {/* Units List Divided into Stage 1 and Stage 2 */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                
                {/* SECTION: STAGE 1 FIRST RESPONDERS */}
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 800, color: '#38BDF8', textTransform: 'uppercase', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Zap size={13} color="#38BDF8" />
                    STAGE 1: RAPID RECON & 1ST RESPONDERS (1–2 Units)
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {MOCK_RESPONDER_TEAMS.filter((t) => t.stage === 1).map((team) => (
                      <div
                        key={team.id}
                        style={{
                          background: 'rgba(15, 23, 42, 0.8)',
                          border: '1px solid rgba(56, 189, 248, 0.25)',
                          borderRadius: '10px',
                          padding: '12px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '4px'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ fontSize: '16px' }}>{team.icon}</span>
                            <span style={{ fontSize: '13px', fontWeight: 800, color: '#FFFFFF' }}>
                              {team.name}
                            </span>
                          </div>
                          <span className="badge badge-low" style={{ fontSize: '9px' }}>
                            {team.status}
                          </span>
                        </div>
                        <div style={{ fontSize: '11px', color: '#94A3B8' }}>{team.unit} • {team.personnel} personnel</div>
                        <div style={{ fontSize: '10px', color: '#CBD5E1' }}>{team.description}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* SECTION: STAGE 2 HEAVY RESCUE FLEET */}
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 800, color: '#EF4444', textTransform: 'uppercase', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <LifeBuoy size={13} color="#EF4444" />
                    STAGE 2: HEAVY RESCUE FLOTILLA (Full Escalation)
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {MOCK_RESPONDER_TEAMS.filter((t) => t.stage === 2).map((team) => (
                      <div
                        key={team.id}
                        style={{
                          background: 'rgba(15, 23, 42, 0.8)',
                          border: '1px solid rgba(239, 68, 68, 0.25)',
                          borderRadius: '10px',
                          padding: '12px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '4px'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ fontSize: '16px' }}>{team.icon}</span>
                            <span style={{ fontSize: '13px', fontWeight: 800, color: '#FFFFFF' }}>
                              {team.name}
                            </span>
                          </div>
                          <span className="badge badge-severe" style={{ fontSize: '9px' }}>
                            {team.status}
                          </span>
                        </div>
                        <div style={{ fontSize: '11px', color: '#94A3B8' }}>{team.unit} • {team.personnel} personnel</div>
                        <div style={{ fontSize: '10px', color: '#CBD5E1' }}>{team.equipment}</div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

            </div>

          </div>

        </main>
      </div>

      {/* VIEW SOS DETAILS MODAL */}
      {selectedSOS && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(6px)',
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
              maxWidth: '520px',
              padding: '24px',
              border: '1px solid #EF4444'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ fontSize: '18px', fontWeight: 800, color: '#FFFFFF' }}>
                SOS Incident {selectedSOS.id}
              </div>
              <button onClick={() => setSelectedSOS(null)} style={{ color: '#94A3B8' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px', color: '#CBD5E1', marginBottom: '20px' }}>
              <div><strong>Reported Hazard:</strong> {selectedSOS.category}</div>
              <div><strong>Citizen Name:</strong> {selectedSOS.reportedBy}</div>
              <div>
                <strong>Verification Status:</strong>{' '}
                {selectedSOS.isVerifiedCitizen ? (
                  <span style={{ color: '#34D399', fontWeight: 700 }}>✓ Verified Citizen ({selectedSOS.verificationBadge})</span>
                ) : (
                  <span style={{ color: '#F87171', fontWeight: 600 }}>⚠️ Unverified Caller</span>
                )}
              </div>
              <div><strong>Contact Number:</strong> {selectedSOS.mobile}</div>
              <div><strong>Location Coordinates:</strong> {selectedSOS.location} (Lat: {selectedSOS.coords.lat}, Lng: {selectedSOS.coords.lng})</div>
              <div><strong>Timestamp:</strong> {selectedSOS.timestamp} ({selectedSOS.timeAgo})</div>
              <div><strong>Field Description:</strong> {selectedSOS.notes}</div>
              <div><strong>Current Assignment:</strong> {selectedSOS.assignedTo || 'Unassigned'}</div>
            </div>

            <button
              onClick={() => setSelectedSOS(null)}
              className="btn-secondary"
              style={{ width: '100%', padding: '10px' }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* INTERACTIVE STAGED DISPATCH MODAL */}
      {assigningTarget && (
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
              maxWidth: '520px',
              padding: '24px',
              border: '1.5px solid #38BDF8',
              boxShadow: '0 0 30px rgba(56, 189, 248, 0.25)',
              borderRadius: '16px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <div style={{ fontSize: '16px', fontWeight: 800, color: '#FFFFFF' }}>
                Dispatch Services to {assigningTarget.item.location || assigningTarget.item.clusterName}
              </div>
              <button onClick={() => setAssigningTarget(null)} style={{ color: '#94A3B8' }}>
                <X size={20} />
              </button>
            </div>

            {/* Staged Preset Quick Selector */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '14px' }}>
              <button
                onClick={() => {
                  const s1 = MOCK_RESPONDER_TEAMS.filter((t) => t.stage === 1).map((t) => t.name);
                  setSelectedTeamsForModal(s1);
                }}
                style={{
                  padding: '8px',
                  borderRadius: '8px',
                  fontSize: '11px',
                  fontWeight: 700,
                  background: 'rgba(56, 189, 248, 0.15)',
                  border: '1px solid #38BDF8',
                  color: '#38BDF8',
                  cursor: 'pointer'
                }}
              >
                ⚡ Select Stage 1 (1–2 Recon Units)
              </button>

              <button
                onClick={() => {
                  const all = MOCK_RESPONDER_TEAMS.map((t) => t.name);
                  setSelectedTeamsForModal(all);
                }}
                style={{
                  padding: '8px',
                  borderRadius: '8px',
                  fontSize: '11px',
                  fontWeight: 700,
                  background: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid #EF4444',
                  color: '#F87171',
                  cursor: 'pointer'
                }}
              >
                🚨 Select Full Fleet (All Units)
              </button>
            </div>

            <div style={{ fontSize: '12px', color: '#94A3B8', marginBottom: '10px' }}>
              Check units to dispatch:
            </div>

            {/* Team selection checkboxes */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '240px', overflowY: 'auto', marginBottom: '18px' }}>
              {MOCK_RESPONDER_TEAMS.map((team) => {
                const isSelected = selectedTeamsForModal.includes(team.name);
                return (
                  <div
                    key={team.id}
                    onClick={() => toggleTeamSelection(team.name)}
                    style={{
                      padding: '10px 12px',
                      borderRadius: '8px',
                      background: isSelected ? 'rgba(56, 189, 248, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                      border: isSelected ? '1.5px solid #38BDF8' : '1px solid rgba(255, 255, 255, 0.08)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}} // Handled by div click
                        style={{ cursor: 'pointer' }}
                      />
                      <span style={{ fontSize: '18px' }}>{team.icon}</span>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 700, color: '#FFFFFF' }}>
                          {team.name}
                        </div>
                        <div style={{ fontSize: '11px', color: '#94A3B8' }}>
                          {team.tierLabel} • {team.personnel} personnel
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => handleCustomDispatchConfirm(selectedTeamsForModal.length <= 2 ? 1 : 2)}
                disabled={selectedTeamsForModal.length === 0}
                className="btn-primary"
                style={{ flex: 1, padding: '12px', fontSize: '13px', fontWeight: 800 }}
              >
                Confirm & Dispatch {selectedTeamsForModal.length} Unit(s) →
              </button>

              <button
                onClick={() => setAssigningTarget(null)}
                className="btn-secondary"
                style={{ padding: '12px 18px', fontSize: '13px' }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
