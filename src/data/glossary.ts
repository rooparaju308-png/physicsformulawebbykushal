import { ChapterId } from '../types/physics';

export interface GlossaryTerm {
  id: string;
  term: string;
  symbol?: string;
  siUnit?: string;
  chapter: ChapterId;
  unitLabel: string;
  definition: string;
  jeeNote?: string;
  formulaIds: string[];
  relatedIds?: string[];
}

export const PHYSICS_GLOSSARY: GlossaryTerm[] = [
  {
    id: 'achromatic-doublet',
    term: 'Achromatic Doublet',
    symbol: 'ω₁/f₁ + ω₂/f₂ = 0',
    siUnit: 'focal length in m / cm',
    chapter: 'ray-optics',
    unitLabel: 'Unit 16 · Ray Optics',
    definition:
      'A pair of thin lenses placed in contact made from different optical glasses (crown + flint) whose net focal length is identical for violet and red wavelengths, eliminating chromatic aberration.',
    jeeNote:
      'Because dispersive power ω > 0 always, one lens must be converging (f₁ > 0) and the other diverging (f₂ < 0).',
    formulaIds: ['ray-dispersion-achromatic', 'ray-power-combo'],
    relatedIds: ['dispersive-power', 'lens-maker-equation'],
  },
  {
    id: 'ampere-circuital-law',
    term: "Ampère's Circuital Law",
    symbol: '∮ B·dl = μ₀ I_enc',
    siUnit: 'T·m',
    chapter: 'magnetism',
    unitLabel: 'Unit 13 · Magnetism',
    definition:
      'States that the line integral of the magnetic field B around any closed Amperian loop equals μ₀ times the net steady conduction current threading the surface bounded by that loop.',
    jeeNote:
      'For time-varying electric fields (e.g., charging capacitor), include displacement current I_d = ε₀ dΦ_E/dt (Ampère–Maxwell Law).',
    formulaIds: ['mag-ampere', 'em-displacement'],
    relatedIds: ['displacement-current', 'biot-savart-law'],
  },
  {
    id: 'apparent-depth',
    term: 'Apparent Depth & Normal Shift',
    symbol: 'd_app, Δx',
    siUnit: 'm',
    chapter: 'ray-optics',
    unitLabel: 'Unit 16 · Ray Optics',
    definition:
      'When viewed nearly normally through a plane refracting boundary or parallel slab of index n, an object appears shifted closer to the observer by Δx = t(1 − 1/n).',
    jeeNote:
      'Used directly in the Unit 20 Travelling Microscope experiment: n = (R₃ − R₁) / (R₃ − R₂).',
    formulaIds: ['ray-snell-tir-slab', 'exp-travelling-microscope'],
    relatedIds: ['total-internal-reflection', 'travelling-microscope'],
  },
  {
    id: 'bessels-displacement-method',
    term: "Bessel's Lens Displacement Method",
    symbol: 'f = (D² − d²)/(4D)',
    siUnit: 'm or cm',
    chapter: 'experimental-skills',
    unitLabel: 'Unit 20 · Experimental Skills',
    definition:
      'Experimental technique for finding the focal length of a convex lens using two conjugate lens positions separated by d that project sharp real images onto a fixed screen at distance D.',
    jeeNote:
      'Requires D ≥ 4f for real image formation; object height equals the geometric mean O = √(I₁I₂) since m₁m₂ = 1.',
    formulaIds: ['exp-lens-displacement', 'ray-thin-lens'],
    relatedIds: ['thin-lens-formula', 'index-error'],
  },
  {
    id: 'binding-energy',
    term: 'Binding Energy & Mass Defect',
    symbol: 'BE = Δm · c²',
    siUnit: 'MeV (or J)',
    chapter: 'modern-physics',
    unitLabel: 'Unit 18 · Atoms & Nuclei',
    definition:
      'Minimum energy required to completely separate a nucleus into its free constituent nucleons, equal to the energy equivalent of its mass defect Δm = [Z m_p + (A−Z) m_n] − M_nucleus.',
    jeeNote:
      '1 u ≡ 931.5 MeV/c². Binding energy per nucleon (BE/A) peaks around ⁵⁶Fe (~8.8 MeV), explaining fusion of light and fission of heavy nuclei.',
    formulaIds: ['mod-binding-energy', 'mod-nuclear-qvalue'],
    relatedIds: ['nuclear-q-value', 'nuclear-density'],
  },
  {
    id: 'biot-savart-law',
    term: 'Biot–Savart Law',
    symbol: 'dB = (μ₀/4π)(I dl × r̂)/r²',
    siUnit: 'T (Tesla)',
    chapter: 'magnetism',
    unitLabel: 'Unit 13 · Magnetism',
    definition:
      'Gives the infinitesimal magnetic field vector dB produced at position r by a steady current element I dl, directed perpendicular to both dl and r̂.',
    jeeNote:
      'Master analog of Coulomb’s law for steady currents; integrates cleanly into straight-wire, circular-arc, and ring-axis field formulas.',
    formulaIds: ['mag-biot-savart', 'mag-arc-loop-ring'],
    relatedIds: ['ampere-circuital-law', 'lorentz-force'],
  },
  {
    id: 'bohr-magneton',
    term: 'Bohr Magneton',
    symbol: 'μ_B = eh / (4πm_e)',
    siUnit: 'A·m² (or J/T)',
    chapter: 'magnetism',
    unitLabel: 'Unit 13 · Magnetism',
    definition:
      'Fundamental quantum unit of magnetic dipole moment associated with an orbital electron in the ground-state Bohr orbit (n = 1), equal to ≈ 9.27 × 10⁻²⁴ A·m².',
    jeeNote:
      'Derived from μ = (e / 2m_e) L with quantized orbital angular momentum L = nh/(2π) at n = 1.',
    formulaIds: ['mag-orbit-bohr', 'mod-bohr-quantization'],
    relatedIds: ['bohr-quantization', 'magnetic-dipole-moment'],
  },
  {
    id: 'bohr-quantization',
    term: 'Bohr Orbit Quantization',
    symbol: 'L = mvr = nh / (2π)',
    siUnit: 'J·s',
    chapter: 'modern-physics',
    unitLabel: 'Unit 18 · Atoms & Nuclei',
    definition:
      'Postulate that electrons in hydrogen-like species occupy discrete stationary orbits whose angular momentum is an integral multiple of ħ = h/(2π), yielding r_n ∝ n²/Z and E_n = −13.6 Z²/n² eV.',
    jeeNote:
      'Total energy E_total = −K = U/2. As n increases, kinetic energy K decreases while U and E_total increase toward 0.',
    formulaIds: ['mod-bohr-quantization', 'mod-spectral-lines'],
    relatedIds: ['rydberg-formula', 'de-broglie-wavelength'],
  },
  {
    id: 'brewsters-angle',
    term: "Brewster's Angle",
    symbol: 'i_B = tan⁻¹(n)',
    siUnit: 'rad or °',
    chapter: 'wave-optics',
    unitLabel: 'Unit 16 · Wave Optics',
    definition:
      'Angle of incidence at which light reflected from a transparent dielectric boundary becomes completely plane-polarized perpendicular to the plane of incidence.',
    jeeNote:
      'At i = i_B, the reflected and refracted rays are strictly perpendicular (i_B + r = 90°).',
    formulaIds: ['wave-polarization'],
    relatedIds: ['malus-law', 'snells-law'],
  },
  {
    id: 'capacitor-energy-sharing',
    term: 'Capacitor Charge Sharing & Loss',
    symbol: 'V_common, ΔU',
    siUnit: 'V, J',
    chapter: 'electrostatics',
    unitLabel: 'Unit 11 · Electrostatics',
    definition:
      'When two charged capacitors C₁(V₁) and C₂(V₂) are connected in parallel, total charge is conserved to reach common potential V_com, while ΔU = ½[C₁C₂/(C₁+C₂)](V₁−V₂)² dissipates as heat.',
    jeeNote:
      'Zero heat is lost only when V₁ = V₂; for opposite-polarity connection (+ to −), subtract charges in V_com and use (V₁ + V₂)² in ΔU.',
    formulaIds: ['elec-cap-sharing', 'elec-cap-energy'],
    relatedIds: ['dielectric-constant', 'time-constant-rc'],
  },
  {
    id: 'de-broglie-wavelength',
    term: 'de-Broglie Matter Wavelength',
    symbol: 'λ = h / p',
    siUnit: 'm (or Å)',
    chapter: 'modern-physics',
    unitLabel: 'Unit 17 · Dual Nature',
    definition:
      'Wavelength associated with any moving particle of momentum p = mv = √(2mK), demonstrating wave–particle duality of matter.',
    jeeNote:
      'Fast JEE potential shortcuts (V in Volts): electron λ_e = 12.27/√V Å, proton 0.286/√V Å, α-particle 0.101/√V Å.',
    formulaIds: ['mod-debroglie', 'mod-photon-energy'],
    relatedIds: ['photoelectric-effect', 'bohr-quantization'],
  },
  {
    id: 'dielectric-constant',
    term: 'Dielectric Constant & Induced Charge',
    symbol: 'K = ε_r, q_ind',
    siUnit: 'dimensionless',
    chapter: 'electrostatics',
    unitLabel: 'Unit 11 · Electrostatics',
    definition:
      'Factor K by which an insulating dielectric reduces the net electric field inside a parallel-plate capacitor and multiplies capacitance (C = KC₀), inducing bound surface charge q_ind = q(1 − 1/K).',
    jeeNote:
      'Always distinguish Battery Connected (V constant ⇒ Q, C, U scale ×K) vs Disconnected (Q constant ⇒ V, E, U drop ÷K).',
    formulaIds: ['elec-cap-dielectric', 'elec-cap-battery-toggle', 'elec-cap-induced-charge'],
    relatedIds: ['capacitor-energy-sharing', 'electric-flux'],
  },
  {
    id: 'dispersive-power',
    term: 'Dispersive Power',
    symbol: 'ω = (n_v − n_r)/(n_y − 1)',
    siUnit: 'dimensionless',
    chapter: 'ray-optics',
    unitLabel: 'Unit 16 · Ray Optics',
    definition:
      'Intrinsic optical material property equal to the ratio of angular dispersion (δ_v − δ_r) to the mean yellow deviation δ_y produced by a thin prism.',
    jeeNote:
      'Independent of thin prism angle A; depends solely on refractive indices of the glass.',
    formulaIds: ['ray-dispersion-achromatic', 'ray-prism'],
    relatedIds: ['achromatic-doublet', 'minimum-deviation'],
  },
  {
    id: 'displacement-current',
    term: 'Displacement Current',
    symbol: 'I_d = ε₀ dΦ_E / dt',
    siUnit: 'A (Ampere)',
    chapter: 'em-waves',
    unitLabel: 'Unit 15 · EM Waves',
    definition:
      'Effective current term introduced by Maxwell across regions with a time-varying electric flux (such as the gap between capacitor plates during charging/discharging), ensuring current continuity.',
    jeeNote:
      'Inside a parallel-plate capacitor gap, conduction current I_c = 0 while I_d = C dV/dt equals the wire current I_c.',
    formulaIds: ['em-displacement', 'em-speed'],
    relatedIds: ['ampere-circuital-law', 'poynting-intensity'],
  },
  {
    id: 'drift-velocity-mobility',
    term: 'Drift Velocity & Mobility',
    symbol: 'v_d, μ = v_d / E',
    siUnit: 'm/s, m²/(V·s)',
    chapter: 'current',
    unitLabel: 'Unit 12 · Current Electricity',
    definition:
      'Average directed velocity v_d = (eEτ)/m acquired by conduction electrons opposite to the applied electric field between thermal collisions; mobility μ = v_d/E = eτ/m.',
    jeeNote:
      'Current I = n e A v_d holds even in non-uniform cross-sections, making v_d ∝ 1/A along a tapered wire.',
    formulaIds: ['curr-drift', 'semi-conductivity'],
    relatedIds: ['relaxation-time-resistivity', 'mass-action-law'],
  },
  {
    id: 'dynamic-diode-resistance',
    term: 'Dynamic Forward Resistance & Knee Voltage',
    symbol: 'r_d = ΔV_F / ΔI_F, V_knee',
    siUnit: 'Ω, V',
    chapter: 'semiconductors',
    unitLabel: 'Unit 19 & 20 · Semiconductors',
    definition:
      'AC small-signal forward resistance r_d = ΔV/ΔI of a p–n junction diode above its threshold knee voltage (≈ 0.7 V for Si, ≈ 0.3 V for Ge), obtained as the inverse slope of the I–V curve.',
    jeeNote:
      'Unlike ohmic resistors, diode static resistance V/I differs significantly from dynamic resistance ΔV/ΔI.',
    formulaIds: ['exp-diode-iv-lab', 'semi-diode-characteristics'],
    relatedIds: ['zener-breakdown', 'mass-action-law'],
  },
  {
    id: 'electric-dipole',
    term: 'Electric Dipole Moment',
    symbol: 'p = q · (2a)',
    siUnit: 'C·m',
    chapter: 'electrostatics',
    unitLabel: 'Unit 11 · Electrostatics',
    definition:
      'Vector directed from −q to +q characterizing a pair of equal and opposite charges separated by distance 2a; torque in uniform field is τ = p × E and potential energy is U = −p·E.',
    jeeNote:
      'Axial field is 2× equatorial field magnitude at equal distance r ≫ a (E_axial = 2kp/r³, E_eq = kp/r³).',
    formulaIds: ['elec-dipole-general', 'elec-dipole-torque-u', 'elec-dipole-work-osc'],
    relatedIds: ['magnetic-dipole-moment', 'electric-flux'],
  },
  {
    id: 'electric-flux',
    term: 'Electric Flux & Gauss’s Law',
    symbol: 'Φ_E = ∮ E·dA = q_encl / ε₀',
    siUnit: 'N·m²/C (or V·m)',
    chapter: 'electrostatics',
    unitLabel: 'Unit 11 · Electrostatics',
    definition:
      'Scalar measure of total electric field lines piercing a surface; over any closed Gaussian surface, net outward flux depends solely on enclosed free charge q_encl/ε₀.',
    jeeNote:
      'Cube symmetry shortcuts: charge at corner ⇒ q/(8ε₀) through cube and q/(24ε₀) per non-touching face; charge at face-centre ⇒ q/(2ε₀).',
    formulaIds: ['elec-gauss', 'elec-cube-flux'],
    relatedIds: ['dielectric-constant', 'electric-dipole'],
  },
  {
    id: 'faraday-lenz-law',
    term: "Faraday's Law & Lenz's Law",
    symbol: 'ε = −dΦ_B / dt',
    siUnit: 'V (or Wb/s)',
    chapter: 'emi',
    unitLabel: 'Unit 14 · Electromagnetic Induction',
    definition:
      'Induced EMF equals the negative time rate of change of magnetic flux linkage; Lenz’s minus sign enforces energy conservation by opposing the flux change that produces it.',
    jeeNote:
      'Total induced charge q_ind = ΔΦ_B / R depends ONLY on net flux change and resistance—completely independent of how fast flux changed.',
    formulaIds: ['emi-faraday-lenz', 'emi-induced-charge'],
    relatedIds: ['motional-emf', 'self-mutual-inductance'],
  },
  {
    id: 'figure-of-merit-galvanometer',
    term: 'Galvanometer Figure of Merit & Half-Deflection',
    symbol: 'k = ε / [(R+G)θ], G = RS/(R−S)',
    siUnit: 'A/div, Ω',
    chapter: 'experimental-skills',
    unitLabel: 'Unit 20 · Experimental Skills',
    definition:
      'Figure of merit k is the current required to produce unit scale deflection (1 division) in a moving-coil galvanometer; resistance G is measured via shunt S that halves deflection to θ/2.',
    jeeNote:
      'Approximation G ≈ S holds ONLY when series resistance R ≫ S; otherwise always use exact G = RS/(R − S).',
    formulaIds: ['exp-galvanometer-half-deflection', 'curr-ammeter', 'curr-voltmeter'],
    relatedIds: ['shunt-multiplier', 'metre-bridge'],
  },
  {
    id: 'huygens-wavefront',
    term: "Huygens' Principle & Wavefront",
    symbol: 'sin i / sin r = v₁/v₂ = n₂/n₁',
    siUnit: 'dimensionless',
    chapter: 'wave-optics',
    unitLabel: 'Unit 16 · Wave Optics',
    definition:
      'Surface of constant optical phase; every point on a primary wavefront acts as a source of secondary spherical wavelets propagating at local wave speed v = c/n.',
    jeeNote:
      'During refraction across media, frequency ν remains strictly invariant while speed v and wavelength λ scale inversely with n.',
    formulaIds: ['wave-huygens-resolving', 'wave-superposition-intensity'],
    relatedIds: ['resolving-power-rayleigh', 'snells-law'],
  },
  {
    id: 'index-error',
    term: 'Index Error & Parallax Removal',
    symbol: 'l_true = l_obs + e',
    siUnit: 'cm or mm',
    chapter: 'experimental-skills',
    unitLabel: 'Unit 20 · Experimental Skills',
    definition:
      'Constant offset between the actual separation of an optical pin tip and mirror pole/lens centre versus the difference of their upright readings on an optical bench scale.',
    jeeNote:
      'Parallax is removed when needle tip and inverted image move together with zero relative shift upon moving the eye sideways.',
    formulaIds: ['exp-uv-mirror-lens'],
    relatedIds: ['bessels-displacement-method', 'travelling-microscope'],
  },
  {
    id: 'Kirchhoff-laws',
    term: "Kirchhoff's Laws (KCL & KVL)",
    symbol: 'ΣI = 0, ΣΔV = 0',
    siUnit: 'A, V',
    chapter: 'current',
    unitLabel: 'Unit 12 · Current Electricity',
    definition:
      'Junction Rule (KCL) expresses conservation of electric charge at any node; Loop Rule (KVL) expresses conservation of electrostatic energy around any closed circuit mesh.',
    jeeNote:
      'Along a resistive branch, potential drops by −IR when traversing along assumed current I and rises by +IR when traversing opposite.',
    formulaIds: ['curr-kcl-kvl', 'curr-cell-terminal'],
    relatedIds: ['wheatstone-bridge', 'time-constant-rc'],
  },
  {
    id: 'lens-maker-equation',
    term: "Lens Maker's Formula",
    symbol: '1/f = (n_rel − 1)(1/R₁ − 1/R₂)',
    siUnit: 'm⁻¹ (Diopter)',
    chapter: 'ray-optics',
    unitLabel: 'Unit 16 · Ray Optics',
    definition:
      'Relates focal length f of a thin spherical lens to its relative refractive index n_lens/n_med and surface radii of curvature R₁, R₂.',
    jeeNote:
      'Immerse a convex glass lens in a liquid with n_liq > n_lens and f flips sign (converging acts diverging!). Cutting ⊥ axis doubles f; cutting along axis leaves f unchanged.',
    formulaIds: ['ray-lens-maker', 'ray-spherical-surface'],
    relatedIds: ['thin-lens-formula', 'achromatic-doublet'],
  },
  {
    id: 'logic-gates-demorgan',
    term: 'Logic Gates & De Morgan’s Laws',
    symbol: '¬(A·B) = ¬A + ¬B',
    siUnit: 'Boolean (0 / 1)',
    chapter: 'semiconductors',
    unitLabel: 'Unit 19 · Semiconductors',
    definition:
      'Digital switching circuits (AND, OR, NOT, NAND, NOR, XOR) governed by Boolean algebra; NAND and NOR are universal gates capable of synthesizing every logic function.',
    jeeNote:
      'Break the bar, flip the operator: 1 NAND = NOT, 2 NANDs = AND, 3 NANDs = OR, 4 NANDs = XOR.',
    formulaIds: ['semi-boolean-gates'],
    relatedIds: ['dynamic-diode-resistance', 'rectifier-efficiency'],
  },
  {
    id: 'lorentz-force',
    term: 'Lorentz Force & Helical Trajectory',
    symbol: 'F = q(E + v × B)',
    siUnit: 'N (Newton)',
    chapter: 'magnetism',
    unitLabel: 'Unit 13 · Magnetism',
    definition:
      'Total electromagnetic force experienced by a charge q moving with velocity v in electric field E and magnetic field B; magnetic part q(v × B) does zero work.',
    jeeNote:
      'Velocity component v⊥ drives circular motion (R = mv⊥/qB, T = 2πm/qB independent of v!), while v∥ advances the pitch p = v∥T.',
    formulaIds: ['mag-lorentz', 'mag-circle', 'mag-helix', 'mag-velocity-selector'],
    relatedIds: ['biot-savart-law', 'motional-emf'],
  },
  {
    id: 'magnetic-dipole-moment',
    term: 'Magnetic Dipole Moment',
    symbol: 'M = N I A',
    siUnit: 'A·m² (or J/T)',
    chapter: 'magnetism',
    unitLabel: 'Unit 13 · Magnetism',
    definition:
      'Vector characterizing a current loop (M = NIA n̂ via right-hand thumb rule) or bar magnet (M = m · 2l); experiences torque τ = M × B and energy U = −M·B in external field B.',
    jeeNote:
      'Axial and equatorial magnetic field ratios (2:1) mirror the electric dipole exactly upon replacing k → μ₀/4π and p → M.',
    formulaIds: ['mag-loop-torque', 'mag-bar-magnet', 'mag-dipole-torque'],
    relatedIds: ['bohr-magneton', 'electric-dipole'],
  },
  {
    id: 'malus-law',
    term: "Malus's Law",
    symbol: 'I = I_pol cos²θ',
    siUnit: 'W/m²',
    chapter: 'wave-optics',
    unitLabel: 'Unit 16 · Wave Optics',
    definition:
      'States that when plane-polarized light passes through an analyzer rotated at angle θ relative to the polarizer pass axis, transmitted intensity varies as cos²θ.',
    jeeNote:
      'TRAP: Unpolarized light incident on the FIRST polarizer ALWAYS halves to I₀/2 regardless of orientation before applying cos²θ at the next analyzer.',
    formulaIds: ['wave-polarization'],
    relatedIds: ['brewsters-angle', 'poynting-intensity'],
  },
  {
    id: 'mass-action-law',
    term: 'Mass Action Law & Charge Neutrality',
    symbol: 'n_e · n_h = n_i²',
    siUnit: 'm⁻⁶',
    chapter: 'semiconductors',
    unitLabel: 'Unit 19 · Semiconductors',
    definition:
      'In any semiconductor in thermal equilibrium (intrinsic or doped), the product of electron concentration n_e and hole concentration n_h remains equal to n_i², while overall crystal remains neutral (N_d + n_h = N_a + n_e).',
    jeeNote:
      'Doping increases conductivity by orders of magnitude while the semiconductor slab as a whole stays electrically neutral.',
    formulaIds: ['semi-mass-action-neutrality', 'semi-conductivity'],
    relatedIds: ['drift-velocity-mobility', 'dynamic-diode-resistance'],
  },
  {
    id: 'metre-bridge',
    term: 'Metre Bridge & End Correction',
    symbol: 'R/S = (l + e₁) / [(100−l) + e₂]',
    siUnit: 'Ω, cm',
    chapter: 'experimental-skills',
    unitLabel: 'Unit 20 · Experimental Skills',
    definition:
      'Practical Wheatstone bridge using a uniform 100 cm resistance wire to determine unknown resistance S and resistivity ρ; metallic end-strip resistances contribute equivalent lengths e₁, e₂.',
    jeeNote:
      'Keeping the null point near l = 50 cm minimizes percentage error in S; swapping R and S flips ideal null point from l to (100 − l).',
    formulaIds: ['exp-metre-bridge-lab', 'curr-metre-bridge'],
    relatedIds: ['wheatstone-bridge', 'figure-of-merit-galvanometer'],
  },
  {
    id: 'minimum-deviation',
    term: 'Minimum Deviation (Prism)',
    symbol: 'δ_m (at i = e, r₁ = r₂ = A/2)',
    siUnit: 'rad or °',
    chapter: 'ray-optics',
    unitLabel: 'Unit 16 · Ray Optics',
    definition:
      'Unique symmetric passage through a prism where incidence angle equals emergence angle (i = e), giving minimum total bending δ_m and relating prism index via n = sin[(A+δ_m)/2] / sin(A/2).',
    jeeNote:
      'For A > 2 i_c, no ray emerges from the second face regardless of incidence angle (total internal reflection inside prism).',
    formulaIds: ['ray-prism', 'ray-dispersion-achromatic'],
    relatedIds: ['dispersive-power', 'total-internal-reflection'],
  },
  {
    id: 'motional-emf',
    term: 'Motional EMF',
    symbol: 'ε = ∫ (v × B)·dl = Blv',
    siUnit: 'V (Volt)',
    chapter: 'emi',
    unitLabel: 'Unit 14 · Electromagnetic Induction',
    definition:
      'Potential difference induced across a conductor moving in a magnetic field due to magnetic Lorentz force separating free charges (plus/minus poles depend on v × B).',
    jeeNote:
      'For a rotating rod/spoke of length L at angular speed ω in perpendicular B, ε = ½ B ω L²; closed loop translating in uniform B always has net ε = 0.',
    formulaIds: ['emi-motional', 'emi-sliding-rod'],
    relatedIds: ['faraday-lenz-law', 'lorentz-force'],
  },
  {
    id: 'nuclear-density',
    term: 'Nuclear Radius & Density',
    symbol: 'R = R₀ A^(1/3)',
    siUnit: 'm (fm), kg/m³',
    chapter: 'modern-physics',
    unitLabel: 'Unit 18 · Atoms & Nuclei',
    definition:
      'Empirical nuclear radius scales as cube root of mass number A (R₀ ≈ 1.2 fm), making nuclear volume proportional to A and nuclear matter density ρ ≈ 2.3×10¹⁷ kg/m³ constant for ALL nuclei.',
    jeeNote:
      'Ratio of nuclear densities of ¹²C and ²³⁸U is strictly 1 : 1—never scale ρ with A.',
    formulaIds: ['mod-nuclear-radius-density'],
    relatedIds: ['binding-energy', 'rutherford-closest-approach'],
  },
  {
    id: 'nuclear-q-value',
    term: 'Nuclear Reaction Q-Value & Threshold Energy',
    symbol: 'Q = (m_R − m_P)c², K_th',
    siUnit: 'MeV',
    chapter: 'modern-physics',
    unitLabel: 'Unit 18 · Atoms & Nuclei',
    definition:
      'Net nuclear energy released (Q > 0, exothermic) or absorbed (Q < 0, endothermic) during a reaction, equal to (m_reactants − m_products)c² or (BE_products − BE_reactants).',
    jeeNote:
      'Endothermic reactions with stationary target M_X require projectile kinetic energy K_th = |Q|(1 + m_x/M_X) > |Q| to conserve momentum.',
    formulaIds: ['mod-nuclear-qvalue', 'mod-binding-energy'],
    relatedIds: ['binding-energy', 'rutherford-closest-approach'],
  },
  {
    id: 'photoelectric-effect',
    term: 'Photoelectric Effect & Stopping Potential',
    symbol: 'K_max = eV₀ = hν − φ',
    siUnit: 'eV, V',
    chapter: 'modern-physics',
    unitLabel: 'Unit 17 · Dual Nature',
    definition:
      'Instantaneous emission of electrons from a metal surface when incident photon energy hν exceeds work function φ; stopping potential V₀ arrests the fastest photoelectrons.',
    jeeNote:
      'V₀ vs ν plot has universal slope h/e for ALL metals; higher intensity raises saturation current but NEVER raises K_max or V₀.',
    formulaIds: ['mod-einstein-pe', 'mod-photon-energy'],
    relatedIds: ['de-broglie-wavelength', 'bohr-quantization'],
  },
  {
    id: 'power-factor-ac',
    term: 'Power Factor & AC Resonance',
    symbol: 'cosφ = R / Z, ω₀ = 1/√(LC)',
    siUnit: 'dimensionless, rad/s',
    chapter: 'ac',
    unitLabel: 'Unit 14 · Alternating Current',
    definition:
      'Fraction cosφ = R/Z determining real average power P = V_rms I_rms cosφ dissipated in an AC circuit; at series RLC resonance (X_L = X_C), impedance drops to Z = R and cosφ = 1.',
    jeeNote:
      'Pure inductor or pure capacitor draws wattless current (φ = 90°, cosφ = 0, average power P = 0).',
    formulaIds: ['ac-power', 'ac-resonance', 'ac-rlc-impedance'],
    relatedIds: ['reactance-impedance', 'transformer-turns'],
  },
  {
    id: 'poynting-intensity',
    term: 'Poynting Vector & Radiation Pressure',
    symbol: 'I = ½ ε₀ c E₀², P_rad = I/c',
    siUnit: 'W/m², N/m²',
    chapter: 'em-waves',
    unitLabel: 'Unit 15 · EM Waves',
    definition:
      'Average energy flux carried per unit area per second by an electromagnetic wave (I = S_avg = E_rms B_rms / μ₀); delivers momentum force P/c on total absorption or 2P/c on normal reflection.',
    jeeNote:
      'Half of EM wave energy density resides in the E-field and half in the B-field (u_E = u_B = ¼ ε₀ E₀²), with E₀ = c B₀.',
    formulaIds: ['em-intensity', 'em-momentum-pressure', 'em-wave-eq'],
    relatedIds: ['displacement-current', 'photoelectric-effect'],
  },
  {
    id: 'reactance-impedance',
    term: 'Reactance & Impedance (RLC)',
    symbol: 'X_L = ωL, X_C = 1/(ωC), Z',
    siUnit: 'Ω (Ohm)',
    chapter: 'ac',
    unitLabel: 'Unit 14 · Alternating Current',
    definition:
      'Frequency-dependent opposition offered by inductors (X_L ∝ f) and capacitors (X_C ∝ 1/f) to sinusoidal AC, combining quadrature-wise with resistance R to form total impedance Z = √[R² + (X_L − X_C)²].',
    jeeNote:
      'CIVIL memory hook: In a Capacitor, Current I leads Voltage V; in an Inductor, Voltage V leads Current I.',
    formulaIds: ['ac-reactance', 'ac-rlc-impedance', 'ac-voltage-phasor'],
    relatedIds: ['power-factor-ac', 'time-constant-lr'],
  },
  {
    id: 'rectifier-efficiency',
    term: 'Rectifier & Ripple Frequency',
    symbol: 'f_ripple, η_max',
    siUnit: 'Hz, %',
    chapter: 'semiconductors',
    unitLabel: 'Unit 19 · Semiconductors',
    definition:
      'Diode circuit converting bidirectional AC into pulsating unidirectional DC; half-wave blocks negative half-cycles (η_max = 40.6%, f_out = f_in), while full-wave rectifies both (η_max = 81.2%, f_out = 2f_in).',
    jeeNote:
      'Full-wave rectifier ALWAYS doubles the ripple frequency (50 Hz AC mains → 100 Hz pulsating DC).',
    formulaIds: ['semi-rectifier'],
    relatedIds: ['zener-breakdown', 'dynamic-diode-resistance'],
  },
  {
    id: 'relaxation-time-resistivity',
    term: 'Relaxation Time & Resistivity',
    symbol: 'τ, ρ = m / (n e² τ)',
    siUnit: 's, Ω·m',
    chapter: 'current',
    unitLabel: 'Unit 12 · Current Electricity',
    definition:
      'Average free flight time τ between successive electron–ion collisions in a conductor; rising temperature shortens τ in metals (raising ρ) while freeing far more carriers n in semiconductors (lowering ρ).',
    jeeNote:
      'Stretching a metal wire to n times length at constant volume scales resistance as R′ = n² R (ρ itself stays unchanged!).',
    formulaIds: ['curr-resistivity', 'curr-stretch', 'curr-temp'],
    relatedIds: ['drift-velocity-mobility', 'metre-bridge'],
  },
  {
    id: 'resolving-power-rayleigh',
    term: 'Resolving Power & Rayleigh Limit',
    symbol: 'θ_min = 1.22 λ / D',
    siUnit: 'rad (or rad⁻¹ for RP)',
    chapter: 'wave-optics',
    unitLabel: 'Unit 16 · Wave Optics',
    definition:
      'Minimum angular separation θ_min at which two close point sources remain distinguishable through a circular aperture of diameter D (when central Airy disc of one falls on first dark ring of the other).',
    jeeNote:
      'Telescope RP = D/(1.22λ); Microscope RP = 2n sinθ / λ (improve via shorter λ or oil immersion increasing n).',
    formulaIds: ['wave-huygens-resolving', 'wave-single-slit'],
    relatedIds: ['huygens-wavefront', 'single-slit-diffraction'],
  },
  {
    id: 'rutherford-closest-approach',
    term: 'Rutherford Closest Approach & Impact Parameter',
    symbol: 'r₀ = k(2Ze²) / K, b',
    siUnit: 'm (or fm)',
    chapter: 'modern-physics',
    unitLabel: 'Unit 18 · Atoms & Nuclei',
    definition:
      'Distance r₀ where an α-particle (+2e) fired head-on against a nucleus (+Ze) momentarily halts as kinetic energy K converts to electrostatic potential energy; impact parameter b measures off-axis perpendicular offset.',
    jeeNote:
      'Head-on collision (b = 0) gives 180° back-scattering; r₀ ∝ Z/K ∝ 1/v², so doubling α speed quarters r₀.',
    formulaIds: ['mod-rutherford-scattering'],
    relatedIds: ['nuclear-density', 'bohr-quantization'],
  },
  {
    id: 'rydberg-formula',
    term: 'Rydberg Spectral Formula',
    symbol: '1/λ = R Z² (1/n₁² − 1/n₂²)',
    siUnit: 'm⁻¹',
    chapter: 'modern-physics',
    unitLabel: 'Unit 18 · Atoms & Nuclei',
    definition:
      'Gives the reciprocal wavelength (wave number) of photons emitted during electronic transitions between Bohr levels n₂ → n₁ in hydrogen-like ions.',
    jeeNote:
      'Lyman (n₁=1, UV), Balmer (n₁=2, Visible), Paschen (n₁=3, IR). Max distinct emission lines from level n in a sample = n(n−1)/2.',
    formulaIds: ['mod-spectral-lines', 'mod-bohr-quantization'],
    relatedIds: ['bohr-quantization', 'photoelectric-effect'],
  },
  {
    id: 'self-mutual-inductance',
    term: 'Self & Mutual Inductance',
    symbol: 'Φ = L I, ε = −L dI/dt',
    siUnit: 'H (Henry = Wb/A)',
    chapter: 'emi',
    unitLabel: 'Unit 14 · Electromagnetic Induction',
    definition:
      'Geometric proportionality factor relating magnetic flux linkage to current in the same coil (L) or a coupled neighbouring coil (M = k√(L₁L₂)); stores magnetic energy U = ½ L I².',
    jeeNote:
      'An inductor opposes SUDDEN change in current: at t = 0⁺ after switching, an unenergized inductor acts as an open circuit.',
    formulaIds: ['emi-self-inductance', 'emi-mutual', 'emi-inductor-combo'],
    relatedIds: ['faraday-lenz-law', 'time-constant-lr'],
  },
  {
    id: 'shunt-multiplier',
    term: 'Shunt & Multiplier Resistance (Ammeter / Voltmeter)',
    symbol: 'S = I_g G / (I − I_g), R = V/I_g − G',
    siUnit: 'Ω',
    chapter: 'current',
    unitLabel: 'Unit 12 · Current Electricity',
    definition:
      'Low parallel bypass resistance S converts a galvanometer into an ammeter (lowering net resistance); high series resistance R converts it into a voltmeter (raising net resistance).',
    jeeNote:
      'Ideal ammeter has zero resistance (R_A → 0); ideal voltmeter has infinite resistance (R_V → ∞).',
    formulaIds: ['curr-ammeter', 'curr-voltmeter'],
    relatedIds: ['figure-of-merit-galvanometer', 'Kirchhoff-laws'],
  },
  {
    id: 'single-slit-diffraction',
    term: 'Single-Slit Fraunhofer Diffraction',
    symbol: 'a sinθ = nλ (minima)',
    siUnit: 'm, rad',
    chapter: 'wave-optics',
    unitLabel: 'Unit 16 · Wave Optics',
    definition:
      'Spreading and self-interference of light passing through a narrow slit of width a, forming a wide bright central maximum (width 2λD/a) flanked by rapidly fading side lobes.',
    jeeNote:
      'SIGN/CONDITION TRAP: a sinθ = nλ marks DARK minima in single-slit diffraction, opposite to YDSE bright fringes!',
    formulaIds: ['wave-single-slit', 'wave-huygens-resolving'],
    relatedIds: ['ydse-fringe-width', 'resolving-power-rayleigh'],
  },
  {
    id: 'snells-law',
    term: "Snell's Law of Refraction",
    symbol: 'n₁ sin i = n₂ sin r',
    siUnit: 'dimensionless',
    chapter: 'ray-optics',
    unitLabel: 'Unit 16 · Ray Optics',
    definition:
      'Governs bending of a light ray across an interface separating media of refractive indices n₁ and n₂; product n sinθ remains constant even across stacked parallel slabs.',
    jeeNote:
      'In multi-layer parallel slabs, emerge angle depends ONLY on initial index n₁, final index n_k, and initial angle i.',
    formulaIds: ['ray-snell-tir-slab', 'wave-huygens-resolving'],
    relatedIds: ['total-internal-reflection', 'apparent-depth'],
  },
  {
    id: 'thin-lens-formula',
    term: 'Thin Lens & Spherical Mirror Equations',
    symbol: '1/v − 1/u = 1/f (lens), 1/v + 1/u = 1/f (mirror)',
    siUnit: 'm or cm',
    chapter: 'ray-optics',
    unitLabel: 'Unit 16 · Ray Optics',
    definition:
      'Cartesian conjugate relations linking object distance u, image distance v, and focal length f under paraxial rays, with lateral magnification m = +v/u (lens) vs m = −v/u (mirror).',
    jeeNote:
      'For small axial objects, longitudinal magnification is m_L = dv/du = −m² (always negative for mirrors and +m² for thin lenses in same medium).',
    formulaIds: ['ray-thin-lens', 'ray-mirror-formula', 'exp-uv-mirror-lens'],
    relatedIds: ['lens-maker-equation', 'bessels-displacement-method'],
  },
  {
    id: 'time-constant-lr',
    term: 'LR Inductive Time Constant',
    symbol: 'τ_L = L / R',
    siUnit: 's (second)',
    chapter: 'emi',
    unitLabel: 'Unit 14 · Electromagnetic Induction',
    definition:
      'Characteristic time required for current in an inductive–resistive circuit to grow to 63.2% (1 − 1/e) of steady-state I₀ = ε/R, or decay to 36.8% (1/e) of initial current.',
    jeeNote:
      'At t = 0⁺ (unenergized L), inductor acts OPEN (I = 0); at t → ∞ steady state, ideal inductor acts as a SHORT wire (V_L = 0).',
    formulaIds: ['emi-lr-circuit'],
    relatedIds: ['self-mutual-inductance', 'time-constant-rc'],
  },
  {
    id: 'time-constant-rc',
    term: 'RC Capacitive Time Constant',
    symbol: 'τ_C = R_eq C',
    siUnit: 's (second)',
    chapter: 'current',
    unitLabel: 'Unit 12 · Current Electricity',
    definition:
      'Characteristic time taken by a capacitor in an RC network to reach 63.2% of steady-state charge during charging (or decay to 36.8% during discharging), where R_eq is Thevenin resistance across C.',
    jeeNote:
      'Exact dual of LR: uncharged capacitor acts as a SHORT wire at t = 0⁺ and as an OPEN branch at t → ∞ steady state; half-life t_½ = τ ln 2.',
    formulaIds: ['curr-rc-general', 'curr-rc-tau-halflife', 'curr-rc-limits'],
    relatedIds: ['time-constant-lr', 'capacitor-energy-sharing'],
  },
  {
    id: 'total-internal-reflection',
    term: 'Total Internal Reflection (TIR)',
    symbol: 'sin i_c = n_rarer / n_denser',
    siUnit: 'rad or °',
    chapter: 'ray-optics',
    unitLabel: 'Unit 16 · Ray Optics',
    definition:
      'Complete reflection of light back into an optically denser medium when incidence angle i exceeds critical angle i_c = sin⁻¹(n_rarer / n_denser); zero energy is transmitted.',
    jeeNote:
      'Occurs ONLY when travelling from denser → rarer medium (never rarer → denser).',
    formulaIds: ['ray-snell-tir-slab', 'ray-prism'],
    relatedIds: ['snells-law', 'minimum-deviation'],
  },
  {
    id: 'transformer-turns',
    term: 'Ideal & Practical Transformer',
    symbol: 'V₂/V₁ = N₂/N₁ = I₁/I₂',
    siUnit: 'dimensionless',
    chapter: 'ac',
    unitLabel: 'Unit 14 · Alternating Current',
    definition:
      'Mutual-induction AC device that steps up or steps down sinusoidal voltage according to turns ratio N₂/N₁ while preserving input-to-output frequency and power (η = P_out/P_in).',
    jeeNote:
      'A transformer NEVER works on steady DC; laminated silicon-steel core reduces eddy-current and hysteresis losses.',
    formulaIds: ['ac-transformer', 'emi-eddy'],
    relatedIds: ['self-mutual-inductance', 'power-factor-ac'],
  },
  {
    id: 'travelling-microscope',
    term: 'Travelling Microscope Slab Method',
    symbol: 'n = (R₃ − R₁) / (R₃ − R₂)',
    siUnit: 'dimensionless',
    chapter: 'experimental-skills',
    unitLabel: 'Unit 20 · Experimental Skills',
    definition:
      'Vernier microscope measurement of glass slab refractive index via vertical focus readings on a bare ink mark (R₁), the mark through the slab (R₂), and lycopodium powder on the slab top surface (R₃).',
    jeeNote:
      'Always rack the microscope screw upward in ONE direction only to prevent gear backlash error.',
    formulaIds: ['exp-travelling-microscope', 'ray-snell-tir-slab'],
    relatedIds: ['apparent-depth', 'index-error'],
  },
  {
    id: 'wheatstone-bridge',
    term: 'Balanced Wheatstone Bridge',
    symbol: 'P / Q = R / S',
    siUnit: 'Ω',
    chapter: 'current',
    unitLabel: 'Unit 12 · Current Electricity',
    definition:
      'Four-resistor diamond bridge whose central galvanometer branch carries zero current when opposite ratio arms satisfy P·S = Q·R, allowing the central branch to be removed or shorted.',
    jeeNote:
      'Under balanced condition, swapping the battery and galvanometer preserves balance cleanly.',
    formulaIds: ['curr-wheatstone', 'exp-metre-bridge-lab'],
    relatedIds: ['metre-bridge', 'Kirchhoff-laws'],
  },
  {
    id: 'ydse-fringe-width',
    term: "YDSE Fringe Width & Optical Path Shift",
    symbol: 'β = λD / d, Δy = (D/d)(n−1)t',
    siUnit: 'm or mm',
    chapter: 'wave-optics',
    unitLabel: 'Unit 16 · Wave Optics',
    definition:
      'Uniform spacing β between adjacent bright (or dark) interference fringes in Young’s Double-Slit Experiment; inserting a thin glass sheet of thickness t over one slit shifts the pattern by Δy toward that slit.',
    jeeNote:
      'Thin sheet shifts the central fringe WITHOUT changing fringe width β; immersing whole apparatus in liquid n shrinks β′ = β/n.',
    formulaIds: ['wave-ydse', 'wave-slab-shift', 'wave-imax-imin'],
    relatedIds: ['single-slit-diffraction', 'huygens-wavefront'],
  },
  {
    id: 'zener-breakdown',
    term: 'Zener Diode Voltage Regulator',
    symbol: 'I_s = I_Z + I_L, I_L = V_Z / R_L',
    siUnit: 'V, Ω, mA',
    chapter: 'semiconductors',
    unitLabel: 'Unit 19 & 20 · Semiconductors',
    definition:
      'Heavily doped p–n junction operated in reverse breakdown (Q3) where junction voltage stays nearly locked at V_Z across wide variations in load or input voltage.',
    jeeNote:
      'Always verify V_thevenin > V_Z before assuming Zener is conducting in breakdown; series resistor R_s protects the diode from excessive current.',
    formulaIds: ['semi-zener-regulator', 'exp-diode-iv-lab'],
    relatedIds: ['dynamic-diode-resistance', 'rectifier-efficiency'],
  },
];
