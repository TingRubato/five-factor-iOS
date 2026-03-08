import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

const customStyles = {
  body: {
    backgroundColor: '#FFFFFF',
    fontFamily: "'Noto Sans JP', sans-serif",
    color: '#111111',
    overflow: 'hidden',
    width: '390px',
    height: '844px',
    borderRadius: '40px',
    position: 'relative',
  },
  webglContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    zIndex: 1,
    WebkitMaskImage: 'linear-gradient(to bottom, black 60%, transparent 100%)',
    maskImage: 'linear-gradient(to bottom, black 60%, transparent 100%)',
  },
  glitchOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    zIndex: 2,
    pointerEvents: 'none',
    background: 'repeating-linear-gradient(0deg, rgba(255,255,255,0) 0px, rgba(255,255,255,0) 1px, rgba(255,59,48,0.03) 2px, rgba(255,255,255,0) 3px)',
  },
  uiLayer: {
    position: 'relative',
    zIndex: 3,
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    pointerEvents: 'none',
  },
  header: {
    padding: '24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    pointerEvents: 'auto',
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
    backgroundColor: '#8E8E93',
    borderRadius: '50%',
  },
  bottomPanel: {
    padding: '32px 24px 64px 24px',
    pointerEvents: 'auto',
    background: 'linear-gradient(to top, #ffffff 70%, rgba(255,255,255,0))',
  },
  errorTag: {
    fontFamily: "'Courier New', monospace",
    fontSize: '11px',
    color: '#FF3B30',
    marginBottom: '12px',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    letterSpacing: '0.1em',
  },
  h1: {
    fontSize: '36px',
    fontWeight: 300,
    lineHeight: 1.2,
    marginBottom: '16px',
    letterSpacing: '-0.02em',
  },
  subhead: {
    fontSize: '14px',
    color: '#8E8E93',
    marginBottom: '40px',
    lineHeight: 1.7,
  },
  ctaBtn: {
    backgroundColor: 'transparent',
    color: '#FF3B30',
    border: '1px solid #FF3B30',
    padding: '18px 32px',
    fontSize: '14px',
    fontWeight: 500,
    letterSpacing: '0.08em',
    cursor: 'pointer',
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    transition: 'all 0.2s ease',
  },
  ctaBtnActive: {
    backgroundColor: '#FF3B30',
    color: 'white',
    transform: 'scale(0.98)',
  },
  verticalStatus: {
    position: 'absolute',
    right: '24px',
    top: '120px',
    writingMode: 'vertical-rl',
    textOrientation: 'upright',
    fontSize: '11px',
    color: '#FF3B30',
    letterSpacing: '0.2em',
    lineHeight: 1.8,
    pointerEvents: 'none',
    opacity: 0.8,
  },
};

