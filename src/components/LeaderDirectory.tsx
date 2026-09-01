import React, { useState } from 'react';
import { Leader, LeaderType, PromotionQueueItem, ViewType } from '../types';

interface LeaderDirectoryProps {
  leaders: Leader[];
  promotionQueue: PromotionQueueItem[];
  user?: {
    name: string;
    role: 'Superadmin' | 'Church Admin';
    church: string;
  };
  onConfirmPromotion: (promotionId: string) => void;
  onNavigate: (view: ViewType) => void;
}

export const LeaderDirectory: React.FC<LeaderDirectoryProps> = ({
  leaders,
  promotionQueue,
  user,
  onConfirmPromotion,
  onNavigate
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('All');
  const [selectedChurch, setSelectedChurch] = useState<string>('All');

  const isChurchAdmin = user?.role === 'Church Admin';
  const targetChurch = user?.church || '';

  const scopedLeaders = isChurchAdmin
    ? leaders.filter(l => l.church === targetChurch)
    : leaders;

  const scopedPromotionQueue = isChurchAdmin
    ? promotionQueue.filter(p => p.church === targetChurch)
    : promotionQueue;

  const cleanLeaderSearch = (searchTerm || '').trim().toLowerCase();
  const filteredLeaders = scopedLeaders.filter(ldr => {
    if (!ldr) return false;
    const nameStr = (ldr.fullName || '').toLowerCase();
    const cellStr = (ldr.cellOrPcfName || '').toLowerCase();
    const idStr = (ldr.id || '').toLowerCase();

    const matchesSearch =
      !cleanLeaderSearch ||
      nameStr.includes(cleanLeaderSearch) ||
      cellStr.includes(cleanLeaderSearch) ||
      idStr.includes(cleanLeaderSearch);
    const matchesType = selectedType === 'All' || ldr.leaderType === selectedType;
    const matchesChurch = isChurchAdmin ? true : (selectedChurch === 'All' || ldr.church === selectedChurch);
    return matchesSearch && matchesType && matchesChurch;
  });

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-mono font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-full mb-1 border border-blue-200">
            <span className="material-symbols-outlined text-[14px]">diversity_3</span>
            GCYC Hierarchy & Leadership Directory
          </div>
          <h1 className="font-display text-2xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
            Leadership & Cell Directory
          </h1>
          <p className="font-body text-xs md:text-sm text-slate-500 mt-1">
            Supervise Church Coordinators, PCF Leaders, Cell Leaders, and BSCTs across all network branches.
          </p>
        </div>

        <button
          onClick={() => onNavigate('leader_registration')}
          className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-2.5 px-4 rounded-xl transition-all flex items-center gap-2 shadow-md cursor-pointer shrink-0"
        >
          <span className="material-symbols-outlined text-[18px]">person_add</span>
          <span>Register New Leader</span>
        </button>
      </div>

      {/* Auto-Flagged Promotion Queue Panel */}
      {promotionQueue.length > 0 && (
        <div className="bg-gradient-to-r from-amber-500/10 via-amber-50 to-white border border-amber-300 rounded-3xl p-5 md:p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-amber-900 font-headline font-bold text-sm">
              <span className="material-symbols-outlined text-[20px] text-amber-600 icon-fill">military_tech</span>
              <span>Auto-Flagged Leader Promotion Queue ({promotionQueue.length})</span>
            </div>
            <span className="font-mono text-[10px] font-bold bg-amber-200/80 text-amber-900 px-2.5 py-0.5 rounded-full">
              Action Required by Group Pastor
            </span>
          </div>

          <p className="text-xs text-amber-800/90 font-body">
            The growth engine auto-flagged these leaders for promotion because their downstream Bible study classes and cell members exceeded target thresholds.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {promotionQueue.map(item => (
              <div key={item.id} className="bg-white p-4 rounded-2xl border border-amber-200 shadow-2xs space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-headline font-bold text-sm text-slate-900">{item.leaderName}</h4>
                    <p className="font-mono text-[10px] text-slate-500">{item.church}</p>
                  </div>
                  <span className="bg-amber-100 text-amber-900 font-mono font-bold text-[10px] px-2 py-0.5 rounded-md">
                    {item.currentRole} ➔ {item.targetRole}
                  </span>
                </div>

                <p className="text-xs text-slate-600 font-body bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  {item.reason}
                </p>

                <div className="flex items-center justify-between pt-1">
                  <span className="font-mono text-[10px] text-slate-400">Flagged: {item.flaggedAt}</span>
                  <button
                    onClick={() => onConfirmPromotion(item.id)}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3.5 py-1.5 rounded-xl transition-all shadow-xs flex items-center gap-1 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[14px]">check</span>
                    <span>Confirm Promotion</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter Controls */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
            search
          </span>
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search leader name, cell or PCF..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 outline-none focus:bg-white focus:border-blue-600"
          />
        </div>

        <div className="flex gap-2 w-full md:w-auto">
          <select
            value={selectedType}
            onChange={e => setSelectedType(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 outline-none focus:border-blue-600 cursor-pointer"
          >
            <option value="All">All Leader Types</option>
            <option value="Church Coordinator">Church Coordinators</option>
            <option value="PCF Leader">PCF Leaders</option>
            <option value="Cell Leader">Cell Leaders</option>
            <option value="BSCT">BSCTs</option>
          </select>

          <select
            value={selectedChurch}
            onChange={e => setSelectedChurch(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 outline-none focus:border-blue-600 cursor-pointer"
          >
            <option value="All">All Churches</option>
            <option value="GCYC Main">GCYC Main</option>
            <option value="GCYC 1">GCYC 1</option>
            <option value="GCYC 2">GCYC 2</option>
            <option value="CE Mamprobi">CE Mamprobi</option>
            <option value="CE Dansoman">CE Dansoman</option>
          </select>
        </div>
      </div>

      {/* Leaders Table */}
      <div className="bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-2xs">
        <div className="p-4 md:p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div>
            <h3 className="font-headline text-base font-bold text-slate-900">Registered Leaders List</h3>
            <p className="text-xs text-slate-500">Total {filteredLeaders.length} leaders in directory</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/60 font-mono text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-200">
                <th className="py-3 px-4">Leader Name</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Cell / PCF Name</th>
                <th className="py-3 px-4">Church</th>
                <th className="py-3 px-4">Supervising Parent</th>
                <th className="py-3 px-4 text-center">Downstream Members</th>
                <th className="py-3 px-4 text-center">Appointment</th>
              </tr>
            </thead>
            <tbody className="font-body text-xs divide-y divide-slate-100">
              {filteredLeaders.length > 0 ? (
                filteredLeaders.map(ldr => (
                  <tr key={ldr.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-900 font-display font-extrabold text-xs flex items-center justify-center border border-amber-200 shrink-0">
                          {ldr.initials || (ldr.fullName ? ldr.fullName.split(' ').filter(Boolean).map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'LD')}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{ldr.fullName}</p>
                          <p className="font-mono text-[10px] text-slate-400">{ldr.contact}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`
                        px-2.5 py-1 rounded-full text-[10px] font-bold font-mono border
                        ${ldr.leaderType === 'Church Coordinator' ? 'bg-purple-50 text-purple-800 border-purple-200' : ''}
                        ${ldr.leaderType === 'PCF Leader' ? 'bg-blue-50 text-blue-800 border-blue-200' : ''}
                        ${ldr.leaderType === 'Cell Leader' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : ''}
                        ${ldr.leaderType === 'BSCT' ? 'bg-amber-50 text-amber-800 border-amber-200' : ''}
                      `}>
                        {ldr.leaderType}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-semibold text-slate-800">
                      {ldr.cellOrPcfName}
                    </td>

                    <td className="py-3.5 px-4 text-slate-600">
                      {ldr.church}
                    </td>

                    <td className="py-3.5 px-4 text-slate-500 font-medium">
                      {ldr.parentLeaderName || 'Direct Pastor Report'}
                    </td>

                    <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-900">
                      <span className="bg-slate-100 px-2.5 py-1 rounded-lg">
                        {ldr.downstreamCount || 0}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      {ldr.isAppointed ? (
                        <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                          Appointed
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200">
                          Growth Cycle
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-xs text-slate-400">
                    No leaders found in the database.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
