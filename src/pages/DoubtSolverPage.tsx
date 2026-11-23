import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  Calculator,
  FlaskConical,
  MessageSquarePlus,
  Network,
  Search,
  Sparkles,
  X,
} from 'lucide-react';
import { CALCULATOR_MAP } from '../data/calculators';
import { MathBlock } from '../components/MathBlock';
import { CommunityChannel, DoubtCommunityDraft, Formula } from '../types/physics';
import { solvePhysicsDoubt } from '../utils/doubtSolver';

interface DoubtSolverPageProps {
  onJumpToFormula: (formulaId: string) => void;
  onOpenLab: (labId: NonNullable<Formula['labId']>, formulaId: string) => void;
  onPostDoubtToCommunity: (draft: DoubtCommunityDraft) => void;
}

const SAMPLE_DOUBTS = [
  'Electron accelerated by 400 V find de broglie wavelength',
  'Photoelectric 300 nm work function 2.3 eV stopping potential',
  'Silvered lens f_L = 20 cm f_M = -10 cm',
  '4 uF 100V capacitor connected to 6 uF 20V heat loss',
  '25W 220V and 100W 220V bulbs in series',
  'Cube charge 8.85 uC at corner flux through one face',
  'Wire stretched to 3 times length find new resistance',
  'Rutherford gold Z=79 alpha 5.5 MeV closest approach',
  'Displacement method screen 100 cm lens shift 40 cm',
  'Travelling microscope mark 2.0 cm slab 3.0 cm top powder 5.0 cm',
  'Half deflection galvanometer R 4950 ohm shunt 50 ohm',
  'ke * 4e-6 / 0.2^2',
];

const CHANNEL_LABELS: Record<CommunityChannel, string> = {
  general: '#General',
  electromagnetism: '#Electromagnetism',
  'modern-physics': '#Modern Physics',
  optics: '#Ray & Wave Optics',
  semiconductors: '#Semiconductors',
};

