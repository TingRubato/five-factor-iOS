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
    position: 'relative',
  },
  bgCanvas: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    zIndex: 1,
    opacity: 0.15,
    pointerEvents: 'none',
  },
  gridLine: {
    position: 'absolute',
    backgroundColor: '#FF3B30',
    opacity: 0.2,
  },
  container: {
    position: 'relative',
    zIndex: 2,
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    padding: '24px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '60px',
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
  progressContainer: {
    width: '100%',
    marginBottom: '80px',
  },
  progressMeta: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '10px',
    color: '#8E8E93',
    letterSpacing: '0.1em',
    marginBottom: '12px',
    textTransform: 'uppercase',
  },
  progressTrack: {
    height: '1px',
    width: '100%',
    backgroundColor: '#EEEEEE',
    position: 'relative',
  },
  progressFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    height: '100%',
    width: '8%',
    backgroundColor: '#FF3B30',
    transition: 'width 0.6s cubic-bezier(0.23, 1, 0.32, 1)',
  },
  questionSection: {
    flex: 1,
  },
  qNumber: {
    fontFamily: "'Courier New', monospace",
    fontSize: '12px',
    color: '#FF3B30',
    marginBottom: '16px',
  },
  h2: {
    fontSize: '28px',
    fontWeight: 300,
    lineHeight: 1.3,
    marginBottom: '60px',
    letterSpacing: '-0.01em',
  },
  sliderWrapper: {
    padding: '20px 0',
  },
  rangeLabels: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '40px',
    fontSize: '11px',
    color: '#8E8E93',
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
  },
  sliderContainer: {
    position: 'relative',
    height: '60px',
    display: 'flex',
    alignItems: 'center',
  },
  sliderLine: {
    position: 'absolute',
    width: '100%',
    height: '1px',
    backgroundColor: '#EEEEEE',
  },
  valueIndicator: {
    position: 'absolute',
    top: '-40px',
    fontFamily: "'Courier New', monospace",
    fontSize: '24px',
    color: '#FF3B30',
    fontWeight: 'bold',
    transform: 'translateX(-50%)',
    transition: 'left 0.1s ease',
  },
  scaleTicks: {
    position: 'absolute',
    width: '100%',
    display: 'flex',
    justifyContent: 'space-between',
    padding: '0 24px',
    pointerEvents: 'none',
  },
  tick: {
    width: '1px',
    height: '10px',
    backgroundColor: '#EEEEEE',
  },
  footer: {
    padding: '40px 0',
  },
  nextBtn: {
    backgroundColor: 'transparent',
    color: '#FF3B30',
    border: '1px solid #FF3B30',
    padding: '16px 32px',
    fontSize: '14px',
    fontWeight: 500,
    letterSpacing: '0.05em',
    cursor: 'pointer',
    width: '100%',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    transition: 'all 0.3s ease',
    fontFamily: "'Noto Sans JP', sans-serif",
  },
  nextBtnActive: {
    backgroundColor: '#FF3B30',
    color: 'white',
  },
};

const FlowLine = ({ left, delay }) => {
  const style = {
    position: 'absolute',
    width: '1px',
    height: '200px',
    background: 'linear-gradient(to bottom, transparent, #FF3B30, transparent)',
    left,
    animation: `flow 8s linear infinite`,
    animationDelay: delay,
  };
  return <div style={style} />;
};

