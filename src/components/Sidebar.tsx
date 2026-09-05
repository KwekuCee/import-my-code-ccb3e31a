import React from 'react';
import { ViewType, Member, AttendanceRecord, ChurchBranch, ChurchAdminAccount } from '../types';
import { exportMultiSheetExcel, exportMultiSectionCSV } from '../utils/exportUtils';

interface SidebarProps {
  currentView: ViewType;
  user?: {
    name: string;
    role: 'Superadmin' | 'Church Admin';
    church: string;
  };
  members?: Member[];
  attendanceRecords?: AttendanceRecord[];
  churches?: ChurchBranch[];
  churchAdmins?: ChurchAdminAccount[];
  onNavigate: (view: ViewType) => void;
  onLogout: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  user,
  members = [],
  attendanceRecords = [],
  churches = [],
  churchAdmins = [],
  onNavigate,
  onLogout,
  isMobileOpen = false,
  onCloseMobile
}) => {
  const logoUrl = '/church-logo.png';

  const isSuperadmin = user?.role === 'Superadmin';

  const handleExportSystemData = () => {
    try {
      exportMultiSheetExcel(members, attendanceRecords, churches, churchAdmins);
    } catch (e) {
      exportMultiSectionCSV(members, attendanceRecords, churches, churchAdmins);
    }
  };

  const navItems: { id: ViewType; label: string; icon: string }[] = isSuperadmin ? [
    { id: 'dashboard', label: 'Group Pastor Dashboard', icon: 'shield' },
    { id: 'group_overview', label: 'Group Network Overview', icon: 'account_tree' },
    { id: 'church_admins_directory', label: 'Church Admins', icon: 'badge' },
    { id: 'leaders', label: 'Leaders', icon: 'diversity_3' },
    { id: 'leader_registration', label: 'Leader Self-Reg Portal', icon: 'military_tech' },
    { id: 'members', label: 'All Church Members', icon: 'group' },
    { id: 'attendance', label: 'Group Attendance Log', icon: 'fact_check' },
    { id: 'analytics', label: 'Network Analytics', icon: 'analytics' },
    { id: 'settings', label: 'Superadmin Settings', icon: 'settings' },
  ] : [
    { id: 'dashboard', label: `${user?.church || 'Church'} Dashboard`, icon: 'church' },
    { id: 'leaders', label: 'PCF & Cell Leaders', icon: 'military_tech' },
    { id: 'members', label: 'Members', icon: 'group' },
    { id: 'attendance', label: 'Service Attendance Log', icon: 'fact_check' },
    { id: 'analytics', label: 'Branch Analytics', icon: 'analytics' },
    { id: 'leader_registration', label: 'Register New Leader', icon: 'person_add' },
    { id: 'settings', label: 'Branch Settings', icon: 'settings' },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 z-40 md:hidden backdrop-blur-xs transition-opacity"
          onClick={onCloseMobile}
        />
      )}

      <aside className={`
        fixed left-0 top-0 h-full w-64 bg-white/95 backdrop-blur-xl text-slate-800 border-r border-slate-200/90 
        flex flex-col z-50 transition-transform duration-300 ease-in-out shadow-sm md:shadow-none
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        {/* Header / Brand */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-700 p-0.5 shadow-sm shadow-blue-700/20 shrink-0 flex items-center justify-center overflow-hidden">
              <img
                src={logoUrl}
                alt="GCYC Logo"
                className="w-full h-full object-cover rounded-[10px]"
              />
            </div>
            <div>
              <h1 className="font-headline text-base font-bold text-slate-900 tracking-tight leading-tight">
                GCYC
              </h1>
              {isSuperadmin ? (
                <span className="font-label-mono text-[9px] text-blue-700 font-bold bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                  Superadmin HQ
                </span>
              ) : (
                <span className="font-label-mono text-[9px] text-blue-700 font-bold bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200 truncate max-w-[120px] block">
                  {user?.church || 'Church Admin'}
                </span>
              )}
            </div>
          </div>
          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="md:hidden text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          )}
        </div>

        {/* Action CTAs */}
        <div className="p-3 space-y-2">
          {isSuperadmin ? (
            <>
              <button
                onClick={handleExportSystemData}
                className="w-full flex items-center justify-center gap-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs py-2 px-3 rounded-xl transition-all shadow-xs active:scale-98 cursor-pointer"
                title="Export multi-sheet report with total members per church, attendance per service, and new members per service"
              >
                <span className="material-symbols-outlined text-[18px]">download</span>
                <span>Export System Data</span>
              </button>

              <button
                onClick={() => { onNavigate('settings'); onCloseMobile?.(); }}
                className="w-full flex items-center justify-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 font-bold text-xs py-2 px-3 rounded-xl transition-all active:scale-98 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">settings</span>
                <span>Superadmin Settings</span>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => { onNavigate('qr_scanner'); onCloseMobile?.(); }}
                className="w-full flex items-center justify-center gap-2 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs py-2 px-3 rounded-xl transition-all shadow-xs active:scale-98 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">qr_code_scanner</span>
                <span>Launch Scanner</span>
              </button>

              <button
                onClick={handleExportSystemData}
                className="w-full flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 font-semibold text-xs py-2 px-3 rounded-xl transition-all active:scale-98 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">download</span>
                <span>Export Branch Data</span>
              </button>
            </>
          )}
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto px-3 py-1 space-y-1">
          <div className="px-2 pb-1 font-label-mono text-xs font-bold text-slate-400 ">
            Menu Navigation
          </div>
          {navItems.map((item) => {
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => { onNavigate(item.id); onCloseMobile?.(); }}
                className={`
                  w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer group
                  ${isActive
                    ? 'bg-blue-700 text-white shadow-sm shadow-blue-700/20 font-bold'
                    : 'text-slate-600 hover:bg-blue-50/70 hover:text-blue-900'
                  }
                `}
              >
                <span
                  className={`material-symbols-outlined text-[18px] transition-transform group-hover:scale-110 ${isActive ? 'icon-fill text-white' : 'text-slate-400 group-hover:text-blue-700'}`}
                >
                  {item.icon}
                </span>
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Footer Links */}
        <div className="p-3 border-t border-slate-100 space-y-1">
          <button
            onClick={() => { alert('GCYC Admin Support:\nPhone: +233 24 000 9999\nEmail: support@cekorlebu.org'); }}
            className="w-full flex items-center gap-3 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">contact_support</span>
            <span>Admin Support</span>
          </button>

          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">logout</span>
            <span>Sign Out</span>
          </button>

          <div className="pt-2 text-center text-xs text-slate-400">
            Developed by{' '}
            <a
              href="https://primehaven.tech"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-700 hover:underline font-semibold"
            >
              Prime Haven
            </a>
          </div>
        </div>
      </aside>
    </>
  );
};

