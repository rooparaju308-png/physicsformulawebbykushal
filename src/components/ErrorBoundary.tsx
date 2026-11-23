import React from 'react';
import { AlertTriangle, RotateCw } from 'lucide-react';

interface ErrorBoundaryState {
  hasError: boolean;
  message: string;
  details?: string;
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    let message = error.message || 'An unexpected error occurred.';
    let details: string | undefined;

    try {
      const parsed = JSON.parse(error.message) as {
        error?: string;
        operationType?: string;
        path?: string;
      };
      if (parsed && parsed.error) {
        message = parsed.error;
        details = `Operation: ${parsed.operationType ?? 'unknown'} · Path: ${parsed.path ?? 'n/a'}`;
      }
    } catch {
      // Non-JSON error
    }

    return { hasError: true, message, details };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo): void {
    console.error('App ErrorBoundary caught error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-dvh bg-slate-50 dark:bg-[#060913] text-slate-900 dark:text-slate-100 flex items-center justify-center p-4">
          <div className="max-w-md w-full rounded-2xl border border-rose-500/35 bg-white dark:bg-slate-900 p-6 space-y-4 shadow-xl">
            <div className="flex items-center gap-3 text-rose-500">
              <AlertTriangle className="h-6 w-6 shrink-0" />
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Something went wrong
              </h2>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed break-words">
              {this.state.message}
            </p>
            {this.state.details && (
              <div className="rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-3 py-2 text-[11px] font-mono text-slate-500 dark:text-slate-400 break-all">
                {this.state.details}
              </div>
            )}
            <p className="text-[11px] text-emerald-600 dark:text-emerald-300">
              Your local and synced JEE study progress remains safely preserved.
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="w-full min-h-[44px] rounded-xl bg-cyan-500 text-slate-950 text-xs font-bold inline-flex items-center justify-center gap-2 hover:bg-cyan-400 transition-colors"
            >
              <RotateCw className="h-4 w-4" />
              <span>Reload App</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
