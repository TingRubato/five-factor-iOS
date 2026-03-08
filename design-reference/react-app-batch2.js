import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

const customStyles = {
  brutalistBorder: {
    border: '2px solid #1a1a1a',
  },
  brutalistBorderB: {
    borderBottom: '2px solid #1a1a1a',
  },
  brutalistBorderR: {
    borderRight: '2px solid #1a1a1a',
  },
  brutalistBorderT: {
    borderTop: '2px solid #1a1a1a',
  },
  brutalistShadow: {
    boxShadow: '4px 4px 0px 0px #1a1a1a',
  },
  bottomBar: {
    boxShadow: '0 -4px 12px rgba(0,0,0,0.05)',
  },
  marqueeContainer: {
    overflow: 'hidden',
    whiteSpace: 'nowrap',
  },
};

const peers = [
  {
    id: 1,
    name: 'Elena Ross',
    img: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=600',
    alt: 'Elena Ross',
    score: '94%',
    type: 'Connector',
    thread: 'Common threads: Architecture',
  },
  {
    id: 2,
    name: 'Marcus Chen',
    img: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=600',
    alt: 'Marcus Chen',
    score: '88%',
    type: 'Synthesizer',
    thread: 'Common threads: Tech',
  },
  {
    id: 3,
    name: 'Sarah Al-Fayed',
    img: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=600',
    alt: 'Sarah Al-Fayed',
    score: '82%',
    type: 'Architect',
    thread: 'Common threads: Design',
  },
  {
    id: 4,
    name: 'David Oyelowo',
    img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=600',
    alt: 'David Oyelowo',
    score: '79%',
    type: 'Catalyst',
    thread: 'Common threads: Future',
  },
];

const ArrowRightIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256" className={className}>
    <path d="M221.66,133.66l-72,72a8,8,0,0,1-11.32-11.32L196.69,136H40a8,8,0,0,1,0-16H196.69L138.34,61.66a8,8,0,0,1,11.32-11.32l72,72A8,8,0,0,1,221.66,133.66Z"></path>
  </svg>
);

const PeerCard = ({ peer }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="bg-white p-3 flex items-center gap-4 cursor-pointer group"
      style={{
        ...customStyles.brutalistBorder,
        ...customStyles.brutalistShadow,
        transition: 'transform 0.15s ease, box-shadow 0.15s ease',
        transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
        boxShadow: hovered ? '6px 6px 0px 0px #1a1a1a' : '4px 4px 0px 0px #1a1a1a',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onMouseDown={(e) => {
        e.currentTarget.style.transform = 'translate(2px, 2px)';
        e.currentTarget.style.boxShadow = '0px 0px 0px 0px #1a1a1a';
      }}
      onMouseUp={(e) => {
        e.currentTarget.style.transform = hovered ? 'translateY(-4px)' : 'translateY(0)';
        e.currentTarget.style.boxShadow = hovered ? '6px 6px 0px 0px #1a1a1a' : '4px 4px 0px 0px #1a1a1a';
      }}
    >
      <div className="relative w-16 h-16 shrink-0">
        <img
          src={peer.img}
          alt={peer.alt}
          className="w-full h-full object-cover transition-all duration-300 border border-black"
          style={{
            filter: hovered ? 'grayscale(0%)' : 'grayscale(100%)',
          }}
        />
        <div
          className="absolute -bottom-1 -right-1 bg-black text-white font-bold px-1 py-0.5"
          style={{ fontSize: '10px' }}
        >
          {peer.score}
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-baseline mb-1">
          <h3 className="font-bold text-lg truncate">{peer.name}</h3>
          <ArrowRightIcon className={hovered ? 'text-black' : 'text-gray-400'} />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono uppercase bg-gray-100 px-2 py-0.5 border border-gray-200">{peer.type}</span>
          <span className="w-1 h-1 bg-red-500 rounded-full"></span>
          <span className="text-xs text-gray-500 truncate" style={{ fontFamily: 'Inter, sans-serif' }}>{peer.thread}</span>
        </div>
      </div>
    </div>
  );
};

const MarqueeBanner = () => {
  const text = [
    'Network Density: High',
    '•',
    'Bridging Coefficient: 0.94',
    '•',
    'New Nodes: +12',
    '•',
    'Reach: Global',
    '•',
    'Network Density: High',
    '•',
    'Bridging Coefficient: 0.94',
  ];

  return (
    <div
      className="bg-black text-white py-3"
      style={{ ...customStyles.brutalistBorderB, overflow: 'hidden', whiteSpace: 'nowrap' }}
    >
      <MarqueeContent text={text} />
    </div>
  );
};

const MarqueeContent = ({ text }) => {
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setOffset((prev) => {
        if (prev <= -50) return 0;
        return prev - 0.05;
      });
    }, 16);
    return () => clearInterval(interval);
  }, []);

  const marqueeStyle = {
    display: 'inline-flex',
    gap: '2rem',
    fontFamily: 'monospace',
    fontSize: '0.875rem',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    paddingLeft: '1rem',
    transform: `translateX(${offset}%)`,
    transition: 'none',
  };

  const doubledText = [...text, ...text];

  return (
    <div style={marqueeStyle}>
      {doubledText.map((item, idx) => (
        <span key={idx}>{item}</span>
      ))}
    </div>
  );
};

