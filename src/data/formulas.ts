import { ChapterMeta, Formula } from '../types/physics';
import { MASTER_MAP_FORMULAS } from './chapters/masterMap';
import { LINE_ARC_RING_FORMULAS } from './chapters/lineArcRing';
import { ELECTROSTATICS_FORMULAS } from './chapters/electrostatics';
import { CURRENT_FORMULAS } from './chapters/current';
import { MAGNETISM_FORMULAS } from './chapters/magnetism';
import { EMI_FORMULAS } from './chapters/emi';
import { AC_FORMULAS } from './chapters/ac';
import { EM_WAVES_FORMULAS } from './chapters/emWaves';
import { MODERN_PHYSICS_FORMULAS } from './chapters/modernPhysics';
import { SEMICONDUCTORS_FORMULAS } from './chapters/semiconductors';
import { RAY_OPTICS_FORMULAS } from './chapters/rayOptics';
import { WAVE_OPTICS_FORMULAS } from './chapters/waveOptics';
import { EXPERIMENTAL_SKILLS_FORMULAS } from './chapters/experimentalSkills';
import { CLASS_11_PHYSICS_FORMULAS } from './chapters/class11Physics';

export const CONSTANTS = [
  { symbol: 'k = \\frac{1}{4\\pi\\varepsilon_0}', value: '9 \\times 10^9\\text{ N}\\cdot\\text{m}^2/\\text{C}^2' },
  { symbol: "k' = \\frac{\\mu_0}{4\\pi}", value: '10^{-7}\\text{ T}\\cdot\\text{m/A}' },
  { symbol: '\\varepsilon_0', value: '8.85 \\times 10^{-12}\\text{ C}^2/\\text{N}\\cdot\\text{m}^2' },
  { symbol: '\\mu_0', value: '4\\pi \\times 10^{-7}\\text{ T}\\cdot\\text{m/A}' },
  { symbol: 'c', value: '3 \\times 10^8\\text{ m/s}' },
  { symbol: 'e', value: '1.6 \\times 10^{-19}\\text{ C}' },
  { symbol: 'h', value: '6.626 \\times 10^{-34}\\text{ J}\\cdot\\text{s}' },
  { symbol: 'hc', value: '1240\\text{ eV}\\cdot\\text{nm}' },
  { symbol: 'R_\\infty', value: '1.097 \\times 10^7\\text{ m}^{-1}' },
];

