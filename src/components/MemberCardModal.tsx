import React from 'react';
import { motion } from 'motion/react';
import { Member } from '../types';
import { getFoundationClassLabel } from '../data/constants';

interface MemberCardModalProps {
  member: Member;
  onClose: () => void;
}

export const MemberCardModal: React.FC<MemberCardModalProps> = ({ member, onClose }) => {
  if (!member) return null;

  const memberInitials = member.initials || (member.fullName ? member.fullName.split(' ').filter(Boolean).map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'MB');
  const qrPlaceholderUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(member.id || 'GCYC')}&color=0f172a`;

  const handlePrint = () => {
    window.print();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 bg-slate-950/70 backdrop-blur-md z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ type: "spring", damping: 25, stiffness: 350 }}
        className="bg-white/90 backdrop-blur-2xl rounded-2xl max-w-sm w-full border border-white/60 shadow-sm overflow-hidden"
      >

        {/* Header Badge */}
        <div className="bg-blue-700 text-white p-4 px-5 flex justify-between items-center border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-500 text-[20px]">badge</span>
            <span className="font-headline font-bold text-xs tracking-wider uppercase text-slate-100">GCYC Member ID</span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer">
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Card Body */}
        <div className="p-6 text-center space-y-4">

          {/* Avatar & Role Badge */}
          <div className="relative inline-block">
            <div className="w-20 h-20 rounded-2xl bg-blue-700 text-slate-950 font-display font-extrabold text-2xl flex items-center justify-center mx-auto border-4 border-white shadow-lg">
              {memberInitials}
            </div>
            <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-slate-950 text-blue-300 text-[9px] font-bold px-2.5 py-0.5 rounded-full border border-blue-500/30 whitespace-nowrap shadow-xs">
              {member.role || 'Member'}
            </span>
          </div>

          <div className="pt-1">
            <h2 className="font-headline font-extrabold text-lg text-slate-900">{member.fullName}</h2>
            <div className="inline-flex items-center gap-1.5 mt-1 bg-blue-50/80 backdrop-blur-xs text-blue-700 px-2.5 py-0.5 rounded-md text-xs font-bold border border-blue-100">
              <span>ID: {member.id}</span>
            </div>
            <p className="text-xs font-medium text-slate-500 mt-1">{member.church}</p>
          </div>

          {/* QR Code Graphic */}
          <div className="bg-white/80 backdrop-blur-md p-4 rounded-2xl border border-slate-200 inline-block shadow-sm">
            <img
              src={qrPlaceholderUrl}
              alt={`QR Code for ${member.id}`}
              className="w-36 h-36 mx-auto object-contain rounded-lg"
            />
            <p className="text-xs text-slate-400 font-semibold mt-2">Scan for Sunday Check-In</p>
          </div>

          {/* Metadata Grid */}
          <div className="text-left bg-white/70 backdrop-blur-md p-3.5 rounded-xl text-xs space-y-1.5 font-body border border-slate-200/60 text-slate-800">
            <div className="flex justify-between">
              <span className="text-slate-400 text-xs">PHONE</span>
              <span className="font-bold">{member.phone}</span>
            </div>
            {member.email && (
              <div className="flex justify-between">
                <span className="text-slate-400 text-xs">EMAIL</span>
                <span className="font-semibold text-slate-700 truncate max-w-[180px]">{member.email}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-slate-400 text-xs">LOCATION</span>
              <span className="font-semibold">{member.location}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400 text-xs">FOUNDATION SCHOOL</span>
              <span className="font-bold text-blue-700 text-xs text-right max-w-[200px]">
                {getFoundationClassLabel(member.foundationClass)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 text-xs">OCCUPATION</span>
              <span className="font-semibold">{member.occupation}</span>
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50/80 backdrop-blur-md border-t border-slate-100 flex gap-2">
          <button
            onClick={handlePrint}
            className="flex-1 bg-slate-950 text-white py-2.5 px-4 rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
          >
            <span className="material-symbols-outlined text-[16px]">print</span>
            <span>Print Pass</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2.5 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-100 cursor-pointer"
          >
            Close
          </button>
        </div>

      </motion.div>
    </motion.div>
  );
};

