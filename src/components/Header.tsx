import React from 'react';
import { Download, Terminal, Code2, LogIn, LogOut, User } from 'lucide-react';
import { downloadDjangoProjectZip } from '../django-project/zip-generator';
import { auth, loginWithGoogle, logoutUser } from '../firebase/config';
import { syncUserProfile } from '../firebase/firestore-service';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  sportName: string;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab, sportName }) => {
  const [downloading, setDownloading] = React.useState(false);
  const [currentUser, setCurrentUser] = React.useState<FirebaseUser | null>(null);
  const [authLoading, setAuthLoading] = React.useState(false);

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          await syncUserProfile({
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
          });
        } catch (e) {
          console.error('Failed to sync user profile:', e);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  const handleGoogleLogin = async () => {
    try {
      setAuthLoading(true);
      await loginWithGoogle();
    } catch (e) {
      console.error('Google Sign-In Error:', e);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch (e) {
      console.error('Logout error:', e);
    }
  };

  const handleDownload = async () => {
    try {
      setDownloading(true);
      await downloadDjangoProjectZip();
    } finally {
      setDownloading(false);
    }
  };

  const navLinks = [
    { id: 'python', label: 'Python ML Studio' },
    { id: 'training', label: 'Interactive ML Models' },
    { id: 'prediction', label: 'Inference Sandbox' },
    { id: 'dataset', label: 'Player Telemetry' },
    { id: 'api', label: 'Django REST API' },
    { id: 'code', label: 'Project Files (.py)' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 px-4 lg:px-8 py-3.5 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Zone 1: Single text element wordmark */}
        <button
          onClick={() => setActiveTab('python')}
          className="text-left group cursor-pointer focus:outline-none shrink-0"
        >
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold tracking-tight text-white group-hover:text-emerald-400 transition-colors">
              SportPulse Python ML
            </span>
          </div>
        </button>

        {/* Zone 2: 4-6 clean text navigation links */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-1.5">
          {navLinks.map((link) => {
            const isActive = activeTab === link.id;
            return (
              <button
                key={link.id}
                onClick={() => setActiveTab(link.id)}
                className={`px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
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
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Firebase Authentication State */}
          {currentUser ? (
            <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-lg py-1 px-2.5">
              {currentUser.photoURL ? (
                <img
                  src={currentUser.photoURL}
                  alt={currentUser.displayName || 'User'}
                  className="w-5 h-5 rounded-full"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <User className="w-3.5 h-3.5 text-emerald-400" />
              )}
              <span className="text-xs text-slate-200 max-w-[100px] truncate hidden sm:inline">
                {currentUser.displayName || currentUser.email?.split('@')[0]}
              </span>
              <button
                onClick={handleLogout}
                title="Sign Out"
                className="text-slate-400 hover:text-rose-400 transition-colors ml-1 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleGoogleLogin}
              disabled={authLoading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-900 border border-slate-800 rounded-lg hover:bg-slate-800 transition-colors whitespace-nowrap cursor-pointer disabled:opacity-50"
            >
              <LogIn className="w-3.5 h-3.5 text-emerald-400" />
              <span>{authLoading ? 'Signing In...' : 'Google Sign-In'}</span>
            </button>
          )}

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
