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
  messageBubbleLeft: {
    position: 'relative',
    background: 'white',
    border: '2px solid #1a1a1a',
    boxShadow: '3px 3px 0px 0px #1a1a1a',
  },
  messageBubbleRight: {
    position: 'relative',
    background: '#ff3333',
    color: 'white',
    border: '2px solid #1a1a1a',
    boxShadow: '3px 3px 0px 0px #1a1a1a',
  },
  sendButtonActive: {
    transform: 'translate(2px, 2px)',
    boxShadow: 'none',
  },
};

const messages = [
  {
    id: 1,
    type: 'left',
    author: 'Elena Ross',
    role: 'Connector',
    roleStyle: { background: '#e5e7eb', border: '1px solid #1a1a1a' },
    text: "The current architecture is stable, but we're seeing diminishing returns in node bridging. How can we trigger a shift?",
    time: '10:42 AM',
  },
  {
    id: 2,
    type: 'right',
    author: 'You',
    role: 'Catalyst',
    roleStyle: { background: '#1a1a1a', color: 'white' },
    text: "We need to introduce a high-entropy node to disrupt the existing cluster. I'm looking at the Bridge Coefficient data now.",
    time: '10:45 AM',
  },
  {
    id: 3,
    type: 'card',
  },
  {
    id: 4,
    type: 'left',
    author: 'Marcus Chen',
    role: 'Synthesizer',
    roleStyle: { background: '#e5e7eb', border: '1px solid #1a1a1a' },
    text: 'Agreed. If we align this with the Tech cluster expansion, we can capture the momentum. Elena, can you bridge the dev nodes?',
    time: '10:48 AM',
  },
];

const NetworkImpactCard = () => (
  <div
    style={{ ...customStyles.brutalistBorder, ...customStyles.brutalistShadow }}
    className="bg-white p-3"
  >
    <div className="flex justify-between items-center mb-2">
      <span className="text-[10px] font-bold uppercase tracking-wider">Network Impact Prediction</span>
      <span className="text-red-500 font-bold text-xs">EXPLOSIVE</span>
    </div>
    <div
      style={customStyles.brutalistBorder}
      className="h-2 bg-gray-100 overflow-hidden flex"
    >
      <div className="h-full bg-red-500 w-[65%]"></div>
    </div>
    <p className="text-[10px] text-gray-500 mt-2" style={{ fontFamily: 'Inter, sans-serif' }}>
      Potential for 3 new cluster mergers detected within 4 hours.
    </p>
  </div>
);

const MessageLeft = ({ author, role, roleStyle, text, time }) => (
  <div className="flex flex-col items-start gap-1 max-w-[85%]">
    <div className="flex items-center gap-2 mb-1">
      <span className="font-bold text-xs uppercase">{author}</span>
      <span
        className="text-[9px] px-1 uppercase"
        style={{ fontFamily: 'monospace', ...roleStyle }}
      >
        {role}
      </span>
    </div>
    <div style={customStyles.messageBubbleLeft} className="p-3">
      <p className="text-sm leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>
        {text}
      </p>
    </div>
    <span className="text-[9px] text-gray-400 mt-1" style={{ fontFamily: 'monospace' }}>
      {time}
    </span>
  </div>
);

const MessageRight = ({ author, role, roleStyle, text, time }) => (
  <div className="flex flex-col items-end gap-1 ml-auto max-w-[85%]">
    <div className="flex items-center gap-2 mb-1">
      <span
        className="text-[9px] px-1 uppercase"
        style={{ fontFamily: 'monospace', ...roleStyle }}
      >
        {role}
      </span>
      <span className="font-bold text-xs uppercase">{author}</span>
    </div>
    <div style={customStyles.messageBubbleRight} className="p-3">
      <p className="text-sm leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>
        {text}
      </p>
    </div>
    <span className="text-[9px] text-gray-400 mt-1" style={{ fontFamily: 'monospace' }}>
      {time}
    </span>
  </div>
);

