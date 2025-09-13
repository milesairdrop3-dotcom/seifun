import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Search, MessageCircle, BarChart3, Bot } from 'lucide-react';

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
      path: '/app/launch',
      label: 'Home',
      icon: <Home className="w-5 h-5" />,
    },
    {
      path: '/app/seilist',
      label: 'List',
      icon: <Search className="w-5 h-5" />,
    },
    {
      path: '/app/excel',
      label: 'Excel',
      icon: <MessageCircle className="w-6 h-6" />,
      isCenter: true,
    },
    {
      path: '/app/charts',
      label: 'Analytics',
      icon: <BarChart3 className="w-5 h-5" />,
    },
    {
      path: '/app/seilor',
      label: 'Agent',
      icon: <Bot className="w-5 h-5" />,
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
            }`}
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

