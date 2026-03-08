import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@300;400;500;700&display=swap');

  :root {
    --c-red: #FF3B30;
    --c-red-dim: rgba(255, 59, 48, 0.4);
    --c-bg: #FFFFFF;
    --c-text-main: #111111;
    --c-text-muted: #8E8E93;
    --c-ui-bg: rgba(255, 255, 255, 0.9);
    --font-main: 'Noto Sans JP', sans-serif;
  }

  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  html, body, #root {
    width: 100%;
    height: 100%;
    overflow: hidden;
  }

  body {
    background-color: var(--c-bg);
    font-family: var(--font-main);
    color: var(--c-text-main);
    overflow: hidden;
    width: 100vw;
    height: 100vh;
  }

  #webgl-container {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 1;
    mask-image: linear-gradient(to bottom, black 70%, transparent 100%);
    -webkit-mask-image: linear-gradient(to bottom, black 70%, transparent 100%);
  }

  @keyframes pulse {
    0% { transform: scale(0.8); opacity: 1; }
    50% { transform: scale(1.5); opacity: 0.5; }
    100% { transform: scale(0.8); opacity: 1; }
  }

  .pulse-indicator {
    width: 6px;
    height: 6px;
    background-color: #FF3B30;
    border-radius: 50%;
    animation: pulse 2s infinite;
    flex-shrink: 0;
  }

  .cta-btn {
    background-color: transparent;
    color: #FF3B30;
    border: 1px solid #FF3B30;
    padding: 16px 32px;
    font-size: 14px;
    font-weight: 500;
    letter-spacing: 0.05em;
    cursor: pointer;
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    transition: all 0.3s cubic-bezier(0.23, 1, 0.32, 1);
    position: relative;
    overflow: hidden;
    font-family: 'Noto Sans JP', sans-serif;
  }

  .cta-btn:hover {
    background-color: #FF3B30;
    color: white;
  }

  .cta-btn .arrow {
    font-size: 16px;
    transition: transform 0.3s ease;
  }

  .cta-btn:hover .arrow {
    transform: translateX(4px);
  }

  .vertical-status {
    position: absolute;
    right: 24px;
    top: 120px;
    writing-mode: vertical-rl;
    text-orientation: upright;
    font-size: 11px;
    color: #8E8E93;
    letter-spacing: 0.2em;
    line-height: 1.8;
    height: 200px;
    pointer-events: none;
    z-index: 3;
  }