const ThreadPage = () => {
  const [inputValue, setInputValue] = useState('');
  const [isSendActive, setIsSendActive] = useState(false);
  const [allMessages, setAllMessages] = useState(messages);

  const handleSend = () => {
    if (!inputValue.trim()) return;
    const newMsg = {
      id: Date.now(),
      type: 'right',
      author: 'You',
      role: 'Catalyst',
      roleStyle: { background: '#1a1a1a', color: 'white' },
      text: inputValue.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setAllMessages((prev) => [...prev, newMsg]);
    setInputValue('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <div
      className="text-[#1a1a1a] min-h-screen flex flex-col overflow-hidden"
      style={{ backgroundColor: '#f0f0f0', fontFamily: "'Space Grotesk', sans-serif" }}
    >
      {/* Header */}
      <header
        className="h-16 flex bg-white shrink-0 z-30"
        style={customStyles.brutalistBorderB}
      >
        <button
          className="w-16 flex items-center justify-center hover:bg-gray-50 active:bg-gray-100"
          style={customStyles.brutalistBorderR}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 256 256">
            <path d="M224,128a8,8,0,0,1-8,8H59.31l58.35,58.34a8,8,0,0,1-11.32,11.32l-72-72a8,8,0,0,1,0-11.32l72-72a8,8,0,0,1,11.32,11.32L59.31,120H216A8,8,0,0,1,224,128Z" />
          </svg>
        </button>
        <div className="flex-1 flex items-center justify-between px-4">
          <div>
            <span className="font-bold tracking-tight uppercase text-xs text-gray-500 block leading-none">
              Active Thread
            </span>
            <span className="font-bold text-sm truncate">Strategic Evolution 01</span>
          </div>
          <div className="flex -space-x-2">
            <img
              src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=100"
              className="w-8 h-8 rounded-full border-2 border-white object-cover grayscale"
              alt="avatar1"
            />
            <img
              src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=100"
              className="w-8 h-8 rounded-full border-2 border-white object-cover grayscale"
              alt="avatar2"
            />
            <div className="w-8 h-8 rounded-full border-2 border-white bg-black flex items-center justify-center text-[10px] font-bold text-white">
              +2
            </div>
          </div>
        </div>
      </header>

      {/* Status Bar */}
      <div
        className="bg-black text-white px-4 py-2 flex justify-between items-center z-20"
        style={{ ...customStyles.brutalistBorderB, fontSize: '10px', fontFamily: 'monospace', letterSpacing: '0.15em', textTransform: 'uppercase' }}
      >
        <div className="flex items-center gap-2">
          <span className="text-red-500">●</span> Impact: +4.2%
        </div>
        <div>Nodes: 14 Active</div>
        <div>Velocity: High</div>
      </div>

      {/* Messages */}
      <main className="flex-1 overflow-y-auto p-4 space-y-6" style={{ backgroundColor: '#f8f8f8' }}>
        <div className="text-center py-2">
          <span
            className="text-[10px] bg-white px-2 py-0.5"
            style={{ ...customStyles.brutalistBorder, fontFamily: 'monospace' }}
          >
            Thread Initiated by Catalyst
          </span>
        </div>

        {allMessages.map((msg) => {
          if (msg.type === 'card') {
            return <NetworkImpactCard key={msg.id} />;
          } else if (msg.type === 'left') {
            return (
              <MessageLeft
                key={msg.id}
                author={msg.author}
                role={msg.role}
                roleStyle={msg.roleStyle}
                text={msg.text}
                time={msg.time}
              />
            );
          } else if (msg.type === 'right') {
            return (
              <MessageRight
                key={msg.id}
                author={msg.author}
                role={msg.role}
                roleStyle={msg.roleStyle}
                text={msg.text}
                time={msg.time}
              />
            );
          }
          return null;
        })}
      </main>

      {/* Input Area */}
      <div className="bg-white p-4 pb-8 z-40" style={customStyles.brutalistBorderT}>
        <div className="flex gap-2">
          <div
            className="flex-1 flex items-center px-4 py-3"
            style={{ ...customStyles.brutalistBorder, backgroundColor: '#f0f0f0' }}
          >
            <input
              type="text"
              placeholder="Pulse input..."
              className="bg-transparent border-none outline-none w-full text-sm"
              style={{ fontFamily: 'Inter, sans-serif' }}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button className="text-gray-400 hover:text-black" onClick={handleSend}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256">
                <path d="M200,128a8,8,0,0,1-8,8H40a8,8,0,0,1,0-16H192A8,8,0,0,1,200,128Z" />
                <path d="M128,56l72,72-72,72a8,8,0,0,1-11.32-11.32L172.69,136H40a8,8,0,0,1,0-16H172.69L116.68,67.34A8,8,0,0,1,128,56Z" />
              </svg>
            </button>
          </div>
          <button
            className="w-14 text-white flex items-center justify-center transition-transform"
            style={{
              backgroundColor: '#ff3333',
              ...customStyles.brutalistBorder,
              ...(isSendActive ? customStyles.sendButtonActive : customStyles.brutalistShadow),
            }}
            onMouseDown={() => setIsSendActive(true)}
            onMouseUp={() => {
              setIsSendActive(false);
              handleSend();
            }}
            onMouseLeave={() => setIsSendActive(false)}
            onTouchStart={() => setIsSendActive(true)}
            onTouchEnd={() => {
              setIsSendActive(false);
              handleSend();
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="white" viewBox="0 0 256 256">
              <path d="M232,128a104,104,0,1,1-104-104A104.11,104.11,0,0,1,232,128Z" opacity="0.2" />
              <path d="M215.79,118.17a8,8,0,0,0-5-5.66L51.17,53.11a8,8,0,0,0-10.12,10.12l59.4,159.62a8,8,0,0,0,15.06-.69l26.26-68.28,68.28-26.26A8,8,0,0,0,215.79,118.17Zm-86.42,7.41a8,8,0,0,0-4.38,4.38L106,181.79,61.46,61.46,181.79,106Z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

const App = () => {
  useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Inter:wght@400;500;600&display=swap';
    document.head.appendChild(link);
    return () => document.head.removeChild(link);
  }, []);

  return (
    <Router basename="/">
      <Routes>
        <Route path="/" element={<ThreadPage />} />
      </Routes>
    </Router>
  );
};

export default App;