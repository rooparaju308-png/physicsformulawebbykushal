import { ChapterId, Formula } from '../types/physics';

export interface ShortNoteFormulaItem {
  label: string;
  latex: string;
  formulaId: string;
}

export interface ShortNoteSection {
  title: string;
  items: ShortNoteFormulaItem[];
}

export interface ShortNoteGraphItem {
  title: string;
  summary: string;
  graphId?: string;
  formulaId: string;
}

export interface ShortNoteTable {
  title: string;
  headers: string[];
  rows: string[][];
}

export interface ShortNoteChapter {
  id: ChapterId | 'emi-ac';
  number: number;
  unitTag: string;
  title: string;
  shortTitle: string;
  subtitle: string;
  accentColor: string;
  labId: NonNullable<Formula['labId']>;
  simTitle: string;
  simDescription: string;
  ntaRemoved?: string[];
  comparisonTable?: ShortNoteTable;
  sections: ShortNoteSection[];
  mustKnowGraphs: ShortNoteGraphItem[];
  jeeTraps: { point: string; formulaId: string }[];
}

export const NTA_SYLLABUS_REMOVALS: { unit: string; topics: string }[] = [
  {
    unit: 'Current Electricity',
    topics: 'Colour code for carbon resistors, Potentiometer and its applications.',
  },
  {
    unit: 'Magnetism',
    topics: "Cyclotron, Earth's magnetic field and magnetic elements, Hysteresis loop, Electromagnets and permanent magnets.",
  },
  {
    unit: 'Alternating Current',
    topics: 'LC Oscillations, Quality Factor (Q-factor) formula derivations.',
  },
  {
    unit: 'Atoms & Nuclei (JEE 2027)',
    topics: 'Radioactivity (α, β, γ decay laws, half-life, activity A = λN) & Davisson–Germer experiment.',
  },
];

