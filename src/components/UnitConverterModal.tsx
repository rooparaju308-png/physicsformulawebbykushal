import React, { useState } from 'react';
import { Calculator, Check, Copy, Hash, Scale, Search, X } from 'lucide-react';

interface UnitConverterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ConstantItem {
  name: string;
  symbol: string;
  value: string;
  unit: string;
  category: 'Universal' | 'Atomic & Nuclear' | 'Electromagnetic' | 'Thermodynamic';
  notes?: string;
}

const FUNDAMENTAL_CONSTANTS: ConstantItem[] = [
  { name: 'Speed of Light in Vacuum', symbol: 'c', value: '3.00 × 10⁸ (exact: 2.9979 × 10⁸)', unit: 'm/s', category: 'Universal', notes: 'Upper speed limit in special relativity' },
  { name: "Planck's Constant", symbol: 'h', value: '6.626 × 10⁻³⁴', unit: 'J·s (or 4.14 × 10⁻¹⁵ eV·s)', category: 'Universal', notes: 'Relates photon energy to frequency (E = hν)' },
  { name: 'Reduced Planck Constant', symbol: 'ℏ', value: '1.054 × 10⁻³⁴', unit: 'J·s', category: 'Universal', notes: 'ħ = h / 2π' },
  { name: 'Gravitational Constant', symbol: 'G', value: '6.674 × 10⁻¹¹', unit: 'N·m²/kg²', category: 'Universal', notes: 'Used in Newton law of gravitation & orbital mechanics' },
  { name: 'Permittivity of Free Space', symbol: 'ε₀', value: '8.854 × 10⁻¹²', unit: 'C²/(N·m²)', category: 'Electromagnetic', notes: 'Dielectric constant in vacuum' },
  { name: 'Permeability of Free Space', symbol: 'μ₀', value: '4π × 10⁻⁷ (= 1.257 × 10⁻⁶)', unit: 'T·m/A', category: 'Electromagnetic', notes: 'Magnetic constant in vacuum' },
  { name: 'Coulomb Law Constant', symbol: '1/(4πε₀)', value: '8.99 × 10⁹', unit: 'N·m²/C²', category: 'Electromagnetic', notes: 'Electrostatic force constant' },
  { name: 'Elementary Charge', symbol: 'e', value: '1.602 × 10⁻¹⁹', unit: 'C', category: 'Atomic & Nuclear', notes: 'Charge of proton / electron' },
  { name: 'Electron Rest Mass', symbol: 'mₑ', value: '9.109 × 10⁻³¹ (0.511 MeV/c²)', unit: 'kg', category: 'Atomic & Nuclear', notes: 'Rest mass of electron' },
  { name: 'Proton Rest Mass', symbol: 'mₚ', value: '1.673 × 10⁻²⁷ (938.3 MeV/c²)', unit: 'kg', category: 'Atomic & Nuclear', notes: 'Mass of nucleus proton' },
  { name: 'Neutron Rest Mass', symbol: 'mₙ', value: '1.675 × 10⁻²⁷ (939.6 MeV/c²)', unit: 'kg', category: 'Atomic & Nuclear', notes: 'Mass of neutron' },
  { name: 'Atomic Mass Unit (amu / u)', symbol: '1 u', value: '1.661 × 10⁻²⁷ (= 931.5)', unit: 'kg (or MeV)', category: 'Atomic & Nuclear', notes: '1/12th mass of Carbon-12 atom' },
  { name: 'Boltzmann Constant', symbol: 'k_B', value: '1.381 × 10⁻²³', unit: 'J/K (8.617 × 10⁻⁵ eV/K)', category: 'Thermodynamic', notes: 'Relates microscopic energy to temperature' },
  { name: 'Universal Gas Constant', symbol: 'R', value: '8.314', unit: 'J/(mol·K)', category: 'Thermodynamic', notes: 'PV = nRT ideal gas constant' },
  { name: 'Avogadro Number', symbol: 'N_A', value: '6.022 × 10²³', unit: 'mol⁻¹', category: 'Thermodynamic', notes: 'Particles per mole' },
  { name: 'Stefan-Boltzmann Constant', symbol: 'σ', value: '5.67 × 10⁻⁸', unit: 'W/(m²·K⁴)', category: 'Thermodynamic', notes: 'Blackbody radiation emission' },
  { name: "Wien's Displacement Constant", symbol: 'b', value: '2.898 × 10⁻³', unit: 'm·K', category: 'Thermodynamic', notes: 'λ_max · T = b' },
  { name: 'Rydberg Constant', symbol: 'R_∞', value: '1.097 × 10⁷', unit: 'm⁻¹', category: 'Atomic & Nuclear', notes: 'Hydrogen spectral lines wavelength' },
  { name: 'Bohr Magneton', symbol: 'μ_B', value: '9.274 × 10⁻²⁴', unit: 'J/T', category: 'Atomic & Nuclear', notes: 'Magnetic moment of electron' },
  { name: 'Faraday Constant', symbol: 'F', value: '96485 (approx 96500)', unit: 'C/mol', category: 'Electromagnetic', notes: 'Charge per mole of electrons' },
];

