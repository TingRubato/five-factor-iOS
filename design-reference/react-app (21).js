import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

const styles = {
  root: {
    '--c-red': '#FF3B30',
    '--c-red-dim': 'rgba(255, 59, 48, 0.1)',
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
    position: 'relative',
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
  backBtn: {
    fontSize: '12px',
    color: '#8E8E93',
    textDecoration: 'none',
    letterSpacing: '0.05em',
    cursor: 'pointer',
    background: 'none',
    border: 'none',
  },
  heatmapContainer: {
    width: '100%',
    height: '180px',
    position: 'relative',
    padding: '0 24px',
    marginBottom: '24px',
  },
  mapSvg: {
    width: '100%',
    height: '100%',
    opacity: 0.1,
  },
  mapHotspot: {
    position: 'absolute',
    width: '4px',
    height: '4px',
    backgroundColor: '#FF3B30',
    borderRadius: '50%',
    boxShadow: '0 0 10px #FF3B30',
  },
  heatmapOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    pointerEvents: 'none',
  },
  liveLabel: {
    fontSize: '10px',
    color: '#FF3B30',
    letterSpacing: '0.2em',
    marginBottom: '4px',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  pulse: {
    width: '6px',
    height: '6px',
    backgroundColor: '#FF3B30',
    borderRadius: '50%',
  },
  contentWrap: {
    padding: '0 24px',
    height: '560px',
    overflowY: 'auto',
    scrollbarWidth: 'none',
  },
  h2: {
    fontSize: '28px',
    fontWeight: 300,
    marginBottom: '8px',
  },
  statsSummary: {
    fontSize: '12px',
    color: '#8E8E93',
    marginBottom: '32px',
    display: 'flex',
    gap: '16px',
  },
  leaderboardList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1px',
    background: '#F2F2F7',
  },
  rankItem: {
    background: 'white',
    padding: '20px 0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottom: '1px solid #F2F2F7',
  },
  rankInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  rankNumber: {
    fontFamily: 'monospace',
    fontSize: '12px',
    color: '#8E8E93',
    width: '20px',
  },
  archetypeName: {
    fontSize: '16px',
    fontWeight: 400,
    letterSpacing: '-0.01em',
  },
  rankData: {
    textAlign: 'right',
  },
  participantCount: {
    fontSize: '14px',
    fontWeight: 500,
    display: 'block',
  },
  growthIndicator: {
    fontSize: '10px',
    color: '#FF3B30',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: '4px',
  },
  growthIndicatorMuted: {
    fontSize: '10px',
    color: '#8E8E93',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: '4px',
  },
  footerAction: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: '100%',
    padding: '24px',
    background: 'linear-gradient(to top, white 80%, transparent)',
    zIndex: 10,
  },
  ctaBtn: {
    backgroundColor: 'transparent',
    color: '#FF3B30',
    border: '1px solid #FF3B30',
    padding: '16px',
    fontSize: '13px',
    fontWeight: 500,
    letterSpacing: '0.05em',
    width: '100%',
    cursor: 'pointer',
    textAlign: 'center',
    fontFamily: "'Noto Sans JP', sans-serif",
  },
};

const leaderboardData = [
  { rank: '01', name: 'Architect (INTJ-A)', count: '24,102', growth: 'Live +12%', stable: false },
  { rank: '02', name: 'Mediator (INFP-T)', count: '19,845', growth: 'Live +4%', stable: false },
  { rank: '03', name: 'Advocate (INFJ-A)', count: '18,221', growth: 'Stable', stable: true },
  { rank: '04', name: 'Logician (INTP-A)', count: '14,309', growth: 'Live +18%', stable: false },
  { rank: '05', name: 'Protagonist (ENFJ-T)', count: '12,110', growth: 'Live +2%', stable: false },
  { rank: '06', name: 'Commander (ENTJ)', count: '9,403', growth: 'Live +1%', stable: false, faded: true },
];

