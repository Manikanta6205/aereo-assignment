import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  Search,
  Layers,
  PlusCircle,
  ArrowRight,
  RefreshCw,
  Building,
  Calendar,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Clock,
  Sparkles,
  Filter
} from 'lucide-react';
import { fetchJobs, Job } from '../services/api';
import { StatusBadge } from '../components/StatusBadge';

export const JobsList: React.FC = () => {
  const [page, setPage] = useState<number>(1);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [search, setSearch] = useState<string>('');

  const { data: jobsData, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['jobsList', page, statusFilter, search],
    queryFn: () => fetchJobs(page, 15, statusFilter, search),
    refetchInterval: 4000,
  });

  const jobs = jobsData?.items || [];
  const total = jobsData?.total || 0;
  const totalPages = jobsData?.total_pages || 1;

  const filterTabs = [
    { id: 'all', label: 'All Jobs' },
    { id: 'processing', label: 'Processing' },
    { id: 'completed', label: 'Completed' },
    { id: 'completed_with_errors', label: 'With Errors' },
    { id: 'failed', label: 'Failed' },
    { id: 'cancelled', label: 'Cancelled' },
  ];

  return (
    <div className="space-y-6 pb-16">
      {/* Page Title & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200/60 text-indigo-700 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Asynchronous Batch Orchestration</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-display">
            Generation Batch History
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Monitor, inspect, and audit all bulk certificate generation runs and task lifecycles.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => refetch()}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all shadow-xs"
            title="Refresh list"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin text-indigo-600' : 'text-slate-500'}`} />
            <span>Refresh</span>
          </button>

          <Link
            to="/generate"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Batch</span>
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 max-w-lg">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by course name, organization, or batch UUID..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-slate-900"
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

          <div className="text-xs text-slate-500 font-mono flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>{total} Total Batches Recorded</span>
          </div>
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 border-t border-slate-100">
          <div className="flex items-center gap-1 text-slate-400 text-xs font-semibold mr-1 shrink-0">
            <Filter className="w-3.5 h-3.5" />
            <span>Status:</span>
          </div>
          {filterTabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setStatusFilter(tab.id);
                setPage(1);
              }}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl whitespace-nowrap transition-all ${
                statusFilter === tab.id
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 bg-slate-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Jobs Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="p-16 text-center text-slate-400 text-sm space-y-3">
            <div className="inline-block animate-spin rounded-full h-7 w-7 border-2 border-indigo-600 border-t-transparent"></div>
            <div>Retrieving batch jobs...</div>
          </div>
        ) : jobs.length === 0 ? (
          <div className="p-16 text-center space-y-3">
            <Layers className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">No jobs match your filter</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {search
                ? `No batches matching "${search}". Try searching another keyword.`
                : 'There are currently no batch jobs matching the selected criteria.'}
            </p>
            {search && (
              <button
                type="button"
                onClick={() => {
                  setSearch('');
                  setStatusFilter('all');
                }}
                className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
              >
                Reset Filters
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/80 text-slate-500 text-xs uppercase font-bold tracking-wider border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4">Course / Program</th>
                  <th className="px-6 py-4">Organization</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Progress</th>
                  <th className="px-6 py-4">Recipients</th>
                  <th className="px-6 py-4">Submitted</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {jobs.map((job) => (
                  <tr key={job.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-6 py-4">
                      <Link
                        to={`/jobs/${job.id}`}
                        className="font-bold text-slate-900 group-hover:text-indigo-600 block max-w-sm truncate transition-colors"
                      >
                        {job.course_name}
                      </Link>
                      <span className="text-[11px] text-slate-400 block font-mono">
                        UUID: {job.id}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs font-medium text-slate-600">
                      <div className="flex items-center gap-1.5 truncate max-w-xs">
                        <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{job.organization}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={job.status} />
                    </td>
                    <td className="px-6 py-4">
                      <div className="w-32 space-y-1">
                        <div className="flex justify-between text-xs text-slate-500 font-mono">
                          <span>{job.progress_percentage}%</span>
                          <span className="text-[10px] text-slate-400">{job.success_count}/{job.total_count}</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden shadow-inner">
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
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>
                          {new Date(job.created_at).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <Link
                        to={`/jobs/${job.id}`}
                        className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors shadow-2xs"
                      >
                        Inspect
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {jobsData && totalPages > 1 && (
          <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
            <div>
              Showing page <span className="font-bold text-slate-700">{page}</span> of{' '}
              <span className="font-bold text-slate-700">{totalPages}</span> ({total} total batches)
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page <= 1}
                className="px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white font-bold text-slate-700 disabled:opacity-40 disabled:hover:bg-white hover:bg-slate-50 transition-colors shadow-2xs"
              >
                Previous
              </button>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                disabled={page >= totalPages}
                className="px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white font-bold text-slate-700 disabled:opacity-40 disabled:hover:bg-white hover:bg-slate-50 transition-colors shadow-2xs"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
