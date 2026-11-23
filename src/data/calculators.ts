export interface CalcInputDef {
  key: string;
  label: string;
  unit: string;
  defaultVal: number;
  min?: number;
  max?: number;
  step?: number;
}

export interface CalcOutputDef {
  label: string;
  value: string;
  unit: string;
}

export interface FormulaCalculatorDef {
  formulaId: string;
  title: string;
  inputs: CalcInputDef[];
  compute: (vals: Record<string, number>) => CalcOutputDef[];
}

const KE = 9e9;
const KM = 1e-7;
const EPS0 = 1 / (4 * Math.PI * KE);
const MU0 = 4 * Math.PI * KM;
const C_LIGHT = 3e8;

export function formatSci(num: number, sig = 4): string {
  if (!Number.isFinite(num)) return 'Undefined';
  if (num === 0) return '0';
  const abs = Math.abs(num);
  if (abs >= 1e-3 && abs < 1e5) {
    return Number(num.toPrecision(sig)).toString();
  }
  return num.toExponential(sig - 1);
}

const CALCULATORS: FormulaCalculatorDef[] = [
  {
    formulaId: 'elec-coulomb',
    title: "Coulomb's Force Calculator",
    inputs: [
      { key: 'q1uC', label: 'Charge q₁', unit: 'μC', defaultVal: 4 },
      { key: 'q2uC', label: 'Charge q₂', unit: 'μC', defaultVal: 6 },
      { key: 'rcm', label: 'Distance r', unit: 'cm', defaultVal: 30, min: 0.001 },
      { key: 'K', label: 'Dielectric K', unit: 'rel', defaultVal: 1, min: 1 },
    ],
    compute: (v) => {
      const q1 = v.q1uC * 1e-6;
      const q2 = v.q2uC * 1e-6;
      const r = v.rcm * 1e-2;
      const Fvac = (KE * Math.abs(q1 * q2)) / (r * r);
      const Fmed = Fvac / Math.max(1, v.K);
      return [
        { label: 'F (vacuum)', value: formatSci(Fvac), unit: 'N' },
        { label: 'F (medium K)', value: formatSci(Fmed), unit: 'N' },
      ];
    },
  },
  {
    formulaId: 'elec-point-evu',
    title: 'Point Charge E, V & U',
    inputs: [
      { key: 'quC', label: 'Source q', unit: 'μC', defaultVal: 5 },
      { key: 'q0uC', label: 'Test q₀', unit: 'μC', defaultVal: 2 },
      { key: 'r', label: 'Distance r', unit: 'm', defaultVal: 0.5, min: 0.001 },
    ],
    compute: (v) => {
      const q = v.quC * 1e-6;
      const q0 = v.q0uC * 1e-6;
      const r = v.r;
      return [
        { label: 'E = kq/r²', value: formatSci((KE * q) / (r * r)), unit: 'N/C' },
        { label: 'V = kq/r', value: formatSci((KE * q) / r), unit: 'V' },
        { label: 'U = kqq₀/r', value: formatSci((KE * q * q0) / r), unit: 'J' },
      ];
    },
  },
  {
    formulaId: 'lar-wire-e-perp',
    title: 'Finite Straight Wire (E⊥, E∥, E_net, B₀)',
    inputs: [
      { key: 'lamuC', label: 'λ (linear)', unit: 'μC/m', defaultVal: 2 },
      { key: 'I', label: 'Current I', unit: 'A', defaultVal: 5 },
      { key: 'r', label: 'Distance r', unit: 'm', defaultVal: 0.2, min: 0.001 },
      { key: 't1', label: 'Angle θ₁', unit: 'deg', defaultVal: 60 },
      { key: 't2', label: 'Angle θ₂', unit: 'deg', defaultVal: 30 },
    ],
    compute: (v) => {
      const a1 = (v.t1 * Math.PI) / 180;
      const a2 = (v.t2 * Math.PI) / 180;
      const lam = v.lamuC * 1e-6;
      const Eperp = ((KE * lam) / v.r) * (Math.sin(a1) + Math.sin(a2));
      const Epar = ((KE * lam) / v.r) * (Math.cos(a1) - Math.cos(a2));
      const Enet = Math.hypot(Eperp, Epar);
      const B0 = ((KM * v.I) / v.r) * (Math.sin(a1) + Math.sin(a2));
      return [
        { label: 'E⊥', value: formatSci(Eperp), unit: 'N/C' },
        { label: 'E∥', value: formatSci(Epar), unit: 'N/C' },
        { label: 'E_net', value: formatSci(Enet), unit: 'N/C' },
        { label: 'B₀', value: formatSci(B0), unit: 'T' },
      ];
    },
  },
  {
    formulaId: 'lar-wire-net-force',
    title: 'Finite Wire Net Field & Force',
    inputs: [
      { key: 'lamuC', label: 'λ (linear)', unit: 'μC/m', defaultVal: 3 },
      { key: 'q0uC', label: 'Test q₀', unit: 'μC', defaultVal: 2 },
      { key: 'r', label: 'Distance r', unit: 'm', defaultVal: 0.3, min: 0.001 },
      { key: 't1', label: 'Angle θ₁', unit: 'deg', defaultVal: 45 },
      { key: 't2', label: 'Angle θ₂', unit: 'deg', defaultVal: 45 },
    ],
    compute: (v) => {
      const a1 = (v.t1 * Math.PI) / 180;
      const a2 = (v.t2 * Math.PI) / 180;
      const lam = v.lamuC * 1e-6;
      const q0 = v.q0uC * 1e-6;
      const Enet = ((2 * KE * lam) / v.r) * Math.sin((a1 + a2) / 2);
      const Fperp = ((KE * q0 * lam) / v.r) * (Math.sin(a1) + Math.sin(a2));
      const Fpar = ((KE * q0 * lam) / v.r) * (Math.cos(a1) - Math.cos(a2));
      return [
        { label: 'E_net', value: formatSci(Enet), unit: 'N/C' },
        { label: 'F⊥', value: formatSci(Fperp), unit: 'N' },
        { label: 'F∥', value: formatSci(Fpar), unit: 'N' },
      ];
    },
  },
  {
    formulaId: 'lar-wire-infinite',
    title: 'Infinite Wire E & B',
    inputs: [
      { key: 'lamuC', label: 'Charge λ', unit: 'μC/m', defaultVal: 4 },
      { key: 'I', label: 'Current I', unit: 'A', defaultVal: 10 },
      { key: 'r', label: 'Distance r', unit: 'm', defaultVal: 0.1, min: 0.001 },
    ],
    compute: (v) => {
      const E = (2 * KE * v.lamuC * 1e-6) / v.r;
      const B = (2 * KM * v.I) / v.r;
      return [
        { label: 'E⊥ = 2kλ/r', value: formatSci(E), unit: 'N/C' },
        { label: 'B = 2k′I/r', value: formatSci(B), unit: 'T' },
      ];
    },
  },
  {
    formulaId: 'lar-rod-axial',
    title: 'Axial Charged Rod (Length L, Gap a)',
    inputs: [
      { key: 'QuC', label: 'Total Q', unit: 'μC', defaultVal: 10 },
      { key: 'L', label: 'Rod Length L', unit: 'm', defaultVal: 0.4, min: 0.001 },
      { key: 'a', label: 'Nearest gap a', unit: 'm', defaultVal: 0.2, min: 0.001 },
    ],
    compute: (v) => {
      const Q = v.QuC * 1e-6;
      const lam = Q / v.L;
      const E = (KE * Q) / (v.a * (v.a + v.L));
      const V = KE * lam * Math.log((v.a + v.L) / v.a);
      return [
        { label: 'E_axial', value: formatSci(E), unit: 'N/C' },
        { label: 'V_axial', value: formatSci(V), unit: 'V' },
      ];
    },
  },
  {
    formulaId: 'lar-parallel-wires-both',
    title: 'Two Parallel Infinite Wires Force/Length',
    inputs: [
      { key: 'l1uC', label: 'λ₁', unit: 'μC/m', defaultVal: 2 },
      { key: 'l2uC', label: 'λ₂', unit: 'μC/m', defaultVal: 3 },
      { key: 'I1', label: 'I₁', unit: 'A', defaultVal: 5 },
      { key: 'I2', label: 'I₂', unit: 'A', defaultVal: 8 },
      { key: 'd', label: 'Separation d', unit: 'm', defaultVal: 0.1, min: 0.001 },
    ],
    compute: (v) => [
      { label: 'F_e / L', value: formatSci((2 * KE * v.l1uC * v.l2uC * 1e-12) / v.d), unit: 'N/m' },
      { label: 'F_B / L', value: formatSci((2 * KM * v.I1 * v.I2) / v.d), unit: 'N/m' },
    ],
  },
  {
    formulaId: 'lar-arc-e',
    title: 'Charged Arc Center E_A, V_A, B_A',
    inputs: [
      { key: 'lamuC', label: 'λ', unit: 'μC/m', defaultVal: 5 },
      { key: 'I', label: 'Current I', unit: 'A', defaultVal: 4 },
      { key: 'R', label: 'Radius R', unit: 'm', defaultVal: 0.2, min: 0.001 },
      { key: 'thetaDeg', label: 'Arc Angle θ', unit: 'deg', defaultVal: 90 },
    ],
    compute: (v) => {
      const th = (v.thetaDeg * Math.PI) / 180;
      const lam = v.lamuC * 1e-6;
      return [
        { label: 'E_A', value: formatSci(((2 * KE * lam) / v.R) * Math.sin(th / 2)), unit: 'N/C' },
        { label: 'V_A = kλθ', value: formatSci(KE * lam * th), unit: 'V' },
        { label: 'B_A = k′Iθ/R', value: formatSci((KM * v.I * th) / v.R), unit: 'T' },
      ];
    },
  },
  {
    formulaId: 'lar-ring-e-axis',
    title: 'Ring Axis E, V, B & E_max',
    inputs: [
      { key: 'QuC', label: 'Charge Q', unit: 'μC', defaultVal: 8 },
      { key: 'I', label: 'Current I', unit: 'A', defaultVal: 5 },
      { key: 'R', label: 'Radius R', unit: 'm', defaultVal: 0.3, min: 0.001 },
      { key: 'x', label: 'Axial x', unit: 'm', defaultVal: 0.4 },
    ],
    compute: (v) => {
      const Q = v.QuC * 1e-6;
      const d = Math.sqrt(v.R * v.R + v.x * v.x);
      const d3 = d * d * d;
      return [
        { label: 'E_axis', value: formatSci((KE * Q * v.x) / d3), unit: 'N/C' },
        { label: 'E_max (±R/√2)', value: formatSci((2 * KE * Q) / (3 * Math.sqrt(3) * v.R * v.R)), unit: 'N/C' },
        { label: 'V_axis', value: formatSci((KE * Q) / d), unit: 'V' },
        { label: 'B_axis (1 turn)', value: formatSci((2 * Math.PI * KM * v.I * v.R * v.R) / d3), unit: 'T' },
      ];
    },
  },
  {
    formulaId: 'lar-disc-e',
    title: 'Uniformly Charged Disc Axis',
    inputs: [
      { key: 'sigmauC', label: 'σ', unit: 'μC/m²', defaultVal: 10 },
      { key: 'R', label: 'Radius R', unit: 'm', defaultVal: 0.5, min: 0.001 },
      { key: 'x', label: 'Axial x', unit: 'm', defaultVal: 0.5, min: 0 },
    ],
    compute: (v) => {
      const sig = v.sigmauC * 1e-6;
      const root = Math.sqrt(v.R * v.R + v.x * v.x);
      return [
        { label: 'E_axis', value: formatSci(2 * Math.PI * KE * sig * (1 - v.x / root)), unit: 'N/C' },
        { label: 'V_axis', value: formatSci(2 * Math.PI * KE * sig * (root - v.x)), unit: 'V' },
        { label: 'V_center', value: formatSci(2 * Math.PI * KE * sig * v.R), unit: 'V' },
        { label: 'V_edge', value: formatSci(4 * KE * sig * v.R), unit: 'V' },
      ];
    },
  },
  {
    formulaId: 'elec-solid-sphere',
    title: 'Solid Non-Conducting Sphere Calculator',
    inputs: [
      { key: 'QuC', label: 'Total Q', unit: 'μC', defaultVal: 12 },
      { key: 'R', label: 'Radius R', unit: 'm', defaultVal: 0.4, min: 0.001 },
      { key: 'r', label: 'Probe r', unit: 'm', defaultVal: 0.2, min: 0.0001 },
    ],
    compute: (v) => {
      const Q = v.QuC * 1e-6;
      const inside = v.r < v.R;
      const E = inside ? (KE * Q * v.r) / Math.pow(v.R, 3) : (KE * Q) / (v.r * v.r);
      const V = inside ? (KE * Q * (3 * v.R * v.R - v.r * v.r)) / (2 * Math.pow(v.R, 3)) : (KE * Q) / v.r;
      const Vc = (1.5 * KE * Q) / v.R;
      return [
        { label: inside ? 'E (inside)' : 'E (outside)', value: formatSci(E), unit: 'N/C' },
        { label: inside ? 'V (inside)' : 'V (outside)', value: formatSci(V), unit: 'V' },
        { label: 'V_center', value: formatSci(Vc), unit: 'V' },
        { label: 'V_c − V_surf', value: formatSci((KE * Q) / (2 * v.R)), unit: 'V' },
      ];
    },
  },
  {
    formulaId: 'elec-concentric-shells',
    title: 'Concentric Shells (V₁, V₂, ΔV)',
    inputs: [
      { key: 'Q1uC', label: 'Inner Q₁', unit: 'μC', defaultVal: 4 },
      { key: 'Q2uC', label: 'Outer Q₂', unit: 'μC', defaultVal: -6 },
      { key: 'R1', label: 'Radius R₁', unit: 'm', defaultVal: 0.2, min: 0.001 },
      { key: 'R2', label: 'Radius R₂', unit: 'm', defaultVal: 0.5, min: 0.002 },
    ],
    compute: (v) => {
      const q1 = v.Q1uC * 1e-6;
      const q2 = v.Q2uC * 1e-6;
      const V1 = KE * (q1 / v.R1 + q2 / v.R2);
      const V2 = KE * ((q1 + q2) / v.R2);
      return [
        { label: 'V₁ (inner)', value: formatSci(V1), unit: 'V' },
        { label: 'V₂ (outer)', value: formatSci(V2), unit: 'V' },
        { label: 'ΔV = V₁ − V₂', value: formatSci(V1 - V2), unit: 'V' },
      ];
    },
  },
  {
    formulaId: 'elec-cavity-sphere',
    title: 'Spherical Cavity Superposition Calculator',
    inputs: [
      { key: 'rhouC', label: 'Density ρ', unit: 'μC/m³', defaultVal: 50 },
      { key: 'R', label: 'Main R', unit: 'm', defaultVal: 1.0, min: 0.01 },
      { key: 'b', label: 'Cavity b', unit: 'm', defaultVal: 0.3, min: 0.001 },
      { key: 'a', label: 'Offset a', unit: 'm', defaultVal: 0.4, min: 0 },
    ],
    compute: (v) => {
      const rho = v.rhouC * 1e-6;
      const E = ((4 * Math.PI * KE * rho) / 3) * v.a;
      const VO2 = 2 * Math.PI * KE * rho * (v.R * v.R - (v.a * v.a) / 3 - v.b * v.b);
      return [
        { label: 'E_cavity (uniform)', value: formatSci(E), unit: 'N/C' },
        { label: 'V at cavity center O₂', value: formatSci(VO2), unit: 'V' },
      ];
    },
  },
  {
    formulaId: 'elec-dipole-general',
    title: 'Electric Dipole General Point (r, θ)',
    inputs: [
      { key: 'puC', label: 'Dipole p', unit: 'μC·m', defaultVal: 2 },
      { key: 'r', label: 'Distance r', unit: 'm', defaultVal: 1.5, min: 0.01 },
      { key: 'thetaDeg', label: 'Angle θ', unit: 'deg', defaultVal: 60 },
    ],
    compute: (v) => {
      const th = (v.thetaDeg * Math.PI) / 180;
      const p = v.puC * 1e-6;
      const E = ((KE * p) / Math.pow(v.r, 3)) * Math.sqrt(1 + 3 * Math.cos(th) ** 2);
      const V = (KE * p * Math.cos(th)) / (v.r * v.r);
      const alphaDeg = (Math.atan(0.5 * Math.tan(th)) * 180) / Math.PI;
      return [
        { label: 'E(r, θ)', value: formatSci(E), unit: 'N/C' },
        { label: 'V(r, θ)', value: formatSci(V), unit: 'V' },
        { label: 'Angle α (from r)', value: formatSci(alphaDeg, 3), unit: '°' },
      ];
    },
  },
  {
    formulaId: 'elec-cap-dielectric',
    title: 'Parallel-Plate Capacitor & Dielectric Slab',
    inputs: [
      { key: 'Acm2', label: 'Area A', unit: 'cm²', defaultVal: 100, min: 0.1 },
      { key: 'dmm', label: 'Gap d', unit: 'mm', defaultVal: 5, min: 0.01 },
      { key: 'tmm', label: 'Slab t', unit: 'mm', defaultVal: 2, min: 0 },
      { key: 'K', label: 'Dielectric K', unit: 'rel', defaultVal: 4, min: 1 },
    ],
    compute: (v) => {
      const A = v.Acm2 * 1e-4;
      const d = v.dmm * 1e-3;
      const t = Math.min(d, v.tmm * 1e-3);
      const C0 = (EPS0 * A) / d;
      const Cslab = (EPS0 * A) / (d - t + t / v.K);
      const Cmetal = d - t > 1e-9 ? (EPS0 * A) / (d - t) : Infinity;
      return [
        { label: 'C₀ (air)', value: formatSci(C0 * 1e12), unit: 'pF' },
        { label: 'C (slab t, K)', value: formatSci(Cslab * 1e12), unit: 'pF' },
        { label: 'C (metal slab t)', value: Number.isFinite(Cmetal) ? formatSci(Cmetal * 1e12) : '∞', unit: 'pF' },
      ];
    },
  },
  {
    formulaId: 'elec-cap-sharing',
    title: 'Capacitor Sharing & Heat Loss',
    inputs: [
      { key: 'C1uF', label: 'C₁', unit: 'μF', defaultVal: 4, min: 0.01 },
      { key: 'V1', label: 'V₁', unit: 'V', defaultVal: 100 },
      { key: 'C2uF', label: 'C₂', unit: 'μF', defaultVal: 6, min: 0.01 },
      { key: 'V2', label: 'V₂', unit: 'V', defaultVal: 20 },
    ],
    compute: (v) => {
      const C1 = v.C1uF * 1e-6;
      const C2 = v.C2uF * 1e-6;
      const Vcom = (C1 * v.V1 + C2 * v.V2) / (C1 + C2);
      const loss = (C1 * C2 * (v.V1 - v.V2) ** 2) / (2 * (C1 + C2));
      return [
        { label: 'V_common', value: formatSci(Vcom), unit: 'V' },
        { label: 'Heat Loss ΔU', value: formatSci(loss * 1e3), unit: 'mJ' },
      ];
    },
  },
  {
    formulaId: 'curr-rc-general',
    title: 'RC Charging / Transient Calculator',
    inputs: [
      { key: 'Rohm', label: 'Resistance R', unit: 'Ω', defaultVal: 1000, min: 0.1 },
      { key: 'CuF', label: 'Capacitance C', unit: 'μF', defaultVal: 10, min: 0.01 },
      { key: 'V0', label: 'Supply V', unit: 'V', defaultVal: 12 },
      { key: 'tms', label: 'Time t', unit: 'ms', defaultVal: 10, min: 0 },
    ],
    compute: (v) => {
      const tau = v.Rohm * v.CuF * 1e-6;
      const t = v.tms * 1e-3;
      const factor = 1 - Math.exp(-t / tau);
      const Vc = v.V0 * factor;
      const I = (v.V0 / v.Rohm) * Math.exp(-t / tau);
      return [
        { label: 'τ = RC', value: formatSci(tau * 1e3), unit: 'ms' },
        { label: 'V_C(t) charging', value: formatSci(Vc), unit: 'V' },
        { label: 'I(t) current', value: formatSci(I * 1e3), unit: 'mA' },
      ];
    },
  },
  {
    formulaId: 'mag-finite-solenoid',
    title: 'Finite Solenoid B_axis Calculator',
    inputs: [
      { key: 'n', label: 'Turns/m (n)', unit: 'm⁻¹', defaultVal: 2000, min: 1 },
      { key: 'I', label: 'Current I', unit: 'A', defaultVal: 4 },
      { key: 'a1Deg', label: 'α₁ (from ⊥)', unit: 'deg', defaultVal: 45 },
      { key: 'a2Deg', label: 'α₂ (from ⊥)', unit: 'deg', defaultVal: 45 },
    ],
    compute: (v) => {
      const a1 = (v.a1Deg * Math.PI) / 180;
      const a2 = (v.a2Deg * Math.PI) / 180;
      const B = 2 * Math.PI * KM * v.n * v.I * (Math.sin(a1) + Math.sin(a2));
      const Binf = 4 * Math.PI * KM * v.n * v.I;
      return [
        { label: 'B_axis (finite)', value: formatSci(B * 1e3), unit: 'mT' },
        { label: 'B_inside (infinite)', value: formatSci(Binf * 1e3), unit: 'mT' },
      ];
    },
  },
  {
    formulaId: 'mag-solenoid-toroid',
    title: 'Ideal Solenoid & Toroid Calculator',
    inputs: [
      { key: 'N', label: 'Total Turns N', unit: 'turns', defaultVal: 500, min: 1 },
      { key: 'L', label: 'Length / Mean 2πr', unit: 'm', defaultVal: 0.5, min: 0.01 },
      { key: 'I', label: 'Current I', unit: 'A', defaultVal: 3 },
    ],
    compute: (v) => {
      const n = v.N / v.L;
      const B = MU0 * n * v.I;
      return [
        { label: 'n = N/L', value: formatSci(n), unit: 'm⁻¹' },
        { label: 'B_inside = μ₀nI', value: formatSci(B * 1e3), unit: 'mT' },
        { label: 'B_end = ½μ₀nI', value: formatSci(0.5 * B * 1e3), unit: 'mT' },
      ];
    },
  },
  {
    formulaId: 'mag-circle',
    title: 'Charge Circular Orbit & Cyclotron (v ⊥ B)',
    inputs: [
      { key: 'q', label: 'Charge (in e)', unit: 'e', defaultVal: 1 },
      { key: 'm', label: 'Mass (in m_p)', unit: 'm_p', defaultVal: 1, min: 0.0001 },
      { key: 'v', label: 'Speed v', unit: '×10⁶ m/s', defaultVal: 2 },
      { key: 'B', label: 'Field B', unit: 'T', defaultVal: 0.5, min: 0.001 },
    ],
    compute: (v) => {
      const qC = Math.abs(v.q) * 1.602e-19;
      const mkg = v.m * 1.6726e-27;
      const vsi = v.v * 1e6;
      const r = (mkg * vsi) / (qC * v.B);
      const T = (2 * Math.PI * mkg) / (qC * v.B);
      return [
        { label: 'Radius r', value: formatSci(r * 100), unit: 'cm' },
        { label: 'Period T', value: formatSci(T * 1e9), unit: 'ns' },
        { label: 'Freq f', value: formatSci(1 / T / 1e6), unit: 'MHz' },
      ];
    },
  },
  {
    formulaId: 'ac-rlc-impedance',
    title: 'Series RLC Impedance, Resonance & Power Factor',
    inputs: [
      { key: 'R', label: 'R', unit: 'Ω', defaultVal: 30, min: 0.1 },
      { key: 'LmH', label: 'L', unit: 'mH', defaultVal: 100, min: 0 },
      { key: 'CuF', label: 'C', unit: 'μF', defaultVal: 40, min: 0.001 },
      { key: 'fHz', label: 'Frequency f', unit: 'Hz', defaultVal: 50, min: 0.1 },
      { key: 'Vrms', label: 'V_rms', unit: 'V', defaultVal: 220 },
    ],
    compute: (v) => {
      const w = 2 * Math.PI * v.fHz;
      const XL = w * v.LmH * 1e-3;
      const XC = 1 / (w * v.CuF * 1e-6);
      const Z = Math.hypot(v.R, XL - XC);
      const Irms = v.Vrms / Z;
      const pf = v.R / Z;
      const f0 = 1 / (2 * Math.PI * Math.sqrt(v.LmH * 1e-3 * v.CuF * 1e-6));
      return [
        { label: 'X_L / X_C', value: `${formatSci(XL, 3)} / ${formatSci(XC, 3)}`, unit: 'Ω' },
        { label: 'Z = √(R²+(X_L−X_C)²)', value: formatSci(Z), unit: 'Ω' },
        { label: 'I_rms', value: formatSci(Irms), unit: 'A' },
        { label: 'Resonant f₀', value: formatSci(f0), unit: 'Hz' },
        { label: 'cosφ (Power Factor)', value: formatSci(pf, 3), unit: '' },
      ];
    },
  },
  {
    formulaId: 'em-speed',
    title: 'EM Wave E₀, B₀ & Energy Density',
    inputs: [
      { key: 'E0', label: 'E₀ amplitude', unit: 'V/m', defaultVal: 300 },
    ],
    compute: (v) => {
      const B0 = v.E0 / C_LIGHT;
      const uAvg = 0.5 * EPS0 * v.E0 * v.E0;
      const I = uAvg * C_LIGHT;
      return [
        { label: 'B₀ = E₀/c', value: formatSci(B0), unit: 'T' },
        { label: 'Avg u = ½ε₀E₀²', value: formatSci(uAvg), unit: 'J/m³' },
        { label: 'Intensity I = u·c', value: formatSci(I), unit: 'W/m²' },
      ];
    },
  },
  {
    formulaId: 'mod-photon-energy',
    title: 'Photon Energy, Momentum & Beam Radiation Force',
    inputs: [
      { key: 'lamNm', label: 'Wavelength λ', unit: 'nm', defaultVal: 400, min: 0.01 },
      { key: 'powerW', label: 'Beam Power P', unit: 'W', defaultVal: 30, min: 0 },
    ],
    compute: (v) => {
      const Eev = 1240 / v.lamNm;
      const p = (6.626e-34) / (v.lamNm * 1e-9);
      const fabs = v.powerW / C_LIGHT;
      return [
        { label: 'Photon E ≈ 1240/λ', value: formatSci(Eev), unit: 'eV' },
        { label: 'Momentum p = h/λ', value: formatSci(p), unit: 'kg·m/s' },
        { label: 'Force (100% abs)', value: formatSci(fabs), unit: 'N' },
        { label: 'Force (100% refl)', value: formatSci(2 * fabs), unit: 'N' },
      ];
    },
  },
  {
    formulaId: 'mod-einstein-pe',
    title: 'Photoelectric K_max, V₀ & Threshold λ₀',
    inputs: [
      { key: 'lamNm', label: 'Incident λ', unit: 'nm', defaultVal: 300, min: 1 },
      { key: 'phiEv', label: 'Work Function φ', unit: 'eV', defaultVal: 2.3, min: 0.1 },
    ],
    compute: (v) => {
      const Eev = 1240 / v.lamNm;
      const kmax = Math.max(0, Eev - v.phiEv);
      const lam0 = 1240 / v.phiEv;
      return [
        { label: 'Photon Energy hν', value: formatSci(Eev), unit: 'eV' },
        { label: 'K_max = eV₀', value: kmax > 0 ? formatSci(kmax) : '0 (No emission)', unit: kmax > 0 ? 'eV' : '' },
        { label: 'Stopping V₀', value: formatSci(kmax), unit: 'V' },
        { label: 'Threshold λ₀', value: formatSci(lam0), unit: 'nm' },
      ];
    },
  },
  {
    formulaId: 'mod-debroglie',
    title: 'de-Broglie Wavelength (e⁻, p, α) at Potential V',
    inputs: [
      { key: 'V', label: 'Accelerating V', unit: 'V', defaultVal: 100, min: 0.01 },
    ],
    compute: (v) => {
      const sv = Math.sqrt(v.V);
      return [
        { label: 'λ_electron', value: formatSci(12.27 / sv), unit: 'Å' },
        { label: 'λ_proton', value: formatSci(0.286 / sv), unit: 'Å' },
        { label: 'λ_alpha', value: formatSci(0.101 / sv), unit: 'Å' },
      ];
    },
  },
  {
    formulaId: 'mod-bohr-quantization',
    title: 'Bohr Orbit r_n, v_n & Energy Levels',
    inputs: [
      { key: 'Z', label: 'Atomic No. Z', unit: '', defaultVal: 1, min: 1, step: 1 },
      { key: 'n', label: 'Orbit n', unit: '', defaultVal: 2, min: 1, step: 1 },
    ],
    compute: (v) => {
      const rn = 0.529 * ((v.n * v.n) / v.Z);
      const vn = 2.18e6 * (v.Z / v.n);
      const En = -13.6 * ((v.Z * v.Z) / (v.n * v.n));
      return [
        { label: 'Radius r_n', value: formatSci(rn), unit: 'Å' },
        { label: 'Speed v_n', value: formatSci(vn), unit: 'm/s' },
        { label: 'Total E_n = −K', value: formatSci(En), unit: 'eV' },
        { label: 'Potential U_n = 2E_n', value: formatSci(2 * En), unit: 'eV' },
      ];
    },
  },
  {
    formulaId: 'mod-spectral-lines',
    title: 'Rydberg Spectral Transition (n₂ → n₁)',
    inputs: [
      { key: 'Z', label: 'Atomic No. Z', unit: '', defaultVal: 1, min: 1, step: 1 },
      { key: 'n1', label: 'Lower n₁', unit: '', defaultVal: 2, min: 1, step: 1 },
      { key: 'n2', label: 'Upper n₂', unit: '', defaultVal: 3, min: 2, step: 1 },
    ],
    compute: (v) => {
      const R = 1.097e7;
      if (v.n2 <= v.n1) {
        return [{ label: 'Condition', value: 'Need n₂ > n₁', unit: '' }];
      }
      const invLam = R * v.Z * v.Z * (1 / (v.n1 * v.n1) - 1 / (v.n2 * v.n2));
      const lamNm = (1 / invLam) * 1e9;
      const dE = 13.6 * v.Z * v.Z * (1 / (v.n1 * v.n1) - 1 / (v.n2 * v.n2));
      const lines = (v.n2 * (v.n2 - 1)) / 2;
      return [
        { label: 'Wavelength λ', value: formatSci(lamNm), unit: 'nm' },
        { label: 'Photon ΔE', value: formatSci(dE), unit: 'eV' },
        { label: 'Max lines (n₂→1)', value: String(lines), unit: 'lines' },
      ];
    },
  },
  {
    formulaId: 'semi-zener-regulator',
    title: 'Zener Voltage Regulator Currents',
    inputs: [
      { key: 'Vin', label: 'Supply V_in', unit: 'V', defaultVal: 15, min: 0 },
      { key: 'Vz', label: 'Zener V_Z', unit: 'V', defaultVal: 9, min: 0.5 },
      { key: 'Rs', label: 'Series R_s', unit: 'Ω', defaultVal: 200, min: 1 },
      { key: 'RL', label: 'Load R_L', unit: 'Ω', defaultVal: 600, min: 1 },
    ],
    compute: (v) => {
      const vThev = (v.Vin * v.RL) / (v.Rs + v.RL);
      const inBreakdown = vThev >= v.Vz;
      if (!inBreakdown) {
        const iLoad = v.Vin / (v.Rs + v.RL);
        return [
          { label: 'Status', value: 'OFF (Below V_Z)', unit: '' },
          { label: 'V_load', value: formatSci(vThev), unit: 'V' },
          { label: 'I_s = I_L', value: formatSci(iLoad * 1e3), unit: 'mA' },
          { label: 'I_Z', value: '0', unit: 'mA' },
        ];
      }
      const Is = (v.Vin - v.Vz) / v.Rs;
      const IL = v.Vz / v.RL;
      const IZ = Is - IL;
      return [
        { label: 'Status', value: 'Regulating (ON)', unit: '' },
        { label: 'I_s (series)', value: formatSci(Is * 1e3), unit: 'mA' },
        { label: 'I_L (load)', value: formatSci(IL * 1e3), unit: 'mA' },
        { label: 'I_Z (Zener)', value: formatSci(IZ * 1e3), unit: 'mA' },
      ];
    },
  },
  {
    formulaId: 'ray-mirror-formula',
    title: 'Spherical Mirror (v, m & Longitudinal m_L)',
    inputs: [
      { key: 'u', label: 'Object u (signed)', unit: 'cm', defaultVal: -30 },
      { key: 'f', label: 'Focal f (signed)', unit: 'cm', defaultVal: -20 },
    ],
    compute: (v) => {
      if (Math.abs(v.u - v.f) < 1e-6) {
        return [{ label: 'Image v', value: '∞ (at focus)', unit: 'cm' }];
      }
      const imgV = (v.u * v.f) / (v.u - v.f);
      const m = -imgV / v.u;
      return [
        { label: 'Image v', value: formatSci(imgV), unit: 'cm' },
        { label: 'Lateral m = −v/u', value: formatSci(m), unit: '×' },
        { label: 'Longitudinal m_L', value: formatSci(-m * m), unit: '×' },
      ];
    },
  },
  {
    formulaId: 'ray-lens-maker',
    title: "Lens Maker's Formula & Liquid Immersion",
    inputs: [
      { key: 'nLens', label: 'n_lens', unit: '', defaultVal: 1.5, min: 1 },
      { key: 'nMed', label: 'n_medium', unit: '', defaultVal: 1.0, min: 1 },
      { key: 'R1', label: 'R₁ (signed)', unit: 'cm', defaultVal: 20 },
      { key: 'R2', label: 'R₂ (signed)', unit: 'cm', defaultVal: -20 },
    ],
    compute: (v) => {
      const invF = (v.nLens / v.nMed - 1) * (1 / v.R1 - 1 / v.R2);
      if (Math.abs(invF) < 1e-9) {
        return [{ label: 'Focal f', value: '∞ (plane glass)', unit: 'cm' }];
      }
      const fCm = 1 / invF;
      const P = 100 / fCm;
      return [
        { label: 'Focal Length f', value: formatSci(fCm), unit: 'cm' },
        { label: 'Power P = 1/f(m)', value: formatSci(P), unit: 'D' },
        { label: 'Behavior', value: fCm > 0 ? 'Converging' : 'Diverging', unit: '' },
      ];
    },
  },
  {
    formulaId: 'ray-prism',
    title: 'Prism Refractive Index n & Thin Deviation',
    inputs: [
      { key: 'Adeg', label: 'Prism Angle A', unit: '°', defaultVal: 60, min: 1, max: 120 },
      { key: 'dmDeg', label: 'Min Dev δ_m', unit: '°', defaultVal: 37.2, min: 0, max: 120 },
    ],
    compute: (v) => {
      const A = (v.Adeg * Math.PI) / 180;
      const dm = (v.dmDeg * Math.PI) / 180;
      const n = Math.sin((A + dm) / 2) / Math.sin(A / 2);
      const thinDelta = (n - 1) * v.Adeg;
      const icDeg = n > 1 ? (Math.asin(1 / n) * 180) / Math.PI : 90;
      return [
        { label: 'Index n', value: formatSci(n, 4), unit: '' },
        { label: 'Thin approx (n−1)A', value: formatSci(thinDelta, 3), unit: '°' },
        { label: 'Critical angle i_c', value: formatSci(icDeg, 3), unit: '°' },
      ];
    },
  },
  {
    formulaId: 'wave-ydse',
    title: 'YDSE Fringe Width β, Liquid β′ & Slab Shift Δy',
    inputs: [
      { key: 'lamNm', label: 'Wavelength λ', unit: 'nm', defaultVal: 600, min: 100 },
      { key: 'dmm', label: 'Slit sep d', unit: 'mm', defaultVal: 1.0, min: 0.05 },
      { key: 'D', label: 'Screen D', unit: 'm', defaultVal: 1.5, min: 0.1 },
      { key: 'nLiq', label: 'Liquid n', unit: '', defaultVal: 1.0, min: 1 },
      { key: 'tum', label: 'Slab t', unit: 'μm', defaultVal: 2.0, min: 0 },
      { key: 'nSlab', label: 'Slab n_s', unit: '', defaultVal: 1.5, min: 1 },
    ],
    compute: (v) => {
      const lam = v.lamNm * 1e-9;
      const d = v.dmm * 1e-3;
      const betaMm = ((lam * v.D) / d) * 1e3;
      const betaLiqMm = betaMm / v.nLiq;
      const shiftMm = ((v.D / d) * (v.nSlab - 1) * v.tum * 1e-6) * 1e3;
      return [
        { label: 'Air β = λD/d', value: formatSci(betaMm, 4), unit: 'mm' },
        { label: 'Liquid β′ = β/n', value: formatSci(betaLiqMm, 4), unit: 'mm' },
        { label: 'Slab Shift Δy', value: formatSci(shiftMm, 4), unit: 'mm' },
      ];
    },
  },
  {
    formulaId: 'wave-single-slit',
    title: 'Single-Slit Central Maximum Width',
    inputs: [
      { key: 'lamNm', label: 'Wavelength λ', unit: 'nm', defaultVal: 550, min: 100 },
      { key: 'amm', label: 'Slit Width a', unit: 'mm', defaultVal: 0.25, min: 0.01 },
      { key: 'D', label: 'Screen D', unit: 'm', defaultVal: 1.2, min: 0.1 },
    ],
    compute: (v) => {
      const lam = v.lamNm * 1e-9;
      const a = v.amm * 1e-3;
      const Wmm = ((2 * lam * v.D) / a) * 1e3;
      const thetaDeg = (((2 * lam) / a) * 180) / Math.PI;
      return [
        { label: 'Linear W_central', value: formatSci(Wmm, 4), unit: 'mm' },
        { label: 'Angular θ_central', value: formatSci(thetaDeg, 4), unit: '°' },
      ];
    },
  },
  {
    formulaId: 'wave-polarization',
    title: "Malus's Law & Brewster Angle Calculator",
    inputs: [
      { key: 'I0', label: 'Unpolarized I₀', unit: 'W/m²', defaultVal: 100, min: 0 },
      { key: 'thetaDeg', label: 'Analyzer θ', unit: '°', defaultVal: 60 },
      { key: 'n', label: 'Medium Index n', unit: '', defaultVal: 1.5, min: 1 },
    ],
    compute: (v) => {
      const afterFirst = 0.5 * v.I0;
      const rad = (v.thetaDeg * Math.PI) / 180;
      const afterSecond = afterFirst * Math.pow(Math.cos(rad), 2);
      const ibDeg = (Math.atan(v.n) * 180) / Math.PI;
      return [
        { label: 'After 1st Polarizer', value: formatSci(afterFirst), unit: 'W/m²' },
        { label: 'After Analyzer (Malus)', value: formatSci(afterSecond), unit: 'W/m²' },
        { label: 'Brewster Angle i_B', value: formatSci(ibDeg, 4), unit: '°' },
      ];
    },
  },
  {
    formulaId: 'mod-rutherford-scattering',
    title: 'Rutherford α Closest Approach r₀ & Impact Parameter b',
    inputs: [
      { key: 'Z', label: 'Target Atomic No. Z', unit: '', defaultVal: 79, min: 1 },
      { key: 'KMeV', label: 'α Kinetic Energy K', unit: 'MeV', defaultVal: 5.5, min: 0.01 },
      { key: 'thetaDeg', label: 'Scattering Angle θ', unit: '°', defaultVal: 90, min: 1, max: 179 },
    ],
    compute: (v) => {
      const kE = 1.602176634e-19 * KE;
      const r0Fm = ((2 * v.Z * kE) / (v.KMeV * 1e6)) * 1e15;
      const halfRad = (v.thetaDeg * Math.PI) / 360;
      const bFm = ((v.Z * kE) / (v.KMeV * 1e6)) * (1 / Math.tan(halfRad)) * 1e15;
      return [
        { label: 'Closest approach r₀', value: formatSci(r0Fm, 4), unit: 'fm' },
        { label: 'r₀ (meters)', value: formatSci(r0Fm * 1e-15, 4), unit: 'm' },
        { label: 'Impact param b(θ)', value: formatSci(bFm, 4), unit: 'fm' },
      ];
    },
  },
  {
    formulaId: 'mod-nuclear-qvalue',
    title: 'Nuclear Reaction Q-Value & Threshold Energy K_th',
    inputs: [
      { key: 'dmU', label: 'Mass Change (m_R − m_P)', unit: 'u', defaultVal: 0.01888, min: -1, max: 1, step: 0.001 },
      { key: 'mx', label: 'Projectile Mass m_x', unit: 'u', defaultVal: 4, min: 0.0005 },
      { key: 'MX', label: 'Target Mass M_X', unit: 'u', defaultVal: 14, min: 1 },
    ],
    compute: (v) => {
      const Q = v.dmU * 931.5;
      const kth = Q < 0 ? Math.abs(Q) * (1 + v.mx / v.MX) : 0;
      return [
        { label: 'Q-Value', value: formatSci(Q, 4), unit: 'MeV' },
        { label: 'Reaction Type', value: Q >= 0 ? 'Exothermic' : 'Endothermic', unit: '' },
        { label: 'Threshold K_th', value: formatSci(kth, 4), unit: 'MeV' },
      ];
    },
  },
  {
    formulaId: 'ray-dispersion-achromatic',
    title: 'Dispersive Power ω, Thin Prism θ & Achromatic Doublet f₂',
    inputs: [
      { key: 'nv', label: 'Violet index n_v', unit: '', defaultVal: 1.532, min: 1.01, step: 0.001 },
      { key: 'nr', label: 'Red index n_r', unit: '', defaultVal: 1.514, min: 1.01, step: 0.001 },
      { key: 'ny', label: 'Mean index n_y', unit: '', defaultVal: 1.523, min: 1.01, step: 0.001 },
      { key: 'ADeg', label: 'Prism Angle A', unit: '°', defaultVal: 6, min: 0.5 },
      { key: 'f1Cm', label: 'Lens 1 focal f₁', unit: 'cm', defaultVal: 20 },
      { key: 'w2', label: 'Lens 2 ω₂', unit: '', defaultVal: 0.045, min: 0.001, step: 0.001 },
    ],
    compute: (v) => {
      const omega1 = (v.nv - v.nr) / Math.max(0.01, v.ny - 1);
      const thetaDeg = (v.nv - v.nr) * v.ADeg;
      const f2Cm = omega1 !== 0 ? -v.f1Cm * (v.w2 / omega1) : Infinity;
      return [
        { label: 'Dispersive power ω₁', value: formatSci(omega1, 4), unit: '' },
        { label: 'Angular disp. θ', value: formatSci(thetaDeg, 4), unit: '°' },
        { label: 'Achromatic f₂', value: formatSci(f2Cm, 4), unit: 'cm' },
      ];
    },
  },
  {
    formulaId: 'exp-lens-displacement',
    title: "Bessel's Lens Displacement Method (D, d & Object Height O)",
    inputs: [
      { key: 'D', label: 'Screen distance D', unit: 'cm', defaultVal: 100, min: 1 },
      { key: 'd', label: 'Lens shift d', unit: 'cm', defaultVal: 40, min: 0 },
      { key: 'I1', label: 'Image height I₁', unit: 'cm', defaultVal: 9, min: 0.01 },
      { key: 'I2', label: 'Image height I₂', unit: 'cm', defaultVal: 4, min: 0.01 },
    ],
    compute: (v) => {
      if (v.d >= v.D) {
        return [
          { label: 'Focal length f', value: 'Invalid (d ≥ D)', unit: '' },
          { label: 'Object height O', value: formatSci(Math.sqrt(v.I1 * v.I2), 4), unit: 'cm' },
          { label: 'D / (4f) check', value: 'd must be < D', unit: '' },
        ];
      }
      const f = (v.D * v.D - v.d * v.d) / (4 * v.D);
      const obj = Math.sqrt(v.I1 * v.I2);
      const ratio = f > 0 ? v.D / (4 * f) : 0;
      return [
        { label: 'Focal length f', value: formatSci(f, 4), unit: 'cm' },
        { label: 'Object height O = √(I₁I₂)', value: formatSci(obj, 4), unit: 'cm' },
        { label: 'Condition D ≥ 4f', value: `${formatSci(ratio, 3)}× (4f = ${formatSci(4 * f, 4)} cm)`, unit: '' },
      ];
    },
  },
  {
    formulaId: 'exp-travelling-microscope',
    title: 'Travelling Microscope Slab Refractive Index n',
    inputs: [
      { key: 'R1', label: 'Bare mark R₁', unit: 'cm', defaultVal: 2.15 },
      { key: 'R2', label: 'Through slab R₂', unit: 'cm', defaultVal: 3.15 },
      { key: 'R3', label: 'Top powder R₃', unit: 'cm', defaultVal: 5.15 },
    ],
    compute: (v) => {
      const realT = v.R3 - v.R1;
      const appT = v.R3 - v.R2;
      const n = appT !== 0 ? realT / appT : Infinity;
      const shift = v.R2 - v.R1;
      return [
        { label: 'Real thickness (R₃−R₁)', value: formatSci(realT, 4), unit: 'cm' },
        { label: 'Apparent (R₃−R₂)', value: formatSci(appT, 4), unit: 'cm' },
        { label: 'Refractive index n', value: formatSci(n, 4), unit: `(shift ${formatSci(shift, 3)} cm)` },
      ];
    },
  },
  {
    formulaId: 'exp-galvanometer-half-deflection',
    title: 'Half-Deflection Galvanometer G & Figure of Merit k',
    inputs: [
      { key: 'emf', label: 'Cell EMF ε', unit: 'V', defaultVal: 2.0, min: 0.1 },
      { key: 'R', label: 'Series Box R', unit: 'Ω', defaultVal: 4950, min: 1 },
      { key: 'S', label: 'Half-deflection Shunt S', unit: 'Ω', defaultVal: 50, min: 0.1 },
      { key: 'theta', label: 'Initial Deflection θ', unit: 'div', defaultVal: 20, min: 1 },
    ],
    compute: (v) => {
      const G = v.R > v.S ? (v.R * v.S) / (v.R - v.S) : Infinity;
      const k = Number.isFinite(G) ? v.emf / ((v.R + G) * v.theta) : Infinity;
      return [
        { label: 'Exact G = RS/(R−S)', value: formatSci(G, 4), unit: 'Ω' },
        { label: 'Approx S (R ≫ S)', value: formatSci(v.S, 4), unit: 'Ω' },
        { label: 'Figure of merit k', value: formatSci(k * 1e6, 4), unit: 'μA/div' },
      ];
    },
  },
];