const ConnectionLostPage = () => {
  const webglContainerRef = useRef(null);
  const [btnActive, setBtnActive] = useState(false);
  const [glitchOffset, setGlitchOffset] = useState(0);
  const animFrameRef = useRef(null);
  const rendererRef = useRef(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setGlitchOffset(prev => (prev + 2) % 100);
    }, 16);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const container = webglContainerRef.current;
    if (!container) return;
    if (typeof THREE === 'undefined') return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 390 / 844, 0.1, 100);
    camera.position.z = 5.5;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(390, 844);
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const globeGroup = new THREE.Group();
    scene.add(globeGroup);

    const RED_COLOR = 0xFF3B30;
    const RADIUS = 1.8;

    function createFragmentedCircle(radius, segments, isVertical = false) {
      const geometry = new THREE.BufferGeometry();
      const vertices = [];
      for (let i = 0; i <= segments; i++) {
        const theta = (i / segments) * Math.PI * 2;
        const jitter = (Math.random() - 0.5) * 0.1;
        const r = radius + jitter;
        const x = r * Math.cos(theta);
        const z = r * Math.sin(theta);
        vertices.push(x, 0, z);
      }
      geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
      const material = new THREE.LineDashedMaterial({
        color: RED_COLOR,
        dashSize: Math.random() * 0.2,
        gapSize: Math.random() * 0.3,
        opacity: 0.4,
        transparent: true,
      });
      const line = new THREE.Line(geometry, material);
      line.computeLineDistances();
      if (isVertical) {
        line.rotation.x = Math.PI / 2;
        line.rotation.z = Math.PI / 2;
      }
      return line;
    }

    for (let i = 0; i < 6; i++) {
      const circle = createFragmentedCircle(RADIUS, 32);
      circle.position.y = (i - 3) * 0.6;
      globeGroup.add(circle);
    }
    for (let i = 0; i < 4; i++) {
      const circle = createFragmentedCircle(RADIUS, 32, true);
      circle.rotation.y = (i / 4) * Math.PI;
      globeGroup.add(circle);
    }

    function animate() {
      animFrameRef.current = requestAnimationFrame(animate);
      globeGroup.rotation.y += 0.002;
      if (Math.random() > 0.97) {
        globeGroup.position.x = (Math.random() - 0.5) * 0.15;
        globeGroup.scale.setScalar(1 + (Math.random() - 0.5) * 0.05);
      } else {
        globeGroup.position.x *= 0.8;
        globeGroup.scale.setScalar(1);
      }
      renderer.render(scene, camera);
    }
    animate();

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  const handleBtnClick = () => {
    setBtnActive(true);
    setTimeout(() => setBtnActive(false), 200);
  };

  const glitchBg = `repeating-linear-gradient(0deg, rgba(255,255,255,0) 0px, rgba(255,255,255,0) 1px, rgba(255,59,48,0.03) 2px, rgba(255,255,255,0) 3px)`;

  return (
    <div style={customStyles.body}>
      <div ref={webglContainerRef} style={customStyles.webglContainer}></div>
      <div
        style={{
          ...customStyles.glitchOverlay,
          backgroundPosition: `0 ${glitchOffset}px`,
          background: glitchBg,
        }}
      ></div>

      <div style={customStyles.uiLayer}>
        <header style={customStyles.header}>
          <div style={customStyles.logo}>
            <div style={customStyles.logoDot}></div>
            PSYCHE.AI
          </div>
        </header>

        <div style={customStyles.verticalStatus}>
          接続エラー
          <br />
          <span style={{ opacity: 0.5 }}>——————</span>
          <br />
          オフライン
        </div>

        <div style={customStyles.bottomPanel}>
          <BlinkingErrorTag />
          <h1 style={customStyles.h1}>通信が中断されました</h1>
          <div style={customStyles.subhead}>
            リアルタイム・アセスメント・ネットワークへの接続が失われました。データの整合性を保つため、再接続を試みてください。
          </div>
          <button
            style={btnActive ? { ...customStyles.ctaBtn, ...customStyles.ctaBtnActive } : customStyles.ctaBtn}
            onMouseDown={() => setBtnActive(true)}
            onMouseUp={() => setBtnActive(false)}
            onTouchStart={() => setBtnActive(true)}
            onTouchEnd={() => setBtnActive(false)}
            onClick={handleBtnClick}
          >
            再接続を試行する
          </button>
        </div>
      </div>
    </div>
  );
};

const BlinkingErrorTag = () => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(v => !v);
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={customStyles.errorTag}>
      <div
        style={{
          width: '6px',
          height: '6px',
          backgroundColor: '#FF3B30',
          opacity: visible ? 1 : 0,
        }}
      ></div>
      NETWORK_DISCONNECTED [503]
    </div>
  );
};

const App = () => {
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@300;400;500;700&display=swap');
      * { box-sizing: border-box; margin: 0; padding: 0; -webkit-font-smoothing: antialiased; }
      body { background: #f0f0f0; display: flex; justify-content: center; align-items: center; min-height: 100vh; }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  return (
    <Router basename="/">
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          backgroundColor: '#f0f0f0',
        }}
      >
        <Routes>
          <Route path="/" element={<ConnectionLostPage />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;