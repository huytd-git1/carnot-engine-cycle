import { describe, it, expect } from 'vitest';
import {
  calculateCarnotCycle,
  getInstantaneousState,
  numericalIntegratePdV,
  numericalIntegrateTdS,
  validateCarnotInputs,
} from './carnot';
import { DEFAULT_INPUTS, R_IDEAL_GAS, CarnotInputs } from './types';

describe('Carnot Cycle Physics Engine', () => {
  const defaultCycle = calculateCarnotCycle(DEFAULT_INPUTS);

  // 1. pi * Vi = n * R * Ti at all 4 states
  it('satisfies ideal gas law (pi * Vi = n * R * Ti) at all 4 states', () => {
    const { states, inputs } = defaultCycle;
    for (const state of states) {
      const pV = state.p * state.V;
      const nRT = inputs.n * R_IDEAL_GAS * state.T;
      expect(Math.abs(pV - nRT) / nRT).toBeLessThan(1e-10);
    }
  });

  // 2. T is constant on isothermal paths
  it('has constant temperature on isothermal paths (1->2 and 3->4)', () => {
    const { states, pvCurves } = defaultCycle;
    // 1 -> 2
    expect(states[0].T).toBe(states[1].T);
    for (const pt of pvCurves[0]) {
      expect(pt.T).toBeCloseTo(states[0].T, 5);
    }
    // 3 -> 4
    expect(states[2].T).toBe(states[3].T);
    for (const pt of pvCurves[2]) {
      expect(pt.T).toBeCloseTo(states[2].T, 5);
    }
  });

  // 3. pV^gamma and TV^(gamma - 1) constant on adiabatic paths
  it('satisfies p * V^gamma = const and T * V^(gamma - 1) = const on adiabatic paths (2->3 and 4->1)', () => {
    const { gamma } = defaultCycle.inputs;
    
    // Process 2 -> 3
    const curve23 = defaultCycle.pvCurves[1];
    const constPV23 = curve23[0].p * Math.pow(curve23[0].V, gamma);
    const constTV23 = curve23[0].T * Math.pow(curve23[0].V, gamma - 1);

    for (const pt of curve23) {
      const pv_g = pt.p * Math.pow(pt.V, gamma);
      const tv_g1 = pt.T * Math.pow(pt.V, gamma - 1);
      expect(Math.abs(pv_g - constPV23) / constPV23).toBeLessThan(1e-6);
      expect(Math.abs(tv_g1 - constTV23) / constTV23).toBeLessThan(1e-6);
    }

    // Process 4 -> 1
    const curve41 = defaultCycle.pvCurves[3];
    const constPV41 = curve41[0].p * Math.pow(curve41[0].V, gamma);
    const constTV41 = curve41[0].T * Math.pow(curve41[0].V, gamma - 1);

    for (const pt of curve41) {
      const pv_g = pt.p * Math.pow(pt.V, gamma);
      const tv_g1 = pt.T * Math.pow(pt.V, gamma - 1);
      expect(Math.abs(pv_g - constPV41) / constPV41).toBeLessThan(1e-6);
      expect(Math.abs(tv_g1 - constTV41) / constTV41).toBeLessThan(1e-6);
    }
  });

  // 4. Entropy is constant on adiabatic paths
  it('has constant entropy on reversible adiabatic paths (2->3 and 4->1)', () => {
    const { pvCurves, states } = defaultCycle;
    // Process 2 -> 3
    for (const pt of pvCurves[1]) {
      expect(pt.S_rel).toBeCloseTo(states[1].S_rel, 8);
    }
    // Process 4 -> 1
    for (const pt of pvCurves[3]) {
      expect(pt.S_rel).toBeCloseTo(states[3].S_rel, 8);
      expect(pt.S_rel).toBeCloseTo(0, 8);
    }
  });

  // 5. V2 / V1 = V3 / V4
  it('satisfies expansion ratio equality: V2 / V1 == V3 / V4', () => {
    const { states } = defaultCycle;
    const r12 = states[1].V / states[0].V;
    const r34 = states[2].V / states[3].V;
    expect(r12).toBeCloseTo(defaultCycle.inputs.r, 9);
    expect(r34).toBeCloseTo(defaultCycle.inputs.r, 9);
    expect(r12).toBeCloseTo(r34, 9);
  });

  // 6. Cycle closes at state 1
  it('closes the cycle perfectly at state 1', () => {
    const { states, pvCurves } = defaultCycle;
    const finalPt = pvCurves[3][pvCurves[3].length - 1];
    expect(finalPt.V).toBeCloseTo(states[0].V, 8);
    expect(finalPt.p).toBeCloseTo(states[0].p, 4);
    expect(finalPt.T).toBeCloseTo(states[0].T, 6);
  });

  // 7. Total deltaU of cycle is 0 within numerical tolerance
  it('has total deltaU of cycle equal to zero', () => {
    expect(defaultCycle.energies.deltaU_cycle).toBeCloseTo(0, 8);
  });

  // 8. Wnet = QH - |QC|
  it('verifies net work equals QH - |QC|', () => {
    const { energies } = defaultCycle;
    expect(energies.Wnet).toBeCloseTo(energies.QH - energies.QC_mag, 8);
  });

  // 9. eta = 1 - TC / TH
  it('verifies Carnot thermal efficiency matches eta = 1 - TC / TH', () => {
    const { energies, inputs } = defaultCycle;
    const expectedEta = 1 - inputs.TC / inputs.TH;
    expect(energies.efficiency).toBeCloseTo(expectedEta, 8);
    expect(energies.Wnet / energies.QH).toBeCloseTo(expectedEta, 8);
  });

  // 10. Numerical line integral of p dV matches Wnet
  it('matches numerical line integral of p dV with Wnet (< 0.5% error due to trapezoidal sampling)', () => {
    const integralW = numericalIntegratePdV(defaultCycle);
    const { Wnet } = defaultCycle.energies;
    const relDiff = Math.abs(integralW - Wnet) / Wnet;
    expect(relDiff).toBeLessThan(0.005);
  });

  // 11. Numerical line integral of T dS matches Wnet
  it('matches numerical line integral of T dS with Wnet (exact for rectangular T-S cycle)', () => {
    const integralQ = numericalIntegrateTdS(defaultCycle);
    const { Wnet } = defaultCycle.energies;
    const relDiff = Math.abs(integralQ - Wnet) / Wnet;
    expect(relDiff).toBeLessThan(0.001);
  });

  // 12. State continuity at process junctions
  it('maintains continuous states across all process junctions', () => {
    const { pvCurves } = defaultCycle;
    for (let i = 0; i < 4; i++) {
      const endCurrent = pvCurves[i][pvCurves[i].length - 1];
      const startNext = pvCurves[(i + 1) % 4][0];
      expect(endCurrent.V).toBeCloseTo(startNext.V, 7);
      expect(endCurrent.p).toBeCloseTo(startNext.p, 3);
      expect(endCurrent.T).toBeCloseTo(startNext.T, 5);
      expect(endCurrent.S_rel).toBeCloseTo(startNext.S_rel, 6);
    }
  });

  // 13. Instantaneous state transitions correctly and continuously
  it('returns valid instantaneous states across cycleProgress range', () => {
    const steps = [0, 0.2499, 0.25, 0.4999, 0.5, 0.7499, 0.75, 0.9999];
    for (const progress of steps) {
      const inst = getInstantaneousState(defaultCycle, progress);
      expect(inst.V).toBeGreaterThan(0);
      expect(inst.p).toBeGreaterThan(0);
      expect(inst.T).toBeGreaterThan(0);
      expect(inst.S_rel).toBeGreaterThanOrEqual(0);
      expect(isNaN(inst.W_process)).toBe(false);
      expect(isNaN(inst.Q_process)).toBe(false);
      expect(isNaN(inst.deltaU_process)).toBe(false);
    }
  });

  // 14. Input validation and edge configurations
  it('validates invalid inputs correctly (TH <= TC, bounds)', () => {
    const invalidInputs: CarnotInputs = {
      ...DEFAULT_INPUTS,
      TH: 300,
      TC: 500, // TH < TC
    };
    const res = validateCarnotInputs(invalidInputs);
    expect(res.isValid).toBe(false);
    expect(res.errors.TH).toBeDefined();

    const edgeInputs: CarnotInputs = {
      TH: 1200,
      TC: 200,
      n: 0.1,
      V1: 0.002,
      r: 4.0,
      gamma: 1.67,
    };
    const edgeRes = validateCarnotInputs(edgeInputs);
    expect(edgeRes.isValid).toBe(true);

    const edgeCycle = calculateCarnotCycle(edgeInputs);
    expect(edgeCycle.energies.Wnet).toBeGreaterThan(0);
    expect(edgeCycle.energies.efficiency).toBeCloseTo(1 - 200 / 1200, 8);
  });
});
