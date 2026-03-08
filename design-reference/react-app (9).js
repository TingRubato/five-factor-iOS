import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

const customStyles = {
  root: {
    '--c-red': '#FF3B30',
    '--c-red-dim': 'rgba(255, 59, 48, 0.15)',
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
    overflowX: 'hidden',
    position: 'relative',
    margin: '0 auto',
  },
  header: {
    padding: '24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'sticky',
    top: 0,
    background: 'rgba(255, 255, 255, 0.9)',
    backdropFilter: 'blur(10px)',
    zIndex: 100,
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
  content: {
    padding: '0 24px 48px 24px',
  },
  profileHeader: {
    marginTop: '20px',
    marginBottom: '40px',
  },
  idLabel: {
    fontFamily: "'Courier New', monospace",
    fontSize: '11px',
    color: '#FF3B30',
    marginBottom: '8px',
    textTransform: 'uppercase',
  },
  h1: {
    fontSize: '32px',
    fontWeight: 300,
    letterSpacing: '-0.01em',
  },
  sectionTitleWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '24px',
  },
  sectionTitleText: {
    fontSize: '12px',
    fontWeight: 700,
    letterSpacing: '0.1em',
    color: '#111111',
    whiteSpace: 'nowrap',
  },
  sectionTitleLine: {
    height: '1px',
    flexGrow: 1,
    backgroundColor: '#EEEEEE',
  },
  psycheMapContainer: {
    width: '100%',
    height: '240px',
    position: 'relative',
    marginBottom: '48px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapGrid: {
    position: 'absolute',
    width: '200px',
    height: '200px',
    border: '1px dashed #E0E0E0',
    borderRadius: '50%',
  },
  mapAxisV: {
    position: 'absolute',
    background: '#F0F0F0',
    width: '1px',
    height: '100%',
    left: '50%',
  },
  mapAxisH: {
    position: 'absolute',
    background: '#F0F0F0',
    height: '1px',
    width: '100%',
    top: '50%',
  },
  psycheLayerOld: {
    position: 'absolute',
    width: '180px',
    height: '180px',
    fill: 'none',
    stroke: '#E0E0E0',
    strokeWidth: 1,
    strokeDasharray: '4',
  },
  psycheLayerCurrent: {
    position: 'absolute',
    width: '180px',
    height: '180px',
    fill: 'none',
    stroke: '#FF3B30',
    strokeWidth: 1,
  },
  metricsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: '20px',
    marginBottom: '48px',
  },
  metricItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  metricInfo: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '11px',
    fontFamily: "'Courier New', monospace",
    color: '#8E8E93',
  },
  metricLabel: {
    color: '#111111',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  barContainer: {
    width: '100%',
    height: '4px',
    backgroundColor: '#F2F2F7',
    position: 'relative',
  },
  barFill: {
    height: '100%',
    backgroundColor: '#FF3B30',
    position: 'absolute',
    left: 0,
    top: 0,
  },
  historyList: {
    display: 'flex',
    flexDirection: 'column',
  },
  historyItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 0',
    borderBottom: '1px solid #F2F2F7',
  },
  timestamp: {
    fontFamily: "'Courier New', monospace",
    fontSize: '13px',
    color: '#111111',
  },
  resultTag: {
    fontSize: '11px',
    padding: '4px 8px',
    background: 'rgba(255, 59, 48, 0.15)',
    color: '#FF3B30',
    fontWeight: 500,
  },
};

const SectionTitle = ({ children }) => (
  <div style={customStyles.sectionTitleWrapper}>
    <span style={customStyles.sectionTitleText}>{children}</span>
    <div style={customStyles.sectionTitleLine}></div>
  </div>
);

const MetricItem = ({ label, value, percentage }) => (
  <div style={customStyles.metricItem}>
    <div style={customStyles.metricInfo}>
      <span style={customStyles.metricLabel}>{label}</span>
      <span>{value}</span>
    </div>
    <div style={customStyles.barContainer}>
      <div style={{ ...customStyles.barFill, width: `${percentage}%` }}></div>
    </div>
  </div>
);

const HistoryItem = ({ timestamp, result }) => (
  <div style={customStyles.historyItem}>
    <div style={customStyles.timestamp}>{timestamp}</div>
    <div style={customStyles.resultTag}>{result}</div>
  </div>
);

const ProfilePage = () => {
  const [closed, setClosed] = useState(false);

  const metrics = [
    { label: 'Cognitive Fluidity', value: '88%', percentage: 88 },
    { label: 'Emotional Stability', value: '62%', percentage: 62 },
    { label: 'Social Intuition', value: '45%', percentage: 45 },
  ];

  const history = [
    { timestamp: '2023.10.24 — 14:02', result: 'ARCHITECT' },
    { timestamp: '2023.08.12 — 09:45', result: 'OBSERVER' },
    { timestamp: '2023.05.30 — 22:18', result: 'CATALYST' },
  ];

  if (closed) {
    return (
      <div style={{ ...customStyles.body, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ ...customStyles.logo, justifyContent: 'center', marginBottom: '16px' }}>
            <div style={customStyles.logoDot}></div>
            PSYCHE.AI
          </div>
          <p style={{ color: '#8E8E93', fontSize: '13px', fontFamily: "'Courier New', monospace" }}>Profile closed.</p>
          <button
            onClick={() => setClosed(false)}
            style={{
              marginTop: '24px',
              padding: '10px 20px',
              background: 'rgba(255, 59, 48, 0.15)',
              color: '#FF3B30',
              border: 'none',
              cursor: 'pointer',
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '0.1em',
            }}
          >
            REOPEN PROFILE
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={customStyles.body}>
      <header style={customStyles.header}>
        <div style={customStyles.logo}>
          <div style={customStyles.logoDot}></div>
          PSYCHE.AI
        </div>
        <div style={customStyles.closeBtn} onClick={() => setClosed(true)}>×</div>
      </header>

      <div style={customStyles.content}>
        <div style={customStyles.profileHeader}>
          <div style={customStyles.idLabel}>Participant_ID: 8404-XJ</div>
          <h1 style={customStyles.h1}>使用者檔案</h1>
        </div>

        <SectionTitle>PSYCHE EVOLUTION MAP</SectionTitle>
        <div style={customStyles.psycheMapContainer}>
          <div style={customStyles.mapGrid}>
            <div style={customStyles.mapAxisV}></div>
            <div style={customStyles.mapAxisH}></div>
          </div>
          <svg style={customStyles.psycheLayerOld} viewBox="0 0 100 100">
            <polygon points="50,20 80,40 70,80 30,80 20,40" />
          </svg>
          <svg style={customStyles.psycheLayerCurrent} viewBox="0 0 100 100">
            <polygon points="50,10 90,45 75,90 25,85 15,35" />
          </svg>
        </div>

        <SectionTitle>CORE METRICS</SectionTitle>
        <div style={customStyles.metricsGrid}>
          {metrics.map((metric, index) => (
            <MetricItem
              key={index}
              label={metric.label}
              value={metric.value}
              percentage={metric.percentage}
            />
          ))}
        </div>

        <SectionTitle>ASSESSMENT HISTORY</SectionTitle>
        <div style={customStyles.historyList}>
          {history.map((item, index) => (
            <HistoryItem
              key={index}
              timestamp={item.timestamp}
              result={item.result}
            />
          ))}
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
      body { background-color: #f5f5f5; }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  return (
    <Router basename="/">
      <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5', display: 'flex', justifyContent: 'center', alignItems: 'flex-start', paddingTop: '0' }}>
        <Routes>
          <Route path="/" element={<ProfilePage />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;