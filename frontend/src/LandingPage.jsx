import React, { useState, useEffect, useRef } from 'react';
import './LandingPage.css';

const LandingPage = ({ onGetStarted }) => {
  const [darkMode, setDarkMode] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [activeFeature, setActiveFeature] = useState(0);
  const heroRef = useRef(null);

  // Handle scroll for navbar background
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle mouse movement for parallax effect
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Auto-rotate active feature for showcase
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % 3);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Toggle theme
  const toggleTheme = () => {
    setDarkMode(!darkMode);
    document.body.setAttribute('data-theme', !darkMode ? 'dark' : 'light');
  };

  // Initialize theme
  useEffect(() => {
    document.body.setAttribute('data-theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  return (
    <div className={`landing-page ${darkMode ? 'dark' : 'light'}`}>
      {/* Animated Background */}
      <div className="animated-bg">
        <div className="gradient-orb orb-1"></div>
        <div className="gradient-orb orb-2"></div>
        <div className="gradient-orb orb-3"></div>
        <div className="gradient-orb orb-4"></div>
        <div className="noise-overlay"></div>
        <div className="grid-overlay"></div>
      </div>

      {/* Navigation Bar */}
      <nav className={`navbar ${scrolled ? 'navbar-scrolled' : ''}`}>
        <div className="nav-container">
          <div className="logo">
            <div className="logo-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="logo-text">SteelGuard</span>
          </div>
          <div className="nav-actions">
            <button onClick={toggleTheme} className="theme-toggle" aria-label="Toggle theme">
              {darkMode ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
            <button onClick={onGetStarted} className="get-started-btn">
              Launch App
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero" ref={heroRef}>
        <div className="container">
          <div className="hero-content">
            <div className="hero-badge">
              <span className="badge-dot"></span>
              Industry 4.0 Solution
            </div>
            <h1 className="hero-title">
              Precision Defect Detection
              <span className="gradient-text"> for Steel Manufacturing</span>
            </h1>
            <p className="hero-description">
              Leverage cutting-edge computer vision to identify surface defects with 99.5% accuracy. 
              Real-time inspection powered by YOLOv8 deep learning architecture.
            </p>
            <div className="hero-buttons">
              <button onClick={onGetStarted} className="btn-primary">
                Start Detection
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
              <a href="#features" className="btn-secondary">
                Explore Technology
              </a>
            </div>
            <div className="hero-stats">
              <div className="stat">
                <span className="stat-number">500K+</span>
                <span className="stat-label">Images Processed</span>
              </div>
              <div className="stat-divider"></div>
              <div className="stat">
                <span className="stat-number">99.5%</span>
                <span className="stat-label">Accuracy Rate</span>
              </div>
              <div className="stat-divider"></div>
              <div className="stat">
                <span className="stat-number">50ms</span>
                <span className="stat-label">Avg Inference</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Floating elements */}
        <div className="floating-elements">
          <div className="floating-element" style={{ transform: `translate(${mousePosition.x * 0.02}px, ${mousePosition.y * 0.02}px)` }}>
            <div className="floating-card">
              <div className="floating-line"></div>
              <div className="floating-line"></div>
              <div className="floating-line"></div>
            </div>
          </div>
          <div className="floating-element" style={{ transform: `translate(${mousePosition.x * -0.015}px, ${mousePosition.y * 0.01}px)` }}>
            <div className="floating-circle"></div>
          </div>
          <div className="floating-element" style={{ transform: `translate(${mousePosition.x * 0.01}px, ${mousePosition.y * -0.02}px)` }}>
            <div className="floating-square"></div>
          </div>
        </div>

        {/* Animated scroll indicator */}
        <div className="scroll-indicator">
          <div className="mouse"></div>
          <div className="scroll-text">Scroll to explore</div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features">
        <div className="container">
          <div className="section-header">
            <span className="section-subtitle">Capabilities</span>
            <h2 className="section-title">Advanced Detection Features</h2>
            <p className="section-description">Comprehensive quality inspection powered by deep learning</p>
          </div>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon-wrapper">
                <svg className="feature-icon" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <h3>Real-time Processing</h3>
              <p>Sub-100ms inference enables inline quality control without production delays</p>
              <div className="feature-glow"></div>
            </div>
            <div className="feature-card">
              <div className="feature-icon-wrapper">
                <svg className="feature-icon" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
              </div>
              <h3>Multi-class Detection</h3>
              <p>Identifies scratches, dents, rust, edge cracks, and surface impurities</p>
              <div className="feature-glow"></div>
            </div>
            <div className="feature-card">
              <div className="feature-icon-wrapper">
                <svg className="feature-icon" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3>Edge Optimized</h3>
              <p>Lightweight architecture suitable for edge deployment and local processing</p>
              <div className="feature-glow"></div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="how-it-works">
        <div className="container">
          <div className="section-header">
            <span className="section-subtitle">Workflow</span>
            <h2 className="section-title">Simple Integration Process</h2>
            <p className="section-description">Three steps to automated quality inspection</p>
          </div>
          <div className="steps">
            <div className="step-card">
              <div className="step-number">01</div>
              <div className="step-icon-wrapper">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3>Image Acquisition</h3>
              <p>Upload steel coil images through web interface or API endpoint</p>
              <div className="step-progress"></div>
            </div>
            <div className="step-connector"></div>
            <div className="step-card">
              <div className="step-number">02</div>
              <div className="step-icon-wrapper">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3>AI Analysis</h3>
              <p>YOLOv8 processes image and identifies defect locations</p>
              <div className="step-progress"></div>
            </div>
            <div className="step-connector"></div>
            <div className="step-card">
              <div className="step-number">03</div>
              <div className="step-icon-wrapper">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3>Results Dashboard</h3>
              <p>Visualize defects with bounding boxes and confidence metrics</p>
              <div className="step-progress"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="tech-stack">
        <div className="container">
          <div className="section-header">
            <span className="section-subtitle">Technology Stack</span>
            <h2 className="section-title">Built for Production</h2>
            <p className="section-description">Enterprise-grade architecture</p>
          </div>
          <div className="tech-grid">
            <div className="tech-card">
              <div className="tech-icon">React</div>
              <h4>Frontend</h4>
              <p>Modern UI framework</p>
              <div className="tech-pulse"></div>
            </div>
            <div className="tech-card">
              <div className="tech-icon">Flask</div>
              <h4>Backend</h4>
              <p>Python REST API</p>
              <div className="tech-pulse"></div>
            </div>
            <div className="tech-card">
              <div className="tech-icon">YOLOv8</div>
              <h4>Detection</h4>
              <p>State-of-the-art model</p>
              <div className="tech-pulse"></div>
            </div>
            <div className="tech-card">
              <div className="tech-icon">PyTorch</div>
              <h4>Deep Learning</h4>
              <p>Neural network engine</p>
              <div className="tech-pulse"></div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta">
        <div className="container">
          <div className="cta-content">
            <div className="cta-glow"></div>
            <h2>Ready to enhance quality control?</h2>
            <p>Join leading manufacturers using AI-powered defect detection</p>
            <button onClick={onGetStarted} className="btn-primary btn-large">
              Start Free Trial
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-brand">
              <div className="logo">
                <div className="logo-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M12 2L2 7L12 12L22 7L12 2Z" strokeWidth="1.5"/>
                    <path d="M2 17L12 22L22 17" strokeWidth="1.5"/>
                    <path d="M2 12L12 17L22 12" strokeWidth="1.5"/>
                  </svg>
                </div>
                <span>SteelGuard</span>
              </div>
              <p>AI-powered quality inspection for steel manufacturing</p>

            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2026 SteelGuard. All rights reserved. | Built with cutting-edge AI technology</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;