import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

const customStyles = {
  root: {
    '--c-red': '#FF3B30',
    '--c-red-dim': 'rgba(255, 59, 48, 0.4)',
    '--c-bg': '#FFFFFF',
    '--c-text-main': '#111111',
    '--c-text-muted': '#8E8E93',
  },
  body: {
    backgroundColor: '#FFFFFF',
    fontFamily: "'Noto Sans JP', sans-serif",
    color: '#111111',
    width: '390px',
    height: '844px',
    overflow: 'hidden',
    position: 'relative',
    WebkitFontSmoothing: 'antialiased',
  },
  header: {
    padding: '24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    zIndex: 10,
  },
  logo: {
    fontWeight: 700,
    fontSize: '14px',
    letterSpacing: '0.05em',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  logoDot: {
    width: '8px',
    height: '8px',
    backgroundColor: '#FF3B30',
    borderRadius: '50%',
  },
  closeBtn: {
    fontSize: '24px',
    fontWeight: 300,
    cursor: 'pointer',
  },
  container: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    padding: '100px 24px 48px',
    justifyContent: 'space-between',
  },
  resultLabel: {
    fontSize: '12px',
    color: '#FF3B30',
    letterSpacing: '0.2em',
    marginBottom: '8px',
    display: 'block',
  },
  archetypeTitle: {
    fontSize: '48px',
    fontWeight: 300,
    lineHeight: 1,
    letterSpacing: '-0.02em',
    marginBottom: '24px',
  },
  chartContainer: {
    flexGrow: 1,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    margin: '20px 0',
  },
  radarSvg: {
    width: '100%',
    maxWidth: '320px',
    height: 'auto',
    transform: 'rotate(-18deg)',
  },
  chartLabels: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    top: 0,
    left: 0,
    pointerEvents: 'none',
  },
  dimensionLabel: {
    position: 'absolute',
    fontSize: '10px',
    color: '#8E8E93',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
  },
  bottomActions: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  description: {
    fontSize: '14px',
    lineHeight: 1.6,
    color: '#8E8E93',
    marginBottom: '12px',
  },
  shareBtn: {
    border: '1px solid #FF3B30',
    background: 'transparent',
    color: '#FF3B30',
    padding: '18px',
    fontSize: '14px',
    fontWeight: 500,
    letterSpacing: '0.1em',
    cursor: 'pointer',
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '12px',
    transition: 'all 0.2s ease',
    fontFamily: "'Noto Sans JP', sans-serif",
  },
  shareBtnActive: {
    background: '#FF3B30',
    color: 'white',
  },
  verticalId: {
    position: 'absolute',
    right: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    writingMode: 'vertical-rl',
    fontSize: '10px',
    color: '#EEEEEE',
    letterSpacing: '0.3em',
  },
  footerText: {
    textAlign: 'center',
    fontSize: '10px',
    color: '#8E8E93',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
  },
};

const ShareIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="0.75" y="6.75" width="14.5" height="8.5" rx="0" stroke="currentColor" strokeWidth="1.5" fill="none" />
    <line x1="8" y1="0" x2="8" y2="10" stroke="currentColor" strokeWidth="1.5" />
    <polyline points="4,4 8,0 12,4" stroke="currentColor" strokeWidth="1.5" fill="none" />
  </svg>
);

