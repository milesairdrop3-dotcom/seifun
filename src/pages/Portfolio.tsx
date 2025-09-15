import React, { useEffect, useState } from 'react';
import { Wallet, ArrowUpRight, ArrowDownRight, Gift } from 'lucide-react';

const Portfolio: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [balances, setBalances] = useState<{ sei: number; usdc: number; totalUsd: number }>({ sei: 0, usdc: 0, totalUsd: 0 });
  const [txs, setTxs] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/.netlify/functions/wallet-portfolio', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ address: '', network: 'testnet', includeSymbols: ['SEI','USDC'] }) });
        if (res.ok) {
          const data = await res.json();
          const sei = Number(data?.native?.balance || 0);
          const usdc = Number((data?.tokens || []).find((t:any)=> (t.symbol||'').toUpperCase()==='USDC')?.balance || 0);
          setBalances({ sei, usdc, totalUsd: sei*0.834 + usdc });
        }
      } finally { setLoading(false); }
    };
    load();
  }, []);

  return (
    <div className="app-bg-primary min-h-screen">
      <div className="app-container py-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-blue-600/30 border border-blue-500/30 flex items-center justify-center"><Wallet className="w-5 h-5 text-blue-300"/></div>
          <h1 className="app-heading-lg">Wallet</h1>
        </div>
        {loading ? (
          <div className="app-text-secondary">Loading portfolio…</div>
        ) : (
          <div className="grid md:grid-cols-3 gap-4">
            <div className="app-card p-4"><div className="app-text-muted text-sm">SEI</div><div className="app-heading-md">{balances.sei.toFixed(4)}</div></div>
            <div className="app-card p-4"><div className="app-text-muted text-sm">USDC</div><div className="app-heading-md">{balances.usdc.toFixed(2)}</div></div>
            <div className="app-card p-4"><div className="app-text-muted text-sm">Total USD</div><div className="app-heading-md">${balances.totalUsd.toFixed(2)}</div></div>
          </div>
        )}

        <div className="mt-6 grid md:grid-cols-3 gap-4">
          <div className="app-card p-4"><div className="flex items-center gap-2 app-text-muted text-sm"><ArrowUpRight className="w-4 h-4"/>Recent Buys</div><div className="app-text-secondary text-sm mt-2">Coming soon</div></div>
          <div className="app-card p-4"><div className="flex items-center gap-2 app-text-muted text-sm"><ArrowDownRight className="w-4 h-4"/>Recent Sells</div><div className="app-text-secondary text-sm mt-2">Coming soon</div></div>
          <div className="app-card p-4"><div className="flex items-center gap-2 app-text-muted text-sm"><Gift className="w-4 h-4"/>Rewards</div><div className="app-text-secondary text-sm mt-2">Coming soon</div></div>
        </div>
      </div>
    </div>
  );
};

export default Portfolio;

