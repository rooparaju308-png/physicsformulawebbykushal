import { CHAPTERS, FORMULAS } from '../data/formulas';
import { SHORT_NOTES, ShortNoteFormulaItem } from '../data/shortNotes';
import { TRAP_NOTES, TrapEntry } from '../data/traps';
import {
  CALCULATOR_MAP,
  evaluatePhysicsExpression,
  formatSci,
} from '../data/calculators';
import { ChapterId, CommunityChannel, Formula } from '../types/physics';

export interface NumericalSolution {
  title: string;
  formulaId: string;
  steps: string[];
  finalAnswer: string;
  caveat?: string;
}

export interface MatchedFormulaResult {
  formula: Formula;
  chapterTitle: string;
  trap?: TrapEntry;
  hasCalculator: boolean;
  score: number;
}

export interface MatchedNoteResult {
  chapterTitle: string;
  unitTag: string;
  sectionTitle: string;
  item: ShortNoteFormulaItem;
}

export interface DoubtSolveResult {
  query: string;
  mathResult?: { expression: string; formatted: string; raw: number };
  numerical?: NumericalSolution;
  matchedFormulas: MatchedFormulaResult[];
  matchedNotes: MatchedNoteResult[];
  suggestedChannel: CommunityChannel;
  suggestedFormulaTag: string;
  draftText: string;
}

const KE = 9e9;
const EPS0 = 1 / (4 * Math.PI * KE);

const SYNONYM_MAP: Record<string, string[]> = {
  tir: ['total internal reflection', 'critical angle', 'snell', 'denser', 'rarer'],
  ydse: ['young', 'double slit', 'fringe', 'interference', 'slab', 'shift'],
  rc: ['capacitor', 'charging', 'discharging', 'time constant'],
  lr: ['inductor', 'growth', 'decay', 'time constant'],
  rlc: ['impedance', 'resonance', 'phasor', 'power factor', 'reactance'],
  emf: ['induced', 'motional', 'faraday', 'lenz', 'flux', 'battery'],
  debroglie: ['de broglie', 'matter wave', 'wavelength', 'accelerating'],
  photoelectric: ['einstein', 'stopping potential', 'work function', 'threshold'],
  bohr: ['hydrogen', 'orbit', 'rydberg', 'spectral', 'lyman', 'balmer'],
  zener: ['regulator', 'breakdown', 'load resistance', 'voltage'],
  gate: ['logic', 'boolean', 'nand', 'nor', 'and', 'or', 'xor', 'morgan'],
  bulb: ['watt', 'power', 'rated', 'series', 'parallel', 'fuse', 'brightness'],
  cube: ['gauss', 'flux', 'corner', 'face', 'centre'],
  silvered: ['mirror', 'lens', 'equivalent focal'],
  prism: ['minimum deviation', 'dispersion', 'thin prism', 'grazing'],
  brewster: ['polarization', 'malus', 'polarizer', 'analyzer'],
  malus: ['polarization', 'polarizer', 'analyzer', 'unpolarized'],
  potentiometer: ['meter bridge', 'wheatstone', 'balancing length'],
  galvanometer: ['shunt', 'ammeter', 'voltmeter', 'sensitivity'],
  cavity: ['superposition', 'solid sphere', 'cylinder', 'off axis'],
  dipole: ['axial', 'equatorial', 'torque', 'coaxial'],
  poynting: ['intensity', 'em wave', 'radiation pressure'],
  rutherford: ['alpha', 'closest approach', 'impact parameter', 'scattering'],
  qvalue: ['q value', 'nuclear reaction', 'mass defect', 'threshold', 'exothermic', 'endothermic'],
  achromatic: ['dispersion', 'dispersive power', 'doublet', 'chromatic'],
  displacement: ['bessel', 'conjugate', 'screen', 'lens shift'],
  microscope: ['travelling microscope', 'lycopodium', 'slab', 'refractive index'],
  halfdeflection: ['half deflection', 'galvanometer', 'figure of merit', 'shunt'],
  huygens: ['wavefront', 'resolving power', 'rayleigh', 'aperture'],
};

