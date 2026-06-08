import PremiumToggle from "../PremiumToggle";

export default function TrustBadgesTab({
  showTrustBadges,
  setShowTrustBadges,
  trustStyle,
  setTrustStyle,
  trustLayout,
  setTrustLayout,
  trustAlignment,
  setTrustAlignment,
  trustBgColor,
  setTrustBgColor,
  trustTextColor,
  setTrustTextColor,
  trustIconColor,
  setTrustIconColor,
  trustBorderColor,
  setTrustBorderColor,
  trustBorderRadius,
  setTrustBorderRadius,
  trustBorderWidth,
  setTrustBorderWidth,
  trustBadgesData,
  setTrustBadgesData,
  updateTrustBadge,
  removeTrustBadge,
  addTrustBadge
}) {
  return (
    <>
      <div className="section-card">
        <div className="section-header">
          <h2>Trust Badges Configuration</h2>
          <PremiumToggle enabled={showTrustBadges} onClick={() => setShowTrustBadges(!showTrustBadges)} />
          <input type="hidden" name="showTrustBadges" value={showTrustBadges ? "true" : "false"} />
        </div>
        {showTrustBadges && (
          <div className="section-body">
            <div style={{ marginBottom: '20px' }}>
              <label className="input-label">Icon Color Theme Mode</label>
              <select name="trustStyle" value={trustStyle} onChange={(e) => setTrustStyle(e.currentTarget.value)} className="s-input-premium">
                <option value="colored">Colored Icons (Recommended)</option>
                <option value="monochrome">Monochrome / Match custom theme color</option>
              </select>
            </div>

            {/* Styling controls grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px', marginBottom: '24px', background: '#f9fafb', padding: '20px', borderRadius: '12px', border: '1px solid #eee' }}>
              <div>
                <label className="input-label">Layout Style</label>
                <select name="trustLayout" value={trustLayout} onChange={(e) => setTrustLayout(e.target.value)} className="s-input-premium">
                  <option value="grid">Grid Cards</option>
                  <option value="horizontal">Horizontal Row</option>
                  <option value="inline">Minimal Inline</option>
                </select>
              </div>
              
              <div>
                <label className="input-label">Alignment</label>
                <select name="trustAlignment" value={trustAlignment} onChange={(e) => setTrustAlignment(e.target.value)} className="s-input-premium">
                  <option value="left">Left</option>
                  <option value="center">Center</option>
                  <option value="right">Right</option>
                </select>
              </div>
              
              <div>
                <label className="input-label">Background Color</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input type="color" value={trustBgColor.startsWith('#') && trustBgColor.length === 7 ? trustBgColor : '#ffffff'} onChange={(e) => setTrustBgColor(e.target.value)} style={{ width: '40px', height: '36px', padding: '0', border: '1px solid #ddd', borderRadius: '6px', cursor: 'pointer' }} />
                  <input type="text" name="trustBgColor" value={trustBgColor} onChange={(e) => setTrustBgColor(e.target.value)} className="s-input-premium" style={{ flex: 1 }} />
                </div>
              </div>

              <div>
                <label className="input-label">Text Color</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input type="color" value={trustTextColor.startsWith('#') && trustTextColor.length === 7 ? trustTextColor : '#1a1a1a'} onChange={(e) => setTrustTextColor(e.target.value)} style={{ width: '40px', height: '36px', padding: '0', border: '1px solid #ddd', borderRadius: '6px', cursor: 'pointer' }} />
                  <input type="text" name="trustTextColor" value={trustTextColor} onChange={(e) => setTrustTextColor(e.target.value)} className="s-input-premium" style={{ flex: 1 }} />
                </div>
              </div>

              <div>
                <label className="input-label">Icon Color (For Monochrome Mode)</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input type="color" value={trustIconColor.startsWith('#') && trustIconColor.length === 7 ? trustIconColor : '#2563eb'} onChange={(e) => setTrustIconColor(e.target.value)} style={{ width: '40px', height: '36px', padding: '0', border: '1px solid #ddd', borderRadius: '6px', cursor: 'pointer' }} />
                  <input type="text" name="trustIconColor" value={trustIconColor} onChange={(e) => setTrustIconColor(e.target.value)} className="s-input-premium" style={{ flex: 1 }} />
                </div>
              </div>

              <div>
                <label className="input-label">Border Color</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input type="color" value={trustBorderColor.startsWith('#') && trustBorderColor.length === 7 ? trustBorderColor : '#e1e3e5'} onChange={(e) => setTrustBorderColor(e.target.value)} style={{ width: '40px', height: '36px', padding: '0', border: '1px solid #ddd', borderRadius: '6px', cursor: 'pointer' }} />
                  <input type="text" name="trustBorderColor" value={trustBorderColor} onChange={(e) => setTrustBorderColor(e.target.value)} className="s-input-premium" style={{ flex: 1 }} />
                </div>
              </div>

              <div>
                <label className="input-label">Border Radius: {trustBorderRadius}px</label>
                <input type="range" name="trustBorderRadius" min="0" max="30" value={trustBorderRadius} onChange={(e) => setTrustBorderRadius(parseInt(e.target.value))} style={{ width: '100%', accentColor: '#008060' }} />
              </div>

              <div>
                <label className="input-label">Border Width: {trustBorderWidth}px</label>
                <input type="range" name="trustBorderWidth" min="0" max="5" value={trustBorderWidth} onChange={(e) => setTrustBorderWidth(parseInt(e.target.value))} style={{ width: '100%', accentColor: '#008060' }} />
              </div>
            </div>

            <div className="badges-list">
              <label className="input-label">Badges</label>
              {trustBadgesData.map((badge, i) => (
                <div key={i} style={{ display: 'flex', gap: '10px', marginBottom: '12px', alignItems: 'center', background: '#f9fafb', padding: '12px', borderRadius: '8px', border: '1px solid #eee' }}>
                  <select
                    value={badge.icon}
                    onChange={(e) => updateTrustBadge(i, 'icon', e.target.value)}
                    className="s-input-premium"
                    style={{ width: '160px' }}
                  >
                    <option value="truck">Truck 🚚</option>
                    <option value="shield">Shield 🛡️</option>
                    <option value="star">Star ⭐</option>
                    <option value="lock">Lock 🔒</option>
                    <option value="refresh">Return 🔄</option>
                    <option value="credit-card">Credit Card 💳</option>
                    <option value="headset">Support 🎧</option>
                    <option value="award">Award 🏆</option>
                    <option value="heart">Heart 💖</option>
                    <option value="thumbs-up">Thumbs Up 👍</option>
                  </select>
                  <input
                    type="text"
                    value={badge.text}
                    onInput={(e) => updateTrustBadge(i, 'text', e.currentTarget.value)}
                    className="s-input-premium"
                    style={{ flex: 1 }}
                  />
                  <s-button tone="critical" onClick={() => removeTrustBadge(i)}>✕</s-button>
                </div>
              ))}
              <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
                <s-button onClick={addTrustBadge} variant="secondary">+ Add Badge</s-button>
                <s-button onClick={() => setTrustBadgesData([
                  { icon: 'truck', text: 'Free Express Shipping' },
                  { icon: 'shield', text: '100% Secure Checkout' },
                  { icon: 'refresh', text: '30-Day Money Back Guarantee' },
                  { icon: 'lock', text: 'SSL Encrypted Connection' }
                ])} variant="primary">Auto Generate Professional Badges</s-button>
              </div>
              <input type="hidden" name="trustBadgesData" value={JSON.stringify(trustBadgesData)} />
            </div>
          </div>
        )}
      </div>
    </>
  );
}
