import React from 'react';
import { Download, Terminal } from 'lucide-react';
import { downloadDjangoProjectZip } from '../django-project/zip-generator';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  sportName: string;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab, sportName }) => {
  const [downloading, setDownloading] = React.useState(false);

  const handleDownload = async () => {
    try {
      setDownloading(true);
      await downloadDjangoProjectZip();
    } finally {
      setDownloading(false);
    }
  };

  const navLinks = [
    { id: 'training', label: 'ML Training Studio' },
    { id: 'prediction', label: 'Inference Sandbox' },
    { id: 'dataset', label: 'Player Telemetry' },
    { id: 'api', label: 'DRF API Client' },
    { id: 'code', label: 'Django Project Code' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 px-4 lg:px-8 py-3.5 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Zone 1: Single text element wordmark */}
        <button
          onClick={() => setActiveTab('training')}
          className="text-left group cursor-pointer focus:outline-none"
        >
          <span className="text-lg font-bold tracking-tight text-white group-hover:text-emerald-400 transition-colors">
            SportPulse ML
          </span>
        </button>

        {/* Zone 2: 4-6 clean text navigation links */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          {navLinks.map((link) => {
            const isActive = activeTab === link.id;
            return (
              <button
                key={link.id}
                onClick={() => setActiveTab(link.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-slate-800 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
              >
                {link.label}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: 1-2 primary actions */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setActiveTab('api')}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-900 border border-slate-800 rounded-lg hover:bg-slate-800 hover:text-white transition-colors whitespace-nowrap cursor-pointer"
          >
            <Terminal className="w-3.5 h-3.5 text-emerald-400" />
            <span>DRF Swagger</span>
          </button>

          <button
            onClick={handleDownload}
            disabled={downloading}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-950 bg-emerald-400 rounded-lg hover:bg-emerald-300 active:bg-emerald-500 transition-colors shadow-xs whitespace-nowrap cursor-pointer disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{downloading ? 'Bundling...' : 'Download Project ZIP'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
