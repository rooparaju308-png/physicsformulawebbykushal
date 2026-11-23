import { Formula } from '../../types/physics';

export const CLASS_11_PHYSICS_FORMULAS: Formula[] = [
  // --- UNIT 1: UNITS, DIMENSIONS & ERROR ANALYSIS ---
  {
    id: 'c11-units-errors',
    chapter: 'class11-mechanics',
    subtopic: 'Units, Dimensions & Error Analysis',
    chain: 'master',
    title: 'Error Propagation & Least Count (Vernier / Screw Gauge)',
    latex: String.raw`\text{Sum/Diff } Z = A \pm B \implies \Delta Z = \Delta A + \Delta B; \qquad \text{Prod/Quot } Z = \frac{A^p B^q}{C^r} \implies \frac{\Delta Z}{Z} = p\frac{\Delta A}{A} + q\frac{\Delta B}{B} + r\frac{\Delta C}{C}; \qquad \text{Vernier } LC = 1\text{ MSD} - 1\text{ VSD} = \frac{\text{1 MSD}}{N}`,
    conditions: [
      'Errors ALWAYS add, whether adding or subtracting quantities (never subtract errors).',
      'Screw gauge least count LC = pitch / (number of circular scale divisions).',
      'True reading = observed reading − (zero error with sign).',
    ],
    variables: [
      { symbol: '\\Delta A, \\Delta B', meaning: 'Absolute errors in measurements' },
      { symbol: 'LC', meaning: 'Least count of vernier caliper or screw gauge' },
    ],
    derivedFrom: [],
    specialCasesTo: [],
    analogTo: [],
    flashcard: {
      front: 'Error propagation rule for multiplication/division and vernier caliper least count formula?',
      back: 'ΔZ/Z = p(ΔA/A) + q(ΔB/B) + r(ΔC/C); Vernier LC = 1 MSD − 1 VSD = (1 MSD)/N.',
    },
    tags: ['units', 'dimensions', 'errors', 'vernier', 'screw-gauge', 'class11'],
    jeeWeight: 3,
  },
  // --- UNIT 2: KINEMATICS ---
  {
    id: 'c11-kinematics-projectile',
    chapter: 'class11-mechanics',
    subtopic: 'Kinematics & Projectile Motion',
    chain: 'master',
    title: 'Projectile Motion: Time of Flight, Range, Height & Trajectory',
    latex: String.raw`T = \frac{2u\sin\theta}{g}; \qquad H = \frac{u^2\sin^2\theta}{2g}; \qquad R = \frac{u^2\sin(2\theta)}{g}; \qquad y = x\tan\theta\left(1 - \frac{x}{R}\right)`,
    conditions: [
      'Maximum horizontal range R_max occurs at θ = 45°; complementary angles (θ and 90° − θ) give identical ranges.',
      'Relation between max height and range: tan θ = 4H/R.',
    ],
    variables: [
      { symbol: 'u', meaning: 'Initial velocity (m/s)' },
      { symbol: '\\theta', meaning: 'Angle of projection' },
    ],
    derivedFrom: [],
    specialCasesTo: [],
    analogTo: [],
    flashcard: {
      front: 'Projectile trajectory equation in terms of x and range R?',
      back: 'y = x tanθ (1 − x/R) = x tanθ − g x² / (2u² cos²θ).',
    },
    tags: ['kinematics', 'projectile', 'range', 'height', 'class11'],
    jeeWeight: 3,
  },
  {
    id: 'c11-relative-motion',
    chapter: 'class11-mechanics',
    subtopic: 'Kinematics & Relative Motion',
    chain: 'master',
    title: 'Relative Velocity: River Crossing & Rain-Man',
    latex: String.raw`\text{River min time: } t = \frac{d}{v_b};\quad \text{Shortest path }(v_b > v_r):\ \sin\theta = \frac{v_r}{v_b}\ (\text{upstream}),\ t = \frac{d}{\sqrt{v_b^2 - v_r^2}}; \qquad \text{Rain: }\tan\theta = \frac{v_{\text{man}}}{v_{\text{rain}}`,
    conditions: [
      'Shortest path crossing requires swimmer to head upstream at angle sin θ = v_r/v_b to the perpendicular.',
      'Rain-man: man tilts umbrella forward into the relative velocity vector of rain with respect to man.',
    ],
    variables: [
      { symbol: 'v_b, v_r', meaning: 'Velocity of swimmer/boat and river' },
      { symbol: 'd', meaning: 'Width of river (m)' },
    ],
    derivedFrom: ['c11-kinematics-projectile'],
    specialCasesTo: [],
    analogTo: [],
    flashcard: {
      front: 'River crossing shortest path condition (sin θ) and minimum crossing time t?',
      back: 'Shortest path: sin θ = v_r/v_b upstream; Min time: t = d/v_b heading straight across.',
    },
    tags: ['relative-motion', 'river', 'rain', 'class11'],
    jeeWeight: 3,
  },
  // --- UNIT 3: LAWS OF MOTION ---
  {
    id: 'c11-nlom-friction',
    chapter: 'class11-mechanics',
    subtopic: "Newton's Laws & Friction",
    chain: 'master',
    title: 'Laws of Motion, Friction, Banking & Rocket Propulsion',
    latex: String.raw`F = \frac{dp}{dt} = ma;\quad f_s \le \mu_s N,\ f_k = \mu_k N;\qquad \text{Rocket: } v = u\ln\!\left(\frac{m_0}{m}\right) - gt;\qquad \text{Banking: } \tan\theta = \frac{v^2}{rg}`,
    conditions: [
      'Static friction self-adjusts up to limiting friction f_max = μ_s N; kinetic friction is constant f_k = μ_k N.',
      'Rocket thrust force F_thrust = u (dm/dt) where u is relative exhaust velocity.',
    ],
    variables: [
      { symbol: 'u', meaning: 'Exhaust speed relative to rocket (m/s)' },
      { symbol: 'm_0, m', meaning: 'Initial and instantaneous rocket masses' },
    ],
    derivedFrom: [],
    specialCasesTo: [],
    analogTo: [],
    flashcard: {
      front: 'Rocket velocity formula (Tsiolkovsky equation) and banking angle without friction?',
      back: 'v = u ln(m₀/m) − gt; tan θ = v²/(rg).',
    },
    tags: ['laws-of-motion', 'friction', 'rocket', 'banking', 'class11'],
    jeeWeight: 3,
  },
  // --- UNIT 4: WORK, ENERGY, POWER & COLLISIONS ---
  {
    id: 'c11-work-energy-collisions',
    chapter: 'class11-mechanics',
    subtopic: 'Work, Energy, Power & Collisions',
    chain: 'master',
    title: 'Work-Energy Theorem, Conservative Forces & 1D Collisions',
    latex: String.raw`W_{\text{net}} = \Delta KE;\quad F = -\frac{dU}{dx};\qquad e = \frac{v_2 - v_1}{u_1 - u_2}; \qquad \text{Inelastic KE loss: } \Delta KE = \frac{1}{2}\mu_r (u_1 - u_2)^2 (1 - e^2)`,
    conditions: [
      'Conservative force equilibrium occurs where dU/dx = 0 (stable if d²U/dx² > 0).',
      'Coefficient of restitution e = 1 for perfectly elastic collision, e = 0 for perfectly inelastic collision.',
    ],
    variables: [
      { symbol: 'e', meaning: 'Coefficient of restitution (0 ≤ e ≤ 1)' },
      { symbol: '\\mu_r', meaning: 'Reduced mass m₁m₂/(m₁ + m₂)' },
    ],
    derivedFrom: [],
    specialCasesTo: [],
    analogTo: [],
    flashcard: {
      front: 'Conservative force relation to potential energy and coefficient of restitution e formula?',
      back: 'F = −dU/dx; e = (v₂ − v₁)/(u₁ − u₂).',
    },
    tags: ['work-energy', 'collisions', 'restitution', 'class11'],
    jeeWeight: 3,
  },
  // --- UNIT 5: ROTATIONAL MOTION ---
  {
    id: 'c11-rotational-dynamics',
    chapter: 'class11-rotational',
    subtopic: 'Rotational Motion & Moment of Inertia',
    chain: 'master',
    title: 'Moment of Inertia Theorems, Torque, Angular Momentum & Rolling',
    latex: String.raw`I = I_{\text{cm}} + Md^2\ (\text{Parallel});\quad I_z = I_x + I_y\ (\text{Perp});\quad L = I\omega;\quad a_{\text{rolling}} = \frac{g\sin\theta}{1 + k^2/R^2}`,
    conditions: [
      'Perpendicular axes theorem applies strictly to 2D planar laminas.',
      'Radius of gyration k = √(I/M); fraction of KE that is rotational = k²/(R² + k²).',
    ],
    variables: [
      { symbol: 'I', meaning: 'Moment of inertia (kg·m²)' },
      { symbol: 'k', meaning: 'Radius of gyration (m)' },
    ],
    derivedFrom: [],
    specialCasesTo: [],
    analogTo: [],
    flashcard: {
      front: 'Parallel axis theorem and pure rolling acceleration down incline formula?',
      back: 'I = I_cm + Md²; a_roll = g sinθ / (1 + k²/R²).',
    },
    tags: ['rotation', 'moment-of-inertia', 'rolling', 'class11'],
    jeeWeight: 3,
  },
  // --- UNIT 6: GRAVITATION ---
  {
    id: 'c11-gravitation',
    chapter: 'class11-gravitation',
    subtopic: 'Gravitation & Kepler Laws',
    chain: 'master',
    title: 'Gravitation: Variation of g, Escape Velocity & Kepler Laws',
    latex: String.raw`g' = g\left(1 - \frac{2h}{R}\right)\ (h \ll R);\quad g' = g\left(1 - \frac{d}{R}\right);\quad g' = g - R\omega^2\cos^2\lambda;\qquad v_{\text{escape}} = \sqrt{2gR} \approx 11.2\text{ km/s}`,
    conditions: [
      'Acceleration due to gravity g is maximum at Earth surface and zero at Earth centre.',
      'Total mechanical energy of bound satellite E = −GMm/(2r) < 0; binding energy = +GMm/(2r).',
    ],
    variables: [
      { symbol: 'h, d', meaning: 'Height above and depth below Earth surface' },
      { symbol: '\\lambda', meaning: 'Latitude angle' },
    ],
    derivedFrom: ['elec-coulomb'],
    specialCasesTo: [],
    analogTo: ['elec-coulomb'],
    flashcard: {
      front: 'Variation of g with height h and depth d formulas?',
      back: 'g_h ≈ g(1 − 2h/R); g_d = g(1 − d/R). Escape velocity v_esc = √(2gR).',
    },
    tags: ['gravitation', 'escape-velocity', 'g-variation', 'class11'],
    jeeWeight: 3,
  },
  // --- UNIT 7: PROPERTIES OF MATTER & THERMAL PROPERTIES ---
  {
    id: 'c11-properties-solids-fluids',
    chapter: 'class11-properties',
    subtopic: 'Properties of Matter (Solids, Fluids & Heat Transfer)',
    chain: 'master',
    title: 'Elasticity, Surface Tension, Viscosity, Bernoulli & Heat Transfer',
    latex: String.raw`Y = \frac{FL}{A\Delta L};\quad P_{\text{excess}} = \frac{2T}{R}\ (\text{drop}),\ \frac{4T}{R}\ (\text{bubble});\quad h = \frac{2T\cos\theta}{r\rho g};\quad v_{\text{efflux}} = \sqrt{2gh};\qquad \frac{dQ}{dt} = -kA\frac{dT}{dx}`,
    conditions: [
      'Soap bubble has TWO free surfaces (hence 4T/R), whereas a liquid drop has ONE surface (2T/R).',
      'Newton’s law of cooling: dT/dt = −k(T − T_0).',
    ],
    variables: [
      { symbol: 'T', meaning: 'Surface tension (N/m)' },
      { symbol: 'k', meaning: 'Thermal conductivity (W/m·K)' },
    ],
    derivedFrom: [],
    specialCasesTo: [],
    analogTo: [],
    flashcard: {
      front: 'Capillary rise formula h and excess pressure for soap bubble vs liquid drop?',
      back: 'h = 2T cosθ / (rρg); Drop = 2T/R, Soap Bubble = 4T/R.',
    },
    tags: ['elasticity', 'fluids', 'surface-tension', 'heat-transfer', 'class11'],
    jeeWeight: 3,
  },
  // --- UNIT 8: THERMODYNAMICS & KTG ---
  {
    id: 'c11-thermodynamics-ktg',
    chapter: 'class11-thermodynamics',
    subtopic: 'Thermodynamics & Kinetic Theory of Gases',
    chain: 'master',
    title: 'First Law, Carnot Efficiency, Mayer Relation & Gas RMS Speed',
    latex: String.raw`\Delta Q = \Delta U + W;\quad C_p - C_v = R;\quad \gamma = 1 + \frac{2}{f};\qquad \eta = 1 - \frac{T_2}{T_1};\qquad v_{\text{rms}} = \sqrt{\frac{3RT}{M}}`,
    conditions: [
      'Mayer relation C_p − C_v = R holds for ideal gases; adiabatic process PV^γ = constant (Q = 0).',
      'Temperatures T₁ and T₂ in Carnot efficiency must be in Kelvin.',
    ],
    variables: [
      { symbol: 'f', meaning: 'Degrees of freedom (monoatomic 3, diatomic 5)' },
      { symbol: '\\gamma', meaning: 'Ratio of heat capacities C_p/C_v' },
    ],
    derivedFrom: [],
    specialCasesTo: [],
    analogTo: [],
    flashcard: {
      front: 'Mayer relation C_p − C_v, adiabatic index γ in terms of degrees of freedom f, and RMS speed formula?',
      back: 'C_p − C_v = R; γ = 1 + 2/f; v_rms = √(3RT/M).',
    },
    tags: ['thermodynamics', 'ktg', 'carnot', 'mayer', 'class11'],
    jeeWeight: 3,
  },
  // --- UNIT 9 & 10: SHM & WAVES ---
  {
    id: 'c11-shm-waves',
    chapter: 'class11-waves-shm',
    subtopic: 'Oscillations (SHM) & Waves',
    chain: 'master',
    title: 'SHM, Pendulum, Standing Waves in Pipes & Doppler Effect',
    latex: String.raw`a = -\omega^2 x;\quad T = 2\pi\sqrt{\frac{m}{k}};\quad T_{\text{pend}} = 2\pi\sqrt{\frac{L}{g}};\qquad \nu_{\text{open}} = \frac{nv}{2L},\ \nu_{\text{closed}} = \frac{(2n-1)v}{4L};\qquad f' = f\left(\frac{v \pm v_o}{v \mp v_s}\right)`,
    conditions: [
      'Closed organ pipe produces ONLY odd harmonics ((2n−1)v/4L); open organ pipe produces ALL harmonics (nv/2L).',
      'Doppler sign convention: upper signs when approaching, lower signs when receding.',
    ],
    variables: [
      { symbol: 'v_o, v_s', meaning: 'Observer and source speeds (m/s)' },
      { symbol: 'L', meaning: 'Length of organ pipe or string (m)' },
    ],
    derivedFrom: [],
    specialCasesTo: [],
    analogTo: [],
    flashcard: {
      front: 'Open vs closed organ pipe frequency formulas and Doppler frequency shift formula?',
      back: 'Open: ν = nv/(2L); Closed: ν = (2n−1)v/(4L); Doppler: f\' = f[(v ± v_o)/(v ∓ v_s)].',
    },
    tags: ['shm', 'waves', 'sound', 'doppler', 'pipe-harmonics', 'class11'],
    jeeWeight: 3,
  },
];
