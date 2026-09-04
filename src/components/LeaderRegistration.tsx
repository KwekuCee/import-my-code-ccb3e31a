import React, { useState } from 'react';
import { Leader, LeaderType, ViewType, Member } from '../types';

interface LeaderRegistrationProps {
  leaders: Leader[];
  members?: Member[];
  churches?: { id: string; name: string }[];
  onAddLeader: (leader: Leader) => void;
  onNavigate: (view: ViewType) => void;
}

export const LeaderRegistration: React.FC<LeaderRegistrationProps> = ({
  leaders,
  members = [],
  churches = [],
  onAddLeader,
  onNavigate
}) => {
  const [selectedMemberId, setSelectedMemberId] = useState('');

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [contact, setContact] = useState('');
  const [cellOrPcfName, setCellOrPcfName] = useState('');
  const [dob, setDob] = useState('');
  const [location, setLocation] = useState('Korle Bu');
  const [leaderType, setLeaderType] = useState<LeaderType>('BSCT');
  const [church, setChurch] = useState('GCYC Main');
  const [parentLeaderId, setParentLeaderId] = useState('');
  const [isAppointed, setIsAppointed] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [createdLeader, setCreatedLeader] = useState<Leader | null>(null);
  const [authCode, setAuthCode] = useState('');
  const [authError, setAuthError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');

    if (authCode.trim().toUpperCase() !== 'YOM26') {
      setAuthError('Invalid Authentication Code! Please enter a valid security code.');
      return;
    }

    if (!fullName.trim() || !contact.trim() || !cellOrPcfName.trim()) return;

    const parentLeader = leaders.find(l => l.id === parentLeaderId);

    const newLeader: Leader = {
      id: `LDR-${Math.floor(100 + Math.random() * 900)}`,
      fullName: fullName.trim(),
      email: email.trim() || `${fullName.toLowerCase().replace(/\s+/g, '.')}@cekorlebu.org`,
      contact: contact.trim(),
      dob: dob || '1995-01-01',
      location: location.trim() || 'Korle Bu',
      leaderType,
      cellOrPcfName: cellOrPcfName.trim(),
      church,
      parentLeaderId: parentLeaderId || undefined,
      parentLeaderName: parentLeader ? parentLeader.fullName : undefined,
      isAppointed,
      downstreamCount: 0,
      promotionStatus: 'None',
      joinedDate: new Date().toISOString().slice(0, 10),
      initials: (fullName || 'Leader')
        .split(' ')
        .filter(Boolean)
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2) || 'LD'
    };

    onAddLeader(newLeader);
    setCreatedLeader(newLeader);
    setIsSubmitted(true);
  };

  const handleReset = () => {
    setIsSubmitted(false);
    setCreatedLeader(null);
    setFullName('');
    setEmail('');
    setContact('');
    setCellOrPcfName('');
    setDob('');
    setIsAppointed(false);
  };

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto space-y-6">

      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 text-xs font-mono font-bold text-amber-700 bg-amber-50 px-3 py-1 rounded-full mb-1 border border-amber-200">
          <span className="material-symbols-outlined text-[14px]">military_tech</span>
          GCYC Hierarchy Entry
        </div>
        <h1 className="font-display text-2xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
          Leader Official Registration
        </h1>
        <p className="font-body text-xs md:text-sm text-slate-500 mt-1">
          Register PCF Leaders, Cell Leaders, BSCTs, and Church Coordinators so members can select them during attendance check-in.
        </p>
      </div>

      {/* Structural Hierarchy Guide Card */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-3xl p-5 md:p-6 shadow-lg border border-slate-800 space-y-3">
        <div className="flex items-center gap-2 text-amber-400 font-headline font-bold text-sm">
          <span className="material-symbols-outlined text-[20px]">account_tree</span>
          <span>Church Growth Hierarchy Pipeline</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs font-mono">
          <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700">
            <p className="text-amber-400 font-bold">1. BSCT</p>
            <p className="text-[10px] text-slate-400 mt-0.5">Graduate Foundation + 5 Converts</p>
          </div>
          <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700">
            <p className="text-amber-400 font-bold">2. Cell Leader</p>
            <p className="text-[10px] text-slate-400 mt-0.5">5 BSCTs (25 Members)</p>
          </div>
          <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700">
            <p className="text-amber-400 font-bold">3. PCF Leader</p>
            <p className="text-[10px] text-slate-400 mt-0.5">160+ Members Network</p>
          </div>
          <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700">
            <p className="text-amber-400 font-bold">4. Coordinator</p>
            <p className="text-[10px] text-slate-400 mt-0.5">Supervises PCFs & Cells</p>
          </div>
        </div>
      </div>

      {isSubmitted && createdLeader ? (
        <div className="bg-white border border-emerald-200 rounded-3xl p-6 md:p-8 shadow-xl text-center space-y-5 animate-in fade-in duration-200">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto border border-emerald-200">
            <span className="material-symbols-outlined text-[36px]">verified</span>
          </div>
          <div>
            <span className="font-mono text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Leader Profile Active
            </span>
            <h2 className="font-headline font-bold text-2xl text-slate-900 mt-2">{createdLeader.fullName} Registered!</h2>
            <p className="text-xs text-slate-500 mt-1">
              Assigned ID <span className="font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">{createdLeader.id}</span> as <strong className="text-slate-900">{createdLeader.leaderType}</strong> for {createdLeader.cellOrPcfName}.
            </p>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl text-left text-xs space-y-2 border border-slate-200 font-body">
            <div className="flex justify-between py-1 border-b border-slate-200">
              <span className="text-slate-500">Branch Church:</span>
              <span className="font-bold text-slate-900">{createdLeader.church}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200">
              <span className="text-slate-500">Cell / PCF Name:</span>
              <span className="font-bold text-amber-700">{createdLeader.cellOrPcfName}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200">
              <span className="text-slate-500">Contact:</span>
              <span className="font-mono font-bold">{createdLeader.contact}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500">Appointment Method:</span>
              <span className="font-bold text-slate-900">
                {createdLeader.isAppointed ? 'Direct Admin Appointment' : 'Standard Growth Hierarchy'}
              </span>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={() => onNavigate('leaders')}
              className="flex-1 bg-slate-900 text-white py-3 rounded-xl font-bold text-xs hover:bg-slate-800 transition-colors"
            >
              View Leaders Directory
            </button>
            <button
              onClick={handleReset}
              className="flex-1 border border-slate-200 text-slate-700 py-3 rounded-xl font-bold text-xs hover:bg-slate-50"
            >
              Register Another Leader
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white border border-slate-200/80 p-6 md:p-8 rounded-3xl shadow-2xs space-y-5">

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* Leader Type */}
            <div>
              <label htmlFor="leaderType" className="block font-mono text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Leader Designation *
              </label>
              <select
                id="leaderType"
                value={leaderType}
                onChange={e => setLeaderType(e.target.value as LeaderType)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-semibold text-slate-900 outline-none focus:border-blue-600 focus:bg-white"
              >
                <option value="BSCT">BSCT (Bible Study Class Teacher)</option>
                <option value="Cell Leader">Cell Leader</option>
                <option value="PCF Leader">PCF Leader</option>
                <option value="Church Coordinator">Church Coordinator</option>
              </select>
            </div>

            {/* Cell or PCF Name */}
            <div>
              <label htmlFor="cellOrPcfName" className="block font-mono text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Cell or PCF Name *
              </label>
              <input
                id="cellOrPcfName"
                type="text"
                required
                value={cellOrPcfName}
                onChange={e => setCellOrPcfName(e.target.value)}
                placeholder="e.g. Royal Cell 1 or Grace PCF"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 outline-none focus:border-blue-600 focus:bg-white"
              />
            </div>

            {/* Full Name */}
            <div>
              <label htmlFor="leaderFullName" className="block font-mono text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Full Name *
              </label>
              <input
                id="leaderFullName"
                type="text"
                required
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder="e.g. Brother Samuel Ofori"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 outline-none focus:border-blue-600 focus:bg-white"
              />
            </div>

            {/* Contact Phone */}
            <div>
              <label htmlFor="leaderContact" className="block font-mono text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Phone Contact *
              </label>
              <input
                id="leaderContact"
                type="tel"
                required
                value={contact}
                onChange={e => setContact(e.target.value)}
                placeholder="e.g. +233 24 123 4567"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 font-mono outline-none focus:border-blue-600 focus:bg-white"
              />
            </div>

            {/* Email Address */}
            <div>
              <label htmlFor="leaderEmail" className="block font-mono text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Email Address
              </label>
              <input
                id="leaderEmail"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="leader@cekorlebu.org"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 outline-none focus:border-blue-600 focus:bg-white"
              />
            </div>

            {/* Date of Birth */}
            <div>
              <label htmlFor="leaderDob" className="block font-mono text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Date of Birth *
              </label>
              <input
                id="leaderDob"
                type="date"
                required
                value={dob}
                onChange={e => setDob(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 outline-none focus:border-blue-600 focus:bg-white"
              />
            </div>

            {/* Location */}
            <div>
              <label htmlFor="leaderLocation" className="block font-mono text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Residential Area
              </label>
              <input
                id="leaderLocation"
                type="text"
                value={location}
                onChange={e => setLocation(e.target.value)}
                placeholder="e.g. Korle Bu / Dansoman"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 outline-none focus:border-blue-600 focus:bg-white"
              />
            </div>

            {/* Branch Church */}
            <div>
              <label htmlFor="leaderChurch" className="block font-mono text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Branch Church *
              </label>
              <select
                id="leaderChurch"
                value={church}
                onChange={e => setChurch(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-semibold text-slate-900 outline-none focus:border-blue-600 focus:bg-white"
              >
                <option value="GCYC Main">GCYC Main</option>
                <option value="GCYC 1">GCYC 1</option>
                <option value="GCYC 2">GCYC 2</option>
                <option value="CE Mamprobi">CE Mamprobi</option>
                <option value="CE Dansoman">CE Dansoman</option>
                <option value="CE Kaneshie">CE Kaneshie</option>
              </select>
            </div>

          </div>

          {/* Parent Leader Link */}
          <div className="pt-3 border-t border-slate-100 space-y-2">
            <label htmlFor="parentLeaderSelect" className="block font-mono text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Supervising Parent Leader in Hierarchy
            </label>
            <select
              id="parentLeaderSelect"
              value={parentLeaderId}
              onChange={e => setParentLeaderId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-semibold text-slate-900 outline-none focus:border-blue-600 focus:bg-white"
            >
              <option value="">None (Top Level / Direct Pastor Report)</option>
              {leaders.map(l => (
                <option key={l.id} value={l.id}>
                  {l.fullName} ({l.leaderType} - {l.cellOrPcfName})
                </option>
              ))}
            </select>
          </div>

          {/* Appointed Leader Option */}
          <div className="bg-amber-50/60 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
            <input
              id="isAppointed"
              type="checkbox"
              checked={isAppointed}
              onChange={e => setIsAppointed(e.target.checked)}
              className="mt-0.5 w-4 h-4 text-amber-600 rounded cursor-pointer"
            />
            <div>
              <label htmlFor="isAppointed" className="font-bold text-xs text-amber-900 cursor-pointer">
                Appointed Directly (Bypassed Standard Growth Cycle)
              </label>
              <p className="text-[11px] text-amber-700/80 mt-0.5">
                Check this option if the leader was appointed by church leadership without transitioning through BSCT -&gt; Cell -&gt; PCF promotion thresholds.
              </p>
            </div>
          </div>

          {/* Authentication Code Gate */}
          <div className="p-4 bg-slate-900 text-white rounded-2xl space-y-2">
            <div className="flex justify-between items-center">
              <label className="block font-mono text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                Authentication Code Required *
              </label>
              <span className="text-[10px] font-mono text-slate-400">Security Protected</span>
            </div>
            <input
              type="text"
              required
              value={authCode}
              onChange={e => setAuthCode(e.target.value)}
              placeholder="Enter Security Code"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-amber-300 font-mono font-bold tracking-widest outline-none focus:border-amber-400"
            />
            {authError && (
              <p className="text-xs text-rose-400 font-semibold">{authError}</p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-3.5 px-6 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-98"
          >
            <span className="material-symbols-outlined text-[18px]">person_add</span>
            <span>Complete Leader Registration</span>
          </button>

        </form>
      )}

    </div>
  );
};
