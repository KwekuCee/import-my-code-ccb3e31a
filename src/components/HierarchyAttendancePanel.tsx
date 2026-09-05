import React, { useMemo, useState } from 'react';
import { Member, Leader, AttendanceRecord } from '../types';
import { buildLeaderAttendanceTree, flattenLeaderNode, LeaderAttendanceNode } from '../utils/analyticsUtils';

interface HierarchyAttendancePanelProps {
  members: Member[];
  leaders: Leader[];
  attendance: AttendanceRecord[];
  /** When set, only this church's people are counted. */
  churchScope?: string;
  showChurchLabel?: boolean;
}

const roleLabel: Record<string, string> = {
  'PCF Leader': 'PCF',
  'Cell Leader': 'Cell',
  'BSCT': 'Bible Study Class',
  'Church Coordinator': 'Coordinator'
};

export const HierarchyAttendancePanel: React.FC<HierarchyAttendancePanelProps> = ({
  members,
  leaders,
  attendance,
  churchScope,
  showChurchLabel = false
}) => {
  const [tab, setTab] = useState<'pcf' | 'cell' | 'leader'>('pcf');
  const [expanded, setExpanded] = useState<string | null>(null);

  const scoped = useMemo(() => {
    const same = (v?: string) => !churchScope || (v || '').toLowerCase() === churchScope.toLowerCase();
    return {
      members: (members || []).filter(m => m && same(m.church)),
      leaders: (leaders || []).filter(l => l && same(l.church)),
      attendance: (attendance || []).filter(a => a && same(a.church))
    };
  }, [members, leaders, attendance, churchScope]);

  const tree = useMemo(
    () => buildLeaderAttendanceTree(scoped.members, scoped.leaders, scoped.attendance),
    [scoped]
  );

  const pcfRows = tree.nodes.filter(n => n.role === 'PCF Leader' || n.role === 'Church Coordinator');
  const cellRows = tree.nodes.filter(n => n.role === 'Cell Leader');
  const leaderRows = [...tree.nodes].sort((a, b) => b.groupTotal - a.groupTotal);

  const rows = tab === 'pcf' ? pcfRows.sort((a, b) => b.groupTotal - a.groupTotal)
    : tab === 'cell' ? cellRows.sort((a, b) => b.groupTotal - a.groupTotal)
      : leaderRows;

  const grandTotal = scoped.attendance.length;

  const tabs: Array<{ key: 'pcf' | 'cell' | 'leader'; label: string }> = [
    { key: 'pcf', label: `PCF groups (${pcfRows.length})` },
    { key: 'cell', label: `Cells (${cellRows.length})` },
    { key: 'leader', label: `Every leader (${tree.nodes.length})` }
  ];

  const renderRow = (node: LeaderAttendanceNode) => {
    const below = flattenLeaderNode(node);
    const isOpen = expanded === node.id;
    return (
      <div key={node.id} className="bg-slate-50 border border-slate-200 rounded-xl p-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-700 text-white text-xs font-display font-extrabold flex items-center justify-center shrink-0">
            {(node.name || 'LD').split(' ').filter(Boolean).map(n => n[0]).join('').toUpperCase().slice(0, 2)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-xs text-slate-900 truncate">
              {node.name}
              <span className="ml-2 text-[9px] font-extrabold bg-blue-100 text-blue-900 px-1.5 py-0.5 rounded">
                {roleLabel[node.role] || node.role}
              </span>
            </p>
            <p className="text-xs text-slate-500 mt-0.5 truncate">
              {node.groupName}
              {showChurchLabel ? ` • ${node.church}` : ''}
              {` • ${node.groupMembers} member${node.groupMembers === 1 ? '' : 's'}`}
            </p>
            <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mt-2">
              <div
                className="bg-blue-700 h-full rounded-full transition-all duration-500"
                style={{ width: `${grandTotal > 0 ? Math.round((node.groupTotal / grandTotal) * 100) : 0}%` }}
              />
            </div>
          </div>
          <div className="text-right shrink-0">
            <p className="font-display text-lg font-extrabold text-slate-900 leading-none">{node.groupTotal}</p>
            <p className="text-xs text-emerald-700 font-bold mt-1">+{node.groupToday} today</p>
            <p className="text-[10px] text-slate-500 mt-0.5">{node.directTotal} own</p>
          </div>
        </div>

        {below.length > 0 && (
          <button
            onClick={() => setExpanded(isOpen ? null : node.id)}
            className="mt-2 text-xs font-bold text-blue-700 hover:text-blue-900 flex items-center gap-1 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[15px]">{isOpen ? 'expand_less' : 'expand_more'}</span>
            <span>{isOpen ? 'Hide' : `Show ${below.length} leader${below.length === 1 ? '' : 's'} under this group`}</span>
          </button>
        )}

        {isOpen && (
          <div className="mt-2 space-y-1.5 border-t border-slate-200 pt-2">
            {below.map(child => (
              <div key={child.id} className="flex items-center justify-between gap-2 bg-white rounded-lg border border-slate-200 px-3 py-2">
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900 truncate">{child.name}</p>
                  <p className="text-[10px] text-slate-500">
                    {roleLabel[child.role] || child.role} • {child.groupName} • {child.groupMembers} member{child.groupMembers === 1 ? '' : 's'}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs font-extrabold text-slate-900">{child.groupTotal}</p>
                  <p className="text-[10px] text-emerald-700 font-bold">+{child.groupToday} today</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div>
          <h3 className="font-headline font-bold text-base text-slate-900 flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-700 text-[20px]">account_tree</span>
            <span>Attendance by PCF, cell and leader</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            A PCF total includes its own people plus every cell and Bible study class under it.
          </p>
        </div>
        <div className="flex gap-2">
          <span className="text-xs font-bold bg-slate-900 text-white px-3 py-1 rounded-full">
            All check-ins: {grandTotal}
          </span>
          {tree.unassigned.total > 0 && (
            <span className="text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 px-3 py-1 rounded-full">
              No leader yet: {tree.unassigned.total}
            </span>
          )}
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => { setTab(t.key); setExpanded(null); }}
            className={`text-xs font-bold px-3 py-1.5 rounded-xl cursor-pointer transition-all border ${tab === t.key
              ? 'bg-blue-700 text-white border-blue-700 shadow-sm'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {rows.length > 0 ? (
        <div className="space-y-2">{rows.map(renderRow)}</div>
      ) : (
        <div className="text-center py-6 text-xs text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-200">
          No leaders registered yet, so there is nothing to group.
        </div>
      )}
    </div>
  );
};
