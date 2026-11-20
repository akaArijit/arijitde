'use client';

import { Loader2 } from 'lucide-react';

interface DashboardStageLoaderProps {
  statusMsg?: string;
}

export function DashboardStageLoader({ statusMsg }: DashboardStageLoaderProps) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center max-w-sm">
      <Loader2 className="w-10 h-10 text-primary animate-spin stroke-[1.5] mb-6" />
      <h3 className="text-lg font-medium text-neutral-900">
        Please Wait
      </h3>
      <p className="text-neutral-500 text-xs font-sans mt-2 leading-relaxed">
        {statusMsg ||
          'We are querying database clusters to build your investment cockpit.'}
      </p>
    </div>
  );
}