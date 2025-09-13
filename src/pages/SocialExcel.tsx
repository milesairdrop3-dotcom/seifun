import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, Send, Image as ImageIcon, ExternalLink, Sparkles } from 'lucide-react';

type ExcelPost = {
  id: string;
  author: string;
  handle: string;
  avatar: string;
  content: string;
  time: string;
  source?: 'x' | 'native';
};

const initialFeed: ExcelPost[] = [
  {
    id: '1',
    author: 'Seifun',
    handle: '@seifun_ai',
    avatar: '/Seifu.png',
    content: 'Welcome to Excel — follow fresh token news and act fast with Seilor.',
    time: 'Just now',
    source: 'native',
  },
  {
    id: '2',
    author: 'Sei Network',
    handle: '@SeiNetwork',
    avatar: '/Seifu.png',
    content: 'Mainnet upgrades rolling — lower latency, smoother trades. #Sei',
    time: '2m',
    source: 'x',
  },
];

const SocialExcel: React.FC = () => {
  const [text, setText] = useState('');
  const [feed, setFeed] = useState<ExcelPost[]>(initialFeed);

  const submitPost = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setFeed([
      {
        id: String(Date.now()),
        author: 'You',
        handle: '@you',
        avatar: '/Seifu.png',
        content: trimmed,
        time: 'now',
        source: 'native',
      },
      ...feed,
    ]);
    setText('');
  };

  return (
    <div className="app-bg-primary min-h-screen">
      <div className="app-container py-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="app-heading-lg">Excel</h1>
          <Link to="/app/seilor" className="app-btn app-btn-primary flex items-center">
            <Sparkles className="w-4 h-4 mr-2" />
            Ask Seilor
          </Link>
        </div>

        {/* Composer */}
        <div className="app-card p-4 mb-4">
          <div className="flex space-x-3">
            <img src="/Seifu.png" alt="avatar" className="w-10 h-10 rounded-full" />
            <div className="flex-1">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Share news or insights…"
                className="w-full app-input resize-none min-h-[72px]"
              />
              <div className="flex items-center justify-between mt-2">
                <button className="app-btn app-btn-secondary flex items-center">
                  <ImageIcon className="w-4 h-4 mr-2" />
                  Media
                </button>
                <button onClick={submitPost} className="app-btn app-btn-primary flex items-center">
                  <Send className="w-4 h-4 mr-2" />
                  Post
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Feed */}
        <div className="space-y-3">
          {feed.map((p) => (
            <div key={p.id} className="app-card p-4">
              <div className="flex items-start space-x-3">
                <img src={p.avatar} alt={p.author} className="w-10 h-10 rounded-full" />
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="app-text-primary font-medium">{p.author}</span>
                    <span className="app-text-muted text-sm">{p.handle}</span>
                    <span className="app-text-muted text-xs">• {p.time}</span>
                    {p.source === 'x' && (
                      <span className="text-xs bg-blue-600/20 text-blue-300 px-2 py-0.5 rounded-full">X</span>
                    )}
                  </div>
                  <p className="app-text-secondary mt-1 whitespace-pre-wrap">{p.content}</p>
                  <div className="mt-3 flex items-center space-x-4 text-sm">
                    <button className="app-text-muted hover:app-text-primary flex items-center">
                      <MessageSquare className="w-4 h-4 mr-1" /> Reply
                    </button>
                    <a className="app-text-muted hover:app-text-primary flex items-center" href="#" target="_blank" rel="noreferrer">
                      <ExternalLink className="w-4 h-4 mr-1" /> View Source
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SocialExcel;

