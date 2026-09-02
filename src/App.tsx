/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ViewType,
  Member,
  ChurchBranch,
  AuditLogItem,
  AttendanceRecord,
  Leader,
  PromotionQueueItem,
  ChurchAdminAccount,
  TopLeader,
  LeaderType,
  AuthSessionUser
} from './types';

import {
  fetchMembersFromSupabase,
  saveMemberToSupabase,
  fetchLeadersFromSupabase,
  saveLeaderToSupabase,
  fetchAttendanceFromSupabase,
  saveAttendanceToSupabase,
  fetchChurchesFromSupabase,
  saveChurchToSupabase,
  fetchChurchAdminsFromSupabase,
  saveChurchAdminToSupabase,
  fetchAuditLogsFromSupabase,
  saveAuditLogToSupabase,
  fetchSuperadminProfileFromSupabase,
  getStoredSession,
  saveStoredSession,
  clearStoredSession,
  signOutFromSupabase
} from './lib/supabaseService';

import { Sidebar } from './components/Sidebar';
import { TopHeader } from './components/TopHeader';
import { MobileAppHeader } from './components/MobileAppHeader';
import { MobileBottomNav } from './components/MobileBottomNav';
import { PublicPortal } from './components/PublicPortal';
import { DashboardOverview } from './components/DashboardOverview';
import { GroupOverview } from './components/GroupOverview';
import { ChurchAdminsDirectory } from './components/ChurchAdminsDirectory';
import { MemberDatabase } from './components/MemberDatabase';
import { NewRegistration } from './components/NewRegistration';
import { QRScannerModal } from './components/QRScannerModal';
import { MemberCardModal } from './components/MemberCardModal';
import { AnnouncementModal } from './components/AnnouncementModal';
import { AttendanceView } from './components/AttendanceView';
import { LeaderDirectory } from './components/LeaderDirectory';
import { LeaderRegistration } from './components/LeaderRegistration';
import { AnalyticsView } from './components/AnalyticsView';
import { DatabaseSchemaView } from './components/DatabaseSchemaView';
import { SettingsView } from './components/SettingsView';
import { useToast } from './context/ToastContext';
import { INITIAL_CHURCHES } from './data/mockData';

