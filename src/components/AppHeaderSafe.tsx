import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Wallet, LogOut, User, Settings, ChevronDown } from 'lucide-react';
import { useReownWallet } from '../utils/reownWalletConnection';
import { privateKeyWallet } from '../services/PrivateKeyWallet';

const AppHeaderSafe = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isWalletDropdownOpen, setIsWalletDropdownOpen] = useState(false);
  const walletDropdownRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  // Use ReOWN wallet functionality
  const {
    isConnected,
    address,
    balance,
    isConnecting,
    error,
    walletType,
    connectWallet,
    disconnectWallet
  } = useReownWallet();

  // Prefer private key wallet for testing when ReOWN not connected
  const usingPK = !isConnected && privateKeyWallet.isConnected;
  const effectiveAddress = usingPK ? privateKeyWallet.getAddress() : (address || '');
  const walletAddress = effectiveAddress ? `${effectiveAddress.slice(0, 6)}...${effectiveAddress.slice(-4)}` : '';

  const handleConnectWallet = async () => {
    try {
      if (usingPK) return; // already using test wallet
      await connectWallet();
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    }
  };

  const handleDisconnectWallet = async () => {
    try {
      if (usingPK) return; // do nothing for test wallet
      await disconnectWallet();
      setIsWalletDropdownOpen(false);
    } catch (error) {
      console.error('Failed to disconnect wallet:', error);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (walletDropdownRef.current && !walletDropdownRef.current.contains(event.target as Node)) {
        setIsWalletDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <header className="app-nav sticky top-0 z-50">
      <div className="app-container">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <div className="relative">
              <img 
                src="/Seifu.png" 
                alt="Seifun Logo" 
                className="w-10 h-10 rounded-full"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold app-text-primary">
                Seifun
              </span>
              <span className="text-xs app-text-muted -mt-1">Launch Platform</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link 
              to="/" 
              className={`app-nav-link ${isActive('/') ? 'active' : ''}`}
            >
              Home
            </Link>
            <Link 
              to="/app/safechecker"
              className={`app-nav-link ${isActive('/app/safechecker') ? 'active' : ''}`}
            >
              SafeChecker
            </Link>
            <Link 
              to="/app/seilor" 
              className={`app-nav-link ${isActive('/app/seilor') ? 'active' : ''}`}
            >
              Seilor 0
            </Link>
            <Link 
              to="/app/docs" 
              className={`app-nav-link ${isActive('/app/docs') ? 'active' : ''}`}
            >
              Docs
            </Link>
          </nav>

          {/* Right Side */}
          <div className="flex items-center space-x-4">
            {(isConnected || usingPK) ? (
              <div className="relative" ref={walletDropdownRef}>
                <button
                  onClick={() => setIsWalletDropdownOpen(!isWalletDropdownOpen)}
                  className="flex items-center space-x-2 px-4 py-2 app-bg-tertiary hover:app-bg-secondary rounded-lg transition-colors"
                >
                  <Wallet className="w-4 h-4" />
                  <span className="text-sm">{walletAddress}</span>
                  <ChevronDown className="w-4 h-4" />
                </button>

                {isWalletDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 app-card p-4 z-50">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 p-2 rounded-lg app-bg-secondary">
                        <User className="w-4 h-4 app-text-muted" />
                        <div className="flex-1">
                          <div className="text-sm app-text-primary">{walletAddress}</div>
                          <div className="text-xs app-text-muted">{usingPK ? 'Private Key (Test)' : walletType}</div>
                        </div>
                      </div>
                      <div className="border-t app-border pt-2">
                        {!usingPK && (
                          <button 
                            onClick={handleDisconnectWallet}
                            className="w-full flex items-center space-x-2 p-2 rounded-lg hover:app-bg-secondary transition-colors"
                          >
                            <LogOut className="w-4 h-4 app-text-muted" />
                            <span className="text-sm app-text-primary">Disconnect</span>
                          </button>
                        )}
                        {usingPK && (
                          <div className="text-xs app-text-muted p-2">Using built-in test wallet for convenience.</div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="relative">
                <button
                  onClick={handleConnectWallet}
                  disabled={isConnecting}
                  className="app-btn app-btn-primary"
                >
                  <Wallet className="w-4 h-4 mr-2" />
                  {isConnecting ? 'Connecting...' : 'Connect Wallet'}
                </button>
                {error && (
                  <div className="absolute right-0 mt-2 w-64 app-card p-3 z-50">
                    <p className="text-red-400 text-xs">{error}</p>
                  </div>
                )}
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg app-bg-tertiary hover:app-bg-secondary transition-colors"
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5 app-text-primary" />
              ) : (
                <Menu className="w-5 h-5 app-text-primary" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t app-border">
            <nav className="py-4 space-y-2">
              <Link 
                to="/"
                className={`block px-4 py-2 rounded-lg transition-colors ${
                  isActive('/') ? 'app-bg-secondary app-text-primary' : 'app-text-secondary hover:app-bg-secondary'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link to="/app/safechecker" className={`block px-4 py-2 rounded-lg transition-colors ${isActive('/app/safechecker') ? 'app-bg-secondary app-text-primary' : 'app-text-secondary hover:app-bg-secondary'}`} onClick={() => setIsMobileMenuOpen(false)}>SafeChecker</Link>
              <Link to="/app/seilor" className={`block px-4 py-2 rounded-lg transition-colors ${isActive('/app/seilor') ? 'app-bg-secondary app-text-primary' : 'app-text-secondary hover:app-bg-secondary'}`} onClick={() => setIsMobileMenuOpen(false)}>Seilor 0</Link>
              <Link to="/app/docs" className={`block px-4 py-2 rounded-lg transition-colors ${isActive('/app/docs') ? 'app-bg-secondary app-text-primary' : 'app-text-secondary hover:app-bg-secondary'}`} onClick={() => setIsMobileMenuOpen(false)}>Docs</Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default AppHeaderSafe;