const STOP_WORDS = new Set([
  'the',
  'is',
  'are',
  'a',
  'an',
  'of',
  'in',
  'on',
  'at',
  'to',
  'for',
  'by',
  'and',
  'or',
  'find',
  'what',
  'how',
  'why',
  'calculate',
  'value',
  'determine',
  'if',
  'when',
  'with',
  'two',
  'one',
  'from',
  'between',
  'formula',
  'doubt',
  'question',
  'please',
  'help',
]);

function mapChapterToChannel(chapter: ChapterId): CommunityChannel {
  switch (chapter) {
    case 'modern-physics':
      return 'modern-physics';
    case 'semiconductors':
      return 'semiconductors';
    case 'ray-optics':
    case 'wave-optics':
      return 'optics';
    case 'master-map':
    case 'experimental-skills':
      return 'general';
    default:
      return 'electromagnetism';
  }
}

function tokenize(text: string): string[] {
  const base = text
    .toLowerCase()
    .replace(/μ/g, 'u')
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length >= 2 && !STOP_WORDS.has(w));

  const expanded = new Set<string>(base);
  for (const w of base) {
    if (w.endsWith('s') && w.length > 3) expanded.add(w.slice(0, -1));
    const syns = SYNONYM_MAP[w];
    if (syns) {
      for (const s of syns) {
        for (const sw of s.split(/\s+/)) expanded.add(sw);
      }
    }
  }
  return Array.from(expanded);
}

function extractUnitNumber(text: string, unitRegex: RegExp): number | null {
  const m = text.match(unitRegex);
  if (!m) return null;
  const val = Number(m[1]);
  return Number.isFinite(val) ? val : null;
}

function extractAllNumbers(text: string): number[] {
  const matches = text.match(/-?\d+(?:\.\d+)?(?:e[+-]?\d+)?/gi);
  if (!matches) return [];
  return matches.map(Number).filter(Number.isFinite);
}

