import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Upload,
  FileSpreadsheet,
  Plus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Download,
  Sparkles,
  Info,
  Check,
  FileText,
  Users,
  ShieldCheck,
  ChevronRight,
  HelpCircle
} from 'lucide-react';
import { createJob, uploadCsvJob } from '../services/api';

const metadataSchema = z.object({
  course_name: z.string().min(2, 'Course / program name is required'),
  organization: z.string().min(2, 'Organization name is required'),
  issuer: z.string().min(2, 'Authorized issuer name is required'),
  issue_date: z.string().min(2, 'Issue date is required'),
  event_name: z.string().optional(),
});

type MetadataForm = z.infer<typeof metadataSchema>;

interface RecipientRow {
  recipient_name: string;
  recipient_email?: string;
}

export const GenerateCertificates: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);
  const [inputMode, setInputMode] = useState<'csv' | 'manual'>('csv');
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvPreviewRows, setCsvPreviewRows] = useState<RecipientRow[]>([]);
  const [manualRecipients, setManualRecipients] = useState<RecipientRow[]>([
    { recipient_name: 'Grace Hopper', recipient_email: 'grace@navy.mil' },
    { recipient_name: 'Alan Turing', recipient_email: 'alan@bletchley.ac.uk' },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    trigger,
    getValues,
    watch,
    formState: { errors },
  } = useForm<MetadataForm>({
    resolver: zodResolver(metadataSchema),
    defaultValues: {
      course_name: 'Full-Stack Software Architecture Masterclass',
      organization: 'Global Technology Institute',
      issuer: 'Dr. Sarah Connor, Dean of Studies',
      issue_date: 'October 15, 2026',
      event_name: 'TechSummit 2026',
    },
  });

  const watchedValues = watch();

  const handleCsvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCsvFile(file);

    // Parse preview in browser
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
      if (lines.length > 1) {
        const rows: RecipientRow[] = [];
        for (let i = 1; i < lines.length; i++) {
          const parts = lines[i].split(',').map((p) => p.trim());
          if (parts[0]) {
            rows.push({
              recipient_name: parts[0],
              recipient_email: parts[1] || undefined,
            });
          }
        }
        setCsvPreviewRows(rows);
      }
    };
    reader.readAsText(file);
  };

  const handleDownloadSampleCsv = () => {
    const csvContent =
      'recipient_name,recipient_email\n' +
      'Alexander Hamilton,alexander@treasury.gov\n' +
      'Ada Lovelace,ada@computing.org\n' +
      'Katherine Johnson,katherine@nasa.gov\n' +
      'Nikola Tesla,nikola@wardenclyffe.com\n' +
      'Marie Curie,marie@radium.org\n';

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'sample_certificate_recipients.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const activeRecipients = inputMode === 'csv' ? csvPreviewRows : manualRecipients;

  // Real-time client side validation breakdown
  const validRecipients = activeRecipients.filter(
    (r) => r.recipient_name && r.recipient_name.trim().length >= 2
  );
  const invalidRecipients = activeRecipients.filter(
    (r) => !r.recipient_name || r.recipient_name.trim().length < 2
  );

  const seen = new Set<string>();
  const duplicates = activeRecipients.filter((r) => {
    const key = (r.recipient_email || r.recipient_name || '').toLowerCase();
    if (!key) return false;
    if (seen.has(key)) return true;
    seen.add(key);
    return false;
  });

  const nextStep = async () => {
    if (currentStep === 1) {
      const isValid = await trigger();
      if (!isValid) return;
    }
    if (currentStep === 2) {
      if (inputMode === 'csv' && !csvFile) {
        setSubmitError('Please upload a CSV file or switch to manual recipient entry.');
        return;
      }
      if (inputMode === 'manual' && manualRecipients.length === 0) {
        setSubmitError('Please enter at least one recipient.');
        return;
      }
      setSubmitError(null);
    }
    setCurrentStep((prev) => Math.min(prev + 1, 4) as any);
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1) as any);
  };

  const onSubmitAll = async () => {
    setIsSubmitting(true);
    setSubmitError(null);
    const meta = getValues();

    try {
      if (inputMode === 'csv' && csvFile) {
        const formData = new FormData();
        formData.append('course_name', meta.course_name);
        formData.append('organization', meta.organization);
        formData.append('issuer', meta.issuer);
        formData.append('issue_date', meta.issue_date);
        if (meta.event_name) formData.append('event_name', meta.event_name);
        formData.append('file', csvFile);

        const createdJob = await uploadCsvJob(formData);
        navigate(`/jobs/${createdJob.id}`);
      } else {
        const payload = {
          course_name: meta.course_name,
          organization: meta.organization,
          issuer: meta.issuer,
          issue_date: meta.issue_date,
          event_name: meta.event_name,
          recipients: manualRecipients,
          idempotency_key: `client-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        };
        const createdJob = await createJob(payload);
        navigate(`/jobs/${createdJob.id}`);
      }
    } catch (err: any) {
      setSubmitError(err.message || 'Failed to submit batch generation job');
    } finally {
      setIsSubmitting(false);
    }
  };

  const stepsConfig = [
    { num: 1, label: 'Certificate Info', subtitle: 'Course & authority details' },
    { num: 2, label: 'Recipient Data', subtitle: 'CSV upload or manual list' },
    { num: 3, label: 'Validation Preview', subtitle: 'Integrity check & preview' },
    { num: 4, label: 'Review & Launch', subtitle: 'Confirm batch & dispatch' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Top Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-600 mb-1">
            <span>Bulk Generation Pipeline</span>
            <span>•</span>
            <span>Batch Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 font-display">
            Generate Bulk Certificates
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
            Follow the guided workflow to configure metadata, upload recipients, validate records, and launch generation.
          </p>
        </div>

        <div className="hidden lg:flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200/80 shadow-2xs self-start">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-medium text-slate-600">
            ReportLab A4 Vector Layout
          </span>
        </div>
      </div>

      {/* Stepper Progress Indicator */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-xs">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          {stepsConfig.map((s) => {
            const isActive = currentStep === s.num;
            const isDone = currentStep > s.num;
            return (
              <div
                key={s.num}
                className={`relative flex items-center gap-3 p-2.5 rounded-xl transition-all ${
                  isActive
                    ? 'bg-indigo-50/70 border border-indigo-200/80 shadow-2xs'
                    : isDone
                    ? 'bg-slate-50/70 border border-slate-200/60'
                    : 'bg-transparent border border-transparent'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 transition-all ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-xs shadow-indigo-600/30'
                      : isDone
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 text-slate-500 border border-slate-200'
                  }`}
                >
                  {isDone ? <Check className="w-4 h-4 stroke-[2.5]" /> : s.num}
                </div>
                <div className="min-w-0 flex-1">
                  <div
                    className={`text-xs font-bold truncate leading-tight ${
                      isActive
                        ? 'text-indigo-950 font-bold'
                        : isDone
                        ? 'text-slate-800'
                        : 'text-slate-500'
                    }`}
                  >
                    {s.label}
                  </div>
                  <div className="text-[11px] text-slate-400 truncate hidden sm:block">
                    {s.subtitle}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {submitError && (
        <div className="p-4 rounded-xl bg-rose-50/90 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-start gap-3 shadow-2xs">
          <AlertTriangle className="w-5 h-5 shrink-0 text-rose-600 mt-0.5" />
          <div className="flex-1 font-medium">{submitError}</div>
        </div>
      )}

      {/* Step 1: Certificate Information Form */}
      {currentStep === 1 && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-600" />
                <h2 className="text-base sm:text-lg font-bold text-slate-900 font-display">
                  1. Certificate Information
                </h2>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                These details are printed on every certificate in the official layout.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="sm:col-span-2">
                <label
                  htmlFor="course_name_input"
                  className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5"
                >
                  Course / Certification Title <span className="text-indigo-600">*</span>
                </label>
                <input
                  id="course_name_input"
                  type="text"
                  {...register('course_name')}
                  placeholder="e.g. Advanced Distributed Systems & Cloud Architecture"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-slate-50/30 hover:bg-white focus:bg-white transition-all text-slate-900 placeholder:text-slate-400"
                />
                {errors.course_name && (
                  <p className="text-xs text-rose-600 mt-1.5 font-medium flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    {errors.course_name.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="organization_input"
                  className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5"
                >
                  Issuing Organization <span className="text-indigo-600">*</span>
                </label>
                <input
                  id="organization_input"
                  type="text"
                  {...register('organization')}
                  placeholder="e.g. Global Technology Institute"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-slate-50/30 hover:bg-white focus:bg-white transition-all text-slate-900 placeholder:text-slate-400"
                />
                {errors.organization && (
                  <p className="text-xs text-rose-600 mt-1.5 font-medium flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    {errors.organization.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="issuer_input"
                  className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5"
                >
                  Authorized Signatory / Issuer <span className="text-indigo-600">*</span>
                </label>
                <input
                  id="issuer_input"
                  type="text"
                  {...register('issuer')}
                  placeholder="e.g. Dr. Sarah Connor, Executive Dean"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-slate-50/30 hover:bg-white focus:bg-white transition-all text-slate-900 placeholder:text-slate-400"
                />
                {errors.issuer && (
                  <p className="text-xs text-rose-600 mt-1.5 font-medium flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    {errors.issuer.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="issue_date_input"
                  className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5"
                >
                  Issue Date <span className="text-indigo-600">*</span>
                </label>
                <input
                  id="issue_date_input"
                  type="text"
                  {...register('issue_date')}
                  placeholder="e.g. October 15, 2026"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-slate-50/30 hover:bg-white focus:bg-white transition-all text-slate-900 placeholder:text-slate-400"
                />
                {errors.issue_date && (
                  <p className="text-xs text-rose-600 mt-1.5 font-medium flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    {errors.issue_date.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="event_name_input"
                  className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5"
                >
                  Event / Context Name (Optional)
                </label>
                <input
                  id="event_name_input"
                  type="text"
                  {...register('event_name')}
                  placeholder="e.g. Annual Cloud Summit 2026"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-slate-50/30 hover:bg-white focus:bg-white transition-all text-slate-900 placeholder:text-slate-400"
                />
              </div>
            </div>
          </div>

          {/* Live Credential Typography Preview Strip */}
          <div className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 shadow-md">
            <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800 pb-3 mb-3">
              <span className="flex items-center gap-1.5 font-semibold text-slate-300">
                <ShieldCheck className="w-4 h-4 text-indigo-400" />
                Live Credential Heading Preview
              </span>
              <span className="font-mono text-[11px] text-slate-400">Standard Landscape Template</span>
            </div>
            <div className="space-y-1 text-center py-2">
              <div className="text-[11px] uppercase tracking-widest font-semibold text-indigo-400">
                {watchedValues.organization || 'Organization Name'}
              </div>
              <div className="text-lg sm:text-xl font-bold text-white tracking-tight font-display">
                {watchedValues.course_name || 'Course / Certification Title'}
              </div>
              <div className="text-xs text-slate-400">
                Authorized Signatory: <span className="text-slate-200">{watchedValues.issuer || 'Signatory Name'}</span> • Issued on{' '}
                <span className="text-slate-200">{watchedValues.issue_date || 'Date'}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Recipient Entry */}
      {currentStep === 2 && (
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-600" />
                <h2 className="text-base sm:text-lg font-bold text-slate-900 font-display">
                  2. Recipient Ingestion
                </h2>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Choose between uploading a CSV spreadsheet or entering recipients manually.
              </p>
            </div>

            {/* Segmented Input Mode Switcher */}
            <div className="inline-flex rounded-xl border border-slate-200 p-1 bg-slate-50 self-start">
              <button
                type="button"
                onClick={() => setInputMode('csv')}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  inputMode === 'csv'
                    ? 'bg-white text-indigo-700 shadow-2xs border border-slate-200/60'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                CSV Upload
              </button>
              <button
                type="button"
                onClick={() => setInputMode('manual')}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  inputMode === 'manual'
                    ? 'bg-white text-indigo-700 shadow-2xs border border-slate-200/60'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Manual Entry
              </button>
            </div>
          </div>

          {inputMode === 'csv' ? (
            <div className="space-y-6">
              {/* CSV Guidance Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-indigo-50/60 border border-indigo-100 rounded-xl p-4 text-xs text-indigo-950">
                <div className="flex items-center gap-2.5">
                  <Info className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>
                    Your CSV must include columns for <strong>recipient_name</strong> and optional{' '}
                    <strong>recipient_email</strong>.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleDownloadSampleCsv}
                  className="inline-flex items-center gap-1.5 font-semibold text-indigo-700 hover:text-indigo-900 bg-white border border-indigo-200/80 px-3 py-1.5 rounded-lg shadow-2xs hover:bg-indigo-50/50 transition-colors self-start shrink-0"
                >
                  <Download className="w-3.5 h-3.5" />
                  Sample CSV
                </button>
              </div>

              {/* Modern Drag and Drop Zone */}
              <div className="border-2 border-dashed border-slate-300 hover:border-indigo-500 rounded-2xl p-8 sm:p-10 text-center transition-all bg-slate-50/40 hover:bg-indigo-50/10 group cursor-pointer">
                <input
                  type="file"
                  id="csv-file-input"
                  accept=".csv"
                  onChange={handleCsvChange}
                  className="hidden"
                />
                <label
                  htmlFor="csv-file-input"
                  className="cursor-pointer flex flex-col items-center justify-center space-y-3"
                >
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <FileSpreadsheet className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="font-bold text-sm text-indigo-600 hover:underline">
                      Click to upload CSV
                    </span>{' '}
                    <span className="text-slate-600 text-sm">or drag and drop here</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Supports comma-delimited UTF-8 CSV files up to 25MB
                  </p>
                </label>
              </div>

              {/* Uploaded File Status Card */}
              {csvFile && (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-bold text-sm text-slate-900">{csvFile.name}</div>
                      <div className="text-xs text-slate-500">
                        {(csvFile.size / 1024).toFixed(1)} KB • {csvPreviewRows.length} recipients detected
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setCsvFile(null);
                      setCsvPreviewRows([]);
                    }}
                    className="text-xs text-rose-600 hover:text-rose-700 font-semibold hover:underline self-end sm:self-auto"
                  >
                    Remove File
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-500 pb-1">
                <span>Enter one recipient per row:</span>
                <span className="font-medium">{manualRecipients.length} rows</span>
              </div>

              <div className="space-y-2.5">
                {manualRecipients.map((rec, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <span className="text-xs font-mono text-slate-400 w-6 text-center tabular-nums">
                      {index + 1}
                    </span>
                    <input
                      type="text"
                      placeholder="Recipient Full Name *"
                      value={rec.recipient_name}
                      onChange={(e) => {
                        const updated = [...manualRecipients];
                        updated[index].recipient_name = e.target.value;
                        setManualRecipients(updated);
                      }}
                      className="flex-1 px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-white"
                    />
                    <input
                      type="email"
                      placeholder="Email Address (optional)"
                      value={rec.recipient_email || ''}
                      onChange={(e) => {
                        const updated = [...manualRecipients];
                        updated[index].recipient_email = e.target.value;
                        setManualRecipients(updated);
                      }}
                      className="flex-1 px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setManualRecipients(manualRecipients.filter((_, i) => i !== index));
                      }}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Remove row"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() => {
                  setManualRecipients([
                    ...manualRecipients,
                    { recipient_name: '', recipient_email: '' },
                  ]);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
              >
                <Plus className="w-4 h-4" />
                Add Another Recipient
              </button>
            </div>
          )}
        </div>
      )}

      {/* Step 3: Recipient Validation Preview */}
      {currentStep === 3 && (
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-indigo-600" />
              <h2 className="text-base sm:text-lg font-bold text-slate-900 font-display">
                3. Recipient Validation Preview
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Review records before initiating background generation. Invalid records are isolated and will not halt the job.
            </p>
          </div>

          {/* Validation KPI Counters */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-[11px] text-slate-500 uppercase tracking-wider font-bold">Total Ingested</span>
              <div className="text-2xl font-bold text-slate-900 mt-1 font-display tabular-nums">
                {activeRecipients.length}
              </div>
            </div>
            <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200/80">
              <span className="text-[11px] text-emerald-800 uppercase tracking-wider font-bold">Valid for PDF</span>
              <div className="text-2xl font-bold text-emerald-800 mt-1 font-display tabular-nums">
                {validRecipients.length}
              </div>
            </div>
            <div className="p-4 rounded-xl bg-rose-50/70 border border-rose-200/80">
              <span className="text-[11px] text-rose-800 uppercase tracking-wider font-bold">Issues Detected</span>
              <div className="text-2xl font-bold text-rose-800 mt-1 font-display tabular-nums">
                {invalidRecipients.length}
              </div>
            </div>
          </div>

          {duplicates.length > 0 && (
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                <strong>{duplicates.length} duplicate entries detected.</strong> Duplicates will be isolated to prevent duplicate issuance.
              </span>
            </div>
          )}

          {/* Preview Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <div className="max-h-64 overflow-y-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 uppercase font-bold sticky top-0 border-b border-slate-200 text-[11px]">
                  <tr>
                    <th className="px-4 py-2.5">#</th>
                    <th className="px-4 py-2.5">Recipient Name</th>
                    <th className="px-4 py-2.5">Email</th>
                    <th className="px-4 py-2.5">Validation Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {activeRecipients.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-6 text-center text-slate-400">
                        No recipient records entered.
                      </td>
                    </tr>
                  ) : (
                    activeRecipients.map((rec, i) => {
                      const isValid = rec.recipient_name && rec.recipient_name.trim().length >= 2;
                      return (
                        <tr key={i} className="hover:bg-slate-50/60 transition-colors">
                          <td className="px-4 py-2.5 text-slate-400 font-mono tabular-nums">{i + 1}</td>
                          <td className="px-4 py-2.5 font-semibold text-slate-900">
                            {rec.recipient_name || <span className="text-rose-500 italic">Missing Name</span>}
                          </td>
                          <td className="px-4 py-2.5 text-slate-500">{rec.recipient_email || '—'}</td>
                          <td className="px-4 py-2.5">
                            {isValid ? (
                              <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60 text-[11px]">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Valid
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-rose-700 font-semibold bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200/60 text-[11px]">
                                <AlertTriangle className="w-3 h-3 text-rose-600" /> Name too short
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Step 4: Review and Submit */}
      {currentStep === 4 && (
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-600" />
              <h2 className="text-base sm:text-lg font-bold text-slate-900 font-display">
                4. Review & Launch Generation
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Confirm your batch configuration. Processing will execute asynchronously in bounded batches.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-5 rounded-2xl border border-slate-200/80 text-xs">
            <div>
              <span className="text-slate-400 uppercase font-bold text-[10px] tracking-wider">Course / Event</span>
              <div className="font-bold text-slate-900 text-sm mt-0.5">{getValues('course_name')}</div>
              {getValues('event_name') && (
                <div className="text-slate-500 mt-0.5">{getValues('event_name')}</div>
              )}
            </div>
            <div>
              <span className="text-slate-400 uppercase font-bold text-[10px] tracking-wider">Organization & Signatory</span>
              <div className="font-bold text-slate-900 text-sm mt-0.5">{getValues('organization')}</div>
              <div className="text-slate-500 mt-0.5">{getValues('issuer')}</div>
            </div>
            <div>
              <span className="text-slate-400 uppercase font-bold text-[10px] tracking-wider">Issue Date</span>
              <div className="font-semibold text-slate-800 text-sm mt-0.5">{getValues('issue_date')}</div>
            </div>
            <div>
              <span className="text-slate-400 uppercase font-bold text-[10px] tracking-wider">Recipients to Process</span>
              <div className="font-bold text-indigo-700 text-sm mt-0.5 tabular-nums">
                {validRecipients.length} valid / {activeRecipients.length} total
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-indigo-50/60 border border-indigo-100 text-xs text-indigo-900 space-y-1">
            <div className="font-bold flex items-center gap-1.5 text-sm text-indigo-950">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              Asynchronous Background Guarantee
            </div>
            <p className="leading-relaxed">
              Once submitted, the job returns HTTP 202 Accepted. You will be redirected to the real-time job progress monitor where you can track each recipient's certificate generation.
            </p>
          </div>
        </div>
      )}

      {/* Step Navigation Controls */}
      <div className="flex items-center justify-between pt-2">
        {currentStep > 1 ? (
          <button
            type="button"
            onClick={prevStep}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs sm:text-sm hover:bg-slate-50 active:bg-slate-100 transition-colors shadow-2xs"
          >
            <ArrowLeft className="w-4 h-4" />
            Previous
          </button>
        ) : (
          <div />
        )}

        {currentStep < 4 ? (
          <button
            type="button"
            onClick={nextStep}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold text-xs sm:text-sm shadow-xs shadow-indigo-600/30 transition-all hover:scale-[1.01]"
          >
            <span>Next Step</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={onSubmitAll}
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold text-xs sm:text-sm shadow-md shadow-indigo-600/30 transition-all hover:scale-[1.01] disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Scheduling Batch Job...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Launch Certificate Generation</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};