export const CALCULATOR_MAP: Record<string, FormulaCalculatorDef> = Object.fromEntries(
  CALCULATORS.map((c) => [c.formulaId, c])
);

export function getCalculatorForFormula(formulaId: string): FormulaCalculatorDef | undefined {
  return CALCULATOR_MAP[formulaId];
}

// Safe sandbox evaluator supporting physics constants & basic math functions
export function evaluatePhysicsExpression(expr: string): { ok: true; value: number } | { ok: false; error: string } {
  const cleaned = expr
    .trim()
    .replace(/×/g, '*')
    .replace(/÷/g, '/')
    .replace(/−/g, '-');

  if (!cleaned) return { ok: false, error: 'Enter an expression' };

  // Whitelist allowed tokens: numbers, operators, parens, constants, Math fns
  const stripped = cleaned
    .replace(/\b(ke|km|eps0|mu0|pi|e0|c|sqrt|sin|cos|tan|abs|ln|log|exp|pow)\b/gi, '')
    .replace(/[0-9+\-*/^().,\s]/g, '');

  if (stripped.length > 0) {
    return { ok: false, error: `Unsupported symbol: ${stripped}` };
  }

  const jsExpr = cleaned
    .replace(/\^/g, '**')
    .replace(/\bke\b/gi, `(${KE})`)
    .replace(/\bkm\b/gi, `(${KM})`)
    .replace(/\beps0\b/gi, `(${EPS0})`)
    .replace(/\bmu0\b/gi, `(${MU0})`)
    .replace(/\be0\b/gi, `(1.602176634e-19)`)
    .replace(/\bc\b/gi, `(${C_LIGHT})`)
    .replace(/\bpi\b/gi, `(Math.PI)`)
    .replace(/\bln\(/gi, 'Math.log(')
    .replace(/\blog\(/gi, 'Math.log10(')
    .replace(/\bsqrt\(/gi, 'Math.sqrt(')
    .replace(/\babs\(/gi, 'Math.abs(')
    .replace(/\bexp\(/gi, 'Math.exp(')
    .replace(/\bpow\(/gi, 'Math.pow(')
    .replace(/\bsin\(/gi, 'Math.sin((Math.PI/180)*')
    .replace(/\bcos\(/gi, 'Math.cos((Math.PI/180)*')
    .replace(/\btan\(/gi, 'Math.tan((Math.PI/180)*');

  try {
    // Fix unclosed extra paren for trig helpers if present via safe Function wrapper
    // Better: bind deg-trig functions in scope!
    const fn = new Function(
      'sin',
      'cos',
      'tan',
      'sqrt',
      'abs',
      'ln',
      'log',
      'exp',
      'pow',
      'ke',
      'km',
      'eps0',
      'mu0',
      'e0',
      'c',
      'pi',
      `"use strict"; return (${cleaned
        .replace(/\^/g, '**')
        .toLowerCase()});`
    );
    const result = fn(
      (deg: number) => Math.sin((deg * Math.PI) / 180),
      (deg: number) => Math.cos((deg * Math.PI) / 180),
      (deg: number) => Math.tan((deg * Math.PI) / 180),
      Math.sqrt,
      Math.abs,
      Math.log,
      Math.log10,
      Math.exp,
      Math.pow,
      KE,
      KM,
      EPS0,
      MU0,
      1.602176634e-19,
      C_LIGHT,
      Math.PI
    );
    void jsExpr;
    if (typeof result !== 'number' || !Number.isFinite(result)) {
      return { ok: false, error: 'Result is not finite' };
    }
    return { ok: true, value: result };
  } catch {
    return { ok: false, error: 'Invalid math syntax' };
  }
}
