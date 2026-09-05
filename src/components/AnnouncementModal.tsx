import React, { useState } from 'react';
import { motion } from 'motion/react';
import { AuditLogItem } from '../types';
import { useToast } from '../context/ToastContext';

interface AnnouncementModalProps {
  onClose: () => void;
  onAddAuditLog: (log: AuditLogItem) => void;
}

export const AnnouncementModal: React.FC<AnnouncementModalProps> = ({ onClose, onAddAuditLog }) => {
  const toast = useToast();
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [targetAudience, setTargetAudience] = useState('All Members');
  const [isSending, setIsSending] = useState(false);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;

    setIsSending(true);

    setTimeout(() => {
      onAddAuditLog({
        id: `log-${Date.now()}`,
        action: `Broadcast sent: "${title}" to ${targetAudience}`,
        timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC',
        icon: 'campaign',
        user: 'Administrator'
      });

      setIsSending(false);
      toast.showAnnouncement(title, message, targetAudience);
      onClose();
    }, 600);
  };


  const handleGenerateAIAnnouncement = () => {
    setTitle('Upcoming Midweek Healing & Prayer Service');
    setMessage('Dear Brethren, join us this Wednesday at 6:30 PM for a powerful session of prayer, divine healing, and the Word. Bring your family and friends!');
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
        className="bg-white/90 backdrop-blur-2xl rounded-2xl max-w-md w-full border border-white/60 shadow-sm overflow-hidden"
      >

        <div className="bg-blue-700 text-white p-5 flex justify-between items-center border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-500 icon-fill text-[20px]">campaign</span>
            <span className="font-headline font-bold text-sm tracking-wide">Group Broadcast Message</span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors">
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        <form onSubmit={handleSend} className="p-6 space-y-4">

          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
              Broadcast Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Special Sunday Service Time Notice"
              className="w-full bg-slate-50/80 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 outline-none focus:bg-white focus:border-blue-600 font-semibold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
              Target Audience
            </label>
            <select
              value={targetAudience}
              onChange={e => setTargetAudience(e.target.value)}
              className="w-full bg-slate-50/80 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 outline-none focus:bg-white focus:border-blue-600 font-semibold"
            >
              <option value="All Members">All Members & Leaders (Group Consolidated)</option>
              <option value="Group Leaders Only">Group Leaders & Deacons Only</option>
              <option value="GCYC Main">GCYC Main Only</option>
              <option value="Ushering Team">Ushering Team</option>
            </select>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-bold uppercase text-slate-500">
                Message Body *
              </label>
              <button
                type="button"
                onClick={handleGenerateAIAnnouncement}
                className="text-xs text-blue-600 font-bold hover:underline cursor-pointer flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[14px]">auto_awesome</span>
                <span>Auto-draft template</span>
              </button>
            </div>
            <textarea
              required
              rows={4}
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="Type your announcement content here..."
              className="w-full bg-slate-50/80 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 outline-none focus:bg-white focus:border-blue-600"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 rounded-xl text-xs text-slate-600 font-semibold hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSending}
              className="px-5 py-2.5 bg-slate-950 text-white rounded-xl text-xs font-bold hover:bg-slate-800 flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-sm"
            >
              <span className="material-symbols-outlined text-[16px]">send</span>
              <span>{isSending ? 'Sending...' : 'Dispatch Broadcast'}</span>
            </button>
          </div>

        </form>

      </motion.div>
    </motion.div>
  );
};

