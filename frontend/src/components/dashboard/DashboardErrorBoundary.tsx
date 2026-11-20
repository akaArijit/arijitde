'use client';

interface DashboardErrorBoundaryProps {
  error: string | null;
  onDismiss: () => void;
}

export function DashboardErrorBoundary({ error, onDismiss }: DashboardErrorBoundaryProps) {
  if (!error) return null;

  return (
    <div className="w-full max-w-md mb-8 p-4 bg-red-500/10 border border-red-500/20 text-red-600 rounded-2xl text-xs flex gap-3 items-start text-left font-sans animate-in fade-in slide-in-from-top-4">
      <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
      <div className="flex-1">
        <span className="font-semibold block mb-0.5">
          Operation failed
        </span>
        <span>{error}</span>
      </div>
      <button
        onClick={onDismiss}
        className="text-red-600 hover:text-neutral-900 font-bold ml-2"
      >
        ×
      </button>
    </div>
  );
}