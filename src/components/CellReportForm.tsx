import React, { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { Leader } from '../types';
import {
  GRID_ROWS,
  EVANGELISM_FIELDS,
  verifyReportCode,
  submitCellReport,
  type CellReportSubmission,
} from '../lib/cellReports';

interface CellReportFormProps {
  /** Branch names registered on the platform. */
  churchOptions: string[];
  leaders: Leader[];
}

type GridState = Record<string, { cell: string; outreach: string }>;

interface SoulRow { name: string; contact: string }
interface AttendanceRow { name: string; contact: string; firstTimer: boolean; soulWon: boolean }
interface RegisterRow { present: string; contact: string; absentee: string; absenteeContact: string }

const emptyGrid = (): GridState =>
  GRID_ROWS.reduce((acc, row) => {
    acc[row.key] = { cell: '', outreach: '' };
    return acc;
  }, {} as GridState);

const emptyEvangelism = (): Record<string, string> =>
  EVANGELISM_FIELDS.reduce((acc, f) => {
    acc[f.key] = '';
    return acc;
  }, {} as Record<string, string>);

const makeSouls = (n: number): SoulRow[] => Array.from({ length: n }, () => ({ name: '', contact: '' }));
const makeAttendance = (n: number): AttendanceRow[] =>
  Array.from({ length: n }, () => ({ name: '', contact: '', firstTimer: false, soulWon: false }));
const makeRegister = (n: number): RegisterRow[] =>
  Array.from({ length: n }, () => ({ present: '', contact: '', absentee: '', absenteeContact: '' }));

const inputClass =
  'w-full bg-white border border-slate-200 rounded-lg px-2.5 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 transition';

const labelClass = 'block text-xs font-bold text-slate-600 mb-1.5';

/**
 * Public weekly cell report sheet.
 * A leader picks their branch, enters the access code their church administrator
 * gave them, then fills in the same sheet they use on paper.
 */
export const CellReportForm: React.FC<CellReportFormProps> = ({ churchOptions, leaders }) => {
  // --- gate ---
  const [church, setChurch] = useState('');
  const [code, setCode] = useState('');
  const [gateError, setGateError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [unlocked, setUnlocked] = useState(false);

  // --- form ---
  const [leaderName, setLeaderName] = useState('');
  const [cellName, setCellName] = useState('');
  const [outreachCentre, setOutreachCentre] = useState('');
  const [reportDate, setReportDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [grid, setGrid] = useState<GridState>(emptyGrid);
  const [evangelism, setEvangelism] = useState<Record<string, string>>(emptyEvangelism);
  const [soulsWon, setSoulsWon] = useState<SoulRow[]>(() => makeSouls(5));
  const [cellAttendance, setCellAttendance] = useState<AttendanceRow[]>(() => makeAttendance(15));
  const [sundayRegister, setSundayRegister] = useState<RegisterRow[]>(() => makeRegister(20));

  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const churchLeaders = useMemo(
    () =>
      leaders
        .filter((l) => (l.church || '').trim().toLowerCase() === church.trim().toLowerCase())
        .sort((a, b) => a.fullName.localeCompare(b.fullName)),
    [leaders, church],
  );

  const handleVerify = async () => {
    if (isVerifying) return;
    setGateError('');
    if (!church) return setGateError('Please choose your church branch.');
    if (!code.trim()) return setGateError('Please enter the access code from your church administrator.');

    setIsVerifying(true);
    const { data, error } = await verifyReportCode(church, code.trim().toUpperCase());
    setIsVerifying(false);
    if (error || !data?.ok) {
      setGateError(error || 'That access code is not correct for this church.');
      return;
    }
    setUnlocked(true);
  };

  const setGridValue = (key: string, column: 'cell' | 'outreach', value: string) =>
    setGrid((prev) => ({ ...prev, [key]: { ...prev[key], [column]: value } }));

  const resetForm = () => {
    setLeaderName('');
    setCellName('');
    setOutreachCentre('');
    setReportDate(new Date().toISOString().slice(0, 10));
    setGrid(emptyGrid());
    setEvangelism(emptyEvangelism());
    setSoulsWon(makeSouls(5));
    setCellAttendance(makeAttendance(15));
    setSundayRegister(makeRegister(20));
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    setSubmitError('');
    if (!leaderName.trim()) {
      setSubmitError('Please select the name of the leader submitting this report.');
      return;
    }

    const payload: CellReportSubmission = {
      leaderName: leaderName.trim(),
      cellName: cellName.trim(),
      outreachCentre: outreachCentre.trim(),
      reportDate,
      reportGrid: grid,
      evangelism,
      soulsWonList: soulsWon.filter((r) => r.name.trim() || r.contact.trim()),
      cellAttendance: cellAttendance.filter((r) => r.name.trim() || r.contact.trim()),
      sundayRegister: sundayRegister.filter(
        (r) => r.present.trim() || r.contact.trim() || r.absentee.trim() || r.absenteeContact.trim(),
      ),
    };

    setIsSubmitting(true);
    const { data, error } = await submitCellReport(church, code.trim().toUpperCase(), payload);
    setIsSubmitting(false);
    if (error || !data?.ok) {
      setSubmitError(error || 'The report could not be saved. Please try again.');
      return;
    }
    setSubmitted(true);
  };

  // ---------------------------------------------------------------- gate view
  if (!unlocked) {
    return (
      <div className="max-w-xl mx-auto bg-white border border-slate-200/90 rounded-2xl p-6 md:p-8 shadow-sm space-y-6">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="p-2.5 rounded-2xl bg-blue-50 text-blue-700 border border-blue-200">
            <span className="material-symbols-outlined text-[24px]">assignment</span>
          </div>
          <div>
            <h3 className="font-display text-lg font-bold text-slate-900">Submit Weekly Cell Report</h3>
            <p className="text-xs text-slate-500">
              Choose your branch and enter the access code your church administrator gave you.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className={labelClass}>Church Branch</label>
            <select value={church} onChange={(e) => setChurch(e.target.value)} className={inputClass}>
              <option value="">Select your church branch…</option>
              {churchOptions.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClass}>Access Code</label>
            <input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
              placeholder="e.g. K7M2QP"
              className={`${inputClass} font-mono tracking-[0.25em] uppercase text-center text-sm`}
            />
            <p className="text-xs text-slate-400 mt-1.5">
              Don't have a code? Ask your church administrator — they generate it in their dashboard settings.
            </p>
          </div>

          {gateError && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl px-3.5 py-2.5 flex items-start gap-2">
              <span className="material-symbols-outlined text-[16px] mt-0.5">error</span>
              <span>{gateError}</span>
            </div>
          )}

          <button
            onClick={handleVerify}
            disabled={isVerifying}
            className="w-full bg-blue-700 hover:bg-blue-800 disabled:opacity-60 text-white font-bold text-sm py-3 rounded-xl transition-all shadow-sm shadow-blue-700/20 active:scale-98 cursor-pointer flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">lock_open</span>
            {isVerifying ? 'Checking code…' : 'Open the report form'}
          </button>
        </div>
      </div>
    );
  }

  // ------------------------------------------------------------ success view
  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-xl mx-auto bg-white border border-blue-200 rounded-2xl p-8 shadow-sm text-center space-y-5"
      >
        <div className="w-16 h-16 bg-blue-700 text-white rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-blue-700/20">
          <span className="material-symbols-outlined text-[36px]">assignment_turned_in</span>
        </div>
        <div>
          <h3 className="font-display text-lg font-bold text-slate-900">Report submitted</h3>
          <p className="text-xs text-slate-500 mt-1.5">
            Thank you, {leaderName}. Your {church} administrator and the group pastor can now see this week's
            report in their dashboard.
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setSubmitted(false);
          }}
          className="w-full bg-blue-700 hover:bg-blue-800 text-white font-bold text-sm py-3 rounded-xl transition-all shadow-sm shadow-blue-700/20 active:scale-98 cursor-pointer"
        >
          Submit another report
        </button>
      </motion.div>
    );
  }

  // --------------------------------------------------------------- form view
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 md:p-6 shadow-sm space-y-5">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="p-2.5 rounded-2xl bg-blue-50 text-blue-700 border border-blue-200">
            <span className="material-symbols-outlined text-[24px]">assignment</span>
          </div>
          <div className="min-w-0">
            <h3 className="font-display text-lg font-bold text-slate-900">Weekly Cell Report</h3>
            <p className="text-xs text-slate-500 truncate">{church} • fill in every section that applies</p>
          </div>
          <span className="ml-auto hidden sm:inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-1 text-xs font-bold text-emerald-700">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Code verified
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Church</label>
            <input value={church} readOnly className={`${inputClass} bg-slate-50 text-slate-500`} />
          </div>
          <div>
            <label className={labelClass}>Name of Leader</label>
            <select value={leaderName} onChange={(e) => setLeaderName(e.target.value)} className={inputClass}>
              <option value="">Select your name…</option>
              {churchLeaders.map((l) => (
                <option key={l.id} value={l.fullName}>
                  {l.fullName} — {l.leaderType}
                </option>
              ))}
            </select>
            {churchLeaders.length === 0 && (
              <p className="text-xs text-amber-600 mt-1.5">
                No leaders are registered at {church} yet. Register as a leader first, then submit this report.
              </p>
            )}
          </div>
          <div>
            <label className={labelClass}>Cell Name</label>
            <input
              value={cellName}
              onChange={(e) => setCellName(e.target.value)}
              placeholder="Name of your cell"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Outreach Centre</label>
            <input
              value={outreachCentre}
              onChange={(e) => setOutreachCentre(e.target.value)}
              placeholder="Name of the outreach centre"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Week / Report Date</label>
            <input
              type="date"
              value={reportDate}
              onChange={(e) => setReportDate(e.target.value)}
              className={inputClass}
            />
          </div>
        </div>
      </div>

      {/* Report grid */}
      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50/70">
          <h4 className="font-display text-sm font-bold text-slate-900">Report</h4>
          <p className="text-xs text-slate-500">Fill in the cell meeting column and the outreach centre column.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-xs">
            <thead>
              <tr className="bg-white border-b border-slate-100">
                <th className="text-left font-bold text-slate-500 px-4 py-2.5 w-[38%]">Item</th>
                <th className="text-left font-bold text-slate-500 px-4 py-2.5">Cell Meeting</th>
                <th className="text-left font-bold text-slate-500 px-4 py-2.5">Outreach Centre</th>
              </tr>
            </thead>
            <tbody>
              {GRID_ROWS.map((row) => (
                <tr key={row.key} className="border-b border-slate-50 last:border-0">
                  <td className="px-4 py-2 font-semibold text-slate-700">{row.label}</td>
                  <td className="px-2 py-1.5">
                    <input
                      type={row.type === 'number' ? 'number' : 'text'}
                      value={grid[row.key]?.cell ?? ''}
                      onChange={(e) => setGridValue(row.key, 'cell', e.target.value)}
                      className={inputClass}
                    />
                  </td>
                  <td className="px-2 py-1.5">
                    <input
                      type={row.type === 'number' ? 'number' : 'text'}
                      value={grid[row.key]?.outreach ?? ''}
                      onChange={(e) => setGridValue(row.key, 'outreach', e.target.value)}
                      className={inputClass}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Evangelism */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm space-y-4">
        <div>
          <h4 className="font-display text-sm font-bold text-slate-900">Evangelism & Soulwinning</h4>
          <p className="text-xs text-slate-500">This week's outreach activity.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {EVANGELISM_FIELDS.map((f) => (
            <div key={f.key}>
              <label className={labelClass}>{f.label}</label>
              <input
                type={f.type === 'number' ? 'number' : 'text'}
                value={evangelism[f.key] ?? ''}
                onChange={(e) => setEvangelism((prev) => ({ ...prev, [f.key]: e.target.value }))}
                className={inputClass}
              />
            </div>
          ))}
        </div>

        <div className="pt-2 space-y-2">
          <p className="text-xs font-bold text-slate-600">Names & contacts of those led to Christ</p>
          {soulsWon.map((row, i) => (
            <div key={i} className="flex gap-2 items-center">
              <input
                value={row.name}
                onChange={(e) =>
                  setSoulsWon((prev) => prev.map((r, idx) => (idx === i ? { ...r, name: e.target.value } : r)))
                }
                placeholder="Full name"
                className={inputClass}
              />
              <input
                value={row.contact}
                onChange={(e) =>
                  setSoulsWon((prev) => prev.map((r, idx) => (idx === i ? { ...r, contact: e.target.value } : r)))
                }
                placeholder="Contact"
                className={inputClass}
              />
              <button
                onClick={() => setSoulsWon((prev) => prev.filter((_, idx) => idx !== i))}
                className="shrink-0 text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 cursor-pointer"
                title="Remove row"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
          ))}
          <button
            onClick={() => setSoulsWon((prev) => [...prev, { name: '', contact: '' }])}
            className="text-xs font-bold text-blue-700 hover:text-blue-900 inline-flex items-center gap-1 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">add</span> Add a name
          </button>
        </div>
      </div>

      {/* Cell attendance sheet */}
      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50/70">
          <h4 className="font-display text-sm font-bold text-slate-900">Cell Attendance Sheet</h4>
          <p className="text-xs text-slate-500">Tick first timers and souls won where they apply.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[620px] text-xs">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left font-bold text-slate-500 px-4 py-2.5 w-10">#</th>
                <th className="text-left font-bold text-slate-500 px-2 py-2.5">Name</th>
                <th className="text-left font-bold text-slate-500 px-2 py-2.5">Contact</th>
                <th className="text-center font-bold text-slate-500 px-2 py-2.5 w-24">First timer</th>
                <th className="text-center font-bold text-slate-500 px-2 py-2.5 w-24">Soul won</th>
                <th className="px-2 py-2.5 w-10" />
              </tr>
            </thead>
            <tbody>
              {cellAttendance.map((row, i) => (
                <tr key={i} className="border-b border-slate-50 last:border-0">
                  <td className="px-4 py-1.5 font-mono text-slate-400">{i + 1}</td>
                  <td className="px-2 py-1.5">
                    <input
                      value={row.name}
                      onChange={(e) =>
                        setCellAttendance((prev) =>
                          prev.map((r, idx) => (idx === i ? { ...r, name: e.target.value } : r)),
                        )
                      }
                      className={inputClass}
                    />
                  </td>
                  <td className="px-2 py-1.5">
                    <input
                      value={row.contact}
                      onChange={(e) =>
                        setCellAttendance((prev) =>
                          prev.map((r, idx) => (idx === i ? { ...r, contact: e.target.value } : r)),
                        )
                      }
                      className={inputClass}
                    />
                  </td>
                  <td className="px-2 py-1.5 text-center">
                    <input
                      type="checkbox"
                      checked={row.firstTimer}
                      onChange={(e) =>
                        setCellAttendance((prev) =>
                          prev.map((r, idx) => (idx === i ? { ...r, firstTimer: e.target.checked } : r)),
                        )
                      }
                      className="w-4 h-4 accent-blue-700 cursor-pointer"
                    />
                  </td>
                  <td className="px-2 py-1.5 text-center">
                    <input
                      type="checkbox"
                      checked={row.soulWon}
                      onChange={(e) =>
                        setCellAttendance((prev) =>
                          prev.map((r, idx) => (idx === i ? { ...r, soulWon: e.target.checked } : r)),
                        )
                      }
                      className="w-4 h-4 accent-blue-700 cursor-pointer"
                    />
                  </td>
                  <td className="px-2 py-1.5 text-center">
                    <button
                      onClick={() => setCellAttendance((prev) => prev.filter((_, idx) => idx !== i))}
                      className="text-slate-300 hover:text-rose-600 cursor-pointer"
                      title="Remove row"
                    >
                      <span className="material-symbols-outlined text-[16px]">close</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 border-t border-slate-100">
          <button
            onClick={() =>
              setCellAttendance((prev) => [...prev, { name: '', contact: '', firstTimer: false, soulWon: false }])
            }
            className="text-xs font-bold text-blue-700 hover:text-blue-900 inline-flex items-center gap-1 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">add</span> Add a row
          </button>
        </div>
      </div>

      {/* Sunday register */}
      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50/70">
          <h4 className="font-display text-sm font-bold text-slate-900">Sunday Service Register</h4>
          <p className="text-xs text-slate-500">Members present and absentees for the Sunday service.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-xs">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left font-bold text-slate-500 px-4 py-2.5 w-10">#</th>
                <th className="text-left font-bold text-slate-500 px-2 py-2.5">Members present</th>
                <th className="text-left font-bold text-slate-500 px-2 py-2.5">Contact / signature</th>
                <th className="text-left font-bold text-slate-500 px-2 py-2.5">Absentees</th>
                <th className="text-left font-bold text-slate-500 px-2 py-2.5">Absentee contact</th>
                <th className="px-2 py-2.5 w-10" />
              </tr>
            </thead>
            <tbody>
              {sundayRegister.map((row, i) => (
                <tr key={i} className="border-b border-slate-50 last:border-0">
                  <td className="px-4 py-1.5 font-mono text-slate-400">{i + 1}</td>
                  {(['present', 'contact', 'absentee', 'absenteeContact'] as const).map((field) => (
                    <td key={field} className="px-2 py-1.5">
                      <input
                        value={row[field]}
                        onChange={(e) =>
                          setSundayRegister((prev) =>
                            prev.map((r, idx) => (idx === i ? { ...r, [field]: e.target.value } : r)),
                          )
                        }
                        className={inputClass}
                      />
                    </td>
                  ))}
                  <td className="px-2 py-1.5 text-center">
                    <button
                      onClick={() => setSundayRegister((prev) => prev.filter((_, idx) => idx !== i))}
                      className="text-slate-300 hover:text-rose-600 cursor-pointer"
                      title="Remove row"
                    >
                      <span className="material-symbols-outlined text-[16px]">close</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 border-t border-slate-100">
          <button
            onClick={() =>
              setSundayRegister((prev) => [...prev, { present: '', contact: '', absentee: '', absenteeContact: '' }])
            }
            className="text-xs font-bold text-blue-700 hover:text-blue-900 inline-flex items-center gap-1 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">add</span> Add a row
          </button>
        </div>
      </div>

      {/* Submit */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm space-y-3">
        {submitError && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl px-3.5 py-2.5 flex items-start gap-2">
            <span className="material-symbols-outlined text-[16px] mt-0.5">error</span>
            <span>{submitError}</span>
          </div>
        )}
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full bg-blue-700 hover:bg-blue-800 disabled:opacity-60 text-white font-bold text-sm py-3.5 rounded-xl transition-all shadow-sm shadow-blue-700/20 active:scale-98 cursor-pointer flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined text-[18px]">send</span>
          {isSubmitting ? 'Submitting report…' : 'Submit this week\u2019s report'}
        </button>
        <p className="text-xs text-slate-400 text-center">
          Your report goes to your church administrator and the group pastor.
        </p>
      </div>
    </div>
  );
};
