import React, { useMemo, useState } from 'react';
import { Member, Leader } from '../types';
import { FOUNDATION_SCHOOL_CLASSES } from '../data/constants';

interface ClassGroupsPanelProps {
  members: Member[];
  leaders?: Leader[];
  scopeLabel?: string;
  onOpenMemberList?: () => void;
}

type GroupKey = 'none' | 'incomplete' | 'done' | 1 | 2 | 3 | 4 | 5 | 6 | 7;

export const ClassGroupsPanel: React.FC<ClassGroupsPanelProps> = ({
  members,
  leaders = [],
  scopeLabel,
  onOpenMemberList
}) => {
  const [openGroup, setOpenGroup] = useState<GroupKey>('incomplete');
  const [openLeader, setOpenLeader] = useState<string | null>(null);

  const classOf = (m: Member) => m.foundationClass || 0;

  const groups = useMemo(() => {
    const inGroup = (m: Member, key: GroupKey) => {
      const c = classOf(m);
      if (key === 'none') return c === 0;
      if (key === 'incomplete') return c < 7;
      if (key === 'done') return c >= 7;
      return c === key;
    };
    const keys: GroupKey[] = ['none', 'incomplete', 'done', 1, 2, 3, 4, 5, 6, 7];
    return keys.map(key => ({ key, list: members.filter(m => inGroup(m, key)) }));
  }, [members]);

  const labelFor = (key: GroupKey) => {
    if (key === 'none') return 'Not enrolled';
    if (key === 'incomplete') return "Haven't finished";
    if (key === 'done') return 'Finished all 7';
    const name = FOUNDATION_SCHOOL_CLASSES.find(c => c.id === key)?.name;
    return name ? `Class ${key} — ${name}` : `Class ${key}`;
  };

  const leaderNameOf = (m: Member) => {
    if (m.invitedByLeaderId) {
      const found = leaders.find(l => l.id === m.invitedByLeaderId);
      if (found) return found.fullName;
    }
    if (m.invitedBy && !/self|walk/i.test(m.invitedBy)) return m.invitedBy;
    return null;
  };

  const openList = groups.find(g => g.key === openGroup)?.list || [];
  const sortedList = [...openList].sort((a, b) => classOf(a) - classOf(b));

  const leaderMembers = openLeader
    ? members.filter(m => (leaderNameOf(m) || '').toLowerCase() === openLeader.toLowerCase())
    : [];

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 md:p-6 space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3 border-b border-slate-100 pb-3">
        <div>
          <h3 className="font-headline font-bold text-base text-slate-900">Student groups</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Foundation school classes{scopeLabel ? ` in ${scopeLabel}` : ''} — pick a group to see the students
          </p>
        </div>
        {onOpenMemberList && (
          <button onClick={onOpenMemberList} className="text-xs font-semibold text-blue-700 hover:text-blue-800 cursor-pointer">
            Open member list
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {groups.map(({ key, list }) => (
          <button
            key={String(key)}
            onClick={() => setOpenGroup(key)}
            className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${openGroup === key
              ? 'bg-blue-700 text-white border-blue-700'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
          >
            {typeof key === 'number' ? `Class ${key}` : labelFor(key)}
            <span className={`ml-1.5 ${openGroup === key ? 'text-blue-100' : 'text-slate-400'}`}>{list.length}</span>
          </button>
        ))}
      </div>

      <div>
        <p className="text-xs font-semibold text-slate-600 mb-2">{labelFor(openGroup)} · {sortedList.length}</p>
        <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
          {sortedList.length > 0 ? (
            sortedList.map(m => {
              const leaderName = leaderNameOf(m);
              const cls = classOf(m);
              return (
                <div key={m.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-sm text-slate-900 truncate">{m.fullName}</p>
                    <p className="text-xs text-slate-500 truncate">
                      {cls === 0 ? 'Not enrolled' : cls >= 7 ? 'Finished all 7' : `Class ${cls}`}
                      {m.church ? ` • ${m.church}` : ''}
                    </p>
                  </div>
                  {leaderName ? (
                    <button
                      onClick={() => setOpenLeader(leaderName)}
                      className="text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-100 px-3 py-1.5 rounded-full hover:bg-blue-100 transition-colors cursor-pointer shrink-0"
                    >
                      {leaderName}
                    </button>
                  ) : (
                    <span className="text-xs text-slate-400 shrink-0">No leader</span>
                  )}
                </div>
              );
            })
          ) : (
            <p className="py-8 text-center text-xs text-slate-400">No students in this group yet.</p>
          )}
        </div>
      </div>

      {openLeader && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4" onClick={() => setOpenLeader(null)}>
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[80vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <div>
                <h4 className="font-headline font-bold text-base text-slate-900">{openLeader}</h4>
                <p className="text-xs text-slate-500">{leaderMembers.length} {leaderMembers.length === 1 ? 'person' : 'people'}</p>
              </div>
              <button onClick={() => setOpenLeader(null)} className="text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer">Close</button>
            </div>
            <div className="p-5 overflow-y-auto divide-y divide-slate-100">
              {leaderMembers.map(m => (
                <div key={m.id} className="py-3 flex items-center justify-between gap-3">
                  <span className="text-sm font-semibold text-slate-900 truncate">{m.fullName}</span>
                  <span className="text-xs text-slate-500 shrink-0">
                    {classOf(m) === 0 ? 'Not enrolled' : classOf(m) >= 7 ? 'Finished' : `Class ${classOf(m)}`}
                  </span>
                </div>
              ))}
              {leaderMembers.length === 0 && <p className="text-xs text-slate-400 py-6 text-center">No people yet.</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
