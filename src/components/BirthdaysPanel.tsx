import React, { useMemo, useState } from 'react';
import { Member } from '../types';
import {
  MONTH_NAMES,
  getBirthMonthIndex,
  getBirthdayDayOfMonth,
  getDaysUntilBirthday,
  formatBirthdayWithMonth
} from '../utils/analyticsUtils';

interface BirthdaysPanelProps {
  members: Member[];
  scopeLabel?: string;
  onWish?: (member: Member) => void;
}

export const BirthdaysPanel: React.FC<BirthdaysPanelProps> = ({ members, scopeLabel, onWish }) => {
  const currentMonth = new Date().getMonth();
  const [openMonth, setOpenMonth] = useState<number>(currentMonth);
  const [wished, setWished] = useState<string[]>([]);

  const byMonth = useMemo(() => {
    const buckets: Member[][] = MONTH_NAMES.map(() => []);
    members.forEach(m => {
      const monthIndex = getBirthMonthIndex(m?.dob);
      if (monthIndex === null) return;
      buckets[monthIndex].push(m);
    });
    buckets.forEach(list => list.sort((a, b) => getBirthdayDayOfMonth(a.dob) - getBirthdayDayOfMonth(b.dob)));
    return buckets;
  }, [members]);

  const comingUpCount = useMemo(
    () => members.filter(m => {
      const d = getDaysUntilBirthday(m?.dob);
      return d !== null && d <= 30;
    }).length,
    [members]
  );

  const withBirthdays = byMonth.reduce((sum, list) => sum + list.length, 0);

  const initialsOf = (m: Member) =>
    m.initials || (m.fullName ? m.fullName.split(' ').filter(Boolean).map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'MB');

  const handleWish = (m: Member) => {
    setWished(prev => (prev.includes(m.id) ? prev : [...prev, m.id]));
    onWish?.(m);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 md:p-6 space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3 border-b border-slate-100 pb-3">
        <div>
          <h3 className="font-headline font-bold text-base text-slate-900">Birthdays</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            {withBirthdays} {withBirthdays === 1 ? 'person' : 'people'} with a birth date{scopeLabel ? ` in ${scopeLabel}` : ''}
          </p>
        </div>
        <span className="text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-100 px-3 py-1.5 rounded-full">
          {comingUpCount} coming up in 30 days
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        {MONTH_NAMES.map((name, i) => (
          <button
            key={name}
            onClick={() => setOpenMonth(i)}
            className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${openMonth === i
              ? 'bg-blue-700 text-white border-blue-700'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
          >
            {name.slice(0, 3)}
            <span className={`ml-1.5 ${openMonth === i ? 'text-blue-100' : 'text-slate-400'}`}>{byMonth[i].length}</span>
          </button>
        ))}
      </div>

      <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
        {byMonth[openMonth].length > 0 ? (
          byMonth[openMonth].map(m => {
            const daysAway = getDaysUntilBirthday(m.dob);
            const comingUp = daysAway !== null && daysAway <= 30;
            const isWished = wished.includes(m.id);
            return (
              <div key={m.id} className="py-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-800 font-bold text-xs flex items-center justify-center border border-blue-100 shrink-0">
                    {initialsOf(m)}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-sm text-slate-900 truncate">{m.fullName}</p>
                    <p className="text-xs text-slate-500 truncate">
                      {formatBirthdayWithMonth(m.dob)}
                      {m.church ? ` • ${m.church}` : ''}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {comingUp && (
                    <span className="text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-full">
                      {daysAway === 0 ? 'Today' : daysAway === 1 ? 'Tomorrow' : `In ${daysAway} days`}
                    </span>
                  )}
                  <button
                    onClick={() => handleWish(m)}
                    disabled={isWished}
                    className={`text-xs font-semibold px-3 py-2 rounded-xl transition-colors cursor-pointer ${isWished
                      ? 'bg-slate-100 text-slate-500'
                      : 'bg-blue-700 text-white hover:bg-blue-800'
                      }`}
                  >
                    {isWished ? 'Sent' : 'Wish'}
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <p className="py-8 text-center text-xs text-slate-400">
            No birthdays in {MONTH_NAMES[openMonth]} yet.
          </p>
        )}
      </div>
    </div>
  );
};
