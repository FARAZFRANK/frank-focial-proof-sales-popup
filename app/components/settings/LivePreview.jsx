import { Icon } from "@shopify/polaris";
import { ChartPopularIcon, CartIcon, PackageIcon, GiftCardIcon } from "@shopify/polaris-icons";

export default function LivePreview({
  activeTab,
  isEnabled,
  showSalesPopups,
  showVisitorCount,
  showInventory,
  showHotAlert,
  showSoldCount,
  showPromoBar,
  showCartTimer,
  showExitPopup,
  showTrustBadges,
  animationKey,
  sales_anim,
  sales_bg,
  sales_text,
  sales_border_width,
  sales_border_color,
  sales_radius,
  sales_shadow,
  sales_font,
  logoUrl,
  hideNames,
  mockRows,
  labelPurchased,
  labelVerified,
  verifiedColor,
  counter_anim,
  counter_bg,
  counter_text,
  counter_border_width,
  counter_border_color,
  counter_radius,
  counter_shadow,
  counter_font,
  counterPulse,
  maxVisitors,
  labelVisitors,
  labelViews24h,
  labelItemsSold,
  inventoryText,
  promoBgColor,
  promoTextColor,
  promoText,
  promoCode,
  cart_pos,
  cart_bg,
  cart_text,
  cart_border_width,
  cart_border_color,
  cart_shadow,
  cart_font,
  cartTimerText,
  previewTimerSeconds,
  cart_show_progress,
  cartTimerMins,
  cart_radius,
  exit_bg,
  exit_text,
  exitText,
  exitBorderRadius,
  exitTitle,
  showExitEmailInput,
  exitBtnBgColor,
  exitBtnTextColor,
  exitButtonText,
  showAnnounce,
  showEmailInput,
  announceText,
  announce_bg,
  announce_text,
  announceBorderRadius,
  announceImage,
  announceTitle,
  announceButtonText,
  announceBtnBgColor,
  announceBtnTextColor,
  trustAlignment,
  trustLayout,
  trustBadgesData,
  trustTextColor,
  trustBgColor,
  trustBorderWidth,
  trustBorderColor,
  trustBorderRadius,
  trustStyle,
  trustIconColor,
  subscribers
}) {
  if (!isEnabled) return null;

  let isVisible = false;
  if (activeTab === 'sales-popups') isVisible = showSalesPopups;
  else if (activeTab === 'counters') isVisible = showVisitorCount;
  else if (activeTab === 'product-scarcity') isVisible = showInventory || showHotAlert || showSoldCount;
  else if (activeTab === 'promo-bar') isVisible = showPromoBar;
  else if (activeTab === 'cart-timer') isVisible = showCartTimer;
  else if (activeTab === 'announcement') isVisible = showAnnounce;
  else if (activeTab === 'exit-popup') isVisible = showExitPopup;
  else if (activeTab === 'trust-badges') isVisible = showTrustBadges;
  else if (['aesthetics', 'subscribers'].includes(activeTab)) isVisible = true;

  const getPreviewIcon = (iconName, themeMode, customColor) => {
    const colors = {
      'truck': '#f59e0b',
      'shield': '#2563eb',
      'star': '#fbbf24',
      'lock': '#10b981',
      'refresh': '#8b5cf6',
      'credit-card': '#6366f1',
      'headset': '#0d9488',
      'award': '#f43f5e',
      'heart': '#ef4444',
      'thumbs-up': '#3b82f6'
    };

    const color = themeMode === 'monochrome' ? (customColor || '#1a1a1a') : (colors[iconName] || '#2563eb');

    switch (iconName) {
      case 'truck':
        return <svg viewBox="0 0 20 20" fill={color} width="20" height="20"><path d="M2 4.5A1.5 1.5 0 013.5 3h9a1.5 1.5 0 011.5 1.5V5h2.75a.75.75 0 01.75.75v7a.75.75 0 01-.75.75h-.35a2.5 2.5 0 01-4.8 0h-3.4a2.5 2.5 0 01-4.8 0H2.75A.75.75 0 012 12.75V4.5zm12.5 4.5V6H14v3h.5zM4.5 13a1 1 0 100-2 1 1 0 000 2zm11 0a1 1 0 100-2 1 1 0 000 2z" /></svg>;
      case 'shield':
        return <svg viewBox="0 0 20 20" fill={color} width="20" height="20"><path fillRule="evenodd" d="M10 1.944A11.94 11.94 0 012.166 5c.136 5.227 2.186 9.49 7.834 13.056 5.648-3.565 7.698-7.829 7.834-13.056A11.942 11.942 0 0110 1.944zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z" clipRule="evenodd" /></svg>;
      case 'star':
        return <svg viewBox="0 0 20 20" fill={color} width="20" height="20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>;
      case 'lock':
        return <svg viewBox="0 0 20 20" fill={color} width="20" height="20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>;
      case 'refresh':
        return <svg viewBox="0 0 20 20" fill={color} width="20" height="20"><path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" /></svg>;
      case 'credit-card':
        return <svg viewBox="0 0 20 20" fill={color} width="20" height="20"><path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4zM18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM5 12a1 1 0 110-2 1 1 0 010 2zm3-1a1 1 0 100 2h3a1 1 0 100-2H8z" /></svg>;
      case 'headset':
        return <svg viewBox="0 0 20 20" fill={color} width="20" height="20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-2 0c0-2.2-1.8-4-4-4H8a4 4 0 00-4 4v1a2 2 0 002 2h1a2 2 0 002-2V9a2 2 0 00-2-2H6.5c.3-1.4 1.5-2.5 3-2.5s2.7 1.1 3 2.5H12a2 2 0 00-2 2v2a2 2 0 002 2h1a2 2 0 002-2v-1z" clipRule="evenodd" /></svg>;
      case 'award':
        return <svg viewBox="0 0 20 20" fill={color} width="20" height="20"><path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16zm-1-5.414l3.707-3.707a1 1 0 0 0-1.414-1.414L9 10.586l-1.293-1.293a1 1 0 0 0-1.414 1.414L9 12.586z" clipRule="evenodd" /></svg>;
      case 'heart':
        return <svg viewBox="0 0 20 20" fill={color} width="20" height="20"><path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" /></svg>;
      case 'thumbs-up':
        return <svg viewBox="0 0 20 20" fill={color} width="20" height="20"><path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 8.4a2 2 0 00-.8 1.933z" /></svg>;
      default:
        return null;
    }
  };

  return (
    <aside className="preview-sidebar">
      <div className="section-card" style={{ position: 'sticky', top: '24px' }}>
        <div className="section-header">
          <h2>Live Preview</h2>
          {isVisible && <div style={{ fontSize: '10px', padding: '4px 8px', background: '#e1f5fe', color: '#01579b', borderRadius: '4px', fontWeight: 'bold' }}>REAL-TIME</div>}
        </div>
        <div className="section-body" style={{ background: '#f4f6f8', minHeight: '320px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>

          {!isVisible ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <div style={{ background: '#dfe3e8', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <svg viewBox="0 0 20 20" width="32" height="32" fill="#8c9196"><path d="M7 6.25a.75.75 0 0 1 .75.75v6a.75.75 0 0 1-1.5 0v-6a.75.75 0 0 1 .75-.75Zm6 0a.75.75 0 0 1 .75.75v6a.75.75 0 0 1-1.5 0v-6a.75.75 0 0 1 .75-.75Z" /></svg>
              </div>
              <p style={{ color: '#6d7175', fontSize: '14px', fontWeight: '600' }}>Feature is Disabled</p>
              <p style={{ color: '#8c9196', fontSize: '12px', marginTop: '4px' }}>Turn it on to see the live preview here.</p>
            </div>
          ) : (
            <>
              {/* Dynamic Preview Logic */}
              {activeTab === 'sales-popups' && (
                <div key={animationKey} className={`preview-bubble anim-preview-${sales_anim}`} style={{
                  background: sales_bg,
                  color: sales_text,
                  border: `${sales_border_width}px solid ${sales_border_color}`,
                  borderRadius: `${sales_radius}px`,
                  boxShadow: sales_shadow === 'none' ? 'none' : sales_shadow,
                  fontFamily: sales_font,
                  width: '100%',
                  position: 'relative',
                  padding: '14px 24px',
                  gap: '14px'
                }}>
                  {/* Replicating storefront close button */}
                  <div style={{
                    position: 'absolute', top: '-8px', right: '-8px', width: '22px', height: '22px',
                    background: '#ef4444', color: 'white', border: '2px solid white', borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px',
                    fontWeight: 'bold', boxShadow: '0 2px 6px rgba(0,0,0,0.2)', zIndex: 10
                  }}>&times;</div>

                  <div style={{
                    width: '52px',
                    height: '52px',
                    borderRadius: '10px',
                    overflow: 'hidden',
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1
                  }}>
                    <img src={logoUrl || 'https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-product-1_large.png'} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} alt="" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, fontSize: '13px', fontWeight: '700', fontFamily: 'inherit', lineHeight: '1.2' }}>{hideNames ? "Someone" : (mockRows[0]?.name || "John")} from {mockRows[0]?.city || "New York"}</p>
                    <p style={{ margin: '2px 0 0 0', fontSize: '11px', opacity: 0.9, fontFamily: 'inherit', lineHeight: '1.2' }}>{labelPurchased} {mockRows[0]?.product || "Product"}</p>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '8px', paddingTop: '8px', borderTop: '1px solid rgba(0,0,0,0.06)' }}>
                      {labelVerified ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px', fontWeight: '600', color: verifiedColor }}>
                          <svg width="10" height="10" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16zm-1-5.414l3.707-3.707a1 1 0 0 0-1.414-1.414L9 10.586l-1.293-1.293a1 1 0 0 0-1.414 1.414L9 12.586z" clipRule="evenodd" /></svg>
                          <span>{labelVerified}</span>
                        </div>
                      ) : (
                        <div></div>
                      )}
                      <span style={{ fontSize: '9px', opacity: 0.6 }}>1h ago</span>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'counters' && (
                <div key={animationKey} style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
                  {showVisitorCount ? (
                    <div className={`preview-bubble anim-preview-${counter_anim}`} style={{ 
                      background: counter_bg, 
                      color: counter_text, 
                      border: `${counter_border_width}px solid ${counter_border_color}`, 
                      width: 'fit-content',
                      margin: '0 auto',
                      padding: '10px 24px',
                      borderRadius: `${counter_radius}px`,
                      boxShadow: counter_shadow === 'none' ? 'none' : counter_shadow,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      fontFamily: counter_font
                    }}>
                      <div className="social-proof-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: 'inherit' }}>
                        {counterPulse ? (
                          <span className="pulse-dot"></span>
                        ) : (
                          <svg viewBox="0 0 20 20" fill="currentColor" width="20" height="20"><path d="M10 4C5.5 4 2 10 2 10C2 10 5.5 16 10 16C14.5 16 18 10 18 10C18 10 14.5 4 10 4ZM10 14C7.79 14 6 12.21 6 10C6 7.79 7.79 6 10 6C12.21 6 14 7.79 14 10C14 12.21 12.21 14 10 14ZM10 8C8.9 8 8 8.9 8 10C8 11.1 8.9 12 10 12C11.1 12 12 11.1 12 10C12 8.9 11.1 8 10 8Z"/></svg>
                        )}
                      </div>
                      <p style={{ margin: 0, fontSize: '15px', fontWeight: '700', fontFamily: 'inherit' }}>{maxVisitors} {labelVisitors}</p>
                    </div>
                   ) : (
                    <div style={{ textAlign: 'center', color: '#8c9196', fontSize: '12px' }}>Enable visitor count to see preview</div>
                   )}
                </div>
              )}

              {activeTab === 'product-scarcity' && (
                <div key={animationKey} style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '12px',
                  width: '100%',
                  padding: '12px 16px',
                  background: '#ffffff',
                  border: '1px solid #e1e3e5',
                  borderRadius: '8px',
                  fontSize: '13px',
                  color: '#374151',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                  fontFamily: 'Inter, sans-serif'
                }}>
                  {(() => {
                    const items = [];
                    if (showHotAlert) {
                      items.push(
                        <span key="hot" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ display: 'inline-flex', color: '#f97316', width: '18px', height: '18px' }}>
                            <Icon source={ChartPopularIcon} />
                          </span>
                          <span style={{ fontWeight: '600' }}>124 {labelViews24h}</span>
                        </span>
                      );
                    }
                    if (showSoldCount) {
                      items.push(
                        <span key="sold" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ display: 'inline-flex', color: '#3b82f6', width: '18px', height: '18px' }}>
                            <Icon source={CartIcon} />
                          </span>
                          <span style={{ fontWeight: '600' }}>8 {labelItemsSold}</span>
                        </span>
                      );
                    }
                    if (showInventory) {
                      items.push(
                        <span key="inv" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ display: 'inline-flex', color: '#ef4444', width: '18px', height: '18px' }}>
                            <Icon source={PackageIcon} />
                          </span>
                          <span style={{ fontWeight: '700', color: '#ef4444' }}>{inventoryText.replace('{stock}', '5')}</span>
                        </span>
                      );
                    }

                    if (items.length === 0) {
                      return <div style={{ textAlign: 'center', color: '#8c9196', fontSize: '12px' }}>Enable a widget to see preview</div>;
                    }

                    const elements = [];
                    items.forEach((item, index) => {
                      elements.push(item);
                      if (index < items.length - 1) {
                        elements.push(<span key={`div-${index}`} style={{ color: '#d1d5db', userSelect: 'none' }}>|</span>);
                      }
                    });
                    return elements;
                  })()}
                </div>
              )}

              {activeTab === 'promo-bar' && (
                <div className="promo-preview-container" style={{
                  width: '100%',
                  background: promoBgColor,
                  color: promoTextColor,
                  padding: '10px 40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '8px',
                  textAlign: 'center',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                  position: 'relative'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', flexWrap: 'nowrap', width: '100%' }}>
                    <div dangerouslySetInnerHTML={{ __html: promoText }} style={{ whiteSpace: 'nowrap' }} />
                    
                    {promoCode && (
                      <div className="promo-code-container" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(0,0,0,0.1)', padding: '4px 12px', borderRadius: '4px', border: '1px dashed rgba(255,255,255,0.4)', flexShrink: 0 }}>
                        <span className="promo-code-text" style={{ fontWeight: 'bold', fontFamily: 'monospace', letterSpacing: '1px' }}>{promoCode}</span>
                        <button style={{ background: 'white', color: '#333', border: 'none', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', cursor: 'pointer', fontWeight: 'bold', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', flexShrink: 0 }}>Copy</button>
                      </div>
                    )}
                  </div>
                  
                  <button style={{ position: 'absolute', right: '15px', background: 'none', border: 'none', color: 'inherit', fontSize: '24px', cursor: 'pointer', padding: 0, lineHeight: 1, opacity: 0.8 }}>&times;</button>
                </div>
              )}

              {activeTab === 'cart-timer' && (
                (() => {
                  const isBar = cart_pos === 'top-bar' || cart_pos === 'bottom-bar';
                  if (isBar) {
                    return (
                      <div className="promo-preview-container" style={{
                        width: '100%',
                        background: cart_bg,
                        color: cart_text,
                        border: `${cart_border_width}px solid ${cart_border_color}`,
                        padding: '12px 24px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '8px',
                        textAlign: 'center',
                        boxShadow: cart_shadow === 'none' ? 'none' : cart_shadow,
                        fontFamily: cart_font,
                        position: 'relative'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', flexWrap: 'nowrap', width: '100%', fontWeight: '700' }}>
                          <svg viewBox="0 0 20 20" fill="currentColor" width="18" height="18" style={{ color: 'inherit' }}><path d="M10 2a8 8 0 100 16 8 8 0 000-16zm0 14.5a6.5 6.5 0 110-13 6.5 6.5 0 010 13zM10.5 6h-1v5l3.5 2.1.5-.8-3-1.8V6z"/></svg>
                          <span>{cartTimerText}</span>
                          <span style={{ fontSize: '20px', fontWeight: '900', fontFamily: 'monospace', letterSpacing: '1px', marginLeft: '4px' }}>
                            {Math.floor(previewTimerSeconds / 60).toString().padStart(2, '0')}:{(previewTimerSeconds % 60).toString().padStart(2, '0')}
                          </span>
                        </div>
                        {cart_show_progress && (
                          <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '3px', background: 'rgba(0,0,0,0.08)' }}>
                            <div style={{ 
                              width: `${(previewTimerSeconds / ((cartTimerMins || 10) * 60)) * 100}%`, 
                              height: '100%', 
                              background: cart_border_color, 
                              transition: 'width 1s linear' 
                            }}></div>
                          </div>
                        )}
                      </div>
                    );
                  } else {
                    return (
                      <div className="preview-bubble" style={{ 
                          background: cart_bg, 
                          color: cart_text, 
                          border: `${cart_border_width}px solid ${cart_border_color}`, 
                          borderRadius: `${cart_radius}px`,
                          boxShadow: cart_shadow === 'none' ? 'none' : cart_shadow,
                          fontFamily: cart_font,
                          width: '100%', 
                          padding: '12px 16px',
                          overflow: 'hidden',
                          boxSizing: 'border-box',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '12px'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%', textAlign: 'left' }}>
                          <div className="social-proof-icon" style={{
                            background: cart_bg === '#000000' || cart_bg === '#1f2937' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                            padding: '8px',
                            borderRadius: '10px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'inherit',
                            flexShrink: 0
                          }}>
                            <svg viewBox="0 0 20 20" fill="currentColor" width="20" height="20" style={{ fill: 'currentColor' }}>
                              <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm0 14.5a6.5 6.5 0 110-13 6.5 6.5 0 010 13zM10.5 6h-1v5l3.5 2.1.5-.8-3-1.8V6z"/>
                            </svg>
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '12px', fontWeight: '600', opacity: 0.85, marginBottom: '2px', color: 'inherit' }}>{cartTimerText}</div>
                            <div style={{ fontSize: '24px', fontWeight: '900', fontFamily: 'monospace', letterSpacing: '1px', lineHeight: 1, color: 'inherit' }}>
                              {Math.floor(previewTimerSeconds / 60).toString().padStart(2, '0')}:{(previewTimerSeconds % 60).toString().padStart(2, '0')}
                            </div>
                          </div>
                        </div>
                        {cart_show_progress && (
                          <div style={{ width: '100%', height: '5px', background: 'rgba(0,0,0,0.08)', borderRadius: '3px', overflow: 'hidden' }}>
                            <div style={{ 
                              width: `${(previewTimerSeconds / ((cartTimerMins || 10) * 60)) * 100}%`, 
                              height: '100%', 
                              background: cart_border_color, 
                              borderRadius: '3px', 
                              transition: 'width 1s linear' 
                            }}></div>
                          </div>
                        )}
                      </div>
                    );
                  }
                })()
              )}

              {activeTab === 'exit-popup' && (
                <div className="preview-bubble" style={{ 
                  background: exit_bg, 
                  color: exit_text, 
                  border: 'none', 
                  width: '100%', 
                  flexDirection: 'column', 
                  textAlign: 'center', 
                  padding: '24px', 
                  borderRadius: `${exitBorderRadius}px`,
                  boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
                  overflow: 'hidden',
                  fontFamily: 'Inter, sans-serif'
                }}>
                  <h3 style={{ margin: '0 0 12px 0', fontSize: '20px', fontWeight: '800', color: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                    <span>{exitTitle}</span>
                    <span style={{ display: 'inline-flex', width: '20px', height: '20px', color: '#f97316' }}>
                      <Icon source={GiftCardIcon} />
                    </span>
                  </h3>
                  <div dangerouslySetInnerHTML={{ __html: exitText }} style={{ margin: '0 0 20px 0', fontSize: '14px', opacity: 0.85, lineHeight: '1.4', color: 'inherit' }} />
                  
                  {showExitEmailInput ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
                      <input type="email" placeholder="Enter your email" disabled style={{ padding: '10px 12px', border: '1px solid #d2d5d8', borderRadius: '8px', fontSize: '13px', width: '100%', boxSizing: 'border-box', background: '#fff' }} />
                      <button type="button" style={{ background: exitBtnBgColor, color: exitBtnTextColor, border: 'none', padding: '10px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: '700', cursor: 'default', width: '100%' }}>Subscribe</button>
                    </div>
                  ) : (
                    <button style={{ 
                      width: '100%', 
                      padding: '12px', 
                      background: exitBtnBgColor, 
                      color: exitBtnTextColor, 
                      border: 'none', 
                      borderRadius: '8px', 
                      fontWeight: 'bold', 
                      fontSize: '14px',
                      cursor: 'default',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px'
                    }}>
                      <span>{exitButtonText || "Stay with us!"}</span>
                      <span style={{ display: 'inline-flex', width: '16px', height: '16px', color: 'inherit' }}>
                        <Icon source={GiftCardIcon} />
                      </span>
                    </button>
                  )}
                </div>
              )}

              {activeTab === 'announcement' && (
                <div className="preview-bubble" style={{
                  background: announce_bg,
                  color: announce_text,
                  border: 'none',
                  width: '100%',
                  flexDirection: 'column',
                  textAlign: 'center',
                  padding: 0,
                  borderRadius: `${announceBorderRadius}px`,
                  overflow: 'hidden',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                }}>
                  {announceImage && (
                    <img src={announceImage} style={{ width: '100%', height: '120px', objectFit: 'cover', display: 'block' }} alt="Announcement banner" />
                  )}
                  <div style={{ padding: '24px' }}>
                    <h3 style={{ margin: '0 0 12px 0', fontSize: '18px', fontWeight: '700', color: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                      <span>{announceTitle || "Announcement Title"}</span>
                      <span style={{ display: 'inline-flex', width: '18px', height: '18px', color: '#f97316' }}>
                        <Icon source={GiftCardIcon} />
                      </span>
                    </h3>
                    <div dangerouslySetInnerHTML={{ __html: announceText || "Announcement body text goes here..." }} style={{ fontSize: '13px', opacity: 0.9, marginBottom: '20px', lineHeight: '1.4', color: 'inherit' }} />
                    
                    {showEmailInput ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '16px' }}>
                        <input type="email" placeholder="Enter your email address" disabled style={{ padding: '10px 12px', border: '1px solid #d2d5d8', borderRadius: '8px', fontSize: '13px', width: '100%', boxSizing: 'border-box', background: '#fff' }} />
                        <button type="button" style={{ background: announceBtnBgColor, color: announceBtnTextColor, border: 'none', padding: '10px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: '700', cursor: 'default', width: '100%' }}>Subscribe</button>
                      </div>
                    ) : (
                      announceButtonText && (
                        <button type="button" style={{ background: announceBtnBgColor, color: announceBtnTextColor, border: 'none', padding: '10px 20px', borderRadius: '8px', fontSize: '13px', fontWeight: '700', cursor: 'default', width: '100%', marginTop: '16px' }}>{announceButtonText}</button>
                      )
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'trust-badges' && (
                <div style={{ 
                  width: '100%', 
                  display: 'flex', 
                  flexWrap: 'wrap', 
                  gap: '10px', 
                  justifyContent: trustAlignment === 'center' ? 'center' : (trustAlignment === 'right' ? 'flex-end' : 'flex-start'),
                  flexDirection: trustLayout === 'horizontal' ? 'row' : 'row'
                }}>
                  {trustBadgesData.map((badge, i) => {
                    const isInline = trustLayout === 'inline';
                    return (
                      <div key={i} style={isInline ? {
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '13px',
                        fontWeight: '800',
                        color: trustTextColor
                      } : {
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '10px 16px',
                        background: trustBgColor,
                        border: `${trustBorderWidth}px solid ${trustBorderColor}`,
                        borderRadius: `${trustBorderRadius}px`,
                        fontSize: '13px',
                        fontWeight: '800',
                        color: trustTextColor,
                        boxShadow: '0 2px 5px rgba(0,0,0,0.02)'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          {getPreviewIcon(badge.icon, trustStyle, trustIconColor)}
                        </div>
                        <span style={{ verticalAlign: 'middle' }}>{badge.text}</span>
                      </div>
                    );
                  })}
                </div>
              )}

              {activeTab === 'subscribers' && (
                <div style={{ width: '100%', padding: '20px', background: '#fff', borderRadius: '12px', border: '1px solid #e1e3e5', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#e0f2fe', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center' }}>
                      <svg viewBox="0 0 20 20" width="20" fill="#0369a1"><path d="M3 5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.22l-2.43 2.13a.5.5 0 0 1-.7 0l-2.43-2.13H5a2 2 0 0 1-2-2V5Zm2 .5a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 .5.5v8a.5.5 0 0 1-.5.5h-2.5a.5.5 0 0 0-.33.13l-1.67 1.46-1.67-1.46a.5.5 0 0 0-.33-.13H5.5a.5.5 0 0 1-.5-.5v-8Z" /></svg>
                    </div>
                    <div>
                      <p style={{ margin: 0, fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#8c9196', fontWeight: 'bold' }}>Lead Capture Status</p>
                      <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: '#202223' }}>Newsletter Growth</h3>
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div style={{ background: '#f4f6f8', padding: '12px', borderRadius: '8px', textAlign: 'center' }}>
                      <p style={{ margin: 0, fontSize: '20px', fontWeight: '800', color: '#008060' }}>{subscribers?.length || 0}</p>
                      <p style={{ margin: '2px 0 0 0', fontSize: '10px', color: '#6d7175', fontWeight: '600' }}>Active Leads</p>
                    </div>
                    <div style={{ background: '#f4f6f8', padding: '12px', borderRadius: '8px', textAlign: 'center' }}>
                      <p style={{ margin: 0, fontSize: '20px', fontWeight: '800', color: '#202223' }}>100%</p>
                      <p style={{ margin: '2px 0 0 0', fontSize: '10px', color: '#6d7175', fontWeight: '600' }}>Delivery Rate</p>
                    </div>
                  </div>
                  <div style={{ marginTop: '16px', padding: '10px 14px', background: '#e6f4ea', border: '1px solid #c2e7d9', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ color: '#137333', display: 'flex', alignItems: 'center' }}>
                      <svg viewBox="0 0 20 20" width="16" fill="currentColor"><path fillRule="evenodd" d="M16.403 4.57a.75.75 0 01.127 1.053l-7 9a.75.75 0 01-1.128.05l-3.5-4a.75.75 0 111.104-1.023l2.892 3.305 6.452-8.295a.75.75 0 011.053-.127z" clipRule="evenodd" /></svg>
                    </div>
                    <p style={{ margin: 0, fontSize: '12px', color: '#137333', fontWeight: '600' }}>Proxy Integrations Active</p>
                  </div>
                </div>
              )}
            </>
          )}

          <p style={{ marginTop: '32px', fontSize: '11px', color: '#8c9196', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '700' }}>
            Preview: {activeTab.replace('-', ' ')}
          </p>
        </div>
      </div>
    </aside>
  );
}
