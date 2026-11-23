import React, { useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { MathBlock } from './MathBlock';

interface ComparisonSheetProps {
  onJumpToFormula: (formulaId: string) => void;
}

type PairId = 'spheres' | 'cylinders' | 'dipoles' | 'circuits';

interface ComparisonRow {
  quantity: string;
  leftLatex: string;
  rightLatex: string;
  midLatex?: string;
  leftFormulaId?: string;
  rightFormulaId?: string;
  trapNote?: string;
}

interface ComparisonPair {
  id: PairId;
  title: string;
  subtitle: string;
  headers: string[];
  rows: ComparisonRow[];
}

const PAIRS: ComparisonPair[] = [
  {
    id: 'spheres',
    title: '1. Hollow / Conducting Sphere vs. Solid Non-Conducting Sphere',
    subtitle: 'Unified k-notation comparison across outside, inside, center, ΔV, and self-energy (Radius R, Charge Q)',
    headers: ['Quantity', 'Hollow / Conducting Sphere', 'Solid Non-Conducting Sphere'],
    rows: [
      {
        quantity: 'Electric Field Outside (r ≥ R)',
        leftLatex: String.raw`E_{\text{out}} = \frac{kQ}{r^2}`,
        rightLatex: String.raw`E_{\text{out}} = \frac{kQ}{r^2}`,
        leftFormulaId: 'elec-shell',
        rightFormulaId: 'elec-solid-sphere',
      },
      {
        quantity: 'Electric Field Inside (r < R)',
        leftLatex: String.raw`E_{\text{in}} = 0`,
        rightLatex: String.raw`E_{\text{in}} = \frac{kQr}{R^3} = \frac{4\pi k\rho r}{3} = \frac{\rho r}{3\varepsilon_0}`,
        leftFormulaId: 'elec-shell',
        rightFormulaId: 'elec-solid-sphere',
        trapNote: 'Hollow has zero internal field; Solid grows linearly E ∝ r.',
      },
      {
        quantity: 'Potential Outside (r ≥ R)',
        leftLatex: String.raw`V_{\text{out}} = \frac{kQ}{r}`,
        rightLatex: String.raw`V_{\text{out}} = \frac{kQ}{r}`,
      },
      {
        quantity: 'Potential Inside (r ≤ R)',
        leftLatex: String.raw`V_{\text{in}} = \frac{kQ}{R} = V_{\text{surface}}\ (\text{const})`,
        rightLatex: String.raw`V_{\text{in}} = \frac{kQ}{2R^3}(3R^2 - r^2)`,
        leftFormulaId: 'elec-shell',
        rightFormulaId: 'elec-solid-sphere',
      },
      {
        quantity: 'Potential at Center (r = 0)',
        leftLatex: String.raw`V_{\text{center}} = \frac{kQ}{R}`,
        rightLatex: String.raw`V_{\text{center}} = \frac{3kQ}{2R} = 1.5\,V_{\text{surface}}`,
        trapNote: 'Solid sphere center is 1.5× higher than surface potential.',
      },
      {
        quantity: 'ΔV (Center − Surface)',
        leftLatex: String.raw`V_{\text{center}} - V_{\text{surface}} = 0`,
        rightLatex: String.raw`V_{\text{center}} - V_{\text{surface}} = \frac{kQ}{2R}`,
        rightFormulaId: 'elec-sphere-dv',
      },
      {
        quantity: 'ΔV Inside Points (r₁, r₂ ≤ R)',
        leftLatex: String.raw`V(r_1) - V(r_2) = 0`,
        rightLatex: String.raw`V(r_1) - V(r_2) = \frac{kQ}{2R^3}(r_2^2 - r_1^2)`,
        rightFormulaId: 'elec-sphere-dv',
      },
      {
        quantity: 'Electrostatic Self-Energy',
        leftLatex: String.raw`U = \frac{kQ^2}{2R}`,
        rightLatex: String.raw`U = \frac{3kQ^2}{5R}`,
        leftFormulaId: 'elec-self-energy',
        rightFormulaId: 'elec-self-energy',
      },
    ],
  },
  {
    id: 'cylinders',
    title: '2. Hollow Pipe vs. Solid Cylinder (Charge λ, ρ & Current I, J)',
    subtitle: 'Radial E, B, logarithmic ΔV outside, quadratic ΔV inside, and off-axis cavity fields',
    headers: ['Quantity', 'Hollow Cylinder / Pipe', 'Solid Cylinder (λ = ρπR², I = JπR²)'],
    rows: [
      {
        quantity: 'Electric Field Outside (r ≥ R)',
        leftLatex: String.raw`E_{\text{out}} = \frac{2k\lambda}{r}`,
        rightLatex: String.raw`E_{\text{out}} = \frac{2k\lambda}{r} = \frac{2\pi k\rho R^2}{r}`,
        leftFormulaId: 'elec-cylinder-dist',
        rightFormulaId: 'elec-cylinder-dist',
      },
      {
        quantity: 'Electric Field Inside (r < R)',
        leftLatex: String.raw`E_{\text{in}} = 0`,
        rightLatex: String.raw`E_{\text{in}} = \frac{2k\lambda r}{R^2} = 2\pi k\rho r = \frac{\rho r}{2\varepsilon_0}`,
        trapNote: 'Solid cylinder internal E scales linearly with r (same radial form as solid sphere except factor 1/2 vs 1/3).',
      },
      {
        quantity: 'Magnetic Field Outside (r ≥ R)',
        leftLatex: String.raw`B_{\text{out}} = \frac{2k' I}{r}`,
        rightLatex: String.raw`B_{\text{out}} = \frac{2k' I}{r} = \frac{2\pi k' J R^2}{r}`,
        leftFormulaId: 'mag-hollow-solid-cylinder',
        rightFormulaId: 'mag-thick-wire',
      },
      {
        quantity: 'Magnetic Field Inside (r < R)',
        leftLatex: String.raw`B_{\text{in}} = 0`,
        rightLatex: String.raw`B_{\text{in}} = \frac{2k' I r}{R^2} = 2\pi k' J r = \frac{\mu_0 J r}{2}`,
        leftFormulaId: 'mag-hollow-solid-cylinder',
        rightFormulaId: 'mag-thick-wire',
      },
      {
        quantity: 'ΔV Outside (r₁, r₂ ≥ R)',
        leftLatex: String.raw`V(r_1)-V(r_2) = 2k\lambda\ln\!\left(\frac{r_2}{r_1}\right)`,
        rightLatex: String.raw`V(r_1)-V(r_2) = 2k\lambda\ln\!\left(\frac{r_2}{r_1}\right)`,
        leftFormulaId: 'lar-wire-infinite-dv',
      },
      {
        quantity: 'ΔV Inside (r₁, r₂ ≤ R)',
        leftLatex: String.raw`V(r_1)-V(r_2) = 0`,
        rightLatex: String.raw`\frac{k\lambda}{R^2}(r_2^2 - r_1^2) = \pi k\rho(r_2^2 - r_1^2)`,
        rightFormulaId: 'elec-cylinder-dist',
      },
      {
        quantity: 'ΔV (Axis r=0 to Surface r=R)',
        leftLatex: String.raw`V_{\text{axis}} - V_{\text{surface}} = 0`,
        rightLatex: String.raw`V_{\text{axis}} - V_{\text{surface}} = k\lambda = \frac{\lambda}{4\pi\varepsilon_0}`,
      },
      {
        quantity: 'Off-Axis Cavity Field (a = O₁O₂)',
        leftLatex: String.raw`\text{N/A (empty hollow inside)}`,
        rightLatex: String.raw`\mathbf{E}_{\text{cav}} = 2\pi k\rho\mathbf{a};\quad \mathbf{B}_{\text{cav}} = 2\pi k'(\mathbf{J}\times\mathbf{a})`,
        rightFormulaId: 'mag-cavity-cylinder',
        trapNote: 'Electrostatic E_cavity is along a; Magnetic B_cavity is perpendicular to both J and a!',
      },
    ],
  },
  {
    id: 'dipoles',
    title: '3. Electric Dipole (p = qd) vs. Magnetic Dipole (M = NIA)',
    subtitle: 'Complete unified k-notation duality between k_e = 1/(4πε₀) and k_m = μ₀/(4π)',
    headers: ['Property', 'Electric Dipole (k = 1/4πε₀)', 'Magnetic Dipole (k′ = μ₀/4π)'],
    rows: [
      {
        quantity: 'Axial Field (θ = 0°)',
        leftLatex: String.raw`\mathbf{E}_{\text{axial}} = \frac{2k\mathbf{p}}{r^3}`,
        rightLatex: String.raw`\mathbf{B}_{\text{axial}} = \frac{2k'\mathbf{M}}{r^3}`,
        leftFormulaId: 'elec-dipole-axial',
        rightFormulaId: 'mag-bar-magnet',
      },
      {
        quantity: 'Equatorial Field (θ = 90°)',
        leftLatex: String.raw`\mathbf{E}_{\text{eq}} = -\frac{k\mathbf{p}}{r^3}`,
        rightLatex: String.raw`\mathbf{B}_{\text{eq}} = -\frac{k'\mathbf{M}}{r^3}`,
        leftFormulaId: 'elec-dipole-equatorial',
      },
      {
        quantity: 'General Point (r, θ) Field',
        leftLatex: String.raw`E = \frac{kp}{r^3}\sqrt{1+3\cos^2\theta}\ (\tan\alpha=\tfrac{1}{2}\tan\theta)`,
        rightLatex: String.raw`B = \frac{k'M}{r^3}\sqrt{1+3\cos^2\theta}\ (\tan\alpha=\tfrac{1}{2}\tan\theta)`,
        leftFormulaId: 'elec-dipole-general',
        rightFormulaId: 'mag-bar-magnet',
      },
      {
        quantity: 'Potential at (r, θ)',
        leftLatex: String.raw`V_e = \frac{kp\cos\theta}{r^2} = \frac{k(\mathbf{p}\cdot\mathbf{r})}{r^3}\ (V_{\text{eq}}=0)`,
        rightLatex: String.raw`V_m = \frac{k'M\cos\theta}{r^2} = \frac{k'(\mathbf{M}\cdot\mathbf{r})}{r^3}\ (V_{\text{eq}}=0)`,
        leftFormulaId: 'elec-dipole-general',
      },
      {
        quantity: 'Torque in Uniform Field',
        leftLatex: String.raw`\boldsymbol{\tau}_e = \mathbf{p}\times\mathbf{E}\ (pE\sin\theta)`,
        rightLatex: String.raw`\boldsymbol{\tau}_B = \mathbf{M}\times\mathbf{B}\ (MB\sin\theta)`,
        leftFormulaId: 'elec-dipole-torque-u',
        rightFormulaId: 'mag-loop-torque',
        trapNote: 'θ is angle with dipole vector / area normal, NOT with the coil plane!',
      },
      {
        quantity: 'Potential Energy & Work (θ₁ → θ₂)',
        leftLatex: String.raw`U_e = -pE\cos\theta,\quad W = pE(\cos\theta_1 - \cos\theta_2)`,
        rightLatex: String.raw`U_B = -MB\cos\theta,\quad W = MB(\cos\theta_1 - \cos\theta_2)`,
        leftFormulaId: 'elec-dipole-work-osc',
        rightFormulaId: 'mag-dipole-torque',
      },
      {
        quantity: 'Non-Uniform & Coaxial Dipole Force',
        leftLatex: String.raw`F_x = p\frac{dE}{dx},\quad F_{\text{coax}} = \frac{6kp_1p_2}{r^4}`,
        rightLatex: String.raw`F_x = M\frac{dB}{dx},\quad F_{\text{coax}} = \frac{6k'M_1M_2}{r^4}`,
        leftFormulaId: 'elec-dipole-nonuniform',
        rightFormulaId: 'mag-bar-magnet',
      },
    ],
  },
  {
    id: 'circuits',
    title: '4. RC vs. LR vs. Series RLC Circuits',
    subtitle: 'Transient switching limits (t = 0⁺ vs t → ∞) alongside steady-state AC impedance & resonance',
    headers: ['Property', 'RC (DC Transient)', 'LR (DC Transient)', 'Series RLC (AC)'],
    rows: [
      {
        quantity: 'Time Constant / Angular Freq',
        leftLatex: String.raw`\tau_{\text{RC}} = RC`,
        midLatex: String.raw`\tau_{\text{LR}} = \frac{L}{R}`,
        rightLatex: String.raw`\omega_0 = \frac{1}{\sqrt{LC}},\quad Q = \frac{1}{R}\sqrt{\frac{L}{C}}`,
        leftFormulaId: 'map-rule-transient',
        rightFormulaId: 'ac-resonance',
      },
      {
        quantity: 'Universal Evolution Law',
        leftLatex: String.raw`q(t) = q_\infty + (q_0-q_\infty)e^{-t/RC}`,
        midLatex: String.raw`I(t) = I_\infty + (I_0-I_\infty)e^{-Rt/L}`,
        rightLatex: String.raw`I(t) = \frac{V_0}{Z}\sin(\omega t - \phi)`,
        leftFormulaId: 'curr-rc-general',
        rightFormulaId: 'ac-rlc-impedance',
      },
      {
        quantity: 'At Switching t = 0⁺ (Uncharged)',
        leftLatex: String.raw`C \to \text{Short Wire } (V_C = 0)`,
        midLatex: String.raw`L \to \text{Open Circuit } (I = 0)`,
        rightLatex: String.raw`X_L = \omega L,\quad X_C = \frac{1}{\omega C}`,
        trapNote: 'Capacitor resists ΔV (acts short at t=0⁺); Inductor resists ΔI (acts open at t=0⁺).',
      },
      {
        quantity: 'Steady State t → ∞ (DC)',
        leftLatex: String.raw`C \to \text{Open Circuit } (I_C = 0)`,
        midLatex: String.raw`L \to \text{Short Wire } (\Delta V_L = 0)`,
        rightLatex: String.raw`Z = \sqrt{R^2 + (X_L - X_C)^2}`,
      },
      {
        quantity: 'Stored Energy',
        leftLatex: String.raw`U_C = \frac{1}{2}CV^2 = \frac{Q^2}{2C}`,
        midLatex: String.raw`U_L = \frac{1}{2}LI^2`,
        rightLatex: String.raw`P_{\text{avg}} = V_{\text{rms}}I_{\text{rms}}\cos\phi`,
        leftFormulaId: 'elec-cap-energy',
        rightFormulaId: 'ac-power',
      },
      {
        quantity: 'Phase & Resonance / Power Factor',
        leftLatex: String.raw`L = 0:\ \tan\phi = -\frac{X_C}{R}`,
        midLatex: String.raw`C = \infty:\ \tan\phi = +\frac{X_L}{R}`,
        rightLatex: String.raw`\cos\phi = \frac{R}{Z}\ (=1\text{ at }\omega_0)`,
        rightFormulaId: 'map-rule-rlc-limits',
      },
    ],
  },
];

export const ComparisonSheet: React.FC<ComparisonSheetProps> = ({ onJumpToFormula }) => {
  const [selectedPair, setSelectedPair] = useState<PairId>('spheres');
  const [showTrapsOnly, setShowTrapsOnly] = useState(false);

  const pair = PAIRS.find((p) => p.id === selectedPair) ?? PAIRS[0];
  const visibleRows = showTrapsOnly ? pair.rows.filter((r) => Boolean(r.trapNote)) : pair.rows;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {PAIRS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setSelectedPair(p.id)}
              className={`min-h-[42px] px-3.5 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 border transition-colors ${
                selectedPair === p.id
                  ? 'border-cyan-400 bg-cyan-500/15 text-cyan-700 dark:text-cyan-200'
                  : 'border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/60 text-slate-600 dark:text-slate-300'
              }`}
            >
              {p.title.split(':')[0]}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setShowTrapsOnly((t) => !t)}
          className={`min-h-[40px] px-3 rounded-xl text-xs font-medium border whitespace-nowrap shrink-0 transition-colors ${
            showTrapsOnly
              ? 'border-amber-400 bg-amber-500/15 text-amber-700 dark:text-amber-300'
              : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300'
          }`}
        >
          {showTrapsOnly ? 'Showing Trap Rows Only' : 'Highlight Key Traps'}
        </button>
      </div>

      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/70 p-4 sm:p-5 space-y-3">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
            {pair.title}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">{pair.subtitle}</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[680px]">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300">
                {pair.headers.map((h) => (
                  <th key={h} className="py-2.5 px-3">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/70 dark:divide-slate-800/70 text-xs">
              {visibleRows.map((row) => (
                <tr key={row.quantity} className="align-top hover:bg-slate-50/80 dark:hover:bg-slate-950/50">
                  <td className="py-3 px-3 font-medium text-slate-800 dark:text-slate-200 w-48">
                    <div>{row.quantity}</div>
                    {row.trapNote && (
                      <div className="mt-1 text-[11px] font-normal text-amber-700 dark:text-amber-300">
                        Trap: {row.trapNote}
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-3 text-slate-900 dark:text-cyan-50">
                    <MathBlock latex={row.leftLatex} displayMode={false} />
                    {row.leftFormulaId && (
                      <button
                        type="button"
                        onClick={() => onJumpToFormula(row.leftFormulaId!)}
                        className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-medium text-cyan-600 dark:text-cyan-300 hover:underline"
                      >
                        <span>Inspect card</span>
                        <ArrowUpRight className="h-3 w-3" />
                      </button>
                    )}
                  </td>
                  {row.midLatex !== undefined && (
                    <td className="py-3 px-3 text-slate-900 dark:text-cyan-50">
                      <MathBlock latex={row.midLatex} displayMode={false} />
                    </td>
                  )}
                  <td className="py-3 px-3 text-slate-900 dark:text-cyan-50">
                    <MathBlock latex={row.rightLatex} displayMode={false} />
                    {row.rightFormulaId && (
                      <button
                        type="button"
                        onClick={() => onJumpToFormula(row.rightFormulaId!)}
                        className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-medium text-violet-600 dark:text-violet-300 hover:underline"
                      >
                        <span>Inspect card</span>
                        <ArrowUpRight className="h-3 w-3" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
