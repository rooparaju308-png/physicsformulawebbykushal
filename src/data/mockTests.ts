export interface TestQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
  chapter: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

export interface TestPaper {
  id: string;
  title: string;
  subtitle: string;
  durationMinutes: number;
  totalQuestions: number;
  questions: TestQuestion[];
}

export const JEE_TEST_PAPERS: TestPaper[] = [
  {
      id: 'full-mock-1',
      title: 'JEE Main Full Syllabus Mock Test 1',
      subtitle: 'Complete NTA pattern: 25 High-Yield Physics Questions',
      durationMinutes: 60,
      totalQuestions: 25,
      questions: [
        {
          id: 'm1-q1',
          question: 'A particle moves in a circle of radius R with a constant speed v. What is the magnitude of average acceleration during a time interval equal to half of the revolution?',
          options: ['v² / (πR)', '2v² / (πR)', 'v² / (2R)', 'Zero'],
          correctAnswerIndex: 1,
          explanation: 'Average acceleration = |Δv| / Δt. Initial velocity v along +j, final velocity v along -j after half revolution. Magnitude of change in velocity Δv = 2v. Time Δt = πR / v. Thus |a_avg| = 2v / (πR / v) = 2v² / (πR).',
          chapter: 'Mechanics',
          difficulty: 'Medium',
        },
        {
          id: 'm1-q2',
          question: 'The electric potential at any point (x, y, z) in meters is given by V = 3x² + 5y. The magnitude of electric field at point (1, 2, 0) m is:',
          options: ['6 N/C', '10 N/C', '√61 N/C', '34 N/C'],
          correctAnswerIndex: 2,
          explanation: 'E_x = -∂V/∂x = -6x. E_y = -∂V/∂y = -5. E_z = 0. At (1, 2, 0), E_x = -6, E_y = -5. Magnitude E = √((-6)² + (-5)²) = √(36 + 25) = √61 N/C.',
          chapter: 'Electrostatics',
          difficulty: 'Easy',
        },
        {
          id: 'm1-q3',
          question: 'In Young double slit experiment, if the monochromatic light is replaced by white light, what will be observed on the screen?',
          options: [
            'Uniform white illumination across screen',
            'Continuous spectrum with a white central fringe',
            'Alternating dark and bright bands of pure white',
            'No interference pattern observed'
          ],
          correctAnswerIndex: 1,
          explanation: 'White light contains all wavelengths (700nm to 400nm). At central maximum (path difference = 0), all wavelengths interfere constructively giving a white fringe. Other fringes are colored and overlap to form a continuous spectrum.',
          chapter: 'Wave Optics',
          difficulty: 'Medium',
        },
        {
          id: 'm1-q4',
          question: 'The work function of a metal is 2.0 eV. Light of wavelength 300 nm is incident on it. What is the maximum kinetic energy of emitted photoelectrons?',
          options: ['2.13 eV', '4.13 eV', '0.13 eV', '1.20 eV'],
          correctAnswerIndex: 0,
          explanation: 'Energy of incident photon E = hc / λ = (1240 eV·nm) / 300 nm ≈ 4.13 eV. Max K.E. = E - W = 4.13 eV - 2.0 eV = 2.13 eV.',
          chapter: 'Modern Physics',
          difficulty: 'Easy',
        },
        {
          id: 'm1-q5',
          question: 'A capacitor of capacitance C is charged to potential V and then connected across an uncharged capacitor of capacitance 2C. The common potential is:',
          options: ['V', 'V / 2', 'V / 3', '2V / 3'],
          correctAnswerIndex: 2,
          explanation: 'Total charge Q = CV + 0 = CV. Total capacitance C_eq = C + 2C = 3C. Common potential V_c = Q / C_eq = CV / (3C) = V / 3.',
          chapter: 'Current Electricity',
          difficulty: 'Easy',
        },
        {
          id: 'm1-q6',
          question: 'An RLC series circuit has R = 10 Ω, L = 0.1 H, and C = 10 μF connected across a 200V, 50Hz AC source. What is the impedance of the circuit?',
          options: ['10 Ω', '318.3 Ω', '318.5 Ω', '100 Ω'],
          correctAnswerIndex: 1,
          explanation: 'ω = 2πf = 100π ≈ 314 rad/s. X_L = ωL = 31.4 Ω. X_C = 1 / (ωC) = 1 / (314 × 10⁻⁵) ≈ 318.47 Ω. Z = √(R² + (X_C - X_L)²) ≈ √((10)² + (287)²) ≈ 318.3 Ω.',
          chapter: 'AC Circuits',
          difficulty: 'Hard',
        },
        {
          id: 'm1-q7',
          question: 'A thermodynamic system undergoes cyclic process ABCA. Work done by the system along path AB is 50 J, along BC is 20 J, and along CA is -30 J. What is the net heat absorbed in the cycle?',
          options: ['40 J', '100 J', '0 J', '-40 J'],
          correctAnswerIndex: 0,
          explanation: 'For a cyclic process, net change in internal energy ΔU = 0. Therefore, Net Heat Q_net = Net Work W_net = W_AB + W_BC + W_CA = 50 + 20 - 30 = 40 J.',
          chapter: 'Thermodynamics',
          difficulty: 'Easy',
        },
        {
          id: 'm1-q8',
          question: 'A transparent medium of refractive index n is surrounded by air. A ray of light enters at angle of incidence i and gets totally internally reflected at the opposite face. What is the minimum refractive index required?',
          options: ['√2', '1.5', '2', '√3'],
          correctAnswerIndex: 0,
          explanation: 'For total internal reflection to occur at any angle of incidence, n must be at least √2 (critical angle considerations for equilateral or right prisms).',
          chapter: 'Ray Optics',
          difficulty: 'Medium',
        },
        {
          id: 'm1-q9',
          question: 'The half-life of a radioactive substance is 4 days. What fraction of the initial radioactive nuclei will remain undecayed after 12 days?',
          options: ['1 / 2', '1 / 4', '1 / 8', '1 / 16'],
          correctAnswerIndex: 2,
          explanation: 'Number of half-lives n = t / T_1/2 = 12 / 4 = 3. Remaining fraction N/N_0 = (1/2)ⁿ = (1/2)³ = 1/8.',
          chapter: 'Modern Physics',
          difficulty: 'Easy',
        },
        {
          id: 'm1-q10',
          question: 'A uniform rod of mass M and length L is pivoted at one end and allowed to oscillate in vertical plane. What is its time period of small oscillations?',
          options: ['2π√(L/g)', '2π√(2L / (3g))', '2π√(L / (2g))', '2π√(3L / g)'],
          correctAnswerIndex: 1,
          explanation: 'Moment of inertia about pivot I = ML² / 3. Distance of center of mass from pivot d = L / 2. Time period T = 2π√(I / (M g d)) = 2π√((ML² / 3) / (M g L / 2)) = 2π√(2L / (3g)).',
          chapter: 'Mechanics',
          difficulty: 'Medium',
        }
      ]
  },
  {
      id: 'electro-optics-test',
      title: 'Sectional Test: Electromagnetism & Optics',
      subtitle: 'Targeted high-weightage practice for JEE Main',
      durationMinutes: 45,
      totalQuestions: 15,
      questions: [
        {
          id: 'eo-q1',
          question: 'A long straight wire carries current I and produces magnetic field B at distance r. If current is doubled and distance is halved, the new magnetic field is:',
          options: ['B', '2B', '4B', 'B / 2'],
          correctAnswerIndex: 2,
          explanation: 'B = μ₀ I / (2π r). B_new = μ₀ (2I) / (2π (r/2)) = 4 × (μ₀ I / (2π r)) = 4B.',
          chapter: 'Magnetism',
          difficulty: 'Easy',
        },
        {
          id: 'eo-q2',
          question: 'A thin convex lens of focal length 20 cm is immersed in water (refractive index 4/3). If refractive index of lens material is 3/2, its new focal length in water is:',
          options: ['20 cm', '60 cm', '80 cm', '100 cm'],
          correctAnswerIndex: 2,
          explanation: 'Lens maker formula: 1/f = (n_lens/n_medium - 1)(1/R₁ - 1/R₂). In air: 1/20 = (1.5 - 1)K = 0.5K => K = 1/10. In water: 1/f_w = (1.5 / (4/3) - 1)K = (9/8 - 1)(1/10) = (1/8)(1/10) = 1/80. Thus f_w = 80 cm.',
          chapter: 'Ray Optics',
          difficulty: 'Hard',
        }
      ]
  }
];
