import React, { useState } from 'react';
import { ClipboardCheck, Cloud, Download, LogOut, RotateCcw, ShieldCheck, Upload, Users } from 'lucide-react';
import { AccentPalette, AppSettings, AppTab, ThemeMode } from '../types/physics';
import { PWAInstallButton } from '../components/PWAInstallButton';
import { useFirebase } from '../contexts/FirebaseContext';

interface SettingsPageProps {
  settings: AppSettings;
  onUpdateSettings: (patch: Partial<AppSettings>) => void;
  onExportJson: () => string;
  onImportJson: (text: string) => boolean;
  onResetAll: () => void;
  onNavigate: (tab: AppTab) => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  settings,
  onUpdateSettings,
  onExportJson,
  onImportJson,
  onResetAll,
  onNavigate,
}) => {
  const {
    user,
    profile,
    actionLoading,
    syncStatus,
    joinAsGuest,
    signInWithGmail,
    upgradeGuestToGmail,
    signOutKeepData,
  } = useFirebase();
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);

  const handleDownloadJson = () => {
    const data = onExportJson();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `jee-physics-web-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setStatusMsg('Progress JSON exported.');
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const ok = onImportJson(String(reader.result || ''));
      setStatusMsg(ok ? 'Progress restored from JSON backup.' : 'Invalid JSON backup file.');
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-4 max-w-3xl mx-auto">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
          Settings & Backup
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Customize theme, accent colors, font scale, offline installation, and JSON backup.
        </p>
      </div>

      {/* Account & Non-Erasing Cloud Sync */}
      <section className="rounded-2xl border border-cyan-500/35 bg-white/90 dark:bg-slate-900/75 p-5 space-y-3">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <Cloud className="h-4 w-4 text-cyan-500" />
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Cloud Sync &amp; Account (Non-Erasing)
            </h3>
          </div>
          <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-300">
            {user
              ? syncStatus === 'syncing'
                ? 'Syncing...'
                : 'Local + Cloud Merged & Preserved'
              : 'Local Storage Active'}
          </span>
        </div>

        {user && profile ? (
          <div className="space-y-3">
            <div className="rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div>
                <div className="font-bold text-slate-900 dark:text-slate-100">
                  {profile.displayName}{' '}
                  <span className="font-mono text-cyan-600 dark:text-cyan-300">
                    ({profile.guestCode})
                  </span>
                </div>
                <div className="text-slate-500 dark:text-slate-400">
                  {profile.authType === 'gmail'
                    ? `Gmail linked (${user.email || 'verified'}) — cloud backup never erased on sign-out`
                    : 'Guest ID session active — link Gmail anytime to permanently back up across devices'}
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {profile.authType === 'guest' && (
                  <button
                    type="button"
                    disabled={actionLoading}
                    onClick={upgradeGuestToGmail}
                    className="min-h-[38px] px-3 rounded-lg bg-gradient-to-r from-violet-500 to-cyan-500 text-slate-950 font-bold inline-flex items-center gap-1.5"
                  >
                    <ShieldCheck className="h-3.5 w-3.5" />
                    <span>Link Gmail</span>
                  </button>
                )}
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={signOutKeepData}
                  className="min-h-[38px] px-3 rounded-lg border border-slate-300 dark:border-slate-700 font-semibold inline-flex items-center gap-1.5"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-2.5">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Sign in with a no-account Guest ID or your Gmail account. Local progress and existing Gmail cloud backups are merged automatically and never erased.
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                disabled={actionLoading}
                onClick={() => joinAsGuest()}
                className="min-h-[42px] px-4 rounded-xl bg-cyan-500 text-slate-950 text-xs font-bold inline-flex items-center gap-1.5"
              >
                <Users className="h-4 w-4" />
                <span>Join with Guest ID</span>
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={signInWithGmail}
                className="min-h-[42px] px-4 rounded-xl bg-violet-500 text-white text-xs font-bold inline-flex items-center gap-1.5"
              >
                <ShieldCheck className="h-4 w-4" />
                <span>Sign In with Gmail</span>
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Appearance */}
      <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/85 dark:bg-slate-900/65 p-5 space-y-4">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Appearance</h3>

        <div className="space-y-2">
          <div className="text-xs text-slate-500 dark:text-slate-400">Theme Mode</div>
          <div className="grid grid-cols-3 gap-2">
            {(['dark', 'light', 'auto'] as ThemeMode[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => onUpdateSettings({ theme: t })}
                className={`min-h-[44px] rounded-xl text-xs font-semibold capitalize border transition-colors ${
                  settings.theme === t
                    ? 'border-cyan-400 bg-cyan-500/15 text-cyan-700 dark:text-cyan-200'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-xs text-slate-500 dark:text-slate-400">Accent Palette</div>
          <div className="grid grid-cols-3 gap-2">
            {(
              [
                { id: 'cyan-violet', label: 'Cyan · Violet' },
                { id: 'emerald-teal', label: 'Emerald · Teal' },
                { id: 'amber-rose', label: 'Amber · Rose' },
              ] as { id: AccentPalette; label: string }[]
            ).map((acc) => (
              <button
                key={acc.id}
                type="button"
                onClick={() => onUpdateSettings({ accent: acc.id })}
                className={`min-h-[44px] rounded-xl text-xs font-semibold border transition-colors ${
                  settings.accent === acc.id
                    ? 'border-cyan-400 bg-cyan-500/15 text-cyan-700 dark:text-cyan-200'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                {acc.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-xs text-slate-500 dark:text-slate-400">Typography Scale</div>
          <div className="grid grid-cols-3 gap-2">
            {(
              [
                { id: 'sm', label: 'Compact' },
                { id: 'md', label: 'Standard' },
                { id: 'lg', label: 'Large' },
              ] as const
            ).map((fs) => (
              <button
                key={fs.id}
                type="button"
                onClick={() => onUpdateSettings({ fontSize: fs.id })}
                className={`min-h-[44px] rounded-xl text-xs font-semibold border transition-colors ${
                  settings.fontSize === fs.id
                    ? 'border-cyan-400 bg-cyan-500/15 text-cyan-700 dark:text-cyan-200'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                {fs.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Study Target */}
      <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/85 dark:bg-slate-900/65 p-5 space-y-3">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Exam & Daily Goal</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div>
            <label className="block text-slate-500 dark:text-slate-400 mb-1">JEE Main Exam Date</label>
            <input
              type="date"
              value={settings.examDate}
              onChange={(e) => onUpdateSettings({ examDate: e.target.value, examDateConfigured: true })}
              className="w-full min-h-[44px] rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 px-3 text-slate-900 dark:text-slate-100"
            />
          </div>
          <div>
            <label className="block text-slate-500 dark:text-slate-400 mb-1">Daily Study Goal (minutes)</label>
            <input
              type="number"
              min={15}
              max={600}
              step={15}
              value={settings.dailyGoalMinutes}
              onChange={(e) => onUpdateSettings({ dailyGoalMinutes: Math.max(15, Number(e.target.value)) })}
              className="w-full min-h-[44px] rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 px-3 text-slate-900 dark:text-slate-100 tabular-nums"
            />
          </div>
        </div>
      </section>

      {/* PWA Install & Offline Data */}
      <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/85 dark:bg-slate-900/65 p-5 space-y-3">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
          Offline PWA & Progress Data
        </h3>
        <div className="flex flex-wrap items-center gap-2.5">
          <PWAInstallButton />

          <button
            type="button"
            onClick={handleDownloadJson}
            className="min-h-[44px] px-4 rounded-xl border border-cyan-500/35 bg-cyan-500/10 text-cyan-700 dark:text-cyan-200 text-xs font-semibold inline-flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            <span>Export JSON</span>
          </button>

          <label className="min-h-[44px] px-4 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold inline-flex items-center gap-2 cursor-pointer">
            <Upload className="h-4 w-4" />
            <span>Import JSON</span>
            <input type="file" accept=".json,application/json" onChange={handleImportFile} className="hidden" />
          </label>

          {!confirmReset ? (
            <button
              type="button"
              onClick={() => setConfirmReset(true)}
              className="min-h-[44px] px-4 rounded-xl border border-rose-500/35 text-rose-600 dark:text-rose-300 text-xs font-semibold inline-flex items-center gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Reset Progress</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  onResetAll();
                  setConfirmReset(false);
                  setStatusMsg('All progress reset to defaults.');
                }}
                className="min-h-[44px] px-4 rounded-xl bg-rose-500 text-white text-xs font-semibold"
              >
                Confirm Reset
              </button>
              <button
                type="button"
                onClick={() => setConfirmReset(false)}
                className="min-h-[44px] px-3 rounded-xl border border-slate-300 dark:border-slate-700 text-xs"
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        {statusMsg && (
          <div className="text-xs font-medium text-emerald-600 dark:text-emerald-300">{statusMsg}</div>
        )}
      </section>

      {/* Formula Completeness Audit Access */}
      <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/85 dark:bg-slate-900/65 p-4 flex items-center justify-between gap-3">
        <div>
          <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Formula Completeness Audit
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Verify chapter formula counts, graph coverage & link integrity against Part A.
          </div>
        </div>
        <button
          type="button"
          onClick={() => onNavigate('audit')}
          className="min-h-[44px] px-4 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 inline-flex items-center gap-1.5 whitespace-nowrap"
        >
          <ClipboardCheck className="h-4 w-4" />
          <span>Open Audit</span>
        </button>
      </section>
    </div>
  );
};
