import React, { useState, useEffect } from 'react';
import { Sliders, RotateCcw, AlertCircle } from 'lucide-react';
import { CarnotInputs, ValidationResult } from '../physics/types';
import { validateCarnotInputs } from '../physics/carnot';

interface ControlsPanelProps {
  currentInputs: CarnotInputs;
  onApplyInputs: (newInputs: CarnotInputs) => void;
  onResetDefaults: () => void;
}

interface FormState {
  TH: string;
  TC: string;
  n: string;
  V1_L: string; // Displayed in Liters
  r: string;
  gamma: string;
}

export const ControlsPanel: React.FC<ControlsPanelProps> = ({
  currentInputs,
  onApplyInputs,
  onResetDefaults,
}) => {
  // Local form state so users can type freely without premature invalidation
  const [form, setForm] = useState<FormState>({
    TH: currentInputs.TH.toString(),
    TC: currentInputs.TC.toString(),
    n: currentInputs.n.toString(),
    V1_L: (currentInputs.V1 * 1000).toFixed(1), // m^3 to L
    r: currentInputs.r.toString(),
    gamma: currentInputs.gamma.toString(),
  });

  const [validation, setValidation] = useState<ValidationResult>({
    isValid: true,
    errors: {},
  });

  // Sync local form state if external currentInputs changes (e.g. onResetDefaults)
  useEffect(() => {
    setForm({
      TH: currentInputs.TH.toString(),
      TC: currentInputs.TC.toString(),
      n: currentInputs.n.toString(),
      V1_L: (currentInputs.V1 * 1000).toFixed(1),
      r: currentInputs.r.toString(),
      gamma: currentInputs.gamma.toString(),
    });
    setValidation({ isValid: true, errors: {} });
  }, [currentInputs]);

  // Handle value change for any parameter
  const handleChange = (field: keyof FormState, value: string) => {
    const updatedForm = { ...form, [field]: value };
    setForm(updatedForm);

    const parsedTH = parseFloat(updatedForm.TH);
    const parsedTC = parseFloat(updatedForm.TC);
    const parsedN = parseFloat(updatedForm.n);
    const parsedV1_L = parseFloat(updatedForm.V1_L);
    const parsedR = parseFloat(updatedForm.r);
    const parsedGamma = parseFloat(updatedForm.gamma);

    const candidateInputs: CarnotInputs = {
      TH: parsedTH,
      TC: parsedTC,
      n: parsedN,
      V1: parsedV1_L / 1000, // Convert L to m^3
      r: parsedR,
      gamma: parsedGamma,
    };

    const valResult = validateCarnotInputs(candidateInputs);
    setValidation(valResult);

    // If completely valid, apply immediately and pause/reset cycle to state 1
    if (valResult.isValid) {
      onApplyInputs(candidateInputs);
    }
  };

  return (
    <div className="panel-card">
      <div className="panel-header">
        <div className="panel-title">
          <Sliders size={18} color="#2563eb" />
          <span>Thông Số Đầu Vào</span>
        </div>
      </div>

      <div className="controls-list">
        {/* TH - Hot Reservoir */}
        <div className={`control-field ${validation.errors.TH ? 'has-error' : ''}`}>
          <div className="control-label-row">
            <span className="control-label">Nguồn nóng (TH)</span>
            <span className="control-symbol">T1 = T2</span>
          </div>
          <div className="control-inputs-row">
            <input
              type="range"
              className="slider-input"
              min="400"
              max="1200"
              step="10"
              value={form.TH}
              onChange={(e) => handleChange('TH', e.target.value)}
              aria-label="Nguồn nóng TH"
            />
            <div className="number-input-wrap">
              <input
                type="number"
                className="number-input"
                min="400"
                max="1200"
                step="10"
                value={form.TH}
                onChange={(e) => handleChange('TH', e.target.value)}
                aria-label="Giá trị TH (K)"
              />
              <span className="unit-tag">K</span>
            </div>
          </div>
          {validation.errors.TH && (
            <div className="field-error-text">
              <AlertCircle size={12} style={{ display: 'inline', marginRight: 4 }} />
              {validation.errors.TH}
            </div>
          )}
        </div>

        {/* TC - Cold Reservoir */}
        <div className={`control-field ${validation.errors.TC ? 'has-error' : ''}`}>
          <div className="control-label-row">
            <span className="control-label">Nguồn lạnh (TC)</span>
            <span className="control-symbol">T3 = T4</span>
          </div>
          <div className="control-inputs-row">
            <input
              type="range"
              className="slider-input"
              min="200"
              max="500"
              step="10"
              value={form.TC}
              onChange={(e) => handleChange('TC', e.target.value)}
              aria-label="Nguồn lạnh TC"
            />
            <div className="number-input-wrap">
              <input
                type="number"
                className="number-input"
                min="200"
                max="500"
                step="10"
                value={form.TC}
                onChange={(e) => handleChange('TC', e.target.value)}
                aria-label="Giá trị TC (K)"
              />
              <span className="unit-tag">K</span>
            </div>
          </div>
          {validation.errors.TC && (
            <div className="field-error-text">
              <AlertCircle size={12} style={{ display: 'inline', marginRight: 4 }} />
              {validation.errors.TC}
            </div>
          )}
        </div>

        {/* n - Amount of gas */}
        <div className={`control-field ${validation.errors.n ? 'has-error' : ''}`}>
          <div className="control-label-row">
            <span className="control-label">Lượng khí (n)</span>
            <span className="control-symbol">Hệ kín</span>
          </div>
          <div className="control-inputs-row">
            <input
              type="range"
              className="slider-input"
              min="0.005"
              max="0.1"
              step="0.005"
              value={form.n}
              onChange={(e) => handleChange('n', e.target.value)}
              aria-label="Số mol n"
            />
            <div className="number-input-wrap">
              <input
                type="number"
                className="number-input"
                min="0.005"
                max="0.1"
                step="0.005"
                value={form.n}
                onChange={(e) => handleChange('n', e.target.value)}
                aria-label="Giá trị n (mol)"
              />
              <span className="unit-tag">mol</span>
            </div>
          </div>
          {validation.errors.n && (
            <div className="field-error-text">
              <AlertCircle size={12} style={{ display: 'inline', marginRight: 4 }} />
              {validation.errors.n}
            </div>
          )}
        </div>

        {/* V1 - Volume at state 1 */}
        <div className={`control-field ${validation.errors.V1 ? 'has-error' : ''}`}>
          <div className="control-label-row">
            <span className="control-label">Thể tích ban đầu (V1)</span>
            <span className="control-symbol">Vmin</span>
          </div>
          <div className="control-inputs-row">
            <input
              type="range"
              className="slider-input"
              min="0.2"
              max="2.0"
              step="0.1"
              value={form.V1_L}
              onChange={(e) => handleChange('V1_L', e.target.value)}
              aria-label="Thể tích V1 (L)"
            />
            <div className="number-input-wrap">
              <input
                type="number"
                className="number-input"
                min="0.2"
                max="2.0"
                step="0.1"
                value={form.V1_L}
                onChange={(e) => handleChange('V1_L', e.target.value)}
                aria-label="Giá trị V1 (L)"
              />
              <span className="unit-tag">L</span>
            </div>
          </div>
          {validation.errors.V1 && (
            <div className="field-error-text">
              <AlertCircle size={12} style={{ display: 'inline', marginRight: 4 }} />
              {validation.errors.V1}
            </div>
          )}
        </div>

        {/* r - Expansion ratio */}
        <div className={`control-field ${validation.errors.r ? 'has-error' : ''}`}>
          <div className="control-label-row">
            <span className="control-label">Tỷ số giãn nở (r)</span>
            <span className="control-symbol">V2 / V1</span>
          </div>
          <div className="control-inputs-row">
            <input
              type="range"
              className="slider-input"
              min="1.1"
              max="4.0"
              step="0.1"
              value={form.r}
              onChange={(e) => handleChange('r', e.target.value)}
              aria-label="Tỷ số giãn nở r"
            />
            <div className="number-input-wrap">
              <input
                type="number"
                className="number-input"
                min="1.1"
                max="4.0"
                step="0.1"
                value={form.r}
                onChange={(e) => handleChange('r', e.target.value)}
                aria-label="Giá trị r"
              />
              <span className="unit-tag">×</span>
            </div>
          </div>
          {validation.errors.r && (
            <div className="field-error-text">
              <AlertCircle size={12} style={{ display: 'inline', marginRight: 4 }} />
              {validation.errors.r}
            </div>
          )}
        </div>

        {/* gamma - Heat capacity ratio */}
        <div className={`control-field ${validation.errors.gamma ? 'has-error' : ''}`}>
          <div className="control-label-row">
            <span className="control-label">Chỉ số đoạn nhiệt (γ)</span>
            <span className="control-symbol">Cp / Cv</span>
          </div>
          <div className="control-inputs-row">
            <input
              type="range"
              className="slider-input"
              min="1.2"
              max="1.67"
              step="0.01"
              value={form.gamma}
              onChange={(e) => handleChange('gamma', e.target.value)}
              aria-label="Tỷ số nhiệt dung gamma"
            />
            <div className="number-input-wrap">
              <input
                type="number"
                className="number-input"
                min="1.2"
                max="1.67"
                step="0.01"
                value={form.gamma}
                onChange={(e) => handleChange('gamma', e.target.value)}
                aria-label="Giá trị gamma"
              />
              <span className="unit-tag"></span>
            </div>
          </div>
          {validation.errors.gamma && (
            <div className="field-error-text">
              <AlertCircle size={12} style={{ display: 'inline', marginRight: 4 }} />
              {validation.errors.gamma}
            </div>
          )}
        </div>
      </div>

      <div className="controls-actions">
        <button
          className="btn-secondary"
          onClick={onResetDefaults}
          title="Khôi phục các thông số mặc định của thí nghiệm"
        >
          <RotateCcw size={14} />
          <span>Khôi phục mặc định</span>
        </button>
      </div>

      <div style={{ fontSize: '0.73rem', color: 'var(--text-muted)', lineHeight: '1.4', marginTop: 4 }}>
        💡 <em>V2, V3, V4 được tự động xác định chính xác theo điều kiện khép kín chu trình Carnot.</em>
      </div>
    </div>
  );
};