const RankItem = ({ rank, name, count, growth, stable, faded, isLast }) => (
  <div style={{ ...styles.rankItem, ...(isLast ? { borderBottom: 'none', opacity: 0.5 } : {}), ...(faded && !isLast ? { opacity: 0.5 } : {}) }}>
    <div style={styles.rankInfo}>
      <span style={styles.rankNumber}>{rank}</span>
      <span style={styles.archetypeName}>{name}</span>
    </div>
    <div style={styles.rankData}>
      <span style={styles.participantCount}>{count}</span>
      <span style={stable ? styles.growthIndicatorMuted : styles.growthIndicator}>{growth}</span>
    </div>
  </div>
);

const HomePage = () => {
  const [btnPressed, setBtnPressed] = useState(false);

  return (
    <div style={styles.body}>
      <header style={styles.header}>
        <div style={styles.logo}>
          <div style={styles.logoDot}></div>
          PSYCHE.AI
        </div>
        <button style={styles.backBtn}>CLOSE</button>
      </header>

      <div style={styles.heatmapContainer}>
        <svg style={styles.mapSvg} viewBox="0 0 400 200">
          <circle cx="80" cy="60" r="2" fill="currentColor" />
          <circle cx="120" cy="80" r="2" fill="currentColor" />
          <circle cx="280" cy="70" r="2" fill="currentColor" />
          <circle cx="320" cy="110" r="2" fill="currentColor" />
          <circle cx="100" cy="140" r="2" fill="currentColor" />
          <path
            d="M50,50 Q100,20 150,50 T250,50"
            fill="none"
            stroke="currentColor"
            strokeWidth="0.5"
            strokeDasharray="2,2"
          />
        </svg>
        <div style={{ ...styles.mapHotspot, top: '30%', left: '25%' }}></div>
        <div style={{ ...styles.mapHotspot, top: '45%', left: '75%' }}></div>
        <div style={{ ...styles.mapHotspot, top: '60%', left: '40%' }}></div>

        <div style={styles.heatmapOverlay}>
          <div style={styles.liveLabel}>
            <div style={styles.pulse}></div>
            LIVE NETWORK
          </div>
        </div>
      </div>

      <div style={styles.contentWrap}>
        <h2 style={styles.h2}>全球趨勢</h2>
        <div style={styles.statsSummary}>
          <span>24H ACTIVE: 142,804</span>
          <span>LATENCY: 14MS</span>
        </div>

        <div style={styles.leaderboardList}>
          {leaderboardData.map((item, index) => (
            <RankItem
              key={item.rank}
              rank={item.rank}
              name={item.name}
              count={item.count}
              growth={item.growth}
              stable={item.stable}
              faded={item.faded}
              isLast={index === leaderboardData.length - 1}
            />
          ))}
        </div>
      </div>

      <div style={styles.footerAction}>
        <button
          style={{
            ...styles.ctaBtn,
            opacity: btnPressed ? 0.7 : 1,
          }}
          onClick={() => {
            setBtnPressed(true);
            setTimeout(() => setBtnPressed(false), 200);
          }}
        >
          VIEW MY PLACEMENT
        </button>
      </div>
    </div>
  );
};

const App = () => {
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@300;400;500;700&display=swap');

      * {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
        -webkit-font-smoothing: antialiased;
      }

      body {
        background-color: #F2F2F7;
        display: flex;
        justify-content: center;
        align-items: flex-start;
        min-height: 100vh;
      }

      @keyframes pulse-ring {
        0% { transform: scale(1); opacity: 1; }
        100% { transform: scale(3); opacity: 0; }
      }

      .pulse-animate {
        animation: pulse-ring 2s infinite;
      }

      .content-scroll::-webkit-scrollbar {
        display: none;
      }
    `;
    document.head.appendChild(style);

    const pulseEl = document.querySelector('.pulse-dot');
    if (pulseEl) pulseEl.classList.add('pulse-animate');

    return () => document.head.removeChild(style);
  }, []);

  return (
    <Router basename="/">
      <div style={{ display: 'flex', justifyContent: 'center', backgroundColor: '#F2F2F7', minHeight: '100vh' }}>
        <Routes>
          <Route path="/" element={<HomePage />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;