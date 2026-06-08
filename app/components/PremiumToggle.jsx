const PremiumToggle = ({ enabled, onClick, size = 'small' }) => {
  const isLarge = size === 'large';
  const width = isLarge ? 56 : 44;
  const height = isLarge ? 30 : 22;
  const knobSize = isLarge ? 26 : 18;

  return (
    <div 
      onClick={onClick} 
      style={{ 
        width: `${width}px`, 
        height: `${height}px`, 
        background: enabled ? '#008060' : '#d2d5d8', 
        borderRadius: `${height/2}px`, 
        cursor: 'pointer', 
        position: 'relative', 
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        boxShadow: enabled ? 'inset 0 2px 4px rgba(0,0,0,0.1)' : 'none',
        boxSizing: 'border-box'
      }}
    >
      <div style={{ 
        width: `${knobSize}px`, 
        height: `${knobSize}px`, 
        background: '#fff', 
        borderRadius: '50%', 
        position: 'absolute', 
        top: '50%',
        left: enabled ? `calc(100% - ${knobSize}px - 2px)` : '2px', 
        transform: 'translateY(-50%)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', 
        boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
        boxSizing: 'border-box'
      }}></div>
    </div>
  );
};

export default PremiumToggle;
