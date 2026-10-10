import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Award,
  Search,
  Download,
  Eye,
  CheckCircle2,
  Calendar,
  Building,
  ShieldCheck,
  ExternalLink,
  Mail,
  Sparkles,
  RefreshCw,
  FileText,
  X
} from 'lucide-react';
import { fetchCertificates, verifyCertificate, CertificateItem } from '../services/api';

export const CertificateLibrary: React.FC = () => {
  const [page, setPage] = useState<number>(1);
  const [search, setSearch] = useState<string>('');
  const [previewCertId, setPreviewCertId] = useState<string | null>(null);
  const [verifyCertId, setVerifyCertId] = useState<string | null>(null);

  const { data: certsData, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['certificateLibrary', page, search],
    queryFn: () => fetchCertificates(page, 18, search),
  });

  const { data: verificationResult, isLoading: isVerifying } = useQuery({
    queryKey: ['verifyCert', verifyCertId],
    queryFn: () => verifyCertificate(verifyCertId!),
    enabled: !!verifyCertId,
  });

  const certificates = certsData?.items || [];
  const total = certsData?.total || 0;
  const totalPages = certsData?.total_pages || 1;

  return (
    <div className="space-y-6 pb-16">
      {/* Page Title & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/60 text-emerald-700 text-xs font-semibold mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Cryptographic Credential Repository</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-display">
            Certificate Library
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Search, preview, verify, and export all generated credentials across all batches.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search recipient, cert ID, or course..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-xs text-slate-900"
            />
            {search && (
              <button
                type="button"
                onClick={() => {
                  setSearch('');
                  setPage(1);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
              >
                Clear
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={() => refetch()}
            className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-colors shadow-xs"
            title="Refresh certificates"
          >
            <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin text-indigo-600' : 'text-slate-500'}`} />
          </button>
        </div>
      </div>

      {/* Grid of Certificate Cards */}
      {isLoading ? (
        <div className="p-20 text-center text-slate-400 text-sm space-y-3">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-indigo-600 border-t-transparent"></div>
          <div>Loading credential library...</div>
        </div>
      ) : certificates.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-16 text-center space-y-4 shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto shadow-inner">
            <Award className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">
            {search ? `No credentials found for "${search}"` : 'No certificates issued yet'}
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
            {search
              ? 'Try modifying your search query or check the recipient spelling.'
              : 'Certificates will be permanently recorded here as soon as bulk batch jobs complete.'}
          </p>
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
            >
              Clear search
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {certificates.map((cert) => (
            <div
              key={cert.id}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md hover:border-indigo-200 transition-all flex flex-col justify-between group relative overflow-hidden"
            >
              {/* Top ambient accent line */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-violet-500 to-indigo-400 opacity-80 group-hover:opacity-100 transition-opacity" />

              <div className="space-y-4 pt-1">
                {/* Top Row with ID & Verification Badge */}
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50/80 px-2.5 py-1 rounded-lg border border-indigo-100/80 truncate">
                    {cert.certificate_id}
                  </span>
                  <button
                    type="button"
                    onClick={() => setVerifyCertId(cert.certificate_id)}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-full border border-emerald-200/60 transition-colors shrink-0 shadow-2xs"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Verify
                  </button>
                </div>

                {/* Recipient Name & Email */}
                <div>
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1 font-display">
                    {cert.recipient_name}
                  </h3>
                  {cert.recipient_email ? (
                    <div className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5 truncate">
                      <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="truncate">{cert.recipient_email}</span>
                    </div>
                  ) : (
                    <div className="text-xs text-slate-400 mt-0.5">Verified Recipient</div>
                  )}
                </div>

                {/* Course & Organization Metadata */}
                <div className="text-xs space-y-2 pt-2 text-slate-600 border-t border-slate-100">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      Course / Program
                    </span>
                    <div className="font-semibold text-slate-800 line-clamp-2 mt-0.5">
                      {cert.course_name}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 text-slate-500">
                    <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{cert.organization}</span>
                  </div>

                  <div className="flex items-center gap-1.5 text-slate-500">
                    <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>Issued {cert.issue_date}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-4 mt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setPreviewCertId(cert.certificate_id)}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-all shadow-2xs"
                >
                  <Eye className="w-3.5 h-3.5 text-slate-500" />
                  Preview
                </button>
                <a
                  href={`/api/v1/certificates/${cert.certificate_id}/download`}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-xs shadow-indigo-600/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {certsData && totalPages > 1 && (
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 shadow-xs">
          <div>
            Showing page <span className="font-bold text-slate-700">{page}</span> of{' '}
            <span className="font-bold text-slate-700">{totalPages}</span> ({total} certificates total)
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page <= 1}
              className="px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white font-bold text-slate-700 disabled:opacity-40 hover:bg-slate-50 transition-colors shadow-2xs"
            >
              Previous
            </button>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              disabled={page >= totalPages}
              className="px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white font-bold text-slate-700 disabled:opacity-40 hover:bg-slate-50 transition-colors shadow-2xs"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Cryptographic Verification Modal */}
      {verifyCertId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 space-y-5 shadow-2xl border border-slate-200 relative">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Cryptographic Ledger Verification</h3>
                  <span className="text-[11px] text-slate-400 font-mono">{verifyCertId}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setVerifyCertId(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {isVerifying ? (
              <div className="py-8 text-center text-xs text-slate-500 space-y-2">
                <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-emerald-600 border-t-transparent"></div>
                <div>Querying database ledger and validating signature...</div>
              </div>
            ) : verificationResult?.valid ? (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200/80 text-emerald-900 text-xs space-y-1">
                  <div className="font-bold flex items-center gap-1.5 text-sm text-emerald-700">
                    <CheckCircle2 className="w-4 h-4" />
                    Authentic & Validated Credential
                  </div>
                  <p className="leading-relaxed">
                    This certificate is genuine, permanently recorded in PostgreSQL with immutable metadata, and verified.
                  </p>
                </div>

                <div className="space-y-2.5 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <div>
                    <span className="text-slate-400 uppercase font-bold text-[10px] tracking-wider">
                      Recipient
                    </span>
                    <div className="font-bold text-slate-900 text-sm mt-0.5">
                      {verificationResult.recipient_name}
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-400 uppercase font-bold text-[10px] tracking-wider">
                      Course / Program
                    </span>
                    <div className="font-semibold text-slate-800 mt-0.5">
                      {verificationResult.course_name}
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-400 uppercase font-bold text-[10px] tracking-wider">
                      Issuing Organization
                    </span>
                    <div className="text-slate-700 mt-0.5">{verificationResult.organization}</div>
                  </div>
                  <div>
                    <span className="text-slate-400 uppercase font-bold text-[10px] tracking-wider">
                      Certificate ID
                    </span>
                    <div className="font-mono text-indigo-700 font-bold mt-0.5">
                      {verificationResult.certificate_id}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
                Certificate ID was not found or failed validation in the database ledger.
              </div>
            )}

            <button
              type="button"
              onClick={() => setVerifyCertId(null)}
              className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
            >
              Close Verification
            </button>
          </div>
        </div>
      )}

      {/* PDF Preview Modal */}
      {previewCertId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-4xl w-full h-[85vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200">
            <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    ReportLab Vector PDF Preview: {previewCertId}
                  </h3>
                  <span className="text-xs text-slate-500">Official Landscape A4 High-Resolution Vector Output</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={`/api/v1/certificates/${previewCertId}/download`}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download PDF
                </a>
                <button
                  type="button"
                  onClick={() => setPreviewCertId(null)}
                  className="w-8 h-8 rounded-xl bg-slate-200/60 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="flex-1 bg-slate-100 p-2 sm:p-4">
              <iframe
                src={`/api/v1/certificates/${previewCertId}/preview`}
                className="w-full h-full rounded-2xl border border-slate-300 bg-white shadow-inner"
                title="Certificate PDF Viewer"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
