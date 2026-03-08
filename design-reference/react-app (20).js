import React, { useState, useEffect, useRef } from 'react';
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
    display: 'flex',
    flexDirection: 'column',
    borderRadius: '40px',
    position: 'relative',
  },
  header: {
    padding: '24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
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
    fontWeight: 200,
    cursor: 'pointer',
  },
  resultsContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '0 24px',
    position: 'relative',
  },
  idStamp: {
    fontFamily: "'Courier New', monospace",
    fontSize: '10px',
    color: '#8E8E93',
    letterSpacing: '0.2em',
    marginBottom: '20px',
    textAlign: 'center',
  },
  chartWrapper: {
    width: '320px',
    height: '320px',
    position: 'relative',
    margin: '20px 0',
  },
  chartSvg: {
    width: '100%',
    height: '100%',
    overflow: 'visible',
  },
  verticalLabel: {
    position: 'absolute',
    right: '-10px',
    top: '50%',
    transform: 'translateY(-50%) rotate(90deg)',
    fontSize: '10px',
    color: '#8E8E93',
    letterSpacing: '0.3em',
    whiteSpace: 'nowrap',
    opacity: 0.5,
  },
  archetypeInfo: {
    textAlign: 'center',
    marginTop: '30px',
    width: '100%',
  },
  archetypeTitle: {
    fontSize: '48px',
    fontWeight: 300,
    letterSpacing: '0.1em',
    marginBottom: '12px',
    lineHeight: 1.2,
  },
  archetypeTag: {
    fontSize: '12px',
    color: '#FF3B30',
    letterSpacing: '0.2em',
    marginBottom: '24px',
    textTransform: 'uppercase',
  },
  description: {
    fontSize: '14px',
    lineHeight: 1.8,
    color: '#8E8E93',
    maxWidth: '280px',
    margin: '0 auto',
    fontWeight: 300,
  },
  footer: {
    padding: '40px 24px 60px 24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  btnBase: {
    height: '54px',
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '13px',
    letterSpacing: '0.1em',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    border: 'none',
  },
  btnPrimary: {
    background: '#FF3B30',
    color: 'white',
    border: 'none',
  },
  btnOutline: {
    background: 'transparent',
    color: '#111111',
    border: '1px solid #E5E5E5',
  },
  bgAccents: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
    zIndex: -1,
    opacity: 0.05,
  },
};

const AnimatedPoints = () => {
  const pointsRef = useRef([]);
  const [radii, setRadii] = useState([2, 2, 2, 2, 2, 2, 2, 2]);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setRadii(prev =>
        prev.map((_, i) => {
          const offset = Math.sin(now / 1000 + i) * 1.5;
          return 1.5 + Math.abs(offset);
        })
      );
    }, 50);
    return () => clearInterval(interval);
  }, []);

  const pointCoords = [
    { cx: 100, cy: 35 },
    { cx: 145, cy: 55 },
    { cx: 175, cy: 100 },
    { cx: 140, cy: 140 },
    { cx: 100, cy: 165 },
    { cx: 65, cy: 145 },
    { cx: 35, cy: 100 },
    { cx: 55, cy: 60 },
  ];

  return (
    <>
      {pointCoords.map((pt, i) => (
        <circle
          key={i}
          cx={pt.cx}
          cy={pt.cy}
          r={radii[i]}
          fill="#FF3B30"
          style={{ transition: 'r 0.05s ease-in-out' }}
        />
      ))}
    </>
  );
};

