import React, { useMemo, useState } from 'react';
import { Leader, LeaderType, Member } from '../types';
import { isIncompleteLeader, nameKey } from '../utils/importUtils';

interface IncompleteLeadersPanelProps {
  leaders: Leader[];
  members?: Member[];
  onSave: (leader: Leader) => void | boolean | Promise<void | boolean>;
  /** Only show these leader ids (e.g. the ones just created by an import). */
  onlyIds?: string[];
  title?: string;
  subtitle?: string;
}

const LEADER_TYPES: LeaderType[] = ['BSCT', 'Cell Leader', 'PCF Leader', 'Church Coordinator'];

const TYPE_LABELS: Record<LeaderType, string> = {
  BSCT: 'Bible study class teacher',
  'Cell Leader': 'Cell leader',
  'PCF Leader': 'PCF leader',
  'Church Coordinator': 'Church coordinator',
};

interface DraftFields {
  contact: string;
  email: string;
  dob: string;
  location: string;
  leaderType: '' | LeaderType;
  cellOrPcfName: string;
}

export const IncompleteLeadersPanel: React.FC<IncompleteLeadersPanelProps> = ({
  leaders,
  members = [],
  onSave,
  onlyIds,
  title = 'Leaders needing details',
  subtitle = 'These names came from your spreadsheet. Fill in their details so they can be scanned and emailed their code.',
}) => {
  const [drafts, setDrafts] = useState<Record<string, DraftFields>>({});
  const [saved, setSaved] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const pending = useMemo(
    () =>
      (leaders || []).filter(
        (l) => isIncompleteLeader(l) && !saved[l.id] && (!onlyIds || onlyIds.includes(l.id))
      ),
    [leaders, onlyIds, saved]
  );

  const memberCount = (leader: Leader) => {
    const key = nameKey(leader.fullName);
    return (members || []).filter(
      (m) => m.invitedByLeaderId === leader.id || (m.invitedBy && nameKey(m.invitedBy) === key)
    ).length;
  };

  const draftFor = (leader: Leader): DraftFields =>
    drafts[leader.id] || {
      contact: leader.contact || '',
      email: leader.email || '',
      dob: leader.dob || '',
      location: leader.location && leader.location !== 'Not Specified' ? leader.location : '',
      leaderType: '',
      cellOrPcfName: leader.cellOrPcfName || '',
    };

  const setField = (leader: Leader, field: keyof DraftFields, value: string) => {
    const base = draftFor(leader);
    setDrafts((prev) => ({ ...prev, [leader.id]: { ...base, [field]: value } as DraftFields }));
  };

  const save = async (leader: Leader) => {
    const d = draftFor(leader);
    setSaving((prev) => ({ ...prev, [leader.id]: true }));
    setErrors((prev) => ({ ...prev, [leader.id]: '' }));
    const result = await onSave({
      ...leader,
      contact: d.contact.trim(),
      email: d.email.trim(),
      dob: d.dob.trim(),
      location: d.location.trim() || 'Not Specified',
      leaderType: (d.leaderType || leader.leaderType || 'BSCT') as LeaderType,
      cellOrPcfName: d.cellOrPcfName.trim(),
    });
    if (result === false) {
      setErrors((prev) => ({ ...prev, [leader.id]: 'The details could not be saved. Please try again.' }));
    } else {
      setSaved((prev) => ({ ...prev, [leader.id]: true }));
    }
    setSaving((prev) => ({ ...prev, [leader.id]: false }));
  };

  if (!pending.length) return null;

  const inputClass =
    'w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-semibold text-slate-900 outline-none focus:border-blue-600 focus:bg-white';

  return (
    <div className="bg-white border border-amber-200 rounded-2xl p-5 shadow-sm space-y-4">
      <div>
        <h3 className="font-display font-extrabold text-lg text-slate-900 flex items-center gap-2">
          <span className="material-symbols-outlined text-amber-600 text-[22px]">badge</span>
          {title}
          <span className="text-xs font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">{pending.length}</span>
        </h3>
        <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
      </div>

      <div className="space-y-3">
        {pending.map((leader) => {
          const d = draftFor(leader);
          const count = memberCount(leader);
          return (
            <div key={leader.id} className="border border-slate-200 rounded-xl p-3 space-y-3">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div>
                  <p className="text-sm font-bold text-slate-900">{leader.fullName}</p>
                  <p className="text-xs text-slate-500">
                    {leader.church} · {count} {count === 1 ? 'member' : 'members'} under them ·{' '}
                    {d.leaderType ? TYPE_LABELS[d.leaderType as LeaderType] : 'Role not set'}
                  </p>
                </div>
                {leader.leaderCode && (
                  <span className="text-xs font-bold bg-slate-100 text-slate-700 px-2 py-1 rounded-lg">
                    {leader.leaderCode}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                <input
                  value={d.contact}
                  onChange={(e) => setField(leader, 'contact', e.target.value)}
                  placeholder="Phone"
                  className={inputClass}
                />
                <input
                  value={d.email}
                  onChange={(e) => setField(leader, 'email', e.target.value)}
                  placeholder="Email"
                  className={inputClass}
                />
                <input
                  type="date"
                  value={d.dob}
                  onChange={(e) => setField(leader, 'dob', e.target.value)}
                  className={inputClass}
                />
                <input
                  value={d.location}
                  onChange={(e) => setField(leader, 'location', e.target.value)}
                  placeholder="Location"
                  className={inputClass}
                />
                <select
                  value={d.leaderType}
                  onChange={(e) => setField(leader, 'leaderType', e.target.value)}
                  className={inputClass}
                >
                  <option value="">Choose their role</option>
                  {LEADER_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {TYPE_LABELS[t]}
                    </option>
                  ))}
                </select>
                <input
                  value={d.cellOrPcfName}
                  onChange={(e) => setField(leader, 'cellOrPcfName', e.target.value)}
                  placeholder="Cell or PCF name"
                  className={inputClass}
                />
              </div>

              <button
                onClick={() => save(leader)}
                disabled={!d.cellOrPcfName.trim() || !d.leaderType || saving[leader.id]}
                className="bg-blue-700 hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">save</span>
                <span>{saving[leader.id] ? 'Saving…' : 'Save details'}</span>
              </button>
              {errors[leader.id] && <p className="text-xs font-semibold text-rose-700">{errors[leader.id]}</p>}
            </div>
          );
        })}
      </div>
    </div>
  );
};