interface ConversionCategory {
  id: string;
  name: string;
  units: { name: string; symbol: string; toBaseMultiplier: number; offset?: number }[];
}

const CONVERSION_CATEGORIES: ConversionCategory[] = [
  {
    id: 'energy',
    name: 'Energy & Work',
    units: [
      { name: 'Joule (J - Base)', symbol: 'J', toBaseMultiplier: 1 },
      { name: 'Electron-volt (eV)', symbol: 'eV', toBaseMultiplier: 1.602176634e-19 },
      { name: 'Mega Electron-volt (MeV)', symbol: 'MeV', toBaseMultiplier: 1.602176634e-13 },
      { name: 'Calorie (cal)', symbol: 'cal', toBaseMultiplier: 4.184 },
      { name: 'Kilowatt-hour (kWh)', symbol: 'kWh', toBaseMultiplier: 3.6e6 },
      { name: 'Erg (erg)', symbol: 'erg', toBaseMultiplier: 1e-7 },
    ],
  },
  {
    id: 'pressure',
    name: 'Pressure',
    units: [
      { name: 'Pascal (Pa - Base)', symbol: 'Pa', toBaseMultiplier: 1 },
      { name: 'Atmosphere (atm)', symbol: 'atm', toBaseMultiplier: 101325 },
      { name: 'Torr / mmHg', symbol: 'Torr', toBaseMultiplier: 133.322368 },
      { name: 'Bar', symbol: 'bar', toBaseMultiplier: 1e5 },
    ],
  },
  {
    id: 'magnetic',
    name: 'Magnetic Field',
    units: [
      { name: 'Tesla (T - Base)', symbol: 'T', toBaseMultiplier: 1 },
      { name: 'Gauss (G)', symbol: 'G', toBaseMultiplier: 1e-4 },
      { name: 'Gamma (γ)', symbol: 'γ', toBaseMultiplier: 1e-9 },
    ],
  },
  {
    id: 'length',
    name: 'Distance & Wavelength',
    units: [
      { name: 'Meter (m - Base)', symbol: 'm', toBaseMultiplier: 1 },
      { name: 'Angstrom (Å)', symbol: 'Å', toBaseMultiplier: 1e-10 },
      { name: 'Fermi / Femtometer (fm)', symbol: 'fm', toBaseMultiplier: 1e-15 },
      { name: 'Nanometer (nm)', symbol: 'nm', toBaseMultiplier: 1e-9 },
      { name: 'Micron (μm)', symbol: 'μm', toBaseMultiplier: 1e-6 },
      { name: 'Astronomical Unit (AU)', symbol: 'AU', toBaseMultiplier: 1.495978707e11 },
      { name: 'Light Year (ly)', symbol: 'ly', toBaseMultiplier: 9.46073e15 },
      { name: 'Parsec (pc)', symbol: 'pc', toBaseMultiplier: 3.0857e16 },
    ],
  },
  {
    id: 'temperature',
    name: 'Temperature',
    units: [
      { name: 'Kelvin (K - Base)', symbol: 'K', toBaseMultiplier: 1, offset: 0 },
      { name: 'Celsius (°C)', symbol: '°C', toBaseMultiplier: 1, offset: 273.15 },
      { name: 'Fahrenheit (°F)', symbol: '°F', toBaseMultiplier: 5 / 9, offset: 459.67 }, // Special handled in converter
    ],
  },
];

