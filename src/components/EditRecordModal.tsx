import React, { useState } from 'react';
import { motion } from 'motion/react';

export interface EditField {
  key: string;
  label: string;
  type?: 'text' | 'email' | 'tel' | 'date' | 'number' | 'select';
  options?: string[];
  required?: boolean;
  disabled?: boolean;
}

interface EditRecordModalProps {
  title: string;
  subtitle?: string;
  icon?: string;
  fields: EditField[];
  values: Record<string, any>;
  onCancel: () => void;
  onSave: (values: Record<string, any>) => void;
}

export const EditRecordModal: React.FC<EditRecordModalProps> = ({
  title,
  subtitle,
  icon = 'edit',
  fields,
  values,
  onCancel,
  onSave
}) => {
  const [form, setForm] = useState<Record<string, any>>(() => {
    const initial: Record<string, any> = {};
    fields.forEach(f => {
      initial[f.key] = values[f.key] ?? '';
    });
    return initial;
  });

  const setField = (key: string, value: any) => setForm(prev => ({ ...prev, [key]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned: Record<string, any> = {};
    fields.forEach(f => {
      const raw = form[f.key];
      cleaned[f.key] = f.type === 'number' ? (parseInt(String(raw), 10) || 0) : (typeof raw === 'string' ? raw.trim() : raw);
    });
    onSave(cleaned);
  };

  return (
    <div className="fixed inset-0 z-[60] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <motion.form
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        onSubmit={handleSubmit}
        className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg shadow-sm max-h-[90vh] flex flex-col"
      >
        <div className="p-5 border-b border-slate-100 flex items-start gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[22px]">{icon}</span>
          </div>
          <div className="flex-1">
            <h3 className="font-display text-lg font-bold text-slate-900">{title}</h3>
            {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 cursor-pointer"
            title="Close"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-3 overflow-y-auto">
          {fields.map(f => (
            <div key={f.key} className={f.type === 'select' || f.key === 'fullName' ? 'sm:col-span-2' : ''}>
              <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
                {f.label}
              </label>
              {f.type === 'select' ? (
                <select
                  value={form[f.key] ?? ''}
                  onChange={e => setField(f.key, e.target.value)}
                  disabled={f.disabled}
                  className="w-full border border-slate-200 bg-slate-50 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 outline-none focus:bg-white focus:border-blue-600 disabled:opacity-60"
                >
                  {(f.options || []).map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              ) : (
                <input
                  type={f.type || 'text'}
                  value={form[f.key] ?? ''}
                  required={f.required}
                  disabled={f.disabled}
                  onChange={e => setField(f.key, e.target.value)}
                  className="w-full border border-slate-200 bg-slate-50 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 outline-none focus:bg-white focus:border-blue-600 disabled:opacity-60"
                />
              )}
            </div>
          ))}
        </div>

        <div className="p-5 border-t border-slate-100 flex items-center gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs py-2.5 rounded-xl cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-2.5 rounded-xl cursor-pointer shadow-sm"
          >
            Save Changes
          </button>
        </div>
      </motion.form>
    </div>
  );
};

interface ConfirmDeleteDialogProps {
  title: string;
  message: string;
  onCancel: () => void;
  onConfirm: () => void;
}

export const ConfirmDeleteDialog: React.FC<ConfirmDeleteDialogProps> = ({
  title,
  message,
  onCancel,
  onConfirm
}) => (
  <div className="fixed inset-0 z-[60] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white border border-slate-200 rounded-2xl p-6 max-w-md w-full shadow-sm space-y-4"
    >
      <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center">
        <span className="material-symbols-outlined text-[26px]">delete_forever</span>
      </div>
      <div>
        <h3 className="font-display text-lg font-bold text-slate-900">{title}</h3>
        <p className="text-xs text-slate-500 mt-1 leading-relaxed">{message}</p>
      </div>
      <div className="flex items-center gap-2 pt-1">
        <button
          onClick={onCancel}
          className="flex-1 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs py-2.5 rounded-xl cursor-pointer"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className="flex-1 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs py-2.5 rounded-xl cursor-pointer shadow-sm"
        >
          Yes, Delete
        </button>
      </div>
    </motion.div>
  </div>
);
