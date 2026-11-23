import React, { useState } from 'react';
import { ExternalLink } from 'lucide-react';
import { GraphGroup } from '../types/physics';
import { getFormulaById } from '../data/formulas';
import { MathBlock } from './MathBlock';

interface InteractiveGraphCardProps {
  graph: GraphGroup;
  isFocused?: boolean;
  onJumpToFormula: (formulaId: string) => void;
}

export const InteractiveGraphCard: React.FC<InteractiveGraphCardProps> = ({
  graph,
  isFocused = false,
  onJumpToFormula,
}) => {
  const [sliderValues, setSliderValues] = useState<Record<string, number>>(() => {
    const init: Record<string, number> = {};
    for (const s of graph.sliders) init[s.id] = s.defaultValue;
    return init;
  });

  const [selectedCurveId, setSelectedCurveId] = useState<string>(graph.curves[0]?.id ?? '');
  const [tapPoint, setTapPoint] = useState<{ x: number; y: number; label: string } | null>(null);

  const selectedCurve = graph.curves.find((c) => c.id === selectedCurveId) ?? graph.curves[0];
  const linkedFormula = selectedCurve ? getFormulaById(selectedCurve.formulaId) : undefined;

  // Plot helper: domain [0, 1] -> SVG [38, 298], range [0, 1] -> SVG [150, 22]
  const buildPath = (fn: (u: number) => number, samples = 64) => {
    const pts: string[] = [];
    for (let i = 0; i <= samples; i++) {
      const u = i / samples;
      const val = Math.max(-0.15, Math.min(1.15, fn(u)));
      const px = 38 + u * 260;
      const py = 150 - val * 124;
      pts.push(`${i === 0 ? 'M' : 'L'} ${px.toFixed(1)} ${py.toFixed(1)}`);
    }
    return pts.join(' ');
  };

  // Compute curve paths for each of the 16 graph groups
  const renderCurves = (): { id: string; color: string; path: string; formulaId: string; label: string }[] => {
    const v = sliderValues;
    switch (graph.id) {
      case 'g1-e-vs-r': {
        const s = v.qScale ?? 1;
        return [
          {
            id: 'point',
            color: '#22d3ee',
            formulaId: 'elec-point-evu',
            label: 'Point (1/r²)',
            path: buildPath((u) => {
              const r = 0.25 + u * 2.75;
              return Math.min(1.05, (0.25 * s) / (r * r));
            }),
          },
          {
            id: 'line',
            color: '#38bdf8',
            formulaId: 'lar-wire-infinite',
            label: 'Line (1/r)',
            path: buildPath((u) => {
              const r = 0.25 + u * 2.75;
              return Math.min(1.05, (0.3 * s) / r);
            }),
          },
          {
            id: 'sheet',
            color: '#a855f7',
            formulaId: 'elec-gauss-sheet',
            label: 'Sheet (const)',
            path: buildPath(() => 0.45 * s),
          },
          {
            id: 'shell',
            color: '#f472b6',
            formulaId: 'elec-shell',
            label: 'Shell (0 inside)',
            path: buildPath((u) => {
              const r = u * 3;
              return r < 1 ? 0 : (0.85 * s) / (r * r);
            }),
          },
          {
            id: 'solid',
            color: '#34d399',
            formulaId: 'elec-solid-sphere',
            label: 'Solid Sphere (linear → 1/r²)',
            path: buildPath((u) => {
              const r = u * 3;
              return r <= 1 ? r * 0.85 * s : (0.85 * s) / (r * r);
            }),
          },
        ];
      }
      case 'g2-v-u-vs-r': {
        const sign = v.qSign ?? 1;
        return [
          {
            id: 'shellV',
            color: '#22d3ee',
            formulaId: 'elec-shell',
            label: 'Shell V',
            path: buildPath((u) => {
              const r = u * 3;
              return r <= 1 ? 0.65 : 0.65 / r;
            }),
          },
          {
            id: 'solidV',
            color: '#a855f7',
            formulaId: 'elec-solid-sphere',
            label: 'Solid Sphere V',
            path: buildPath((u) => {
              const r = u * 3;
              return r <= 1 ? 0.65 * (1.5 - 0.5 * r * r) : 0.65 / r;
            }),
          },
          {
            id: 'pointV',
            color: '#34d399',
            formulaId: 'elec-system-pe',
            label: 'Two-charge U(r)',
            path: buildPath((u) => {
              const r = 0.28 + u * 2.72;
              const raw = 0.35 / r;
              return sign >= 0 ? Math.min(1.02, raw) : Math.max(0.02, 0.5 - raw * 0.5);
            }),
          },
        ];
      }
      case 'g3-ring-disc-e': {
        const R = v.rRadius ?? 1;
        return [
          {
            id: 'ringE',
            color: '#22d3ee',
            formulaId: 'lar-ring-e-axis',
            label: 'Ring E (peak at R/√2)',
            path: buildPath((u) => {
              const x = (u - 0.5) * 5;
              const val = (x * R) / Math.pow(R * R + x * x, 1.5);
              return 0.5 + val * 1.15;
            }),
          },
          {
            id: 'discE',
            color: '#a855f7',
            formulaId: 'lar-disc-e',
            label: 'Disc E',
            path: buildPath((u) => {
              const x = (u - 0.5) * 5;
              const sign = x >= 0 ? 1 : -1;
              const mag = 1 - Math.abs(x) / Math.sqrt(x * x + R * R);
              return 0.5 + sign * mag * 0.44;
            }),
          },
        ];
      }
      case 'g4-dipole-theta': {
        const scale = (v.pE ?? 2) / 5;
        return [
          {
            id: 'dipoleV',
            color: '#22d3ee',
            formulaId: 'elec-dipole-general',
            label: 'V(θ) ∝ cosθ',
            path: buildPath((u) => 0.5 + 0.42 * Math.cos(u * 2 * Math.PI)),
          },
          {
            id: 'dipoleU',
            color: '#f472b6',
            formulaId: 'elec-dipole-torque-u',
            label: 'U(θ) = −pE cosθ',
            path: buildPath((u) => 0.5 - (0.3 + 0.35 * scale) * Math.cos(u * 2 * Math.PI)),
          },
        ];
      }
      case 'g5-capacitor': {
        const K = v.capK ?? 4;
        return [
          {
            id: 'vVsQ',
            color: '#22d3ee',
            formulaId: 'elec-cap-basic',
            label: 'V vs Q (linear)',
            path: buildPath((u) => u * 0.88),
          },
          {
            id: 'uVsQ',
            color: '#a855f7',
            formulaId: 'elec-cap-energy',
            label: 'U vs Q (parabola)',
            path: buildPath((u) => u * u * 0.92),
          },
          {
            id: 'cVsT',
            color: '#34d399',
            formulaId: 'elec-cap-dielectric',
            label: 'C/C₀ vs t/d',
            path: buildPath((u) => 1 / (K * (1 - u + u / K))),
          },
        ];
      }
      case 'g6-rc-transients': {
        return [
          {
            id: 'qCharge',
            color: '#22d3ee',
            formulaId: 'curr-rc-charging',
            label: 'Charging 1−e^(−t/τ)',
            path: buildPath((u) => 1 - Math.exp(-u * 5)),
          },
          {
            id: 'qDischarge',
            color: '#f472b6',
            formulaId: 'curr-rc-discharging',
            label: 'Discharging/I e^(−t/τ)',
            path: buildPath((u) => Math.exp(-u * 5)),
          },
        ];
      }
      case 'g7-iv-rt': {
        const a = v.alpha ?? 1;
        return [
          {
            id: 'ohmic',
            color: '#22d3ee',
            formulaId: 'curr-ohm-power',
            label: 'Ohmic I–V',
            path: buildPath((u) => u * 0.85),
          },
          {
            id: 'bulb',
            color: '#fbbf24',
            formulaId: 'curr-ohm-power',
            label: 'Bulb / Non-ohmic',
            path: buildPath((u) => Math.pow(u, 0.58) * 0.85),
          },
          {
            id: 'metalR',
            color: '#a855f7',
            formulaId: 'curr-temp',
            label: 'Metal R(T)',
            path: buildPath((u) => 0.25 + u * 0.38 * a),
          },
          {
            id: 'semiR',
            color: '#34d399',
            formulaId: 'curr-temp',
            label: 'Semiconductor R(T)',
            path: buildPath((u) => 0.9 * Math.exp(-u * 1.4 * a)),
          },
        ];
      }
      case 'g8-pot-cell': {
        const rInt = v.rInt ?? 2;
        return [
          {
            id: 'cellVI',
            color: '#22d3ee',
            formulaId: 'curr-cell-terminal',
            label: 'Cell V = ε − Ir',
            path: buildPath((u) => Math.max(0, 0.92 - u * 0.28 * rInt)),
          },
          {
            id: 'powerPR',
            color: '#a855f7',
            formulaId: 'curr-max-power',
            label: 'Power P vs R (peak at R=r)',
            path: buildPath((u) => {
              const rRatio = u * 4;
              return (4 * rRatio) / Math.pow(1 + rRatio, 2) * 0.92;
            }),
          },
          {
            id: 'potVL',
            color: '#34d399',
            formulaId: 'curr-potentiometer',
            label: 'Potentiometer V vs l',
            path: buildPath((u) => u * 0.85),
          },
        ];
      }
      case 'g9-mag-b': {
        const I = (v.currI ?? 5) / 10;
        return [
          {
            id: 'thickWire',
            color: '#22d3ee',
            formulaId: 'mag-thick-wire',
            label: 'Thick Wire B(r)',
            path: buildPath((u) => {
              const r = u * 3;
              return r <= 1 ? r * (0.55 + 0.4 * I) : (0.55 + 0.4 * I) / r;
            }),
          },
          {
            id: 'ringAxis',
            color: '#a855f7',
            formulaId: 'lar-ring-b-axis',
            label: 'Ring Axis B(x)',
            path: buildPath((u) => {
              const x = u * 2.5;
              return (0.55 + 0.35 * I) / Math.pow(1 + x * x, 1.5);
            }),
          },
          {
            id: 'solenoid',
            color: '#34d399',
            formulaId: 'mag-solenoid-toroid',
            label: 'Solenoid (½ at ends)',
            path: buildPath((u) => {
              const z = (u - 0.5) * 3;
              return (0.45 + 0.35 * I) * (1 / (1 + Math.exp(8 * (Math.abs(z) - 1))));
            }),
          },
        ];
      }
      case 'g10-motion-wires': {
        const B = v.bField ?? 1;
        return [
          {
            id: 'rVsV',
            color: '#22d3ee',
            formulaId: 'mag-circle',
            label: 'r vs v (linear)',
            path: buildPath((u) => Math.min(1, (u * 0.95) / B)),
          },
          {
            id: 'fVsD',
            color: '#f472b6',
            formulaId: 'mag-parallel-wires',
            label: 'Wire Force F/l vs d (1/d)',
            path: buildPath((u) => Math.min(1, 0.14 / (0.12 + u * 0.88))),
          },
        ];
      }
      case 'g11-torque-dip': {
        const s = v.mScale ?? 1;
        return [
          {
            id: 'torque',
            color: '#22d3ee',
            formulaId: 'mag-dipole-torque',
            label: 'τ = MB sinθ',
            path: buildPath((u) => 0.5 + 0.4 * Math.min(1.1, s) * Math.sin(u * 2 * Math.PI)),
          },
          {
            id: 'energy',
            color: '#a855f7',
            formulaId: 'mag-dipole-torque',
            label: 'U = −MB cosθ',
            path: buildPath((u) => 0.5 - 0.4 * Math.min(1.1, s) * Math.cos(u * 2 * Math.PI)),
          },
          {
            id: 'earthBH',
            color: '#34d399',
            formulaId: 'mag-earth',
            label: 'Earth B_H vs latitude',
            path: buildPath((u) => Math.cos(u * Math.PI * 0.5) * 0.85),
          },
        ];
      }
      case 'g12-magnetisation': {
        const w = v.coercivity ?? 0.5;
        // Build hysteresis loop manually in normalized coords
        const hystPts: string[] = [];
        for (let i = 0; i <= 40; i++) {
          const x = -1 + (i / 40) * 2; // -1..1
          const yTop = Math.tanh(2.5 * (x + w * 0.45));
          const px = 38 + ((x + 1) / 2) * 260;
          const py = 88 - yTop * 56;
          hystPts.push(`${i === 0 ? 'M' : 'L'} ${px.toFixed(1)} ${py.toFixed(1)}`);
        }
        for (let i = 40; i >= 0; i--) {
          const x = -1 + (i / 40) * 2;
          const yBot = Math.tanh(2.5 * (x - w * 0.45));
          const px = 38 + ((x + 1) / 2) * 260;
          const py = 88 - yBot * 56;
          hystPts.push(`L ${px.toFixed(1)} ${py.toFixed(1)}`);
        }
        hystPts.push('Z');
        return [
          {
            id: 'hysteresis',
            color: '#22d3ee',
            formulaId: 'mag-hysteresis',
            label: 'B–H Hysteresis Loop',
            path: hystPts.join(' '),
          },
          {
            id: 'curie',
            color: '#a855f7',
            formulaId: 'mag-materials',
            label: 'Curie χ = C/T',
            path: buildPath((u) => Math.min(1, 0.16 / (0.14 + u * 0.86))),
          },
          {
            id: 'diaB',
            color: '#f472b6',
            formulaId: 'mag-materials',
            label: 'Diamagnetic χ < 0',
            path: buildPath((u) => 0.5 - (u - 0.5) * 0.14),
          },
        ];
      }
      case 'g13-emi': {
        const om = v.omega ?? 2;
        return [
          {
            id: 'flux',
            color: '#22d3ee',
            formulaId: 'emi-faraday-lenz',
            label: 'Flux φ(t) = cosωt',
            path: buildPath((u) => 0.5 + 0.38 * Math.cos(u * om * Math.PI * 1.5)),
          },
          {
            id: 'emf',
            color: '#a855f7',
            formulaId: 'emi-motional',
            label: 'EMF ε(t) = sinωt',
            path: buildPath((u) => 0.5 + 0.42 * Math.sin(u * om * Math.PI * 1.5)),
          },
          {
            id: 'rodV',
            color: '#34d399',
            formulaId: 'emi-sliding-rod',
            label: 'Sliding Rod v → v_T',
            path: buildPath((u) => 1 - Math.exp(-u * 4.5)),
          },
        ];
      }
      case 'g14-lr-lc': {
        const damp = v.damping ?? 0;
        return [
          {
            id: 'lrGrowth',
            color: '#22d3ee',
            formulaId: 'emi-lr-circuit',
            label: 'LR Growth 1−e^(−t/τ)',
            path: buildPath((u) => 1 - Math.exp(-u * 5)),
          },
          {
            id: 'lcCharge',
            color: '#a855f7',
            formulaId: 'emi-lc-osc',
            label: 'LC / Damped q(t)',
            path: buildPath((u) => 0.5 + 0.42 * Math.exp(-u * damp * 2) * Math.cos(u * 4 * Math.PI)),
          },
          {
            id: 'lcEnergy',
            color: '#34d399',
            formulaId: 'emi-lc-osc',
            label: 'U_C vs q Parabola',
            path: buildPath((u) => Math.pow(2 * u - 1, 2) * 0.85),
          },
        ];
      }
      case 'g15-ac': {
        const Q = v.qVal ?? 2.5;
        return [
          {
            id: 'currentQ',
            color: '#22d3ee',
            formulaId: 'ac-q-factor',
            label: 'Current I(f) Q-curve',
            path: buildPath((u) => {
              const f = 0.2 + u * 2.0; // f/f0
              const z = Math.sqrt(1 + Q * Q * Math.pow(f - 1 / f, 2));
              return 0.92 / z;
            }),
          },
          {
            id: 'impedanceZ',
            color: '#a855f7',
            formulaId: 'ac-rlc-impedance',
            label: 'Z(f) V-curve',
            path: buildPath((u) => {
              const f = 0.2 + u * 2.0;
              const z = Math.sqrt(1 + 0.6 * Q * Math.pow(f - 1 / f, 2));
              return Math.min(1, z / 3.8);
            }),
          },
          {
            id: 'phasePhi',
            color: '#f472b6',
            formulaId: 'ac-resonance',
            label: 'Phase φ(f)',
            path: buildPath((u) => {
              const f = 0.2 + u * 2.0;
              const phi = Math.atan(Q * (f - 1 / f)); // -pi/2..pi/2
              return 0.5 + (phi / Math.PI) * 0.85;
            }),
          },
          {
            id: 'reactance',
            color: '#34d399',
            formulaId: 'ac-reactance',
            label: 'X_L (line) & X_C (1/f)',
            path: buildPath((u) => {
              const f = 0.2 + u * 2.0;
              return Math.min(1, f * 0.42);
            }),
          },
        ];
      }
      case 'g16-em-wave': {
        const ph = ((v.phaseShift ?? 0) * Math.PI) / 180;
        return [
          {
            id: 'eWave',
            color: '#22d3ee',
            formulaId: 'em-wave-eq',
            label: 'E-field sin(kx−ωt)',
            path: buildPath((u) => 0.5 + 0.42 * Math.sin(u * 4 * Math.PI - ph)),
          },
          {
            id: 'bWave',
            color: '#a855f7',
            formulaId: 'em-wave-eq',
            label: 'B-field (in phase)',
            path: buildPath((u) => 0.5 + 0.28 * Math.sin(u * 4 * Math.PI - ph)),
          },
          {
            id: 'spectrum',
            color: '#f472b6',
            formulaId: 'em-spectrum',
            label: 'Frequency ↑ Spectrum',
            path: buildPath((u) => 0.1 + 0.8 * Math.pow(u, 1.3)),
          },
        ];
      }
      case 'g17-photoelectric': {
        const phi = v.phiEv ?? 2.5;
        const inten = v.intensity ?? 1.0;
        const nuThresh = phi * 0.12;
        return [
          {
            id: 'v0VsNu',
            color: '#22d3ee',
            formulaId: 'mod-einstein-pe',
            label: 'V₀ vs ν (slope h/e)',
            path: buildPath((u) => Math.max(0, (u - nuThresh) * 1.15)),
          },
          {
            id: 'iVsVHigh',
            color: '#a855f7',
            formulaId: 'mod-einstein-pe',
            label: 'I vs V (High Intensity)',
            path: buildPath((u) => {
              const sat = Math.min(0.95, 0.45 * inten);
              return sat / (1 + Math.exp(-12 * (u - 0.28)));
            }),
          },
          {
            id: 'iVsVLow',
            color: '#34d399',
            formulaId: 'mod-einstein-pe',
            label: 'I vs V (Base Intensity)',
            path: buildPath((u) => {
              const sat = Math.min(0.65, 0.25 * inten);
              return sat / (1 + Math.exp(-12 * (u - 0.28)));
            }),
          },
        ];
      }
      case 'g18-be-curve': {
        const sc = v.scale ?? 1.0;
        return [
          {
            id: 'bePerA',
            color: '#38bdf8',
            formulaId: 'mod-binding-energy',
            label: 'BE/A vs A (peak ⁵⁶Fe)',
            path: buildPath((u) => {
              const A = 1 + u * 239;
              let be = 8.8 * (1 - Math.exp(-A / 13)) - 0.0065 * Math.max(0, A - 56);
              if (Math.abs(A - 4) < 3.5) be += 1.4;
              if (Math.abs(A - 12) < 4) be += 0.6;
              return Math.max(0.05, Math.min(0.96, (be / 9.4) * sc));
            }),
          },
        ];
      }
      case 'g19-prism-uv': {
        const n = v.refrIndex ?? 1.5;
        return [
          {
            id: 'prismDelta',
            color: '#fbbf24',
            formulaId: 'ray-prism',
            label: 'Prism δ vs i (U-curve)',
            path: buildPath((u) => {
              const x = u - 0.42;
              const base = (n - 1) * 0.65;
              const asym = x < 0 ? 1.75 * x * x : 0.95 * x * x;
              return Math.min(0.95, base + asym);
            }),
          },
          {
            id: 'uvLine',
            color: '#22d3ee',
            formulaId: 'ray-mirror-formula',
            label: 'Mirror 1/v vs 1/u',
            path: buildPath((u) => Math.max(0.04, 0.92 - u * 0.85)),
          },
        ];
      }
      case 'g20-ydse-diffraction':
      default: {
        const sr = v.slitRatio ?? 1.0;
        return [
          {
            id: 'ydseCos2',
            color: '#fb7185',
            formulaId: 'wave-superposition-intensity',
            label: 'YDSE cos² fringes',
            path: buildPath((u) => 0.86 * Math.pow(Math.cos((u - 0.5) * 4.5 * Math.PI * sr), 2)),
          },
          {
            id: 'singleSlit',
            color: '#22d3ee',
            formulaId: 'wave-single-slit',
            label: 'Single-Slit sinc²',
            path: buildPath((u) => {
              const beta = (u - 0.5) * 2.8 * Math.PI * sr;
              if (Math.abs(beta) < 1e-4) return 0.92;
              return 0.92 * Math.pow(Math.sin(beta) / beta, 2);
            }),
          },
          {
            id: 'malusCos2',
            color: '#a855f7',
            formulaId: 'wave-polarization',
            label: 'Malus cos²θ',
            path: buildPath((u) => 0.78 * Math.pow(Math.cos(u * Math.PI), 2)),
          },
        ];
      }
    }
  };

  const renderedCurves = renderCurves();

  return (
    <article
      id={`graph-${graph.id}`}
      className={`rounded-2xl border p-4 sm:p-5 transition-all backdrop-blur-md ${
        isFocused
          ? 'border-cyan-400 bg-cyan-950/25 shadow-[0_0_24px_rgba(34,211,238,0.16)]'
          : 'border-slate-200 dark:border-slate-800/80 bg-white/85 dark:bg-slate-900/65'
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
            {graph.title}
          </h3>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            {graph.subtitle}
          </p>
        </div>
      </div>

      {/* Interactive SVG Plot */}
      <div className="mt-3 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200/80 dark:border-slate-800 p-2">
        <svg
          viewBox="0 0 320 175"
          className="w-full max-h-[210px] cursor-crosshair select-none"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const relX = ((e.clientX - rect.left) / rect.width) * 320;
            const relY = ((e.clientY - rect.top) / rect.height) * 175;
            const u = Math.max(0, Math.min(1, (relX - 38) / 260));
            const yNorm = Math.max(0, Math.min(1, (150 - relY) / 124));
            setTapPoint({
              x: Math.max(38, Math.min(298, relX)),
              y: Math.max(22, Math.min(150, relY)),
              label: `x=${u.toFixed(2)}, y=${yNorm.toFixed(2)}`,
            });
          }}
        >
          {/* Grid lines */}
          {[50, 88, 120].map((gy) => (
            <line key={gy} x1="38" y1={gy} x2="298" y2={gy} stroke="#334155" strokeDasharray="3 4" strokeWidth="0.8" />
          ))}
          {/* Axes */}
          <line x1="38" y1="150" x2="302" y2="150" stroke="#64748b" strokeWidth="1.4" />
          <line x1="38" y1="18" x2="38" y2="154" stroke="#64748b" strokeWidth="1.4" />

          {/* Curves */}
          {renderedCurves.map((c) => {
            const isSel = c.id === selectedCurve?.id;
            return (
              <path
                key={c.id}
                d={c.path}
                fill={c.id === 'hysteresis' ? `${c.color}20` : 'none'}
                stroke={c.color}
                strokeWidth={isSel ? 3 : 1.7}
                opacity={isSel ? 1 : 0.65}
                className="cursor-pointer transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedCurveId(c.id);
                }}
              />
            );
          })}

          {tapPoint && (
            <g>
              <circle cx={tapPoint.x} cy={tapPoint.y} r="4.5" fill="#f8fafc" stroke="#22d3ee" strokeWidth="2" />
              <text
                x={Math.min(225, tapPoint.x + 6)}
                y={Math.max(28, tapPoint.y - 6)}
                fill="#22d3ee"
                fontSize="9.5"
                fontWeight="600"
              >
                {tapPoint.label}
              </text>
            </g>
          )}

          <text x="296" y="166" textAnchor="end" fill="#94a3b8" fontSize="9.5">
            {graph.xLabel}
          </text>
          <text x="42" y="15" fill="#94a3b8" fontSize="9.5">
            {graph.yLabel}
          </text>
        </svg>
      </div>

      {/* Curve Selector Chips */}
      <div className="mt-3 flex flex-wrap gap-1.5">
        {graph.curves.map((curve) => {
          const active = curve.id === selectedCurve?.id;
          return (
            <button
              key={curve.id}
              type="button"
              onClick={() => setSelectedCurveId(curve.id)}
              className={`min-h-[36px] inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                active
                  ? 'border-cyan-400 bg-cyan-500/15 text-slate-900 dark:text-slate-100'
                  : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-400'
              }`}
            >
              <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: curve.color }} />
              <span>{curve.label}</span>
            </button>
          );
        })}
      </div>

      {/* Interactive Sliders */}
      {graph.sliders.length > 0 && (
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {graph.sliders.map((slider) => {
            const val = sliderValues[slider.id] ?? slider.defaultValue;
            return (
              <div key={slider.id}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-600 dark:text-slate-300">{slider.label}</span>
                  <span className="font-mono tabular-nums text-cyan-600 dark:text-cyan-300">
                    {val} {slider.unit}
                  </span>
                </div>
                <input
                  type="range"
                  min={slider.min}
                  max={slider.max}
                  step={slider.step}
                  value={val}
                  onChange={(e) =>
                    setSliderValues((prev) => ({ ...prev, [slider.id]: Number(e.target.value) }))
                  }
                  className="w-full h-2 cursor-pointer"
                />
              </div>
            );
          })}
        </div>
      )}

      {/* Highlighted Linked Formula */}
      {linkedFormula && (
        <div className="mt-3.5 pt-3 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="min-w-0">
            <div className="text-[11px] font-medium text-cyan-600 dark:text-cyan-300">
              Linked Formula · {linkedFormula.title}
            </div>
            <div className="mt-1 text-xs text-slate-800 dark:text-slate-200 overflow-x-auto">
              <MathBlock latex={linkedFormula.latex} displayMode={false} />
            </div>
          </div>
          <button
            type="button"
            onClick={() => onJumpToFormula(linkedFormula.id)}
            className="min-h-[40px] px-3.5 rounded-xl bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border border-cyan-500/30 text-xs font-semibold inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 hover:bg-cyan-500/25 transition-colors"
          >
            <span>View in Web</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </article>
  );
};
