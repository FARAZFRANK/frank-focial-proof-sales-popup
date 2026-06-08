import PremiumToggle from "../PremiumToggle";
import RangeInput from "../RangeInput";
import { Icon } from "@shopify/polaris";
import { MagicIcon } from "@shopify/polaris-icons";
import { COUNTER_PRESETS } from "./Constants";

export default function CountersTab({
  showVisitorCount,
  setShowVisitorCount,
  counter_pos,
  setCounterPos,
  counter_bg,
  setCounterBg,
  counter_text,
  setCounterText,
  counter_radius,
  setCounterRadius,
  counter_border_color,
  setCounterBorderColor,
  counter_border_width,
  setCounterBorderWidth,
  counter_shadow,
  setCounterShadow,
  counter_anim,
  setCounterAnim,
  counter_font,
  setCounterFont,
  counter_delay,
  setCounterDelay,
  counter_duration,
  setCounterDuration,
  counter_gap,
  setCounterGap,
  counterPulse,
  setCounterPulse,
  counterFluctuate,
  setCounterFluctuate,
  counter_once_per_session,
  setCounterOncePerSession,
  counter_loop,
  setCounterLoop,
  minVisitors,
  setMinVisitors,
  maxVisitors,
  setMaxVisitors,
  labelVisitors,
  setLabelVisitors,
  applyCounterPreset
}) {
  const isPresetActive = (key) => {
    const p = COUNTER_PRESETS[key];
    if (!p) return false;
    
    const normalizeColor = (c) => c?.toLowerCase().trim() || "";
    
    return (
      normalizeColor(counter_bg) === normalizeColor(p.bg) &&
      normalizeColor(counter_text) === normalizeColor(p.text) &&
      Number(counter_radius) === Number(p.radius ?? 50) &&
      Number(counter_border_width) === Number(p.border_width ?? 1) &&
      normalizeColor(counter_border_color) === normalizeColor(p.border ?? "") &&
      counter_shadow === (p.shadow || "")
    );
  };

  const activePresetKey = Object.keys(COUNTER_PRESETS).find(isPresetActive);

  return (
    <>
      <div className="section-card">
        <div className="section-header">
          <h2>Live Visitor Configuration</h2>
          <PremiumToggle enabled={showVisitorCount} onClick={() => setShowVisitorCount(!showVisitorCount)} />
        </div>
        {showVisitorCount && (
          <div className="section-body">
            <div style={{ marginBottom: '24px', padding: '16px', background: '#f9fafb', borderRadius: '12px', border: '1px solid #e1e3e5' }}>
              <label className="input-label" style={{ fontWeight: '700', marginBottom: '12px', display: 'block' }}>Quick Style Presets</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px 10px' }}>
                {Object.keys(COUNTER_PRESETS).map((key) => {
                  const p = COUNTER_PRESETS[key];
                  const active = isPresetActive(key);
                  return (
                    <div
                      key={key}
                      onClick={() => applyCounterPreset(key)}
                      style={{
                        padding: '10px',
                        borderRadius: '8px',
                        border: active ? '2px solid #008060' : '1px solid #d2d5d8',
                        boxShadow: active ? '0 0 0 1px #008060, 0 4px 10px rgba(0,128,96,0.15)' : p.shadow,
                        transform: active ? 'scale(1.03)' : 'scale(1)',
                        transition: 'all 0.2s ease',
                        background: p.bg,
                        color: p.text,
                        fontSize: '12px',
                        fontWeight: '700',
                        cursor: 'pointer',
                        textAlign: 'center',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minHeight: '42px',
                        position: 'relative'
                      }}
                    >
                      {key.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}
                      {active && (
                        <span style={{
                          position: 'absolute',
                          top: '-6px',
                          right: '-6px',
                          background: '#008060',
                          color: '#ffffff',
                          width: '16px',
                          height: '16px',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '9px',
                          fontWeight: 'bold',
                          border: '1.5px solid #ffffff',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                          zIndex: 10
                        }}>
                          ✓
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
              <div style={{ marginTop: '12px', fontSize: '12px', fontWeight: '500', color: '#6d7175', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>Active Style:</span>
                <span style={{ 
                  fontWeight: '700', 
                  color: activePresetKey ? '#008060' : '#cf2d2d',
                  background: activePresetKey ? '#e6f4ea' : '#fbebeb',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  fontSize: '11px',
                  textTransform: 'capitalize'
                }}>
                  {activePresetKey ? activePresetKey.replace('_', ' ') : "Custom (Modified)"}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', padding: '12px 16px', background: '#f6f6f7', borderRadius: '8px', border: '1px solid #e1e3e5' }}>
              <div style={{ flex: 1 }}>
                <label className="input-label" style={{ margin: 0, fontWeight: '700' }}>Show Once Per Session</label>
                <span style={{ fontSize: '12px', color: '#6d7175', display: 'block', marginTop: '2px' }}>Prevent annoying your visitors by displaying the counter only once during their stay.</span>
              </div>
              <PremiumToggle enabled={counter_once_per_session} onClick={() => setCounterOncePerSession(!counter_once_per_session)} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '20px' }}>
              <div className="input-group" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', background: '#f9fafb', borderRadius: '8px', border: '1px solid #e1e3e5' }}>
                <div>
                  <label className="input-label" style={{ margin: 0, fontWeight: '700' }}>Live Green Pulsing Dot</label>
                  <span style={{ fontSize: '12px', color: '#666', display: 'block', marginTop: '2px' }}>Show active pulsing green dot</span>
                </div>
                <PremiumToggle enabled={counterPulse} onClick={() => setCounterPulse(!counterPulse)} />
              </div>
              
              <div className="input-group" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', background: '#f9fafb', borderRadius: '8px', border: '1px solid #e1e3e5' }}>
                <div>
                  <label className="input-label" style={{ margin: 0, fontWeight: '700' }}>Dynamic Fluctuation</label>
                  <span style={{ fontSize: '12px', color: '#666', display: 'block', marginTop: '2px' }}>Fluctuate visitors count in real-time</span>
                </div>
                <PremiumToggle enabled={counterFluctuate} onClick={() => setCounterFluctuate(!counterFluctuate)} />
              </div>

              <div className="input-group" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', background: '#f9fafb', borderRadius: '8px', border: '1px solid #e1e3e5' }}>
                <div>
                  <label className="input-label" style={{ margin: 0, fontWeight: '700' }}>Infinite Loop Animation</label>
                  <span style={{ fontSize: '12px', color: '#666', display: 'block', marginTop: '2px' }}>Fade in/out (Off keeps counter visible)</span>
                </div>
                <PremiumToggle enabled={counter_loop} onClick={() => setCounterLoop(!counter_loop)} />
              </div>
            </div>

            <div className="s-grid-2" style={{ marginTop: '16px' }}>
              <RangeInput label="Min Visitors" name="minVisitors" value={minVisitors} min={1} max={500} onChange={setMinVisitors} />
              <RangeInput label="Max Visitors" name="maxVisitors" value={maxVisitors} min={1} max={1000} onChange={setMaxVisitors} />
            </div>

            <div className="s-grid-2">
              <div className="input-group">
                <label className="input-label">Visitor Count Label</label>
                <input type="text" name="labelVisitors" value={labelVisitors} onInput={(e) => setLabelVisitors(e.currentTarget.value)} className="s-input-premium" />
              </div>
              <div className="input-group">
                <label className="input-label">Placement Position</label>
                <select name="counter_pos" value={counter_pos} onChange={(e) => setCounterPos(e.currentTarget.value)} className="s-input-premium">
                  <option value="bottom-right">Floating Bottom Right (Default)</option>
                  <option value="bottom-left">Floating Bottom Left</option>
                  <option value="top-left">Floating Top Left</option>
                  <option value="top-right">Floating Top Right</option>
                  <option value="inline">Inline - Below Add to Cart (Recommended)</option>
                </select>
              </div>
            </div>
            <div className="s-grid-2">
              <div className="input-group">
                <label className="input-label">Background Color</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    name="counter_bg"
                    value={counter_bg}
                    onInput={(e) => setCounterBg(e.currentTarget.value)}
                    className="s-input-premium"
                    style={{ flex: 1 }}
                  />
                  <input
                    type="color"
                    value={counter_bg.startsWith('#') && counter_bg.length === 7 ? counter_bg : '#ffffff'}
                    onInput={(e) => setCounterBg(e.currentTarget.value)}
                    style={{ width: '44px', height: '40px', padding: '0', border: '1px solid #d2d5d8', borderRadius: '8px', cursor: 'pointer' }}
                  />
                </div>
              </div>
              <div className="input-group">
                <label className="input-label">Text Color</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    name="counter_text"
                    value={counter_text}
                    onInput={(e) => setCounterText(e.currentTarget.value)}
                    className="s-input-premium"
                    style={{ flex: 1 }}
                  />
                  <input
                    type="color"
                    value={counter_text.startsWith('#') && counter_text.length === 7 ? counter_text : '#000000'}
                    onInput={(e) => setCounterText(e.currentTarget.value)}
                    style={{ width: '44px', height: '40px', padding: '0', border: '1px solid #d2d5d8', borderRadius: '8px', cursor: 'pointer' }}
                  />
                </div>
              </div>
            </div>

            <div style={{ padding: '20px', background: '#f9fafb', borderRadius: '12px', border: '1px dashed #d2d5d8' }}>
              <h3 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '16px', color: '#1a1a1a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ display: 'inline-flex', width: '20px', height: '20px', color: '#8c9196' }}>
                  <Icon source={MagicIcon} />
                </span> Counter Aesthetics
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                <div className="input-group">
                  <label className="input-label">Animation</label>
                  <select name="counter_anim" value={counter_anim} onChange={(e) => setCounterAnim(e.currentTarget.value)} className="s-input-premium">
                    <option value="slide-up">Slide Up</option>
                    <option value="fade">Fade In</option>
                    <option value="zoom">Zoom In</option>
                    <option value="bounce">Bounce In</option>
                    <option value="slide-right">Slide Right</option>
                    <option value="slide-left">Slide Left</option>
                    <option value="flip">Flip In</option>
                    <option value="shake">Shake</option>
                  </select>
                </div>
                <div className="input-group">
                  <label className="input-label">Font Family</label>
                  <select name="counter_font" value={counter_font} onChange={(e) => setCounterFont(e.currentTarget.value)} className="s-input-premium">
                    <option value="Inter, sans-serif">Inter (Modern)</option>
                    <option value="'Roboto', sans-serif">Roboto (Clean)</option>
                    <option value="'Montserrat', sans-serif">Montserrat (Bold)</option>
                    <option value="'Playfair Display', serif">Playfair (Elegant)</option>
                    <option value="'Courier Prime', monospace">Courier (Classic)</option>
                  </select>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                <RangeInput label="Border Radius" name="counter_radius" value={counter_radius} min={0} max={50} onChange={setCounterRadius} unit="px" />
                <RangeInput label="Border Width" name="counter_border_width" value={counter_border_width} min={0} max={10} onChange={setCounterBorderWidth} unit="px" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                <div className="input-group">
                  <label className="input-label">Box Shadow</label>
                  <select name="counter_shadow" value={counter_shadow} onChange={(e) => setCounterShadow(e.currentTarget.value)} className="s-input-premium">
                    <option value="none">None</option>
                    <option value="0 2px 8px rgba(0,0,0,0.05)">Subtle (Light Presets)</option>
                    <option value="0 2px 8px rgba(0,0,0,0.08)">Subtle (Standard)</option>
                    <option value="0 4px 15px rgba(0,0,0,0.15)">Standard (Capsule)</option>
                    <option value="0 4px 12px rgba(0,0,0,0.15)">Dark Preset Shadow</option>
                    <option value="0 4px 12px rgba(133,77,14,0.08)">Royal Gold Glow</option>
                    <option value="0 8px 24px rgba(0,0,0,0.18)">Deep</option>
                    <option value="0 12px 36px rgba(0,0,0,0.25)">Floating</option>
                  </select>
                </div>
                <div className="input-group">
                  <label className="input-label">Border Color</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input type="color" value={counter_border_color.startsWith('#') && counter_border_color.length === 7 ? counter_border_color : '#e1e3e5'} onInput={(e) => setCounterBorderColor(e.currentTarget.value)} style={{ width: '44px', height: '40px', padding: '0', border: '1px solid #d2d5d8', borderRadius: '8px' }} />
                    <span style={{ fontSize: '12px', color: '#666' }}>Pick a color for the counter border</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Display & Timing Settings for Counters */}
      {showVisitorCount && (
        <div className="section-card">
          <div className="section-header"><h2>Display & Timing Settings</h2></div>
          <div className="section-body">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px' }}>
              <RangeInput label="Initial Delay" name="counter_delay" value={counter_delay} min={0} max={10000} step={100} onChange={setCounterDelay} unit="ms" />
              <RangeInput label="Duration" name="counter_duration" value={counter_duration} min={1000} max={15000} step={100} onChange={setCounterDuration} unit="ms" />
              <RangeInput label="Display Gap" name="counter_gap" value={counter_gap} min={500} max={10000} step={100} onChange={setCounterGap} unit="ms" />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
