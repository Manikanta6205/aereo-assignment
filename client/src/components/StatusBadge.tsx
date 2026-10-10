import React from 'react';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const getStyles = () => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'success':
      case 'ready':
        return 'bg-emerald-50/80 text-emerald-800 border-emerald-200/90 shadow-2xs';
      case 'completed_with_errors':
        return 'bg-amber-50/80 text-amber-800 border-amber-200/90 shadow-2xs';
      case 'processing':
      case 'generating':
        return 'bg-indigo-50/80 text-indigo-800 border-indigo-200/90 shadow-2xs';
      case 'queued':
      case 'pending':
      case 'validating':
        return 'bg-sky-50/80 text-sky-800 border-sky-200/90 shadow-2xs';
      case 'failed':
      case 'invalid':
        return 'bg-rose-50/80 text-rose-800 border-rose-200/90 shadow-2xs';
      case 'cancelled':
        return 'bg-slate-100 text-slate-700 border-slate-300 shadow-2xs';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200 shadow-2xs';
    }
  };

  const isAnimated = ['processing', 'generating', 'validating', 'pending'].includes(status.toLowerCase());

  const label = status
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium border rounded-full transition-colors ${
        size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs'
      } ${getStyles()}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full shrink-0 ${
          isAnimated ? 'animate-pulse bg-current' : 'bg-current opacity-70'
        }`}
      />
      <span>{label}</span>
    </span>
  );
};
