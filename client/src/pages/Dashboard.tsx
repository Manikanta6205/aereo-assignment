import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  Award,
  Layers,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  ArrowRight,
  Clock,
  Download,
  PlusCircle,
  Sparkles,
  Zap,
  Cpu,
  ShieldCheck,
  FileSpreadsheet,
  Activity,
  Server,
  RefreshCw,
  Search,
  ExternalLink
} from 'lucide-react';
import { fetchJobs, fetchCertificates, Job } from '../services/api';
import { StatusBadge } from '../components/StatusBadge';

export const Dashboard: React.FC = () => {
  const [filterTab, setFilterTab] = useState<'all' | 'processing' | 'completed'>('all');

  const { data: jobsData, isLoading: jobsLoading, refetch: refetchJobs } = useQuery({
    queryKey: ['jobs', 1, 10],
    queryFn: () => fetchJobs(1, 10),
    refetchInterval: 4000,
  });

  const { data: certsData } = useQuery({
    queryKey: ['certificates', 1, 1],
    queryFn: () => fetchCertificates(1, 1),
    refetchInterval: 10000,
  });

  const allJobs = jobsData?.items || [];
  const totalJobs = jobsData?.total || 0;

  // Aggregate stats across fetched jobs
  const totalCertificates = certsData?.total || allJobs.reduce((acc, j) => acc + j.success_count, 0);
  const totalSuccess = allJobs.reduce((acc, j) => acc + j.success_count, 0);
  const totalFailed = allJobs.reduce((acc, j) => acc + j.failed_count + j.invalid_count, 0);
  const totalRecipients = allJobs.reduce((acc, j) => acc + j.total_count, 0);
  const successRate = totalRecipients > 0 ? Math.round((totalSuccess / totalRecipients) * 100) : 100;
  const activeJobsCount = allJobs.filter(j => j.status === 'processing' || j.status === 'pending').length;

  // Filter jobs based on selected tab
  const filteredJobs = allJobs.filter((job) => {
    if (filterTab === 'processing') return job.status === 'processing' || job.status === 'pending';
    if (filterTab === 'completed') return job.status === 'completed' || job.status === 'completed_with_errors';
    return true;
  });

  return (
    <div className="space-y-8 pb-16">
      {/* Hero / Executive Command Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 text-white p-8 sm:p-10 shadow-2xl border border-indigo-900/40">
        {/* Glow ambient meshes */}
        <div className="absolute top-0 right-0 -mt-16 -mr-16 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-20 w-72 h-72 bg-violet-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-indigo-200 text-xs font-semibold">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>High-Throughput Distributed Processing Engine</span>
              <span className="text-white/40">|</span>
              <span className="text-emerald-300 font-mono">Bounded O(1) Memory</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
              Enterprise Bulk Certificate <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-indigo-300 via-indigo-100 to-white bg-clip-text text-transparent">
                Generation & Issuance
              </span>
            </h1>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-xl">
              Process thousands of recipients asynchronously with bounded memory batches, automatic failure isolation, instant ZIP packaging, and tamper-evident verification.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-3">
              <Link
                to="/generate"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <Zap className="w-4 h-4 fill-white" />
                <span>Start Bulk Generation</span>
              </Link>
              <Link
                to="/template"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-slate-100 font-semibold text-sm border border-white/10 backdrop-blur-md transition-colors"
              >
                <Award className="w-4 h-4 text-indigo-300" />
                <span>Preview Template</span>
              </Link>
              <Link
                to="/certificates"
                className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-transparent hover:bg-white/5 text-slate-300 hover:text-white font-medium text-sm transition-colors"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Verify Credential</span>
              </Link>
            </div>
          </div>

          {/* Quick Engine Telemetry Widget */}
          <div className="bg-slate-900/80 backdrop-blur-md rounded-2xl border border-white/10 p-5 lg:w-80 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Cpu className="w-3.5 h-3.5 text-indigo-400" />
                Engine Telemetry
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                ONLINE
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center text-slate-300">
                <span className="text-slate-400">Worker Pool</span>
                <span className="font-semibold text-white">Celery 5.x / Redis</span>
              </div>
              <div className="flex justify-between items-center text-slate-300">
                <span className="text-slate-400">Batch Buffer</span>
                <span className="font-mono text-indigo-300 font-semibold">50 items / chunk</span>
              </div>
              <div className="flex justify-between items-center text-slate-300">
                <span className="text-slate-400">Active Tasks</span>
                <span className="font-bold text-amber-300 font-mono">
                  {activeJobsCount} in-flight
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-300">
                <span className="text-slate-400">PDF Engine</span>
                <span className="font-semibold text-slate-200">ReportLab Vector A4</span>
              </div>
            </div>

            <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                PostgreSQL Neon Ready
              </span>
              <button
                type="button"
                onClick={() => refetchJobs()}
                className="hover:text-white transition-colors flex items-center gap-1"
                title="Refresh stats"
              >
                <RefreshCw className="w-3 h-3" />
                Sync
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Certificates */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs hover:shadow-md transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Issued Credentials
            </span>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform shadow-xs">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-slate-900 tracking-tight font-display">
              {totalCertificates.toLocaleString()}
            </div>
            <div className="text-xs text-slate-500 mt-2 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>Cryptographically verified & stored</span>
            </div>
          </div>
        </div>

        {/* Total Batches */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs hover:shadow-md transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Total Batches
            </span>
            <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center group-hover:scale-110 transition-transform shadow-xs">
              <Layers className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-slate-900 tracking-tight font-display">
              {totalJobs.toLocaleString()}
            </div>
            <div className="text-xs text-slate-500 mt-2 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
              <span>{activeJobsCount} currently processing</span>
            </div>
          </div>
        </div>

        {/* Success vs Errors */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs hover:shadow-md transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Success / Failed
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform shadow-xs">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-slate-900 tracking-tight font-display">
              {totalSuccess.toLocaleString()}
              <span className="text-base font-normal text-slate-400 ml-1.5">
                / {totalFailed}
              </span>
            </div>
            <div className="text-xs text-slate-500 mt-2 flex items-center gap-1.5">
              {totalFailed > 0 ? (
                <span className="text-amber-600 font-medium flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> Isolated per-recipient errors
                </span>
              ) : (
                <span className="text-emerald-600 font-medium">100% error isolation</span>
              )}
            </div>
          </div>
        </div>

        {/* Overall Success Rate */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs hover:shadow-md transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Overall Success Rate
            </span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform shadow-xs">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-slate-900 tracking-tight font-display">
              {successRate}%
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 mt-2.5 overflow-hidden">
              <div
                className="bg-indigo-600 h-2 rounded-full transition-all duration-700 ease-out"
                style={{ width: `${successRate}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout: Activity & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Activity Overview */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-indigo-600" />
                  Recent Batch Throughput & Progress
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Real-time status across recent asynchronous worker execution batches
                </p>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" /> Success
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-400" /> Errors
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-300" /> Remaining
                </span>
              </div>
            </div>

            {allJobs.length === 0 ? (
              <div className="text-center py-16 text-slate-400 text-sm">
                No batch jobs recorded yet. Create your first batch to see throughput graphs.
              </div>
            ) : (
              <div className="space-y-5">
                {allJobs.slice(0, 5).map((job) => {
                  const maxCount = Math.max(job.total_count, 1);
                  const successWidth = (job.success_count / maxCount) * 100;
                  const failWidth = ((job.failed_count + job.invalid_count) / maxCount) * 100;

                  return (
                    <div key={job.id} className="space-y-2 p-3.5 rounded-xl hover:bg-slate-50/80 transition-colors border border-transparent hover:border-slate-100">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2 truncate max-w-sm">
                          <Link
                            to={`/jobs/${job.id}`}
                            className="font-bold text-slate-900 hover:text-indigo-600 truncate"
                          >
                            {job.course_name}
                          </Link>
                          <span className="text-[11px] text-slate-400">({job.organization})</span>
                        </div>
                        <div className="flex items-center gap-2 font-mono">
                          <span className="font-bold text-indigo-700">
                            {job.success_count}/{job.total_count}
                          </span>
                          <span className="text-slate-400">({job.progress_percentage}%)</span>
                        </div>
                      </div>

                      <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
                        <div
                          style={{ width: `${successWidth}%` }}
                          className="bg-indigo-600 h-full transition-all duration-500 rounded-l-full"
                          title={`${job.success_count} succeeded`}
                        />
                        <div
                          style={{ width: `${failWidth}%` }}
                          className="bg-rose-400 h-full transition-all duration-500"
                          title={`${job.failed_count + job.invalid_count} failed`}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Auto-polling updates every 4 seconds</span>
            <Link
              to="/jobs"
              className="font-semibold text-indigo-600 hover:text-indigo-700 inline-flex items-center gap-1"
            >
              <span>Explore all batches</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Right 1 Col: Quick Workflow Shortcuts & Architecture Info */}
        <div className="space-y-6">
          {/* Quick Actions Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">
              Quick Actions
            </h3>

            <div className="space-y-2.5">
              <Link
                to="/generate"
                className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50 transition-all group text-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                    <PlusCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">New Batch Generation</div>
                    <div className="text-[11px] text-slate-500">JSON or CSV upload</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" />
              </Link>

              <Link
                to="/certificates"
                className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50 transition-all group text-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">Certificate Verification</div>
                    <div className="text-[11px] text-slate-500">Check cryptographic validity</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all" />
              </Link>

              <Link
                to="/template"
                className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 hover:border-violet-300 hover:bg-violet-50/50 transition-all group text-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center group-hover:bg-violet-600 group-hover:text-white transition-colors">
                    <Award className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">Template Designer</div>
                    <div className="text-[11px] text-slate-500">Landscape A4 ReportLab layout</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-violet-600 group-hover:translate-x-0.5 transition-all" />
              </Link>
            </div>
          </div>

          {/* Architecture Highlights Card */}
          <div className="bg-gradient-to-br from-indigo-50/70 to-slate-50 rounded-2xl border border-indigo-100 p-6 space-y-3">
            <div className="flex items-center gap-2 text-indigo-950 font-bold text-sm">
              <Server className="w-4 h-4 text-indigo-600" />
              <span>Production Architecture</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Designed with Celery asynchronous tasks, Redis state tracking, chunked database writes, and bounded memory buffers to prevent memory spikes on large batches.
            </p>
            <div className="pt-2">
              <a
                href="/docs"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-700 hover:text-indigo-800"
              >
                <span>Interactive Swagger OpenAPI Docs</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Jobs Table Card with Filter Tabs */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Recent Generation Batches</h2>
            <p className="text-xs text-slate-500 mt-0.5">Real-time status and telemetry of batch generation tasks</p>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-medium">
              <button
                type="button"
                onClick={() => setFilterTab('all')}
                className={`px-3 py-1 rounded-lg transition-colors ${
                  filterTab === 'all'
                    ? 'bg-white text-slate-900 font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All ({allJobs.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterTab('processing')}
                className={`px-3 py-1 rounded-lg transition-colors ${
                  filterTab === 'processing'
                    ? 'bg-white text-slate-900 font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Active ({activeJobsCount})
              </button>
              <button
                type="button"
                onClick={() => setFilterTab('completed')}
                className={`px-3 py-1 rounded-lg transition-colors ${
                  filterTab === 'completed'
                    ? 'bg-white text-slate-900 font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Completed
              </button>
            </div>

            <Link
              to="/jobs"
              className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-2 rounded-xl transition-colors shrink-0"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {jobsLoading ? (
          <div className="p-12 text-center text-slate-400 text-sm">
            <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-indigo-600 border-t-transparent mb-2"></div>
            <div>Loading generation jobs...</div>
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Layers className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">No matching generation jobs</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Submit your first batch using JSON or CSV upload to generate professional certificates.
            </p>
            <Link
              to="/generate"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 mt-2 shadow-xs"
            >
              <PlusCircle className="w-4 h-4" />
              Create First Batch
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/70 text-slate-500 text-xs uppercase font-bold tracking-wider border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4">Course & Program</th>
                  <th className="px-6 py-4">Organization</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Progress</th>
                  <th className="px-6 py-4">Recipients</th>
                  <th className="px-6 py-4">Created Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredJobs.map((job) => (
                  <tr key={job.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-6 py-4">
                      <Link
                        to={`/jobs/${job.id}`}
                        className="font-bold text-slate-900 group-hover:text-indigo-600 block truncate max-w-xs transition-colors"
                      >
                        {job.course_name}
                      </Link>
                      <span className="text-[11px] text-slate-400 block font-mono">
                        {job.id}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs font-medium text-slate-600">
                      {job.organization}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={job.status} />
                    </td>
                    <td className="px-6 py-4">
                      <div className="w-32 space-y-1">
                        <div className="flex justify-between text-xs text-slate-500 font-mono">
                          <span>{job.progress_percentage}%</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-2 rounded-full transition-all duration-500 ${
                              job.status === 'processing'
                                ? 'bg-indigo-600 animate-pulse'
                                : job.status === 'completed'
                                ? 'bg-emerald-500'
                                : job.status === 'completed_with_errors'
                                ? 'bg-amber-500'
                                : 'bg-rose-500'
                            }`}
                            style={{ width: `${job.progress_percentage}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs space-x-1.5 font-mono">
                        <span className="text-emerald-600 font-bold">{job.success_count} ok</span>
                        {job.failed_count > 0 && (
                          <span className="text-rose-600 font-bold">• {job.failed_count} err</span>
                        )}
                        {job.invalid_count > 0 && (
                          <span className="text-amber-600 font-bold">• {job.invalid_count} inv</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500">
                      {new Date(job.created_at).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <Link
                        to={`/jobs/${job.id}`}
                        className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        Details
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
