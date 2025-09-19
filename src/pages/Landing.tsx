import React from 'react';
import { Link } from 'react-router-dom';
import { Rocket, ArrowRight } from 'lucide-react';

const Landing = () => {
  return (
    <div className="min-h-screen landing-bg-primary">
      {/* Navigation */}
      <nav className="landing-nav sticky top-0 z-50">
        <div className="landing-container">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-3">
              <div className="relative">
                <img 
                  src="/Seifu.png" 
                  alt="Seifun Logo" 
                  className="w-10 h-10 rounded-full"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-bold landing-text-primary">Seifun</span>
                <span className="text-xs landing-text-muted -mt-1">Agentic AI Platform</span>
              </div>
            </Link>

            <Link to="/app/launch" className="landing-btn solana-cta">
              Try
            </Link>
          </div>
        </div>
      </nav>

      {/* Full-width background video hero */}
      <section className="relative overflow-hidden min-h-screen flex items-center">
        {/* Full-width background video */}
        <div className="absolute inset-0 -z-10">
          <video
            className="w-full h-full object-cover opacity-90"
            autoPlay
            muted
            loop
            playsInline
            poster={`${import.meta.env.BASE_URL || ''}assets/landing-blue.jpg`}
            aria-hidden="true"
            onError={(e) => {
              console.log('Video failed to load, falling back to image');
              e.currentTarget.style.display = 'none';
            }}
          >
            <source src={`${import.meta.env.BASE_URL || ''}assets/Generating_Video_Of_Blue_World.mp4`} type="video/mp4" />
          </video>
          {/* Base bluish cosmos image (kept underneath as final fallback) */}
          <img
            src={`${import.meta.env.BASE_URL || ''}assets/landing-blue.jpg`}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 w-full h-full object-cover opacity-80"
            loading="eager"
          />
          {/* Red glow overlay image */}
          <img
            src={`${import.meta.env.BASE_URL || ''}assets/landing-red.jpg`}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 w-full h-full object-cover mix-blend-screen opacity-35"
            loading="eager"
          />
          {/* Bluish gradient for readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-blue-950/50 via-blue-900/55 to-slate-950/75" aria-hidden="true" />
          {/* Flash parallel streaks */}
          <div className="flash-streaks" />
        </div>

        <div className="landing-container">
          <div className="py-16 w-full text-center landing-fade-in">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border landing-border landing-text-muted mb-6">
              <span className="brand-blue-dot" /> Built for the Sei Network
            </div>
            <h1 className="landing-heading-xl mb-6">
              Agentic AI for DeFi
              <span className="block landing-sei-blue">Build, Trade, and Launch—Fast</span>
            </h1>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link to="/app/launch" className="landing-btn beta-cta-btn animate-pulse hover:animate-none transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/25">
                <Rocket className="w-5 h-5 mr-2" />
                Apply for Beta Test
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </div>
            {/* Inline footer row (no extra bar) */}
            <div className="mt-10 flex items-center justify-center gap-4 text-sm">
              <div className="flex items-center gap-2 landing-text-muted">
                <img src="/Seifu.png" alt="Seifun Logo" className="w-5 h-5 rounded-full opacity-80" />
                <span>Seifun</span>
              </div>
              <span className="landing-text-muted">•</span>
              <a
                href="https://x.com/seifu_trade"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 landing-text-muted hover:landing-text-primary"
                aria-label="Follow @seifu_trade on X"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="opacity-80">
                  <path d="M18.9 3H22L14.5 12.1L22.6 21H16.9L11.9 15.2L6.2 21H3.1L10.1 12.5L2.3 3H8.2L12.7 8.3L18.9 3Z" fill="currentColor"/>
                </svg>
                <span>@seifu_trade</span>
              </a>
              <span className="landing-text-muted">•</span>
              <div className="landing-text-muted">© 2025 on Sei</div>
            </div>
          </div>
        </div>
      </section>
      {/* No separate footer bar to avoid duplication */}
    </div>
  );
};

export default Landing;