export default function App() {
  const toast = useToast();
  const [user, setUser] = useState<AuthSessionUser>(() => {
    const saved = getStoredSession();
    if (saved) return saved;
    return {
      id: 'usr-1',
      name: 'Group Pastor',
      role: 'Superadmin',
      church: 'GCYC Group HQ',
      zone: 'Zone 1 (Korle Bu)',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
      email: 'group.pastor@cekorlebu.org',
      phone: '+233 24 123 4567'
    };
  });

  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return !!getStoredSession();
  });

  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const isSuperadmin = user.role === 'Superadmin';
  const [members, setMembers] = useState<Member[]>([]);
  const [churches, setChurches] = useState<ChurchBranch[]>([]);
  const [churchAdmins, setChurchAdmins] = useState<ChurchAdminAccount[]>([]);
  const [leaders, setLeaders] = useState<Leader[]>([]);
  const [promotionQueue, setPromotionQueue] = useState<PromotionQueueItem[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [serviceTypes, setServiceTypes] = useState<Array<{ id: string; name: string; active: boolean }>>([
    { id: 'srv-1', name: 'Sunday Service', active: true },
    { id: 'srv-2', name: 'Midweek Service', active: true },
    { id: 'srv-3', name: 'Special Service', active: true },
  ]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);

  // Compute top leaders dynamically from live leaders in database
  const topLeaders = useMemo(() => {
    return (leaders || [])
      .filter((l): l is Leader => Boolean(l && (l.fullName || l.id)))
      .sort((a, b) => (b.downstreamCount || 0) - (a.downstreamCount || 0))
      .slice(0, 5)
      .map((l): TopLeader => ({
        id: l.id,
        name: l.fullName || 'Leader',
        initials: l.initials || (l.fullName ? l.fullName.split(' ').filter(Boolean).map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'LD'),
        downstreamCount: l.downstreamCount || 0,
        branch: l.church || '',
        role: (l.leaderType || 'BSCT') as LeaderType
      }));
  }, [leaders]);

  // Initial Supabase Data Fetch
  useEffect(() => {
    async function loadSupabaseData() {
      setIsLoading(true);
      try {
        // Purge legacy cache keys from localStorage
        try {
          localStorage.removeItem('cekbu_churches');
          localStorage.removeItem('cekbu_church_admins');
        } catch (e) { }

        const [
          dbMembers,
          dbLeaders,
          dbAttendance,
          dbChurches,
          dbChurchAdmins,
          dbAuditLogs,
          dbSuperadminProfile
        ] = await Promise.all([
          fetchMembersFromSupabase(),
          fetchLeadersFromSupabase(),
          fetchAttendanceFromSupabase(),
          fetchChurchesFromSupabase(),
          fetchChurchAdminsFromSupabase(),
          fetchAuditLogsFromSupabase(),
          fetchSuperadminProfileFromSupabase()
        ]);

        if (dbMembers) setMembers(dbMembers);
        if (dbLeaders) setLeaders(dbLeaders);
        if (dbAttendance) setAttendanceRecords(dbAttendance);
        if (dbChurches) setChurches(dbChurches);
        if (dbChurchAdmins) setChurchAdmins(dbChurchAdmins);
        if (dbAuditLogs) setAuditLogs(dbAuditLogs);
        if (dbSuperadminProfile) {
          setUser(prev => {
            if (prev.role !== 'Superadmin') return prev;
            return {
              ...prev,
              name: dbSuperadminProfile.name || prev.name,
              email: dbSuperadminProfile.email || prev.email,
              church: dbSuperadminProfile.churchName || prev.church || 'GCYC Group HQ',
              zone: dbSuperadminProfile.zone || prev.zone,
              phone: dbSuperadminProfile.phone || (prev as any).phone || '+233 24 123 4567'
            };
          });
        }
      } catch (err) {
        console.error('Error loading data from Supabase:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadSupabaseData();
  }, []);

  // Modals
  const [selectedMemberForCard, setSelectedMemberForCard] = useState<Member | null>(null);
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);

  // State handlers
  const handleAddMember = (newMember: Member) => {
    setMembers(prev => [newMember, ...prev]);
    saveMemberToSupabase(newMember);

    const newLog: AuditLogItem = {
      id: `log-${Date.now()}`,
      action: `Registered attendee: ${newMember.fullName} (${newMember.id}) at ${newMember.church}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC',
      icon: 'person_add',
      user: 'Usher Station',
      church: newMember.church,
      category: 'Check-in'
    };
    setAuditLogs(prev => [newLog, ...prev]);
    saveAuditLogToSupabase(newLog);
    toast.showCheckIn(newMember.fullName, 'First-Timer Check-In');
  };

  const handleAddLeader = (newLeader: Leader) => {
    setLeaders(prev => [newLeader, ...prev]);
    saveLeaderToSupabase(newLeader);

    const newLog: AuditLogItem = {
      id: `log-${Date.now()}`,
      action: `Registered new leader: ${newLeader.fullName} (${newLeader.leaderType} - ${newLeader.cellOrPcfName})`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC',
      icon: 'military_tech',
      user: 'Admin Hierarchy Station',
      church: newLeader.church,
      category: 'Leader'
    };
    setAuditLogs(prev => [newLog, ...prev]);
    saveAuditLogToSupabase(newLog);
    toast.showSuccess(`Leader Appointed!`, `${newLeader.fullName} registered as ${newLeader.leaderType} for ${newLeader.cellOrPcfName}`);
  };

  const handleConfirmPromotion = (promotionId: string) => {
    const item = promotionQueue.find(p => p.id === promotionId);
    if (item) {
      // Update leader's role
      setLeaders(prev => prev.map(ldr => {
        if (ldr.id === item.leaderId) {
          const updated = { ...ldr, leaderType: item.targetRole, promotionStatus: 'Confirmed' as const };
          saveLeaderToSupabase(updated);
          return updated;
        }
        return ldr;
      }));
      // Remove from queue
      setPromotionQueue(prev => prev.filter(p => p.id !== promotionId));
      // Log audit
      const newLog: AuditLogItem = {
        id: `log-${Date.now()}`,
        action: `Group Pastor confirmed promotion for ${item.leaderName} to ${item.targetRole}`,
        timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC',
        icon: 'verified',
        user: 'Group Pastor',
        church: item.church,
        category: 'Leader'
      };
      setAuditLogs(prev => [newLog, ...prev]);
      saveAuditLogToSupabase(newLog);
      toast.showSuccess(`Promotion Confirmed!`, `${item.leaderName} promoted to ${item.targetRole}.`);
    }
  };

  const handleConfirmAttendance = (record: AttendanceRecord) => {
    const today = new Date().toISOString().slice(0, 10);
    const enrichedRecord: AttendanceRecord = {
      ...record,
      date: record.date || today,
    };

    saveAttendanceToSupabase(enrichedRecord);

    // Ensure member exists/is saved in that church's member database
    setMembers(prev => {
      const recMemberName = (record.memberName || '').toLowerCase();
      const existingIndex = prev.findIndex(
        m => m && (m.id === record.memberId || (m.fullName || '').toLowerCase() === recMemberName)
      );

      if (existingIndex >= 0) {
        const updated = [...prev];
        const existing = updated[existingIndex];
        updated[existingIndex] = {
          ...existing,
          church: record.church || existing.church,
          serviceCount: (existing.serviceCount || 1) + 1,
          status: (existing.serviceCount || 1) >= 2 ? 'General Member' : existing.status,
        };
        if (!enrichedRecord.leaderName && existing.invitedBy) {
          enrichedRecord.leaderName = existing.invitedBy;
        }
        saveMemberToSupabase(updated[existingIndex]);
        return updated;
      } else {
        const newMember: Member = {
          id: record.memberId || `CE-${Math.floor(2000 + Math.random() * 8000)}`,
          fullName: record.memberName,
          phone: '+233 24 000 0000',
          role: record.memberRole || 'Member',
          occupation: 'Member',
          education: 'Tertiary',
          location: record.church || 'Korle Bu',
          church: record.church || (churches[0]?.name || 'GCYC Main'),
          joinDate: today,
          initials: (record.memberName || 'Member').split(' ').filter(Boolean).map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'MB',
          serviceCount: 1,
          foundationClass: 1,
          status: record.memberRole === 'First Timer' ? 'First Timer' : 'General Member',
          invitedBy: record.leaderName || 'Self Check-In'
        };
        saveMemberToSupabase(newMember);
        return [newMember, ...prev];
      }
    });

    setAttendanceRecords(prev => [enrichedRecord, ...prev]);

    const newLog: AuditLogItem = {
      id: `log-${Date.now()}`,
      action: `Attendance verified: ${record.memberName} (${record.serviceType}) at ${record.church}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC',
      icon: 'how_to_reg',
      user: record.verifiedBy || 'QR Station',
      church: record.church,
      category: 'Check-in'
    };
    setAuditLogs(prev => [newLog, ...prev]);
    saveAuditLogToSupabase(newLog);
    toast.showCheckIn(record.memberName, record.serviceType);
  };

  const handleAddChurchAdmin = async (newAdmin: ChurchAdminAccount, branch?: ChurchBranch) => {
    // 1. Update and persist admin
    const newAdminEmailLower = (newAdmin.adminEmail || '').toLowerCase();
    setChurchAdmins(prev => [newAdmin, ...prev.filter(a => a && (a.adminEmail || '').toLowerCase() !== newAdminEmailLower)]);
    await saveChurchAdminToSupabase(newAdmin);

    // 2. Update and persist branch
    const targetBranch: ChurchBranch = branch || {
      id: `CH-${Date.now().toString().slice(-4)}`,
      name: newAdmin.churchName || 'New Branch',
      pastor: newAdmin.adminName || 'Branch Pastor',
      membersCount: 0,
      status: 'Healthy',
      zone: newAdmin.zone || 'Zone 1 (Korle Bu)',
      pcfCount: 0,
      cellCount: 0,
      bsctCount: 0
    };

    const targetBranchNameLower = (targetBranch.name || '').toLowerCase();
    setChurches(prev => {
      const exists = prev.some(c => c && (c.name || '').toLowerCase() === targetBranchNameLower);
      if (exists) {
        return prev.map(c => c && (c.name || '').toLowerCase() === targetBranchNameLower
          ? { ...c, pastor: targetBranch.pastor || c.pastor }
          : c
        );
      }
      return [...prev, targetBranch];
    });
    await saveChurchToSupabase(targetBranch);

    const newLog: AuditLogItem = {
      id: `log-${Date.now()}`,
      action: `Self-registered Church Admin: ${newAdmin.adminName} for ${newAdmin.churchName} (${newAdmin.zone})`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC',
      icon: 'admin_panel_settings',
      user: 'Public Registration Gate (Security Code Verified)',
      church: newAdmin.churchName,
      category: 'System'
    };
    setAuditLogs(prev => [newLog, ...prev]);
    saveAuditLogToSupabase(newLog);
    toast.showSuccess('Church Admin Account Registered!', `${newAdmin.adminName} added for ${newAdmin.churchName}.`);
  };

  const handleAddChurch = (church: ChurchBranch, admin?: ChurchAdminAccount) => {
    setChurches(prev => [...prev, church]);
    saveChurchToSupabase(church);

    if (admin) {
      setChurchAdmins(prev => [admin, ...prev]);
      saveChurchAdminToSupabase(admin);
    }
    const newLog: AuditLogItem = {
      id: `log-${Date.now()}`,
      action: `New church branch created: ${church.name} (${church.pastor})`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC',
      icon: 'add_location_alt',
      user: 'Group Pastor (Security Code Verified)',
      category: 'System'
    };
    setAuditLogs(prev => [newLog, ...prev]);
    saveAuditLogToSupabase(newLog);
    toast.showSuccess('New Church Branch Created!', `${church.name} added under Pastor ${church.pastor}.`);
  };

  const handleLogout = () => {
    clearStoredSession();
    signOutFromSupabase();
    setIsLoggedIn(false);
    setCurrentView('home');
    toast.showInfo('Signed Out', 'You have been signed out successfully.');
  };

  const handleLoginSuccess = (role?: 'Superadmin' | 'Church Admin', churchName?: string, adminName?: string, email?: string) => {
    const effectiveRole: 'Superadmin' | 'Church Admin' = role || 'Church Admin';
    let superadminChurch = 'GCYC Group HQ';
    let superadminPhone = '+233 24 123 4567';
    try {
      const cached = localStorage.getItem('cekbu_superadmin_profile');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed.churchName) superadminChurch = parsed.churchName;
        if (parsed.phone) superadminPhone = parsed.phone;
      }
    } catch (e) {}

    const effectiveChurch = effectiveRole === 'Superadmin' ? (churchName || superadminChurch) : (churchName || '');
    const effectiveName = adminName || (effectiveRole === 'Superadmin' ? 'Group Pastor' : `${effectiveChurch || 'Church'} Admin`);

    const newUserSession: AuthSessionUser = {
      id: `usr-${Date.now()}`,
      name: effectiveName,
      role: effectiveRole,
      church: effectiveChurch,
      zone: 'Zone 1 (Korle Bu)',
      avatar: effectiveRole === 'Superadmin'
        ? 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200'
        : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
      email: email || '',
      phone: effectiveRole === 'Superadmin' ? superadminPhone : undefined
    };

    saveStoredSession(newUserSession);
    setUser(newUserSession);
    setIsLoggedIn(true);
    setCurrentView('dashboard');
    toast.showSuccess(
      `Signed In as ${effectiveRole}`,
      `Welcome, ${effectiveName}.${effectiveChurch ? ` Assigned to ${effectiveChurch}.` : ''}`
    );
  };

  // Render Public Portal if not logged in or viewing public views
  if (!isLoggedIn) {
    return (
      <PublicPortal
        members={members}
        churches={churches}
        leaders={leaders}
        churchAdmins={churchAdmins}
        serviceTypes={serviceTypes}
        onLoginSuccess={handleLoginSuccess}
        onAddMember={handleAddMember}
        onAddLeader={handleAddLeader}
        onAddChurchAdmin={handleAddChurchAdmin}
        onConfirmAttendance={handleConfirmAttendance}
      />
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-body text-slate-900 antialiased selection:bg-blue-600 selection:text-white">

      {/* Navigation Sidebar */}
      <Sidebar
        currentView={currentView}
        user={user}
        members={members}
        attendanceRecords={attendanceRecords}
        churches={churches}
        churchAdmins={churchAdmins}
        onNavigate={setCurrentView}
        onLogout={handleLogout}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Container */}
      <div className="flex-1 md:ml-64 flex flex-col h-full overflow-hidden relative">

        {/* Mobile App Native Header Bar */}
        <MobileAppHeader
          currentView={currentView}
          user={user}
          onNavigate={setCurrentView}
          onOpenMobileMenu={() => setIsMobileSidebarOpen(true)}
          onLogout={handleLogout}
        />

        {/* Desktop Top Header Navigation */}
        <div className="hidden md:block">
          <TopHeader
            currentView={currentView}
            user={user}
            members={members}
            auditLogs={auditLogs}
            onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
            onNavigate={setCurrentView}
            onSelectMemberForCard={setSelectedMemberForCard}
            onOpenAnnouncement={() => setShowAnnouncementModal(true)}
          />
        </div>

        {/* View Router */}
        <main className="flex-1 overflow-y-auto pb-24 md:pb-8 relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentView}
              initial={{ opacity: 0, x: -16, y: 8 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              exit={{ opacity: 0, x: 16, y: -8 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="h-full"
            >
              {currentView === 'dashboard' && (
                <DashboardOverview
                  user={user}
                  topLeaders={topLeaders}
                  members={members}
                  leaders={leaders}
                  churches={churches}
                  churchAdmins={churchAdmins}
                  attendanceRecords={attendanceRecords}
                  serviceTypes={serviceTypes}
                  onNavigate={setCurrentView}
                  onSelectMemberForCard={setSelectedMemberForCard}
                  onUpdateServiceTypes={setServiceTypes}
                />
              )}

              {currentView === 'group_overview' && (
                <GroupOverview
                  churches={churches}
                  churchAdmins={churchAdmins}
                  auditLogs={auditLogs}
                  onNavigate={setCurrentView}
                  onOpenAnnouncement={() => setShowAnnouncementModal(true)}
                  onAddChurch={handleAddChurch}
                />
              )}

              {currentView === 'church_admins_directory' && (
                <ChurchAdminsDirectory
                  churchAdmins={churchAdmins}
                  onNavigate={setCurrentView}
                />
              )}

              {currentView === 'leaders' && (
                <LeaderDirectory
                  leaders={leaders}
                  promotionQueue={promotionQueue}
                  user={user}
                  onConfirmPromotion={handleConfirmPromotion}
                  onNavigate={setCurrentView}
                />
              )}

              {currentView === 'leader_registration' && (
                <LeaderRegistration
                  leaders={leaders}
                  onAddLeader={handleAddLeader}
                  onNavigate={setCurrentView}
                />
              )}

              {currentView === 'members' && (
                <MemberDatabase
                  members={members}
                  user={user}
                  onNavigate={setCurrentView}
                  onSelectMemberForCard={setSelectedMemberForCard}
                />
              )}

              {currentView === 'register' && (
                <NewRegistration
                  members={members}
                  leaders={leaders}
                  serviceTypes={serviceTypes}
                  onAddMember={handleAddMember}
                  onNavigate={setCurrentView}
                  onSelectMemberForCard={setSelectedMemberForCard}
                />
              )}

              {(currentView === 'attendance' || currentView === 'reports') && (
                <AttendanceView
                  attendanceRecords={attendanceRecords}
                  user={user}
                  onNavigate={setCurrentView}
                  onClearTodayAttendance={() => setAttendanceRecords(prev => prev.filter(r => r.date && r.date !== new Date().toISOString().slice(0, 10)))}
                />
              )}

              {currentView === 'qr_scanner' && user?.role !== 'Superadmin' && (
                <QRScannerModal
                  members={members}
                  onConfirmAttendance={handleConfirmAttendance}
                  onClose={() => setCurrentView('dashboard')}
                  onNavigate={setCurrentView}
                />
              )}

              {currentView === 'analytics' && (
                <AnalyticsView
                  user={user}
                  members={members}
                  churches={churches}
                  onNavigate={setCurrentView}
                  onAddAuditLog={(log) => setAuditLogs(prev => [log, ...prev])}
                />
              )}

              {(currentView === 'settings' || currentView === 'database_schema') && (
                <SettingsView
                  user={user}
                  churches={churches}
                  churchAdmins={churchAdmins}
                  members={members}
                  leaders={leaders}
                  attendanceRecords={attendanceRecords}
                  auditLogs={auditLogs}
                  serviceTypes={serviceTypes}
                  onUpdateServiceTypes={setServiceTypes}
                  onNavigate={setCurrentView}
                  onAddAuditLog={(log) => setAuditLogs(prev => [log, ...prev])}
                  onUpdateUser={(updated) => setUser(prev => ({ ...prev, ...updated }))}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Mobile Native Bottom Navigation Bar */}
        <MobileBottomNav
          currentView={currentView}
          user={user}
          onNavigate={setCurrentView}
          onOpenAnnouncementModal={() => setShowAnnouncementModal(true)}
        />

      </div>

      {/* Global Modals */}
      <AnimatePresence>
        {selectedMemberForCard && (
          <MemberCardModal
            key="member-card-modal"
            member={selectedMemberForCard}
            onClose={() => setSelectedMemberForCard(null)}
          />
        )}

        {showAnnouncementModal && (
          <AnnouncementModal
            key="announcement-modal"
            onClose={() => setShowAnnouncementModal(false)}
            onAddAuditLog={(log) => setAuditLogs(prev => [log, ...prev])}
          />
        )}
      </AnimatePresence>

    </div>
  );
}
