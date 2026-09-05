import React, { useState } from 'react';
import { Member, ViewType, Leader } from '../types';
import { useToast } from '../context/ToastContext';
import { FOUNDATION_SCHOOL_CLASSES, STANDARD_SERVICE_TYPES, parseFoundationClassNumber } from '../data/constants';

interface NewRegistrationProps {
  members: Member[];
  leaders?: Leader[];
  serviceTypes?: Array<{ id: string; name: string; active?: boolean }> | string[];
  onAddMember: (newMember: Member) => void;
  onNavigate: (view: ViewType) => void;
  onSelectMemberForCard: (member: Member) => void;
}

export const NewRegistration: React.FC<NewRegistrationProps> = ({
  members,
  leaders = [],
  onAddMember,
  onNavigate,
  onSelectMemberForCard
}) => {
  const toast = useToast();
  const [serviceType, setServiceType] = useState('Sunday Service');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female'>('Male');
  const [occupation, setOccupation] = useState('Student');
  const [otherOccupation, setOtherOccupation] = useState('');
  const [education, setEducation] = useState('Tertiary / University');
  const [foundationClass, setFoundationClass] = useState('Not Enrolled Yet');
  const [location, setLocation] = useState('Korle Bu');
  const [church, setChurch] = useState('GCYC Main');

  const [inviteSource, setInviteSource] = useState<'self' | 'leader'>('self');
  const [leaderSearch, setLeaderSearch] = useState('');
  const [selectedLeader, setSelectedLeader] = useState<string>('');
  const [showLeaderDropdown, setShowLeaderDropdown] = useState(false);

  const [registeredMember, setRegisteredMember] = useState<Member | null>(null);
  const [authCode, setAuthCode] = useState('');
  const [authError, setAuthError] = useState('');

  // Combine leaders and members for search suggestions
  const cleanLdrQuery = (leaderSearch || '').trim().toLowerCase();
  const leaderSuggestions = cleanLdrQuery
    ? leaders.filter(l => {
      if (!l) return false;
      const nameStr = (l.fullName || '').toLowerCase();
      const cellStr = (l.cellOrPcfName || '').toLowerCase();
      return nameStr.includes(cleanLdrQuery) || cellStr.includes(cleanLdrQuery);
    }).slice(0, 5)
    : leaders.slice(0, 5);

  const handleSelectLeader = (ldr: Leader) => {
    setSelectedLeader(ldr.fullName);
    setLeaderSearch(`${ldr.fullName} (${ldr.leaderType} - ${ldr.cellOrPcfName})`);
    setShowLeaderDropdown(false);
    // AUTOMATICALLY FILL AND LOCK THE CHURCH TO THE LEADER'S CHURCH AS REQUESTED
    setChurch(ldr.church);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');

    if (authCode.trim().toUpperCase() !== 'YOM26') {
      const errMsg = 'Invalid Authentication Code! Please enter a valid security code.';
      setAuthError(errMsg);
      toast.showError('Authentication Failed', 'Invalid security code entered.');
      return;
    }

    if (!fullName.trim() || !phone.trim()) {
      toast.showError('Missing Required Fields', 'Please fill in both Full Name and Phone Contact.');
      return;
    }

    const resolvedOccupation = occupation === 'Other'
      ? (otherOccupation.trim() || 'Other')
      : occupation.trim() || 'General';

    const foundationClassNum = parseFoundationClassNumber(foundationClass);

    const newId = `CE-${Math.floor(2000 + Math.random() * 8000)}`;
    const initials = (fullName || 'Member')
      .split(' ')
      .filter(Boolean)
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'MB';

    const created: Member = {
      id: newId,
      fullName: fullName.trim(),
      phone: phone.trim(),
      email: email.trim() || undefined,
      dob: dob || undefined,
      role: 'First Timer',
      occupation: resolvedOccupation,
      education: education.trim() || 'Tertiary',
      location: location.trim() || 'Korle Bu',
      church: church,
      invitedBy: inviteSource === 'leader' ? (selectedLeader || leaderSearch) : 'Self-Walkin',
      joinDate: new Date().toISOString().slice(0, 10),
      initials,
      avatarColor: '#10B981',
      downstreamCount: 0,
      serviceCount: 1, // First service check-in
      foundationClass: foundationClassNum,
      status: 'First Timer',
      gender
    };

    onAddMember(created);
    setRegisteredMember(created);
  };


  const handleDownloadQrPass = (member: Member) => {
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(member.id)}&color=0f172a`;
    const a = document.createElement('a');
    a.href = qrUrl;
    a.download = `CE_Korle_Bu_Pass_${member.id}.png`;
    a.target = '_blank';
    a.click();
  };

  const handleResetForm = () => {
    setRegisteredMember(null);
    setFullName('');
    setPhone('');
    setEmail('');
    setDob('');
    setInviteSource('self');
    setLeaderSearch('');
    setSelectedLeader('');
  };

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto space-y-6 font-body">

      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full mb-1 border border-blue-200">
          <span className="material-symbols-outlined text-[14px]">how_to_reg</span>
          Usher Desk Registration Station
        </div>
        <h1 className="font-display text-2xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
          New Attendee & Member Check-In
        </h1>
        <p className="font-body text-xs md:text-sm text-slate-500 mt-1">
          Register new converts, visitors, and church members. Instant QR Pass will be generated.
        </p>
      </div>

      {/* Success View Screen */}
      {registeredMember ? (
        <div className="bg-white border border-emerald-200 rounded-2xl p-6 md:p-8 shadow-sm space-y-6 text-center animate-in fade-in zoom-in-95 duration-200">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto border border-emerald-200">
            <span className="material-symbols-outlined text-[36px]">check_circle</span>
          </div>

          <div>
            <span className="text-xs font-bold text-emerald-700 uppercase bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Registration & First Check-In Complete
            </span>
            <h2 className="font-headline font-bold text-2xl text-slate-900 mt-2">QR ID Pass Generated!</h2>
            <p className="text-xs text-slate-500 mt-1">
              <strong className="text-slate-900">{registeredMember.fullName}</strong> assigned Member ID{' '}
              <span className="font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">{registeredMember.id}</span>
            </p>
          </div>

          {/* QR Pass Preview */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 inline-block shadow-sm space-y-3">
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(registeredMember.id)}&color=0f172a`}
              alt="Member QR Code"
              className="w-40 h-40 mx-auto rounded-xl border border-slate-200"
            />
            <p className="text-xs text-slate-500 font-bold">
              Scan next service for instant 1-second check-in
            </p>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-left text-xs space-y-2 font-body">
            <div className="flex justify-between py-1 border-b border-slate-200">
              <span className="text-slate-500">Service Checked-In:</span>
              <span className="font-bold text-slate-900">{serviceType}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200">
              <span className="text-slate-500">Phone Contact:</span>
              <span className="font-bold text-slate-900">{registeredMember.phone}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200">
              <span className="text-slate-500">Auto-Assigned Church:</span>
              <span className="font-bold text-slate-900">{registeredMember.church}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500">Invited By:</span>
              <span className="font-bold text-blue-700">{registeredMember.invitedBy}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={() => handleDownloadQrPass(registeredMember)}
              className="flex-1 bg-slate-900 hover:bg-slate-800 text-white py-3 px-4 rounded-xl font-bold text-xs shadow-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">download</span>
              <span>Auto-Download QR Pass</span>
            </button>

            <button
              onClick={() => onSelectMemberForCard(registeredMember)}
              className="flex-1 bg-blue-700 hover:bg-blue-800 text-white py-3 px-4 rounded-xl font-bold text-xs shadow-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">badge</span>
              <span>View Printable Card</span>
            </button>

            <button
              onClick={handleResetForm}
              className="border border-slate-200 text-slate-800 py-3 px-4 rounded-xl font-bold text-xs hover:bg-slate-50 transition-all cursor-pointer"
            >
              Register Next Member
            </button>
          </div>
        </div>
      ) : (
        /* Registration Form */
        <form onSubmit={handleSubmit} className="bg-white border border-slate-200 p-6 md:p-8 rounded-2xl shadow-sm space-y-5">

          {/* Target Service Type */}
          <div className="space-y-1.5">
            <label htmlFor="serviceTypeSelect" className="block text-xs font-bold text-slate-500 ">
              Target Service *
            </label>
            <select
              id="serviceTypeSelect"
              value={serviceType}
              onChange={(e) => setServiceType(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-900 focus:bg-white focus:border-blue-600 outline-none cursor-pointer"
            >
              <option value="Sunday Service">Sunday Service</option>
              <option value="Midweek Service">Midweek Service</option>
              <option value="Special Service">Special Service</option>
            </select>
          </div>

          {/* Full Name & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="fullNameInput" className="block text-xs font-bold text-slate-500 mb-1">
                Full Name *
              </label>
              <input
                id="fullNameInput"
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Samuel Kweku Mensah"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:bg-white focus:border-blue-600 outline-none"
              />
            </div>

            <div>
              <label htmlFor="phoneInput" className="block text-xs font-bold text-slate-500 mb-1">
                Phone Contact *
              </label>
              <input
                id="phoneInput"
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. +233 24 123 4567"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:bg-white focus:border-blue-600 outline-none"
              />
            </div>
          </div>

          {/* Email & Gender */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="emailInput" className="block text-xs font-bold text-slate-500 mb-1">
                Email Address (Optional)
              </label>
              <input
                id="emailInput"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="member@example.com"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:bg-white focus:border-blue-600 outline-none"
              />
            </div>

            <div>
              <label htmlFor="genderSelect" className="block text-xs font-bold text-slate-500 mb-1">
                Gender
              </label>
              <select
                id="genderSelect"
                value={gender}
                onChange={(e) => setGender(e.target.value as 'Male' | 'Female')}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-900 focus:bg-white focus:border-blue-600 outline-none cursor-pointer"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
          </div>

          {/* Date of Birth & Occupation */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="dobInput" className="block text-xs font-bold text-slate-500 mb-1">
                Date of Birth *
              </label>
              <input
                id="dobInput"
                type="date"
                required
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:bg-white focus:border-blue-600 outline-none"
              />
            </div>

            <div>
              <label htmlFor="occupationSelect" className="block text-xs font-bold text-slate-500 mb-1">
                Occupation / Profession *
              </label>
              <select
                id="occupationSelect"
                value={occupation}
                onChange={(e) => setOccupation(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:bg-white focus:border-blue-600 outline-none"
              >
                <option value="Student">Student</option>
                <option value="Software Developer / Engineer">Software Developer / Engineer</option>
                <option value="Nurse / Medical Practitioner">Nurse / Medical Practitioner</option>
                <option value="Teacher / Educator">Teacher / Educator</option>
                <option value="Trader / Business Owner">Trader / Business Owner</option>
                <option value="Banker / Finance">Banker / Finance</option>
                <option value="Accountant">Accountant</option>
                <option value="Civil Servant">Civil Servant</option>
                <option value="Artisan / Craftsman">Artisan / Craftsman</option>
                <option value="Other">Other (Specify below)</option>
              </select>

              {occupation === 'Other' && (
                <div className="mt-2.5 animate-in fade-in slide-in-from-top-2 duration-200">
                  <input
                    type="text"
                    required
                    placeholder="Specify occupation / profession *"
                    value={otherOccupation}
                    onChange={(e) => setOtherOccupation(e.target.value)}
                    className="w-full bg-blue-50/60 border border-blue-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:bg-white focus:border-blue-600 outline-none font-semibold"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Education & Foundation School */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="educationSelect" className="block text-xs font-bold text-slate-500 mb-1">
                Educational Level
              </label>
              <select
                id="educationSelect"
                value={education}
                onChange={(e) => setEducation(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:bg-white focus:border-blue-600 outline-none"
              >
                <option value="Tertiary / University">Tertiary / University Degree</option>
                <option value="High School / SHS">High School / SHS</option>
                <option value="Postgraduate / Masters">Postgraduate / Masters / Doctorate</option>
                <option value="Professional Certificate">Professional Certificate</option>
                <option value="Basic Education / JHS">Basic Education / JHS</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label htmlFor="foundationClassSelect" className="block text-xs font-bold text-slate-500 mb-1">
                Foundation School Class
              </label>
              <select
                id="foundationClassSelect"
                value={foundationClass}
                onChange={(e) => setFoundationClass(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-blue-700 font-semibold focus:bg-white focus:border-blue-600 outline-none"
              >
                <option value="Class 1: The New Creation">Class 1: The New Creation</option>
                <option value="Class 2: The Holy Spirit">Class 2: The Holy Spirit</option>
                <option value="Class 3: Christian Doctrine">Class 3: Christian Doctrine</option>
                <option value="Class 4: Evangelism & Cell Ministry">Class 4: Evangelism & Cell Ministry</option>
                <option value="Class 5: Christian Character & Prosperity">Class 5: Christian Character & Prosperity</option>
                <option value="Class 6: The Local Assembly & Loveworld">Class 6: The Local Assembly & Loveworld</option>
                <option value="Class 7: Introduction to Mobile Technology as a Platform for Advancing the Gospel">Class 7: Introduction to Mobile Technology as a Platform for Advancing the Gospel</option>
                <option value="Graduated">Graduated (All 7 Classes Completed)</option>
                <option value="Not Enrolled Yet">Not Enrolled Yet</option>
              </select>
            </div>
          </div>

          {/* Location & Church */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="locationSelectInput" className="block text-xs font-bold uppercase text-slate-500 mb-1">
                Residential Location
              </label>
              <input
                id="locationSelectInput"
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Korle Bu / Dansoman / Mamprobi"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900"
              />
            </div>

            <div>
              <label htmlFor="churchSelectBox" className="block text-xs font-bold uppercase text-slate-500 mb-1">
                Branch Church {inviteSource === 'leader' && '(Auto-Filled by Leader Selection)'}
              </label>
              <select
                id="churchSelectBox"
                value={church}
                onChange={(e) => setChurch(e.target.value)}
                disabled={inviteSource === 'leader' && !!selectedLeader}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-semibold text-slate-900 disabled:opacity-70 disabled:bg-slate-100"
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

          {/* Invitee Source & Leader Dropdown */}
          <div className="pt-3 border-t border-slate-100 space-y-2">
            <label className="block text-xs font-bold text-slate-500 ">
              Invitation Source
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <label className={`
                flex items-center gap-2.5 p-3 border rounded-xl cursor-pointer transition-all
                ${inviteSource === 'self' ? 'border-blue-600 bg-blue-50/60 text-blue-900 font-bold' : 'border-slate-200 bg-slate-50 hover:bg-slate-100/60 text-slate-700'}
              `}>
                <input
                  type="radio"
                  name="inviteSource"
                  value="self"
                  checked={inviteSource === 'self'}
                  onChange={() => setInviteSource('self')}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-xs">Self-Walkin / First-timer</span>
              </label>

              <label className={`
                flex items-center gap-2.5 p-3 border rounded-xl cursor-pointer transition-all
                ${inviteSource === 'leader' ? 'border-blue-600 bg-blue-50/60 text-blue-900 font-bold' : 'border-slate-200 bg-slate-50 hover:bg-slate-100/60 text-slate-700'}
              `}>
                <input
                  type="radio"
                  name="inviteSource"
                  value="leader"
                  checked={inviteSource === 'leader'}
                  onChange={() => setInviteSource('leader')}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-xs">Invited by PCF / Cell Leader / BSCT</span>
              </label>
            </div>

            {/* Leader Dropdown with Auto Church Fill */}
            {inviteSource === 'leader' && (
              <div className="relative mt-2">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
                  search
                </span>
                <input
                  type="text"
                  value={leaderSearch}
                  onChange={(e) => {
                    setLeaderSearch(e.target.value);
                    setShowLeaderDropdown(true);
                  }}
                  onFocus={() => setShowLeaderDropdown(true)}
                  placeholder="Type leader or cell name (Auto-fills church branch)..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-900 focus:border-blue-600 outline-none font-semibold"
                />

                {showLeaderDropdown && (
                  <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-sm z-20 overflow-hidden max-h-56 overflow-y-auto">
                    {leaderSuggestions.map((ldr) => (
                      <div
                        key={ldr.id}
                        onClick={() => handleSelectLeader(ldr)}
                        className="p-3 hover:bg-slate-50 cursor-pointer flex items-center justify-between border-b border-slate-100 last:border-none"
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-900 font-bold text-xs flex items-center justify-center">
                            {ldr.initials || (ldr.fullName ? ldr.fullName.split(' ').filter(Boolean).map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'LD')}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-900">{ldr.fullName}</p>
                            <p className="text-xs text-blue-700">{ldr.leaderType} • {ldr.cellOrPcfName}</p>
                          </div>
                        </div>
                        <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-semibold">
                          {ldr.church}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Authentication Code Gate */}
          <div className="p-4 bg-slate-900 text-white rounded-2xl space-y-2">
            <div className="flex justify-between items-center">
              <label className="block text-xs font-bold text-blue-500 ">
                Authentication Code Required *
              </label>
              <span className="text-xs text-slate-400">Security Protected</span>
            </div>
            <input
              type="text"
              required
              value={authCode}
              onChange={e => setAuthCode(e.target.value)}
              placeholder="Enter Security Code"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-blue-300 font-bold tracking-widest outline-none focus:border-blue-500"
            />
            {authError && (
              <p className="text-xs text-rose-400 font-semibold">{authError}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full mt-4 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-3.5 px-6 rounded-xl transition-all shadow-sm active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">qr_code_2</span>
            <span>Record Attendance & Auto-Generate QR Pass</span>
          </button>

        </form>
      )}

    </div>
  );
};
