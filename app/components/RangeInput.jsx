import { useEffect, useState } from "react";

const RangeInput = ({ label, name, value, min = 0, max = 100, step = 1, onChange, unit = "" }) => {
  const [localValue, setLocalValue] = useState(value);

  // Sync local value when prop value changes (e.g. on load or reset)
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleSliderChange = (newVal) => {
    setLocalValue(newVal);
    onChange(newVal);
  };

  return (
    <div className="input-group">
      {name && <input type="hidden" name={name} value={localValue} />}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <label className="input-label" style={{ margin: 0 }}>{label}</label>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <input 
            type="number" 
            value={localValue} 
            onChange={(e) => handleSliderChange(parseInt(e.target.value) || 0)}
            style={{ width: '60px', padding: '4px 8px', border: '1px solid #d2d5d8', borderRadius: '4px', fontSize: '12px', textAlign: 'right' }}
          />
          {unit && <span style={{ fontSize: '11px', color: '#666', fontWeight: 'bold' }}>{unit}</span>}
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <input 
          type="range" 
          min={min} 
          max={max} 
          step={step} 
          value={localValue} 
          onInput={(e) => setLocalValue(parseInt(e.target.value))}
          onChange={(e) => handleSliderChange(parseInt(e.target.value))}
          style={{ flex: 1, height: '6px', cursor: 'pointer' }}
        />
      </div>
    </div>
  );
};

export default RangeInput;
