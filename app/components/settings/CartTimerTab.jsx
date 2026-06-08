import PremiumToggle from "../PremiumToggle";
import RangeInput from "../RangeInput";
import { Icon } from "@shopify/polaris";
import { MagicIcon } from "@shopify/polaris-icons";
import { CART_PRESETS } from "./Constants";

export default function CartTimerTab({
  showCartTimer,
  setShowCartTimer,
  cartTimerText,
  setCartTimerText,
  cartTimerMins,
  setCartTimerMins,
  cart_pos,
  setCartPos,
  cart_bg,
  setCartBg,
  cart_text,
  setCartText,
  cart_radius,
  setCartRadius,
  cart_border_width,
  setCartBorderWidth,
  cart_shadow,
  setCartShadow,
  cart_font,
  setCartFont,
  cart_border_color,
  setCartBorderColor,
  cart_show_progress,
  setCartShowProgress,
  cart_timeout_action,
  setCartTimeoutAction,
  applyCartPreset
}) {
  const isPresetActive = (key) => {
    const p = CART_PRESETS[key];
    if (!p) return false;
    
    const normalizeColor = (c) => c?.toLowerCase().trim() || "";
    
    return (
      normalizeColor(cart_bg) === normalizeColor(p.bg) &&
      normalizeColor(cart_text) === normalizeColor(p.text) &&
      Number(cart_radius) === Number(p.radius ?? 8) &&
      Number(cart_border_width) === Number(p.border_width ?? 1) &&
      normalizeColor(cart_border_color) === normalizeColor(p.border ?? "") &&
      cart_shadow === (p.shadow || "")
    );
  };

  const activePresetKey = Object.keys(CART_PRESETS).find(isPresetActive);

  return (
    <>
      <div className="section-card">
        <div className="section-header">
          <h2>Cart Urgency Configuration</h2>
          <PremiumToggle enabled={showCartTimer} onClick={() => setShowCartTimer(!showCartTimer)} />
          <input type="hidden" name="showCartTimer" value={showCartTimer ? "true" : "false"} />
        </div>
        {showCartTimer && (
          <div className="section-body">
            <div className="input-group">
              <label className="input-label">Timer Text</label>
              <input type="text" name="cartTimerText" value={cartTimerText} onInput={(e) => setCartTimerText(e.currentTarget.value)} className="s-input-premium" />
            </div>
          </div>
        )}
      </div>

      {showCartTimer && (
        <div className="section-card">
          <div className="section-header"><h2>Timing & Behavior</h2></div>
          <div className="section-body">
            <div className="s-grid-2">
              <div className="input-group">
                <label className="input-label">Timer Minutes</label>
                <input type="number" name="cartTimerMins" value={cartTimerMins || 10} onInput={(e) => setCartTimerMins(parseInt(e.currentTarget.value))} className="s-input-premium" />
              </div>
              <div className="input-group">
                <label className="input-label">Position</label>
                <select name="cart_pos" value={cart_pos} onChange={(e) => setCartPos(e.currentTarget.value)} className="s-input-premium">
                  <option value="bottom-left">Floating Bottom Left</option>
                  <option value="bottom-right">Floating Bottom Right</option>
                  <option value="top-left">Floating Top Left</option>
                  <option value="top-right">Floating Top Right</option>
                  <option value="top-bar">Sticky Top Bar (Full Width)</option>
                  <option value="bottom-bar">Sticky Bottom Bar (Full Width)</option>
                  <option value="inline">Inline - Below Checkout / Add to Cart</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {showCartTimer && (
        <div className="section-card">
          <div className="section-header"><h2>Timer Design</h2></div>
          <div className="section-body">
            <div className="input-group" style={{ marginBottom: '24px' }}>
              <label className="input-label">Quick Style Presets</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px 10px' }}>
                {Object.keys(CART_PRESETS).map((key) => {
                  const p = CART_PRESETS[key];
                  const active = isPresetActive(key);
                  return (
                    <div
                      key={key}
                      onClick={() => applyCartPreset(key)}
                      style={{
                        background: p.bg,
                        color: p.text,
                        border: active ? '2px solid #008060' : `1px solid ${p.border}`,
                        boxShadow: active ? '0 0 0 1px #008060, 0 4px 10px rgba(0,128,96,0.15)' : p.shadow,
                        transform: active ? 'scale(1.03)' : 'scale(1)',
                        transition: 'all 0.2s ease',
                        borderRadius: `${p.radius === 50 ? 20 : p.radius}px`,
                        padding: '10px 8px',
                        fontSize: '11px',
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
            <div className="s-grid-2">
              <div className="input-group">
                <label className="input-label">Box Color</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    name="cart_bg"
                    value={cart_bg}
                    onInput={(e) => setCartBg(e.currentTarget.value)}
                    className="s-input-premium"
                    style={{ flex: 1 }}
                  />
                  <input
                    type="color"
                    value={cart_bg.startsWith('#') && cart_bg.length === 7 ? cart_bg : '#ffffff'}
                    onInput={(e) => setCartBg(e.currentTarget.value)}
                    style={{ width: '44px', height: '40px', padding: '0', border: '1px solid #d2d5d8', borderRadius: '8px', cursor: 'pointer' }}
                  />
                </div>
              </div>
              <div className="input-group">
                <label className="input-label">Text Color</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    name="cart_text"
                    value={cart_text}
                    onInput={(e) => setCartText(e.currentTarget.value)}
                    className="s-input-premium"
                    style={{ flex: 1 }}
                  />
                  <input
                    type="color"
                    value={cart_text.startsWith('#') && cart_text.length === 7 ? cart_text : '#000000'}
                    onInput={(e) => setCartText(e.currentTarget.value)}
                    style={{ width: '44px', height: '40px', padding: '0', border: '1px solid #d2d5d8', borderRadius: '8px', cursor: 'pointer' }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showCartTimer && (
        <div className="section-card">
          <div className="section-header">
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ display: 'inline-flex', width: '22px', height: '22px', color: '#1c1d1f' }}>
                <Icon source={MagicIcon} />
              </span> Cart Aesthetics
            </h2>
          </div>
          <div className="section-body">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              <RangeInput label="Border Radius" name="cart_radius" value={cart_radius} min={0} max={50} onChange={setCartRadius} unit="px" />
              <RangeInput label="Border Width" name="cart_border_width" value={cart_border_width} min={0} max={10} onChange={setCartBorderWidth} unit="px" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginTop: '20px' }}>
              <div className="input-group">
                <label className="input-label">Box Shadow</label>
                <select name="cart_shadow" value={cart_shadow} onChange={(e) => setCartShadow(e.target.value)} className="s-input-premium">
                  <option value="none">No Shadow</option>
                  <option value="0 2px 8px rgba(0,0,0,0.05)">Subtle (Light Presets)</option>
                  <option value="0 2px 8px rgba(0,0,0,0.1)">Subtle</option>
                  <option value="0 4px 12px rgba(0,0,0,0.15)">Standard</option>
                  <option value="0 4px 12px rgba(133,77,14,0.08)">Luxury Gold Glow</option>
                  <option value="0 8px 32px rgba(0,0,0,0.08)">Glassmorphic Shadow</option>
                  <option value="0 0 10px rgba(57,255,20,0.5)">Cyberpunk Glow</option>
                  <option value="0 8px 24px rgba(0,0,0,0.2)">Deep</option>
                  <option value="0 0 15px rgba(255, 77, 79, 0.3)">Urgency Glow</option>
                </select>
              </div>
              <div className="input-group">
                <label className="input-label">Font Family</label>
                <select name="cart_font" value={cart_font} onChange={(e) => setCartFont(e.target.value)} className="s-input-premium">
                  <option value="Inter, sans-serif">Inter (Modern)</option>
                  <option value="'Roboto', sans-serif">Roboto (Clean)</option>
                  <option value="'Outfit', sans-serif">Outfit (Premium)</option>
                  <option value="monospace">Monospace (Tech)</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginTop: '20px' }}>
              <div className="input-group">
                <label className="input-label">Border Color</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input type="text" name="cart_border_color" value={cart_border_color} onChange={(e) => setCartBorderColor(e.target.value)} className="s-input-premium" style={{ flex: 1 }} />
                  <input type="color" value={cart_border_color.startsWith('#') && cart_border_color.length === 7 ? cart_border_color : '#ff4d4f'} onChange={(e) => setCartBorderColor(e.target.value)} style={{ width: '44px', height: '40px', padding: '0', border: '1px solid #d2d5d8', borderRadius: '8px' }} />
                </div>
              </div>
              <div className="input-group">
                <label className="input-label">Visual Progress Bar</label>
                <div style={{ display: 'flex', alignItems: 'center', height: '40px', background: '#f9fafb', borderRadius: '8px', padding: '0 12px' }}>
                  <span style={{ fontSize: '13px', color: '#6d7175', flex: 1 }}>Show shrinking timer bar</span>
                  <PremiumToggle enabled={cart_show_progress} onClick={() => setCartShowProgress(!cart_show_progress)} />
                  <input type="hidden" name="cart_show_progress" value={cart_show_progress ? "true" : "false"} />
                </div>
              </div>
            </div>

            <div style={{ marginTop: '20px', padding: '16px', background: '#fff9f0', borderRadius: '12px', border: '1px solid #ffcc80' }}>
               <label className="input-label" style={{ color: '#e65100' }}>⚠️ Amazon-Style Timeout Action</label>
               <p style={{ fontSize: '12px', color: '#ef6c00', marginBottom: '12px' }}>What should happen when the timer reaches 0?</p>
               <select name="cart_timeout_action" value={cart_timeout_action} onChange={(e) => setCartTimeoutAction(e.target.value)} className="s-input-premium" style={{ borderColor: '#ffb74d' }}>
                  <option value="message">Just show "Expired" message</option>
                  <option value="clear">Clear Cart & Reload (Amazon Style)</option>
                  <option value="redirect">Redirect to Home Page</option>
               </select>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
