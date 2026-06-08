import PremiumToggle from "../PremiumToggle";
import RichTextEditor from "../RichTextEditor";

export default function AnnouncementTab({
  showAnnounce,
  setShowAnnounce,
  announceOnce,
  setAnnounceOnce,
  announceTitle,
  setAnnounceTitle,
  announceText,
  setAnnounceText,
  announceImage,
  setAnnounceImage,
  showEmailInput,
  setShowEmailInput,
  announceSuccessMessage,
  setAnnounceSuccessMessage,
  announceButtonText,
  setAnnounceButtonText,
  announceButtonLink,
  setAnnounceButtonLink,
  announceBtnBgColor,
  setAnnounceBtnBgColor,
  announceBtnTextColor,
  setAnnounceBtnTextColor,
  announceTrigger,
  setAnnounceTrigger,
  announceDelay,
  setAnnounceDelay,
  announce_pos,
  setAnnouncePos,
  announceWidth,
  setAnnounceWidth,
  announce_bg,
  setAnnounceBg,
  announce_text,
  setAnnounceTextState,
  announceBorderRadius,
  setAnnounceBorderRadius,
  announceBackdropBlur,
  setAnnounceBackdropBlur
}) {
  return (
    <>
      {/* Card 1: Core Content */}
      <div className="section-card">
        <div className="section-header">
          <h2>Announcement Configuration</h2>
          <PremiumToggle enabled={showAnnounce} onClick={() => setShowAnnounce(!showAnnounce)} />
          <input type="hidden" name="showAnnounce" value={showAnnounce ? "true" : "false"} />
        </div>
        {showAnnounce && (
          <div className="section-body" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f6f6f7', padding: '12px 16px', borderRadius: '8px' }}>
              <div style={{ flex: 1 }}>
                <label className="input-label" style={{ marginBottom: '2px', fontWeight: '600' }}>Show Once Per Session</label>
                <small style={{ color: '#6d7175' }}>Prevent annoying your visitors by displaying the popup only once during their stay.</small>
              </div>
              <PremiumToggle enabled={announceOnce} onClick={() => setAnnounceOnce(!announceOnce)} />
            </div>

            <div>
              <label className="input-label">Announcement Title</label>
              <input type="text" name="announceTitle" value={announceTitle} onInput={(e) => setAnnounceTitle(e.currentTarget.value)} className="s-input-premium" placeholder="e.g. Special Offer!" />
            </div>
            <RichTextEditor
              label="Body Content"
              value={announceText}
              onChange={(val) => setAnnounceText(val)}
            />
            <input type="hidden" name="announceText" value={announceText} />
            <div>
              <label className="input-label">Hero Image URL (Optional)</label>
              <input type="text" name="announceImage" value={announceImage} onInput={(e) => setAnnounceImage(e.currentTarget.value)} className="s-input-premium" placeholder="e.g. https://example.com/hero.jpg" />
              <small style={{ color: '#6d7175', marginTop: '4px', display: 'block' }}>Display a beautiful banner image inside your popup modal.</small>
            </div>
          </div>
        )}
      </div>

      {/* Card 2: Newsletter & Lead Capture */}
      {showAnnounce && (
        <div className="section-card">
          <div className="section-header">
            <div>
              <h2>Newsletter & Lead Capture</h2>
              <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#6d7175' }}>Collect customer emails directly from the announcement popup</p>
            </div>
            <PremiumToggle enabled={showEmailInput} onClick={() => setShowEmailInput(!showEmailInput)} />
            <input type="hidden" name="showEmailInput" value={showEmailInput ? "true" : "false"} />
          </div>
          {showEmailInput && (
            <div className="section-body">
              <div>
                <label className="input-label">Subscription Success Message</label>
                <input type="text" name="announceSuccessMessage" value={announceSuccessMessage} onInput={(e) => setAnnounceSuccessMessage(e.currentTarget.value)} className="s-input-premium" />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Card 3: Call-To-Action (CTA) Button */}
      {showAnnounce && (
        <div className="section-card">
          <div className="section-header">
            <h2>Call-To-Action Button</h2>
          </div>
          <div className="section-body" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="s-grid-2">
              <div className="input-group">
                <label className="input-label">Button Text</label>
                <input type="text" name="announceButtonText" value={announceButtonText} onInput={(e) => setAnnounceButtonText(e.currentTarget.value)} className="s-input-premium" placeholder="e.g. Claim Offer" />
              </div>
              <div className="input-group">
                <label className="input-label">Redirect Link (URL)</label>
                <input type="text" name="announceButtonLink" value={announceButtonLink} onInput={(e) => setAnnounceButtonLink(e.currentTarget.value)} className="s-input-premium" placeholder="e.g. /collections/all" />
              </div>
            </div>

            <div className="s-grid-2">
              <div className="input-group">
                <label className="input-label">Button Background Color</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    name="announceBtnBgColor"
                    value={announceBtnBgColor}
                    onInput={(e) => setAnnounceBtnBgColor(e.currentTarget.value)}
                    className="s-input-premium"
                    style={{ flex: 1 }}
                  />
                  <input
                    type="color"
                    value={announceBtnBgColor.startsWith('#') && announceBtnBgColor.length === 7 ? announceBtnBgColor : '#1a1a1a'}
                    onInput={(e) => setAnnounceBtnBgColor(e.currentTarget.value)}
                    style={{ width: '44px', height: '40px', padding: '0', border: '1px solid #d2d5d8', borderRadius: '8px', cursor: 'pointer' }}
                  />
                </div>
              </div>
              <div className="input-group">
                <label className="input-label">Button Text Color</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    name="announceBtnTextColor"
                    value={announceBtnTextColor}
                    onInput={(e) => setAnnounceBtnTextColor(e.currentTarget.value)}
                    className="s-input-premium"
                    style={{ flex: 1 }}
                  />
                  <input
                    type="color"
                    value={announceBtnTextColor.startsWith('#') && announceBtnTextColor.length === 7 ? announceBtnTextColor : '#ffffff'}
                    onInput={(e) => setAnnounceBtnTextColor(e.currentTarget.value)}
                    style={{ width: '44px', height: '40px', padding: '0', border: '1px solid #d2d5d8', borderRadius: '8px', cursor: 'pointer' }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Card 4: Display Trigger & Timing */}
      {showAnnounce && (
        <div className="section-card">
          <div className="section-header"><h2>Display & Timing</h2></div>
          <div className="section-body" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="s-grid-2">
              <div className="input-group">
                <label className="input-label">Popup Trigger</label>
                <select name="announceTrigger" value={announceTrigger} onChange={(e) => setAnnounceTrigger(e.currentTarget.value)} className="s-input-premium">
                  <option value="load">On Page Load</option>
                  <option value="exit">On Exit Intent</option>
                </select>
              </div>
              <div className="input-group">
                <label className="input-label">Trigger Delay (ms)</label>
                <input type="number" name="announceDelay" value={announceDelay} onChange={(e) => setAnnounceDelay(parseInt(e.currentTarget.value))} className="s-input-premium" min="0" step="500" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Card 5: Design & Aesthetics */}
      {showAnnounce && (
        <div className="section-card">
          <div className="section-header"><h2>Design & Aesthetics</h2></div>
          <div className="section-body" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="s-grid-2">
              <div className="input-group">
                <label className="input-label">Popup Layout Position</label>
                <select name="announce_pos" value={announce_pos} onChange={(e) => setAnnouncePos(e.currentTarget.value)} className="s-input-premium">
                  <option value="center">Center Modal</option>
                  <option value="top">Fixed Header Bar</option>
                  <option value="bottom">Fixed Footer Bar</option>
                </select>
              </div>
              <div className="input-group">
                <label className="input-label">Popup Width (px)</label>
                <input type="number" name="announceWidth" value={announceWidth} onChange={(e) => setAnnounceWidth(parseInt(e.currentTarget.value))} className="s-input-premium" min="300" max="800" />
              </div>
            </div>

            <div className="s-grid-2">
              <div className="input-group">
                <label className="input-label">Background Color</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    name="announce_bg"
                    value={announce_bg}
                    onInput={(e) => setAnnounceBg(e.currentTarget.value)}
                    className="s-input-premium"
                    style={{ flex: 1 }}
                  />
                  <input
                    type="color"
                    value={announce_bg.startsWith('#') && announce_bg.length === 7 ? announce_bg : '#ffffff'}
                    onInput={(e) => setAnnounceBg(e.currentTarget.value)}
                    style={{ width: '44px', height: '40px', padding: '0', border: '1px solid #d2d5d8', borderRadius: '8px', cursor: 'pointer' }}
                  />
                </div>
              </div>
              <div className="input-group">
                <label className="input-label">Text Color</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    name="announce_text"
                    value={announce_text}
                    onInput={(e) => setAnnounceTextState(e.currentTarget.value)}
                    className="s-input-premium"
                    style={{ flex: 1 }}
                  />
                  <input
                    type="color"
                    value={announce_text.startsWith('#') && announce_text.length === 7 ? announce_text : '#1a1a1a'}
                    onInput={(e) => setAnnounceTextState(e.currentTarget.value)}
                    style={{ width: '44px', height: '40px', padding: '0', border: '1px solid #d2d5d8', borderRadius: '8px', cursor: 'pointer' }}
                  />
                </div>
              </div>
            </div>

            <div className="s-grid-2">
              <div className="input-group">
                <label className="input-label">Corner Radius (px)</label>
                <input type="number" name="announceBorderRadius" value={announceBorderRadius} onChange={(e) => setAnnounceBorderRadius(parseInt(e.currentTarget.value))} className="s-input-premium" min="0" max="40" />
              </div>
              <div className="input-group" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f6f6f7', padding: '10px 16px', borderRadius: '8px', height: '40px', marginTop: '22px' }}>
                  <span style={{ fontSize: '13px', fontWeight: '600', color: '#202223' }}>Backdrop Blur Overlay</span>
                  <PremiumToggle enabled={announceBackdropBlur} onClick={() => setAnnounceBackdropBlur(!announceBackdropBlur)} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
