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
              Launch
            </Link>
          </div>
        </div>
      </nav>

      {/* Minimal Hero with themed imagery overlays */}
      <section className="relative overflow-hidden">
        {/* Blue cosmos image */}
        <div className="absolute inset-0 -z-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: 'linear-gradient(rgba(2,6,23,0.6), rgba(2,6,23,0.8)), url(/theme-blue.jpg)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              opacity: 0.9,
            }}
          />
          {/* Red planet image layer for depth */}
          <div
            className="absolute inset-0 mix-blend-screen"
            style={{
              backgroundImage: 'radial-gradient(ellipse at bottom, rgba(255,60,60,0.18), transparent 60%), url(/theme-red.jpg)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              opacity: 0.35,
            }}
          />
        </div>

        <div className="landing-container">
          <div className="landing-section text-center landing-fade-in">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border landing-border landing-text-muted mb-6">
              <span className="brand-blue-dot" /> Built for the Sei Network
            </div>
            <h1 className="landing-heading-xl mb-6">
              Agentic AI for DeFi
              <span className="block landing-sei-blue">Build, Trade, and Launch—Fast</span>
            </h1>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link to="/app/launch" className="landing-btn solana-cta">
                <Rocket className="w-5 h-5 mr-2" />
                Try Test
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
              <Link to="/app/launch" className="landing-btn landing-btn-secondary">
                Apply for Beta Test
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Slim footer */}
      <footer className="landing-bg-secondary border-t landing-border">
        <div className="landing-container py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img src="/Seifu.png" alt="Seifun Logo" className="w-8 h-8 rounded-full" />
              <span className="text-xl font-bold landing-text-primary">Seifun</span>
            </div>
            <div className="landing-text-muted text-sm">© 2025 on Sei</div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;