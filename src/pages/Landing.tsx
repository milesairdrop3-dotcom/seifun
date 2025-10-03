import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Rocket, ArrowRight } from 'lucide-react';

const Landing = () => {
  const navigate = useNavigate();
  const [showTerms, setShowTerms] = React.useState(false);
  const [scrolledToEnd, setScrolledToEnd] = React.useState(false);
  const [accepted, setAccepted] = React.useState(false);
  const termsRef = React.useRef<HTMLDivElement | null>(null);
  const [ctaRolling, setCtaRolling] = React.useState(false);

  const handleOpenTerms = () => {
    setShowTerms(true);
    setScrolledToEnd(false);
    setAccepted(false);
    // focus will be handled by browser
  };

  const handleScrollTerms = () => {
    const el = termsRef.current;
    if (!el) return;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 8) {
      setScrolledToEnd(true);
    }
  };

  const handleProceed = () => {
    if (accepted && scrolledToEnd) {
      setShowTerms(false);
      navigate('/app/launch');
    }
  };

  const handleBetaClick = () => {
    setCtaRolling(true);
    window.setTimeout(() => setCtaRolling(false), 700);
    handleOpenTerms();
  };

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
          <img
            src={`${import.meta.env.BASE_URL || ''}assets/landing-bg.jpg`}
            alt=""
            aria-hidden="true"
            className="w-full h-full object-cover"
            onError={(e) => {
              const img = e.currentTarget as HTMLImageElement;
              const githubRaw = 'https://raw.githubusercontent.com/milesairdrop3-dotcom/seifun/main/public/assets/landing-bg.jpg';
              if (img.src !== githubRaw) {
                img.src = githubRaw;
              }
            }}
          />
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
              AI Is Making DeFi
              <span className="block landing-sei-blue">Safer, Fun and Faster</span>
            </h1>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                type="button"
                onClick={handleBetaClick}
                className={`landing-btn beta-cta-white transition-all duration-300 hover:scale-[1.015] ${ctaRolling ? 'cta-rolling' : ''}`}
                aria-label="Click to apply for beta test"
              >
                <span className="cta-star" aria-hidden="true">✦</span>
                <span>Click to apply for beta test</span>
              </button>
            </div>
            {/* Footer spacer replaced with a fixed lower footer */}
          </div>
        </div>
      </section>
      {/* Terms & Conditions Modal */}
      {showTerms && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60" onClick={() => setShowTerms(false)} />
          <div className="relative w-full max-w-2xl bg-white text-slate-900 rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-200">
              <h2 className="text-xl font-semibold">Seifun Project – Terms & Conditions</h2>
              <div className="text-xs text-slate-500 mt-1">Last updated: {new Date().toLocaleDateString()}</div>
            </div>
            <div
              ref={termsRef}
              onScroll={handleScrollTerms}
              className="px-6 py-5 max-h-[52vh] overflow-y-auto leading-relaxed text-sm"
            >
              <p className="mb-4">Welcome to Seifun. By accessing, using, or participating in the Seifun ecosystem, you agree to the following Terms & Conditions (“Terms”). Please read them carefully before interacting with our platform, smart contracts, or community.</p>

              <h3 className="font-semibold mt-4 mb-2">1. Acceptance of Terms</h3>
              <p className="mb-3">By connecting your wallet, interacting with Seifun’s smart contracts, or participating in the Seifun ecosystem, you acknowledge that you have read, understood, and agreed to these Terms.</p>

              <h3 className="font-semibold mt-4 mb-2">2. Eligibility</h3>
              <ul className="list-disc ml-5 mb-3 space-y-1">
                <li>You must be at least 18 years old or meet the legal age requirements of your jurisdiction.</li>
                <li>You are solely responsible for ensuring that participation in Seifun complies with the laws of your country.</li>
              </ul>

              <h3 className="font-semibold mt-4 mb-2">3. No Financial Advice</h3>
              <ul className="list-disc ml-5 mb-3 space-y-1">
                <li>Seifun is an experimental Web3 project.</li>
                <li>Nothing on Seifun should be considered financial, investment, legal, or tax advice.</li>
                <li>You are solely responsible for your decisions, including transactions, staking, liquidity provision, or token usage.</li>
              </ul>

              <h3 className="font-semibold mt-4 mb-2">4. Risk Disclosure</h3>
              <ul className="list-disc ml-5 mb-3 space-y-1">
                <li><span className="font-medium">Volatility:</span> Digital assets may experience high price fluctuations.</li>
                <li><span className="font-medium">Smart Contract Risks:</span> There may be bugs, vulnerabilities, or exploits.</li>
                <li><span className="font-medium">Regulatory Risk:</span> Laws and regulations may change, affecting your ability to use Seifun.</li>
                <li><span className="font-medium">Loss of Funds:</span> Transactions on blockchain networks are irreversible. Seifun is not responsible for lost or stolen assets.</li>
              </ul>

              <h3 className="font-semibold mt-4 mb-2">5. User Responsibilities</h3>
              <ul className="list-disc ml-5 mb-3 space-y-1">
                <li>Keep your wallet and private keys secure.</li>
                <li>Do not use Seifun for illegal activities.</li>
                <li>You acknowledge that participation is voluntary and at your own risk.</li>
              </ul>

              <h3 className="font-semibold mt-4 mb-2">6. No Guarantees</h3>
              <ul className="list-disc ml-5 mb-3 space-y-1">
                <li>Seifun does not guarantee profits, rewards, or any form of return.</li>
                <li>Token utility, features, or incentives may change as the project evolves.</li>
              </ul>

              <h3 className="font-semibold mt-4 mb-2">7. Limitation of Liability</h3>
              <p className="mb-3">Seifun and its contributors are not liable for any direct, indirect, incidental, or consequential losses arising from your use of the platform. Use of Seifun is provided “as is” and “as available.”</p>

              <h3 className="font-semibold mt-4 mb-2">8. Community & Governance</h3>
              <p className="mb-3">Seifun may introduce community governance features. Participation in governance does not create legal or financial obligations for Seifun contributors.</p>

              <h3 className="font-semibold mt-4 mb-2">9. Amendments</h3>
              <p className="mb-3">Seifun may update these Terms at any time. Continued use of the platform constitutes acceptance of the updated Terms.</p>

              <h3 className="font-semibold mt-4 mb-2">10. Contact</h3>
              <p className="mb-2">For any questions, please reach out to the Seifun community via our official channels.</p>
            </div>
            <div className="px-6 py-5 border-t border-slate-200 bg-slate-50">
              <div className="flex items-center justify-between gap-4">
                <label className="flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-slate-300"
                    checked={accepted}
                    onChange={(e) => setAccepted(e.target.checked)}
                  />
                  I have read and accept the Terms & Conditions
                </label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 bg-white hover:bg-slate-100"
                    onClick={() => setShowTerms(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className={`px-4 py-2 rounded-lg text-white ${accepted && scrolledToEnd ? 'bg-blue-600 hover:bg-blue-700' : 'bg-slate-400 cursor-not-allowed'}`}
                    disabled={!accepted || !scrolledToEnd}
                    onClick={handleProceed}
                  >
                    Next
                  </button>
                </div>
              </div>
              {!scrolledToEnd && (
                <div className="text-xs text-slate-500 mt-2">Scroll to the bottom to enable Next.</div>
              )}
            </div>
          </div>
        </div>
      )}
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