export const CHAPTERS: ChapterMeta[] = [
  {
    id: 'master-map',
    order: 0,
    title: '0. Master Map',
    shortTitle: 'Master Map',
    subtitle: 'Cross-chapter analogies, integration chains & circuit limit rules',
    accentColor: '#22d3ee',
  },
  {
    id: 'line-arc-ring',
    order: 1,
    title: '1. Line / Arc / Ring / Disc',
    shortTitle: 'Line · Arc · Ring',
    subtitle: 'Master Setup 1: E, V & B unified by geometry',
    accentColor: '#38bdf8',
  },
  {
    id: 'electrostatics',
    order: 2,
    title: '2. Electrostatics',
    shortTitle: 'Electrostatics',
    subtitle: 'Coulomb, Gauss law, dipoles & capacitor networks',
    accentColor: '#818cf8',
  },
  {
    id: 'current',
    order: 3,
    title: '3. Current Electricity & RC',
    shortTitle: 'Current & RC',
    subtitle: 'Drift, Kirchhoff, cells, bridges, meters & RC transients',
    accentColor: '#a855f7',
  },
  {
    id: 'magnetism',
    order: 4,
    title: '4. Magnetism & Moving Charges',
    shortTitle: 'Magnetism',
    subtitle: 'Biot–Savart, Ampere, Lorentz force, dipoles & materials',
    accentColor: '#c084fc',
  },
  {
    id: 'emi',
    order: 5,
    title: '5. EMI & Inductance',
    shortTitle: 'EMI & L',
    subtitle: 'Faraday–Lenz, motional EMF, inductance, LR & LC',
    accentColor: '#2dd4bf',
  },
  {
    id: 'ac',
    order: 6,
    title: '6. Alternating Current',
    shortTitle: 'AC & RLC',
    subtitle: 'Series RLC master circuit, resonance, Q-factor & transformer',
    accentColor: '#06b6d4',
  },
  {
    id: 'em-waves',
    order: 7,
    title: '7. EM Waves',
    shortTitle: 'EM Waves',
    subtitle: 'Displacement current, Maxwell wave eq, intensity & spectrum',
    accentColor: '#f472b6',
  },
  {
    id: 'modern-physics',
    order: 8,
    title: '8. Modern Physics',
    shortTitle: 'Modern Physics',
    subtitle: 'Photoelectric, de-Broglie, Rutherford, Bohr atom & nuclear Q-value',
    accentColor: '#38bdf8',
  },
  {
    id: 'semiconductors',
    order: 9,
    title: '9. Semiconductors & Logic Gates',
    shortTitle: 'Semiconductors',
    subtitle: 'Mass action, mobility, special diodes, Zener, rectifiers & Boolean gates',
    accentColor: '#34d399',
  },
  {
    id: 'ray-optics',
    order: 10,
    title: '10. Ray Optics & Instruments',
    shortTitle: 'Ray Optics',
    subtitle: 'Mirrors, refraction/TIR, Lens Maker, dispersion, prisms & microscopes',
    accentColor: '#fbbf24',
  },
  {
    id: 'wave-optics',
    order: 11,
    title: '11. Wave Optics',
    shortTitle: 'Wave Optics',
    subtitle: 'Huygens, YDSE, optical path shift, single-slit diffraction, resolving power & polarization',
    accentColor: '#fb7185',
  },
  {
    id: 'experimental-skills',
    order: 12,
    title: '12. Class 12 Experimental Skills (Unit 20)',
    shortTitle: 'Unit 20 · Labs',
    subtitle: 'u–v & displacement method, travelling microscope, metre bridge, half-deflection & diode I–V',
    accentColor: '#f59e0b',
  },
  {
    id: 'class11-mechanics',
    order: 13,
    title: '13. Class 11 Mechanics (Kinematics, NLOM & Work-Energy)',
    shortTitle: 'Class 11 · Mechanics',
    subtitle: 'Projectile motion, banking of roads, work-energy theorem & vertical circular motion',
    accentColor: '#38bdf8',
  },
  {
    id: 'class11-rotational',
    order: 14,
    title: '14. Class 11 Rotational Dynamics',
    shortTitle: 'Class 11 · Rotation',
    subtitle: 'Moment of inertia parallel/perpendicular axes, torque & pure rolling on incline',
    accentColor: '#818cf8',
  },
  {
    id: 'class11-gravitation',
    order: 15,
    title: '15. Class 11 Gravitation & Kepler Laws',
    shortTitle: 'Class 11 · Gravitation',
    subtitle: 'Gravitational force, orbital speed, escape velocity & Kepler third law',
    accentColor: '#c084fc',
  },
  {
    id: 'class11-properties',
    order: 16,
    title: "16. Class 11 Properties of Matter (Solids & Fluids)",
    shortTitle: 'Class 11 · Fluids',
    subtitle: "Young's modulus, surface tension excess pressure, Stokes' law & Bernoulli's theorem",
    accentColor: '#2dd4bf',
  },
  {
    id: 'class11-thermodynamics',
    order: 17,
    title: '17. Class 11 Thermodynamics & KTG',
    shortTitle: 'Class 11 · Thermo/KTG',
    subtitle: 'First law of thermodynamics, Carnot engine efficiency & gas RMS speed',
    accentColor: '#fbbf24',
  },
  {
    id: 'class11-waves-shm',
    order: 18,
    title: '18. Class 11 SHM & Waves',
    shortTitle: 'Class 11 · SHM & Waves',
    subtitle: 'SHM equation, simple pendulum, wave equation & standing waves in pipes',
    accentColor: '#fb7185',
  },
];

export const FORMULAS: Formula[] = [
  ...MASTER_MAP_FORMULAS,
  ...LINE_ARC_RING_FORMULAS,
  ...ELECTROSTATICS_FORMULAS,
  ...CURRENT_FORMULAS,
  ...MAGNETISM_FORMULAS,
  ...EMI_FORMULAS,
  ...AC_FORMULAS,
  ...EM_WAVES_FORMULAS,
  ...MODERN_PHYSICS_FORMULAS,
  ...SEMICONDUCTORS_FORMULAS,
  ...RAY_OPTICS_FORMULAS,
  ...WAVE_OPTICS_FORMULAS,
  ...EXPERIMENTAL_SKILLS_FORMULAS,
  ...CLASS_11_PHYSICS_FORMULAS,
];

export const FORMULA_MAP: Record<string, Formula> = Object.fromEntries(
  FORMULAS.map((f) => [f.id, f])
);

export function getFormulaById(id: string): Formula | undefined {
  return FORMULA_MAP[id];
}

export function getFormulasByChapter(chapterId: string): Formula[] {
  return FORMULAS.filter((f) => f.chapter === chapterId);
}