export const SHORT_NOTES: ShortNoteChapter[] = [
  {
    id: 'electrostatics',
    number: 1,
    unitTag: 'Unit 11 · Ch 1 & 2',
    title: 'Unit 11: Electrostatics & Capacitance',
    shortTitle: 'Unit 11 · Electrostatics',
    subtitle: 'Coulomb vector form, ring/arc/wire E-fields, dipole SHM, cube Gauss shortcuts, concentric shells & capacitor heat loss',
    accentColor: '#22d3ee',
    labId: 'capacitor',
    simTitle: 'Capacitor & Dielectric Battery Simulator',
    simDescription: 'Toggle battery connected vs disconnected while inserting dielectric K, and check E, V, Q, U & F live.',
    sections: [
      {
        title: '1. Electric Charges & Continuous Fields',
        items: [
          {
            label: "Coulomb's Law (Vector Form)",
            latex: String.raw`\vec{F}_{12} = \frac{k q_1 q_2}{|\vec{r}_1 - \vec{r}_2|^3}(\vec{r}_1 - \vec{r}_2),\qquad k = \frac{1}{4\pi\varepsilon_0} = 9\times 10^9\text{ N}\cdot\text{m}^2/\text{C}^2`,
            formulaId: 'elec-coulomb',
          },
          {
            label: 'Uniform Ring (Axis Distance x)',
            latex: String.raw`E = \frac{kQx}{(R^2 + x^2)^{3/2}};\qquad E_{\max}\text{ at } x = \pm\frac{R}{\sqrt{2}}`,
            formulaId: 'lar-ring-e-axis',
          },
          {
            label: 'Uniform Circular Arc (Angle θ at Center)',
            latex: String.raw`E = \frac{2k\lambda}{R}\sin\!\left(\frac{\theta}{2}\right)\qquad\left(\text{Semicircle }\theta=\pi \implies E = \frac{2k\lambda}{R}\right)`,
            formulaId: 'lar-arc-e',
          },
          {
            label: 'Finite Straight Wire (Perpendicular Distance d)',
            latex: String.raw`E_\perp = \frac{k\lambda}{d}(\sin\theta_1 + \sin\theta_2),\qquad E_\parallel = \frac{k\lambda}{d}(\cos\theta_2 - \cos\theta_1)`,
            formulaId: 'lar-wire-e-perp',
          },
          {
            label: 'Electric Dipole: General Point (r, θ) & SHM',
            latex: String.raw`E = \frac{kp}{r^3}\sqrt{1 + 3\cos^2\theta},\quad \tan\alpha = \frac{1}{2}\tan\theta;\qquad T_{\text{SHM}} = 2\pi\sqrt{\frac{I}{pE}}`,
            formulaId: 'elec-dipole-general',
          },
          {
            label: "Gauss's Law Cube Symmetry Shortcuts",
            latex: String.raw`\text{Center: }\Phi_{\text{tot}}=\frac{q}{\varepsilon_0},\ \Phi_{\text{face}}=\frac{q}{6\varepsilon_0};\qquad\text{Corner: }\Phi_{\text{cube}}=\frac{q}{8\varepsilon_0}\ \left(0\text{ on 3 touching faces},\ \frac{q}{24\varepsilon_0}\text{ on other 3}\right)`,
            formulaId: 'elec-cube-flux',
          },
          {
            label: 'Solid Non-Conducting Sphere (Uniform ρ)',
            latex: String.raw`\text{Outside }(r\ge R):\ E=\frac{kQ}{r^2};\qquad\text{Inside }(r<R):\ E=\frac{kQr}{R^3}=\frac{\rho r}{3\varepsilon_0}`,
            formulaId: 'elec-solid-sphere',
          },
        ],
      },
      {
        title: '2. Potential, Shells & Capacitance',
        items: [
          {
            label: 'Field–Potential Gradient',
            latex: String.raw`\vec{E} = -\nabla V = -\left(\frac{\partial V}{\partial x}\hat{i} + \frac{\partial V}{\partial y}\hat{j} + \frac{\partial V}{\partial z}\hat{k}\right)`,
            formulaId: 'elec-e-v-relation',
          },
          {
            label: 'Concentric Shells (R₁ Inner, R₂ Outer; Charges q₁, q₂)',
            latex: String.raw`V_{\text{inner}} - V_{\text{outer}} = k q_1\left(\frac{1}{R_1} - \frac{1}{R_2}\right)\qquad(\text{depends ONLY on inner charge }q_1!)`,
            formulaId: 'elec-concentric-shells',
          },
          {
            label: 'Common Potential & Heat Loss on Sharing',
            latex: String.raw`V_{\text{common}} = \frac{C_1 V_1 \pm C_2 V_2}{C_1 + C_2};\qquad \Delta H = \frac{1}{2}\frac{C_1 C_2}{C_1 + C_2}(V_1 \mp V_2)^2\quad(\text{flip sign for opposite polarity})`,
            formulaId: 'elec-cap-sharing',
          },
          {
            label: 'Dielectric Combinations (Series vs Parallel)',
            latex: String.raw`\text{Distance div (Series): } C = \frac{\varepsilon_0 A}{\frac{t_1}{K_1}+\frac{t_2}{K_2}};\qquad\text{Area div (Parallel): } C = \frac{\varepsilon_0}{d}(K_1 A_1 + K_2 A_2)`,
            formulaId: 'elec-cap-combo-dielectric',
          },
          {
            label: 'Force Between Capacitor Plates',
            latex: String.raw`F = \frac{Q^2}{2A\varepsilon_0}\qquad(\text{always attractive, independent of } d)`,
            formulaId: 'elec-cap-force',
          },
        ],
      },
    ],
    mustKnowGraphs: [
      {
        title: 'E(r) & V(r) for Solid Non-Conducting Sphere',
        summary: 'E rises linearly inside (r < R) to kQ/R² then decays as 1/r²; V peaks at center at 1.5 kQ/R.',
        graphId: 'g1-e-vs-r',
        formulaId: 'elec-solid-sphere',
      },
      {
        title: 'Ring Axial Electric Field E(x)',
        summary: 'Zero at center (x = 0), peaks sharply at x = ±R/√2, then decays as 1/x² at large distance.',
        graphId: 'g3-ring-disc-e',
        formulaId: 'lar-ring-e-axis',
      },
    ],
    jeeTraps: [
      {
        point: 'In concentric spherical shells, the potential difference ΔV = V_inner − V_outer depends ONLY on the inner charge q₁ and is completely unaffected by outer charge q₂.',
        formulaId: 'elec-concentric-shells',
      },
      {
        point: 'Attractive force between isolated capacitor plates F = Q²/(2Aε₀) is independent of plate separation d — pulling plates apart does work to raise stored energy U.',
        formulaId: 'elec-cap-force',
      },
      {
        point: 'When joining capacitors with opposite polarities (+ to −), use (C₁V₁ − C₂V₂) for V_common and (V₁ + V₂)² in heat loss ΔH!',
        formulaId: 'elec-cap-sharing',
      },
    ],
  },
  {
    id: 'current',
    number: 2,
    unitTag: 'Unit 12 · Ch 3',
    title: 'Unit 12: Current Electricity',
    shortTitle: 'Unit 12 · Current',
    subtitle: 'Wire stretching shortcuts, thermal compensation, max power transfer, rated bulb tricks & Metre Bridge',
    accentColor: '#34d399',
    labId: 'rc-dc',
    simTitle: 'RC DC Transient & Circuit Lab',
    simDescription: 'Explore DC charging/discharging exponentials, energy split (50% heat / 50% stored), and steady-state open/short capacitor limits.',
    ntaRemoved: [
      'Colour code for carbon resistors (removed by NTA)',
      'Potentiometer and its applications (removed by NTA)',
    ],
    sections: [
      {
        title: 'Wire Stretching & Temperature Effects',
        items: [
          {
            label: 'Stretching a Wire (Volume Constant)',
            latex: String.raw`R' = n^2 R;\qquad \text{Small change }(<5\%):\ \frac{\Delta R}{R} \approx 2\frac{\Delta l}{l} = -4\frac{\Delta r}{r}`,
            formulaId: 'curr-stretch',
          },
          {
            label: 'Temperature Dependence & Zero-Temp-Coeff Series Combo',
            latex: String.raw`R_T = R_0[1 + \alpha(T - T_0)];\qquad R_1 \alpha_1 + R_2 \alpha_2 = 0\ (\text{for } T\text{-independent series } R_{\text{eq}})`,
            formulaId: 'curr-temp',
          },
        ],
      },
      {
        title: 'Power Transfer, Bulbs & Metre Bridge',
        items: [
          {
            label: 'Maximum Power Transfer Theorem',
            latex: String.raw`\text{At } R = r:\quad P_{\max} = \frac{\varepsilon^2}{4r}\qquad(\text{efficiency at } P_{\max} = 50\%)`,
            formulaId: 'curr-max-power',
          },
          {
            label: 'Rated Bulb Resistance & Brightness Rule',
            latex: String.raw`R_{\text{bulb}} = \frac{V_{\text{rated}}^2}{P_{\text{rated}}};\quad \text{Series (}I\text{ same): lower }P_{\text{rated}}\text{ glows brighter \& fuses first};\quad \text{Parallel: higher }P_{\text{rated}}\text{ glows brighter}`,
            formulaId: 'curr-bulb',
          },
          {
            label: 'Metre Bridge (Experimental Skills)',
            latex: String.raw`S = R\left(\frac{100 - l}{l}\right)\qquad(l\text{ in cm from left end with known }R)`,
            formulaId: 'curr-metre-bridge',
          },
        ],
      },
    ],
    mustKnowGraphs: [
      {
        title: 'External Load Power P(R) vs Load Resistance R',
        summary: 'Rises steeply from 0, hits peak P_max = ε²/(4r) exactly at R = r (50% efficiency), then falls slowly.',
        graphId: 'g8-pot-cell',
        formulaId: 'curr-max-power',
      },
      {
        title: 'RC Charging & Discharging Transients',
        summary: 'q(t) rises to 63.2% of CV₀ at t = τ; battery supplies CV₀² while capacitor stores ½CV₀² (50% lost as heat).',
        graphId: 'g6-rc-transients',
        formulaId: 'curr-rc-charging',
      },
    ],
    jeeTraps: [
      {
        point: 'In wire stretching with >5% length change (e.g., +20% or 2×), NEVER use ΔR/R = 2 Δl/l; always use exact R′ = (1 + Δl/l)² R.',
        formulaId: 'curr-stretch',
      },
      {
        point: 'Two bulbs rated 25W and 100W in SERIES across 220V: the 25W bulb has 4× resistance, takes 4× voltage drop, glows brighter, and fuses first!',
        formulaId: 'curr-bulb',
      },
      {
        point: 'Focus prep on Metre Bridge, Wheatstone Bridge, and RC transients — Potentiometer & Carbon Colour Codes are removed from NTA JEE Main.',
        formulaId: 'curr-metre-bridge',
      },
    ],
  },
  {
    id: 'magnetism',
    number: 3,
    unitTag: 'Unit 13 · Ch 4 & 5',
    title: 'Unit 13: Magnetic Effects & Magnetism',
    shortTitle: 'Unit 13 · Magnetism',
    subtitle: 'Wire/square/arc B-field, p/d/α radius ratios, helical pitch, gyromagnetic ratio, half-deflection galvanometer & Curie-Weiss',
    accentColor: '#a855f7',
    labId: 'magnetism',
    simTitle: 'Charge in B-Field, Helical & Wire Force Lab',
    simDescription: 'Simulate circular and helical trajectories of proton, deuteron & alpha particles, plus parallel wire attraction/repulsion.',
    ntaRemoved: [
      'Cyclotron (removed by NTA)',
      "Earth's magnetic field and magnetic elements (removed by NTA)",
      'Hysteresis loop, Electromagnets & permanent magnets (removed by NTA)',
    ],
    sections: [
      {
        title: 'Magnetic Fields & Charged Particle Motion',
        items: [
          {
            label: 'Finite Straight Wire & Square Loop Center',
            latex: String.raw`B = \frac{\mu_0 I}{4\pi d}(\sin\theta_1 + \sin\theta_2);\qquad B_{\text{square center}} = \frac{2\sqrt{2}\mu_0 I}{\pi a}`,
            formulaId: 'lar-wire-b',
          },
          {
            label: 'Circular Arc (Angle θ in Radians)',
            latex: String.raw`B = \frac{\mu_0 I \theta}{4\pi R}`,
            formulaId: 'lar-arc-b',
          },
          {
            label: 'Circular Motion & p : d : α JEE Shortcuts (v ⊥ B)',
            latex: String.raw`r = \frac{mv}{qB} = \frac{\sqrt{2mK}}{qB} = \frac{1}{B}\sqrt{\frac{2mV}{q}};\quad \text{Same }K:\ r_p:r_d:r_\alpha = 1:\sqrt{2}:1;\quad \text{Same }V:\ 1:\sqrt{2}:\sqrt{2}`,
            formulaId: 'mag-circle',
          },
          {
            label: 'Helical Path (v at Angle θ to B)',
            latex: String.raw`r = \frac{mv\sin\theta}{qB},\qquad \text{Pitch } p = (v\cos\theta)T = \frac{2\pi m v \cos\theta}{qB}`,
            formulaId: 'mag-helix',
          },
        ],
      },
      {
        title: 'Dipole, Galvanometer & Magnetic Materials',
        items: [
          {
            label: 'Universal Gyromagnetic Ratio',
            latex: String.raw`\frac{\mu}{L} = \frac{q}{2m}\qquad(\text{valid for any uniform-}q/m\text{ ring, rod, disc or sphere})`,
            formulaId: 'mag-orbit-bohr',
          },
          {
            label: 'Galvanometer Sensitivity & Half-Deflection Method',
            latex: String.raw`I_s = \frac{\theta}{I} = \frac{NBA}{k},\quad V_s = \frac{I_s}{R_g};\qquad G = \frac{R\cdot S}{R - S}\approx S,\quad k_{\text{fig}} = \frac{\varepsilon}{(R+G)\theta}`,
            formulaId: 'mag-mcg',
          },
          {
            label: 'Bar Magnet Oscillation & Curie / Curie-Weiss Law',
            latex: String.raw`T = 2\pi\sqrt{\frac{I}{MB}};\qquad \text{Para: }\chi\propto\frac{1}{T},\quad\text{Ferro }(T>T_c):\ \chi = \frac{C}{T - T_c}\quad(\text{Dia }\chi\text{ indep. of }T)`,
            formulaId: 'mag-materials',
          },
        ],
      },
    ],
    mustKnowGraphs: [
      {
        title: 'Thick Wire & Solenoid B(r) Profile',
        summary: 'Thick current wire: B grows linearly inside (r < R) and falls as 1/r outside. Hollow pipe has B = 0 inside.',
        graphId: 'g9-mag-b',
        formulaId: 'mag-thick-wire',
      },
      {
        title: 'Magnetic Susceptibility χ vs Temperature T',
        summary: 'Diamagnetic: flat negative constant; Paramagnetic: 1/T hyperbola; Ferromagnetic above T_c: 1/(T − T_c).',
        graphId: 'g12-magnetisation',
        formulaId: 'mag-materials',
      },
    ],
    jeeTraps: [
      {
        point: 'Doubling turns N of a galvanometer doubles Current Sensitivity (I_s ∝ N), NOT necessarily Voltage Sensitivity (if R_g also doubles, V_s stays unchanged!).',
        formulaId: 'mag-mcg',
      },
      {
        point: 'Proton (1,1), Deuteron (2,1), Alpha (4,2): same Kinetic Energy gives r_p = r_α = r_d / √2; same Accelerating Voltage gives r_d = r_α = √2 r_p.',
        formulaId: 'mag-circle',
      },
    ],
  },
  {
    id: 'emi-ac',
    number: 4,
    unitTag: 'Unit 14 · Ch 6 & 7',
    title: 'Unit 14: EMI & Alternating Currents',
    shortTitle: 'Unit 14 · EMI & AC',
    subtitle: 'Bent-wire motional l_eff, rail terminal speed, aiding/opposing inductors, AC generator, DC+AC RMS & LCR table',
    accentColor: '#f59e0b',
    labId: 'rlc',
    simTitle: 'Series RLC Phasor, Resonance & Impedance Lab',
    simDescription: 'Sweep ω around ω₀ = 1/√LC to watch X_L vs X_C dominance, phase φ, power factor cosφ, and resonance current peak live.',
    ntaRemoved: [
      'LC Oscillations (removed by NTA)',
      'Quality Factor (Q-factor) formula derivations (removed by NTA)',
    ],
    comparisonTable: {
      title: 'Series LCR Circuit Quick-Check Table',
      headers: ['Condition', 'Dominance', 'Phase (V vs I)', 'Power Factor (cos φ)'],
      rows: [
        ['X_L > X_C (ω > ω₀)', 'Inductive', 'V leads I by φ', 'R / Z (Lagging)'],
        ['X_C > X_L (ω < ω₀)', 'Capacitive', 'I leads V by φ', 'R / Z (Leading)'],
        ['X_L = X_C (ω = ω₀ = 1/√LC)', 'Purely Resistive', 'Same phase (φ = 0)', '1 (Maximum power)'],
      ],
    },
    sections: [
      {
        title: '1. Electromagnetic Induction (Ch 6)',
        items: [
          {
            label: 'Motional EMF & Effective Straight Vector l_eff',
            latex: String.raw`\varepsilon = \int (\vec{v}\times\vec{B})\cdot d\vec{l}\qquad(\text{replace bent wire with }\vec{l}_{\text{eff}}\text{ joining ends})`,
            formulaId: 'emi-motional',
          },
          {
            label: 'Rail Braking Force & Terminal Velocity',
            latex: String.raw`F_m = I l B = \frac{B^2 l^2 v}{R};\qquad v_T = \frac{F_{\text{ext}} R}{B^2 l^2}\quad(\text{when } F_{\text{ext}} = F_m)`,
            formulaId: 'emi-sliding-rod',
          },
          {
            label: 'Coupled Inductors (Aiding vs Opposing Flux)',
            latex: String.raw`L_{\text{eq}} = L_1 + L_2 + 2M\ (\text{aiding}),\quad L_1 + L_2 - 2M\ (\text{opposing});\qquad K = \frac{M}{\sqrt{L_1 L_2}}\ (0\le K\le 1)`,
            formulaId: 'emi-inductor-combo',
          },
          {
            label: 'AC Generator Instantaneous EMF',
            latex: String.raw`\varepsilon(t) = N B A \omega \sin(\omega t) = \varepsilon_0 \sin(\omega t)`,
            formulaId: 'ac-generator',
          },
        ],
      },
      {
        title: '2. Alternating Current (Ch 7)',
        items: [
          {
            label: 'RMS of Combined DC + AC Waveform',
            latex: String.raw`I(t) = I_0 + I_1\sin\omega t + I_2\cos\omega t \implies I_{\text{rms}} = \sqrt{I_0^2 + \frac{I_1^2 + I_2^2}{2}}`,
            formulaId: 'ac-rms-mean',
          },
          {
            label: 'Series RLC Impedance & Power Factor',
            latex: String.raw`Z = \sqrt{R^2 + (X_L - X_C)^2},\quad \tan\phi = \frac{X_L - X_C}{R},\quad P_{\text{avg}} = V_{\text{rms}}I_{\text{rms}}\cos\phi`,
            formulaId: 'ac-rlc-impedance',
          },
        ],
      },
    ],
    mustKnowGraphs: [
      {
        title: 'Series RLC Resonance Curve (I_rms vs ω) & X_L, X_C vs ω',
        summary: 'X_L rises linearly with ω, X_C drops as 1/ω; they intersect at ω₀ = 1/√LC where Z = R and current peaks at V_rms/R.',
        graphId: 'g15-ac',
        formulaId: 'ac-resonance',
      },
      {
        title: 'LR Growth & Decay Exponential Curves',
        summary: 'Inductor opposes sudden ΔI: open switch at t = 0, zero-resistance short wire at steady state t → ∞.',
        graphId: 'g14-lr-lc',
        formulaId: 'emi-lr-circuit',
      },
    ],
    jeeTraps: [
      {
        point: 'For combined DC + AC current I(t) = I₀ + I₁ sinωt, do NOT just take I₀ + I₁/√2 — always square and average: I_rms = √(I₀² + I₁²/2).',
        formulaId: 'ac-rms-mean',
      },
      {
        point: 'A closed conducting loop translating completely inside a uniform magnetic field has ZERO net flux change ⇒ net EMF = 0 even though each branch sees Blv!',
        formulaId: 'emi-motional',
      },
    ],
  },
  {
    id: 'em-waves',
    number: 5,
    unitTag: 'Unit 15 · Ch 8',
    title: 'Unit 15: Electromagnetic Waves',
    shortTitle: 'Unit 15 · EM Waves',
    subtitle: 'Guaranteed 4-mark wave equation reading (E × B = v̂), vacuum/medium refractive index, intensity & radiation pressure',
    accentColor: '#ec4899',
    labId: 'wave-optics',
    simTitle: 'Wave Interference & Phase Propagation Lab',
    simDescription: 'Visualize transverse sinusoidal oscillations, wavelength/phase shifts & intensity energy distributions.',
    sections: [
      {
        title: 'EM Wave Equation Reading (Guaranteed 4 Marks)',
        items: [
          {
            label: 'Propagation Direction & Speed from E = E₀ sin(kx − ωt) ĵ',
            latex: String.raw`(kx - \omega t) \Rightarrow +\hat{i},\quad (kx + \omega t) \Rightarrow -\hat{i};\qquad v = \frac{\omega}{k},\qquad n = \frac{c}{v} = \frac{ck}{\omega}`,
            formulaId: 'em-wave-eq',
          },
          {
            label: 'Finding B Vector & Amplitude (Same Phase!)',
            latex: String.raw`\hat{E}\times\hat{B} = \hat{v}\ (\text{e.g. }\hat{j}\times\hat{B} = \hat{i} \Rightarrow \hat{B} = \hat{k});\qquad B_0 = \frac{E_0}{c}\ (\text{vac})\ \text{or}\ \frac{E_0}{v}\ (\text{medium})`,
            formulaId: 'em-wave-eq',
          },
        ],
      },
      {
        title: 'Intensity, Momentum & Radiation Pressure',
        items: [
          {
            label: 'EM Wave Intensity & Average Energy Density',
            latex: String.raw`I = u_{\text{avg}} c = \frac{1}{2}\varepsilon_0 E_0^2 c = \varepsilon_0 E_{\text{rms}}^2 c = \frac{B_0^2 c}{2\mu_0}`,
            formulaId: 'em-intensity',
          },
          {
            label: 'Momentum Transferred & Radiation Pressure',
            latex: String.raw`p = \frac{U}{c}\ (\text{abs}),\ \frac{2U}{c}\ (\text{refl});\qquad P_{\text{rad}} = \frac{I}{c}\ (\text{absorbing}),\ \frac{2I}{c}\ (\text{perfectly reflecting})`,
            formulaId: 'em-momentum-pressure',
          },
        ],
      },
    ],
    mustKnowGraphs: [
      {
        title: 'In-Phase Oscillating E(y) and B(z) Transverse Wave',
        summary: 'E and B are mutually perpendicular to propagation direction v̂ AND reach maxima and zeroes simultaneously (zero phase difference!).',
        graphId: 'g16-em-wave',
        formulaId: 'em-wave-eq',
      },
    ],
    jeeTraps: [
      {
        point: 'Electric and magnetic fields in a plane EM wave have ZERO phase difference (they peak together), NOT π/2!',
        formulaId: 'em-wave-eq',
      },
      {
        point: 'If the EM wave is inside a medium of index n = ck/ω, remember B₀ = E₀ / v = n E₀ / c, NOT E₀ / c!',
        formulaId: 'em-speed',
      },
    ],
  },
  {
    id: 'modern-physics',
    number: 6,
    unitTag: 'Unit 18 · Ch 11–13',
    title: 'Modern Physics (Dual Nature, Atoms & Nuclei)',
    shortTitle: 'Modern Physics',
    subtitle: 'Photoelectric effect, de-Broglie wavelengths, Bohr hydrogen-like atoms & nuclear binding energy',
    accentColor: '#38bdf8',
    labId: 'modern',
    simTitle: 'Photoelectric Effect & Bohr Atom Lab',
    simDescription: 'Adjust metal φ, wavelength λ (nm), intensity & voltage V to see K_max, V₀, Bohr n₂→n₁ transitions, and λ_e/λ_p/λ_α live.',
    sections: [
      {
        title: 'Photoelectric Effect & Photon Formulas',
        items: [
          {
            label: 'Photon Energy & Fast Shortcut',
            latex: String.raw`E = h\nu = \frac{hc}{\lambda} \approx \frac{1240\text{ eV}\cdot\text{nm}}{\lambda\text{ (nm)}}`,
            formulaId: 'mod-photon-energy',
          },
          {
            label: 'Momentum & Beam Force',
            latex: String.raw`p = \frac{E}{c} = \frac{h}{\lambda};\qquad F = \frac{P}{c}\ (\text{100\% abs}),\quad F = \frac{2P}{c}\ (\text{100\% refl})`,
            formulaId: 'mod-photon-energy',
          },
          {
            label: "Einstein's Photoelectric Equation",
            latex: String.raw`K_{\max} = eV_0 = h\nu - \phi = h(\nu - \nu_0) = hc\left(\frac{1}{\lambda} - \frac{1}{\lambda_0}\right)`,
            formulaId: 'mod-einstein-pe',
          },
        ],
      },
      {
        title: 'de-Broglie Matter Waves',
        items: [
          {
            label: 'General de-Broglie Wavelength',
            latex: String.raw`\lambda = \frac{h}{p} = \frac{h}{mv} = \frac{h}{\sqrt{2mK}} = \frac{h}{\sqrt{2mqV}}`,
            formulaId: 'mod-debroglie',
          },
          {
            label: 'Accelerated Charge Shortcuts (V in Volts)',
            latex: String.raw`\lambda_e = \frac{12.27}{\sqrt{V}}\text{ \AA},\qquad \lambda_p = \frac{0.286}{\sqrt{V}}\text{ \AA},\qquad \lambda_\alpha = \frac{0.101}{\sqrt{V}}\text{ \AA}`,
            formulaId: 'mod-debroglie',
          },
        ],
      },
      {
        title: "Bohr's Atomic Model (H-like Species)",
        items: [
          {
            label: 'Quantized Angular Momentum',
            latex: String.raw`L = mvr = \frac{nh}{2\pi}`,
            formulaId: 'mod-bohr-quantization',
          },
          {
            label: 'Radius, Velocity & Energy',
            latex: String.raw`r_n = 0.529\frac{n^2}{Z}\text{ \AA};\quad v_n = 2.18\times 10^6\frac{Z}{n}\text{ m/s};\quad E_n = -13.6\frac{Z^2}{n^2}\text{ eV}`,
            formulaId: 'mod-bohr-quantization',
          },
          {
            label: 'Total, Kinetic & Potential Energy Link',
            latex: String.raw`E_{\text{total}} = -K = \frac{U}{2}`,
            formulaId: 'mod-bohr-quantization',
          },
          {
            label: 'Spectral Transitions & Max Lines',
            latex: String.raw`\frac{1}{\lambda} = R Z^2\left(\frac{1}{n_1^2} - \frac{1}{n_2^2}\right)\ (R = 1.097\times 10^7\text{ m}^{-1});\quad N_{\max} = \frac{n(n-1)}{2}`,
            formulaId: 'mod-spectral-lines',
          },
        ],
      },
      {
        title: 'Rutherford α-Scattering & Nuclear Q-Value (NTA Core)',
        items: [
          {
            label: 'Closest Approach & Impact Parameter',
            latex: String.raw`r_0 = \frac{1}{4\pi\varepsilon_0}\frac{2Ze^2}{K};\qquad b = \frac{Ze^2\cot(\theta/2)}{4\pi\varepsilon_0 K};\qquad N(\theta) \propto \frac{1}{\sin^4(\theta/2)}`,
            formulaId: 'mod-rutherford-scattering',
          },
          {
            label: 'Nuclear Radius',
            latex: String.raw`R = R_0 A^{1/3}\ (R_0 \approx 1.2\times 10^{-15}\text{ m})`,
            formulaId: 'mod-nuclear-radius-density',
          },
          {
            label: 'Mass Defect & Binding Energy',
            latex: String.raw`\Delta m = [Z m_p + (A - Z) m_n] - M_{\text{nucleus}};\qquad BE = \Delta m \times 931.5\text{ MeV}\ (\Delta m\text{ in u})`,
            formulaId: 'mod-binding-energy',
          },
          {
            label: 'Nuclear Q-Value & Endothermic Threshold',
            latex: String.raw`Q = \left(\sum m_R - \sum m_P\right)c^2 = \sum BE_P - \sum BE_R;\qquad K_{\text{th}} = |Q|\left(1 + \frac{m_x}{M_X}\right)`,
            formulaId: 'mod-nuclear-qvalue',
          },
        ],
      },
    ],
    mustKnowGraphs: [
      {
        title: 'Stopping Potential (V₀) vs Frequency (ν)',
        summary: 'Straight line with universal slope h/e across ALL metals and y-intercept −φ/e.',
        graphId: 'g17-photoelectric',
        formulaId: 'mod-einstein-pe',
      },
      {
        title: 'Photocurrent (I) vs Collector Potential (V)',
        summary: 'Fixed frequency with varying intensities (I₁, I₂, I₃) gives higher saturation currents at the SAME stopping potential (−V₀). Fixed intensity with varying frequencies (ν₁, ν₂, ν₃) gives the SAME saturation current at different stopping potentials.',
        graphId: 'g17-photoelectric',
        formulaId: 'mod-einstein-pe',
      },
      {
        title: 'Binding Energy per Nucleon (BE/A) vs Mass Number (A)',
        summary: 'Peaks at ⁵⁶Fe (8.8 MeV); light nuclei undergo fusion and heavy nuclei (A > 200) undergo fission to move toward greater stability.',
        graphId: 'g18-be-curve',
        formulaId: 'mod-binding-energy',
      },
    ],
    jeeTraps: [
      {
        point: 'Nuclear density (ρ ≈ 2.3 × 10¹⁷ kg/m³) is completely independent of mass number A.',
        formulaId: 'mod-nuclear-radius-density',
      },
      {
        point: 'Q-value order FLIPS between masses and Binding Energies: Q = (m_R − m_P)c² = BE_P − BE_R. Endothermic threshold K_th = |Q|(1 + m_x/M_X) > |Q|.',
        formulaId: 'mod-nuclear-qvalue',
      },
      {
        point: 'Rutherford closest approach r₀ ∝ 1/K ∝ 1/v²: doubling α-particle speed quarters r₀.',
        formulaId: 'mod-rutherford-scattering',
      },
      {
        point: 'Doubling light intensity doubles the number of photons (and saturation photocurrent), NOT the kinetic energy (K_max) of ejected electrons.',
        formulaId: 'mod-einstein-pe',
      },
      {
        point: 'As Bohr orbit n increases, kinetic energy K decreases (v ∝ 1/n) while potential energy U and total energy E_total become less negative (increase toward 0).',
        formulaId: 'mod-bohr-quantization',
      },
    ],
  },
  {
    id: 'semiconductors',
    number: 7,
    unitTag: 'Unit 19 · Ch 14',
    title: 'Semiconductors & Digital Electronics',
    shortTitle: 'Semiconductors',
    subtitle: 'Carrier concentration, mobility, special diode quadrants, Zener regulator, rectifiers & Boolean gates',
    accentColor: '#10b981',
    labId: 'semiconductor',
    simTitle: 'Semiconductor Quadrants, Zener & Logic Gate Lab',
    simDescription: 'Inspect all 4 diode I–V quadrants, test live Zener voltage regulation (I_s = I_Z + I_L), and toggle universal NAND/NOR truth tables.',
    sections: [
      {
        title: 'Intrinsic & Extrinsic Semiconductors',
        items: [
          {
            label: 'Mass Action Law & Charge Neutrality',
            latex: String.raw`n_e n_h = n_i^2, \qquad n_e + N_a = n_h + N_d`,
            formulaId: 'semi-mass-action-neutrality',
          },
          {
            label: 'Current, Conductivity & Drift Mobility',
            latex: String.raw`I = eA(n_e v_e + n_h v_h);\qquad \sigma = \frac{1}{\rho} = e(n_e\mu_e + n_h\mu_h);\qquad \mu = \frac{v_d}{E}`,
            formulaId: 'semi-conductivity',
          },
        ],
      },
      {
        title: 'Diodes, Rectifiers & Voltage Regulator',
        items: [
          {
            label: 'Diode Dynamic AC Resistance',
            latex: String.raw`r_d = \frac{\Delta V}{\Delta I}`,
            formulaId: 'semi-diode-characteristics',
          },
          {
            label: 'Half-Wave & Full-Wave Rectifiers',
            latex: String.raw`\text{Half-Wave: } f_{\text{ripple}} = f_{\text{in}},\ \eta_{\max} = 40.6\%;\qquad \text{Full-Wave: } f_{\text{ripple}} = 2f_{\text{in}},\ \eta_{\max} = 81.2\%`,
            formulaId: 'semi-rectifier',
          },
          {
            label: 'Zener Diode Voltage Regulator',
            latex: String.raw`I_s = \frac{V_{\text{in}} - V_Z}{R_s},\qquad I_s = I_Z + I_L,\qquad I_L = \frac{V_Z}{R_L}`,
            formulaId: 'semi-zener-regulator',
          },
        ],
      },
      {
        title: 'Boolean Algebra & Logic Gates',
        items: [
          {
            label: "De Morgan's Theorems",
            latex: String.raw`\overline{A \cdot B} = \bar{A} + \bar{B},\qquad \overline{A + B} = \bar{A} \cdot \bar{B}`,
            formulaId: 'semi-boolean-gates',
          },
          {
            label: 'Universal Gates (NAND / NOR)',
            latex: String.raw`1\text{ NAND} = \text{NOT};\qquad 2\text{ NANDs} = \text{AND};\qquad 3\text{ NANDs} = \text{OR}`,
            formulaId: 'semi-boolean-gates',
          },
        ],
      },
    ],
    mustKnowGraphs: [
      {
        title: 'Energy Band Diagrams (Intrinsic vs n-type vs p-type)',
        summary: 'Fermi level lies in the middle for intrinsic, donor level sits just below the Conduction Band (n-type), and acceptor level sits just above the Valence Band (p-type).',
        formulaId: 'semi-mass-action-neutrality',
      },
      {
        title: 'Special Diode I–V Quadrants (Q1, Q3, Q4)',
        summary: 'p-n diode & LED in Q1 (forward); Zener in Q3 (sharp breakdown at −V_Z); Photodiode in Q3 (reverse saturation shifts down with light intensity); Solar Cell in Q4 (unbiased, cuts +V at V_oc and −I at I_sc).',
        formulaId: 'semi-diode-characteristics',
      },
    ],
    jeeTraps: [
      {
        point: 'A p-n junction diode is electrically neutral as a whole; the depletion region contains immobile ions and zero free charge carriers.',
        formulaId: 'semi-diode-characteristics',
      },
      {
        point: 'A full-wave rectifier DOUBLES the output ripple frequency compared to the AC mains frequency (50 Hz → 100 Hz).',
        formulaId: 'semi-rectifier',
      },
      {
        point: 'Photodiode works in Q3 (reverse bias), whereas Solar Cell works unbiased in Q4 to deliver power.',
        formulaId: 'semi-diode-characteristics',
      },
    ],
  },
  {
    id: 'ray-optics',
    number: 8,
    unitTag: 'Unit 16 · Ch 9',
    title: 'Ray Optics & Optical Instruments',
    shortTitle: 'Ray Optics',
    subtitle: 'Spherical mirrors, refraction/TIR, Lens Maker, power/silvered lenses, prism deviation & telescopes',
    accentColor: '#fbbf24',
    labId: 'ray-optics',
    simTitle: 'Ray Optics Bench & Prism δ(i) Lab',
    simDescription: 'Trace principal rays across convex/concave mirrors & lenses, test liquid immersion (n_med > n_lens), and inspect the prism δ vs i U-curve.',
    sections: [
      {
        title: 'Spherical Mirrors',
        items: [
          {
            label: 'Mirror Formula & Magnification',
            latex: String.raw`\frac{1}{v} + \frac{1}{u} = \frac{1}{f} = \frac{2}{R};\qquad m = -\frac{v}{u} = \frac{f}{f - u}`,
            formulaId: 'ray-mirror-formula',
          },
          {
            label: 'Longitudinal Magnification',
            latex: String.raw`m_L = \frac{dv}{du} = -m^2`,
            formulaId: 'ray-mirror-formula',
          },
        ],
      },
      {
        title: 'Refraction, Slab Shift & Total Internal Reflection',
        items: [
          {
            label: "Snell's Law & Apparent Depth",
            latex: String.raw`n_1 \sin i = n_2 \sin r;\qquad d_{\text{app}} = \frac{d_{\text{real}}}{n_{\text{rel}}}`,
            formulaId: 'ray-snell-tir-slab',
          },
          {
            label: 'Slab Normal Shift & Critical Angle',
            latex: String.raw`\Delta x = t\left(1 - \frac{1}{n}\right);\qquad \sin i_c = \frac{n_{\text{rarer}}}{n_{\text{denser}}}`,
            formulaId: 'ray-snell-tir-slab',
          },
        ],
      },
      {
        title: 'Lenses & Refracting Surfaces',
        items: [
          {
            label: 'Single Spherical Surface',
            latex: String.raw`\frac{n_2}{v} - \frac{n_1}{u} = \frac{n_2 - n_1}{R}`,
            formulaId: 'ray-spherical-surface',
          },
          {
            label: "Lens Maker's Formula & Thin Lens",
            latex: String.raw`\frac{1}{f} = \left(\frac{n_{\text{lens}}}{n_{\text{med}}} - 1\right)\left(\frac{1}{R_1} - \frac{1}{R_2}\right);\qquad \frac{1}{v} - \frac{1}{u} = \frac{1}{f},\quad m = \frac{v}{u} = \frac{f}{f+u}`,
            formulaId: 'ray-lens-maker',
          },
          {
            label: 'Power, Separated Lenses & Silvered Lens',
            latex: String.raw`P = \frac{1}{f\text{ (m)}};\quad \frac{1}{f_{\text{eq}}} = \frac{1}{f_1} + \frac{1}{f_2} - \frac{d}{f_1 f_2};\quad \text{Silvered: } P_{\text{eq}} = 2P_L + P_M \implies \frac{1}{f_{\text{eq}}} = \frac{1}{f_M} - \frac{2}{f_L}`,
            formulaId: 'ray-power-combo',
          },
        ],
      },
      {
        title: 'Prism & Dispersion',
        items: [
          {
            label: 'Prism Geometry & Minimum Deviation',
            latex: String.raw`A = r_1 + r_2,\quad \delta = i + e - A;\qquad n = \frac{\sin\!\left(\frac{A+\delta_m}{2}\right)}{\sin\!\left(\frac{A}{2}\right)}\ (\text{at } i = e,\ r_1=r_2=\tfrac{A}{2})`,
            formulaId: 'ray-prism',
          },
          {
            label: 'Thin Prism Deviation (A ≤ 10°)',
            latex: String.raw`\delta = (n - 1)A`,
            formulaId: 'ray-prism',
          },
          {
            label: 'Angular Dispersion, Dispersive Power & Achromatic Doublet',
            latex: String.raw`\theta = (n_v - n_r)A;\quad \omega = \frac{n_v - n_r}{n_y - 1};\qquad \frac{\omega_1}{f_1} + \frac{\omega_2}{f_2} = 0\ (\text{lenses});\qquad \omega_1\delta_1 + \omega_2\delta_2 = 0\ (\text{prisms})`,
            formulaId: 'ray-dispersion-achromatic',
          },
        ],
      },
      {
        title: 'Optical Instruments (D = 25 cm)',
        items: [
          {
            label: 'Simple Microscope',
            latex: String.raw`M_D = 1 + \frac{D}{f};\qquad M_\infty = \frac{D}{f}`,
            formulaId: 'ray-instruments',
          },
          {
            label: 'Compound Microscope',
            latex: String.raw`M_D = \frac{v_0}{|u_0|}\left(1 + \frac{D}{f_e}\right),\quad M_\infty = \frac{v_0}{|u_0|}\left(\frac{D}{f_e}\right),\quad L = v_0 + |u_e|`,
            formulaId: 'ray-instruments',
          },
          {
            label: 'Astronomical Telescope',
            latex: String.raw`M_D = \frac{f_0}{f_e}\left(1 + \frac{f_e}{D}\right);\qquad M_\infty = \frac{f_0}{f_e}\ (L = f_0 + f_e)`,
            formulaId: 'ray-instruments',
          },
        ],
      },
    ],
    mustKnowGraphs: [
      {
        title: 'Angle of Deviation (δ) vs Incidence Angle (i) for a Prism',
        summary: 'Asymmetric U-shaped curve dipping to unique minimum δ_m where i = e; every δ > δ_m has two angles (i and e).',
        graphId: 'g19-prism-uv',
        formulaId: 'ray-prism',
      },
      {
        title: '1/v vs 1/u Straight Line for Mirrors & Lenses',
        summary: 'Mirror: 1/v + 1/u = 1/f gives slope −1 intersecting both axes at 1/f.',
        graphId: 'g19-prism-uv',
        formulaId: 'ray-mirror-formula',
      },
    ],
    jeeTraps: [
      {
        point: 'Cutting a symmetric convex lens PERPENDICULAR to the principal axis doubles its focal length (2f); cutting ALONG the axis keeps f unchanged (only halves image brightness).',
        formulaId: 'ray-lens-maker',
      },
      {
        point: 'If a lens is immersed in a liquid with n_liquid > n_lens, a converging convex lens behaves as a DIVERGING lens.',
        formulaId: 'ray-lens-maker',
      },
      {
        point: 'For a prism, A > 2 i_c ensures NO ray emerges from the second face regardless of incidence angle.',
        formulaId: 'ray-prism',
      },
    ],
  },
  {
    id: 'wave-optics',
    number: 9,
    unitTag: 'Unit 16 · Ch 10',
    title: 'Wave Optics (Interference, Diffraction & Polarization)',
    shortTitle: 'Wave Optics',
    subtitle: 'Coherent superposition, YDSE fringe shifts & liquid immersion, single-slit diffraction & Malus/Brewster',
    accentColor: '#fb7185',
    labId: 'wave-optics',
    simTitle: 'YDSE, Diffraction & Polarization Lab',
    simDescription: 'Explore live YDSE vs single-slit diffraction fringes, liquid immersion, transparent sheet shift Δy, and Malus/Brewster polarization.',
    sections: [
      {
        title: 'Superposition & Intensity',
        items: [
          {
            label: 'Phase–Path Link & Resultant Intensity',
            latex: String.raw`\Delta\phi = \frac{2\pi}{\lambda}\Delta x;\qquad I = I_1 + I_2 + 2\sqrt{I_1 I_2}\cos\Delta\phi\quad (\text{if } I_1=I_2=I_0:\ I = 4I_0\cos^2\!\left(\frac{\Delta\phi}{2}\right))`,
            formulaId: 'wave-superposition-intensity',
          },
          {
            label: 'I_max to I_min Ratio & Slit Width',
            latex: String.raw`\frac{I_{\max}}{I_{\min}} = \left(\frac{\sqrt{I_1}+\sqrt{I_2}}{\sqrt{I_1}-\sqrt{I_2}}\right)^2 = \left(\frac{A_1+A_2}{A_1-A_2}\right)^2 = \left(\frac{\sqrt{w_1}+\sqrt{w_2}}{\sqrt{w_1}-\sqrt{w_2}}\right)^2`,
            formulaId: 'wave-imax-imin',
          },
        ],
      },
      {
        title: "Young's Double-Slit Experiment (YDSE)",
        items: [
          {
            label: 'Path Difference & Fringe Width',
            latex: String.raw`\Delta x = d\sin\theta \approx \frac{yd}{D};\qquad \beta = \frac{\lambda D}{d};\qquad \theta_0 = \frac{\beta}{D} = \frac{\lambda}{d}`,
            formulaId: 'wave-ydse',
          },
          {
            label: 'Bright & Dark Fringe Positions',
            latex: String.raw`y_{n,\text{bright}} = \frac{n\lambda D}{d}\ (\Delta x = n\lambda);\qquad y_{n,\text{dark}} = \left(n - \frac{1}{2}\right)\frac{\lambda D}{d}\ \left(\Delta x = \frac{(2n-1)\lambda}{2}\right)`,
            formulaId: 'wave-ydse',
          },
          {
            label: 'Optical Path Shift by Thin Sheet (t, n)',
            latex: String.raw`\Delta y = \frac{D}{d}(n - 1)t = \frac{\beta}{\lambda}(n - 1)t`,
            formulaId: 'wave-slab-shift',
          },
        ],
      },
      {
        title: 'Single-Slit Diffraction (Slit Width a)',
        items: [
          {
            label: 'Minima Condition & Central Maximum Width',
            latex: String.raw`a\sin\theta = n\lambda\ (n = 1, 2, 3,\dots);\qquad W_{\text{central}} = \frac{2\lambda D}{a},\quad \theta_{\text{central}} = \frac{2\lambda}{a}`,
            formulaId: 'wave-single-slit',
          },
        ],
      },
      {
        title: 'Polarization, Huygens & Resolving Power',
        items: [
          {
            label: "Malus's Law & Brewster's Law",
            latex: String.raw`I = I_0\cos^2\theta\ (\text{unpolarized } \to \tfrac{1}{2}I_0);\qquad n = \tan i_B\ (i_B + r = 90^\circ)`,
            formulaId: 'wave-polarization',
          },
          {
            label: "Huygens' Snell Relation & Rayleigh Resolution",
            latex: String.raw`\frac{\sin i}{\sin r} = \frac{v_1}{v_2} = \frac{\lambda_1}{\lambda_2} = \frac{n_2}{n_1};\qquad \theta_{\min} = \frac{1.22\lambda}{D},\quad \text{RP}_{\text{mic}} = \frac{2n\sin\theta}{\lambda}`,
            formulaId: 'wave-huygens-resolving',
          },
        ],
      },
    ],
    mustKnowGraphs: [
      {
        title: 'Intensity (I) vs Position (y) — YDSE vs Single-Slit Diffraction',
        summary: 'YDSE shows uniform peak heights (4I₀); Diffraction shows a wide, dominant central peak (width 2λD/a) with rapidly decaying side lobes (I₀/22, I₀/61).',
        graphId: 'g20-ydse-diffraction',
        formulaId: 'wave-single-slit',
      },
      {
        title: "Malus's Law cos²θ Transmitted Intensity",
        summary: 'Peaks at 0° and 180°, drops cleanly to 0 at 90° (crossed analyzer).',
        graphId: 'g20-ydse-diffraction',
        formulaId: 'wave-polarization',
      },
    ],
    jeeTraps: [
      {
        point: 'Condition mismatch: a sinθ = nλ gives DARK fringes (minima) in single-slit diffraction, whereas d sinθ = nλ gives BRIGHT fringes (maxima) in YDSE!',
        formulaId: 'wave-single-slit',
      },
      {
        point: 'Submerging YDSE in a liquid of refractive index n shrinks wavelength (λ′ = λ/n) and fringe width (β′ = β/n).',
        formulaId: 'wave-ydse',
      },
      {
        point: 'Placing a thin glass slab over one YDSE slit shifts the entire fringe pattern toward that slit by Δy without changing fringe width β.',
        formulaId: 'wave-slab-shift',
      },
      {
        point: 'Unpolarized light passing through the FIRST polarizer drops to I₀/2 regardless of orientation before applying Malus cos²θ.',
        formulaId: 'wave-polarization',
      },
    ],
  },
  {
    id: 'experimental-skills',
    number: 10,
    unitTag: 'Unit 20 · JEE Lab Skills',
    title: 'Unit 20: Class 12 Experimental Skills (Optics, Bridges, Meters & Diodes)',
    shortTitle: 'Unit 20 · Labs',
    subtitle: 'u–v & Bessel displacement method, travelling microscope, metre bridge end-correction, half-deflection & diode I–V lab',
    accentColor: '#f59e0b',
    labId: 'ray-optics',
    simTitle: 'Ray Optics & Semiconductor Lab Workbench',
    simDescription: 'Verify focal length conjugate positions, slab normal shift Δx = t(1 − 1/n), and forward/reverse Zener diode knee curves interactively.',
    comparisonTable: {
      title: 'Unit 20 Quick Lab Formula & Index / Parallax Error Sheet',
      headers: ['Experiment', 'Working Equation', 'Critical Error / Condition'],
      rows: [
        [
          'Concave Mirror / Convex Lens (u–v)',
          '1/v + 1/u = 1/f (mirror), 1/v − 1/u = 1/f (lens)',
          'Remove parallax tip-to-tip; apply index correction l_true = l_obs + e',
        ],
        [
          'Convex Mirror (via Convex Lens)',
          'R = distance (Mirror to real image I); f = R/2',
          'Rays strike convex mirror normally & retrace to object pin',
        ],
        [
          "Bessel's Lens Displacement Method",
          'f = (D² − d²)/(4D); O = √(I₁I₂)',
          'Requires fixed screen distance D ≥ 4f for real image',
        ],
        [
          'Travelling Microscope (Glass Slab)',
          'n = (R₃ − R₁) / (R₃ − R₂)',
          'R₁ bare mark, R₂ through slab, R₃ top powder; always rack one-way (avoid backlash)',
        ],
        [
          'Metre Bridge Resistance',
          'R/S = (l + e₁) / [(100 − l) + e₂]',
          'Ideal null near 50 cm minimizes % error in S',
        ],
        [
          'Galvanometer Half-Deflection',
          'G = RS/(R − S) ≈ S; k = ε/[(R + G)θ]',
          'Strictly requires series R ≫ S (and R ≫ G) so total I ≈ const',
        ],
        [
          'p–n Diode & Zener I–V Curve',
          'r_d = ΔV_F / ΔI_F; V_knee ≈ 0.7V (Si), 0.3V (Ge)',
          'Forward current in mA (Q1); Reverse / Zener breakdown in μA/mA (Q3) with R_s',
        ],
      ],
    },
    sections: [
      {
        title: '1. Optical Bench & Travelling Microscope Labs',
        items: [
          {
            label: 'u–v Focal Length & Index Correction',
            latex: String.raw`\text{Mirror: } f = \frac{|u||v|}{|u|+|v|};\qquad \text{Lens: } \frac{1}{|v|} + \frac{1}{|u|} = \frac{1}{f};\qquad l_{\text{true}} = l_{\text{obs}} + e_{\text{index}}`,
            formulaId: 'exp-uv-mirror-lens',
          },
          {
            label: "Bessel's Lens Displacement Method",
            latex: String.raw`f = \frac{D^2 - d^2}{4D};\qquad m_1 m_2 = 1 \implies O = \sqrt{I_1 I_2}\qquad (D \ge 4f)`,
            formulaId: 'exp-lens-displacement',
          },
          {
            label: 'Travelling Microscope Slab Refractive Index',
            latex: String.raw`n = \frac{\text{Real thickness}}{\text{Apparent thickness}} = \frac{R_3 - R_1}{R_3 - R_2}`,
            formulaId: 'exp-travelling-microscope',
          },
        ],
      },
      {
        title: '2. Electrical Bridge & Galvanometer Labs',
        items: [
          {
            label: 'Metre Bridge with End Corrections',
            latex: String.raw`\frac{R}{S} = \frac{l + e_1}{(100 - l) + e_2}\xrightarrow{\text{ideal}} S = R\frac{100 - l}{l};\qquad \rho = \frac{S\pi r^2}{L}`,
            formulaId: 'exp-metre-bridge-lab',
          },
          {
            label: 'Galvanometer Half-Deflection & Figure of Merit',
            latex: String.raw`G = \frac{R \cdot S}{R - S} \approx S\ (R \gg S);\qquad k = \frac{\varepsilon}{(R + G)\theta}`,
            formulaId: 'exp-galvanometer-half-deflection',
          },
        ],
      },
      {
        title: '3. Semiconductor p–n Junction & Zener Diode Lab',
        items: [
          {
            label: 'Dynamic Resistance, Knee Voltage & Zener Limit',
            latex: String.raw`r_d = \frac{\Delta V_F}{\Delta I_F};\qquad V_{\text{knee}} \approx 0.7\text{ V (Si)},\ 0.3\text{ V (Ge)};\qquad R_s = \frac{V_{\text{in}} - V_Z}{I_Z + I_L}`,
            formulaId: 'exp-diode-iv-lab',
          },
        ],
      },
    ],
    mustKnowGraphs: [
      {
        title: '1/v vs 1/u and u vs v Conjugate Hyperbola (Focal Length Graph)',
        summary: '1/v + 1/u = 1/f intersects axes at 1/f; on the |u| vs |v| rectangular hyperbola, intersection with line |u| = |v| occurs at (2f, 2f).',
        graphId: 'g19-prism-uv',
        formulaId: 'exp-uv-mirror-lens',
      },
      {
        title: 'p–n & Zener I–V Lab Characteristic (Q1 Forward mA & Q3 Reverse μA)',
        summary: 'Forward slope above knee (~0.7 V Si / 0.3 V Ge) yields 1/r_d; sharp reverse drop at −V_Z marks Zener breakdown.',
        formulaId: 'exp-diode-iv-lab',
      },
    ],
    jeeTraps: [
      {
        point: 'In Travelling Microscope, ALWAYS rack the microscope upwards in one direction to avoid backlash error; (R₃ − R₁) is real thickness and (R₃ − R₂) is apparent thickness.',
        formulaId: 'exp-travelling-microscope',
      },
      {
        point: 'In Half-Deflection Method, taking G ≈ S holds ONLY when series resistance R ≫ S; exact formula is G = RS/(R − S).',
        formulaId: 'exp-galvanometer-half-deflection',
      },
      {
        point: 'In Lens Displacement Method, screen separation MUST satisfy D > 4f to yield two sharp real images; O = √(I₁I₂) regardless of magnification ratio.',
        formulaId: 'exp-lens-displacement',
      },
      {
        point: 'Metre bridge null point near l = 50 cm minimizes percentage error in S; never slide the jockey while pressing down hard or wire cross-section becomes non-uniform.',
        formulaId: 'exp-metre-bridge-lab',
      },
    ],
  },
  {
    id: 'class11-mechanics',
    number: 11,
    unitTag: 'Class 11 · Mechanics',
    title: 'Class 11 Mechanics: Kinematics, NLOM & Work-Energy',
    shortTitle: 'C11 · Mechanics',
    subtitle: 'Projectile motion time of flight, range, banking of roads, friction, work-energy theorem & vertical circular motion',
    accentColor: '#38bdf8',
    labId: 'arc-wire',
    simTitle: 'Projectile & Mechanics Bench Simulator',
    simDescription: 'Test projectile angle optimization for max range, friction coefficients, and vertical circular motion string tension.',
    sections: [
      {
        title: 'Kinematics & Projectile Motion',
        items: [
          {
            label: 'Projectile Time, Height & Range',
            latex: String.raw`T = \frac{2u\sin\theta}{g};\qquad H = \frac{u^2\sin^2\theta}{2g};\qquad R = \frac{u^2\sin(2\theta)}{g}`,
            formulaId: 'c11-kinematics-projectile',
          },
          {
            label: 'Trajectory Equation',
            latex: String.raw`y = x\tan\theta - \frac{g}{2u^2\cos^2\theta}x^2`,
            formulaId: 'c11-kinematics-projectile',
          },
        ],
      },
      {
        title: "Newton's Laws & Friction",
        items: [
          {
            label: 'Static & Kinetic Friction',
            latex: String.raw`f_s \le \mu_s N,\quad f_k = \mu_k N`,
            formulaId: 'c11-nlom-friction',
          },
          {
            label: 'Banking of Roads (with Friction)',
            latex: String.raw`\tan\theta = \frac{v^2}{rg}\ (\text{no friction});\qquad v_{\max} = \sqrt{rg\left(\frac{\mu_s + \tan\theta}{1 - \mu_s\tan\theta}\right)}`,
            formulaId: 'c11-nlom-friction',
          },
        ],
      },
      {
        title: 'Work, Energy & Vertical Circular Motion',
        items: [
          {
            label: 'Work-Energy Theorem',
            latex: String.raw`W_{\text{net}} = \Delta K = K_f - K_i`,
            formulaId: 'c11-work-energy',
          },
          {
            label: 'Vertical Circular Loop Tension & Min Speed',
            latex: String.raw`T_{\text{bottom}} - T_{\text{top}} = 6mg;\qquad v_{\text{top}} = \sqrt{rg},\quad T_{\text{bottom}} \ge 6mg`,
            formulaId: 'c11-work-energy',
          },
        ],
      },
    ],
    mustKnowGraphs: [
      {
        title: 'Projectile Trajectory (y vs x) Parabola',
        summary: 'Symmetric parabolic arc reaching maximum height H at midpoint R/2; max range at θ = 45°.',
        formulaId: 'c11-kinematics-projectile',
      },
    ],
    jeeTraps: [
      {
        point: 'Complementary angles of projection (θ and 90° − θ) give identical horizontal ranges R with different maximum heights H.',
        formulaId: 'c11-kinematics-projectile',
      },
      {
        point: 'Minimum top speed for a string loop in vertical circle is √gR (giving T_top = 0), whereas for a rigid rod it can be zero.',
        formulaId: 'c11-work-energy',
      },
    ],
  },
  {
    id: 'class11-rotational',
    number: 12,
    unitTag: 'Class 11 · Rotation',
    title: 'Class 12 Rotational Dynamics & Rolling Motion',
    shortTitle: 'C11 · Rotation',
    subtitle: 'Moment of inertia parallel/perpendicular axes theorems, angular momentum & pure rolling acceleration',
    accentColor: '#818cf8',
    labId: 'arc-wire',
    simTitle: 'Rotational Inertia & Incline Rolling Lab',
    simDescription: 'Explore moment of inertia scaling for rings, discs, and spheres during pure rolling down inclined planes.',
    sections: [
      {
        title: 'Moment of Inertia & Axes Theorems',
        items: [
          {
            label: 'Parallel & Perpendicular Axes Theorems',
            latex: String.raw`I = I_{\text{cm}} + Md^2\ (\text{Parallel});\qquad I_z = I_x + I_y\ (\text{Perpendicular lamina})`,
            formulaId: 'c11-rotational-dynamics',
          },
          {
            label: 'Angular Momentum & Torque',
            latex: String.raw`L = I\omega = mvr;\qquad \tau = \frac{dL}{dt} = I\alpha`,
            formulaId: 'c11-rotational-dynamics',
          },
        ],
      },
      {
        title: 'Rolling Motion on Inclines',
        items: [
          {
            label: 'Pure Rolling Acceleration',
            latex: String.raw`a_{\text{rolling}} = \frac{g\sin\theta}{1 + I/(mR^2)}`,
            formulaId: 'c11-rotational-dynamics',
          },
        ],
      },
    ],
    mustKnowGraphs: [
      {
        title: 'Rolling Down Incline Acceleration Comparison',
        summary: 'Solid sphere accelerates fastest (smallest I/(mR²) = 2/5), followed by disc/cylinder (1/2), then ring/hollow cylinder (1).',
        formulaId: 'c11-rotational-dynamics',
      },
    ],
    jeeTraps: [
      {
        point: 'Perpendicular axes theorem I_z = I_x + I_y applies strictly to 2D planar laminas, never to 3D solid bodies like spheres or cylinders.',
        formulaId: 'c11-rotational-dynamics',
      },
    ],
  },
  {
    id: 'class11-gravitation',
    number: 13,
    unitTag: 'Class 11 · Gravitation',
    title: 'Class 11 Gravitation & Kepler’s Laws',
    shortTitle: 'C11 · Gravitation',
    subtitle: 'Newton gravitation force, escape velocity v_esc = √(2gR), orbital speed & Kepler third law',
    accentColor: '#c084fc',
    labId: 'arc-wire',
    simTitle: 'Orbital Mechanics & Escape Velocity Simulator',
    simDescription: 'Simulate satellite orbits, escape velocity thresholds, and Kepler elliptical orbit sweeping areas.',
    sections: [
      {
        title: 'Gravitation & Orbital Mechanics',
        items: [
          {
            label: "Newton's Law & Field",
            latex: String.raw`F = \frac{G m_1 m_2}{r^2};\qquad g = \frac{GM}{R^2}`,
            formulaId: 'c11-gravitation',
          },
          {
            label: 'Escape Velocity & Orbital Speed',
            latex: String.raw`v_{\text{escape}} = \sqrt{\frac{2GM}{R}} = \sqrt{2gR} \approx 11.2\text{ km/s};\qquad v_{\text{orbit}} = \sqrt{\frac{GM}{R}}`,
            formulaId: 'c11-gravitation',
          },
          {
            label: 'Kepler’s Third Law',
            latex: String.raw`T^2 = \left(\frac{4\pi^2}{GM}\right)a^3`,
            formulaId: 'c11-gravitation',
          },
        ],
      },
    ],
    mustKnowGraphs: [
      {
        title: 'Gravitational Potential V(r) and Field E(r) inside/outside Earth',
        summary: 'Potential V is minimum (most negative) at Earth center (−3GM/2R); Field E peaks at surface (r = R).',
        formulaId: 'c11-gravitation',
      },
    ],
    jeeTraps: [
      {
        point: 'Escape velocity is independent of projectile mass m and launch angle; total mechanical energy of a bound satellite is negative (E = −GMm/2r).',
        formulaId: 'c11-gravitation',
      },
    ],
  },
  {
    id: 'class11-properties',
    number: 14,
    unitTag: 'Class 11 · Properties of Matter',
    title: "Class 11 Properties of Matter (Solids, Fluids & Surface Tension)",
    shortTitle: 'C11 · Fluids',
    subtitle: "Young's modulus, surface tension excess pressure 2T/R, Stokes' law, terminal velocity & Bernoulli theorem",
    accentColor: '#2dd4bf',
    labId: 'arc-wire',
    simTitle: 'Fluid Dynamics & Surface Tension Lab',
    simDescription: 'Inspect capillary rise, excess bubble pressure, terminal velocity in viscous liquids, and Bernoulli venturi flow.',
    sections: [
      {
        title: 'Elasticity & Viscosity',
        items: [
          {
            label: "Young's Modulus & Elastic Energy",
            latex: String.raw`Y = \frac{FL}{A\Delta L};\qquad U_{\text{density}} = \frac{1}{2}\times\text{stress}\times\text{strain}`,
            formulaId: 'c11-properties-solids-fluids',
          },
          {
            label: "Stokes' Law & Terminal Velocity",
            latex: String.raw`F_v = 6\pi\eta r v;\qquad v_{\text{terminal}} = \frac{2r^2(\rho - \sigma)g}{9\eta}`,
            formulaId: 'c11-properties-solids-fluids',
          },
        ],
      },
      {
        title: 'Surface Tension & Fluid Dynamics',
        items: [
          {
            label: 'Excess Pressure & Capillary Rise',
            latex: String.raw`P_{\text{excess}} = \frac{2T}{R}\ (\text{drop}),\ \frac{4T}{R}\ (\text{bubble});\qquad h = \frac{2T\cos\theta}{r\rho g}`,
            formulaId: 'c11-properties-solids-fluids',
          },
          {
            label: "Bernoulli's Theorem & Torricelli Law",
            latex: String.raw`P + \frac{1}{2}\rho v^2 + \rho gh = \text{const};\qquad v_{\text{efflux}} = \sqrt{2gh}`,
            formulaId: 'c11-properties-solids-fluids',
          },
        ],
      },
    ],
    mustKnowGraphs: [
      {
        title: 'Stress vs Strain Curve for Ductile Material',
        summary: 'Proportional limit, elastic limit, yield point, ultimate tensile strength, and fracture point.',
        formulaId: 'c11-properties-solids-fluids',
      },
    ],
    jeeTraps: [
      {
        point: 'A soap bubble has TWO free surfaces (inner and outer), hence excess pressure is 4T/R, whereas a liquid drop has only ONE surface (2T/R).',
        formulaId: 'c11-properties-solids-fluids',
      },
    ],
  },
  {
    id: 'class11-thermodynamics',
    number: 15,
    unitTag: 'Class 11 · Thermodynamics & KTG',
    title: 'Class 11 Thermodynamics & Kinetic Theory of Gases',
    shortTitle: 'C11 · Thermo/KTG',
    subtitle: 'First law of thermodynamics, Carnot engine efficiency η = 1 − T₂/T₁, gas RMS speed & degrees of freedom',
    accentColor: '#fbbf24',
    labId: 'arc-wire',
    simTitle: 'Thermodynamic Cycles & KTG Molecular Speed Sandbox',
    simDescription: 'Visualize PV cycles, Carnot heat engine work output, and Maxwell-Boltzmann gas molecular speed distributions.',
    sections: [
      {
        title: 'Thermodynamics & Carnot Cycle',
        items: [
          {
            label: 'First Law of Thermodynamics',
            latex: String.raw`\Delta Q = \Delta U + W`,
            formulaId: 'c11-thermodynamics-ktg',
          },
          {
            label: 'Carnot Engine Efficiency',
            latex: String.raw`\eta = 1 - \frac{T_2}{T_1}\ (T_1, T_2\text{ in Kelvin})`,
            formulaId: 'c11-thermodynamics-ktg',
          },
        ],
      },
      {
        title: 'Kinetic Theory of Gases (KTG)',
        items: [
          {
            label: 'RMS Speed & Internal Energy',
            latex: String.raw`v_{\text{rms}} = \sqrt{\frac{3RT}{M}} = \sqrt{\frac{3kT}{m}};\qquad U = \frac{f}{2}nRT`,
            formulaId: 'c11-thermodynamics-ktg',
          },
        ],
      },
    ],
    mustKnowGraphs: [
      {
        title: 'PV Isotherms vs Adiabatic Curves',
        summary: 'Adiabatic curves are steeper than isotherms by factor γ (slope_ad = −γ P/V vs slope_iso = −P/V).',
        formulaId: 'c11-thermodynamics-ktg',
      },
    ],
    jeeTraps: [
      {
        point: 'Temperatures T₁ and T₂ in Carnot efficiency formula MUST be absolute temperatures in Kelvin, never Celsius.',
        formulaId: 'c11-thermodynamics-ktg',
      },
    ],
  },
  {
    id: 'class11-waves-shm',
    number: 16,
    unitTag: 'Class 11 · SHM & Waves',
    title: 'Class 11 Oscillations (SHM) & Waves',
    shortTitle: 'C11 · SHM & Waves',
    subtitle: 'SHM acceleration law a = −ω²x, simple pendulum, transverse wave equation & standing waves in organ pipes',
    accentColor: '#fb7185',
    labId: 'wave-optics',
    simTitle: 'SHM & Standing Waves Simulator',
    simDescription: 'Inspect phase oscillation, pendulum period scaling with length L, and harmonic standing wave nodes/antinodes in pipes.',
    sections: [
      {
        title: 'Oscillations & SHM',
        items: [
          {
            label: 'SHM Kinematics & Equation',
            latex: String.raw`x(t) = A\sin(\omega t + \phi);\qquad a = -\omega^2 x`,
            formulaId: 'c11-shm-waves',
          },
          {
            label: 'Pendulum & Spring Periods',
            latex: String.raw`T_{\text{pend}} = 2\pi\sqrt{\frac{L}{g}};\qquad T_{\text{spring}} = 2\pi\sqrt{\frac{m}{k}}`,
            formulaId: 'c11-shm-waves',
          },
        ],
      },
      {
        title: 'Wave Motion & Sound',
        items: [
          {
            label: 'Travelling Wave & Pipe Harmonics',
            latex: String.raw`y(x,t) = A\sin(kx - \omega t);\quad \nu_{\text{open}} = \frac{nv}{2L},\quad \nu_{\text{closed}} = \frac{(2n-1)v}{4L}`,
            formulaId: 'c11-shm-waves',
          },
        ],
      },
    ],
    mustKnowGraphs: [
      {
        title: 'SHM Displacement, Velocity & Acceleration Phase Shift',
        summary: 'Velocity leads displacement by π/2; acceleration leads displacement by π (opposite phase).',
        formulaId: 'c11-shm-waves',
      },
    ],
    jeeTraps: [
      {
        point: 'A closed organ pipe produces ONLY odd harmonics ((2n−1)v/4L), whereas an open organ pipe produces ALL harmonics (nv/2L).',
        formulaId: 'c11-shm-waves',
      },
    ],
  },
];
