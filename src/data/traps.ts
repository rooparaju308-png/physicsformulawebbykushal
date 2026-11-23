export interface TrapEntry {
  formulaId: string;
  headline: string;
  pitfall: string;
  safeRule: string;
}

export const TRAP_NOTES: Record<string, TrapEntry> = {
  'lar-wire-e-perp': {
    formulaId: 'lar-wire-e-perp',
    headline: 'Same-Side vs Opposite-Side Angles (θ₁, θ₂)',
    pitfall: 'Blindly using (sinθ₁ + sinθ₂) when point O lies beyond one end of the wire (both ends on the SAME side of the perpendicular).',
    safeRule: 'Opposite sides of perpendicular: (sinθ₁ + sinθ₂). Same side of perpendicular: |sinθ₁ − sinθ₂|, and E∥ uses (cosθ₂ − cosθ₁).',
  },
  'lar-wire-e-parallel': {
    formulaId: 'lar-wire-e-parallel',
    headline: 'Direction of Parallel Component E∥',
    pitfall: 'Reversing the direction of E∥ along the rod or forgetting E∥ = 0 for symmetric/infinite wires.',
    safeRule: 'For λ > 0, E∥ points AWAY from the longer segment (toward the end with the smaller subtended angle).',
  },
  'lar-wire-v': {
    formulaId: 'lar-wire-v',
    headline: 'Finite vs Infinite Wire Potential Reference',
    pitfall: 'Substituting θ₁ = θ₂ = 90° into V₀ of a finite wire gives ln(∞), which diverges.',
    safeRule: 'Absolute V = 0 at ∞ works ONLY for finite rods. For an infinite line charge, always compute ΔV = V(r₁) − V(r₂) = 2kλ ln(r₂/r₁).',
  },
  'lar-wire-infinite-dv': {
    formulaId: 'lar-wire-infinite-dv',
    headline: 'Logarithm Ratio Sign in ΔV',
    pitfall: 'Swapping r₁ and r₂ inside ln(r₂/r₁), giving the wrong sign for work done.',
    safeRule: 'For λ > 0, potential drops outward: if r₂ > r₁, V(r₁) > V(r₂), so V(r₁) − V(r₂) = +2kλ ln(r₂/r₁) > 0.',
  },
  'lar-wire-semi-infinite': {
    formulaId: 'lar-wire-semi-infinite',
    headline: '45° Net Field Angle & Semi-Infinite Factor',
    pitfall: 'Assuming E for a semi-infinite wire is purely perpendicular (like infinite wire) or missing the √2 factor.',
    safeRule: 'At the perpendicular through one end, E⊥ = E∥ = kλ/r, so E_net = √2 kλ/r at 45° to the wire; B = k′I/r = μ₀I/(4πr).',
  },
  'lar-arc-e': {
    formulaId: 'lar-arc-e',
    headline: 'Degrees vs Radians in Arc Angle θ',
    pitfall: 'Plugging θ in degrees into V_A = kλθ or B_A = k′Iθ/R instead of radians.',
    safeRule: 'Always convert θ to radians (π/2, π, π/3) before multiplying; sin(θ/2) in E_A works with θ/2 in either unit if trig mode matches.',
  },
  'lar-ring-force-shm': {
    formulaId: 'lar-ring-force-shm',
    headline: 'SHM Sign Condition on Ring Axis',
    pitfall: 'Applying ω_SHM = √(kQq₀/mR³) when Q and q₀ have the SAME sign.',
    safeRule: 'Like charges are UNSTABLE at the ring center (repelled outward); SHM occurs ONLY when Q and q₀ have OPPOSITE signs and x ≪ R.',
  },
  'lar-disc-potential-diff': {
    formulaId: 'lar-disc-potential-diff',
    headline: 'Disc Center (2πkσR) vs Rim Edge (4kσR)',
    pitfall: 'Assuming a uniformly charged disc is equipotential (like a conductor) or using π/2 the wrong way around.',
    safeRule: 'For σ > 0 on a non-conducting disc, V_center = 2πkσR is GREATER than V_edge = 4kσR by factor π/2 ≈ 1.57.',
  },
  'elec-gauss': {
    formulaId: 'elec-gauss',
    headline: 'Flux Depends on q_in, Field E Depends on ALL Charges',
    pitfall: 'Thinking E on a Gaussian surface is zero whenever q_in = 0 (or zero flux implies E = 0 everywhere).',
    safeRule: '∮E·dA = q_in/ε₀ fixes total FLUX via enclosed charge only; local E includes exterior charges too.',
  },
  'elec-gauss-sheet': {
    formulaId: 'elec-gauss-sheet',
    headline: 'Non-Conducting Sheet (σ/2ε₀) vs Conductor (σ/ε₀)',
    pitfall: 'Mixing up factor of 2 between a single thin non-conducting sheet and a conducting plate surface.',
    safeRule: 'Thin non-conducting sheet (both sides have flux): 2πkσ = σ/2ε₀. Conductor surface (flux on one side only): 4πkσ = σ/ε₀.',
  },
  'elec-concentric-shells': {
    formulaId: 'elec-concentric-shells',
    headline: 'ΔV Independent of Outer Shell Charge Q₂',
    pitfall: 'Recomputing ΔV = V₁ − V₂ after adding charge Q₂ to the outer shell.',
    safeRule: 'Outer charge Q₂ shifts BOTH V₁ and V₂ equally by kQ₂/R₂, so ΔV = kQ₁(1/R₁ − 1/R₂) depends ONLY on inner charge Q₁.',
  },
  'elec-cavity-sphere': {
    formulaId: 'elec-cavity-sphere',
    headline: 'Cavity Field is Uniform & Independent of Cavity Radius b',
    pitfall: 'Trying to scale E_cavity by cavity radius b or distance from cavity center O₂.',
    safeRule: 'E_cavity = (4πkρ/3)a depends ONLY on ρ and center-to-center vector a = O₁O₂. Cavity radius b only enters potential V_{O₂}.',
  },
  'elec-cap-battery-toggle': {
    formulaId: 'elec-cap-battery-toggle',
    headline: 'Battery Connected (V const) vs Disconnected (Q const)',
    pitfall: 'Using U = ½CV² when the battery is disconnected (actually Q is fixed, so U = Q²/2C decreases by K!).',
    safeRule: 'Connected → V fixed (Q, C, U all ×K; E unchanged). Disconnected → Q fixed (C ×K; V, E, U all ÷K).',
  },
  'elec-cap-charging-heat': {
    formulaId: 'elec-cap-charging-heat',
    headline: '50% Heat Loss Independent of Resistance R',
    pitfall: 'Integrating I²R dt or assuming small R means low heat dissipation during charging from an uncharged state.',
    safeRule: 'From Q=0 to Cε, battery supplies Cε², capacitor stores ½Cε², and exactly ½Cε² is ALWAYS dissipated regardless of R.',
  },
  'mag-finite-solenoid': {
    formulaId: 'mag-finite-solenoid',
    headline: 'Axis Angles (θ₁, θ₂) vs Perpendicular Angles (α₁, α₂)',
    pitfall: 'Confusing cosθ₁ − cosθ₂ with sinα₁ + sinα₂ or taking both axis angles acute on opposite sides of P.',
    safeRule: 'Angles from AXIS (θ₁, θ₂ measured from +x): ½μ₀nI(cosθ₁ − cosθ₂). Angles from PERPENDICULAR (α₁, α₂): ½μ₀nI(sinα₁ + sinα₂).',
  },
  'mag-loop-torque': {
    formulaId: 'mag-loop-torque',
    headline: 'Angle With Normal (sinθ) vs Angle With Coil Plane (cosα)',
    pitfall: 'Plugging the angle between B and the PLANE of the coil directly into τ = NIAB sinθ.',
    safeRule: 'θ in NIAB sinθ is between AREA NORMAL (M) and B. If angle α with the coil plane is given, τ = NIAB cosα.',
  },
  'mag-mcg': {
    formulaId: 'mag-mcg',
    headline: 'Increasing Turns N Does Not Raise Voltage Sensitivity',
    pitfall: 'Assuming voltage sensitivity φ/V = NAB/(CR) increases with N just like current sensitivity φ/I = NAB/C.',
    safeRule: 'Doubling N with the same wire gauge doubles coil resistance R too, so V_s = NAB/(CR) remains unchanged!',
  },
  'mag-cavity-cylinder': {
    formulaId: 'mag-cavity-cylinder',
    headline: 'Direction of Uniform B_cavity = 2πk′(J × a)',
    pitfall: 'Thinking B_cavity points along offset vector a (like E_cavity in electrostatics).',
    safeRule: 'Unlike electrostatic cavities (E ∥ a), magnetic B_cavity = (μ₀/2)(J × a) is PERPENDICULAR to both current J and offset vector a.',
  },
  'ac-rlc-impedance': {
    formulaId: 'ac-rlc-impedance',
    headline: 'AC Voltages Add as Phasors, Not Algebraically',
    pitfall: 'Writing V_source = V_R + V_L + V_C in an AC series circuit.',
    safeRule: 'Always use V = √(V_R² + (V_L − V_C)²). At resonance V_L = V_C can each exceed V_source while cancelling out!',
  },
  'em-displacement': {
    formulaId: 'em-displacement',
    headline: 'Displacement Current Inside Charging Capacitor',
    pitfall: 'Setting I_d = 0 between capacitor plates because no real charges cross the vacuum gap.',
    safeRule: 'Inside the gap I_c = 0 and I_d = ε₀ dφ_E/dt = I_conduction; total I_c + I_d is continuous everywhere.',
  },
  'mod-einstein-pe': {
    formulaId: 'mod-einstein-pe',
    headline: 'Intensity vs Frequency on Photocurrent & K_max',
    pitfall: 'Thinking doubling light intensity increases K_max or stopping potential V₀.',
    safeRule: 'Doubling intensity (at fixed ν > ν₀) doubles photon count & saturation photocurrent ONLY; K_max and V₀ depend solely on ν and φ.',
  },
  'mod-bohr-quantization': {
    formulaId: 'mod-bohr-quantization',
    headline: 'Sign of E_total = −K = U/2 as Orbit n Increases',
    pitfall: 'Assuming kinetic energy K increases as n increases because total energy E_n = −13.6/n² becomes less negative.',
    safeRule: 'As n↑: Speed v ∝ 1/n drops (so K drops), while U = −27.2/n² and E_total = −13.6/n² both INCREASE toward zero.',
  },
  'mod-nuclear-radius-density': {
    formulaId: 'mod-nuclear-radius-density',
    headline: 'Nuclear Density is Independent of Mass Number A',
    pitfall: 'Scaling nuclear density ρ with A or A^(1/3) when comparing heavy (²³⁸U) vs light (¹²C) nuclei.',
    safeRule: 'Since R = R₀ A^(1/3) ⇒ Volume V ∝ A, density ρ ≈ 2.3×10¹⁷ kg/m³ is identical (1:1 ratio) for ALL nuclei.',
  },
  'semi-diode-characteristics': {
    formulaId: 'semi-diode-characteristics',
    headline: 'Special Diode I–V Quadrants & Overall Neutrality',
    pitfall: 'Confusing Photodiode (Q3 reverse-biased) with Solar Cell (Q4 unbiased), or saying a p-n junction has net charge.',
    safeRule: 'Whole diode is electrically neutral. Photodiode runs in Q3 (reverse saturation shifts down with intensity); Solar Cell runs in Q4 (V_oc, −I_sc).',
  },
  'semi-rectifier': {
    formulaId: 'semi-rectifier',
    headline: 'Full-Wave Ripple Frequency Doubles AC Mains Frequency',
    pitfall: 'Taking output ripple frequency of a full-wave rectifier equal to mains f_in.',
    safeRule: 'Half-wave rectifier: f_ripple = f_in (50 Hz → 50 Hz). Full-wave rectifier: f_ripple = 2f_in (50 Hz → 100 Hz).',
  },
  'semi-boolean-gates': {
    formulaId: 'semi-boolean-gates',
    headline: 'De Morgan Bubble-Pushing & Universal NAND Count',
    pitfall: 'Evaluating ¬(A·B) as (¬A)·(¬B) instead of swapping AND ↔ OR when breaking the overbar.',
    safeRule: 'Break the bar, flip the sign: ¬(A·B) = ¬A + ¬B; ¬(A+B) = ¬A·¬B. Universal NAND counts: 1 = NOT, 2 = AND, 3 = OR.',
  },
  'ray-mirror-formula': {
    formulaId: 'ray-mirror-formula',
    headline: 'Mirror m = −v/u vs Thin Lens m = +v/u',
    pitfall: 'Using +v/u for mirrors or forgetting the minus sign in longitudinal magnification m_L = −m².',
    safeRule: 'Mirror: 1/v + 1/u = 1/f with m = −v/u = f/(f−u). Thin Lens: 1/v − 1/u = 1/f with m = +v/u = f/(f+u).',
  },
  'ray-lens-maker': {
    formulaId: 'ray-lens-maker',
    headline: 'Liquid Immersion (n_med > n_lens) & Lens Cutting',
    pitfall: 'Assuming a convex glass lens stays converging in any liquid or halves focal length when cut perpendicular to axis.',
    safeRule: 'If n_med > n_lens, (n_lens/n_med − 1) < 0 so convex acts diverging! Cut ⊥ axis ⇒ f doubles (2f); cut along axis ⇒ f stays SAME (half intensity).',
  },
  'ray-prism': {
    formulaId: 'ray-prism',
    headline: 'Asymmetric δ vs i U-Curve & No-Emergence A > 2i_c',
    pitfall: 'Assuming δ vs i is symmetric around δ_m or neglecting grazing emergence / TIR inside a prism.',
    safeRule: 'Every δ > δ_m corresponds to TWO incidence angles (i and e, swapped). Minimum deviation δ_m is unique at i = e; A > 2i_c causes total internal reflection for all i.',
  },
  'wave-ydse': {
    formulaId: 'wave-ydse',
    headline: 'Thin Sheet Shifts Central Fringe Without Changing β',
    pitfall: 'Changing fringe width β when a thin glass slab covers one slit, or shifting toward the uncovered slit.',
    safeRule: 'Slab shifts the ENTIRE pattern toward the COVERED slit by Δy = (D/d)(n−1)t while β stays constant; liquid immersion shrinks β′ = β/n.',
  },
  'wave-single-slit': {
    formulaId: 'wave-single-slit',
    headline: 'Single-Slit Minima a sinθ = nλ vs YDSE Bright Fringes',
    pitfall: 'Treating a sinθ = nλ as a brightness maximum in diffraction or using λD/a for the central maximum width.',
    safeRule: 'In single-slit diffraction, a sinθ = nλ gives DARK minima! Central max linear width is 2λD/a (TWICE the secondary fringe width).',
  },
  'wave-polarization': {
    formulaId: 'wave-polarization',
    headline: 'Unpolarized Light Always Halves Through First Polarizer',
    pitfall: 'Applying I₀ cos²θ directly to unpolarized light hitting the first polarizer.',
    safeRule: 'First polarizer halves unpolarized light to I₀/2 regardless of angle; Malus I cos²θ applies ONLY to subsequent analyzers.',
  },
  'mod-rutherford-scattering': {
    formulaId: 'mod-rutherford-scattering',
    headline: 'Closest Approach r₀ Scales With 1/v², Not 1/v',
    pitfall: 'Assuming doubling the initial speed v of an α-particle halves the distance of closest approach r₀.',
    safeRule: 'Since r₀ = k(2Ze²)/K and K = ½mv², doubling speed quadruples K and reduces r₀ to r₀/4 (r₀ ∝ Z/K ∝ 1/v²).',
  },
  'mod-nuclear-qvalue': {
    formulaId: 'mod-nuclear-qvalue',
    headline: 'Q-Value Sign Flips Between Mass vs Binding Energy',
    pitfall: 'Writing Q = BE_reactants − BE_products by blindly copying the (m_reactants − m_products) order.',
    safeRule: 'With masses: Q = (m_reactants − m_products)c². With Binding Energies: Q = BE_products − BE_reactants. Endothermic threshold K_th = |Q|(1 + m_x/M_X).',
  },
  'ray-dispersion-achromatic': {
    formulaId: 'ray-dispersion-achromatic',
    headline: 'Achromatic Doublet Uses Opposite-Sign Lenses + Sums ω/f',
    pitfall: 'Using two convex lenses in contact for an achromatic doublet, or equating ω₁f₁ + ω₂f₂ = 0 instead of ω₁/f₁ + ω₂/f₂ = 0.',
    safeRule: 'Since ω₁, ω₂ > 0 always, ω₁/f₁ + ω₂/f₂ = 0 strictly forces f₁ and f₂ to have OPPOSITE signs (one converging + one diverging).',
  },
  'exp-lens-displacement': {
    formulaId: 'exp-lens-displacement',
    headline: 'Displacement Method Needs D ≥ 4f & Gives O = √(I₁I₂)',
    pitfall: 'Taking object size O as the arithmetic mean (I₁ + I₂)/2 or expecting two positions when screen distance D < 4f.',
    safeRule: 'Since m₁·m₂ = (v/u)(u/v) = 1, object size is the GEOMETRIC mean O = √(I₁I₂), and two real images exist ONLY when D > 4f.',
  },
  'exp-travelling-microscope': {
    formulaId: 'exp-travelling-microscope',
    headline: 'Keep R₃ (Top Powder) Minus R₁ (Bare Mark) Over (R₃ − R₂)',
    pitfall: 'Inverting the ratio or taking (R₂ − R₁) in the numerator instead of (R₃ − R₁), or racking down causing backlash error.',
    safeRule: 'Real thickness = R₃ − R₁; Apparent thickness = R₃ − R₂; n = (R₃ − R₁)/(R₃ − R₂). Always rack microscope upward in one direction.',
  },
  'exp-galvanometer-half-deflection': {
    formulaId: 'exp-galvanometer-half-deflection',
    headline: 'G ≈ S Approximation Breaks When R Is Not ≫ S',
    pitfall: 'Always assuming galvanometer resistance G = S or forgetting that k = ε/[(R + G)θ] includes G.',
    safeRule: 'Exact relation is G = (R·S)/(R − S), which simplifies to G ≈ S ONLY when high series box R ≫ S.',
  },
};

export function getTrapNote(formulaId: string): TrapEntry | undefined {
  return TRAP_NOTES[formulaId];
}
