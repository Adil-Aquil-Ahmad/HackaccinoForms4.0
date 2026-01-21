import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import './FormsLanding.css';

const FormsLanding = () => {
  const vantaRef = useRef(null);
  const canvasRef = useRef(null);
  const [vantaEffect, setVantaEffect] = useState(null);
  const [hoveredCard, setHoveredCard] = useState(null);

  useEffect(() => {
    if (!vantaEffect && window.VANTA) {
      const effect = window.VANTA.CLOUDS({
        el: vantaRef.current,
        mouseControls: true,
        touchControls: true,
        gyroControls: false,
        minHeight: 200.00,
        minWidth: 200.00,
        scale: 2.8,
        scaleMobile: 6.5,
        backgroundColor: 0x080002,
        skyColor: 0x220005,
        cloudColor: 0x8a1c24,
        cloudShadowColor: 0x050001,
        sunColor: 0xff3a2a,
        sunGlareColor: 0xffc1b5,
        sunlightColor: 0xff5a3a,
        speed: 0.22
      });

      // Initialize lightning uniforms
      if (effect && effect.uniforms) {
        effect.uniforms.lightningTime = { type: 'f', value: 0 };
        effect.uniforms.lightningPos = { type: 'v3', value: new window.THREE.Vector3(0, -10, 0) };
        effect.uniforms.lightningPower = { type: 'f', value: 0 };
      }

      setVantaEffect(effect);
    }
    return () => {
      if (vantaEffect) vantaEffect.destroy()
    }
  }, [vantaEffect])

  // Lightning cloud reaction sync
  const lightningCloudReact = (x, y) => {
    if (!vantaEffect) return;

    vantaEffect.uniforms.iMouse.value.set(
      x,
      vantaEffect.height - y
    );

    vantaEffect.setOptions({
      sunlightColor: 0xffe1a6,
      sunGlareColor: 0xfff4cf
    });

    setTimeout(() => {
      vantaEffect.setOptions({
        sunlightColor: 0xff5a3a,
        sunGlareColor: 0xffc1b5
      });
    }, 180);
  };

  // Volumetric lightning strike system
  const triggerVolumetricStrike = () => {
    if (!vantaEffect || !vantaEffect.uniforms) return;

    const x = Math.random() * 2 - 1;
    const y = Math.random() * 1;
    const z = Math.random() * 2 - 1;

    vantaEffect.uniforms.lightningPos.value.set(x, y, z);
    vantaEffect.uniforms.lightningPower.value = 1.0;

    let t = 0;
    const flicker = () => {
      t += 0.016;
      vantaEffect.uniforms.lightningTime.value += 0.016;
      vantaEffect.uniforms.lightningPower.value *= 0.88;
      if (t < 0.4) requestAnimationFrame(flicker);
    };

    flicker();
  };

  // Auto-trigger volumetric strikes
  useEffect(() => {
    if (!vantaEffect) return;

    const strikeInterval = setInterval(() => {
      triggerVolumetricStrike();
    }, 5000 + Math.random() * 3000); // 5-8 seconds

    return () => clearInterval(strikeInterval);
  }, [vantaEffect]);

  // Lightning canvas system
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const bolts = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resize();
    window.addEventListener('resize', resize);

    class Point {
      constructor(x, y) {
        this.x = x;
        this.y = y;
      }
    }

    class Bolt {
      constructor() {
        this.startX = Math.random() * canvas.width;
        this.startY = -50;
        this.points = [];
        this.thickness = 2 + Math.random() * 3;
        this.depth = Math.random();
        this.life = 0;
        this.maxLife = 6 + Math.random() * 8;
        
        this.generate();
      }

      generate() {
        let x = this.startX;
        let y = this.startY;
        this.points.push(new Point(x, y));

        while (y < canvas.height + 50) {
          x += (Math.random() - 0.5) * 80;
          y += 40 + Math.random() * 60;
          this.points.push(new Point(x, y));
        }
      }

      draw() {
        if (this.life >= this.maxLife) return;

        ctx.save();

        // Depth-based alpha and thickness
        const baseAlpha = 1 - (this.life / this.maxLife);
        ctx.globalAlpha = this.depth < 0.3 ? baseAlpha : 
                          this.depth < 0.6 ? baseAlpha * 0.75 : 
                          baseAlpha * 0.45;

        const depthScale = this.depth < 0.3 ? 1.4 : 
                           this.depth < 0.6 ? 1 : 
                           0.6;

        // Additive blending
        ctx.globalCompositeOperation = 'lighter';

        for (let i = 0; i < this.points.length - 1; i++) {
          const p1 = this.points[i];
          const p2 = this.points[i + 1];
          const mid = new Point(
            (p1.x + p2.x) / 2 + (Math.random() - 0.5) * 20,
            (p1.y + p2.y) / 2
          );

          // Inner core
          ctx.shadowBlur = 12;
          ctx.shadowColor = 'rgba(255, 220, 140, 0.6)';
          ctx.strokeStyle = 'rgba(255, 245, 210, 0.9)';
          ctx.lineWidth = this.thickness * 0.6 * depthScale;

          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.quadraticCurveTo(mid.x, mid.y, p2.x, p2.y);
          ctx.stroke();

          // Outer glow
          ctx.shadowBlur = 30;
          ctx.shadowColor = 'rgba(255, 180, 80, 0.35)';
          ctx.lineWidth = this.thickness * 1.4 * depthScale;

          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.quadraticCurveTo(mid.x, mid.y, p2.x, p2.y);
          ctx.stroke();
        }

        ctx.restore();
        this.life++;

        // Trigger cloud reaction on first frame
        if (this.life === 1) {
          const lastPoint = this.points[this.points.length - 1];
          lightningCloudReact(lastPoint.x, lastPoint.y);
        }
      }
    }

    const clearScreen = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.65)'; // Fog fade
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    };

    const animate = () => {
      clearScreen();

      // Spawn new bolts randomly
      if (Math.random() < 0.015) {
        bolts.push(new Bolt());
      }

      // Draw and clean up bolts
      for (let i = bolts.length - 1; i >= 0; i--) {
        bolts[i].draw();
        if (bolts[i].life >= bolts[i].maxLife) {
          bolts.splice(i, 1);
        }
      }

      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
    };
  }, [vantaEffect]);

  return (
    <div className="forms-landing" ref={vantaRef}>
      <canvas
        ref={canvasRef}
        id="lightning-canvas"
      />
      <div className="forms-container">
        <div className="forms-header">
          <h1>HACKACCINO 4.0</h1>
          <p>Select Your Category</p>
        </div>

        <div className="forms-grid">
          <Link 
            to="/sponsor" 
            className="form-card sponsor-card"
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
            className="form-card community-card"
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
            className="form-card judge-card"
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
