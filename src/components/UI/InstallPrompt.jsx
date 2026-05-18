import { useState, useEffect } from 'react';

const INSTALL_DISMISSED_KEY = 'lifelens_install_dismissed';
const VISIT_COUNT_KEY = 'lifelens_visit_count';

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Track visits
    const visits = parseInt(localStorage.getItem(VISIT_COUNT_KEY) || '0') + 1;
    localStorage.setItem(VISIT_COUNT_KEY, String(visits));

    // Don't show if already dismissed or installed
    if (localStorage.getItem(INSTALL_DISMISSED_KEY)) return;
    if (window.matchMedia('(display-mode: standalone)').matches) return;
    if (visits < 2) return; // Show after 2nd visit

    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const result = await deferredPrompt.userChoice;
    if (result.outcome === 'accepted') {
      localStorage.setItem(INSTALL_DISMISSED_KEY, 'true');
    }
    setShowPrompt(false);
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    localStorage.setItem(INSTALL_DISMISSED_KEY, 'true');
    setShowPrompt(false);
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed top-16 left-4 right-4 sm:left-auto sm:right-4 sm:w-80 z-50 animate-slideDown">
      <div className="bg-slate-900 border border-indigo-500/30 rounded-2xl p-4 shadow-xl shadow-indigo-500/10">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-emerald-500 flex items-center justify-center flex-shrink-0">
            <span className="text-lg">🔍</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-100">Install LifeLens</p>
            <p className="text-xs text-slate-400 mt-0.5">Add to your home screen for the best experience</p>
          </div>
          <button onClick={handleDismiss} className="text-slate-500 hover:text-slate-300 text-sm">✕</button>
        </div>
        <div className="flex gap-2 mt-3">
          <button onClick={handleDismiss}
            className="flex-1 px-3 py-1.5 text-slate-400 border border-slate-700 rounded-lg text-xs hover:border-slate-600">
            Not now
          </button>
          <button onClick={handleInstall}
            className="flex-1 px-3 py-1.5 bg-indigo-500 text-white rounded-lg text-xs font-medium hover:bg-indigo-400">
            Install
          </button>
        </div>
      </div>
    </div>
  );
}
