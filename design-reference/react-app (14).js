import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

const customStyles = {
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
    minHeight: '844px',
    overflowX: 'hidden',
    overflowY: 'auto',
    position: 'relative',
    margin: '0 auto',
  },
  header: {
    position: 'fixed',
    top: 0,
    width: '390px',
    padding: '24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
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
    fontSize: '20px',
    fontWeight: 300,
    cursor: 'pointer',
  },
  content: {
    padding: '100px 24px 120px 24px',
  },
  sectionLabel: {
    fontSize: '10px',
    color: '#FF3B30',
    letterSpacing: '0.2em',
    marginBottom: '8px',
    display: 'block',
  },
  h1: {
    fontSize: '40px',
    fontWeight: 300,
    lineHeight: 1.2,
    marginBottom: '40px',
    letterSpacing: '-0.02em',
  },
  stepContainer: {
    position: 'relative',
    marginBottom: '80px',
  },
  stepNum: {
    fontFamily: "'Times New Roman', serif",
    fontStyle: 'italic',
    fontSize: '14px',
    color: '#FF3B30',
    marginBottom: '12px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  stepTitle: {
    fontSize: '32px',
    fontWeight: 300,
    marginBottom: '16px',
  },
  stepDesc: {
    fontSize: '14px',
    lineHeight: 1.8,
    color: '#8E8E93',
    marginBottom: '24px',
  },
  illustration: {
    width: '100%',
    height: '200px',
    border: '1px solid #F2F2F7',
    position: 'relative',
    overflow: 'hidden',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    background: '#FAFAFA',
  },
  gridBg: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundImage: 'radial-gradient(rgba(255, 59, 48, 0.1) 1px, transparent 1px)',
    backgroundSize: '20px 20px',
    opacity: 0.5,
  },
  nodesContainer: {
    position: 'relative',
    width: '120px',
    height: '120px',
  },
  node: {
    position: 'absolute',
    width: '6px',
    height: '6px',
    background: '#FF3B30',
    borderRadius: '50%',
  },
  connection: {
    position: 'absolute',
    height: '1px',
    background: '#FF3B30',
    transformOrigin: 'left center',
    opacity: 0.2,
  },
  layers: {
    width: '140px',
    height: '100px',
    position: 'relative',
    transform: 'skewX(-15deg)',
  },
  layer: {
    position: 'absolute',
    width: '100%',
    height: '30px',
    border: '1px dashed #FF3B30',
    background: 'rgba(255, 255, 255, 0.5)',
  },
  footerNav: {
    position: 'fixed',
    bottom: 0,
    width: '390px',
    padding: '24px',
    background: 'linear-gradient(to top, white 80%, transparent)',
    zIndex: 100,
  },
  progressTrack: {
    width: '100%',
    height: '2px',
    background: '#E5E5EA',
    marginBottom: '24px',
    position: 'relative',
  },
  ctaBtn: {
    backgroundColor: '#FF3B30',
    color: 'white',
    border: 'none',
    padding: '18px',
    fontSize: '14px',
    fontWeight: 500,
    letterSpacing: '0.1em',
    cursor: 'pointer',
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    textTransform: 'uppercase',
  },
  captionEn: {
    fontSize: '10px',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    color: '#8E8E93',
    marginTop: '4px',
    display: 'block',
    marginBottom: '16px',
  },
};

const PulseAnimation = () => {
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@100;300;400;500;700&display=swap');
      @keyframes pulse {
        0% { transform: scale(1); opacity: 0.8; }
        50% { transform: scale(1.3); opacity: 0.3; }
        100% { transform: scale(1); opacity: 0.8; }
      }
      .result-dot-animated {
        animation: pulse 2s infinite;
      }
      * {
        box-sizing: border-box;
        -webkit-font-smoothing: antialiased;
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);
  return null;
};

const StepNumLine = ({ children }) => (
  <div style={customStyles.stepNum}>
    {children}
    <span style={{ display: 'inline-block', height: '1px', width: '40px', background: '#FF3B30' }}></span>
  </div>
);

const Step1Illustration = () => (
  <div style={customStyles.illustration}>
    <div style={customStyles.gridBg}></div>
    <div style={customStyles.nodesContainer}>
      <div style={{ ...customStyles.node, top: '10%', left: '50%' }}></div>
      <div style={{ ...customStyles.node, top: '40%', left: '10%' }}></div>
      <div style={{ ...customStyles.node, top: '40%', left: '90%' }}></div>
      <div style={{ ...customStyles.node, top: '80%', left: '30%' }}></div>
      <div style={{ ...customStyles.node, top: '80%', left: '70%' }}></div>
      <div style={{ ...customStyles.connection, width: '70px', top: '15%', left: '52%', transform: 'rotate(40deg)' }}></div>
      <div style={{ ...customStyles.connection, width: '70px', top: '15%', left: '48%', transform: 'rotate(140deg)' }}></div>
    </div>
  </div>
);