`;

const GlobeCanvas = () => {
  const containerRef = useRef(null);
  const animationRef = useRef(null);
  const rendererRef = useRef(null);

  useEffect(() => {
    if (!window.THREE) return;
    const THREE = window.THREE;
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0xffffff, 0.08);

    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.z = 5.5;
    camera.position.y = 0.5;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const globeGroup = new THREE.Group();
    scene.add(globeGroup);

    const GLOBE_RADIUS = 1.8;
    const RED_COLOR = 0xFF3B30;

    function createDashedCircle(radius, segments, isVertical = false) {
      const geometry = new THREE.BufferGeometry();
      const vertices = [];
      for (let i = 0; i <= segments; i++) {
        const theta = (i / segments) * Math.PI * 2;
        const x = radius * Math.cos(theta);
        const z = radius * Math.sin(theta);
        vertices.push(x, 0, z);
      }
      geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
      const material = new THREE.LineDashedMaterial({
        color: RED_COLOR,
        dashSize: 0.05,
        gapSize: 0.05,
        linewidth: 1,
        opacity: 0.6,
        transparent: true
      });
      const line = new THREE.Line(geometry, material);
      line.computeLineDistances();
      if (isVertical) {
        line.rotation.x = Math.PI / 2;
        line.rotation.z = Math.PI / 2;
      }
      return line;
    }

    const latCount = 8;
    for (let i = 1; i < latCount; i++) {
      const phi = (i / latCount) * Math.PI;
      const y = GLOBE_RADIUS * Math.cos(phi);
      const r_slice = GLOBE_RADIUS * Math.sin(phi);
      const circle = createDashedCircle(r_slice, 64);
      circle.position.y = y;
      globeGroup.add(circle);
    }

    const equator = createDashedCircle(GLOBE_RADIUS, 64);
    globeGroup.add(equator);

    const longCount = 8;
    for (let i = 0; i < longCount; i++) {
      const circle = createDashedCircle(GLOBE_RADIUS, 64, true);
      circle.rotation.y = (i / longCount) * Math.PI;
      globeGroup.add(circle);
    }

    const pulsesGroup = new THREE.Group();
    globeGroup.add(pulsesGroup);

    const pulseCount = 40;
    const pulses = [];

    const lineGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, 1, 0)
    ]);
    const lineMat = new THREE.LineBasicMaterial({
      color: RED_COLOR,
      transparent: true,
      opacity: 0.8
    });

    const dotGeo = new THREE.CircleGeometry(0.02, 8);
    const dotMat = new THREE.MeshBasicMaterial({ color: RED_COLOR });

    for (let i = 0; i < pulseCount; i++) {
      const phi = Math.acos(-1 + (2 * i) / pulseCount);
      const theta = Math.sqrt(pulseCount * Math.PI) * phi;

      const x = GLOBE_RADIUS * Math.cos(theta) * Math.sin(phi);
      const y = GLOBE_RADIUS * Math.sin(theta) * Math.sin(phi);
      const z = GLOBE_RADIUS * Math.cos(phi);

      const position = new THREE.Vector3(x, y, z);
      const markerGroup = new THREE.Group();
      markerGroup.position.copy(position);
      markerGroup.lookAt(new THREE.Vector3(0, 0, 0));

      const dot = new THREE.Mesh(dotGeo, dotMat);
      dot.rotation.x = Math.PI / 2;
      markerGroup.add(dot);

      const line = new THREE.Line(lineGeo, lineMat);
      line.rotation.x = Math.PI / 2;
      line.scale.set(1, 0, 1);
      markerGroup.add(line);

      pulsesGroup.add(markerGroup);

      pulses.push({
        line: line,
        maxHeight: 0.2 + Math.random() * 0.8,
        speed: 0.02 + Math.random() * 0.03,
        phase: Math.random() * Math.PI * 2,
        baseOpacity: 0.3 + Math.random() * 0.7
      });
    }

    let time = 0;

    function animate() {
      animationRef.current = requestAnimationFrame(animate);
      time += 0.01;

      globeGroup.rotation.y += 0.0015;
      globeGroup.rotation.x = Math.sin(time * 0.2) * 0.1;

      pulses.forEach(p => {
        const val = Math.sin(time * 3 + p.phase);
        const norm = (val + 1) / 2;
        const currentHeight = p.maxHeight * norm;
        p.line.scale.set(1, Math.max(0.01, currentHeight), 1);
      });

      renderer.render(scene, camera);
    }

    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      if (rendererRef.current) {
        rendererRef.current.dispose();
        if (container && rendererRef.current.domElement && container.contains(rendererRef.current.domElement)) {
          container.removeChild(rendererRef.current.domElement);
        }
      }
    };
  }, []);

  return <div id="webgl-container" ref={containerRef} />;
};

const HomePage = () => {
  const [counter, setCounter] = useState(8402);
  const [threeLoaded, setThreeLoaded] = useState(!!window.THREE);

  useEffect(() => {
    if (!window.THREE) {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
      script.onload = () => setThreeLoaded(true);
      document.head.appendChild(script);
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.95) {
        setCounter(prev => prev + Math.floor(Math.random() * 3) - 1);
      }
    }, 100);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden', backgroundColor: '#FFFFFF', fontFamily: "'Noto Sans JP', sans-serif" }}>
      {threeLoaded && <GlobeCanvas key="globe" />}

      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 2,
        pointerEvents: 'none',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between'
      }}>
        <header style={{
          padding: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          pointerEvents: 'auto'
        }}>
          <div style={{
            fontWeight: 700,
            fontSize: '14px',
            letterSpacing: '0.05em',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <div style={{
              width: '8px',
              height: '8px',
              backgroundColor: '#FF3B30',
              borderRadius: '50%'
            }} />
            PSYCHE.AI
          </div>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            width: '24px',
            cursor: 'pointer'
          }}>
            <div style={{ width: '100%', height: '1px', backgroundColor: '#111111' }} />
            <div style={{ width: '18px', height: '1px', backgroundColor: '#111111', marginLeft: 'auto' }} />
          </div>
        </header>

        <div className="vertical-status">
          現在の活動
          <br />
          <span style={{ opacity: 0.5 }}>——————</span>
          <br />
          リアルタイム
        </div>

        <div style={{
          padding: '32px 24px 48px 24px',
          pointerEvents: 'auto',
          background: 'linear-gradient(to top, #ffffff 80%, rgba(255,255,255,0))'
        }}>
          <div style={{
            fontFamily: "'Courier New', monospace",
            fontSize: '12px',
            color: '#FF3B30',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <div className="pulse-indicator" />
            <span>{counter.toLocaleString()}</span> PARTICIPANTS ACTIVE
          </div>

          <h1 style={{
            fontSize: '42px',
            fontWeight: 300,
            lineHeight: 1.1,
            marginBottom: '12px',
            letterSpacing: '-0.02em',
            color: '#111111'
          }}>
            心理測驗
          </h1>

          <div style={{
            fontSize: '14px',
            color: '#8E8E93',
            marginBottom: '32px',
            lineHeight: 1.6,
            maxWidth: '80%'
          }}>
            Discover the hidden architecture of your personality through our global real-time assessment network.
          </div>

          <button className="cta-btn">
            BEGIN ASSESSMENT
            <span className="arrow">→</span>
          </button>
        </div>
      </div>
    </div>
  );
};

const App = () => {
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = globalStyles;
    document.head.appendChild(style);
    return () => {
      if (document.head.contains(style)) {
        document.head.removeChild(style);
      }
    };
  }, []);

  return (
    <Router basename="/">
      <Routes>
        <Route path="/" element={<HomePage />} />
      </Routes>
    </Router>
  );
};

export default App;