const HomePage = () => {
  const [showMapModal, setShowMapModal] = useState(false);
  const [showThreadModal, setShowThreadModal] = useState(false);
  const [threadText, setThreadText] = useState('');
  const [threadSubmitted, setThreadSubmitted] = useState(false);

  const handleStartThread = () => {
    setShowThreadModal(true);
    setThreadSubmitted(false);
    setThreadText('');
  };

  const handleSubmitThread = () => {
    if (threadText.trim()) {
      setThreadSubmitted(true);
    }
  };

  return (
    <div
      className="bg-[#f0f0f0] text-[#1a1a1a] min-h-screen flex flex-col"
      style={{ fontFamily: "'Space Grotesk', sans-serif", position: 'relative' }}
    >
      {/* Header */}
      <header className="h-16 flex bg-white shrink-0" style={customStyles.brutalistBorderB}>
        <div
          className="w-16 flex items-center justify-center bg-black text-white shrink-0"
          style={customStyles.brutalistBorderR}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 256 256">
            <path d="M208,32H48A16,16,0,0,0,32,48V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V48A16,16,0,0,0,208,32ZM180,156a12,12,0,0,1-12,12H88a12,12,0,0,1,0-24h80A12,12,0,0,1,180,156Zm0-44a12,12,0,0,1-12,12H88a12,12,0,0,1,0-24h80A12,12,0,0,1,180,112Z"></path>
          </svg>
        </div>
        <div className="flex-1 flex items-center justify-between px-4">
          <span className="font-bold tracking-tight uppercase text-sm">Community Hub</span>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="font-mono text-xs text-gray-500">REF: 24B</span>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto pb-24">
        {/* Hero section */}
        <div className="p-6 bg-white" style={customStyles.brutalistBorderB}>
          <div className="flex justify-between items-start mb-6">
            <div
              className="inline-flex items-center gap-2 px-3 py-1 bg-[#f0f0f0] text-xs font-bold uppercase tracking-wider"
              style={{ ...customStyles.brutalistBorder, boxShadow: '2px 2px 0px 0px rgba(0,0,0,1)' }}
            >
              <span>Social Archetype</span>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="#ff3333" viewBox="0 0 256 256">
              <path d="M216,48V208a8,8,0,0,1-8,8H48a8,8,0,0,1-8-8V48a8,8,0,0,1,8-8H208A8,8,0,0,1,216,48Z" opacity="0.2"></path>
              <path
                d="M168,104a8,8,0,0,1-8,8H144v16h16a8,8,0,0,1,8,8v40a8,8,0,0,1-8,8H112a8,8,0,0,1-8-8V136a8,8,0,0,1,8-8h24V112H120a8,8,0,0,1-8-8V64a8,8,0,0,1,8-8h40a8,8,0,0,1,8,8v40Z"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="16"
              ></path>
              <circle cx="128" cy="128" r="96" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"></circle>
            </svg>
          </div>

          <h1 className="text-7xl font-bold leading-[0.85] tracking-tighter mb-6">
            THE<br />
            <span
              className="text-transparent bg-clip-text"
              style={{ backgroundImage: 'linear-gradient(to right, #dc2626, #ef4444)' }}
            >
              CATA
            </span>
            <br />
            LYST
          </h1>

          <div className="relative pl-6" style={{ borderLeft: '4px solid #dc2626' }}>
            <p className="text-lg leading-relaxed text-gray-800" style={{ fontFamily: 'Inter, sans-serif' }}>
              You are the{' '}
              <span className="bg-red-100 px-1 font-semibold text-red-700">spark</span> within the network. While
              others maintain stability, you introduce the new ideas that drive evolution. Your interactions are brief
              but high-impact.
            </p>
          </div>
        </div>

        {/* Marquee */}
        <MarqueeBanner />

        {/* Resonant Peers */}
        <section className="bg-[#f0f0f0]">
          <div className="p-4 flex items-center justify-between">
            <h2 className="text-xl font-bold uppercase tracking-tight flex items-center gap-2">
              Resonant Peers
              <span className="bg-black text-white text-xs px-1.5 py-0.5 rounded-full">4</span>
            </h2>
            <button className="text-xs font-mono underline hover:text-red-600">FILTER VIEW</button>
          </div>

          <div className="px-4 pb-4 space-y-4">
            {peers.map((peer) => (
              <PeerCard key={peer.id} peer={peer} />
            ))}
          </div>
        </section>

        {/* Footer */}
        <div
          className="px-6 py-8 text-center text-gray-500 bg-[#e5e5e5]"
          style={{ borderTop: '2px solid #1a1a1a' }}
        >
          <p className="font-mono text-xs uppercase mb-2">Data Updated: 12m ago</p>
          <div className="w-2 h-2 bg-gray-400 rounded-full mx-auto"></div>
        </div>
      </main>

      {/* Bottom Action Bar */}
      <div
        className="fixed bottom-0 left-0 right-0 bg-white p-4 flex gap-3 z-50"
        style={{ ...customStyles.brutalistBorderT, ...customStyles.bottomBar }}
      >
        <BottomButton onClick={() => setShowMapModal(true)} label="View Map" variant="white">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256">
            <path d="M228.92,49.69a8,8,0,0,0-8.6-1.36l-66.4,32L99.58,52.84a8,8,0,0,0-5.46-.73l-64,16A8,8,0,0,0,24,75.91v128a8,8,0,0,0,8.6,1.36l66.4-32,54.34,27.52a8,8,0,0,0,5.46.73l64-16A8,8,0,0,0,232,180.09V52.09A8,8,0,0,0,228.92,49.69Zm-71.18,34.4L199.12,65l.33,109.11-41.71,21.1Zm-16,112.22L97.92,176.6,56.55,186.94V77.8l43.71-10.93L141.74,86.31Z"></path>
          </svg>
        </BottomButton>
        <BottomButton onClick={handleStartThread} label="Start Thread" variant="red">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256">
            <path d="M232,128A104,104,0,1,1,128,24,104.13,104.13,0,0,1,232,128Zm-24,0a80,80,0,1,0-80,80A80.09,80.09,0,0,0,208,128Zm-72-32v24h24a8,8,0,0,1,0,16H136v24a8,8,0,0,1-16,0V136H96a8,8,0,0,1,0-16h24V96a8,8,0,0,1,16,0Z"></path>
          </svg>
        </BottomButton>
      </div>

      {/* Map Modal */}
      {showMapModal && (
        <Modal onClose={() => setShowMapModal(false)} title="Network Map">
          <div className="flex flex-col items-center justify-center py-8">
            <div
              className="w-full h-48 bg-[#f0f0f0] flex items-center justify-center mb-4"
              style={customStyles.brutalistBorder}
            >
              <div className="text-center">
                <div className="w-4 h-4 bg-red-500 rounded-full mx-auto mb-2 animate-pulse"></div>
                <p className="font-mono text-xs uppercase text-gray-500">Network visualization</p>
                <p className="font-mono text-xs text-gray-400 mt-1">Nodes: 48 · Edges: 312</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 w-full">
              {[
                { label: 'Density', value: 'High' },
                { label: 'Bridges', value: '0.94' },
                { label: 'New Nodes', value: '+12' },
                { label: 'Reach', value: 'Global' },
              ].map((item) => (
                <div key={item.label} className="bg-[#f0f0f0] p-3" style={customStyles.brutalistBorder}>
                  <p className="font-mono text-xs uppercase text-gray-500">{item.label}</p>
                  <p className="font-bold text-lg">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </Modal>
      )}

      {/* Thread Modal */}
      {showThreadModal && (
        <Modal onClose={() => setShowThreadModal(false)} title="Start a Thread">
          {threadSubmitted ? (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="white" viewBox="0 0 256 256">
                  <path d="M229.66,77.66l-128,128a8,8,0,0,1-11.32,0l-56-56a8,8,0,0,1,11.32-11.32L96,188.69,218.34,66.34a8,8,0,0,1,11.32,11.32Z"></path>
                </svg>
              </div>
              <p className="font-bold text-lg mb-1">Thread Started!</p>
              <p className="text-gray-500 text-sm font-body text-center">Your thread has been shared with the network.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4 py-2">
              <textarea
                className="w-full p-3 bg-[#f0f0f0] font-body text-sm resize-none focus:outline-none"
                style={{ ...customStyles.brutalistBorder, height: '120px', fontFamily: 'Inter, sans-serif' }}
                placeholder="What's on your mind? Spark a new idea..."
                value={threadText}
                onChange={(e) => setThreadText(e.target.value)}
              />
              <div className="flex gap-2">
                <button
                  className="flex-1 h-12 bg-[#f0f0f0] font-bold uppercase tracking-wide text-sm"
                  style={customStyles.brutalistBorder}
                  onClick={() => setShowThreadModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="flex-1 h-12 bg-[#ff3333] text-white font-bold uppercase tracking-wide text-sm"
                  style={customStyles.brutalistBorder}
                  onClick={handleSubmitThread}
                >
                  Post Thread
                </button>
              </div>
            </div>
          )}
        </Modal>
      )}
    </div>
  );
};

const BottomButton = ({ onClick, label, variant, children }) => {
  const [hovered, setHovered] = useState(false);
  const [active, setActive] = useState(false);

  const baseStyle = {
    ...customStyles.brutalistBorder,
    transition: 'transform 0.1s ease, box-shadow 0.1s ease',
    transform: active ? 'translate(2px, 2px)' : hovered ? 'translate(-2px, -2px)' : 'translate(0, 0)',
    boxShadow: active ? '0px 0px 0px 0px #1a1a1a' : hovered ? '6px 6px 0px 0px #1a1a1a' : '4px 4px 0px 0px #1a1a1a',
  };

  return (
    <button
      className={`flex-1 h-14 font-bold uppercase tracking-wide flex items-center justify-center gap-2 text-sm ${
        variant === 'red' ? 'bg-[#ff3333] text-white' : 'bg-white text-[#1a1a1a]'
      }`}
      style={baseStyle}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setActive(false); }}
      onMouseDown={() => setActive(true)}
      onMouseUp={() => setActive(false)}
    >
      {children}
      {label}
    </button>
  );
};

const Modal = ({ onClose, title, children }) => {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full bg-white p-6"
        style={{ ...customStyles.brutalistBorderT, maxWidth: '480px', borderTopLeftRadius: 0, borderTopRightRadius: 0 }}
      >
        <div className="flex justify-between items-center mb-4" style={customStyles.brutalistBorderB}>
          <h3 className="font-bold text-lg uppercase tracking-tight pb-3">{title}</h3>
          <button className="pb-3 font-bold text-lg hover:text-red-600" onClick={onClose}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
};

const App = () => {
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Inter:wght@400;500;600&display=swap');
      body { margin: 0; padding: 0; }
      * { box-sizing: border-box; }
      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
      }
      .animate-pulse {
        animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
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