const AssessmentPage = () => {
  const [sliderValue, setSliderValue] = useState(5);
  const [btnActive, setBtnActive] = useState(false);

  useEffect(() => {
    const styleEl = document.createElement('style');
    styleEl.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@300;400;500;700&display=swap');

      @keyframes flow {
        0% { transform: translateY(-100%); }
        100% { transform: translateY(100vh); }
      }

      .psyche-slider::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        width: 48px;
        height: 48px;
        background: #FFFFFF;
        border: 1px solid #FF3B30;
        border-radius: 50%;
        cursor: pointer;
        box-shadow: 0 4px 12px rgba(255, 59, 48, 0.1);
      }

      .psyche-slider {
        -webkit-appearance: none;
        width: 100%;
        height: 60px;
        background: transparent;
        outline: none;
        position: relative;
        z-index: 5;
        cursor: pointer;
      }
    `;
    document.head.appendChild(styleEl);
    return () => document.head.removeChild(styleEl);
  }, []);

  const handleSliderChange = (e) => {
    setSliderValue(Number(e.target.value));
  };

  const getIndicatorLeft = () => {
    const percent = (sliderValue - 1) / (10 - 1);
    return `calc(${percent * 100}%)`;
  };

  const handleBtnMouseDown = () => setBtnActive(true);
  const handleBtnMouseUp = () => setBtnActive(false);
  const handleBtnClick = () => {
    setSliderValue(5);
  };

  return (
    <div
      style={{
        backgroundColor: '#FFFFFF',
        fontFamily: "'Noto Sans JP', sans-serif",
        color: '#111111',
        overflow: 'hidden',
        width: '390px',
        height: '844px',
        position: 'relative',
        margin: '0 auto',
      }}
    >
      {/* Background Canvas */}
      <div style={customStyles.bgCanvas}>
        <FlowLine left="20%" delay="0s" />
        <FlowLine left="50%" delay="2s" />
        <FlowLine left="80%" delay="4.5s" />
        <div
          style={{
            ...customStyles.gridLine,
            top: '30%',
            width: '100%',
            height: '1px',
          }}
        />
        <div
          style={{
            ...customStyles.gridLine,
            top: '70%',
            width: '100%',
            height: '1px',
          }}
        />
      </div>

      {/* Main Container */}
      <div style={customStyles.container}>
        {/* Header */}
        <header style={customStyles.header}>
          <div style={customStyles.logo}>
            <div style={customStyles.logoDot} />
            PSYCHE.AI
          </div>
          <div
            style={{
              fontSize: '10px',
              color: '#8E8E93',
              letterSpacing: '0.1em',
            }}
          >
            EST. 2024
          </div>
        </header>

        {/* Progress */}
        <div style={customStyles.progressContainer}>
          <div style={customStyles.progressMeta}>
            <span>Phase 01: Architecture</span>
            <span>8% Complete</span>
          </div>
          <div style={customStyles.progressTrack}>
            <div style={customStyles.progressFill} />
          </div>
        </div>

        {/* Question Section */}
        <div style={customStyles.questionSection}>
          <div style={customStyles.qNumber}>01 / 12</div>
          <h2 style={customStyles.h2}>
            How naturally do you find yourself adapting to complex, high-pressure environments?
          </h2>

          <div style={customStyles.sliderWrapper}>
            <div style={customStyles.rangeLabels}>
              <span>Low Resonance</span>
              <span>High Resonance</span>
            </div>

            <div style={customStyles.sliderContainer}>
              {/* Value Indicator */}
              <div
                style={{
                  ...customStyles.valueIndicator,
                  left: getIndicatorLeft(),
                }}
              >
                {sliderValue}
              </div>

              {/* Scale Ticks */}
              <div style={customStyles.scaleTicks}>
                {[...Array(10)].map((_, i) => (
                  <div key={i} style={customStyles.tick} />
                ))}
              </div>

              {/* Slider Line */}
              <div style={customStyles.sliderLine} />

              {/* Slider Input */}
              <input
                type="range"
                min="1"
                max="10"
                value={sliderValue}
                onChange={handleSliderChange}
                className="psyche-slider"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer style={customStyles.footer}>
          <button
            style={{
              ...customStyles.nextBtn,
              ...(btnActive ? customStyles.nextBtnActive : {}),
            }}
            onMouseDown={handleBtnMouseDown}
            onMouseUp={handleBtnMouseUp}
            onTouchStart={handleBtnMouseDown}
            onTouchEnd={handleBtnMouseUp}
            onClick={handleBtnClick}
          >
            CONFIRM RESPONSE
            <span>NEXT</span>
          </button>
        </footer>
      </div>
    </div>
  );
};

const App = () => {
  return (
    <Router basename="/">
      <div
        style={{
          minHeight: '100vh',
          backgroundColor: '#f0f0f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Routes>
          <Route path="/" element={<AssessmentPage />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;