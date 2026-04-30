import { useState, useEffect, useRef } from 'react';
import { useNotifications } from '../../hooks/useNotifications';
import { useReviews } from '../../hooks/useReviews';
import { clearAllReviews } from '../../services/firestore';

export default function Settings() {
  const { getEmailJSConfig, saveEmailJSConfig, pushEnabled, pushPermission, enablePushNotifications, disablePushNotifications } = useNotifications();
  const { exportData, importReviews } = useReviews();

  const [userName, setUserName] = useState('');
  const [emailConfig, setEmailConfig] = useState({ serviceId: '', templateId: '', publicKey: '', email: '' });
  const [saved, setSaved] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [isDark, setIsDark] = useState(true);

  // Import state
  const fileRef = useRef(null);
  const [importPreview, setImportPreview] = useState(null);
  const [importMode, setImportMode] = useState('merge');
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);

  useEffect(() => {
    setUserName(localStorage.getItem('lifelens_username') || '');
    const config = getEmailJSConfig();
    if (config) setEmailConfig(config);
    setIsDark(localStorage.getItem('lifelens_theme') !== 'light');
  }, []);

  const handleSaveSettings = () => {
    localStorage.setItem('lifelens_username', userName);
    saveEmailJSConfig(emailConfig);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleClearAll = async () => {
    try {
      await clearAllReviews();
      localStorage.removeItem('lifelens_draft');
    } catch (err) { console.error('Failed to clear data:', err); }
    setShowClearConfirm(false);
    window.location.reload();
  };

  const handleToggleDarkMode = () => {
    const html = document.documentElement;
    if (isDark) {
      html.classList.remove('dark');
      localStorage.setItem('lifelens_theme', 'light');
      setIsDark(false);
    } else {
      html.classList.add('dark');
      localStorage.setItem('lifelens_theme', 'dark');
      setIsDark(true);
    }
  };

  const handleTogglePush = async () => {
    if (pushEnabled) {
      disablePushNotifications();
    } else {
      await enablePushNotifications();
    }
  };

  // Import handlers
  const handleImportFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        if (!data.reviews || !Array.isArray(data.reviews)) {
          setImportResult({ error: 'Invalid file: no reviews array found.' });
          return;
        }
        const dates = data.reviews.map(r => r.createdAt || r.date).filter(Boolean).sort();
        setImportPreview({
          data,
          count: data.reviews.length,
          dateRange: dates.length > 0 ? `${dates[0].slice(0, 10)} to ${dates[dates.length - 1].slice(0, 10)}` : 'N/A',
          exportedAt: data.exportedAt || 'Unknown'
        });
        setImportResult(null);
      } catch (err) {
        setImportResult({ error: 'Failed to parse file. Make sure it\'s a valid LifeLens export.' });
      }
    };
    reader.readAsText(file);
  };

  const handleImportConfirm = async () => {
    if (!importPreview) return;
    setImporting(true);
    try {
      const count = await importReviews(importPreview.data, importMode);
      setImportResult({ success: `Successfully imported ${count} reviews!` });
      setImportPreview(null);
    } catch (err) {
      setImportResult({ error: err.message });
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <h1 className="text-2xl font-bold text-slate-100">Settings</h1>

      {/* Personal */}
      <section className="bg-slate-800/40 border border-slate-700 rounded-2xl p-6 space-y-4">
        <h2 className="text-lg font-semibold text-slate-200">Personal</h2>
        <div>
          <label className="block text-sm text-slate-400 mb-1">Your Name</label>
          <input id="settings-username" type="text" value={userName}
            onChange={(e) => setUserName(e.target.value)}
            placeholder="Enter your name for personalization"
            className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-2.5
              text-slate-200 placeholder-slate-600 text-sm
              focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500" />
        </div>
      </section>

      {/* Push Notifications */}
      <section className="bg-slate-800/40 border border-slate-700 rounded-2xl p-6 space-y-4">
        <h2 className="text-lg font-semibold text-slate-200">Push Notifications</h2>
        <p className="text-xs text-slate-500">Get browser notifications when reviews are due.</p>

        <button id="toggle-push-btn" onClick={handleTogglePush}
          className="flex items-center justify-between w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl hover:border-slate-600 transition-colors">
          <div>
            <span className="text-sm text-slate-300">{pushEnabled ? 'Push Enabled' : 'Push Disabled'}</span>
            {pushPermission === 'denied' && (
              <p className="text-xs text-red-400 mt-0.5">Notifications blocked by browser. Update in site settings.</p>
            )}
          </div>
          <span className={`w-10 h-5 rounded-full relative transition-colors duration-300 ${pushEnabled ? 'bg-emerald-500' : 'bg-slate-600'}`}>
            <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-300 ${pushEnabled ? 'left-5' : 'left-0.5'}`} />
          </span>
        </button>
      </section>

      {/* EmailJS Config */}
      <section className="bg-slate-800/40 border border-slate-700 rounded-2xl p-6 space-y-4">
        <h2 className="text-lg font-semibold text-slate-200">Email Notifications (EmailJS)</h2>
        <p className="text-xs text-slate-500">Configure EmailJS to receive review reminders. Create a free account at emailjs.com.</p>
        {[
          { key: 'serviceId', label: 'Service ID', placeholder: 'e.g. service_xyz123' },
          { key: 'templateId', label: 'Template ID', placeholder: 'e.g. template_abc456' },
          { key: 'publicKey', label: 'Public Key', placeholder: 'e.g. user_def789' },
          { key: 'email', label: 'Email Address', placeholder: 'you@example.com' }
        ].map(field => (
          <div key={field.key}>
            <label className="block text-sm text-slate-400 mb-1">{field.label}</label>
            <input id={`settings-${field.key}`}
              type={field.key === 'email' ? 'email' : 'text'}
              value={emailConfig[field.key]}
              onChange={(e) => setEmailConfig(prev => ({ ...prev, [field.key]: e.target.value }))}
              placeholder={field.placeholder}
              className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-2.5
                text-slate-200 placeholder-slate-600 text-sm
                focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500" />
          </div>
        ))}
      </section>

      {/* Save Button */}
      <button id="save-settings-btn" onClick={handleSaveSettings}
        className={`w-full py-3 rounded-xl font-semibold transition-all duration-300
          ${saved ? 'bg-emerald-500 text-white' : 'bg-indigo-500 text-white hover:bg-indigo-400'}`}>
        {saved ? '✓ Saved!' : 'Save Settings'}
      </button>

      {/* Appearance */}
      <section className="bg-slate-800/40 border border-slate-700 rounded-2xl p-6 space-y-4">
        <h2 className="text-lg font-semibold text-slate-200">Appearance</h2>
        <button id="toggle-dark-mode-btn" onClick={handleToggleDarkMode}
          className="flex items-center justify-between w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl hover:border-slate-600 transition-colors">
          <span className="text-sm text-slate-300">{isDark ? 'Dark Mode' : 'Light Mode'}</span>
          <span className={`w-10 h-5 rounded-full relative transition-colors duration-300 ${isDark ? 'bg-indigo-500' : 'bg-slate-400'}`}>
            <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-300 ${isDark ? 'left-5' : 'left-0.5'}`} />
          </span>
        </button>
      </section>

      {/* Data Management */}
      <section className="bg-slate-800/40 border border-slate-700 rounded-2xl p-6 space-y-4">
        <h2 className="text-lg font-semibold text-slate-200">Data Management</h2>

        <button id="export-data-btn" onClick={exportData}
          className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl
            text-slate-300 text-sm hover:border-emerald-500/50 hover:text-emerald-400 transition-colors text-left">
          📤 Export All Data as JSON
        </button>

        {/* Import */}
        <div>
          <button onClick={() => fileRef.current?.click()}
            className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl
              text-slate-300 text-sm hover:border-indigo-500/50 hover:text-indigo-400 transition-colors text-left">
            📥 Import Data from JSON
          </button>
          <input ref={fileRef} type="file" accept=".json" onChange={handleImportFile} className="hidden" />
        </div>

        {/* Import Preview */}
        {importPreview && (
          <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-4 space-y-3 animate-fadeIn">
            <h3 className="text-sm font-semibold text-indigo-300">Import Preview</h3>
            <div className="text-sm text-slate-300 space-y-1">
              <p>Reviews: <span className="font-bold">{importPreview.count}</span></p>
              <p>Date range: {importPreview.dateRange}</p>
              <p>Exported: {importPreview.exportedAt.slice(0, 10)}</p>
            </div>
            <div className="flex gap-2">
              {['merge', 'replace'].map(m => (
                <button key={m} onClick={() => setImportMode(m)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all
                    ${importMode === m ? 'bg-indigo-500 text-white' : 'bg-slate-700 text-slate-400'}`}>
                  {m === 'merge' ? 'Merge (add new)' : 'Replace (clear & import)'}
                </button>
              ))}
            </div>
            {importMode === 'replace' && (
              <p className="text-xs text-amber-400">⚠ This will delete all existing reviews before importing.</p>
            )}
            <div className="flex gap-2">
              <button onClick={() => setImportPreview(null)}
                className="flex-1 px-3 py-2 border border-slate-700 text-slate-400 rounded-lg text-sm">Cancel</button>
              <button onClick={handleImportConfirm} disabled={importing}
                className="flex-1 px-3 py-2 bg-indigo-500 text-white rounded-lg text-sm font-medium disabled:opacity-50">
                {importing ? 'Importing...' : 'Import'}
              </button>
            </div>
          </div>
        )}

        {/* Import result */}
        {importResult && (
          <div className={`rounded-xl p-3 text-sm ${importResult.success ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
            {importResult.success || importResult.error}
          </div>
        )}

        {/* Clear All */}
        {!showClearConfirm ? (
          <button onClick={() => setShowClearConfirm(true)}
            className="w-full px-4 py-3 bg-slate-900/50 border border-red-500/20 rounded-xl
              text-red-400 text-sm hover:border-red-500/50 transition-colors text-left">
            🗑️ Clear All Data
          </button>
        ) : (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 space-y-3">
            <p className="text-sm text-red-300">Are you sure? This will permanently delete all reviews.</p>
            <div className="flex gap-2">
              <button id="confirm-clear-btn" onClick={handleClearAll}
                className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-400 transition-colors">
                Yes, Delete Everything
              </button>
              <button onClick={() => setShowClearConfirm(false)}
                className="px-4 py-2 bg-slate-700 text-slate-300 rounded-lg text-sm hover:bg-slate-600 transition-colors">
                Cancel
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
