import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

const customStyles = {
  body: {
    backgroundColor: '#FFFFFF',
    fontFamily: "'Noto Sans JP', sans-serif",
    color: '#111111',
    width: '390px',
    height: '844px',
    overflow: 'hidden',
    position: 'relative',
    margin: '0 auto',
  },
  header: {
    padding: '24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'absolute',
    top: 0,
    width: '100%',
    zIndex: 10,
    background: 'linear-gradient(to bottom, white 50%, transparent)',
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
    cursor: 'pointer',
    lineHeight: 1,
  },
  mapContainer: {
    position: 'absolute',
    top: '80px',
    left: 0,
    width: '100%',
    height: '240px',
    opacity: 0.2,
    pointerEvents: 'none',
  },
  mapSvg: {
    width: '100%',
    height: '100%',
    fill: 'none',
    stroke: '#FF3B30',
    strokeWidth: 0.5,
    strokeDasharray: '2 2',
  },
  content: {
    position: 'absolute',
    top: '280px',
    left: 0,
    width: '100%',
    height: 'calc(100% - 280px)',
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
  },
  sectionLabel: {
    fontSize: '11px',
    color: '#FF3B30',
    letterSpacing: '0.1em',
    marginBottom: '8px',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontWeight: 700,
  },
  sectionLabelDot: {
    width: '4px',
    height: '4px',
    background: '#FF3B30',
    borderRadius: '50%',
  },
  h1: {
    fontSize: '28px',
    fontWeight: 300,
    marginBottom: '24px',
  },
  leaderboard: {
    display: 'flex',
    gap: '12px',
    marginBottom: '32px',
    overflowX: 'auto',
    paddingBottom: '8px',
    scrollbarWidth: 'none',
  },
  rankCard: {
    minWidth: '140px',
    border: '1px solid #E5E5EA',
    padding: '16px',
    position: 'relative',
    flexShrink: 0,
  },
  rankNum: {
    fontSize: '10px',
    color: '#8E8E93',
    marginBottom: '12px',
  },
  rankTitle: {
    fontSize: '14px',
    fontWeight: 500,
    marginBottom: '4px',
  },
  rankStat: {
    fontFamily: 'monospace',
    fontSize: '11px',
    color: '#FF3B30',
  },
  feedContainer: {
    flex: 1,
    overflow: 'hidden',
    position: 'relative',
  },
  feedFade: {
    content: '""',
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: '100%',
    height: '60px',
    background: 'linear-gradient(to top, white, transparent)',
    pointerEvents: 'none',
    zIndex: 2,
  },
  feedScroll: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1px',
  },
  feedItem: {
    padding: '16px 0',
    borderBottom: '1px solid #F2F2F7',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  userId: {
    fontSize: '12px',
    fontWeight: 500,
  },
  userMeta: {
    fontSize: '10px',
    color: '#8E8E93',
    display: 'flex',
    gap: '8px',
  },
  resultTag: {
    fontSize: '11px',
    color: '#FF3B30',
    border: '1px solid rgba(255, 59, 48, 0.1)',
    padding: '2px 8px',
    background: 'rgba(255, 59, 48, 0.1)',
  },
  footerAction: {
    padding: '24px',
    borderTop: '1px solid #E5E5EA',
    background: 'white',
    zIndex: 10,
    position: 'absolute',
    bottom: 0,
    width: '100%',
  },
  btnSecondary: {
    width: '100%',
    border: '1px solid #111111',
    background: 'transparent',
    padding: '16px',
    fontSize: '13px',
    letterSpacing: '0.05em',
    fontWeight: 500,
    cursor: 'pointer',
    fontFamily: "'Noto Sans JP', sans-serif",
  },
};

const feedData = [
  { id: '#8402', meta: 'JP · 2s ago · Mobile', result: 'THE ADVOCATE' },
  { id: '#8399', meta: 'US · 14s ago · Desktop', result: 'THE LOGICIAN' },
  { id: '#8395', meta: 'DE · 31s ago · Mobile', result: 'THE ARCHITECT' },
  { id: '#8391', meta: 'SG · 1m ago · Mobile', result: 'THE CAMPAIGNER' },
  { id: '#8388', meta: 'FR · 2m ago · Desktop', result: 'THE PROTAGONIST' },
  { id: '#8384', meta: 'BR · 3m ago · Mobile', result: 'THE COMMANDER' },
  { id: '#8380', meta: 'KR · 4m ago · Desktop', result: 'THE MEDIATOR' },
  { id: '#8376', meta: 'UK · 5m ago · Mobile', result: 'THE DEBATER' },
  { id: '#8372', meta: 'AU · 6m ago · Desktop', result: 'THE EXECUTIVE' },
  { id: '#8368', meta: 'CA · 7m ago · Mobile', result: 'THE CONSUL' },
];

