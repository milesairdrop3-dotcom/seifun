import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Rocket, ArrowRight } from 'lucide-react';
import { getLiveSeiProtocols } from '../utils/seiEcosystemData';
import { saveBetaApplication } from '../utils/supabase';

const Landing = () => {
  const navigate = useNavigate();
  const [showTerms, setShowTerms] = React.useState(false);
  const [scrolledToEnd, setScrolledToEnd] = React.useState(false);
  const [acceptChoice, setAcceptChoice] = React.useState<'agree' | 'disagree' | 'nevermind' | null>(null);
  const termsRef = React.useRef<HTMLDivElement | null>(null);
  const [ctaRolling, setCtaRolling] = React.useState(false);
  const [step, setStep] = React.useState<'terms' | 'tasks' | 'done'>('terms');

  // Step: tasks + contact form
  const [followSeifu, setFollowSeifu] = React.useState(false);
  const [followMiles, setFollowMiles] = React.useState(false);
  const [xUsername, setXUsername] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [topProtocol, setTopProtocol] = React.useState('');
  const [protocolOptions, setProtocolOptions] = React.useState<{ id: number; name: string }[]>([]);
  const [submitting, setSubmitting] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);

  const handleOpenTerms = () => {
    setShowTerms(true);
    setScrolledToEnd(false);
    setAcceptChoice(null);
    setStep('terms');
    // focus will be handled by browser
  };

  const handleScrollTerms = () => {
    const el = termsRef.current;
    if (!el) return;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 8) {
      setScrolledToEnd(true);
    }
  };

  const handleProceed = async () => {
    if (step === 'terms') {
      if (acceptChoice === 'agree' && scrolledToEnd) {
        setStep('tasks');
        // Load protocols when moving to tasks step
        getLiveSeiProtocols()
          .then((apps) => {
            const allowed = new Set(['DeFi', 'Trading', 'Staking', 'Lending']);
            const options = apps
              .filter((a) => a.status === 'Live' && allowed.has(a.category))
              .map((a) => ({ id: a.id, name: a.name }));
            setProtocolOptions(options);
            if (options.length && !topProtocol) setTopProtocol(options[0].name);
          })
          .catch((error) => {
            console.warn('Failed to load protocols:', error);
            // Set fallback options
            setProtocolOptions([
              { id: 1, name: 'Astroport' },
              { id: 2, name: 'Dragonswap' },
              { id: 3, name: 'Nitro' },
              { id: 4, name: 'Kryptonite' }
            ]);
            if (!topProtocol) setTopProtocol('Astroport');
          });
      } else if (acceptChoice === 'disagree' || acceptChoice === 'nevermind') {
        setShowTerms(false);
      }
    } else if (step === 'tasks') {
      // Submit
      setSubmitting(true);
      setSubmitError(null);
      const emailValid = /.+@.+\..+/.test(email);
      const usernameValid = xUsername.trim().length >= 2;
      if (!followSeifu || !followMiles) {
        setSubmitting(false);
        setSubmitError('Please confirm you followed both accounts.');
        return;
      }
      if (!usernameValid) {
        setSubmitting(false);
        setSubmitError('Enter a valid X username.');
        return;
      }
      if (!emailValid) {
        setSubmitting(false);
        setSubmitError('Enter a valid email address.');
        return;
      }
      if (!topProtocol) {
        setSubmitting(false);
        setSubmitError('Select your top DeFi protocol.');
        return;
      }
      try {
        await saveBetaApplication({
          x_username: xUsername.trim(),
          email: email.trim(),
          top_protocol: topProtocol,
          followed_seifu: followSeifu,
          followed_miles: followMiles,
        });
        setStep('done');
      } catch (err: any) {
        console.error('saveBetaApplication error', err);
        setSubmitError(err?.message || 'Failed to submit. Please try again.');
      } finally {
        setSubmitting(false);
      }
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
        <div className="absolute inset-0 -z-10">
          {/* Loading placeholder */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 animate-pulse" />
          
          <img
            src={'/assets/landing-bg.jpg'}
            alt=""
            aria-hidden="true"
            className="landing-bg-img"
            loading="eager"
            decoding="async"
            onLoad={(e) => {
              const img = e.currentTarget as HTMLImageElement;
              img.style.opacity = '1';
              // Hide loading placeholder
              const placeholder = img.parentElement?.querySelector('.animate-pulse');
              if (placeholder) {
                (placeholder as HTMLElement).style.opacity = '0';
                setTimeout(() => {
                  (placeholder as HTMLElement).style.display = 'none';
                }, 500);
              }
            }}
            onError={(e) => {
              const img = e.currentTarget as HTMLImageElement;
              const githubRaw = 'https://raw.githubusercontent.com/milesairdrop3-dotcom/seifun/main/public/assets/landing-bg.jpg';
              if (img.src !== githubRaw) {
                img.src = githubRaw;
              } else {
                // Final fallback - show gradient background
                img.style.display = 'none';
                const parent = img.parentElement;
                if (parent) {
                  parent.style.background = 'linear-gradient(135deg, #0b1e3a 0%, #1e3a8a 50%, #3b82f6 100%)';
                }
              }
            }}
          />
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
            {/* Snow-like text droplets */}
            <div className="seifun-snow" aria-hidden="true">
              {Array.from({ length: 14 }).map((_, i) => (
                <span
                  key={i}
                  className="seifun-flake"
                  style={{
                    left: `${(i * 71) % 100}%`,
                    ['--x' as any]: `${(i % 2 === 0 ? -1 : 1) * (4 + (i % 8))}px`,
                    ['--xamp' as any]: `${(i % 5) * 6 + 8}px`,
                    ['--fall' as any]: `${10 + (i % 7)}s`,
                    ['--wobble' as any]: `${4 + (i % 5)}s`,
                    fontSize: `${12 + (i % 6) * 2}px`,
                  }}
                >
                  {i % 2 === 0 ? 'sei' : 'fun'}
                </span>
              ))}
            </div>
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
            {/* Modal Content */}
            {step === 'terms' && (
              <>
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
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3 text-sm text-slate-700">
                    <label className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${acceptChoice === 'agree' ? 'border-sky-400 bg-white' : 'border-slate-300 bg-white/70'}`}>
                      <input type="radio" name="accept" checked={acceptChoice === 'agree'} onChange={() => setAcceptChoice('agree')} />
                      I agree
                    </label>
                    <label className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${acceptChoice === 'disagree' ? 'border-sky-400 bg-white' : 'border-slate-300 bg-white/70'}`}>
                      <input type="radio" name="accept" checked={acceptChoice === 'disagree'} onChange={() => setAcceptChoice('disagree')} />
                      I don't agree
                    </label>
                    <label className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${acceptChoice === 'nevermind' ? 'border-sky-400 bg-white' : 'border-slate-300 bg-white/70'}`}>
                      <input type="radio" name="accept" checked={acceptChoice === 'nevermind'} onChange={() => setAcceptChoice('nevermind')} />
                      Never mind
                    </label>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <button
                      type="button"
                      className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 bg-white hover:bg-slate-100"
                      onClick={() => setShowTerms(false)}
                    >
                      Close
                    </button>
                    <button
                      type="button"
                      className={`px-4 py-2 rounded-lg text-white ${acceptChoice === 'agree' && scrolledToEnd ? 'bg-blue-600 hover:bg-blue-700' : 'bg-slate-400 cursor-not-allowed'}`}
                      disabled={!(acceptChoice === 'agree' && scrolledToEnd)}
                      onClick={handleProceed}
                    >
                      Continue
                    </button>
                  </div>
                  {!scrolledToEnd && (
                    <div className="text-xs text-slate-500 mt-2">Scroll to the bottom to enable Continue.</div>
                  )}
                </div>
              </>
            )}

            {step === 'tasks' && (
              <>
                <div className="px-6 py-5 border-b border-slate-200">
                  <h2 className="text-xl font-semibold">Beta Application</h2>
                  <div className="text-xs text-slate-500 mt-1">Complete the quick tasks below</div>
                </div>
                <div className="px-6 py-5 space-y-5 max-h-[60vh] overflow-y-auto">
                  <div>
                    <h3 className="font-semibold mb-2">Follow on X</h3>
                    <div className="grid sm:grid-cols-2 gap-3">
                      <label className="flex items-center justify-between gap-3 p-3 rounded-lg border border-slate-300 bg-white/90">
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center justify-center w-6 h-6 text-sky-400">✦</span>
                          <span>Account 1</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <a className="landing-btn beta-cta-white px-3 py-1" href="https://x.com/seifu_trade" target="_blank" rel="noreferrer" aria-label="Follow account 1 on X">Follow</a>
                          <input type="checkbox" className="h-4 w-4" checked={followSeifu} onChange={(e) => setFollowSeifu(e.target.checked)} aria-label="I followed account 1" />
                        </div>
                      </label>
                      <label className="flex items-center justify-between gap-3 p-3 rounded-lg border border-slate-300 bg-white/90">
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center justify-center w-6 h-6 text-sky-400">✦</span>
                          <span>Account 2</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <a className="landing-btn beta-cta-white px-3 py-1" href="https://x.com/iseoluwa_miles" target="_blank" rel="noreferrer" aria-label="Follow account 2 on X">Follow</a>
                          <input type="checkbox" className="h-4 w-4" checked={followMiles} onChange={(e) => setFollowMiles(e.target.checked)} aria-label="I followed account 2" />
                        </div>
                      </label>
                    </div>
                    <p className="text-xs text-slate-500 mt-2">Your X username will be used for contact if your task is completed.</p>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">X username</label>
                      <input className="landing-input light" placeholder="e.g. seifun_user" value={xUsername} onChange={(e) => setXUsername(e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                      <input type="email" className="landing-input light" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Top DeFi protocol on Sei</label>
                    <select className="landing-input light" value={topProtocol} onChange={(e) => setTopProtocol(e.target.value)}>
                      {protocolOptions.map((p) => (
                        <option key={p.id} value={p.name}>{p.name}</option>
                      ))}
                    </select>
                    {!protocolOptions.length && (
                      <div className="text-xs text-slate-500 mt-1">Loading active protocols…</div>
                    )}
                  </div>

                  {submitError && (
                    <div className="text-sm text-red-600">{submitError}</div>
                  )}
                </div>
                <div className="px-6 py-5 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
                  <button type="button" className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 bg-white hover:bg-slate-100" onClick={() => setStep('terms')}>Back</button>
                  <button type="button" className={`px-4 py-2 rounded-lg text-white ${submitting ? 'bg-slate-400' : 'bg-blue-600 hover:bg-blue-700'}`} disabled={submitting} onClick={handleProceed}>
                    {submitting ? 'Submitting…' : 'Submit'}
                  </button>
                </div>
              </>
            )}

            {step === 'done' && (
              <>
                <div className="px-6 py-10 text-center">
                  <h2 className="text-2xl font-semibold mb-2">Thank you!</h2>
                  <p className="text-slate-600">Your beta application has been received. We will contact you via X or email.</p>
                  <div className="mt-6">
                    <button type="button" className="landing-btn beta-cta-white" onClick={() => setShowTerms(false)}>Close</button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
      {/* Landing socials - themed */}
      <div className="landing-socials">
        <div className="landing-socials-inner">
          <a href="https://x.com/seifu_trade" target="_blank" rel="noreferrer" className="landing-social-link" aria-label="X (@seifu_trade)">
            <span className="icon" aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M18.9 3H22l-7.5 9.1L22.6 21h-5.7l-5-5.8L6.2 21H3.1l7-8.5L2.3 3h5.9l4.5 5.3L18.9 3Z" />
              </svg>
            </span>
          </a>
          <a href="#" onClick={(e)=>e.preventDefault()} className="landing-social-link" aria-label="Discord (coming soon)">
            <span className="icon" aria-hidden="true">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" role="img" focusable="false">
                <path d="M20.317 4.369A17.345 17.345 0 0 0 16.558 3a12.248 12.248 0 0 0-.6 1.243 16.145 16.145 0 0 0-4.316 0A12.3 12.3 0 0 0 11.042 3a17.29 17.29 0 0 0-3.76 1.369C5.31 7.194 4.797 9.936 5.03 12.622c1.873 1.36 3.685 2.191 5.452 2.63.418-.58.792-1.195 1.116-1.84-.621-.236-1.215-.522-1.776-.852.148-.108.294-.22.435-.338 3.423 1.6 7.125 1.6 10.52 0 .141.118.287.23.435.338-.56.33-1.155.616-1.777.852.324.645.698 1.26 1.117 1.84 1.765-.44 3.577-1.27 5.449-2.63.375-4.178-.645-6.93-2.084-8.253ZM9.68 10.965c-1.009 0-1.826.93-1.826 2.078 0 1.149.817 2.079 1.826 2.079 1.009 0 1.827-.93 1.827-2.079 0-1.148-.818-2.078-1.827-2.078Zm6.64 0c-1.009 0-1.826.93-1.826 2.078 0 1.149.817 2.079 1.826 2.079s1.827-.93 1.827-2.079c0-1.148-.818-2.078-1.827-2.078Z"/>
              </svg>
            </span>
            <span className="sr-only">Coming soon</span>
          </a>
          {/* GitHub hidden for now */}
          <span className="landing-social-divider" />
          <span className="landing-socials-copy">© 2025 All rights reserved</span>
        </div>
      </div>
      {/* No separate footer bar to avoid duplication */}
    </div>
  );
};

export default Landing;