import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

const customStyles = {
  root: {
    '--c-red': '#FF3B30',
    '--c-bg': '#FFFFFF',
    '--c-text-main': '#111111',
    '--c-text-muted': '#8E8E93',
  },
  body: {
    backgroundColor: '#FFFFFF',
    fontFamily: "'Noto Sans JP', sans-serif",
    color: '#111111',
    overflow: 'hidden',
    width: '390px',
    height: '844px',
    position: 'relative',
  },
  canvasContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    zIndex: 1,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    zIndex: 2,
    display: 'flex',
    flexDirection: 'column',
    pointerEvents: 'none',
  },
  header: {
    padding: '24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  statusContainer: {
    marginTop: 'auto',
    padding: '48px 24px 64px 24px',
    background: 'linear-gradient(to top, white 40%, transparent)',
  },
  processingLabel: {
    color: '#FF3B30',
    fontSize: '11px',
    fontWeight: 700,
    letterSpacing: '0.2em',
    marginBottom: '8px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  loaderBar: {
    width: '40px',
    height: '1px',
    background: '#eee',
    position: 'relative',
    overflow: 'hidden',
  },
  h2: {
    fontSize: '32px',
    fontWeight: 300,
    marginBottom: '8px',
    letterSpacing: '-0.01em',
  },
  jpStatus: {
    fontSize: '14px',
    color: '#8E8E93',
    letterSpacing: '0.05em',
  },
  dataPointInfo: {
    position: 'absolute',
    top: '120px',
    right: '24px',
    writingMode: 'vertical-rl',
    fontSize: '10px',
    color: '#8E8E93',
    opacity: 0.6,
    letterSpacing: '0.1em',
  },
  centerFocus: {
    position: 'absolute',
    top: '45%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '4px',
    height: '4px',
    backgroundColor: '#FF3B30',
    borderRadius: '50%',
    boxShadow: '0 0 20px #FF3B30',
  },
};

const ProcessingPage = () => {
  const canvasContainerRef = useRef(null);
  const animationRef = useRef(null);
  const rendererRef = useRef(null);

  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@100;300;400;700&display=swap');
      
      @keyframes slide {
        0% { left: -100%; }
        100% { left: 100%; }
      }
      
      .loader-fill-anim {
        position: absolute;
        height: 100%;
        width: 100%;
        background: #FF3B30;
        left: -100%;
        animation: slide 1.5s infinite ease-in-out;
      }

      * {
        box-sizing: border-box;
        -webkit-font-smoothing: antialiased;
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  useEffect(() => {
    if (!canvasContainerRef.current) return;

    const THREE = window.THREE;
    if (!THREE) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, 390 / 844, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

    renderer.setSize(390, 844);
    renderer.setPixelRatio(window.devicePixelRatio);
    canvasContainerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const globeGeo = new THREE.SphereGeometry(2, 32, 32);
    const globeMat = new THREE.MeshBasicMaterial({
      color: 0xff3b30,
      wireframe: true,
      transparent: true,
      opacity: 0.05,
    });
    const globe = new THREE.Mesh(globeGeo, globeMat);
    scene.add(globe);

    const streamCount = 60;
    const streams = [];

    for (let i = 0; i < streamCount; i++) {
      const radius = 2 + Math.random() * 3;
      const phi = Math.random() * Math.PI * 2;
      const theta = Math.random() * Math.PI;

      const start = new THREE.Vector3(
        radius * Math.sin(theta) * Math.cos(phi),
        radius * Math.sin(theta) * Math.sin(phi),
        radius * Math.cos(theta)
      );

      const end = new THREE.Vector3(0, 0, 0);

      const curve = new THREE.LineCurve3(start, end);
      const geometry = new THREE.BufferGeometry().setFromPoints(curve.getPoints(50));
      const material = new THREE.LineDashedMaterial({
        color: 0xff3b30,
        dashSize: 0.2,
        gapSize: 0.1,
        transparent: true,
        opacity: 0.4,
      });

      const line = new THREE.Line(geometry, material);
      line.computeLineDistances();
      scene.add(line);

      streams.push({
        line: line,
        offset: Math.random() * 10,
        speed: 0.02 + Math.random() * 0.03,
      });
    }

    camera.position.z = 6;
    camera.position.y = 0.5;

    let frameId;
    function animate() {
      frameId = requestAnimationFrame(animate);

      globe.rotation.y += 0.002;
      globe.rotation.x += 0.001;

      streams.forEach((s) => {
        s.offset -= s.speed;
        s.line.material.dashOffset = s.offset;

        const op = 0.1 + Math.abs(Math.sin(Date.now() * 0.001 + s.offset)) * 0.3;
        s.line.material.opacity = op;
      });

      renderer.render(scene, camera);
    }

    animate();
    animationRef.current = frameId;

    return () => {
      cancelAnimationFrame(frameId);
      renderer.dispose();
      if (canvasContainerRef.current && renderer.domElement) {
        canvasContainerRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div style={customStyles.body}>
      <div id="canvas-container" ref={canvasContainerRef} style={customStyles.canvasContainer}></div>

      <div style={customStyles.overlay}>
        <header style={customStyles.header}>
          <div style={customStyles.logo}>
            <div style={customStyles.logoDot}></div>
            PSYCHE.AI
          </div>
        </header>

        <div style={customStyles.centerFocus}></div>

        <div style={customStyles.dataPointInfo}>
          NEURAL_MAPPING_SEQUENCE // シンクロナイズ中
        </div>

        <div style={customStyles.statusContainer}>
          <div style={customStyles.processingLabel}>
            <div style={customStyles.loaderBar}>
              <div className="loader-fill-anim"></div>
            </div>
            ANALYZING ARCHITECTURE
          </div>
          <h2 style={customStyles.h2}>Synthesizing Results...</h2>
          <p style={customStyles.jpStatus}>
            パーソナリティの構造を解析し、データを統合しています
          </p>
        </div>
      </div>
    </div>
  );
};

const App = () => {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
    script.async = true;
    document.head.appendChild(script);
    return () => {
      document.head.removeChild(script);
    };
  }, []);

  return (
    <Router basename="/">
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#000' }}>
        <Routes>
          <Route path="/" element={<ProcessingPage />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;