const PulseCircle = ({ cx, cy, delay }) => {
  const [r, setR] = useState(2);
  const [opacity, setOpacity] = useState(1);

  useEffect(() => {
    let start = null;
    let animFrame;
    const duration = 2000;
    const delayMs = delay * 1000;

    const animate = (timestamp) => {
      if (!start) start = timestamp - (delayMs % duration);
      const elapsed = (timestamp - start) % duration;
      const progress = elapsed / duration;
      setR(2 + progress * 4);
      setOpacity(1 - progress);
      animFrame = requestAnimationFrame(animate);
    };

    animFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animFrame);
  }, [delay]);

  return <circle cx={cx} cy={cy} r={r} fill="#FF3B30" opacity={opacity} />;
};

const LiveActivityPage = () => {
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@300;400;500;700&display=swap');
      .leaderboard-scroll::-webkit-scrollbar { display: none; }
      .leaderboard-scroll { scrollbar-width: none; }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  useEffect(() => {
    let animFrame;
    let lastTime = null;
    const speed = 0.5;

    const doubledHeight = feedData.length * 49;

    const animate = (timestamp) => {
      if (!lastTime) lastTime = timestamp;
      const delta = timestamp - lastTime;
      lastTime = timestamp;
      setOffset((prev) => {
        const next = prev + speed * (delta / 16.67);
        if (next >= doubledHeight) return 0;
        return next;
      });
      animFrame = requestAnimationFrame(animate);
    };

    animFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animFrame);
  }, []);

  const doubled = [...feedData, ...feedData];

  return (
    <div style={customStyles.body}>
      <header style={customStyles.header}>
        <div style={customStyles.logo}>
          <div style={customStyles.logoDot}></div>
          PSYCHE.AI
        </div>
        <div style={customStyles.closeBtn}>✕</div>
      </header>

      <div style={customStyles.mapContainer}>
        <svg style={customStyles.mapSvg} viewBox="0 0 800 400">
          <path d="M150,120 L200,100 L250,130 L220,180 L140,170 Z" />
          <path d="M400,80 L500,70 L550,150 L480,220 L420,180 Z" />
          <path d="M600,120 L680,100 L720,180 L650,230 Z" />
          <path d="M200,250 L280,240 L300,320 L220,350 Z" />
          <PulseCircle cx={210} cy={140} delay={0} />
          <PulseCircle cx={480} cy={120} delay={0.5} />
          <PulseCircle cx={660} cy={160} delay={1.2} />
          <PulseCircle cx={260} cy={280} delay={0.8} />
        </svg>
      </div>

      <div style={customStyles.content}>
        <div style={customStyles.sectionLabel}>
          <span style={customStyles.sectionLabelDot}></span> GLOBAL TRENDS
        </div>
        <h1 style={customStyles.h1}>リアルタイム統計</h1>

        <div style={customStyles.leaderboard} className="leaderboard-scroll">
          <div style={customStyles.rankCard}>
            <div style={customStyles.rankNum}>01 TOP ARCHETYPE</div>
            <div style={customStyles.rankTitle}>The Architect</div>
            <div style={customStyles.rankStat}>18.4% OCCURRENCE</div>
          </div>
          <div style={customStyles.rankCard}>
            <div style={customStyles.rankNum}>02 TRENDING</div>
            <div style={customStyles.rankTitle}>The Mediator</div>
            <div style={customStyles.rankStat}>↑ 4.2% GROWTH</div>
          </div>
          <div style={customStyles.rankCard}>
            <div style={customStyles.rankNum}>03 EMERGING</div>
            <div style={customStyles.rankTitle}>The Commander</div>
            <div style={customStyles.rankStat}>LATAM REGION</div>
          </div>
        </div>

        <div style={customStyles.sectionLabel}>
          <span style={customStyles.sectionLabelDot}></span> LIVE STREAM
        </div>

        <div style={customStyles.feedContainer}>
          <div style={customStyles.feedFade}></div>
          <div
            style={{
              ...customStyles.feedScroll,
              transform: `translateY(-${offset}px)`,
            }}
          >
            {doubled.map((item, idx) => (
              <div key={idx} style={customStyles.feedItem}>
                <div style={customStyles.userInfo}>
                  <div style={customStyles.userId}>User {item.id}</div>
                  <div style={customStyles.userMeta}>{item.meta}</div>
                </div>
                <div style={customStyles.resultTag}>{item.result}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={customStyles.footerAction}>
        <button style={customStyles.btnSecondary}>VIEW DETAILED ANALYTICS</button>
      </div>
    </div>
  );
};

const App = () => {
  return (
    <Router basename="/">
      <div style={{ minHeight: '100vh', backgroundColor: '#f0f0f0', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Routes>
          <Route path="/" element={<LiveActivityPage />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;