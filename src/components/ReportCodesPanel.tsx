import React, { useEffect, useState } from 'react';
import { listReportCodes, rotateReportCode, ReportCodeRow } from '../lib/cellReports';

interface Props {
  isSuperadmin: boolean;
  churchNames: string[];
  ownChurch?: string;
}

/** Access codes leaders need before they can submit a weekly cell report. */
export const ReportCodesPanel: React.FC<Props> = ({ isSuperadmin, churchNames, ownChurch }) => {
  const [codes, setCodes] = useState<ReportCodeRow[]>([]);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState('');

  const load = async () => {
    const { codes, error } = await listReportCodes();
    if (error) setMessage(error);
    setCodes(codes);
  };
  useEffect(() => { load(); }, []);

  const names = isSuperadmin ? churchNames : [ownChurch || ''].filter(Boolean);

  const rotate = async (name: string) => {
    setBusy(name);
    const { data, error } = await rotateReportCode(name);
    setBusy('');
    if (error) { setMessage(error); return; }
    setMessage(`New code for ${data?.churchName}: ${data?.code}. The previous code no longer works.`);
    load();
  };

  const codeFor = (name: string) => codes.find((c) => c.churchName.toLowerCase() === name.toLowerCase());
  const link = `${window.location.origin}/cell-report`;

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
      <div>
        <h3 className="font-headline font-bold text-base text-slate-900">Cell Report Access Codes</h3>
        <p className="text-xs text-slate-500 mt-1">
          Leaders enter this code before submitting their weekly cell report. Share it with your leaders along with the link:{' '}
          <span className="font-mono text-blue-700">{link}</span>
        </p>
      </div>
      {message && <p className="text-xs font-semibold text-blue-800 bg-blue-50 rounded-lg p-3">{message}</p>}
      {names.length === 0 && <p className="text-xs text-slate-500">No branch is linked to this account yet.</p>}
      <div className="divide-y divide-slate-100">
        {names.map((name) => {
          const row = codeFor(name);
          return (
            <div key={name} className="flex flex-wrap items-center justify-between gap-3 py-3">
              <div>
                <p className="text-sm font-bold text-slate-800">{name}</p>
                <p className="text-xs text-slate-500">
                  {row ? <>Code: <span className="font-mono font-bold text-slate-900 tracking-widest">{row.code}</span></> : 'No code yet'}
                </p>
              </div>
              <div className="flex gap-2">
                {row && (
                  <button
                    onClick={() => { navigator.clipboard?.writeText(row.code); setMessage(`Copied the code for ${name}.`); }}
                    className="px-3 py-2 rounded-xl text-xs font-bold border border-slate-200 text-slate-700 hover:bg-slate-50"
                  >Copy</button>
                )}
                <button
                  disabled={busy === name}
                  onClick={() => rotate(name)}
                  className="px-3 py-2 rounded-xl text-xs font-bold bg-blue-700 text-white hover:bg-blue-800 disabled:opacity-50"
                >{busy === name ? 'Working…' : row ? 'Generate new code' : 'Generate code'}</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