const Step2Illustration = () => (
  <div style={customStyles.illustration}>
    <div style={customStyles.gridBg}></div>
    <div style={customStyles.layers}>
      <div style={{ ...customStyles.layer, top: 0, zIndex: 3 }}></div>
      <div style={{ ...customStyles.layer, top: '20px', zIndex: 2, opacity: 0.4 }}></div>
      <div style={{ ...customStyles.layer, top: '40px', zIndex: 1, opacity: 0.2 }}></div>
    </div>
  </div>
);

const Step3Illustration = () => (
  <div style={customStyles.illustration}>
    <div style={customStyles.gridBg}></div>
    <div
      className="result-dot-animated"
      style={{
        width: '40px',
        height: '40px',
        border: '1px solid #FF3B30',
        borderRadius: '50%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <div style={{ width: '4px', height: '4px', background: '#FF3B30', borderRadius: '50%' }}></div>
    </div>
  </div>
);

const MethodologyPage = () => {
  const [scrollProgress, setScrollProgress] = useState(0);
  const contentRef = useRef(null);
  const containerRef = useRef(null);

  const handleScroll = () => {
    if (containerRef.current) {
      const el = containerRef.current;
      const scrollTop = el.scrollTop;
      const scrollHeight = el.scrollHeight - el.clientHeight;
      const progress = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
      setScrollProgress(progress);
    }
  };

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      style={{
        ...customStyles.body,
        height: '844px',
        overflowY: 'auto',
        position: 'relative',
      }}
    >
      <PulseAnimation />

      {/* Header */}
      <header style={customStyles.header}>
        <div style={customStyles.logo}>
          <div style={customStyles.logoDot}></div>
          PSYCHE.AI
        </div>
        <div style={customStyles.closeBtn}>✕</div>
      </header>

      {/* Content */}
      <div ref={contentRef} style={customStyles.content}>
        <span style={customStyles.sectionLabel}>METHODOLOGY</span>
        <h1 style={customStyles.h1}>解析の仕組み</h1>

        {/* Step 01 */}
        <div style={customStyles.stepContainer}>
          <StepNumLine>Step 01</StepNumLine>
          <h2 style={customStyles.stepTitle}>生体信号の収集</h2>
          <span style={customStyles.captionEn}>BIOMETRIC DATA HARVESTING</span>
          <p style={customStyles.stepDesc}>
            スマートデバイスを通じて、心拍数や反応速度など、意識下に現れない微細な生体反応をリアルタイムでキャプチャします。
          </p>
          <Step1Illustration />
        </div>

        {/* Step 02 */}
        <div style={customStyles.stepContainer}>
          <StepNumLine>Step 02</StepNumLine>
          <h2 style={customStyles.stepTitle}>多角的深層分析</h2>
          <span style={customStyles.captionEn}>MULTI-LAYERED COGNITIVE ANALYSIS</span>
          <p style={customStyles.stepDesc}>
            収集されたデータは独自のニューラルネットワークを通過し、あなたの深層心理に隠されたパターンを特定します。
          </p>
          <Step2Illustration />
        </div>

        {/* Step 03 */}
        <div style={{ ...customStyles.stepContainer, marginBottom: '40px' }}>
          <StepNumLine>Step 03</StepNumLine>
          <h2 style={customStyles.stepTitle}>人格の可視化</h2>
          <span style={customStyles.captionEn}>PERSONALITY ARCHITECTURE MAPPING</span>
          <p style={customStyles.stepDesc}>
            分析結果は幾何学的なモデルとして再構築され、言葉では表現しきれない「真実の自己」を提示します。
          </p>
          <Step3Illustration />
        </div>
      </div>

      {/* Footer Nav */}
      <div style={customStyles.footerNav}>
        <div style={customStyles.progressTrack}>
          <div
            style={{
              position: 'absolute',
              height: '100%',
              background: '#FF3B30',
              width: `${scrollProgress}%`,
              transition: 'width 0.3s ease',
            }}
          ></div>
        </div>
        <button style={customStyles.ctaBtn}>
          UNDERSTOOD &amp; START
        </button>
      </div>
    </div>
  );
};

const App = () => {
  return (
    <Router basename="/">
      <div style={{ display: 'flex', justifyContent: 'center', minHeight: '100vh', background: '#f0f0f0' }}>
        <Routes>
          <Route path="/" element={<MethodologyPage />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;