export const DoubtSolverPage: React.FC<DoubtSolverPageProps> = ({
  onJumpToFormula,
  onOpenLab,
  onPostDoubtToCommunity,
}) => {
  const [query, setQuery] = useState('');
  const [openCalcId, setOpenCalcId] = useState<string | null>(null);
  const [calcValues, setCalcValues] = useState<Record<string, number>>({});

  const result = useMemo(() => solvePhysicsDoubt(query), [query]);

  const handleToggleCalc = (formulaId: string) => {
    if (openCalcId === formulaId) {
      setOpenCalcId(null);
      return;
    }
    const def = CALCULATOR_MAP[formulaId];
    if (!def) return;
    const defaults: Record<string, number> = {};
    for (const inp of def.inputs) defaults[inp.key] = inp.defaultVal;
    setCalcValues(defaults);
    setOpenCalcId(formulaId);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
            Instant Physics Doubt Solver
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            100% instant client-side JEE numerical &amp; formula engine (works offline &amp; on static hosting with zero external APIs) + 1-click Community Doubt post.
          </p>
        </div>
      </div>

      {/* Query Composer + Sample Chips */}
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/75 p-4 sm:p-5 space-y-3">
        <div className="relative">
          <Search className="h-4 w-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Paste a JEE question, numerical values (e.g. '400V electron de broglie'), or expression (e.g. '1240 / 310 - 2.1')..."
            aria-label="Enter your JEE Physics doubt or math expression"
            className="w-full min-h-[48px] rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 pl-10 pr-10 text-sm text-slate-900 dark:text-slate-100"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              aria-label="Clear query"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="space-y-1.5">
          <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
            Try instant solved doubts:
          </div>
          <div className="flex flex-wrap gap-1.5">
            {SAMPLE_DOUBTS.map((sample) => (
              <button
                key={sample}
                type="button"
                onClick={() => setQuery(sample)}
                className="min-h-[32px] px-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 hover:border-cyan-400 text-[11px] font-medium text-slate-700 dark:text-slate-300 text-left transition-colors"
              >
                {sample}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Direct Math Expression Output */}
      {result.mathResult && (
        <div className="rounded-2xl border border-cyan-500/35 bg-cyan-500/5 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="text-xs font-bold text-cyan-700 dark:text-cyan-300 flex items-center gap-1.5">
              <Calculator className="h-4 w-4" />
              <span>Physics Expression Result</span>
            </div>
            <div className="mt-1 font-mono text-xs text-slate-600 dark:text-slate-300">
              {result.mathResult.expression}
            </div>
          </div>
          <div className="font-mono text-xl font-bold text-slate-900 dark:text-cyan-100 tabular-nums">
            = {result.mathResult.formatted}
          </div>
        </div>
      )}

      {/* Step-by-Step Worked Numerical Solution */}
      {result.numerical && (
        <div className="rounded-3xl border border-emerald-500/35 bg-emerald-500/5 p-5 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-sm font-bold text-emerald-700 dark:text-emerald-300">
              <Sparkles className="h-4 w-4 shrink-0" />
              <span>Worked Solution · {result.numerical.title}</span>
            </div>
            <button
              type="button"
              onClick={() => onJumpToFormula(result.numerical!.formulaId)}
              className="min-h-[34px] px-3 rounded-xl border border-emerald-500/35 bg-white/80 dark:bg-slate-900 text-xs font-semibold text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/15 inline-flex items-center gap-1"
            >
              <Network className="h-3.5 w-3.5" />
              <span>View Proof in Web</span>
            </button>
          </div>

          <ol className="space-y-1.5 text-xs sm:text-sm text-slate-800 dark:text-slate-200 list-decimal list-inside tabular-nums">
            {result.numerical.steps.map((step, i) => (
              <li key={i} className="leading-relaxed">
                {step}
              </li>
            ))}
          </ol>

          <div className="rounded-xl border border-emerald-500/30 bg-white dark:bg-slate-900/90 px-4 py-2.5 flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Final Answer
            </span>
            <span className="font-mono text-sm sm:text-base font-bold text-emerald-700 dark:text-emerald-300 tabular-nums">
              {result.numerical.finalAnswer}
            </span>
          </div>

          {result.numerical.caveat && (
            <div className="text-xs text-amber-700 dark:text-amber-300 flex items-start gap-1.5">
              <AlertTriangle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
              <span>{result.numerical.caveat}</span>
            </div>
          )}
        </div>
      )}

      {/* 1-Click Post to Community Room Card */}
      {query.trim().length > 0 && (
        <div className="rounded-2xl border border-violet-500/35 bg-violet-500/5 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-0.5 min-w-0">
            <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">
              Have a photo of the full question or still unsure?
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Post directly to{' '}
              <strong className="text-violet-700 dark:text-violet-300">
                {CHANNEL_LABELS[result.suggestedChannel]}
              </strong>{' '}
              with your question pre-filled and optional formula tagged — just attach your photo and send!
            </p>
          </div>
          <button
            type="button"
            onClick={() =>
              onPostDoubtToCommunity({
                channel: result.suggestedChannel,
                text: result.draftText,
                formulaTag: result.suggestedFormulaTag,
              })
            }
            className="min-h-[42px] px-4 rounded-xl bg-violet-500 hover:bg-violet-400 text-white text-xs font-bold inline-flex items-center justify-center gap-2 shrink-0 transition-colors"
          >
            <MessageSquarePlus className="h-4 w-4" />
            <span>Post to {CHANNEL_LABELS[result.suggestedChannel]} →</span>
          </button>
        </div>
      )}

      {/* Matched Verified Formulas + Inline Calculators + Trap Alerts */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
            {query.trim()
              ? `Matched Verified Formulas (${result.matchedFormulas.length})`
              : 'High-Yield Starter Formulas'}
          </h3>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Open inline calculator or jump directly to the Formula Web
          </span>
        </div>

        {result.matchedFormulas.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 p-6 text-center space-y-2">
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              No exact keyword match in offline formula bank
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-lg mx-auto">
              Try simpler physics keywords (e.g. &ldquo;dipole&rdquo;, &ldquo;gauss cube&rdquo;, &ldquo;rlc impedance&rdquo;, &ldquo;brewster&rdquo;, &ldquo;zener&rdquo;), or post your question photo straight to the Community doubt room above.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {result.matchedFormulas.map(({ formula, chapterTitle, trap, hasCalculator }) => {
              const calcDef = hasCalculator ? CALCULATOR_MAP[formula.id] : undefined;
              const isCalcOpen = openCalcId === formula.id;
              return (
                <div
                  key={formula.id}
                  className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/75 p-4 sm:p-5 flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
                      <span className="font-semibold text-cyan-600 dark:text-cyan-300">
                        {chapterTitle} · {formula.subtopic}
                      </span>
                      <span className="tabular-nums">Weight {formula.jeeWeight}/3</span>
                    </div>

                    <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">
                      {formula.title}
                    </h4>

                    <div className="rounded-xl bg-slate-50 dark:bg-slate-950/75 border border-slate-200 dark:border-slate-800 p-3 overflow-x-auto">
                      <MathBlock latex={formula.latex} displayMode />
                    </div>

                    {formula.conditions.length > 0 && (
                      <ul className="space-y-1 text-xs text-slate-600 dark:text-slate-300 list-disc list-inside">
                        {formula.conditions.slice(0, 2).map((c, idx) => (
                          <li key={idx}>{c}</li>
                        ))}
                      </ul>
                    )}

                    {trap && (
                      <div className="rounded-xl border border-amber-500/35 bg-amber-500/5 p-3 text-xs space-y-1">
                        <div className="font-bold text-amber-700 dark:text-amber-300 flex items-center gap-1.5">
                          <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                          <span>JEE Trap: {trap.headline}</span>
                        </div>
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                          {trap.safeRule}
                        </p>
                      </div>
                    )}

                    {/* Inline Interactive Calculator */}
                    {isCalcOpen && calcDef && (
                      <div className="rounded-xl border border-cyan-500/35 bg-cyan-500/5 p-3 space-y-2.5">
                        <div className="text-xs font-bold text-cyan-700 dark:text-cyan-300">
                          {calcDef.title}
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          {calcDef.inputs.map((inp) => (
                            <label key={inp.key} className="space-y-0.5">
                              <span className="text-[11px] text-slate-600 dark:text-slate-300">
                                {inp.label} {inp.unit ? `(${inp.unit})` : ''}
                              </span>
                              <input
                                type="number"
                                step={inp.step ?? 'any'}
                                min={inp.min}
                                max={inp.max}
                                value={calcValues[inp.key] ?? inp.defaultVal}
                                onChange={(e) =>
                                  setCalcValues((prev) => ({
                                    ...prev,
                                    [inp.key]: Number(e.target.value) || 0,
                                  }))
                                }
                                className="w-full min-h-[34px] rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 tabular-nums text-slate-900 dark:text-slate-100"
                              />
                            </label>
                          ))}
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
                          {calcDef.compute(calcValues).map((out) => (
                            <div
                              key={out.label}
                              className="rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-2.5 py-1.5 flex items-center justify-between gap-2 text-xs"
                            >
                              <span className="text-slate-500 dark:text-slate-400 truncate">
                                {out.label}
                              </span>
                              <span className="font-mono font-bold text-cyan-700 dark:text-cyan-300 tabular-nums shrink-0">
                                {out.value} {out.unit}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Card Actions */}
                  <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-200/70 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => onJumpToFormula(formula.id)}
                      className="min-h-[36px] px-3 rounded-xl bg-cyan-500/15 border border-cyan-500/35 text-cyan-700 dark:text-cyan-300 text-xs font-semibold inline-flex items-center gap-1.5 hover:bg-cyan-500/25"
                    >
                      <span>Inspect in Web</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>

                    {calcDef && (
                      <button
                        type="button"
                        onClick={() => handleToggleCalc(formula.id)}
                        className={`min-h-[36px] px-3 rounded-xl border text-xs font-semibold inline-flex items-center gap-1.5 ${
                          isCalcOpen
                            ? 'border-violet-400 bg-violet-500/20 text-violet-700 dark:text-violet-200'
                            : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-violet-400'
                        }`}
                      >
                        <Calculator className="h-3.5 w-3.5" />
                        <span>{isCalcOpen ? 'Hide Calculator' : 'Plug Numbers'}</span>
                      </button>
                    )}

                    {formula.labId && (
                      <button
                        type="button"
                        onClick={() => onOpenLab(formula.labId!, formula.id)}
                        className="min-h-[36px] px-3 rounded-xl border border-emerald-500/35 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-xs font-semibold inline-flex items-center gap-1.5 hover:bg-emerald-500/20"
                      >
                        <FlaskConical className="h-3.5 w-3.5" />
                        <span>Open Sim</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Matched Short Notes Excerpts */}
      {result.matchedNotes.length > 0 && (
        <div className="space-y-2.5">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
            <BookOpen className="h-4 w-4 text-emerald-500" />
            <span>Related Short Note Shortcuts</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {result.matchedNotes.map((note, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/75 p-4 space-y-2"
              >
                <div className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-300">
                  {note.chapterTitle} · {note.unitTag}
                </div>
                <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  {note.item.label}
                </div>
                <div className="rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 p-2.5 overflow-x-auto">
                  <MathBlock latex={note.item.latex} displayMode={false} />
                </div>
                {note.item.formulaId && (
                  <button
                    type="button"
                    onClick={() => onJumpToFormula(note.item.formulaId!)}
                    className="text-[11px] font-semibold text-cyan-600 dark:text-cyan-300 hover:underline inline-flex items-center gap-1"
                  >
                    <span>Jump to node</span>
                    <ArrowRight className="h-3 w-3" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
