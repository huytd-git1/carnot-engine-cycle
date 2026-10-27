import {
  CarnotInputs,
  CarnotCycleData,
  CurvePoint,
  DEFAULT_INPUTS,
  InstantaneousState,
  ProcessEnergy,
  ProcessIndex,
  R_IDEAL_GAS,
  StatePoint,
  ValidationResult,
} from './types';

export function validateCarnotInputs(inputs: CarnotInputs): ValidationResult {
  const errors: Partial<Record<keyof CarnotInputs, string>> = {};

  if (isNaN(inputs.TH) || inputs.TH < 400 || inputs.TH > 1200) {
    errors.TH = 'Nhiệt độ nguồn nóng TH phải từ 400 K đến 1200 K.';
  }

  if (isNaN(inputs.TC) || inputs.TC < 200 || inputs.TC > 500) {
    errors.TC = 'Nhiệt độ nguồn lạnh TC phải từ 200 K đến 500 K.';
  }

  if (inputs.TH <= inputs.TC) {
    errors.TH = 'Nhiệt độ TH phải lớn hơn nhiệt độ TC (TH > TC).';
    if (!errors.TC) {
      errors.TC = 'Nhiệt độ TC phải nhỏ hơn nhiệt độ TH (TC < TH).';
    }
  }

  if (isNaN(inputs.n) || inputs.n < 0.005 || inputs.n > 0.1) {
    errors.n = 'Số mol khí n phải từ 0.005 mol đến 0.1 mol.';
  }

  // inputs.V1 is in m^3 (0.2L = 0.0002 m^3, 2L = 0.002 m^3)
  if (isNaN(inputs.V1) || inputs.V1 < 0.00019 || inputs.V1 > 0.00201) {
    errors.V1 = 'Thể tích V1 phải từ 0.2 L đến 2.0 L.';
  }

  if (isNaN(inputs.r) || inputs.r < 1.1 || inputs.r > 4.0) {
    errors.r = 'Tỷ số giãn nở r phải từ 1.1 đến 4.0.';
  }

  if (isNaN(inputs.gamma) || inputs.gamma < 1.2 || inputs.gamma > 1.67) {
    errors.gamma = 'Tỷ số nhiệt dung γ phải từ 1.2 đến 1.67.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

export function calculateCarnotCycle(rawInputs: CarnotInputs = DEFAULT_INPUTS): CarnotCycleData {
  const inputs = { ...rawInputs };
  const { TH, TC, n, V1, r, gamma } = inputs;

  // Specific heat capacities at constant volume and pressure
  const Cv = R_IDEAL_GAS / (gamma - 1);
  const Cp = (gamma * R_IDEAL_GAS) / (gamma - 1);

  // Adiabatic expansion ratio factor: a = (TH / TC)^(1 / (gamma - 1))
  const a = Math.pow(TH / TC, 1 / (gamma - 1));

  // Volumes at 4 states (m^3)
  const V2 = r * V1;
  const V3 = a * V2; // a * r * V1
  const V4 = a * V1; // Note: V3 / V4 = r, V4 / V1 = a

  // Temperatures at 4 states (K)
  const T1 = TH;
  const T2 = TH;
  const T3 = TC;
  const T4 = TC;

  // Pressures at 4 states (Pa)
  const p1 = (n * R_IDEAL_GAS * T1) / V1;
  const p2 = (n * R_IDEAL_GAS * T2) / V2;
  const p3 = (n * R_IDEAL_GAS * T3) / V3;
  const p4 = (n * R_IDEAL_GAS * T4) / V4;

  // Relative Entropy S - S1 (S1 = 0)
  // S2 - S1 = n * R * ln(r)
  // S3 - S1 = n * R * ln(r) (isentropic 2->3)
  // S4 - S1 = 0 (isentropic 4->1)
  const deltaS = n * R_IDEAL_GAS * Math.log(r);
  const S1_rel = 0;
  const S2_rel = deltaS;
  const S3_rel = deltaS;
  const S4_rel = 0;

  const states: [StatePoint, StatePoint, StatePoint, StatePoint] = [
    { index: 1, name: 'Trạng thái 1', T: T1, V: V1, p: p1, S_rel: S1_rel },
    { index: 2, name: 'Trạng thái 2', T: T2, V: V2, p: p2, S_rel: S2_rel },
    { index: 3, name: 'Trạng thái 3', T: T3, V: V3, p: p3, S_rel: S3_rel },
    { index: 4, name: 'Trạng thái 4', T: T4, V: V4, p: p4, S_rel: S4_rel },
  ];

  // Energies of 4 processes
  // 1 -> 2: Isothermal expansion at TH
  const W_12 = n * R_IDEAL_GAS * TH * Math.log(r);
  const Q_12 = W_12;
  const deltaU_12 = 0;

  // 2 -> 3: Reversible adiabatic expansion TH -> TC
  const Q_23 = 0;
  const deltaU_23 = n * Cv * (TC - TH);
  const W_23 = -deltaU_23; // n * Cv * (TH - TC)

  // 3 -> 4: Isothermal compression at TC
  // V4 / V3 = 1 / r => ln(V4/V3) = -ln(r)
  const W_34 = -n * R_IDEAL_GAS * TC * Math.log(r);
  const Q_34 = W_34;
  const deltaU_34 = 0;

  // 4 -> 1: Reversible adiabatic compression TC -> TH
  const Q_41 = 0;
  const deltaU_41 = n * Cv * (TH - TC);
  const W_41 = -deltaU_41; // -n * Cv * (TH - TC)

  const processes: [ProcessEnergy, ProcessEnergy, ProcessEnergy, ProcessEnergy] = [
    {
      index: 0,
      fromState: 1,
      toState: 2,
      name: '1 → 2: Giãn nở đẳng nhiệt',
      type: 'isothermal',
      direction: 'expansion',
      Q: Q_12,
      W: W_12,
      deltaU: deltaU_12,
      description: 'Khí nhận nhiệt từ nguồn nóng và giãn nở. Nhiệt độ không đổi; nhiệt lượng nhận vào chuyển thành công.',
    },
    {
      index: 1,
      fromState: 2,
      toState: 3,
      name: '2 → 3: Giãn nở đoạn nhiệt',
      type: 'adiabatic',
      direction: 'expansion',
      Q: Q_23,
      W: W_23,
      deltaU: deltaU_23,
      description: 'Khí tiếp tục giãn nở trong điều kiện cách nhiệt. Khí thực hiện công nên nội năng và nhiệt độ giảm.',
    },
    {
      index: 2,
      fromState: 3,
      toState: 4,
      name: '3 → 4: Nén đẳng nhiệt',
      type: 'isothermal',
      direction: 'compression',
      Q: Q_34,
      W: W_34,
      deltaU: deltaU_34,
      description: 'Khí bị nén ở nhiệt độ không đổi và thải nhiệt cho nguồn lạnh.',
    },
    {
      index: 3,
      fromState: 4,
      toState: 1,
      name: '4 → 1: Nén đoạn nhiệt',
      type: 'adiabatic',
      direction: 'compression',
      Q: Q_41,
      W: W_41,
      deltaU: deltaU_41,
      description: 'Khí bị nén trong điều kiện cách nhiệt. Công tác dụng lên khí làm tăng nội năng và nhiệt độ.',
    },
  ];

  const QH = Q_12;
  const QC_mag = Math.abs(Q_34);
  const QC_signed = Q_34;
  const Wnet = QH - QC_mag;
  const efficiency = 1 - TC / TH;
  const efficiencyPercent = efficiency * 100;
  const deltaU_cycle = deltaU_12 + deltaU_23 + deltaU_34 + deltaU_41;

  // Generate smooth curve points for p-V and T-S (60 samples per process)
  const SAMPLES_PER_PROCESS = 60;
  const pvCurves: CurvePoint[][] = [];
  const tsCurves: CurvePoint[][] = [];

  for (let pIdx = 0; pIdx < 4; pIdx++) {
    const processPoints: CurvePoint[] = [];
    const from = states[pIdx];
    const to = states[(pIdx + 1) % 4];

    for (let i = 0; i <= SAMPLES_PER_PROCESS; i++) {
      const u = i / SAMPLES_PER_PROCESS;
      // Volume logarithmic interpolation: V(u) = VA * (VB / VA)^u
      const V_u = from.V * Math.pow(to.V / from.V, u);
      let T_u = from.T;
      let p_u = from.p;
      let S_rel_u = from.S_rel;

      if (pIdx === 0) {
        // 1 -> 2: Isothermal expansion at TH
        T_u = TH;
        p_u = (n * R_IDEAL_GAS * TH) / V_u;
        S_rel_u = u * deltaS;
      } else if (pIdx === 1) {
        // 2 -> 3: Reversible adiabatic expansion: T * V^(gamma - 1) = const
        T_u = TH * Math.pow(from.V / V_u, gamma - 1);
        p_u = (n * R_IDEAL_GAS * T_u) / V_u;
        S_rel_u = deltaS;
      } else if (pIdx === 2) {
        // 3 -> 4: Isothermal compression at TC
        T_u = TC;
        p_u = (n * R_IDEAL_GAS * TC) / V_u;
        S_rel_u = (1 - u) * deltaS;
      } else if (pIdx === 3) {
        // 4 -> 1: Reversible adiabatic compression: T * V^(gamma - 1) = const
        T_u = TC * Math.pow(from.V / V_u, gamma - 1);
        p_u = (n * R_IDEAL_GAS * T_u) / V_u;
        S_rel_u = 0;
      }

      processPoints.push({
        V: V_u,
        p: p_u,
        T: T_u,
        S_rel: S_rel_u,
        processIndex: pIdx as ProcessIndex,
        u,
      });
    }

    pvCurves.push(processPoints);
    tsCurves.push(processPoints);
  }

  return {
    inputs,
    Cv,
    Cp,
    a,
    states,
    energies: {
      QH,
      QC_mag,
      QC_signed,
      Wnet,
      efficiency,
      efficiencyPercent,
      deltaU_cycle,
      processes,
    },
    pvCurves,
    tsCurves,
  };
}

/**
 * Calculates instantaneous thermodynamic and energetic state based on cycleProgress in [0, 1].
 */
export function getInstantaneousState(
  cycle: CarnotCycleData,
  cycleProgress: number
): InstantaneousState {
  // Normalize progress to [0, 1]
  let p = cycleProgress % 1;
  if (p < 0) p += 1;
  // If exactly 1 (end of cycle), keep at 1 or handle boundary
  if (cycleProgress >= 1) p = 0.999999;

  // Process index: 0, 1, 2, or 3
  const segment = p * 4;
  const processIndex = Math.min(3, Math.floor(segment)) as ProcessIndex;
  const u = segment - processIndex; // Progress within process [0, 1)

  const { TH, TC, n, gamma } = cycle.inputs;
  const { Cv, states, energies } = cycle;
  const fromState = states[processIndex];
  const toState = states[(processIndex + 1) % 4];

  // Volume: V(u) = VA * (VB / VA)^u
  const V = fromState.V * Math.pow(toState.V / fromState.V, u);
  const deltaS = energies.processes[0].W / TH; // n * R * ln(r)

  let T = fromState.T;
  let p_gas = fromState.p;
  let S_rel = fromState.S_rel;

  let Q_process = 0;
  let W_process = 0;
  let deltaU_process = 0;

  let heatTransfer: 'in' | 'out' | 'none' = 'none';
  let heatReservoir: 'hot' | 'cold' | 'insulated' = 'insulated';
  let workExchange: 'by_gas' | 'on_gas' = 'by_gas';

  if (processIndex === 0) {
    // 1 -> 2: Isothermal expansion
    T = TH;
    p_gas = (n * R_IDEAL_GAS * TH) / V;
    S_rel = u * deltaS;
    W_process = n * R_IDEAL_GAS * TH * Math.log(V / fromState.V);
    Q_process = W_process;
    deltaU_process = 0;

    heatTransfer = 'in';
    heatReservoir = 'hot';
    workExchange = 'by_gas';
  } else if (processIndex === 1) {
    // 2 -> 3: Reversible adiabatic expansion
    T = TH * Math.pow(fromState.V / V, gamma - 1);
    p_gas = (n * R_IDEAL_GAS * T) / V;
    S_rel = deltaS;
    Q_process = 0;
    deltaU_process = n * Cv * (T - TH);
    W_process = -deltaU_process;

    heatTransfer = 'none';
    heatReservoir = 'insulated';
    workExchange = 'by_gas';
  } else if (processIndex === 2) {
    // 3 -> 4: Isothermal compression
    T = TC;
    p_gas = (n * R_IDEAL_GAS * TC) / V;
    S_rel = (1 - u) * deltaS;
    W_process = n * R_IDEAL_GAS * TC * Math.log(V / fromState.V); // negative
    Q_process = W_process; // negative
    deltaU_process = 0;

    heatTransfer = 'out';
    heatReservoir = 'cold';
    workExchange = 'on_gas';
  } else {
    // 4 -> 1: Reversible adiabatic compression
    T = TC * Math.pow(fromState.V / V, gamma - 1);
    p_gas = (n * R_IDEAL_GAS * T) / V;
    S_rel = 0;
    Q_process = 0;
    deltaU_process = n * Cv * (T - TC);
    W_process = -deltaU_process; // negative

    heatTransfer = 'none';
    heatReservoir = 'insulated';
    workExchange = 'on_gas';
  }

  // Cumulative calculation from start of cycle
  let Q_cumulative = 0;
  let W_cumulative = 0;
  let deltaU_cumulative = 0;

  for (let i = 0; i < processIndex; i++) {
    Q_cumulative += energies.processes[i].Q;
    W_cumulative += energies.processes[i].W;
    deltaU_cumulative += energies.processes[i].deltaU;
  }
  Q_cumulative += Q_process;
  W_cumulative += W_process;
  deltaU_cumulative += deltaU_process;

  const currentProcess = energies.processes[processIndex];

  return {
    cycleProgress: p,
    processIndex,
    u,
    processName: currentProcess.name,
    processType: currentProcess.type,
    processDirection: currentProcess.direction,
    T,
    V,
    p: p_gas,
    S_rel,
    Q_process,
    W_process,
    deltaU_process,
    Q_cumulative,
    W_cumulative,
    deltaU_cumulative,
    heatTransfer,
    heatReservoir,
    workExchange,
  };
}

/**
 * Computes numerical line integral of p dV over the closed cycle using trapezoidal rule.
 */
export function numericalIntegratePdV(cycle: CarnotCycleData): number {
  let work = 0;
  for (const curve of cycle.pvCurves) {
    for (let i = 0; i < curve.length - 1; i++) {
      const p1 = curve[i].p;
      const p2 = curve[i + 1].p;
      const V1 = curve[i].V;
      const V2 = curve[i + 1].V;
      const dV = V2 - V1;
      const pAvg = (p1 + p2) / 2;
      work += pAvg * dV;
    }
  }
  return work;
}

/**
 * Computes numerical line integral of T dS over the closed cycle using trapezoidal rule.
 */
export function numericalIntegrateTdS(cycle: CarnotCycleData): number {
  let heat = 0;
  for (const curve of cycle.tsCurves) {
    for (let i = 0; i < curve.length - 1; i++) {
      const T1 = curve[i].T;
      const T2 = curve[i + 1].T;
      const S1 = curve[i].S_rel;
      const S2 = curve[i + 1].S_rel;
      const dS = S2 - S1;
      const TAvg = (T1 + T2) / 2;
      heat += TAvg * dS;
    }
  }
  return heat;
}
