import React from 'react';
import { Link } from 'react-router-dom';
import { Rocket, ArrowRight } from 'lucide-react';

const Landing = () => {
  return (
    <div className="min-h-screen">
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

            <Link to="/app/launch" className="landing-btn water-cta-btn">
              Try Testnet
            </Link>
          </div>
        </div>
      </nav>

      {/* Full-width background image hero */}
      <section className="relative overflow-hidden min-h-screen flex items-center">
        {/* Background image with responsive formats and graceful fallback */}
        <div className="absolute inset-0 -z-10 bg-[#0b1e3a]">
          <picture>
            <source srcSet={`${import.meta.env.BASE_URL || ''}assets/landing-hero.avif`} type="image/avif" />
            <source srcSet={`${import.meta.env.BASE_URL || ''}assets/landing-hero.webp`} type="image/webp" />
            <img
              src={`${import.meta.env.BASE_URL || ''}assets/landing-hero.jpg`}
              alt=""
              aria-hidden="true"
              className="w-full h-full object-cover"
              onError={(e) => {
                // If the custom hero image is not present yet, fall back to the bundled background
                const fallback = `${import.meta.env.BASE_URL || ''}assets/landing-bg.jpg`;
                if ((e.currentTarget as HTMLImageElement).src !== fallback) {
                  (e.currentTarget as HTMLImageElement).src = fallback;
                }
              }}
            />
          </picture>
          {/* Contrast overlays */}
          <div className="absolute inset-0 bg-sky-900/25" />
          <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-slate-950/70 via-slate-900/30 to-transparent" />
          {/* Cloud frame and ocean snow overlays */}
          <div className="cloud-frame" />
          <div className="ocean-snow" aria-hidden="true">
            {Array.from({ length: 40 }).map((_, i) => (
              <span
                key={i}
                className="dot"
                style={{
                  left: `${(i * 97) % 100}%`,
                  animationDuration: `${8 + (i % 6)}s, ${4 + (i % 5)}s`,
                  animationDelay: `${(i % 10) * -0.8}s, ${(i % 7) * -0.6}s`,
                  // @ts-ignore custom CSS vars used by animations
                  ['--drift-x']: `${(i % 2 === 0 ? -1 : 1) * (i % 12)}px`,
                  ['--drift-amp']: `${(i % 9) + 6}px`,
                  ['--scale']: `${0.6 + (i % 5) * 0.1}`,
                }}
              />
            ))}
          </div>
        </div>

        <div className="landing-container">
          <div className="py-16 w-full text-center landing-fade-in">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border landing-border landing-text-muted mb-6">
              <span className="brand-blue-dot" /> Built for the Sei Network
            </div>
            <h1 className="landing-heading-xl mb-6">
              Agentic AI for DeFi
              <span className="block landing-sei-blue">Sail, Trade, and Launch—Fast</span>
            </h1>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link to="/app/launch" className="landing-btn water-cta-btn animate-pulse hover:animate-none transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/25">
                <Rocket className="w-5 h-5 mr-2" />
                Dive In — Beta Waters
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </div>
            {/* Footer spacer replaced with a fixed lower footer */}
          </div>
        </div>
      </section>
      {/* Lower, minimal footer */}
      <div className="pointer-events-none select-none">
        <div className="fixed bottom-6 inset-x-0 flex justify-center">
          <div className="inline-flex items-center gap-6 px-5 py-3 rounded-full bg-slate-950/40 border border-white/10 backdrop-blur-md">
            <a
              href="https://x.com/seifu_trade"
              target="_blank"
              rel="noreferrer"
              className="pointer-events-auto inline-flex items-center justify-center text-white/80 hover:text-white transition-colors"
              aria-label="Follow on X"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18.9 3H22L14.5 12.1L22.6 21H16.9L11.9 15.2L6.2 21H3.1L10.1 12.5L2.3 3H8.2L12.7 8.3L18.9 3Z" fill="currentColor"/>
              </svg>
            </a>
            <div className="text-white/80 text-base">© 2025</div>
          </div>
        </div>
      </div>
      {/* No separate footer bar to avoid duplication */}
    </div>
  );
};

export default Landing;