import React, { useState } from 'react';
import {
  Award,
  ShieldCheck,
  Check,
  Sparkles,
  FileText,
  Info,
  Sliders,
  Eye,
  RefreshCw,
  Layers,
  Palette
} from 'lucide-react';

export const TemplatePreview: React.FC = () => {
  const [sampleRecipient, setSampleRecipient] = useState('Alexander Vance, Ph.D.');
  const [sampleCourse, setSampleCourse] = useState('Distributed Cloud Systems & Microservices Engineering');
  const [sampleOrg, setSampleOrg] = useState('GLOBAL CERTIFICATIONS INSTITUTE');
  const [sampleSignatory, setSampleSignatory] = useState('Dr. Elizabeth Reed, Chancellor');
  const [sampleDate, setSampleDate] = useState('October 15, 2026');
  const [sampleId, setSampleId] = useState('CERT-2026-X8B9Q2');

  const setPreset = (type: 'tech' | 'leadership' | 'research') => {
    if (type === 'tech') {
      setSampleRecipient('Samantha Chen');
      setSampleCourse('Advanced Distributed Systems & High-Throughput Stream Processing');
      setSampleOrg('AEREO ADVANCED COMPUTING INSTITUTE');
      setSampleSignatory('Marcus Vance, Chief Architect');
      setSampleDate('October 24, 2026');
      setSampleId('CERT-2026-TECH90');
    } else if (type === 'leadership') {
      setSampleRecipient('Elena Rostova');
      setSampleCourse('Executive Leadership in Engineering & Cloud Operations');
      setSampleOrg('INTERNATIONAL LEADERSHIP ACADEMY');
      setSampleSignatory('Dame Eleanor Vance, Chancellor');
      setSampleDate('November 1, 2026');
      setSampleId('CERT-2026-LEAD44');
    } else {
      setSampleRecipient('Alexander Vance, Ph.D.');
      setSampleCourse('Distributed Cloud Systems & Microservices Engineering');
      setSampleOrg('GLOBAL CERTIFICATIONS INSTITUTE');
      setSampleSignatory('Dr. Elizabeth Reed, Chancellor');
      setSampleDate('October 15, 2026');
      setSampleId('CERT-2026-X8B9Q2');
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200/60 text-indigo-700 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>ReportLab Vector Geometry Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-display">
            Official Certificate Canvas
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Standard landscape A4 ReportLab layout engineered for vector crispness, mathematical proportion, and tamper verification.
          </p>
        </div>

        {/* Preset switchers */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-xs text-slate-400 font-semibold">Presets:</span>
          <button
            type="button"
            onClick={() => setPreset('research')}
            className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all shadow-2xs"
          >
            Research
          </button>
          <button
            type="button"
            onClick={() => setPreset('tech')}
            className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all shadow-2xs"
          >
            Cloud Eng
          </button>
          <button
            type="button"
            onClick={() => setPreset('leadership')}
            className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all shadow-2xs"
          >
            Executive
          </button>
        </div>
      </div>

      {/* Interactive Controls Bar */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider">
            <Sliders className="w-4 h-4 text-indigo-600" />
            Live Canvas Parameter Controls
          </div>
          <span className="text-[11px] text-slate-400">
            Real-time visual reflection
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="text-slate-600 font-bold block mb-1.5">
              Recipient Full Name
            </label>
            <input
              type="text"
              value={sampleRecipient}
              onChange={(e) => setSampleRecipient(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 bg-slate-50/50 focus:bg-white transition-all text-xs"
            />
          </div>

          <div>
            <label className="text-slate-600 font-bold block mb-1.5">
              Course / Program Title
            </label>
            <input
              type="text"
              value={sampleCourse}
              onChange={(e) => setSampleCourse(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 bg-slate-50/50 focus:bg-white transition-all text-xs"
            />
          </div>

          <div>
            <label className="text-slate-600 font-bold block mb-1.5">
              Issuing Organization
            </label>
            <input
              type="text"
              value={sampleOrg}
              onChange={(e) => setSampleOrg(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 bg-slate-50/50 focus:bg-white transition-all text-xs"
            />
          </div>

          <div>
            <label className="text-slate-600 font-bold block mb-1.5">
              Authorized Signatory & Title
            </label>
            <input
              type="text"
              value={sampleSignatory}
              onChange={(e) => setSampleSignatory(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 bg-slate-50/50 focus:bg-white transition-all text-xs"
            />
          </div>

          <div>
            <label className="text-slate-600 font-bold block mb-1.5">
              Issue Date
            </label>
            <input
              type="text"
              value={sampleDate}
              onChange={(e) => setSampleDate(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 bg-slate-50/50 focus:bg-white transition-all text-xs"
            />
          </div>

          <div>
            <label className="text-slate-600 font-bold block mb-1.5">
              Sample Certificate ID
            </label>
            <input
              type="text"
              value={sampleId}
              onChange={(e) => setSampleId(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 bg-slate-50/50 focus:bg-white transition-all text-xs font-mono"
            />
          </div>
        </div>
      </div>

      {/* Visual Canvas Representation of Landscape A4 Certificate */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-950 p-4 sm:p-10 shadow-2xl flex flex-col items-center justify-center border border-slate-800">
        <div className="w-full flex items-center justify-between text-xs text-slate-400 mb-4 px-2">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span>A4 Landscape Canvas (842pt × 595pt Vector Scaled)</span>
          </div>
          <span className="font-mono text-slate-500">ReportLab Flowable</span>
        </div>

        {/* Certificate Container: Aspect Ratio 1.414 (A4 Landscape) */}
        <div className="w-full max-w-4xl aspect-[1.414/1] bg-[#FCFDFE] text-slate-900 rounded-xl shadow-2xl relative p-6 sm:p-12 md:p-14 flex flex-col justify-between select-none border-[6px] border-indigo-900">
          {/* Outer hairline border */}
          <div className="absolute inset-2 sm:inset-3 border border-indigo-300/80 pointer-events-none rounded-xs" />

          {/* Corner gold/indigo ornaments */}
          <div className="absolute top-2.5 left-2.5 w-6 h-6 border-t-2 border-l-2 border-amber-600 pointer-events-none" />
          <div className="absolute top-2.5 right-2.5 w-6 h-6 border-t-2 border-r-2 border-amber-600 pointer-events-none" />
          <div className="absolute bottom-2.5 left-2.5 w-6 h-6 border-b-2 border-l-2 border-amber-600 pointer-events-none" />
          <div className="absolute bottom-2.5 right-2.5 w-6 h-6 border-b-2 border-r-2 border-amber-600 pointer-events-none" />

          {/* Header Organization */}
          <div className="text-center space-y-1.5 pt-1">
            <p className="text-[10px] sm:text-xs font-extrabold tracking-[0.25em] text-indigo-700 uppercase">
              {sampleOrg}
            </p>
            <h2 className="text-xl sm:text-3xl md:text-4xl font-black text-slate-900 tracking-tight font-display">
              CERTIFICATE OF ACHIEVEMENT
            </h2>
            <div className="w-28 sm:w-40 h-0.5 bg-gradient-to-r from-transparent via-indigo-600 to-transparent mx-auto mt-1" />
          </div>

          {/* Body Section */}
          <div className="text-center my-auto space-y-2.5 sm:space-y-4">
            <p className="text-[9px] sm:text-xs text-slate-500 font-semibold uppercase tracking-widest">
              THIS CERTIFICATE IS PROUDLY CONFERRED UPON
            </p>
            <div className="text-xl sm:text-3xl md:text-4xl font-black text-indigo-950 tracking-tight font-serif pb-1.5 border-b-2 border-slate-300 max-w-lg mx-auto">
              {sampleRecipient}
            </div>
            <p className="text-[10px] sm:text-xs text-slate-600 italic">
              for successfully completing and fulfilling all certification criteria in
            </p>
            <p className="text-sm sm:text-lg md:text-xl font-bold text-indigo-700 max-w-xl mx-auto leading-snug">
              {sampleCourse}
            </p>
          </div>

          {/* Footer Section */}
          <div className="grid grid-cols-3 items-end pt-4 sm:pt-6 border-t border-slate-200">
            {/* Left: Date */}
            <div className="text-center">
              <div className="w-24 sm:w-36 border-b border-slate-400 mx-auto pb-1 text-[10px] sm:text-xs font-bold text-slate-800">
                {sampleDate}
              </div>
              <span className="text-[9px] sm:text-[11px] text-slate-500 mt-1 block font-medium">
                Date of Issue
              </span>
            </div>

            {/* Center: Official Seal Medallion */}
            <div className="flex justify-center">
              <div className="w-14 sm:w-20 h-14 sm:h-20 rounded-full border-2 border-amber-600/90 bg-gradient-to-b from-amber-50 to-amber-100/60 flex flex-col items-center justify-center text-center shadow-md relative">
                <div className="absolute inset-1 rounded-full border border-dashed border-amber-500/60" />
                <Award className="w-5 sm:w-7 h-5 sm:h-7 text-amber-700 mb-0.5" />
                <span className="text-[7px] sm:text-[8px] font-extrabold text-amber-900 leading-tight uppercase tracking-wider">
                  VERIFIED
                </span>
              </div>
            </div>

            {/* Right: Signature */}
            <div className="text-center">
              <div className="w-28 sm:w-44 border-b border-slate-400 mx-auto pb-1 text-[10px] sm:text-xs font-bold text-slate-800 truncate">
                {sampleSignatory}
              </div>
              <span className="text-[9px] sm:text-[11px] text-slate-500 mt-1 block font-medium">
                Authorized Signatory
              </span>
            </div>
          </div>

          {/* Security Hash & Verification Footer */}
          <div className="text-center text-[8px] sm:text-[9px] text-slate-400 pt-2 font-mono flex items-center justify-center gap-2">
            <span>Certificate ID: <strong className="text-slate-600">{sampleId}</strong></span>
            <span>•</span>
            <span>Cryptographic Verification Ledger: Validated</span>
          </div>
        </div>
      </div>

      {/* Technical Engine Specifications Grid */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-7 shadow-xs space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
          <Layers className="w-4 h-4 text-indigo-600" />
          ReportLab Vector Engine Architecture Specifications
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
            <div className="font-bold text-slate-900">Dimensions & Orientation</div>
            <p className="text-slate-600">
              ISO A4 Landscape layout: 842.0 points width × 595.0 points height (297mm × 210mm).
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
            <div className="font-bold text-slate-900">Vector Rendering & DPI</div>
            <p className="text-slate-600">
              Zero raster degradation. Fully vectorized typography, lines, borders, and CMYK/RGB calibrated colors.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
            <div className="font-bold text-slate-900">Tamper-Evident SHA-256</div>
            <p className="text-slate-600">
              Each generated PDF embeds a deterministic certificate UUID tracked in PostgreSQL Neon database.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
