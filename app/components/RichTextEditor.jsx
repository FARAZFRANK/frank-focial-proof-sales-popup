import { useEffect, useRef } from "react";

const RichTextEditor = ({ value, onChange, label, textColor = '#1a1a1a', bgColor = '#ffffff' }) => {
  const editorRef = useRef(null);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (editorRef.current && isFirstRender.current) {
      editorRef.current.innerHTML = value;
      isFirstRender.current = false;
    }
  }, [value]);

  const execCommand = (command, val = null) => {
    document.execCommand(command, false, val);
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  return (
    <div className="input-group">
      <label className="input-label">{label}</label>
      <div style={{ border: '1px solid #d2d5d8', borderRadius: '12px', overflow: 'hidden', background: bgColor, boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
        <div style={{ display: 'flex', gap: '8px', padding: '8px 12px', background: '#f9fafb', borderBottom: '1px solid #e1e3e5', flexWrap: 'wrap' }}>
          <button type="button" onClick={() => execCommand('bold')} style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid #d2d5d8', background: '#fff', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px' }}>B</button>
          <button type="button" onClick={() => execCommand('italic')} style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid #d2d5d8', background: '#fff', fontStyle: 'italic', cursor: 'pointer', fontSize: '14px' }}>I</button>
          <button type="button" onClick={() => execCommand('underline')} style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid #d2d5d8', background: '#fff', textDecoration: 'underline', cursor: 'pointer', fontSize: '14px' }}>U</button>
          <div style={{ width: '1px', background: '#d2d5d8', margin: '0 4px' }}></div>
          <select onChange={(e) => execCommand('fontName', e.target.value)} style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid #d2d5d8', background: '#fff', fontSize: '12px', cursor: 'pointer', fontWeight: '500' }}>
            <option value="Inter, sans-serif">Inter (Default)</option>
            <option value="'Playfair Display', serif">Playfair Display (Elegant)</option>
            <option value="'Roboto', sans-serif">Roboto (Clean)</option>
            <option value="'Montserrat', sans-serif">Montserrat (Bold)</option>
            <option value="'Courier Prime', monospace">Courier (Classic)</option>
          </select>
        </div>
        <div
          ref={editorRef}
          contentEditable
          onInput={handleInput}
          style={{
            minHeight: '120px',
            padding: '16px',
            outline: 'none',
            fontSize: '14px',
            lineHeight: '1.6',
            color: textColor,
            transition: 'all 0.3s'
          }}
        />
      </div>
    </div>
  );
};

export default RichTextEditor;
