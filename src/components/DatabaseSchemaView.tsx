import React, { useState } from 'react';
import { ViewType } from '../types';
import { SUPABASE_SQL_SCHEMA } from '../data/supabase_schema';

interface DatabaseSchemaViewProps {
  onNavigate: (view: ViewType) => void;
}

export const DatabaseSchemaView: React.FC<DatabaseSchemaViewProps> = () => {
  const [activeTab, setActiveTab] = useState<'schema' | 'rls' | 'tables'>('schema');
  const [copied, setCopied] = useState(false);

  const supabaseSqlSchema = SUPABASE_SQL_SCHEMA;

  const handleCopySql = () => {
    navigator.clipboard.writeText(supabaseSqlSchema);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 font-body">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full mb-1 border border-emerald-200">
            <span className="material-symbols-outlined text-[14px]">database</span>
            Supabase Relational Database Architecture
          </div>
          <h1 className="font-display text-2xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
            Relational DB & Supabase RLS Schema
          </h1>
          <p className="font-body text-xs md:text-sm text-slate-500 mt-1">
            Production PostgreSQL migration DDL with multi-tenancy Row Level Security policies for GCYC Group.
          </p>
        </div>

        <button
          onClick={handleCopySql}
          className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-2.5 px-4 rounded-xl transition-all flex items-center gap-2 shadow-md cursor-pointer shrink-0"
        >
          <span className="material-symbols-outlined text-[18px]">
            {copied ? 'check' : 'content_copy'}
          </span>
          <span>{copied ? 'SQL Copied!' : 'Copy Supabase DDL'}</span>
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('schema')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeTab === 'schema' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
            }`}
        >
          PostgreSQL DDL Migration
        </button>

        <button
          onClick={() => setActiveTab('rls')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeTab === 'rls' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
            }`}
        >
          Row Level Security (RLS) Multi-Tenancy
        </button>

        <button
          onClick={() => setActiveTab('tables')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeTab === 'tables' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
            }`}
        >
          Relational Table Mapping
        </button>
      </div>

      {activeTab === 'schema' && (
        <div className="bg-slate-950 text-slate-100 p-6 rounded-3xl font-mono text-xs overflow-x-auto shadow-2xl border border-slate-800 space-y-2">
          <div className="flex justify-between items-center text-slate-400 border-b border-slate-800 pb-3 mb-2">
            <span className="text-emerald-400 font-bold">// Supabase PostgreSQL Initial Migration DDL Script</span>
            <span>PostgreSQL 15+</span>
          </div>
          <pre className="text-slate-300 leading-relaxed whitespace-pre-wrap">
            {supabaseSqlSchema}
          </pre>
        </div>
      )}

      {activeTab === 'rls' && (
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-2xs space-y-4">
          <h3 className="font-headline font-bold text-lg text-slate-900">Multi-Tenancy Security Model</h3>
          <p className="text-xs text-slate-600 leading-relaxed font-body">
            Row Level Security (RLS) is enforced directly at the database level using Supabase custom JWT claims (<code className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-blue-700">church_id</code> and <code className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-amber-700">is_superadmin</code>).
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <h4 className="font-headline font-bold text-sm text-slate-900">Church Admin Isolation</h4>
              <p className="text-xs text-slate-600">
                Church Admins are restricted strictly to querying records belonging to their assigned <code className="font-mono text-blue-700">church_id</code>. They cannot view or modify members from another church branch.
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <h4 className="font-headline font-bold text-sm text-slate-900">Group Pastor Superadmin Privilege</h4>
              <p className="text-xs text-slate-600">
                The Group Pastor account bypasses single-church filters via <code className="font-mono text-amber-700">is_superadmin = true</code> or username <code className="font-mono text-amber-700">group.pastor</code>, granting instant access to all network databases, audit trails, and backup logs.
              </p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'tables' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { name: 'churches', desc: 'Tenants & branch churches directory', count: 5 },
            { name: 'user_profiles', desc: 'Superadmin, Admins, Ushers & Passwords', count: 6 },
            { name: 'leaders', desc: 'PCF Leaders, Cell Leaders & BSCTs tree', count: 5 },
            { name: 'members', desc: 'First timers & general members directory', count: 10 },
            { name: 'service_types', desc: 'Sunday, Midweek & Special Programs', count: 6 },
            { name: 'attendance_records', desc: 'Timestamped service check-in logs', count: 4 },
            { name: 'broadcasts', desc: 'Group & branch level announcements', count: 3 },
            { name: 'audit_logs', desc: 'Complete system action audit trail', count: 4 },
            { name: 'promotion_queue', desc: 'Auto-flagged hierarchy promotion queue', count: 2 }
          ].map(tbl => (
            <div key={tbl.name} className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-2">
              <div className="flex justify-between items-start">
                <span className="font-mono font-bold text-xs text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100">
                  {tbl.name}
                </span>
                <span className="font-mono text-[10px] text-slate-400 font-semibold">{tbl.count} live rows</span>
              </div>
              <p className="text-xs text-slate-500 font-body">{tbl.desc}</p>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
