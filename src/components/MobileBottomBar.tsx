import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, MessageCircle, BarChart3, Bot, Shield, Wallet } from 'lucide-react';

type TabItem = {
  path: string;
  label: string;
  icon: React.ReactNode;
  isCenter?: boolean;
};

const MobileBottomBar: React.FC = () => {
  const location = useLocation();

  const tabs: TabItem[] = [
    {
      path: '/',
      label: 'Home',
      icon: <Home className="w-5 h-5" />,
    },
    {
      path: '/app/safechecker',
      label: 'Safe',
      icon: <Shield className="w-5 h-5" />,
    },
    {
      path: '/app/seilor',
      label: 'Seilor',
      icon: <Bot className="w-5 h-5" />,
      isCenter: true,
    },
    {
      path: '/app/portfolio',
      label: 'Wallet',
      icon: <Wallet className="w-5 h-5" />,
    },
  ];

  const isActive = (path: string) => location.pathname.startsWith(path);

  return (
    <nav className="mobile-bottom-bar md:hidden">
      <div className="mobile-bottom-inner">
        {tabs.map((t) => (
          <Link
            key={t.path}
            to={t.path}
            className={`${t.isCenter ? 'mobile-tab-center' : 'mobile-tab'} ${
              isActive(t.path) ? 'active' : ''
            } ${t.label === 'Seilor' ? 'mobile-tab-seilor' : ''}`}
            aria-label={t.label}
          >
            <div className="icon">{t.icon}</div>
            {!t.isCenter && <span className="label">{t.label}</span>}
            {t.isCenter && <span className="center-label">{t.label}</span>}
          </Link>
        ))}
      </div>
      {/* Safe area spacer for iOS */}
      <div className="mobile-bottom-safe" />
    </nav>
  );
};

export default MobileBottomBar;

