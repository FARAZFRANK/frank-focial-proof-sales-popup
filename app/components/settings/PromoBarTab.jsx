import PremiumToggle from "../PremiumToggle";
import RichTextEditor from "../RichTextEditor";
import { PROMO_PRESETS } from "./Constants";

export default function PromoBarTab({
  showPromoBar,
  setShowPromoBar,
  promoOnce,
  setPromoOnce,
  promo_pos,
  setPromoPos,
  promoShowOn,
  setPromoShowOn,
  promoText,
  setPromoText,
  promoCode,
  setPromoCode,
  promoBgColor,
  setPromoBgColor,
  promoTextColor,
  setPromoTextColor,
  promoHeight,
  setPromoHeight,
  promoFontSize,
  setPromoFontSize,
  applyPromoPreset
}) {
  const isPresetActive = (key) => {
    const p = PROMO_PRESETS[key];
    if (!p) return false;
    
    const normalizeColor = (c) => c?.toLowerCase().trim() || "";
    
    return (
      normalizeColor(promoBgColor) === normalizeColor(p.bg) &&
      normalizeColor(promoTextColor) === normalizeColor(p.text)
    );
  };

  const activePresetKey = Object.keys(PROMO_PRESETS).find(isPresetActive);

  return (
    <div className="section-card">
      <div className="section-header">
        <h2>Promo Bar Configuration</h2>
        <PremiumToggle enabled={showPromoBar} onClick={() => setShowPromoBar(!showPromoBar)} />
      </div>
      {showPromoBar && (
        <div className="section-body">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', background: '#f6f6f7', padding: '12px 16px', borderRadius: '8px' }}>
            <div style={{ flex: 1 }}>
              <label className="input-label" style={{ marginBottom: '2px', fontWeight: '600' }}>Show Once Per Session</label>
              <small style={{ color: '#6d7175' }}>Prevent annoying your visitors by displaying the promo bar only once during their stay.</small>
            </div>
            <PremiumToggle enabled={promoOnce} onClick={() => setPromoOnce(!promoOnce)} />
          </div>

          <div style={{ marginTop: '16px' }}>
            <label className="input-label">Bar Position</label>
            <select name="promo_pos" value={promo_pos || 'top'} onChange={(e) => setPromoPos(e.currentTarget.value)} className="s-input-premium">
              <option value="top">Fixed at Top</option>
              <option value="bottom">Fixed at Bottom</option>
            </select>
          </div>
          <div style={{ marginTop: '16px' }}>
            <label className="input-label">Display Pages</label>
            <select name="promoShowOn" value={promoShowOn} onChange={(e) => setPromoShowOn(e.target.value)} className="s-input-premium">
              <option value="all">All Pages</option>
              <option value="home">Home Page Only</option>
              <option value="product">Product Pages Only</option>
            </select>
          </div>
          <RichTextEditor
            label="Text Content"
            value={promoText}
            onChange={(val) => setPromoText(val)}
          />

          <div style={{ marginTop: '16px' }}>
            <label className="input-label">Discount Code (Optional)</label>
            <input
              type="text"
              name="promoCode"
              value={promoCode}
              onInput={(e) => setPromoCode(e.currentTarget.value)}
              className="s-input-premium"
              placeholder="e.g. SAVE20 (Shows a copy button)"
            />
          </div>

          <div style={{ marginBottom: '20px', marginTop: '20px' }}>
            <label className="input-label">Quick Presets</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '12px 8px', marginTop: '8px' }}>
              {Object.keys(PROMO_PRESETS).map((key) => {
                const p = PROMO_PRESETS[key];
                const active = isPresetActive(key);
                return (
                  <div
                    key={key}
                    onClick={() => applyPromoPreset(key)}
                    style={{
                      background: p.bg,
                      color: p.text,
                      padding: '10px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: '600',
                      textAlign: 'center',
                      border: active ? '2px solid #008060' : '1px solid #d2d5d8',
                      boxShadow: active ? '0 0 0 1px #008060, 0 4px 10px rgba(0,128,96,0.15)' : '0 2px 4px rgba(0,0,0,0.05)',
                      transform: active ? 'scale(1.03)' : 'scale(1)',
                      transition: 'all 0.2s ease',
                      position: 'relative'
                    }}
                  >
                    {p.label}
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
              <label className="input-label">Bar Color</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  name="promoBgColor"
                  value={promoBgColor}
                  onInput={(e) => setPromoBgColor(e.currentTarget.value)}
                  className="s-input-premium"
                  style={{ flex: 1 }}
                />
                <input
                  type="color"
                  value={promoBgColor.startsWith('#') && promoBgColor.length === 7 ? promoBgColor : '#ffffff'}
                  onInput={(e) => setPromoBgColor(e.currentTarget.value)}
                  style={{ width: '44px', height: '40px', padding: '0', border: '1px solid #d2d5d8', borderRadius: '8px' }}
                />
              </div>
            </div>
            <div className="input-group">
              <label className="input-label">Text Color</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  name="promoTextColor"
                  value={promoTextColor}
                  onInput={(e) => setPromoTextColor(e.currentTarget.value)}
                  className="s-input-premium"
                  style={{ flex: 1 }}
                />
                <input
                  type="color"
                  value={promoTextColor.startsWith('#') && promoTextColor.length === 7 ? promoTextColor : '#ffffff'}
                  onInput={(e) => setPromoTextColor(e.currentTarget.value)}
                  style={{ width: '44px', height: '40px', padding: '0', border: '1px solid #d2d5d8', borderRadius: '8px', cursor: 'pointer' }}
                />
              </div>
            </div>
          </div>
          <div className="s-grid-2" style={{ marginTop: '20px' }}>
            <div className="input-group">
              <label className="input-label">Bar Height (px)</label>
              <input type="number" name="promoHeight" value={promoHeight} onChange={(e) => setPromoHeight(parseInt(e.currentTarget.value))} className="s-input-premium" />
            </div>
            <div className="input-group">
              <label className="input-label">Base Font Size (px)</label>
              <input type="number" name="promoFontSize" value={promoFontSize} onChange={(e) => setPromoFontSize(parseInt(e.currentTarget.value))} className="s-input-premium" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
