import React, { useState, useEffect } from 'react';
import { Search, TrendingUp, Star, Eye, Users, DollarSign } from 'lucide-react';
import { unifiedTokenService, TokenData } from '../services/UnifiedTokenService';
import { useNavigate } from 'react-router-dom';

const SeifunLaunch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tokens, setTokens] = useState<TokenData[]>([]);
  const navigate = useNavigate();

  const categories = [
    { id: 'all', name: 'All Tokens', icon: Star },
    { id: 'trending', name: 'Trending', icon: TrendingUp },
    { id: 'new', name: 'New Launches', icon: Eye },
    { id: 'top', name: 'Top Performers', icon: DollarSign },
    { id: 'community', name: 'Community', icon: Users },
  ];

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);
        await unifiedTokenService.initialize();
        const all = await unifiedTokenService.getAllTokens();
        setTokens(all);
      } catch (e: any) {
        setError(e?.message || 'Failed to load tokens');
      } finally {
        setIsLoading(false);
      }
    };
    load();
    const id = setInterval(async ()=> {
      await unifiedTokenService.initialize();
      const all = await unifiedTokenService.getAllTokens();
      setTokens(all);
    }, 30000);
    return ()=> clearInterval(id)
  }, []);

  const filteredTokens = tokens.filter(token => {
    const matchesSearch = token.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         token.symbol.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || 
                          (selectedCategory === 'trending' && (token.volume24h || 0) > 1000) ||
                          (selectedCategory === 'new' && (Date.now() - token.createdAt.getTime()) < 7 * 24 * 60 * 60 * 1000) ||
                          (selectedCategory === 'top' && (token.marketCap || 0) > 1000000) ||
                          (selectedCategory === 'community' && token.holders > 1000);
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="app-bg-primary min-h-screen">
      {/* Header */}
      <div className="app-bg-secondary border-b app-border">
        <div className="app-container py-8">
          <h1 className="app-heading-xl app-text-primary mb-4">Seifun Launch</h1>
          <p className="app-text-lg max-w-3xl">
            Discover the latest and most promising tokens on the Sei blockchain. 
            Launch your own token or invest in emerging projects with confidence.
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="app-container py-8">
        {/* Search Bar */}
        <div className="app-search-bar">
          <Search className="app-search-icon" />
          <input
            type="text"
            placeholder="Search tokens by name or symbol..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="app-search-input"
          />
        </div>

        {/* Category Tabs */}
        <div className="app-category-tabs">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`app-category-tab ${
                  selectedCategory === category.id ? 'active' : ''
                }`}
              >
                <Icon className="w-4 h-4 mr-2" />
                {category.name}
              </button>
            );
          })}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="app-text-secondary">Loading tokens...</div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <div className="app-text-secondary mb-4">{error}</div>
            <button 
              onClick={() => window.location.reload()} 
              className="app-btn app-btn-primary"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Token Grid */}
        {!isLoading && !error && (
          <div className="app-token-grid">
            {filteredTokens.map((token) => (
              <div key={token.address} className="app-token-card">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <img
                      src={token.tokenImage || '/Seifu.png'}
                      alt={token.name}
                      className="w-10 h-10 rounded-full"
                    />
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold app-text-primary">{token.name}</h3>
                        {token.verified && (
                          <span className="text-xs bg-green-500 text-white px-2 py-1 rounded">
                            Verified
                          </span>
                        )}
                      </div>
                      <p className="text-sm app-text-muted">{token.symbol}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold app-text-primary">
                      {(token.price ?? 0).toFixed(6)}
                    </div>
                    <div className={`text-sm ${
                      (token.priceChange24h ?? 0) >= 0 ? 'text-green-500' : 'text-red-500'
                    }`}>
                      {(token.priceChange24h ?? 0) >= 0 ? '+' : ''}{(token.priceChange24h ?? 0).toFixed(2)}%
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="app-text-muted">Market Cap</div>
                    <div className="app-text-primary">${((token.marketCap || 0) / 1000000).toFixed(2)}M</div>
                  </div>
                  <div>
                    <div className="app-text-muted">Volume 24h</div>
                    <div className="app-text-primary">${((token.volume24h || 0) / 1000).toFixed(0)}K</div>
                  </div>
                  <div>
                    <div className="app-text-muted">Holders</div>
                    <div className="app-text-primary">{token.holders.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="app-text-muted">Liquidity</div>
                    <div className="app-text-primary">${((token.liquidity || 0) / 1000).toFixed(0)}K</div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t app-border">
                  <p className="text-sm app-text-secondary mb-3">Created {token.createdAt.toLocaleDateString()}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-xs app-text-muted">
                      Address: {token.address.slice(0, 6)}...{token.address.slice(-4)}
                    </span>
                    <button
                      onClick={() => navigate(`/app/charts?token=${token.address}`)}
                      className="app-btn app-btn-primary text-sm"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && filteredTokens.length === 0 && (
          <div className="text-center py-12">
            <div className="app-text-secondary mb-4">No tokens found matching your criteria.</div>
            <button 
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
              }} 
              className="app-btn app-btn-secondary"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SeifunLaunch;