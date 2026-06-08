import PremiumToggle from "../PremiumToggle";

export default function ProductScarcityTab({
  showHotAlert,
  setShowHotAlert,
  labelTrending,
  setLabelTrending,
  labelViews24h,
  setLabelViews24h,
  showSoldCount,
  setShowSoldCount,
  labelItemsSold,
  setLabelItemsSold,
  showInventory,
  setShowInventory,
  inventoryThreshold,
  setInventoryThreshold,
  inventoryText,
  setInventoryText
}) {
  return (
    <>
      {/* Product Scarcity Configuration Section */}
      <div className="section-card">
        <div className="section-header">
          <h2>Product Scarcity & Social Proof</h2>
          <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#6d7175' }}>Configure inline real-time product view counters, stock indicators, and trending alerts on product detail pages.</p>
        </div>
      </div>

      {/* 24-Hour Views Section */}
      <div className="section-card">
        <div className="section-header">
          <h2>Trending Views Counter</h2>
          <PremiumToggle enabled={showHotAlert} onClick={() => setShowHotAlert(!showHotAlert)} />
          <input type="hidden" name="showHotAlert" value={showHotAlert ? "true" : "false"} />
        </div>
        {showHotAlert && (
          <div className="section-body">
            <p style={{ fontSize: '13px', color: '#6d7175', marginBottom: '16px' }}>Shows how many views a product has received in the last 24 hours.</p>
            <div className="input-group">
              <label className="input-label">Trending Label</label>
              <input type="text" name="labelTrending" value={labelTrending} onInput={(e) => setLabelTrending(e.currentTarget.value)} className="s-input-premium" placeholder="e.g. Popular Choice" />
            </div>
            <div className="input-group">
              <label className="input-label">Views Message</label>
              <input type="text" name="labelViews24h" value={labelViews24h} onInput={(e) => setLabelViews24h(e.currentTarget.value)} className="s-input-premium" placeholder="e.g. views in the last 24 hours" />
            </div>
          </div>
        )}
      </div>

      {/* Recent Sales Counter Section */}
      <div className="section-card">
        <div className="section-header">
          <h2>Recent Sales Counter</h2>
          <PremiumToggle enabled={showSoldCount} onClick={() => setShowSoldCount(!showSoldCount)} />
          <input type="hidden" name="showSoldCount" value={showSoldCount ? "true" : "false"} />
        </div>
        {showSoldCount && (
          <div className="section-body">
            <p style={{ fontSize: '13px', color: '#6d7175', marginBottom: '16px' }}>Shows total items sold for the current product in the last 24 hours.</p>
            <div className="input-group">
              <label className="input-label">Items Sold Label</label>
              <input type="text" name="labelItemsSold" value={labelItemsSold} onInput={(e) => setLabelItemsSold(e.currentTarget.value)} className="s-input-premium" placeholder="e.g. items sold in the last 24 hours" />
            </div>
          </div>
        )}
      </div>

      {/* Inventory Counter Section */}
      <div className="section-card">
        <div className="section-header">
          <h2>Inventory Counter</h2>
          <PremiumToggle enabled={showInventory} onClick={() => setShowInventory(!showInventory)} />
          <input type="hidden" name="showInventory" value={showInventory ? "true" : "false"} />
        </div>
        {showInventory && (
          <div className="section-body">
            <p style={{ fontSize: '13px', color: '#6d7175', marginBottom: '16px' }}>Shows low stock alerts when inventory falls below a threshold.</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div className="input-group">
                <label className="input-label">Stock Threshold</label>
                <input type="number" name="inventoryThreshold" value={inventoryThreshold} onInput={(e) => setInventoryThreshold(parseInt(e.currentTarget.value))} className="s-input-premium" />
              </div>
              <div className="input-group">
                <label className="input-label">Stock Message</label>
                <input type="text" name="inventoryText" value={inventoryText} onInput={(e) => setInventoryText(e.currentTarget.value)} className="s-input-premium" placeholder="Use {stock} for number" />
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