const PsycheApp = () => {
  const [downloadPressed, setDownloadPressed] = useState(false);
  const [sharePressed, setSharePressed] = useState(false);
  const [closed, setClosed] = useState(false);

  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@100;300;400;500;700&display=swap');
      * { box-sizing: border-box; margin: 0; padding: 0; -webkit-font-smoothing: antialiased; }
      .psyche-btn-primary:hover { opacity: 0.9; }
      .psyche-btn-outline:hover { background: #F5F5F5 !important; }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  if (closed) {
    return (
      <div
        style={{
          ...customStyles.body,
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '40px',
        }}
      >
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <div style={{ ...customStyles.logo, justifyContent: 'center', marginBottom: '16px' }}>
            <div style={customStyles.logoDot}></div>
            PSYCHE.AI
          </div>
          <p style={{ color: '#8E8E93', fontSize: '14px', letterSpacing: '0.05em' }}>
            Session closed.
          </p>
          <button
            style={{
              ...customStyles.btnBase,
              ...customStyles.btnPrimary,
              marginTop: '24px',
              width: '200px',
            }}
            onClick={() => setClosed(false)}
          >
            REOPEN RESULTS
          </button>
        </div>
      </div>
    );
  }

  if (downloadPressed) {
    return (
      <div
        style={{
          ...customStyles.body,
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '40px',
        }}
      >
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <div style={{ fontSize: '40px', marginBottom: '16px' }}>📄</div>
          <div style={{ ...customStyles.idStamp, marginBottom: '12px' }}>
            RESULT ID: PX-7702-ALPHA
          </div>
          <h2
            style={{
              fontSize: '20px',
              fontWeight: 300,
              letterSpacing: '0.1em',
              marginBottom: '12px',
            }}
          >
            Report Ready
          </h2>
          <p style={{ color: '#8E8E93', fontSize: '13px', lineHeight: 1.8, letterSpacing: '0.05em' }}>
            Your detailed psychometric report has been prepared for download.
          </p>
          <button
            style={{
              ...customStyles.btnBase,
              ...customStyles.btnPrimary,
              marginTop: '32px',
              width: '100%',
            }}
            onClick={() => setDownloadPressed(false)}
          >
            ← BACK TO RESULTS
          </button>
        </div>
      </div>
    );
  }

  if (sharePressed) {
    return (
      <div
        style={{
          ...customStyles.body,
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '40px',
        }}
      >
        <div style={{ textAlign: 'center', padding: '40px', width: '100%' }}>
          <div style={{ fontSize: '40px', marginBottom: '16px' }}>🔗</div>
          <div style={customStyles.archetypeTag}>Share Your Archetype</div>
          <h2
            style={{
              fontSize: '32px',
              fontWeight: 300,
              letterSpacing: '0.1em',
              marginBottom: '12px',
            }}
          >
            創造的哲学者
          </h2>
          <p style={{ color: '#8E8E93', fontSize: '12px', letterSpacing: '0.15em', marginBottom: '24px' }}>
            THE ARCHITECT · PX-7702-ALPHA
          </p>
          <div
            style={{
              background: '#F9F9F9',
              border: '1px solid #E5E5E5',
              borderRadius: '4px',
              padding: '12px 16px',
              fontFamily: "'Courier New', monospace",
              fontSize: '11px',
              color: '#8E8E93',
              letterSpacing: '0.1em',
              marginBottom: '24px',
            }}
          >
            psyche.ai/result/PX-7702-ALPHA
          </div>
          <button
            style={{
              ...customStyles.btnBase,
              ...customStyles.btnOutline,
              width: '100%',
            }}
            onClick={() => setSharePressed(false)}
          >
            ← BACK TO RESULTS
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={customStyles.body}>
      <div style={customStyles.bgAccents}>
        <svg width="100%" height="100%" viewBox="0 0 390 844">
          <line
            x1="195"
            y1="0"
            x2="195"
            y2="844"
            stroke="black"
            strokeDasharray="2 4"
          />
          <circle
            cx="195"
            cy="422"
            r="300"
            fill="none"
            stroke="black"
            strokeDasharray="1 10"
          />
        </svg>
      </div>

      <header style={customStyles.header}>
        <div style={customStyles.logo}>
          <div style={customStyles.logoDot}></div>
          PSYCHE.AI
        </div>
        <div style={customStyles.closeBtn} onClick={() => setClosed(true)}>
          ✕
        </div>
      </header>

      <div style={customStyles.resultsContainer}>
        <div style={customStyles.idStamp}>RESULT ID: PX-7702-ALPHA</div>

        <div style={customStyles.chartWrapper}>
          <div style={customStyles.verticalLabel}>PSYCHOMETRIC MAPPING</div>
          <svg
            style={customStyles.chartSvg}
            viewBox="0 0 200 200"
          >
            <circle
              cx="100"
              cy="100"
              r="20"
              stroke="#F5F5F5"
              strokeWidth="1"
              fill="none"
            />
            <circle
              cx="100"
              cy="100"
              r="40"
              stroke="#F5F5F5"
              strokeWidth="1"
              fill="none"
            />
            <circle
              cx="100"
              cy="100"
              r="60"
              stroke="#F5F5F5"
              strokeWidth="1"
              fill="none"
            />
            <circle
              cx="100"
              cy="100"
              r="80"
              stroke="#F5F5F5"
              strokeWidth="1"
              fill="none"
            />

            <line
              x1="100"
              y1="20"
              x2="100"
              y2="180"
              stroke="#EEEEEE"
              strokeWidth="1"
            />
            <line
              x1="20"
              y1="100"
              x2="180"
              y2="100"
              stroke="#EEEEEE"
              strokeWidth="1"
            />
            <line
              x1="43.4"
              y1="43.4"
              x2="156.6"
              y2="156.6"
              stroke="#EEEEEE"
              strokeWidth="1"
            />
            <line
              x1="156.6"
              y1="43.4"
              x2="43.4"
              y2="156.6"
              stroke="#EEEEEE"
              strokeWidth="1"
            />

            <polygon
              points="100,35 145,55 175,100 140,140 100,165 65,145 35,100 55,60"
              stroke="#FF3B30"
              strokeWidth="1.5"
              fill="rgba(255, 59, 48, 0.05)"
              strokeDasharray="4 2"
            />

            <AnimatedPoints />

            <text
              x="100"
              y="15"
              textAnchor="middle"
              fontSize="9"
              fill="#8E8E93"
              fontWeight="400"
              letterSpacing="0.05em"
              fontFamily="'Noto Sans JP', sans-serif"
            >
              INTUITION
            </text>
            <text
              x="185"
              y="103"
              textAnchor="start"
              fontSize="9"
              fill="#8E8E93"
              fontWeight="400"
              letterSpacing="0.05em"
              fontFamily="'Noto Sans JP', sans-serif"
            >
              LOGIC
            </text>
            <text
              x="100"
              y="193"
              textAnchor="middle"
              fontSize="9"
              fill="#8E8E93"
              fontWeight="400"
              letterSpacing="0.05em"
              fontFamily="'Noto Sans JP', sans-serif"
            >
              EMPATHY
            </text>
            <text
              x="15"
              y="103"
              textAnchor="end"
              fontSize="9"
              fill="#8E8E93"
              fontWeight="400"
              letterSpacing="0.05em"
              fontFamily="'Noto Sans JP', sans-serif"
            >
              DRIVE
            </text>
          </svg>
        </div>

        <div style={customStyles.archetypeInfo}>
          <div style={customStyles.archetypeTag}>The Architect</div>
          <h1 style={customStyles.archetypeTitle}>創造的哲学者</h1>
          <p style={customStyles.description}>
            You possess a rare structural intelligence that seeks to harmonize
            complex systems with aesthetic intuition. You build bridges between
            the abstract and the tangible.
          </p>
        </div>
      </div>

      <footer style={customStyles.footer}>
        <button
          className="psyche-btn-primary"
          style={{ ...customStyles.btnBase, ...customStyles.btnPrimary }}
          onClick={() => setDownloadPressed(true)}
        >
          DOWNLOAD DETAILED REPORT
        </button>
        <button
          className="psyche-btn-outline"
          style={{ ...customStyles.btnBase, ...customStyles.btnOutline }}
          onClick={() => setSharePressed(true)}
        >
          SHARE ARCHETYPE
        </button>
      </footer>
    </div>
  );
};

const App = () => {
  return (
    <Router basename="/">
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#1a1a1a',
        }}
      >
        <Routes>
          <Route path="/" element={<PsycheApp />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;