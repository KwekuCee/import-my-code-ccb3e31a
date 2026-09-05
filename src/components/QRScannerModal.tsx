import React, { useState, useEffect, useRef } from 'react';
import { Member, AttendanceRecord, ViewType } from '../types';
import { useToast } from '../context/ToastContext';

interface QRScannerModalProps {
  members: Member[];
  attendance?: AttendanceRecord[];
  serviceTypes?: Array<{ id: string; name: string; active: boolean }>;
  user?: {
    name: string;
    role: 'Superadmin' | 'Church Admin';
    church: string;
  };
  onConfirmAttendance: (record: AttendanceRecord) => void;
  onClose: () => void;
  onNavigate: (view: ViewType) => void;
}

export const QRScannerModal: React.FC<QRScannerModalProps> = ({
  members,
  attendance = [],
  serviceTypes = [],
  user,
  onConfirmAttendance,
  onClose,
  onNavigate
}) => {
  const toast = useToast();
  const [scannerState, setScannerState] = useState<'scanning' | 'success' | 'duplicate' | 'error'>('scanning');
  const [lookupQuery, setLookupQuery] = useState('');
  const isChurchAdmin = user?.role === 'Church Admin';
  const scopedMembers = (members || []).filter(m =>
    m && (!isChurchAdmin || (m.church || '').toLowerCase() === (user?.church || '').toLowerCase())
  );

  const activeServiceNames = (serviceTypes || []).filter(s => s.active).map(s => s.name);
  const serviceOptions = activeServiceNames.length > 0 ? activeServiceNames : ['Sunday Service'];

  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [serviceType, setServiceType] = useState(serviceOptions[0]);
  const [flashlightOn, setFlashlightOn] = useState(false);
  const [useRealCamera, setUseRealCamera] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!serviceOptions.includes(serviceType)) {
      setServiceType(serviceOptions[0]);
    }
  }, [serviceOptions.join('|')]);

  const bgImageUrl = 'https://lh3.googleusercontent.com/aida-public/AB6AXuAiyCmtx-XHebXJST5E1hExdoWCfkgB34IaY-mKBw36293DZ6MIwhbnexnGkUqdlqAaNKZudX4bT2zO3x95HvA-lTaU15gsuAMZV2jZZsFMFrfQui0ziSX_Xq-qFRxnT-29EqDgNZ-a99tcqQH2nGsrH--n68U7Ndv-C3YH7gI22HeUbpQeFNlmO6MqYpPNO377VPx8sE_d-iyvVmQqOkQ4R_Yh8tljgZHrf6dVgucORLA2AJzEiJby7c5Jl8SG4n76cJ_XEGpCt7o';

  // Toggle webcam if user clicks camera mode
  useEffect(() => {
    if (useRealCamera) {
      navigator.mediaDevices?.getUserMedia({ video: { facingMode: 'environment' } })
        .then((stream) => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        })
        .catch((err) => {
          console.warn('Camera access error or rejected:', err);
          setUseRealCamera(false);
        });
    } else {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    }
  }, [useRealCamera]);

  const today = new Date().toISOString().slice(0, 10);

  const alreadyRecorded = (member: Member, service: string) =>
    (attendance || []).some(a =>
      a && a.memberId === member.id && a.serviceType === service && (a.date || '').slice(0, 10) === today
    );

  const recordAttendance = (member: Member, service: string) => {
    const record: AttendanceRecord = {
      id: `att-${Date.now()}`,
      memberId: member.id,
      memberName: member.fullName,
      memberRole: member.role,
      serviceType: service,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: new Date().toISOString().slice(0, 10),
      verifiedBy: user?.name ? `${user.name} (QR Scanner)` : 'QR Scanner Station 1',
      status: 'Confirmed',
      church: member.church || 'GCYC Main',
      checkInMethod: 'QR Scan',
      leaderName: member.invitedBy,
    };
    onConfirmAttendance(record);
    toast.showCheckIn(member.fullName, service);
  };

  const handleSimulateScan = (memberId: string) => {
    const found = scopedMembers.find(m => m.id === memberId) || members.find(m => m.id === memberId);
    if (found) {
      setSelectedMember(found);
      if (isChurchAdmin && (found.church || '').toLowerCase() !== (user?.church || '').toLowerCase()) {
        setScannerState('error');
        toast.showError('Wrong church', `${found.fullName} belongs to ${found.church}.`);
        return;
      }
      if (alreadyRecorded(found, serviceType)) {
        setScannerState('duplicate');
        return;
      }
      setScannerState('success');
      // Attendance is logged the instant a valid pass is scanned
      recordAttendance(found, serviceType);
    } else {
      setScannerState('error');
      toast.showError('Invalid QR Code', `Member ID ${memberId} was not found in directory.`);
    }
  };

  const handleScanNext = () => {
    setScannerState('scanning');
  };



  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col font-body select-none overflow-hidden">

      {/* Viewfinder Background */}
      <div className="absolute inset-0 w-full h-full object-cover">
        {useRealCamera ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
        ) : (
          <div
            className="w-full h-full bg-cover bg-center opacity-40"
            style={{ backgroundImage: `url(${bgImageUrl})` }}
          />
        )}
      </div>

      {/* Darkened Overlay Grid with Scanner Corner Guides */}
      <div className="absolute inset-0 flex flex-col z-10 pointer-events-none">
        <div className="flex-1 bg-slate-950/70 backdrop-blur-xs" />

        <div className="flex h-64 md:h-80">
          <div className="flex-1 bg-slate-950/70 backdrop-blur-xs" />

          {/* Target Scanning Box */}
          <div className="w-64 md:w-80 relative flex items-center justify-center">
            {/* Corner Guides */}
            <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-amber-400 rounded-tl-xl shadow-lg" />
            <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-amber-400 rounded-tr-xl shadow-lg" />
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-amber-400 rounded-bl-xl shadow-lg" />
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-amber-400 rounded-br-xl shadow-lg" />

            {/* Scan Line Laser */}
            <div className="absolute left-0 w-full h-[3px] bg-gradient-to-r from-amber-500 via-amber-300 to-amber-500 shadow-[0_0_15px_#f59e0b] animate-scanline z-20" />
          </div>

          <div className="flex-1 bg-slate-950/70 backdrop-blur-xs" />
        </div>

        <div className="flex-1 bg-slate-950/70 backdrop-blur-xs flex flex-col items-center pt-6">
          <span className="text-xs font-bold text-amber-300 bg-slate-900/90 px-4 py-1.5 rounded-full border border-amber-500/30 shadow-lg">
            Position QR Code Pass Inside Frame
          </span>

          {/* Service picker + manual lookup */}
          <div className="mt-4 pointer-events-auto w-full px-4 max-w-md space-y-2">
            <select
              value={serviceType}
              onChange={(e) => setServiceType(e.target.value)}
              className="w-full bg-slate-900/80 border border-slate-700 text-white text-xs font-semibold rounded-xl px-3 py-2 outline-none"
            >
              {serviceOptions.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>

            <input
              type="text"
              value={lookupQuery}
              onChange={(e) => setLookupQuery(e.target.value)}
              placeholder="Or find a member by name or ID"
              className="w-full bg-slate-900/80 border border-slate-700 text-white text-xs rounded-xl px-3 py-2 outline-none placeholder:text-slate-400"
            />

            {lookupQuery.trim() && (
              <div className="max-h-40 overflow-y-auto bg-slate-900/90 border border-slate-700 rounded-xl divide-y divide-slate-800">
                {scopedMembers
                  .filter(m =>
                    (m.fullName || '').toLowerCase().includes(lookupQuery.trim().toLowerCase()) ||
                    (m.id || '').toLowerCase().includes(lookupQuery.trim().toLowerCase())
                  )
                  .slice(0, 12)
                  .map(m => (
                    <button
                      key={m.id}
                      onClick={() => { setLookupQuery(''); handleSimulateScan(m.id); }}
                      className="w-full text-left px-3 py-2 text-xs text-white hover:bg-slate-800"
                    >
                      {m.fullName} <span className="text-slate-400">• {m.id} • {m.church}</span>
                    </button>
                  ))}
                {scopedMembers.filter(m =>
                  (m.fullName || '').toLowerCase().includes(lookupQuery.trim().toLowerCase()) ||
                  (m.id || '').toLowerCase().includes(lookupQuery.trim().toLowerCase())
                ).length === 0 && (
                  <p className="px-3 py-3 text-xs text-slate-400">No member found.</p>
                )}
              </div>
            )}

            <button
              onClick={() => setUseRealCamera(!useRealCamera)}
              className="w-full text-xs font-bold bg-white/10 hover:bg-white/20 text-white px-3 py-2 rounded-xl border border-white/10"
            >
              {useRealCamera ? 'Turn camera off' : 'Turn camera on'}
            </button>
          </div>
        </div>
      </div>

      {/* Top Overlay Bar */}
      <header className="absolute top-0 left-0 w-full z-30 px-4 pt-6 pb-4 flex justify-between items-center bg-gradient-to-b from-slate-950/90 to-transparent">
        <button
          onClick={onClose}
          aria-label="Close Scanner"
          className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-900/80 backdrop-blur-md border border-slate-700 text-white active:scale-95 transition-transform cursor-pointer"
        >
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>

        <div className="flex items-center gap-2 bg-slate-900/80 px-3 py-1 rounded-full border border-slate-700">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-xs font-bold text-slate-200 ">
            Usher Station 1
          </span>
        </div>

        <button
          onClick={() => setFlashlightOn(!flashlightOn)}
          aria-label="Toggle Flashlight"
          className={`w-10 h-10 flex items-center justify-center rounded-full backdrop-blur-md border text-white active:scale-95 transition-transform cursor-pointer ${flashlightOn ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-lg shadow-amber-400/20' : 'bg-slate-900/80 border-slate-700'
            }`}
        >
          <span className="material-symbols-outlined text-[20px]">
            {flashlightOn ? 'flashlight_off' : 'flashlight_on'}
          </span>
        </button>
      </header>

      {/* Bottom Action Sheet Overlay */}
      <div className="absolute bottom-0 w-full z-30 flex flex-col justify-end pointer-events-none">

        {/* Success Overlay */}
        {scannerState === 'success' && selectedMember && (
          <div className="bg-white rounded-t-3xl w-full shadow-sm transition-transform duration-300 pointer-events-auto border-t border-slate-200 max-w-lg mx-auto animate-in slide-in-from-bottom duration-200">

            <div className="w-full flex justify-center py-3">
              <div className="w-12 h-1.5 rounded-full bg-slate-200" />
            </div>

            <div className="px-6 pb-8 pt-1 flex flex-col gap-4">

              {/* Status Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-emerald-600 icon-fill text-[24px]">
                    check_circle
                  </span>
                  <span className="font-headline font-bold text-sm text-emerald-800">
                    Attendance Recorded
                  </span>
                </div>
                <span className="text-xs bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full font-bold border border-emerald-200">
                  LOGGED
                </span>
              </div>


              {/* Member Card */}
              <div className="flex items-center gap-3.5 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-950 flex items-center justify-center font-display text-lg font-extrabold shrink-0 shadow-sm">
                  {selectedMember.initials || selectedMember.fullName?.split(' ').filter(Boolean).map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'MB'}
                </div>
                <div className="flex-1">
                  <h2 className="font-headline text-lg text-slate-900 font-bold leading-tight">
                    {selectedMember.fullName}
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    ID: {selectedMember.id} • {selectedMember.role} • {selectedMember.church}
                  </p>
                </div>
              </div>

              {/* Service Type Selector (applies to next scan) */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="modalServiceType" className="text-xs font-bold text-slate-500 ">
                  Target Service — logged as {serviceType}
                </label>
                <select
                  id="modalServiceType"
                  value={serviceType}
                  onChange={(e) => setServiceType(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-body text-xs font-semibold text-slate-900 outline-none focus:border-blue-600 cursor-pointer"
                >
                  {serviceOptions.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              {/* Action Button */}
              <button
                onClick={handleScanNext}
                className="w-full mt-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-3.5 rounded-xl flex items-center justify-center gap-2 shadow-lg active:scale-98 transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">qr_code_scanner</span>
                <span>Scan Next Member</span>
              </button>


            </div>
          </div>
        )}

        {/* Already recorded Overlay */}
        {scannerState === 'duplicate' && selectedMember && (
          <div className="bg-white rounded-t-3xl w-full shadow-sm pointer-events-auto border-t border-slate-200 max-w-lg mx-auto animate-in slide-in-from-bottom duration-200">
            <div className="w-full flex justify-center py-3">
              <div className="w-12 h-1.5 rounded-full bg-slate-200" />
            </div>
            <div className="px-6 pb-8 pt-1 flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-amber-600 icon-fill text-[24px]">info</span>
                <span className="font-headline font-bold text-sm text-amber-800">Already recorded today</span>
              </div>
              <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200 text-xs text-slate-700">
                <p className="font-bold text-slate-900 mb-1">{selectedMember.fullName}</p>
                <p>{selectedMember.fullName} is already marked present for {serviceType} today, so nothing was added.</p>
              </div>
              <button
                onClick={handleScanNext}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-3.5 rounded-xl cursor-pointer"
              >
                Scan next member
              </button>
            </div>
          </div>
        )}

        {/* Error Overlay */}
        {scannerState === 'error' && (
          <div className="bg-white rounded-t-3xl w-full shadow-sm transition-transform duration-300 pointer-events-auto border-t border-slate-200 max-w-lg mx-auto animate-in slide-in-from-bottom duration-200">

            <div className="w-full flex justify-center py-3">
              <div className="w-12 h-1.5 rounded-full bg-slate-200" />
            </div>

            <div className="px-6 pb-8 pt-1 flex flex-col gap-4">

              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-rose-600 icon-fill text-[24px]">
                  error
                </span>
                <span className="font-headline font-bold text-sm text-rose-700">
                  Scan Failed
                </span>
              </div>

              <div className="bg-rose-50 p-4 rounded-2xl border border-rose-200">
                <h2 className="font-headline text-base font-bold text-slate-900 mb-1">
                  Unrecognized QR Code
                </h2>
                <p className="font-body text-xs text-slate-600">
                  The scanned code is not present in the GCYC active directory. Register as a new member or use manual lookup.
                </p>
              </div>

              <button
                onClick={() => {
                  onClose();
                  onNavigate('register');
                }}
                className="w-full bg-slate-900 text-white font-bold text-xs py-3.5 rounded-xl flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">person_add</span>
                <span>Register Member Manually</span>
              </button>

              <button
                onClick={() => setScannerState('scanning')}
                className="w-full text-slate-600 font-bold text-xs py-2 rounded-xl flex items-center justify-center hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Retry Scanner
              </button>

            </div>
          </div>
        )}

      </div>

    </div>
  );
};
