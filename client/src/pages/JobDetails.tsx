import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import confetti from 'canvas-confetti';
import {
  Layers,
  CheckCircle2,
  AlertCircle,
  Clock,
  Download,
  RotateCcw,
  Ban,
  FileArchive,
  Search,
  ExternalLink,
  Eye,
  FileDown,
  ArrowLeft
} from 'lucide-react';
import {
  fetchJobDetail,
  fetchJobProgress,
  fetchJobRecipients,
  cancelJob,
  retryJob,
  requestArchive,
  Recipient
} from '../services/api';
import { StatusBadge } from '../components/StatusBadge';

export const JobDetails: React.FC = () => {
  const { jobId = '' } = useParams<{ jobId: string }>();
  const queryClient = useQueryClient();
  const [recipientStatusFilter, setRecipientStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [hasCelebrated, setHasCelebrated] = useState<boolean>(false);
  const [previewCertId, setPreviewCertId] = useState<string | null>(null);

  // Poll progress while not complete
  const { data: progress } = useQuery({
    queryKey: ['jobProgress', jobId],
    queryFn: () => fetchJobProgress(jobId),
    refetchInterval: (query) => {
      const data = query.state.data;
      if (!data) return 1500;
      if (['completed', 'completed_with_errors', 'failed', 'cancelled'].includes(data.status)) {
        return false;
      }
      return 1500;
    },
    enabled: !!jobId,
  });

  // Fetch full job metadata
  const { data: job, refetch: refetchJob } = useQuery({
    queryKey: ['jobDetail', jobId],
    queryFn: () => fetchJobDetail(jobId),
    enabled: !!jobId,
  });

  // Fetch paginated recipient results
  const { data: recipientsData, refetch: refetchRecipients } = useQuery({
    queryKey: ['jobRecipients', jobId, page, recipientStatusFilter, searchQuery],
    queryFn: () => fetchJobRecipients(jobId, page, 20, recipientStatusFilter, searchQuery),
    enabled: !!jobId,
    refetchInterval: (query) => {
      if (progress && !progress.is_completed) return 2000;
      return false;
    },
  });

  // Celebrate on completion
  useEffect(() => {
    if (progress?.is_completed && progress?.success_count > 0 && !hasCelebrated) {
      setHasCelebrated(true);
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
      refetchJob();
      refetchRecipients();
    }
  }, [progress?.is_completed, progress?.success_count, hasCelebrated, refetchJob, refetchRecipients]);

  const cancelMutation = useMutation({
    mutationFn: () => cancelJob(jobId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobProgress', jobId] });
      queryClient.invalidateQueries({ queryKey: ['jobDetail', jobId] });
    },
  });

  const retryMutation = useMutation({
    mutationFn: () => retryJob(jobId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobProgress', jobId] });
      queryClient.invalidateQueries({ queryKey: ['jobDetail', jobId] });
      queryClient.invalidateQueries({ queryKey: ['jobRecipients', jobId] });
    },
  });

  const archiveMutation = useMutation({
    mutationFn: () => requestArchive(jobId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobDetail', jobId] });
    },
  });

  const currentStatus = progress?.status || job?.status || 'queued';
  const isCompleted = progress?.is_completed || false;
  const progressPct = progress?.progress_percentage ?? job?.progress_percentage ?? 0;

  const recipients = recipientsData?.items || [];
  const totalRecipients = recipientsData?.total || 0;

  return (
    <div className="space-y-8 pb-16">
      {/* Top Breadcrumb & Metadata */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <Link
          to="/jobs"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Jobs</span>
        </Link>
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-medium text-slate-400">Batch ID</span>
          <span className="text-xs font-mono font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200/80">
            {jobId}
          </span>
        </div>
      </div>

      {/* Main Header & Metrics Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-5">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 font-display">
                {job?.course_name || 'Loading Course...'}
              </h1>
              <StatusBadge status={currentStatus} />
            </div>
            <p className="text-xs sm:text-sm text-slate-500">
              <span className="font-medium text-slate-700">{job?.organization}</span> • Signatory:{' '}
              <span className="text-slate-700">{job?.issuer}</span> • Issued:{' '}
              <span className="text-slate-700">{job?.issue_date}</span>
            </p>
          </div>

          {/* Action Buttons Cluster */}
          <div className="flex flex-wrap items-center gap-2.5 self-start">
            {!isCompleted && currentStatus !== 'cancelled' && (
              <button
                type="button"
                onClick={() => cancelMutation.mutate()}
                disabled={cancelMutation.isPending}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition-colors shadow-2xs"
              >
                <Ban className="w-3.5 h-3.5 text-slate-500" />
                <span>Cancel Job</span>
              </button>
            )}

            {(currentStatus === 'completed_with_errors' || currentStatus === 'failed') && (
              <button
                type="button"
                onClick={() => retryMutation.mutate()}
                disabled={retryMutation.isPending}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-xs transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Retry Failures</span>
              </button>
            )}

            {/* ZIP Download */}
            <a
              href={`/api/v1/jobs/${jobId}/archive/download`}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-semibold shadow-xs shadow-indigo-600/30 transition-all hover:scale-[1.01]"
            >
              <FileArchive className="w-4 h-4" />
              <span>Download All (ZIP)</span>
            </a>

            {/* Failed Export CSV */}
            <a
              href={`/api/v1/jobs/${jobId}/failed/export`}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors shadow-2xs"
            >
              <FileDown className="w-3.5 h-3.5 text-slate-500" />
              <span>Export Failed (CSV)</span>
            </a>
          </div>
        </div>

        {/* Progress Bar & Counter Banner */}
        <div className="space-y-2 pt-3 border-t border-slate-100">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-700">Batch Progress</span>
            <span className="font-mono font-bold text-indigo-600 tabular-nums">{progressPct}%</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        {/* Metrics Counters */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-2">
          <div className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-200/80 text-center">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Total</span>
            <div className="text-xl font-bold text-slate-900 mt-1 font-display tabular-nums">
              {progress?.total_count ?? job?.total_count ?? 0}
            </div>
          </div>
          <div className="bg-emerald-50/70 p-3.5 rounded-xl border border-emerald-200/70 text-center">
            <span className="text-[10px] uppercase font-bold text-emerald-800 tracking-wider">Success</span>
            <div className="text-xl font-bold text-emerald-800 mt-1 font-display tabular-nums">
              {progress?.success_count ?? job?.success_count ?? 0}
            </div>
          </div>
          <div className="bg-rose-50/70 p-3.5 rounded-xl border border-rose-200/70 text-center">
            <span className="text-[10px] uppercase font-bold text-rose-800 tracking-wider">Failed</span>
            <div className="text-xl font-bold text-rose-800 mt-1 font-display tabular-nums">
              {progress?.failed_count ?? job?.failed_count ?? 0}
            </div>
          </div>
          <div className="bg-amber-50/70 p-3.5 rounded-xl border border-amber-200/70 text-center">
            <span className="text-[10px] uppercase font-bold text-amber-800 tracking-wider">Invalid</span>
            <div className="text-xl font-bold text-amber-800 mt-1 font-display tabular-nums">
              {progress?.invalid_count ?? job?.invalid_count ?? 0}
            </div>
          </div>
          <div className="bg-sky-50/70 p-3.5 rounded-xl border border-sky-200/70 text-center">
            <span className="text-[10px] uppercase font-bold text-sky-800 tracking-wider">Pending</span>
            <div className="text-xl font-bold text-sky-800 mt-1 font-display tabular-nums">
              {progress?.pending_count ?? job?.pending_count ?? 0}
            </div>
          </div>
          <div className="bg-indigo-50/70 p-3.5 rounded-xl border border-indigo-200/70 text-center">
            <span className="text-[10px] uppercase font-bold text-indigo-800 tracking-wider">Valid</span>
            <div className="text-xl font-bold text-indigo-800 mt-1 font-display tabular-nums">
              {progress?.valid_count ?? job?.valid_count ?? 0}
            </div>
          </div>
        </div>
      </div>

      {/* Recipient Results Table & Filters */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        {/* Table Header & Controls */}
        <div className="p-5 sm:p-6 border-b border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 font-display">Recipient Certificates</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Showing {recipients.length} of {totalRecipients} recipients in this batch
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search recipient / ID..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
                className="pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-slate-50/40 hover:bg-white focus:bg-white w-48 transition-all"
              />
            </div>

            {/* Status Filter Tabs */}
            <div className="inline-flex rounded-xl border border-slate-200 p-0.5 bg-slate-50 text-xs font-semibold">
              {['all', 'success', 'failed', 'invalid', 'pending'].map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => {
                    setRecipientStatusFilter(st);
                    setPage(1);
                  }}
                  className={`px-3 py-1 rounded-lg capitalize transition-all ${
                    recipientStatusFilter === st
                      ? 'bg-white text-indigo-700 shadow-2xs font-bold border border-slate-200/60'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Recipients Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase font-bold border-b border-slate-200 text-[11px]">
              <tr>
                <th className="px-6 py-3.5">Certificate ID</th>
                <th className="px-6 py-3.5">Recipient Name</th>
                <th className="px-6 py-3.5">Email</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5">Details / Errors</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {recipients.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-slate-400">
                    No recipients matching filter criteria.
                  </td>
                </tr>
              ) : (
                recipients.map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-3.5 font-mono font-medium text-slate-900 text-xs">
                      {rec.certificate_id}
                    </td>
                    <td className="px-6 py-3.5 font-semibold text-slate-900">
                      {rec.recipient_name}
                    </td>
                    <td className="px-6 py-3.5 text-slate-500">
                      {rec.recipient_email || <span className="italic text-slate-300">—</span>}
                    </td>
                    <td className="px-6 py-3.5">
                      <StatusBadge status={rec.status} size="sm" />
                    </td>
                    <td className="px-6 py-3.5 max-w-xs truncate">
                      {rec.error_message ? (
                        <span className="text-rose-600 font-medium" title={rec.error_message}>
                          {rec.error_message}
                        </span>
                      ) : rec.status === 'success' ? (
                        <span className="text-slate-500 font-mono text-[11px]">
                          {rec.file_size_bytes ? `${(rec.file_size_bytes / 1024).toFixed(1)} KB` : 'Rendered'}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">In progress</span>
                      )}
                    </td>
                    <td className="px-6 py-3.5 text-right space-x-2">
                      {rec.status === 'success' && (
                        <>
                          <button
                            type="button"
                            onClick={() => setPreviewCertId(rec.certificate_id)}
                            className="inline-flex items-center gap-1.5 text-slate-700 hover:text-indigo-700 font-semibold bg-slate-100 hover:bg-indigo-50 px-2.5 py-1 rounded-lg transition-colors border border-slate-200/60 text-xs"
                            title="Preview certificate"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Preview</span>
                          </button>
                          <a
                            href={`/api/v1/certificates/${rec.certificate_id}/download`}
                            className="inline-flex items-center gap-1.5 text-indigo-700 hover:text-indigo-800 font-semibold bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded-lg transition-colors border border-indigo-200/60 text-xs"
                            title="Download PDF"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>PDF</span>
                          </a>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {recipientsData && recipientsData.total_pages > 1 && (
          <div className="p-4 border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-500">
            <span>
              Page {recipientsData.page} of {recipientsData.total_pages}
            </span>
            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page <= 1}
                className="px-3 py-1.5 rounded-lg border border-slate-300 disabled:opacity-40 hover:bg-slate-50 transition-colors"
              >
                Previous
              </button>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(p + 1, recipientsData.total_pages))}
                disabled={page >= recipientsData.total_pages}
                className="px-3 py-1.5 rounded-lg border border-slate-300 disabled:opacity-40 hover:bg-slate-50 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Inline Certificate Preview Modal */}
      {previewCertId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full h-[82vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
              <div>
                <h3 className="font-bold text-slate-900 text-sm font-display">
                  Certificate Preview: {previewCertId}
                </h3>
                <span className="text-xs text-slate-500">Official Landscape A4 Document</span>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={`/api/v1/certificates/${previewCertId}/download`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700 shadow-2xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </a>
                <button
                  type="button"
                  onClick={() => setPreviewCertId(null)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
            <div className="flex-1 bg-slate-100 p-2">
              <iframe
                src={`/api/v1/certificates/${previewCertId}/preview`}
                className="w-full h-full rounded-xl border border-slate-300 bg-white shadow-inner"
                title="Certificate PDF Viewer"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
