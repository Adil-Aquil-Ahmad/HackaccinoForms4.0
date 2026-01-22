import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './FormsLanding.css';

const FormsLanding = () => {
  const ENABLE_GLITCH = false;

  const [hoveredCard, setHoveredCard] = useState(null);
  const [isReverse, setIsReverse] = useState(false);
  const forwardRef = useRef(null);
  const reverseRef = useRef(null);
  const [currentTheme, setCurrentTheme] = useState('default');

  const themes = [
    "default",
    "glass",
    "neumorphism",
    "gradient",
    "ai",
    "retro",
    "minimal",
    "fluid",
    "polygon"
  ];

  useEffect(() => {
    const body = document.body;

    body.dataset.theme = 'default';
    setCurrentTheme('default');

    if (!ENABLE_GLITCH) return;

    let glitchInterval;
    let mainLoopTimeout;

    const startGlitchCycle = () => {
      body.classList.add("glitching");

      let i = 0;
      glitchInterval = setInterval(() => {
        body.dataset.theme = themes[i % themes.length];
        setCurrentTheme(themes[i % themes.length]);
        i++;
      }, 120);

      const glitchDuration = 900 + Math.random() * 600;

      setTimeout(() => {
        clearInterval(glitchInterval);
        body.classList.remove("glitching");

        const randomTheme =
          themes[Math.floor(Math.random() * themes.length)];
        body.dataset.theme = randomTheme;
        setCurrentTheme(randomTheme);

        const stableTime = 3000 + Math.random() * 2000;

        mainLoopTimeout = setTimeout(startGlitchCycle, stableTime);
      }, glitchDuration);
    };

    startGlitchCycle();

    return () => {
      clearInterval(glitchInterval);
      clearTimeout(mainLoopTimeout);
    };
  }, []);

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setCurrentTheme(document.body.dataset.theme || 'glass');
    });
    
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['data-theme']
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const forward = forwardRef.current;
    const reverse = reverseRef.current;
    if (!forward || !reverse) return;

    forward.play();

    const showReverseSafely = () => {
      reverse.currentTime = 0;
      reverse.play();

      const reveal = () => {
        setIsReverse(true);
      };

      if ("requestVideoFrameCallback" in reverse) {
        reverse.requestVideoFrameCallback(reveal);
      } else {
        reverse.addEventListener("timeupdate", reveal, { once: true });
      }
    };

    const showForwardSafely = () => {
      forward.currentTime = 0;
      forward.play();

      const reveal = () => {
        setIsReverse(false);
      };

      if ("requestVideoFrameCallback" in forward) {
        forward.requestVideoFrameCallback(reveal);
      } else {
        forward.addEventListener("timeupdate", reveal, { once: true });
      }
    };

    forward.addEventListener("ended", showReverseSafely);
    reverse.addEventListener("ended", showForwardSafely);

    return () => {
      forward.removeEventListener("ended", showReverseSafely);
      reverse.removeEventListener("ended", showForwardSafely);
    };
  }, []);

  return (
    <div className="forms-landing">
      <div className="video-section">
        <video
          ref={forwardRef}
          className={`background-video ${!isReverse ? 'visible' : ''}`}
          src="/Hackaccino.mp4"
          muted
          playsInline
          preload="auto"
          disablePictureInPicture
        />

        <video
          ref={reverseRef}
          className={`background-video ${isReverse ? 'visible' : ''}`}
          src="/Hackaccino-reverse.mp4"
          muted
          playsInline
          preload="auto"
          disablePictureInPicture
        />

        <div className="video-overlay"></div>
      </div>
      <div className="forms-container">
        <div className="forms-header">
          <h1>HACKACCINO 4.0</h1>
          <p>Select Your Category</p>
        </div>

        <div className="forms-grid">
          <Link 
            to="/sponsor" 
            className={`form-card sponsor-card ${currentTheme === 'polygon' ? 'hexagon' : ''}`}
            onMouseEnter={() => setHoveredCard('sponsor')}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <div className="card-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="1" x2="12" y2="23"></line>
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
              </svg>
            </div>
            <h2>Sponsors</h2>
            <p>Become a sponsor and support innovation</p>
          </Link>

          <Link 
            to="/community-partner" 
            className={`form-card community-card ${currentTheme === 'polygon' ? 'heptagon' : ''}`}
            onMouseEnter={() => setHoveredCard('community')}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <div className="card-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
            </div>
            <h2>Community Partner</h2>
            <p>Partner with us to reach 1500+ students</p>
          </Link>

          <Link 
            to="/judge" 
            className={`form-card judge-card ${currentTheme === 'polygon' ? 'nonagon' : ''}`}
            onMouseEnter={() => setHoveredCard('judge')}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <div className="card-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path>
                <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path>
                <path d="M4 22h16"></path>
                <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path>
                <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path>
                <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path>
              </svg>
            </div>
            <h2>Judges</h2>
            <p>Join as a judge and evaluate innovation</p>
          </Link>
        </div>

        <div className="forms-footer">
          <p>Computer Society of India, Bennett University</p>
        </div>
      </div>
    </div>
  );
};

export default FormsLanding;
