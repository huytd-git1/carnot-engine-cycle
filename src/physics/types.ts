// Universal gas constant in J / (mol * K)
export const R_IDEAL_GAS = 8.314462618;

export interface CarnotInputs {
  TH: number; // Hot reservoir temperature in Kelvin (400 - 1200 K)
  TC: number; // Cold reservoir temperature in Kelvin (200 - 500 K)
  n: number;  // Amount of gas in moles (0.005 - 0.1 mol)
  V1: number; // Volume at state 1 in m^3 (0.2 - 2 L -> 0.0002 - 0.002 m^3)
  r: number;  // Isothermal expansion ratio V2/V1 (1.1 - 4)
  gamma: number; // Heat capacity ratio Cp/Cv (1.2 - 1.67)
}

export const DEFAULT_INPUTS: CarnotInputs = {
  TH: 600,
  TC: 300,
  n: 0.02,
  V1: 0.001, // 1 Liter
  r: 2.0,
  gamma: 1.4, // Air / diatomic
};

export interface StatePoint {
  index: 1 | 2 | 3 | 4;
  name: string;
  T: number;      // Temperature in K
  V: number;      // Volume in m^3
  p: number;      // Pressure in Pa
  S_rel: number;  // Relative entropy S - S1 in J/K (S1 = 0)
}

export type ProcessIndex = 0 | 1 | 2 | 3; // 0: 1->2, 1: 2->3, 2: 3->4, 3: 4->1

export interface ProcessEnergy {
  index: ProcessIndex;
  fromState: 1 | 2 | 3 | 4;
  toState: 1 | 2 | 3 | 4;
  name: string;
  type: 'isothermal' | 'adiabatic';
  direction: 'expansion' | 'compression';
  Q: number;      // Heat in Joules (signed)
  W: number;      // Work done by gas in Joules (signed)
  deltaU: number; // Internal energy change in Joules (signed)
  description: string;
}

export interface CycleEnergies {
  QH: number;           // Heat absorbed from hot reservoir (> 0)
  QC_mag: number;       // Magnitude of heat rejected to cold reservoir (> 0)
  QC_signed: number;    // Signed heat rejected (< 0)
  Wnet: number;         // Net work produced (> 0)
  efficiency: number;   // Carnot efficiency (0 to 1)
  efficiencyPercent: number; // Carnot efficiency in %
  deltaU_cycle: number; // 0
  processes: [ProcessEnergy, ProcessEnergy, ProcessEnergy, ProcessEnergy];
}

export interface CurvePoint {
  V: number;
  p: number;
  T: number;
  S_rel: number;
  processIndex: ProcessIndex;
  u: number; // Progress within the process [0, 1]
}

export interface CarnotCycleData {
  inputs: CarnotInputs;
  Cv: number;
  Cp: number;
  a: number; // (TH/TC)^(1/(gamma - 1))
  states: [StatePoint, StatePoint, StatePoint, StatePoint];
  energies: CycleEnergies;
  pvCurves: CurvePoint[][]; // 4 arrays of points for each process curve
  tsCurves: CurvePoint[][]; // 4 arrays of points for each process curve
}

export interface InstantaneousState {
  cycleProgress: number; // 0 to 1
  processIndex: ProcessIndex;
  u: number;             // Progress within current process [0, 1]
  processName: string;
  processType: 'isothermal' | 'adiabatic';
  processDirection: 'expansion' | 'compression';
  
  // Thermodynamic state
  T: number;     // K
  V: number;     // m^3
  p: number;     // Pa
  S_rel: number; // J/K
  
  // Energy from start of current process
  Q_process: number;
  W_process: number;
  deltaU_process: number;

  // Cumulative energy from start of cycle
  Q_cumulative: number;
  W_cumulative: number;
  deltaU_cumulative: number;

  // Heat & work exchange active indicators
  heatTransfer: 'in' | 'out' | 'none';
  heatReservoir: 'hot' | 'cold' | 'insulated';
  workExchange: 'by_gas' | 'on_gas'; // expansion or compression
}

export interface ValidationResult {
  isValid: boolean;
  errors: Partial<Record<keyof CarnotInputs, string>>;
}
