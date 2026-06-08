import PremiumToggle from "../PremiumToggle";
import RichTextEditor from "../RichTextEditor";

export default function ExitPopupTab({
  showExitPopup,
  setShowExitPopup,
  exitOnce,
  setExitOnce,
  showExitEmailInput,
  setShowExitEmailInput,
  exitSuccessMessage,
  setExitSuccessMessage,
  exitButtonText,
  setExitButtonText,
  exitButtonLink,
  setExitButtonLink,
  exitBtnBgColor,
  setExitBtnBgColor,
  exitBtnTextColor,
  setExitBtnTextColor,
  exitTitle,
  setExitTitle,
  exitText,
  setExitText,
  exit_bg,
  setExitBg,
  exit_text,
  setExitTextState,
  exitWidth,
  setExitWidth,
  exitBorderRadius,
  setExitBorderRadius,
  exitBackdropBlur,
  setExitBackdropBlur
}) {
  return (
    <>
      <div className="section-card">
        <div className="section-header">
          <h2>Exit Intent Configuration</h2>
          <PremiumToggle enabled={showExitPopup} onClick={() => setShowExitPopup(!showExitPopup)} />
          <input type="hidden" name="showExitPopup" value={showExitPopup ? "true" : "false"} />
        </div>
        {showExitPopup && (
          <div className="section-body">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '600' }}>Show Once Per Session</h3>
                <p style={{ margin: '4px 0 0 0', fontSize: '13px', opacity: 0.6 }}>Limit popup views to once per session per visitor</p>
              </div>
              <PremiumToggle enabled={exitOnce} onClick={() => setExitOnce(!exitOnce)} />
              <input type="hidden" name="exitOnce" value={exitOnce ? "true" : "false"} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingTop: '20px', borderTop: '1px solid #e1e3e5' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '600' }}>Enable Email Capture</h3>
                <p style={{ margin: '4px 0 0 0', fontSize: '13px', opacity: 0.6 }}>Collect visitor emails directly from the exit popup</p>
              </div>
              <PremiumToggle enabled={showExitEmailInput} onClick={() => setShowExitEmailInput(!showExitEmailInput)} />
              <input type="hidden" name="showExitEmailInput" value={showExitEmailInput ? "true" : "false"} />
            </div>

            {showExitEmailInput && (
              <div style={{ marginBottom: '20px' }}>
                <label className="input-label">Success Message</label>
                <input
                  type="text"
                  name="exitSuccessMessage"
                  value={exitSuccessMessage}
                  onInput={(e) => setExitSuccessMessage(e.currentTarget.value)}
                  className="s-input-premium"
                  placeholder="Thank you!"
                />
              </div>
            )}

            {!showExitEmailInput && (
              <div className="s-grid-2" style={{ marginTop: '16px' }}>
                <div className="input-group">
                  <label className="input-label">Button Text</label>
                  <input
                    type="text"
                    name="exitButtonText"
                    value={exitButtonText}
                    onInput={(e) => setExitButtonText(e.currentTarget.value)}
                    className="s-input-premium"
                  />
                </div>
                <div className="input-group">
                  <label className="input-label">Button Action Link (Optional)</label>
                  <input
                    type="text"
                    name="exitButtonLink"
                    value={exitButtonLink}
                    onInput={(e) => setExitButtonLink(e.currentTarget.value)}
                    className="s-input-premium"
                    placeholder="/collections/all"
                  />
                </div>
              </div>
            )}

            <div className="s-grid-2" style={{ marginTop: '16px' }}>
              <div className="input-group">
                <label className="input-label">Button Background Color</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    name="exitBtnBgColor"
                    value={exitBtnBgColor}
                    onInput={(e) => setExitBtnBgColor(e.currentTarget.value)}
                    className="s-input-premium"
                    style={{ flex: 1 }}
                  />
                  <input
                    type="color"
                    value={exitBtnBgColor.startsWith('#') && exitBtnBgColor.length === 7 ? exitBtnBgColor : '#1a1a1a'}
                    onInput={(e) => setExitBtnBgColor(e.currentTarget.value)}
                    style={{ width: '44px', height: '40px', padding: '0', border: '1px solid #d2d5d8', borderRadius: '8px' }}
                  />
                </div>
              </div>
              <div className="input-group">
                <label className="input-label">Button Text Color</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    name="exitBtnTextColor"
                    value={exitBtnTextColor}
                    onInput={(e) => setExitBtnTextColor(e.currentTarget.value)}
                    className="s-input-premium"
                    style={{ flex: 1 }}
                  />
                  <input
                    type="color"
                    value={exitBtnTextColor.startsWith('#') && exitBtnTextColor.length === 7 ? exitBtnTextColor : '#ffffff'}
                    onInput={(e) => setExitBtnTextColor(e.currentTarget.value)}
                    style={{ width: '44px', height: '40px', padding: '0', border: '1px solid #d2d5d8', borderRadius: '8px' }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {showExitPopup && (
        <div className="section-card">
          <div className="section-header"><h2>Popup Content</h2></div>
          <div className="section-body">
            <div style={{ marginTop: '16px' }}>
              <label className="input-label">Popup Title</label>
              <input type="text" name="exitTitle" value={exitTitle} onInput={(e) => setExitTitle(e.currentTarget.value)} className="s-input-premium" />
            </div>
            <div style={{ marginTop: '16px' }}>
              <RichTextEditor
                label="Popup Message"
                value={exitText}
                onChange={(val) => setExitText(val)}
              />
              <input type="hidden" name="exitText" value={exitText} />
            </div>
          </div>
        </div>
      )}

      {showExitPopup && (
        <div className="section-card">
          <div className="section-header"><h2>Exit Popup Aesthetics</h2></div>
          <div className="section-body">
            <div className="s-grid-2">
              <div className="input-group">
                <label className="input-label">Background Color</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    name="exit_bg"
                    value={exit_bg}
                    onInput={(e) => setExitBg(e.currentTarget.value)}
                    className="s-input-premium"
                    style={{ flex: 1 }}
                  />
                  <input
                    type="color"
                    value={exit_bg.startsWith('#') && exit_bg.length === 7 ? exit_bg : '#ffffff'}
                    onInput={(e) => setExitBg(e.currentTarget.value)}
                    style={{ width: '44px', height: '40px', padding: '0', border: '1px solid #d2d5d8', borderRadius: '8px' }}
                  />
                </div>
              </div>
              <div className="input-group">
                <label className="input-label">Text Color</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    name="exit_text"
                    value={exit_text}
                    onInput={(e) => setExitTextState(e.currentTarget.value)}
                    className="s-input-premium"
                    style={{ flex: 1 }}
                  />
                  <input
                    type="color"
                    value={exit_text.startsWith('#') && exit_text.length === 7 ? exit_text : '#000000'}
                    onInput={(e) => setExitTextState(e.currentTarget.value)}
                    style={{ width: '44px', height: '40px', padding: '0', border: '1px solid #d2d5d8', borderRadius: '8px' }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showExitPopup && (
        <div className="section-card">
          <div className="section-header"><h2>Layout & Dimensions</h2></div>
          <div className="section-body">
            <div className="s-grid-2">
              <div className="input-group">
                <label className="input-label">Popup Width (px)</label>
                <input
                  type="number"
                  name="exitWidth"
                  value={exitWidth}
                  onChange={(e) => setExitWidth(parseInt(e.target.value) || 450)}
                  className="s-input-premium"
                  min="300"
                  max="800"
                />
              </div>
              <div className="input-group">
                <label className="input-label">Border Radius (px)</label>
                <input
                  type="number"
                  name="exitBorderRadius"
                  value={exitBorderRadius}
                  onChange={(e) => setExitBorderRadius(parseInt(e.target.value) || 0)}
                  className="s-input-premium"
                  min="0"
                  max="50"
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #e1e3e5' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '600' }}>Backdrop Blur Effect</h3>
                <p style={{ margin: '4px 0 0 0', fontSize: '13px', opacity: 0.6 }}>Apply elegant glassmorphism blur to the background overlay</p>
              </div>
              <PremiumToggle enabled={exitBackdropBlur} onClick={() => setExitBackdropBlur(!exitBackdropBlur)} />
              <input type="hidden" name="exitBackdropBlur" value={exitBackdropBlur ? "true" : "false"} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