function trySolveNumerical(rawQuery: string): NumericalSolution | undefined {
  const q = rawQuery.toLowerCase().replace(/μ/g, 'u');

  // 1. de-Broglie Wavelength at Accelerating Potential V
  if (
    (q.includes('broglie') || q.includes('de-broglie') || q.includes('wavelength')) &&
    (q.includes('electron') || q.includes('proton') || q.includes('alpha') || q.includes('potential'))
  ) {
    const V =
      extractUnitNumber(q, /(\d+(?:\.\d+)?)\s*(?:v|volt|volts|kv)\b/i) ??
      extractAllNumbers(q)[0];
    if (V && V > 0) {
      const actualV = /\b(\d+(?:\.\d+)?)\s*kv\b/i.test(q) ? V * 1000 : V;
      const sv = Math.sqrt(actualV);
      const isProton = q.includes('proton');
      const isAlpha = q.includes('alpha');
      const factor = isProton ? 0.286 : isAlpha ? 0.101 : 12.27;
      const particleLabel = isProton ? 'Proton' : isAlpha ? 'Alpha (α)' : 'Electron';
      const lambdaAng = factor / sv;
      return {
        title: `${particleLabel} de-Broglie Wavelength`,
        formulaId: 'mod-debroglie',
        steps: [
          `Formula: λ_${particleLabel.toLowerCase().split(' ')[0]} = ${factor} / √V Å`,
          `Substitute V = ${actualV} V ⇒ √V = ${formatSci(sv, 4)}`,
          `λ = ${factor} / ${formatSci(sv, 4)} = ${formatSci(lambdaAng, 4)} Å`,
        ],
        finalAnswer: `${formatSci(lambdaAng, 4)} Å (${formatSci(lambdaAng * 0.1, 4)} nm)`,
      };
    }
  }

  // 2. Photoelectric Effect (wavelength in nm/A + work function in eV)
  if (
    q.includes('photoelectric') ||
    q.includes('stopping') ||
    q.includes('work function') ||
    (q.includes('photon') && q.includes('nm'))
  ) {
    const lamNm =
      extractUnitNumber(q, /(\d+(?:\.\d+)?)\s*nm\b/i) ??
      (extractUnitNumber(q, /(\d+(?:\.\d+)?)\s*(?:a|angstrom)\b/i)
        ? extractUnitNumber(q, /(\d+(?:\.\d+)?)\s*(?:a|angstrom)\b/i)! * 0.1
        : null);
    const phiEv = extractUnitNumber(q, /(\d+(?:\.\d+)?)\s*ev\b/i);

    if (lamNm && lamNm > 0) {
      const E = 1240 / lamNm;
      if (phiEv !== null) {
        const kMax = Math.max(0, E - phiEv);
        const threshNm = 1240 / phiEv;
        return {
          title: "Einstein's Photoelectric Equation",
          formulaId: 'mod-einstein-pe',
          steps: [
            `Incident photon energy hν ≈ 1240 / λ(nm) = 1240 / ${lamNm} = ${formatSci(E, 4)} eV`,
            `Threshold wavelength λ₀ = 1240 / φ = 1240 / ${phiEv} = ${formatSci(threshNm, 4)} nm`,
            kMax > 0
              ? `K_max = hν − φ = ${formatSci(E, 4)} − ${phiEv} = ${formatSci(kMax, 4)} eV ⇒ V₀ = ${formatSci(kMax, 4)} V`
              : `Since hν (${formatSci(E, 4)} eV) ≤ φ (${phiEv} eV), NO photoemission occurs!`,
          ],
          finalAnswer: kMax > 0 ? `K_max = ${formatSci(kMax, 4)} eV · V₀ = ${formatSci(kMax, 4)} V` : 'No emission (K_max = 0)',
          caveat: 'hc ≈ 1240 eV·nm shortcut saves full SI conversion in JEE numericals.',
        };
      }
      return {
        title: 'Photon Energy Shortcut',
        formulaId: 'mod-photon-energy',
        steps: [`Using E ≈ 1240 / λ(nm): E = 1240 / ${lamNm} = ${formatSci(E, 4)} eV`],
        finalAnswer: `${formatSci(E, 4)} eV`,
      };
    }
  }

  // 3. Wire Stretching (R' = n^2 R)
  if (
    (q.includes('stretch') || q.includes('elongat') || q.includes('drawn')) &&
    (q.includes('wire') || q.includes('resistance'))
  ) {
    const nMatch = q.match(/(\d+(?:\.\d+)?)\s*(?:times|x|fold)\b/i) ?? (q.includes('double') ? ['2', '2'] : q.includes('triple') ? ['3', '3'] : null);
    const pctMatch = q.match(/(\d+(?:\.\d+)?)\s*%/);
    const Rval = extractUnitNumber(q, /(\d+(?:\.\d+)?)\s*(?:ohm|ohms|ω)\b/i);

    if (pctMatch) {
      const pct = Number(pctMatch[1]);
      if (pct <= 5) {
        const dRpct = 2 * pct;
        return {
          title: 'Small % Stretching of Wire (Constant Volume)',
          formulaId: 'curr-stretching',
          steps: [
            `For Δl/l ≤ 5% at constant volume: ΔR/R ≈ 2(Δl/l)`,
            `ΔR/R ≈ 2 × ${pct}% = ${formatSci(dRpct, 4)}%`,
            ...(Rval ? [`R_new ≈ ${formatSci(Rval * (1 + dRpct / 100), 4)} Ω`] : []),
          ],
          finalAnswer: `+${formatSci(dRpct, 4)}% change in R`,
        };
      }
      const n = 1 + pct / 100;
      const factor = n * n;
      return {
        title: 'Large % Stretching of Wire (Exact R′ = n²R)',
        formulaId: 'curr-stretching',
        steps: [
          `Length becomes n = 1 + ${pct}/100 = ${formatSci(n, 4)} times`,
          `At constant volume: R′ = n²R = (${formatSci(n, 4)})² R = ${formatSci(factor, 4)} R`,
          ...(Rval ? [`R′ = ${formatSci(factor * Rval, 4)} Ω`] : []),
        ],
        finalAnswer: Rval ? `${formatSci(factor * Rval, 4)} Ω` : `${formatSci(factor, 4)} × R (+${formatSci((factor - 1) * 100, 4)}%)`,
        caveat: 'Do NOT use 2×% approximation when Δl/l > 5%!',
      };
    }

    if (nMatch) {
      const n = Number(nMatch[1]);
      const factor = n * n;
      return {
        title: 'Stretched Wire Resistance (Constant Volume)',
        formulaId: 'curr-stretching',
        steps: [
          `Volume V = A·l stays constant ⇒ A′ = A/${n} when l′ = ${n}l`,
          `R′ = n²R = (${n})²R = ${formatSci(factor, 4)}R`,
          ...(Rval ? [`R′ = ${formatSci(factor, 4)} × ${Rval} = ${formatSci(factor * Rval, 4)} Ω`] : []),
        ],
        finalAnswer: Rval ? `${formatSci(factor * Rval, 4)} Ω` : `${formatSci(factor, 4)} R`,
      };
    }
  }

  // 4. Series / Parallel Bulb Power Problem
  if (q.includes('bulb') && (q.includes('w') || q.includes('watt'))) {
    const wattMatches = [...q.matchAll(/(\d+(?:\.\d+)?)\s*w\b/gi)].map((m) => Number(m[1]));
    const voltMatch = extractUnitNumber(q, /(\d+(?:\.\d+)?)\s*(?:v|volt|volts)\b/i) ?? 220;
    if (wattMatches.length >= 2) {
      const [P1, P2] = wattMatches;
      const R1 = (voltMatch * voltMatch) / P1;
      const R2 = (voltMatch * voltMatch) / P2;
      const isParallel = q.includes('parallel');
      const brighter = isParallel ? (P1 >= P2 ? `${P1}W` : `${P2}W`) : P1 <= P2 ? `${P1}W` : `${P2}W`;
      return {
        title: 'Rated Bulbs in Series vs Parallel',
        formulaId: 'curr-power',
        steps: [
          `First find filament resistances from rated values (R = V_rated² / P_rated at ${voltMatch} V):`,
          `R₁ = ${voltMatch}²/${P1} = ${formatSci(R1, 4)} Ω;  R₂ = ${voltMatch}²/${P2} = ${formatSci(R2, 4)} Ω`,
          isParallel
            ? `In PARALLEL (same V, P = V²/R): lower R (higher wattage ${brighter} bulb) dissipates MORE power and glows brighter.`
            : `In SERIES (same I, P = I²R): higher R (LOWER wattage ${brighter} bulb) gets more voltage, glows BRIGHTER, and fuses FIRST.`,
        ],
        finalAnswer: `${brighter} bulb glows brighter (${isParallel ? 'Parallel: P ∝ P_rated' : 'Series: P ∝ 1/P_rated'})`,
      };
    }
  }

  // 5. Silvered Lens Equivalent Mirror
  if (q.includes('silvered') || (q.includes('mirror') && q.includes('lens'))) {
    const nums = extractAllNumbers(q);
    if (nums.length >= 2) {
      const fL = nums[0];
      const fM = nums[1];
      if (fL !== 0 && fM !== 0) {
        const invFeq = 1 / fM - 2 / fL;
        const feq = Math.abs(invFeq) < 1e-9 ? Infinity : 1 / invFeq;
        return {
          title: 'Silvered Lens Equivalent Spherical Mirror',
          formulaId: 'ray-power-combo',
          steps: [
            `Ray refracts through lens TWICE (+2P_L) and reflects off silvered surface ONCE (+P_M): P_eq = 2P_L + P_M`,
            `Mirror rule: 1/f_eq = 1/f_M − 2/f_L = 1/(${fM}) − 2/(${fL}) = ${formatSci(invFeq, 4)}`,
            Number.isFinite(feq) ? `f_eq = ${formatSci(feq, 4)} cm` : `f_eq → ∞ (acts like a plane mirror)`,
          ],
          finalAnswer: Number.isFinite(feq) ? `f_eq = ${formatSci(feq, 4)} cm` : '∞ (Plane Mirror)',
          caveat: 'Verify signs with Cartesian convention: converging lens f_L > 0, concave silvered back f_M < 0.',
        };
      }
    }
  }

  // 6. Capacitor Charge Sharing & Heat Loss
  if (
    (q.includes('capacitor') || q.includes('uf')) &&
    (q.includes('heat') || q.includes('common') || q.includes('sharing') || q.includes('loss'))
  ) {
    const caps = [...q.matchAll(/(\d+(?:\.\d+)?)\s*uf\b/gi)].map((m) => Number(m[1]));
    const volts = [...q.matchAll(/(-?\d+(?:\.\d+)?)\s*(?:v|volt)\b/gi)].map((m) => Number(m[1]));
    if (caps.length >= 2 && volts.length >= 1) {
      const C1 = caps[0];
      const C2 = caps[1];
      const V1 = volts[0];
      const V2 = volts[1] ?? 0;
      const Vcom = (C1 * V1 + C2 * V2) / (C1 + C2);
      const lossUj = (C1 * C2 * Math.pow(V1 - V2, 2)) / (2 * (C1 + C2));
      return {
        title: 'Capacitor Sharing & Heat Dissipation',
        formulaId: 'elec-cap-sharing',
        steps: [
          `Total charge conserved (same polarity): V_common = (C₁V₁ + C₂V₂) / (C₁ + C₂)`,
          `V_common = (${C1}×${V1} + ${C2}×${V2}) / (${C1} + ${C2}) = ${formatSci(Vcom, 4)} V`,
          `Heat loss ΔU = ½ · [C₁C₂/(C₁+C₂)] · (V₁ − V₂)² = ${formatSci(lossUj, 4)} μJ (${formatSci(lossUj * 1e-3, 4)} mJ)`,
        ],
        finalAnswer: `V_common = ${formatSci(Vcom, 4)} V · Heat Loss = ${formatSci(lossUj * 1e-3, 4)} mJ`,
        caveat: 'If opposite polarity plates (+ to −) are joined, use |C₁V₁ − C₂V₂| and (V₁ + V₂)².',
      };
    }
  }

  // 7. YDSE Fringe Width β
  if (q.includes('ydse') || q.includes('fringe width') || q.includes('double slit')) {
    const lamNm = extractUnitNumber(q, /(\d+(?:\.\d+)?)\s*nm\b/i);
    const dMm = extractUnitNumber(q, /(\d+(?:\.\d+)?)\s*mm\b/i);
    const Dm = extractUnitNumber(q, /(\d+(?:\.\d+)?)\s*m\b/i);
    if (lamNm && dMm && Dm) {
      const betaMm = (((lamNm * 1e-9) * Dm) / (dMm * 1e-3)) * 1e3;
      return {
        title: 'YDSE Fringe Width β',
        formulaId: 'wave-ydse',
        steps: [
          `β = λD / d`,
          `β = (${lamNm}×10⁻⁹ m × ${Dm} m) / (${dMm}×10⁻³ m) = ${formatSci(betaMm, 4)} mm`,
        ],
        finalAnswer: `β = ${formatSci(betaMm, 4)} mm`,
        caveat: 'Submerging in a liquid of refractive index n shrinks β′ = β/n; covering 1 slit with a thin slab shifts fringes without changing β.',
      };
    }
  }

  // 8. Cube Gauss Flux Symmetry
  if (q.includes('cube') && q.includes('flux')) {
    const qUc = extractUnitNumber(q, /(\d+(?:\.\d+)?)\s*uc\b/i);
    const qVal = qUc !== null ? qUc * 1e-6 : null;
    const isCorner = q.includes('corner');
    const isFaceCenter = q.includes('face') && (q.includes('center') || q.includes('centre'));
    const isEdge = q.includes('edge');
    const factor = isCorner ? 8 : isEdge ? 4 : isFaceCenter ? 2 : 1;
    const posLabel = isCorner ? 'Corner (1/8 cube)' : isEdge ? 'Edge-centre (1/4 cube)' : isFaceCenter ? 'Face-centre (1/2 cube)' : 'Cube Centre (full flux)';
    return {
      title: `Gauss Law Symmetry: Charge at ${posLabel}`,
      formulaId: 'elec-cube-flux',
      steps: [
        isCorner
          ? `8 identical cubes share a corner ⇒ total flux through 1 cube = q / (8ε₀); 3 touching faces carry 0 flux; each of 3 non-touching faces carries q / (24ε₀).`
          : isFaceCenter
            ? `2 cubes share a face-centre ⇒ flux through 1 cube = q / (2ε₀).`
            : isEdge
              ? `4 cubes share an edge-centre ⇒ flux through 1 cube = q / (4ε₀).`
              : `Charge is completely inside at symmetry centre ⇒ total flux = q / ε₀; each of 6 faces carries q / (6ε₀).`,
        ...(qVal !== null
          ? [`Numerical (q = ${qUc} μC): Φ_cube = ${formatSci(qVal / (factor * EPS0), 4)} N·m²/C`]
          : []),
      ],
      finalAnswer:
        qVal !== null
          ? `Φ_cube = ${formatSci(qVal / (factor * EPS0), 4)} N·m²/C (Formula: q / ${factor === 1 ? '' : factor}ε₀)`
          : isCorner
            ? 'Cube: q/(8ε₀) · Non-touching face: q/(24ε₀)'
            : `Cube flux: q / (${factor === 1 ? '' : factor}ε₀)`,
    };
  }

  // 9. Rutherford Alpha Closest Approach r0
  if (q.includes('rutherford') || q.includes('closest approach')) {
    const zMatch = q.match(/z\s*=?\s*(\d+)/i);
    const kMeV = extractUnitNumber(q, /(\d+(?:\.\d+)?)\s*mev\b/i);
    const Z = zMatch ? Number(zMatch[1]) : q.includes('gold') ? 79 : null;
    if (Z && kMeV && kMeV > 0) {
      const kE = 1.602176634e-19 * KE;
      const r0Fm = ((2 * Z * kE) / (kMeV * 1e6)) * 1e15;
      return {
        title: 'Rutherford α Distance of Closest Approach r₀',
        formulaId: 'mod-rutherford-scattering',
        steps: [
          `At closest approach (head-on θ = 180°), α kinetic energy K converts completely into electrostatic potential energy:`,
          `r₀ = k·(2Ze²) / K = (2 × ${Z} × 1.44 MeV·fm) / ${kMeV} MeV`,
          `r₀ = ${formatSci(r0Fm, 4)} fm (${formatSci(r0Fm * 1e-15, 4)} m)`,
        ],
        finalAnswer: `r₀ = ${formatSci(r0Fm, 4)} fm (${formatSci(r0Fm * 1e-15, 4)} m)`,
        caveat: 'Note r₀ ∝ Z/K ∝ 1/v²: doubling α speed quarters closest approach distance.',
      };
    }
  }

  // 10. Nuclear Reaction Q-Value (mass defect in u)
  if (q.includes('q-value') || q.includes('q value') || (q.includes('nuclear') && q.includes('mass'))) {
    const dmU = extractUnitNumber(q, /(-?\d+(?:\.\d+)?)\s*(?:u|amu)\b/i);
    if (dmU !== null) {
      const Q = dmU * 931.5;
      return {
        title: 'Nuclear Reaction Q-Value',
        formulaId: 'mod-nuclear-qvalue',
        steps: [
          `Using Q = Δm(in u) × 931.5 MeV (where Δm = Σm_reactants − Σm_products):`,
          `Q = (${dmU}) × 931.5 = ${formatSci(Q, 4)} MeV`,
          Q >= 0
            ? `Since Q > 0, reaction is EXOTHERMIC (${formatSci(Q, 4)} MeV released).`
            : `Since Q < 0, reaction is ENDOTHERMIC (threshold K_th = |Q|(1 + m_x/M_X)).`,
        ],
        finalAnswer: `Q = ${formatSci(Q, 4)} MeV (${Q >= 0 ? 'Exothermic' : 'Endothermic'})`,
      };
    }
  }

  // 11. Bessel's Lens Displacement Method (D and d)
  if (q.includes('displacement method') || q.includes('bessel') || (q.includes('screen') && q.includes('shift') && q.includes('lens'))) {
    const nums = [...q.matchAll(/(\d+(?:\.\d+)?)\s*cm\b/gi)].map((m) => Number(m[1]));
    if (nums.length >= 2) {
      const D = Math.max(nums[0], nums[1]);
      const d = Math.min(nums[0], nums[1]);
      if (D > d) {
        const f = (D * D - d * d) / (4 * D);
        return {
          title: "Bessel's Lens Displacement Method",
          formulaId: 'exp-lens-displacement',
          steps: [
            `Fixed object–screen separation D = ${D} cm, shift between conjugate lens positions d = ${d} cm`,
            `f = (D² − d²) / (4D) = (${D}² − ${d}²) / (4 × ${D}) = ${formatSci(f, 4)} cm`,
          ],
          finalAnswer: `f = ${formatSci(f, 4)} cm (Check D ≥ 4f: ${D} ≥ ${formatSci(4 * f, 4)} cm)`,
          caveat: 'If two image heights I₁, I₂ are given, object size O = √(I₁I₂) since m₁m₂ = 1.',
        };
      }
    }
  }

  // 12. Travelling Microscope Slab Refractive Index (R1, R2, R3)
  if (q.includes('microscope') && (q.includes('slab') || q.includes('powder') || q.includes('mark'))) {
    const nums = extractAllNumbers(q).filter((n) => n > 0 && n < 100);
    if (nums.length >= 3) {
      const [R1, R2, R3] = nums;
      const realT = R3 - R1;
      const appT = R3 - R2;
      if (appT > 0 && realT > 0) {
        const n = realT / appT;
        return {
          title: 'Travelling Microscope Slab Refractive Index',
          formulaId: 'exp-travelling-microscope',
          steps: [
            `Readings: bare mark R₁ = ${R1} cm, through slab R₂ = ${R2} cm, top powder R₃ = ${R3} cm`,
            `Real thickness = R₃ − R₁ = ${formatSci(realT, 4)} cm; Apparent thickness = R₃ − R₂ = ${formatSci(appT, 4)} cm`,
            `n = (R₃ − R₁) / (R₃ − R₂) = ${formatSci(realT, 4)} / ${formatSci(appT, 4)} = ${formatSci(n, 4)}`,
          ],
          finalAnswer: `n = ${formatSci(n, 4)} (Normal shift = ${formatSci(R2 - R1, 4)} cm)`,
        };
      }
    }
  }

  // 13. Half-Deflection Galvanometer G = RS/(R - S)
  if (q.includes('half deflection') || q.includes('half-deflection')) {
    const ohms = [...q.matchAll(/(\d+(?:\.\d+)?)\s*(?:ohm|ohms|ω)\b/gi)].map((m) => Number(m[1]));
    const fallback = ohms.length >= 2 ? ohms : extractAllNumbers(q);
    if (fallback.length >= 2) {
      const R = Math.max(fallback[0], fallback[1]);
      const S = Math.min(fallback[0], fallback[1]);
      if (R > S && S > 0) {
        const G = (R * S) / (R - S);
        return {
          title: 'Half-Deflection Galvanometer Resistance G',
          formulaId: 'exp-galvanometer-half-deflection',
          steps: [
            `Series resistance R = ${R} Ω, half-deflection shunt S = ${S} Ω`,
            `Exact formula: G = (R·S) / (R − S) = (${R} × ${S}) / (${R} − ${S}) = ${formatSci(G, 4)} Ω`,
          ],
          finalAnswer: `G = ${formatSci(G, 4)} Ω`,
          caveat: 'Approximation G ≈ S is accurate only when R ≫ S.',
        };
      }
    }
  }

  return undefined;
}

