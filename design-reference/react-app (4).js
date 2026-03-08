import React, { useState, useEffect, useRef } from 'react';

const customStyles = {
  root: {
    '--c-red': '#FF3B30',
    '--c-red-dim': 'rgba(255, 59, 48, 0.1)',
    '--c-bg': '#FFFFFF',
    '--c-text-main': '#111111',
    '--c-text-muted': '#8E8E93',
    '--c-border': '#E5E5EA',
  },
  body: {
    backgroundColor: '#FFFFFF',
    fontFamily: "'Noto Sans JP', sans-serif",
    color: '#111111',
    overflow: 'hidden',
    width: '390px',
    height: '844px',
    position: 'relative',
    WebkitFontSmoothing: 'antialiased',
  },
  webglContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    zIndex: 1,
    opacity: 0.15,
    pointerEvents: 'none',
  },
  uiLayer: {
    position: 'relative',
    zIndex: 2,
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    padding: '24px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '40px',
    paddingTop: '10px',
  },
  logo: {
    fontWeight: 700,
    fontSize: '12px',
    letterSpacing: '0.1em',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  logoDot: {
    width: '6px',
    height: '6px',
    backgroundColor: '#FF3B30',
    borderRadius: '50%',
  },
  progressContainer: {
    flexGrow: 1,
    margin: '0 40px',
    height: '2px',
    background: '#E5E5EA',
    position: 'relative',
    overflow: 'hidden',
  },
  progressBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    height: '100%',
    width: '35%',
    background: '#FF3B30',
    transition: 'width 0.6s cubic-bezier(0.23, 1, 0.32, 1)',
  },
  stepCounter: {
    fontSize: '10px',
    color: '#8E8E93',
    letterSpacing: '0.1em',
    fontFamily: "'Courier New', monospace",
  },
  questionSection: {
    marginTop: '40px',
    flexGrow: 1,
  },
  questionLabel: {
    fontSize: '11px',
    color: '#FF3B30',
    letterSpacing: '0.2em',
    marginBottom: '16px',
    display: 'block',
  },
  h2: {
    fontSize: '26px',
    fontWeight: 300,
    lineHeight: 1.4,
    marginBottom: '48px',
    letterSpacing: '-0.01em',
  },
  optionsGrid: {
    display: 'grid',
    gap: '12px',
  },
  optionCard: {
    border: '1px solid #E5E5EA',
    padding: '20px',
    background: 'rgba(255, 255, 255, 0.6)',
    backdropFilter: 'blur(4px)',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  optionCardSelected: {
    border: '1px solid #FF3B30',
    padding: '20px',
    background: 'rgba(255, 59, 48, 0.1)',
    backdropFilter: 'blur(4px)',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  optionCardHover: {
    border: '1px solid #FF3B30',
    padding: '20px',
    background: 'rgba(255, 255, 255, 0.6)',
    backdropFilter: 'blur(4px)',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  optionText: {
    fontSize: '14px',
    fontWeight: 400,
    color: '#111111',
  },
  optionIndex: {
    fontFamily: "'Courier New', monospace",
    fontSize: '10px',
    color: '#8E8E93',
  },
  footerNav: {
    marginTop: '40px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: '20px',
  },
  backLink: {
    fontSize: '12px',
    color: '#8E8E93',
    textDecoration: 'none',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    cursor: 'pointer',
  },
  skipBtn: {
    fontSize: '12px',
    letterSpacing: '0.05em',
    color: '#111111',
    border: 'none',
    background: 'none',
    cursor: 'pointer',
    opacity: 0.6,
    fontFamily: "'Noto Sans JP', sans-serif",
  },
};

const options = [
  { text: '常に意識の一部となっている', index: 'A' },
  { text: '集中が必要な時だけ感じる', index: 'B' },
  { text: '意識することは稀である', index: 'C' },
  { text: '全く関係がないと感じる', index: 'D' },
];

const GlobeCanvas = ({ containerRef }) => {
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !window.THREE) return;

    const THREE = window.THREE;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 390 / 844, 0.1, 100);
    camera.position.z = 5.5;
    camera.position.y = 0;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(390, 844);
    container.appendChild(renderer.domElement);

    const globeGroup = new THREE.Group();
    scene.add(globeGroup);

    const GLOBE_RADIUS = 2.2;
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
        dashSize: 0.1,
        gapSize: 0.1,
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

    for (let i = 1; i < 6; i++) {
      const phi = (i / 6) * Math.PI;
      const y = GLOBE_RADIUS * Math.cos(phi);
      const r_slice = GLOBE_RADIUS * Math.sin(phi);
      const circle = createDashedCircle(r_slice, 64);
      circle.position.y = y;
      globeGroup.add(circle);
    }

    for (let i = 0; i < 6; i++) {
      const circle = createDashedCircle(GLOBE_RADIUS, 64, true);
      circle.rotation.y = (i / 6) * Math.PI;
      globeGroup.add(circle);
    }

    let time = 0;
    let animId;
    function animate() {
      animId = requestAnimationFrame(animate);
      time += 0.005;
      globeGroup.rotation.y += 0.001;
      globeGroup.rotation.x = Math.sin(time * 0.2) * 0.05;
      renderer.render(scene, camera);
    }
    animate();

    return () => {
      cancelAnimationFrame(animId);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [containerRef]);

  return null;
};

const OptionCard = ({ text, index, isSelected, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);

  const cardStyle = isSelected
    ? customStyles.optionCardSelected
    : isHovered
    ? customStyles.optionCardHover
    : customStyles.optionCard;

  return (
    <div
      style={cardStyle}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <span style={customStyles.optionText}>{text}</span>
      <span style={customStyles.optionIndex}>{index}</span>
    </div>
  );
};

const App = () => {
  const [selectedOption, setSelectedOption] = useState('C');
  const webglRef = useRef(null);

  useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@300;400;500;700&display=swap';
    document.head.appendChild(link);
    return () => {
      if (document.head.contains(link)) {
        document.head.removeChild(link);
      }
    };
  }, []);

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      backgroundColor: '#f0f0f0',
    }}>
      <div style={customStyles.body}>
        <div ref={webglRef} style={customStyles.webglContainer}>
          <GlobeCanvas containerRef={webglRef} />
        </div>

        <div style={customStyles.uiLayer}>
          <header style={customStyles.header}>
            <div style={customStyles.logo}>
              <div style={customStyles.logoDot}></div>
              PSYCHE.AI
            </div>
            <div style={customStyles.stepCounter}>07 / 20</div>
          </header>

          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={customStyles.progressContainer}>
              <div style={customStyles.progressBar}></div>
            </div>
          </div>

          <main style={customStyles.questionSection}>
            <span style={customStyles.questionLabel}>INTRA-SENSE / 内部感覚</span>
            <h2 style={customStyles.h2}>
              静かな空間で、自分の鼓動が思考の速さを決めていると感じることはありますか？
            </h2>

            <div style={customStyles.optionsGrid}>
              {options.map((option) => (
                <OptionCard
                  key={option.index}
                  text={option.text}
                  index={option.index}
                  isSelected={selectedOption === option.index}
                  onClick={() => setSelectedOption(option.index)}
                />
              ))}
            </div>
          </main>

          <footer style={customStyles.footerNav}>
            <a href="#" style={customStyles.backLink}>← BACK</a>
            <button style={customStyles.skipBtn}>SKIP QUESTION</button>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default App;