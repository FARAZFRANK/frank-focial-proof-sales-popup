import { useState, useEffect } from "react";
import { useFetcher } from "react-router";
import PremiumToggle from "../PremiumToggle";
import RangeInput from "../RangeInput";
import { Icon } from "@shopify/polaris";
import { MagicIcon, UploadIcon, ImageIcon, SearchIcon, ChevronRightIcon } from "@shopify/polaris-icons";
import { PRESETS } from "./Constants";

export default function SalesPopupsTab({
  showSalesPopups,
  setShowSalesPopups,
  showMockData,
  logoUrl,
  setLogoUrl,
  fileInputRef,
  handleFileUpload,
  labelVerified,
  setLabelVerified,
  verifiedColor,
  setVerifiedColor,
  labelPurchased,
  setLabelPurchased,
  hideNames,
  setHideNames,
  sales_bg,
  setSalesBg,
  sales_text,
  setSalesText,
  sales_pos,
  setSalesPos,
  sales_anim,
  setSalesAnim,
  sales_radius,
  setSalesRadius,
  sales_border_color,
  setSalesBorderColor,
  sales_border_width,
  setSalesBorderWidth,
  sales_shadow,
  setSalesShadow,
  sales_font,
  setSalesFont,
  initialDelay,
  setInitialDelay,
  displayDuration,
  setDisplayDuration,
  displayGap,
  setDisplayGap,
  mockRows,
  updateMockRow,
  removeMockRow,
  addMockRow,
  generateRandomMockData,
  applyPreset,
  clearMockRows
}) {
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [mediaSearch, setMediaSearch] = useState("");
  const [mediaFiles, setMediaFiles] = useState([]);
  const [pageInfo, setPageInfo] = useState({ hasNextPage: false, endCursor: null });
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  
  const filesFetcher = useFetcher();

  const openMediaLibrary = () => {
    setIsMediaModalOpen(true);
    filesFetcher.load("/api/files");
  };

  useEffect(() => {
    if (filesFetcher.data) {
      if (isLoadingMore) {
        setMediaFiles((prev) => [...prev, ...(filesFetcher.data.files || [])]);
        setIsLoadingMore(false);
      } else {
        setMediaFiles(filesFetcher.data.files || []);
      }
      setPageInfo(filesFetcher.data.pageInfo || { hasNextPage: false, endCursor: null });
    }
  }, [filesFetcher.data]);

  const handleSearchChange = (e) => {
    const term = e.target.value;
    setMediaSearch(term);
    filesFetcher.load(`/api/files?search=${encodeURIComponent(term)}`);
  };

  const handleLoadMore = () => {
    if (pageInfo.hasNextPage && pageInfo.endCursor) {
      setIsLoadingMore(true);
      filesFetcher.load(`/api/files?after=${pageInfo.endCursor}&search=${encodeURIComponent(mediaSearch)}`);
    }
  };

  const selectImage = (url) => {
    setLogoUrl(url);
    setIsMediaModalOpen(false);
  };

  const isPresetActive = (key) => {
    const p = PRESETS[key];
    if (!p) return false;
    
    const normalizeColor = (c) => c?.toLowerCase().trim() || "";
    
    return (
      normalizeColor(sales_bg) === normalizeColor(p.bg) &&
      normalizeColor(sales_text) === normalizeColor(p.text) &&
      sales_anim === p.anim &&
      Number(sales_radius) === Number(p.radius ?? 8) &&
      sales_shadow === (p.shadow || "0 4px 12px rgba(0,0,0,0.1)")
    );
  };

  const activePresetKey = Object.keys(PRESETS).find(isPresetActive);
  return (
    <>
      <div className="section-card">
        <div className="section-header">
          <h2>Sales Popup Configuration</h2>
          <PremiumToggle enabled={showSalesPopups} onClick={() => setShowSalesPopups(!showSalesPopups)} />
          <input type="hidden" name="showSalesPopups" value={showSalesPopups ? "true" : "false"} />
        </div>
        <input type="hidden" name="showMockData" value={showMockData ? "true" : "false"} />
        {showSalesPopups && (
          <div className="section-body">
            <div style={{ marginBottom: '24px', padding: '20px', background: '#f9fafb', borderRadius: '12px', border: '1px solid #eee' }}>
              <label className="input-label" style={{ marginBottom: '12px', display: 'block' }}>Popup Logo / Icon</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '12px' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '10px', overflow: 'hidden', border: '2px solid #e1e3e5', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {logoUrl ? (
                    <img src={logoUrl} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  ) : (
                    <svg viewBox="0 0 20 20" width="28" height="28" fill="#b5b5b5"><path d="M15 11l-3-3-6 6h12v-3h-3zM4 15V5h12v3.5l1.5-1.5V4.5A1.5 1.5 0 0016 3H4a1.5 1.5 0 00-1.5 1.5v11A1.5 1.5 0 004 17h11.5v-1.5H4v-.5z"/><circle cx="7" cy="7.5" r="1.5"/></svg>
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
                    <button 
                      type="button" 
                      onClick={() => {
                        if (fileInputRef.current) {
                          fileInputRef.current.value = "";
                        }
                        fileInputRef.current.click();
                      }} 
                      className="s-btn s-btn-primary" 
                      style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}
                    >
                      <span style={{ width: '16px', height: '16px', display: 'inline-flex' }}>
                        <Icon source={UploadIcon} />
                      </span>
                      Upload from Computer
                    </button>
                    <button 
                      type="button" 
                      onClick={openMediaLibrary} 
                      className="s-btn s-btn-secondary" 
                      style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}
                    >
                      <span style={{ width: '16px', height: '16px', display: 'inline-flex' }}>
                        <Icon source={ImageIcon} />
                      </span>
                      Shopify Media Library
                    </button>
                    {logoUrl && logoUrl !== "data:image/svg+xml,%3Csvg" && (
                      <button 
                        type="button" 
                        onClick={() => setLogoUrl("")} 
                        className="s-btn s-btn-tone-critical" 
                        style={{ fontSize: '12px', padding: '6px 12px' }}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <p style={{ fontSize: '11px', color: '#666', margin: 0 }}>Select an existing file from Shopify or upload a new image from your device.</p>
                </div>
                <input type="file" ref={fileInputRef} onChange={handleFileUpload} style={{ display: 'none' }} accept="image/png,image/jpeg,image/svg+xml,image/webp,image/gif" />
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input
                  type="text"
                  placeholder="Or paste a Shopify CDN URL here..."
                  value={logoUrl}
                  onInput={(e) => setLogoUrl(e.currentTarget.value)}
                  className="s-input-premium"
                  style={{ flex: 1, fontSize: '12px' }}
                />
                <span style={{ fontSize: '10px', color: '#999', whiteSpace: 'nowrap' }}>CDN URL</span>
              </div>
              <input type="hidden" name="logoUrl" value={logoUrl} />
            </div>

            <div className="s-grid-3" style={{ marginTop: '16px' }}>
              <div className="input-group">
                <label className="input-label">Verified Label</label>
                <input type="text" name="labelVerified" value={labelVerified} onInput={(e) => setLabelVerified(e.currentTarget.value)} className="s-input-premium" />
              </div>
              <div className="input-group">
                <label className="input-label">Label Color</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    name="verifiedColor"
                    value={verifiedColor}
                    onInput={(e) => setVerifiedColor(e.currentTarget.value)}
                    className="s-input-premium"
                    style={{ flex: 1 }}
                  />
                  <input
                    type="color"
                    value={verifiedColor.startsWith('#') && verifiedColor.length === 7 ? verifiedColor : '#008060'}
                    onInput={(e) => setVerifiedColor(e.currentTarget.value)}
                    style={{ width: '44px', height: '40px', padding: '0', border: '1px solid #d2d5d8', borderRadius: '8px', cursor: 'pointer' }}
                  />
                </div>
              </div>
              <div className="input-group">
                <label className="input-label">Purchased Label</label>
                <input type="text" name="labelPurchased" value={labelPurchased} onInput={(e) => setLabelPurchased(e.currentTarget.value)} className="s-input-premium" />
              </div>
            </div>
            <div className="input-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input type="checkbox" name="hideNames" checked={hideNames} onChange={(e) => setHideNames(e.currentTarget.checked)} style={{ width: '18px', height: '18px', accentColor: '#008060' }} />
                <span style={{ fontSize: '13px', color: '#1a1a1a', fontWeight: '500' }}>Hide Customer Names (Privacy)</span>
              </label>
              <input type="hidden" name="hideNames" value={hideNames ? "true" : "false"} />
            </div>
          </div>
        )}
      </div>

      {showSalesPopups && (
        <>
          <div className="section-card">
            <div className="section-header"><h2>Sales Popup Design & Position</h2></div>
            <div className="section-body">
              <div className="input-group" style={{ marginBottom: '24px' }}>
                <label className="input-label">Quick Style Presets</label>
                <div className="preset-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '12px 8px' }}>
                  {Object.keys(PRESETS).map((key) => {
                    const active = isPresetActive(key);
                    return (
                      <div
                        key={key}
                        className="preset-card"
                        onClick={() => applyPreset(key)}
                        style={{
                          background: PRESETS[key].bg,
                          color: PRESETS[key].text,
                          border: active ? '2px solid #008060' : '1px solid #e1e3e5',
                          boxShadow: active ? '0 0 0 1px #008060, 0 4px 10px rgba(0,128,96,0.15)' : 'none',
                          transform: active ? 'scale(1.03)' : 'scale(1)',
                          transition: 'all 0.2s ease',
                          borderRadius: '8px',
                          padding: '8px',
                          fontSize: '10px',
                          textAlign: 'center',
                          cursor: 'pointer',
                          fontWeight: '700',
                          position: 'relative'
                        }}
                      >
                        {key.split('_')[0]}
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
                  <label className="input-label">Position</label>
                  <select name="sales_pos" value={sales_pos} onChange={(e) => setSalesPos(e.currentTarget.value)} className="s-input-premium">
                    <option value="bottom-left">Bottom Left</option>
                    <option value="bottom-right">Bottom Right</option>
                  </select>
                </div>
                <div className="input-group">
                  <label className="input-label">Animation</label>
                  <select name="sales_anim" value={sales_anim} onChange={(e) => setSalesAnim(e.currentTarget.value)} className="s-input-premium">
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
              </div>
              <div className="s-grid-2">
                <div className="input-group">
                  <label className="input-label">Background</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="text"
                      name="sales_bg"
                      value={sales_bg}
                      onInput={(e) => setSalesBg(e.currentTarget.value)}
                      className="s-input-premium"
                      style={{ flex: 1 }}
                    />
                    <input
                      type="color"
                      value={sales_bg.startsWith('#') && sales_bg.length === 7 ? sales_bg : '#ffffff'}
                      onInput={(e) => setSalesBg(e.currentTarget.value)}
                      style={{ width: '44px', height: '40px', padding: '0', border: '1px solid #d2d5d8', borderRadius: '8px' }}
                    />
                  </div>
                </div>
                <div className="input-group">
                  <label className="input-label">Text</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="text"
                      name="sales_text"
                      value={sales_text}
                      onInput={(e) => setSalesText(e.currentTarget.value)}
                      className="s-input-premium"
                      style={{ flex: 1 }}
                    />
                    <input
                      type="color"
                      value={sales_text.startsWith('#') && sales_text.length === 7 ? sales_text : '#000000'}
                      onInput={(e) => setSalesText(e.currentTarget.value)}
                      style={{ width: '44px', height: '40px', padding: '0', border: '1px solid #d2d5d8', borderRadius: '8px', cursor: 'pointer' }}
                    />
                  </div>
                </div>
              </div>

              <div style={{ padding: '20px', background: '#f9fafb', borderRadius: '12px', border: '1px dashed #d2d5d8' }}>
                <h3 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '16px', color: '#1a1a1a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ display: 'inline-flex', width: '20px', height: '20px', color: '#8c9196' }}>
                    <Icon source={MagicIcon} />
                  </span> Advanced Aesthetics
                </h3>
                <div className="s-grid-2">
                  <RangeInput label="Border Radius" name="sales_radius" value={sales_radius} min={0} max={50} onChange={setSalesRadius} unit="px" />
                  <RangeInput label="Border Width" name="sales_border_width" value={sales_border_width} min={0} max={10} onChange={setSalesBorderWidth} unit="px" />
                </div>
                <div className="s-grid-2">
                  <div className="input-group">
                    <label className="input-label">Font Family</label>
                    <select name="sales_font" value={sales_font} onChange={(e) => setSalesFont(e.currentTarget.value)} className="s-input-premium">
                      <option value="Inter, sans-serif">Inter (Modern)</option>
                      <option value="'Roboto', sans-serif">Roboto (Clean)</option>
                      <option value="'Montserrat', sans-serif">Montserrat (Bold)</option>
                      <option value="'Playfair Display', serif">Playfair (Elegant)</option>
                      <option value="'Courier Prime', monospace">Courier (Classic)</option>
                    </select>
                  </div>
                  <div className="input-group">
                    <label className="input-label">Box Shadow</label>
                    <select name="sales_shadow" value={sales_shadow} onChange={(e) => setSalesShadow(e.currentTarget.value)} className="s-input-premium">
                      <option value="none">None</option>
                      <option value="0 2px 8px rgba(0,0,0,0.08)">Subtle</option>
                      <option value="0 4px 12px rgba(0,0,0,0.1)">Standard (Preset)</option>
                      <option value="0 4px 12px rgba(0,0,0,0.12)">Standard (Default)</option>
                      <option value="0 4px 12px rgba(0,0,0,0.15)">Deep/Dark Preset</option>
                      <option value="0 4px 12px rgba(0,0,0,0.3)">Royal (Bold)</option>
                      <option value="0 8px 24px rgba(0,0,0,0.15)">Medium Glow (Presets)</option>
                      <option value="0 8px 24px rgba(0,0,0,0.2)">Glow (Dark/Gold)</option>
                      <option value="0 8px 24px rgba(0,0,0,0.18)">Deep</option>
                      <option value="0 12px 36px rgba(0,0,0,0.2)">Floating (Light)</option>
                      <option value="0 12px 36px rgba(0,0,0,0.25)">Floating (Deep)</option>
                    </select>
                  </div>
                </div>
                <div className="input-group" style={{ marginBottom: '20px' }}>
                  <label className="input-label">Border Color</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input type="color" value={sales_border_color.startsWith('#') && sales_border_color.length === 7 ? sales_border_color : '#e1e3e5'} onInput={(e) => setSalesBorderColor(e.currentTarget.value)} style={{ width: '44px', height: '40px', padding: '0', border: '1px solid #d2d5d8', borderRadius: '8px' }} />
                    <span style={{ fontSize: '12px', color: '#666' }}>Pick a color for the popup border</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="section-card">
            <div className="section-header"><h2>Display & Timing Settings</h2></div>
            <div className="section-body">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px' }}>
                <RangeInput label="Initial Delay" name="initialDelay" value={initialDelay} min={0} max={10000} step={100} onChange={setInitialDelay} unit="ms" />
                <RangeInput label="Duration" name="displayDuration" value={displayDuration} min={1000} max={15000} step={100} onChange={setDisplayDuration} unit="ms" />
                <RangeInput label="Display Gap" name="displayGap" value={displayGap} min={500} max={10000} step={100} onChange={setDisplayGap} unit="ms" />
              </div>
            </div>
          </div>

          <div className="section-card">
            <div className="section-header">
              <h2>Mock Data Manager</h2>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button type="button" onClick={generateRandomMockData} className="s-btn s-btn-secondary">Auto-Generate 5</button>
                <button 
                  type="button" 
                  onClick={() => {
                    if (window.confirm("Are you sure you want to delete all mockup rows? This action cannot be undone.")) {
                      clearMockRows();
                    }
                  }} 
                  className="s-btn s-btn-tone-critical"
                  disabled={mockRows.length === 0}
                >
                  Delete All Mockup
                </button>
              </div>
            </div>
            <div className="section-body">
              {mockRows.map((row, i) => (
                <div key={i} style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                  <input type="text" value={row.name} onInput={(e) => updateMockRow(i, 'name', e.currentTarget.value)} className="s-input-premium" placeholder="Visitor Name" />
                  <input type="text" value={row.city} onInput={(e) => updateMockRow(i, 'city', e.currentTarget.value)} className="s-input-premium" placeholder="City" />
                  <input type="text" value={row.product} onInput={(e) => updateMockRow(i, 'product', e.currentTarget.value)} className="s-input-premium" placeholder="Product Name" />
                  <button type="button" className="s-btn s-btn-tone-critical" style={{ padding: '0 12px', minWidth: '40px' }} onClick={() => removeMockRow(i)}>✕</button>
                </div>
              ))}
              <button type="button" onClick={addMockRow} className="s-btn s-btn-secondary">+ Add Row</button>
              <input type="hidden" name="mockData" value={JSON.stringify(mockRows)} />
            </div>
          </div>
        </>
      )}
      {/* Shopify Media Library Modal */}
      {isMediaModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.45)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px',
          animation: 'fadeIn 0.2s ease-out'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '640px',
            maxHeight: '80vh',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '20px 24px',
              borderBottom: '1px solid #e1e3e5',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#1e293b' }}>Select Image from Shopify Media Library</h3>
                <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#64748b' }}>Choose an image already uploaded to your store's files.</p>
              </div>
              <button 
                type="button" 
                onClick={() => setIsMediaModalOpen(false)}
                style={{
                  border: 'none',
                  background: 'none',
                  fontSize: '20px',
                  fontWeight: '600',
                  color: '#64748b',
                  cursor: 'pointer',
                  padding: '4px 8px',
                  borderRadius: '6px'
                }}
              >
                ✕
              </button>
            </div>

            {/* Search Bar */}
            <div style={{ padding: '16px 24px', borderBottom: '1px solid #e1e3e5', background: '#f8fafc' }}>
              <div style={{ position: 'relative' }}>
                <span style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '16px',
                  height: '16px',
                  display: 'flex',
                  color: '#64748b',
                  pointerEvents: 'none'
                }}>
                  <Icon source={SearchIcon} />
                </span>
                <input 
                  type="text"
                  placeholder="Search files by name..."
                  value={mediaSearch}
                  onChange={handleSearchChange}
                  style={{
                    width: '100%',
                    padding: '10px 12px 10px 38px',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    fontSize: '13px',
                    outline: 'none',
                    background: '#ffffff',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#008060'}
                  onBlur={(e) => e.target.style.borderColor = '#cbd5e1'}
                />
              </div>
            </div>

            {/* Modal Body / Image Grid */}
            <div style={{
              flex: 1,
              overflowY: 'auto',
              padding: '24px',
              minHeight: '240px'
            }}>
              {filesFetcher.state === "loading" && !isLoadingMore ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '200px', gap: '12px' }}>
                  <div className="spinner-loader" style={{
                    width: '32px',
                    height: '32px',
                    border: '3px solid #f3f3f3',
                    borderTop: '3px solid #008060',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }}></div>
                  <span style={{ fontSize: '13px', color: '#64748b' }}>Fetching store files...</span>
                </div>
              ) : mediaFiles.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748b' }}>
                  <p style={{ margin: '0 0 8px 0', fontWeight: '600' }}>No images found</p>
                  <p style={{ margin: 0, fontSize: '12px' }}>Try searching with a different term, or upload a new image from your computer.</p>
                </div>
              ) : (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))',
                  gap: '16px'
                }}>
                  {mediaFiles.map((file) => (
                    <div 
                      key={file.id}
                      onClick={() => selectImage(file.url)}
                      style={{
                        border: '1px solid #e2e8f0',
                        borderRadius: '10px',
                        overflow: 'hidden',
                        cursor: 'pointer',
                        background: '#ffffff',
                        transition: 'transform 0.15s, border-color 0.15s',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        position: 'relative'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.03)';
                        e.currentTarget.style.borderColor = '#008060';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'none';
                        e.currentTarget.style.borderColor = '#e2e8f0';
                      }}
                    >
                      <div style={{
                        width: '100%',
                        paddingBottom: '100%',
                        position: 'relative',
                        background: '#f8fafc',
                        borderBottom: '1px solid #f1f5f9'
                      }}>
                        <img 
                          src={file.url} 
                          alt={file.alt}
                          style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            objectFit: 'contain',
                            padding: '8px'
                          }}
                        />
                      </div>
                      <div style={{
                        padding: '8px',
                        width: '100%',
                        fontSize: '10px',
                        color: '#64748b',
                        textOverflow: 'ellipsis',
                        overflow: 'hidden',
                        whiteSpace: 'nowrap',
                        textAlign: 'center'
                      }}>
                        {file.alt || "Image"}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div style={{
              padding: '16px 24px',
              borderTop: '1px solid #e1e3e5',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: '#f8fafc'
            }}>
              <span style={{ fontSize: '12px', color: '#64748b' }}>
                Showing {mediaFiles.length} file(s)
              </span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button 
                  type="button" 
                  onClick={() => setIsMediaModalOpen(false)}
                  className="s-btn s-btn-secondary"
                  style={{ fontSize: '13px' }}
                >
                  Cancel
                </button>
                {pageInfo.hasNextPage && (
                  <button 
                    type="button" 
                    onClick={handleLoadMore}
                    disabled={filesFetcher.state === "loading"}
                    className="s-btn s-btn-primary"
                    style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    {filesFetcher.state === "loading" && isLoadingMore ? (
                      <span className="spinner-loader" style={{
                        width: '12px',
                        height: '12px',
                        border: '2px solid #ffffff',
                        borderTop: '2px solid transparent',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                        display: 'inline-block'
                      }}></span>
                    ) : (
                      <span style={{ width: '14px', height: '14px', display: 'inline-flex' }}>
                        <Icon source={ChevronRightIcon} />
                      </span>
                    )}
                    Load More
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      ` }} />
    </>
  );
}