export function solvePhysicsDoubt(rawQuery: string): DoubtSolveResult {
  const query = rawQuery.trim();
  if (!query) {
    const starterFormulas = FORMULAS.slice(0, 3).map((formula) => ({
      formula,
      chapterTitle: CHAPTERS.find((c) => c.id === formula.chapter)?.shortTitle ?? formula.chapter,
      trap: TRAP_NOTES[formula.id],
      hasCalculator: Boolean(CALCULATOR_MAP[formula.id]),
      score: 1,
    }));
    return {
      query: '',
      matchedFormulas: starterFormulas,
      matchedNotes: [],
      suggestedChannel: 'general',
      suggestedFormulaTag: '',
      draftText: '',
    };
  }

  // 1. Check direct math expression evaluation if query looks mathematical
  let mathResult: DoubtSolveResult['mathResult'];
  const looksLikeExpr = /[0-9].*[+\-*/^]|[+\-*/^].*[0-9]|^(sqrt|sin|cos|tan|ln|log)\(/i.test(query);
  if (looksLikeExpr) {
    const evalOut = evaluatePhysicsExpression(query);
    if (evalOut.ok) {
      mathResult = {
        expression: query,
        formatted: formatSci(evalOut.value, 5),
        raw: evalOut.value,
      };
    }
  }

  // 2. Try direct worked numerical solver
  const numerical = trySolveNumerical(query);

  // 3. Score formulas & short notes with token overlap + synonym boost + JEE weight
  const tokens = tokenize(query);
  const qLower = query.toLowerCase();

  const chapterMap = new Map(CHAPTERS.map((c) => [c.id, c.shortTitle]));

  const scoredFormulas: MatchedFormulaResult[] = FORMULAS.map((formula) => {
    let score = 0;
    const titleLower = formula.title.toLowerCase();
    const subLower = formula.subtopic.toLowerCase();
    const tagsLower = formula.tags.join(' ').toLowerCase();
    const condLower = formula.conditions.join(' ').toLowerCase();
    const fcLower = `${formula.flashcard.front} ${formula.flashcard.back}`.toLowerCase();

    if (numerical && numerical.formulaId === formula.id) {
      score += 40;
    }

    if (qLower.includes(titleLower) || titleLower.includes(qLower)) {
      score += 18;
    }

    for (const tok of tokens) {
      if (titleLower.includes(tok)) score += 6;
      if (tagsLower.includes(tok)) score += 5;
      if (subLower.includes(tok)) score += 3;
      if (fcLower.includes(tok)) score += 2.5;
      if (condLower.includes(tok)) score += 2;
    }

    if (score > 0 && TRAP_NOTES[formula.id]) score += 1;
    if (score > 0 && CALCULATOR_MAP[formula.id]) score += 1;
    if (score > 0) score += formula.jeeWeight * 0.4;

    return {
      formula,
      chapterTitle: chapterMap.get(formula.chapter) ?? formula.chapter,
      trap: TRAP_NOTES[formula.id],
      hasCalculator: Boolean(CALCULATOR_MAP[formula.id]),
      score,
    };
  })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4);

  // 4. Score Short Notes
  const scoredNotes: (MatchedNoteResult & { score: number })[] = [];
  for (const ch of SHORT_NOTES) {
    for (const sec of ch.sections) {
      for (const item of sec.items) {
        let score = 0;
        const labelLower = item.label.toLowerCase();
        const secLower = sec.title.toLowerCase();
        const chLower = ch.title.toLowerCase();
        if (numerical && item.formulaId === numerical.formulaId) score += 15;
        for (const tok of tokens) {
          if (labelLower.includes(tok)) score += 5;
          if (secLower.includes(tok)) score += 3;
          if (chLower.includes(tok)) score += 1.5;
        }
        if (score >= 4) {
          scoredNotes.push({
            chapterTitle: ch.shortTitle,
            unitTag: ch.unitTag,
            sectionTitle: sec.title,
            item,
            score,
          });
        }
      }
    }
  }
  scoredNotes.sort((a, b) => b.score - a.score);
  const matchedNotes = scoredNotes.slice(0, 3).map(({ score: _s, ...rest }) => rest);

  // 5. Auto-suggest best Community Channel & pre-filled Doubt Composer draft
  const topFormula = scoredFormulas[0]?.formula;
  let suggestedChannel: CommunityChannel = 'general';
  if (qLower.includes('diode') || qLower.includes('zener') || qLower.includes('gate')) {
    suggestedChannel = 'semiconductors';
  } else if (
    qLower.includes('lens') ||
    qLower.includes('mirror') ||
    qLower.includes('ydse') ||
    qLower.includes('prism') ||
    qLower.includes('microscope') ||
    qLower.includes('achromatic') ||
    qLower.includes('dispersion')
  ) {
    suggestedChannel = 'optics';
  } else if (
    qLower.includes('photon') ||
    qLower.includes('bohr') ||
    qLower.includes('nucle') ||
    qLower.includes('rutherford') ||
    qLower.includes('q-value') ||
    qLower.includes('q value')
  ) {
    suggestedChannel = 'modern-physics';
  } else if (
    qLower.includes('metre bridge') ||
    qLower.includes('meter bridge') ||
    qLower.includes('galvanometer') ||
    qLower.includes('half deflection') ||
    qLower.includes('half-deflection')
  ) {
    suggestedChannel = 'electromagnetism';
  } else if (topFormula) {
    suggestedChannel = mapChapterToChannel(topFormula.chapter);
  }

  const suggestedFormulaTag = numerical?.formulaId || topFormula?.id || '';
  const draftText = `Doubt: ${query}\n(Need step verification / intuition on this question — attach photo if helpful!)`;

  return {
    query,
    mathResult,
    numerical,
    matchedFormulas: scoredFormulas,
    matchedNotes,
    suggestedChannel,
    suggestedFormulaTag,
    draftText,
  };
}
