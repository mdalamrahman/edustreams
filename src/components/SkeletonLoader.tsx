import React from 'react';

interface SkeletonProps {
  className?: string;
}

export const SkeletonBox: React.FC<SkeletonProps> = ({ className = 'w-full h-6' }) => (
  <div 
    className={`bg-slate-800/70 animate-pulse rounded-xl border border-slate-700/30 ${className}`} 
    aria-hidden="true" 
  />
);

export const MetricCardSkeleton: React.FC = () => (
  <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3 animate-pulse" aria-hidden="true">
    <div className="flex items-center justify-between">
      <SkeletonBox className="w-24 h-4 rounded-md" />
      <SkeletonBox className="w-6 h-6 rounded-full" />
    </div>
    <SkeletonBox className="w-20 h-8 rounded-lg" />
    <SkeletonBox className="w-36 h-3 rounded-md" />
  </div>
);

export const CardSkeleton: React.FC = () => (
  <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4 animate-pulse" aria-hidden="true">
    <div className="flex items-center justify-between">
      <SkeletonBox className="w-32 h-6 rounded-full" />
      <SkeletonBox className="w-16 h-5 rounded-full" />
    </div>
    <SkeletonBox className="w-3/4 h-7 rounded-xl" />
    <SkeletonBox className="w-full h-12 rounded-xl" />
    <div className="pt-2 flex items-center justify-between">
      <SkeletonBox className="w-28 h-5 rounded-md" />
      <SkeletonBox className="w-24 h-9 rounded-xl" />
    </div>
  </div>
);

export const TableRowSkeleton: React.FC = () => (
  <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-900/50 border border-slate-800/50 animate-pulse" aria-hidden="true">
    <SkeletonBox className="w-8 h-8 rounded-lg shrink-0" />
    <div className="flex-1 space-y-2">
      <SkeletonBox className="w-1/2 h-4 rounded-md" />
      <SkeletonBox className="w-1/3 h-3 rounded-md" />
    </div>
    <SkeletonBox className="w-20 h-6 rounded-full shrink-0" />
    <SkeletonBox className="w-24 h-8 rounded-xl shrink-0" />
  </div>
);

export const VideoCardSkeleton: React.FC = () => (
  <div className="rounded-2xl bg-slate-900/80 border border-slate-800 overflow-hidden space-y-3 animate-pulse" aria-hidden="true">
    <div className="w-full aspect-video bg-slate-800 flex items-center justify-center">
      <div className="w-12 h-12 rounded-full border-2 border-slate-700 flex items-center justify-center">
        <div className="w-0 h-0 border-t-8 border-t-transparent border-l-12 border-l-slate-600 border-b-8 border-b-transparent ml-1" />
      </div>
    </div>
    <div className="p-4 space-y-2">
      <SkeletonBox className="w-3/4 h-5 rounded-md" />
      <SkeletonBox className="w-1/2 h-3.5 rounded-md" />
      <div className="flex items-center justify-between pt-2">
        <SkeletonBox className="w-20 h-4 rounded-md" />
        <SkeletonBox className="w-16 h-4 rounded-md" />
      </div>
    </div>
  </div>
);
