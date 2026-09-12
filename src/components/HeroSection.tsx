import React from 'react';
import { motion } from 'motion/react';
import { ChurchLogo } from './ChurchLogo';

type Tab = 'home' | 'attendance' | 'leader_reg' | 'admin_signup' | 'login';

interface HeroSectionProps {
  onNavigate: (tab: Tab) => void;
}

/**
 * Landing hero — the homepage for unauthenticated visitors.
 * Two-column layout: marketing copy + CTA on the left, a floating
 * attendance-check-in UI mockup on the right. Royal-blue / white theme.
 */
export const HeroSection: React.FC<HeroSectionProps> = ({ onNavigate }) => {
  return (
    <section className="relative w-full">
      {/* Hero container — rounded card on a soft gradient, like the reference */}
      <div className="relative overflow-hidden rounded-[24px] border border-blue-100 shadow-xl shadow-blue-900/5">
        {/* Soft royal-blue gradient background with subtle vertical line texture */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-700 via-blue-600 to-blue-500" />
        <div
          className="absolute inset-0 opacity-[0.12] mix-blend-overlay"
          style={{
            backgroundImage:
              'repeating-linear-gradient(90deg, rgba(255,255,255,0.6) 0px, rgba(255,255,255,0.6) 1px, transparent 1px, transparent 64px)',
          }}
        />
        {/* Glow accents */}
        <div className="absolute -top-24 -right-16 w-80 h-80 bg-white/20 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute -bottom-24 -left-16 w-72 h-72 bg-blue-300/30 rounded-full blur-[90px] pointer-events-none" />

        <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-8 items-center px-6 sm:px-10 lg:px-14 py-12 lg:py-16">
          {/* LEFT — copy + CTAs */}
          <div className="space-y-6 max-w-xl">
            {/* Badge pill */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/15 backdrop-blur-md px-3.5 py-1.5 text-white text-xs font-semibold"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
              <span>GCYC Attendance is live</span>
              <span className="material-symbols-outlined text-[15px] leading-none">arrow_forward</span>
            </motion.div>

            {/* Headline — bold sans + italic serif accent */}
            <motion.h2
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
              className="font-headline text-3xl sm:text-4xl lg:text-5xl font-black leading-[1.08] tracking-tight text-white"
            >
              The better way to
              <br />
              <span className="italic font-serif font-extrabold" style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}>
                track church attendance
              </span>
            </motion.h2>

            {/* Subheadline */}
            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
              className="text-sm sm:text-base text-blue-50/90 leading-relaxed"
            >
              A simple check-in system for members, leaders and church admins across every
              branch. Scan a QR pass, record attendance instantly, and watch your church grow —
              all in one place.
            </motion.p>

            {/* CTA buttons */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-wrap items-center gap-3 pt-1"
            >
              <button
                onClick={() => onNavigate('attendance')}
                className="group inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-bold text-blue-800 shadow-lg shadow-blue-900/20 transition-all hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">qr_code_scanner</span>
                Check in now
                <span className="material-symbols-outlined text-[18px] transition-transform group-hover:translate-x-0.5">arrow_forward</span>
              </button>

              <button
                onClick={() => onNavigate('leader_reg')}
                className="inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/10 backdrop-blur-md px-6 py-3 text-sm font-bold text-white transition-all hover:bg-white/20 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">person_add</span>
                Leader registration
              </button>
            </motion.div>

            {/* Trust element */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.35 }}
              className="flex items-center gap-2 pt-2"
            >
              <div className="flex items-center gap-0.5">
                {[0, 1, 2, 3, 4].map(i => (
                  <span key={i} className="material-symbols-outlined text-[18px] text-amber-300 icon-fill">star</span>
                ))}
              </div>
              <span className="text-xs font-semibold text-blue-50/90">Trusted by GCYC branches</span>
            </motion.div>
          </div>

          {/* RIGHT — floating UI mockup (check-in card + service calendar) */}
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="relative hidden sm:block"
          >
            <div className="relative mx-auto max-w-md">
              {/* glow behind cards */}
              <div className="absolute -inset-6 bg-white/20 blur-3xl rounded-[40px] pointer-events-none" />

              {/* Primary check-in card */}
              <div className="relative bg-white rounded-2xl shadow-2xl shadow-blue-950/30 p-5 space-y-4 ring-1 ring-black/5">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-blue-700 text-white flex items-center justify-center font-bold text-base">
                    VA
                  </div>
                  <div className="min-w-0">
                    <p className="font-headline font-bold text-sm text-slate-900 truncate">Vanessa Adjei</p>
                    <p className="text-xs text-slate-500 truncate">GCYC Achimota • Member</p>
                  </div>
                  <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Checked in
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <p className="text-slate-400 font-semibold uppercase text-[10px]">Service</p>
                    <p className="font-semibold text-slate-800 mt-0.5">Sunday Worship</p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <p className="text-slate-400 font-semibold uppercase text-[10px]">Date</p>
                    <p className="font-semibold text-slate-800 mt-0.5">14 Sep 2026</p>
                  </div>
                </div>

                {/* faux QR block */}
                <div className="flex items-center gap-3 rounded-xl border border-slate-200 p-3">
                  <div className="w-14 h-14 rounded-lg bg-slate-900 grid grid-cols-7 gap-px p-1.5 shrink-0">
                    {Array.from({ length: 49 }).map((_, i) => (
                      <span
                        key={i}
                        className={i % 3 === 0 || i % 5 === 0 ? 'bg-white' : 'bg-slate-900'}
                      />
                    ))}
                  </div>
                  <div className="min-w-0">
                    <p className="font-mono text-xs font-bold text-slate-900">GCYC-MEM-0421</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">Scan to record attendance</p>
                  </div>
                  <span className="material-symbols-outlined text-[20px] text-blue-700 ml-auto">qr_code_scanner</span>
                </div>
              </div>

              {/* Secondary calendar card — peeking from bottom-right */}
              <div className="absolute -bottom-8 -right-4 sm:-right-8 w-52 bg-white rounded-2xl shadow-xl shadow-blue-950/20 ring-1 ring-black/5 p-4 rotate-[3deg]">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-headline font-bold text-xs text-slate-900">September 2026</p>
                  <span className="material-symbols-outlined text-[16px] text-slate-400">calendar_month</span>
                </div>
                <div className="grid grid-cols-7 gap-1 text-center">
                  {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                    <span key={i} className="text-[9px] font-bold text-slate-400">{d}</span>
                  ))}
                  {Array.from({ length: 21 }).map((_, i) => {
                    const isService = i % 7 === 0;
                    const isToday = i === 13;
                    return (
                      <span
                        key={i}
                        className={`relative text-[10px] font-semibold rounded-md py-1 ${
                          isToday
                            ? 'bg-blue-700 text-white'
                            : isService
                            ? 'text-slate-700'
                            : 'text-slate-400'
                        }`}
                      >
                        {i + 1}
                        {isService && !isToday && (
                          <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-blue-500" />
                        )}
                      </span>
                    );
                  })}
                </div>
                <div className="mt-2 flex items-center gap-1.5 text-[10px] text-slate-500">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  <span>Service days</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Quick action chips below hero — secondary entry points */}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-2.5">
        <button
          onClick={() => onNavigate('attendance')}
          className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm transition-all hover:border-blue-300 hover:text-blue-700 cursor-pointer"
        >
          <span className="material-symbols-outlined text-[16px] text-blue-700">how_to_reg</span>
          Self Attendance
        </button>
        <button
          onClick={() => onNavigate('leader_reg')}
          className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm transition-all hover:border-blue-300 hover:text-blue-700 cursor-pointer"
        >
          <span className="material-symbols-outlined text-[16px] text-blue-700">person_add</span>
          Leader Sign-up
        </button>
        <button
          onClick={() => onNavigate('admin_signup')}
          className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm transition-all hover:border-blue-300 hover:text-blue-700 cursor-pointer"
        >
          <span className="material-symbols-outlined text-[16px] text-blue-700">church</span>
          Register a Branch
        </button>
        <button
          onClick={() => onNavigate('login')}
          className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm transition-all hover:border-blue-300 hover:text-blue-700 cursor-pointer"
        >
          <span className="material-symbols-outlined text-[16px] text-blue-700">lock</span>
          Admin Login
        </button>
      </div>
    </section>
  );
};