const ResultsPage = () => {
  const [btnActive, setBtnActive] = useState(false);
  const [animateDone, setAnimateDone] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setAnimateDone(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleShareClick = () => {
    setBtnActive(true);
    setTimeout(() => setBtnActive(false), 300);
  };

  return (
    <div style={customStyles.body}>
      <header style={customStyles.header}>
        <div style={customStyles.logo}>
          <div style={customStyles.logoDot}></div>
          PSYCHE.AI
        </div>
        <div style={customStyles.closeBtn}>×</div>
      </header>

      <div style={customStyles.verticalId}>NODE_RES_7741_XP</div>

      <div style={customStyles.container}>
        <div>
          <span style={customStyles.resultLabel}>ASSESSMENT COMPLETE</span>
          <h1 style={customStyles.archetypeTitle}>
            THE<br />ARCHITECT
          </h1>
          <p style={customStyles.description}>
            Your personality map reveals a structural precision and strategic depth. You perceive the underlying systems that others often overlook.
          </p>
        </div>

        <div style={customStyles.chartContainer}>
          <svg
            style={customStyles.radarSvg}
            viewBox="0 0 100 100"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle stroke="#EEEEEE" strokeWidth="1" fill="none" strokeDasharray="4 4" cx="50" cy="50" r="10" />
            <circle stroke="#EEEEEE" strokeWidth="1" fill="none" strokeDasharray="4 4" cx="50" cy="50" r="20" />
            <circle stroke="#EEEEEE" strokeWidth="1" fill="none" strokeDasharray="4 4" cx="50" cy="50" r="30" />
            <circle stroke="#EEEEEE" strokeWidth="1" fill="none" strokeDasharray="4 4" cx="50" cy="50" r="40" />

            <line stroke="#EEEEEE" strokeWidth="1" strokeDasharray="4 4" x1="50" y1="10" x2="50" y2="90" />
            <line stroke="#EEEEEE" strokeWidth="1" strokeDasharray="4 4" x1="10" y1="50" x2="90" y2="50" />

            <polygon
              fill="rgba(255, 59, 48, 0.1)"
              stroke="#FF3B30"
              strokeWidth="1.5"
              points={animateDone ? "50,15 82,38 75,70 30,75 18,45" : "50,15 82,38 75,70 30,75 18,45"}
            >
              <animate
                attributeName="points"
                dur="2s"
                repeatCount="1"
                from="50,50 50,50 50,50 50,50 50,50"
                to="50,15 82,38 75,70 30,75 18,45"
              />
            </polygon>

            <circle fill="#FF3B30" cx="50" cy="15" r="1.5" />
            <circle fill="#FF3B30" cx="82" cy="38" r="1.5" />
            <circle fill="#FF3B30" cx="75" cy="70" r="1.5" />
            <circle fill="#FF3B30" cx="30" cy="75" r="1.5" />
            <circle fill="#FF3B30" cx="18" cy="45" r="1.5" />
          </svg>

          <div style={customStyles.chartLabels}>
            <span style={{ ...customStyles.dimensionLabel, top: '10%', left: '50%', transform: 'translateX(-50%)' }}>Logic</span>
            <span style={{ ...customStyles.dimensionLabel, top: '35%', right: '5%' }}>Vision</span>
            <span style={{ ...customStyles.dimensionLabel, bottom: '15%', right: '15%' }}>Drive</span>
            <span style={{ ...customStyles.dimensionLabel, bottom: '15%', left: '15%' }}>Social</span>
            <span style={{ ...customStyles.dimensionLabel, top: '40%', left: '5%' }}>Empathy</span>
          </div>
        </div>

        <div style={customStyles.bottomActions}>
          <button
            style={btnActive ? { ...customStyles.shareBtn, ...customStyles.shareBtnActive } : customStyles.shareBtn}
            onMouseDown={() => setBtnActive(true)}
            onMouseUp={() => setBtnActive(false)}
            onMouseLeave={() => setBtnActive(false)}
            onTouchStart={() => setBtnActive(true)}
            onTouchEnd={() => { setBtnActive(false); handleShareClick(); }}
            onClick={handleShareClick}
          >
            <ShareIcon />
            EXPORT PROFILE
          </button>
          <div style={customStyles.footerText}>
            Detailed Analysis Generated — ID: A-294
          </div>
        </div>
      </div>
    </div>
  );
};

const App = () => {
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@300;400;500;700&display=swap');
      * { box-sizing: border-box; margin: 0; padding: 0; -webkit-font-smoothing: antialiased; }
      body { background-color: #f0f0f0; display: flex; justify-content: center; align-items: center; min-height: 100vh; }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  return (
    <Router basename="/">
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#f0f0f0' }}>
        <Routes>
          <Route path="/" element={<ResultsPage />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;