export const UnitConverterModal: React.FC<UnitConverterModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'converter' | 'constants'>('converter');
  const [selectedCatId, setSelectedCatId] = useState<string>('energy');
  const [fromUnitIndex, setFromUnitIndex] = useState<number>(0);
  const [toUnitIndex, setToUnitIndex] = useState<number>(1);
  const [inputValue, setInputValue] = useState<string>('1');
  const [constantsSearch, setConstantsSearch] = useState<string>('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentCategory = CONVERSION_CATEGORIES.find((c) => c.id === selectedCatId) || CONVERSION_CATEGORIES[0];
  const fromUnit = currentCategory.units[fromUnitIndex] || currentCategory.units[0];
  const toUnit = currentCategory.units[toUnitIndex] || currentCategory.units[1];

  // Calculate conversion
  let convertedResult = 0;
  const numVal = parseFloat(inputValue);
  if (!isNaN(numVal)) {
    if (selectedCatId === 'temperature') {
      // Special temperature logic
      let valInKelvin = numVal;
      if (fromUnit.symbol === '°C') valInKelvin = numVal + 273.15;
      else if (fromUnit.symbol === '°F') valInKelvin = (numVal - 32) * (5 / 9) + 273.15;

      if (toUnit.symbol === 'K') convertedResult = valInKelvin;
      else if (toUnit.symbol === '°C') convertedResult = valInKelvin - 273.15;
      else if (toUnit.symbol === '°F') convertedResult = (valInKelvin - 273.15) * (9 / 5) + 32;
    } else {
      const baseValue = numVal * fromUnit.toBaseMultiplier;
      convertedResult = baseValue / toUnit.toBaseMultiplier;
    }
  }

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  const filteredConstants = FUNDAMENTAL_CONSTANTS.filter(
    (c) =>
      c.name.toLowerCase().includes(constantsSearch.toLowerCase()) ||
      c.symbol.toLowerCase().includes(constantsSearch.toLowerCase()) ||
      c.category.toLowerCase().includes(constantsSearch.toLowerCase()) ||
      c.unit.toLowerCase().includes(constantsSearch.toLowerCase())
  );

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6"
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl max-h-[90dvh] rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-600 dark:text-cyan-300">
              <Scale className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
                Physics Unit Converter & Constants
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Essential JEE conversion factors and fundamental physical constants reference.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-slate-500 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center border-b border-slate-200 dark:border-slate-800 px-5 pt-2 gap-2 bg-slate-50/50 dark:bg-slate-900/50">
          <button
            type="button"
            onClick={() => setActiveTab('converter')}
            className={`min-h-[44px] px-4 text-xs sm:text-sm font-semibold border-b-2 transition-colors inline-flex items-center gap-2 ${
              activeTab === 'converter'
                ? 'border-cyan-500 text-cyan-600 dark:text-cyan-300'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            <Calculator className="h-4 w-4" />
            <span>Unit Converter</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('constants')}
            className={`min-h-[44px] px-4 text-xs sm:text-sm font-semibold border-b-2 transition-colors inline-flex items-center gap-2 ${
              activeTab === 'constants'
                ? 'border-cyan-500 text-cyan-600 dark:text-cyan-300'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            <Hash className="h-4 w-4" />
            <span>Fundamental Constants ({FUNDAMENTAL_CONSTANTS.length})</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {activeTab === 'converter' ? (
            <div className="space-y-5">
              {/* Category selector */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {CONVERSION_CATEGORIES.map((cat) => {
                  const active = selectedCatId === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => {
                        setSelectedCatId(cat.id);
                        setFromUnitIndex(0);
                        setToUnitIndex(cat.units.length > 1 ? 1 : 0);
                      }}
                      className={`min-h-[40px] px-3.5 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 transition-colors ${
                        active
                          ? 'bg-cyan-500 text-slate-950 font-bold'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      {cat.name}
                    </button>
                  );
                })}
              </div>

              {/* Converter Box */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 p-4 sm:p-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* From */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">From Unit</label>
                    <select
                      value={fromUnitIndex}
                      onChange={(e) => setFromUnitIndex(Number(e.target.value))}
                      className="w-full min-h-[44px] px-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-cyan-400"
                    >
                      {currentCategory.units.map((u, i) => (
                        <option key={u.symbol} value={i}>
                          {u.name} ({u.symbol})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* To */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">To Unit</label>
                    <select
                      value={toUnitIndex}
                      onChange={(e) => setToUnitIndex(Number(e.target.value))}
                      className="w-full min-h-[44px] px-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-cyan-400"
                    >
                      {currentCategory.units.map((u, i) => (
                        <option key={u.symbol} value={i}>
                          {u.name} ({u.symbol})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  {/* Input value */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Value in {fromUnit.symbol}</label>
                    <input
                      type="number"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      className="w-full min-h-[48px] px-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-base font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-cyan-400"
                      placeholder="Enter value..."
                    />
                  </div>

                  {/* Output value */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-cyan-600 dark:text-cyan-400">Converted Result</label>
                      <button
                        type="button"
                        onClick={() => handleCopy(`${convertedResult} ${toUnit.symbol}`, 'conversion')}
                        className="text-xs font-medium text-slate-500 hover:text-cyan-500 inline-flex items-center gap-1"
                      >
                        {copiedKey === 'conversion' ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                        <span>{copiedKey === 'conversion' ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                    <div className="w-full min-h-[48px] px-4 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-between text-base font-bold text-cyan-700 dark:text-cyan-200">
                      <span className="truncate">{isNaN(convertedResult) ? 'Invalid input' : convertedResult.toPrecision(6)}</span>
                      <span className="text-xs font-mono ml-2 uppercase text-cyan-600 dark:text-cyan-300">{toUnit.symbol}</span>
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2">
                  <span className="font-bold shrink-0">JEE Tip:</span>
                  <span>
                    Always verify powers of 10 during numerical calculation. E.g., 1 eV = 1.6 × 10⁻¹⁹ J and 1 atm = 1.013 × 10⁵ Pa.
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Search constants */}
              <div className="relative">
                <Search className="h-4 w-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={constantsSearch}
                  onChange={(e) => setConstantsSearch(e.target.value)}
                  placeholder="Search constants by name, symbol, or unit (e.g. Planck, c, eV, permittivity)..."
                  className="w-full min-h-[44px] pl-10 pr-4 rounded-xl bg-slate-100 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-cyan-400"
                />
              </div>

              {/* Constants table / cards */}
              <div className="space-y-2.5 max-h-[50dvh] overflow-y-auto pr-1">
                {filteredConstants.map((c) => {
                  const copyKey = `const-${c.symbol}`;
                  return (
                    <div
                      key={c.name}
                      className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/70 p-3.5 flex items-center justify-between gap-3 hover:border-cyan-400/50 transition-colors"
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-cyan-500/15 text-cyan-600 dark:text-cyan-300 border border-cyan-500/30">
                            {c.symbol}
                          </span>
                          <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">{c.name}</h4>
                          <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                            {c.category}
                          </span>
                        </div>
                        {c.notes && <p className="text-xs text-slate-500 dark:text-slate-400">{c.notes}</p>}
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <div className="text-right">
                          <div className="text-xs font-mono font-bold text-cyan-700 dark:text-cyan-200 tabular-nums">
                            {c.value}
                          </div>
                          <div className="text-[11px] font-medium text-slate-400">{c.unit}</div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopy(`${c.value} ${c.unit}`, copyKey)}
                          aria-label={`Copy ${c.name} value`}
                          className="min-h-[36px] min-w-[36px] flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-900 text-slate-500 hover:text-cyan-500 transition-colors"
                        >
                          {copiedKey === copyKey ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex items-center justify-between">
          <span className="text-xs text-slate-500 dark:text-slate-400">
            JEE Main & Advanced NTA Standard Values
          </span>
          <button
            type="button"
            onClick={onClose}
            className="min-h-[40px] px-4 rounded-xl bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-bold text-xs transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
