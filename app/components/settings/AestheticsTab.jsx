import PremiumToggle from "../PremiumToggle";

export default function AestheticsTab({
  showOnMobile,
  setShowOnMobile,
  showOnDesktop,
  setShowOnDesktop
}) {
  return (
    <>
      <div className="section-card">
        <div className="section-header"><h2>Device Visibility</h2></div>
        <div className="section-body">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', background: '#f9fafb', borderRadius: '12px' }}>
              <div>
                <p style={{ margin: 0, fontWeight: '700' }}>Show on Mobile</p>
                <p style={{ margin: 0, fontSize: '12px', color: '#666' }}>Toggle visibility for phone users</p>
              </div>
              <PremiumToggle enabled={showOnMobile} onClick={() => setShowOnMobile(!showOnMobile)} />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', background: '#f9fafb', borderRadius: '12px' }}>
              <div>
                <p style={{ margin: 0, fontWeight: '700' }}>Show on Desktop</p>
                <p style={{ margin: 0, fontSize: '12px', color: '#666' }}>Toggle visibility for desktop users</p>
              </div>
              <PremiumToggle enabled={showOnDesktop} onClick={() => setShowOnDesktop(!showOnDesktop)} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
