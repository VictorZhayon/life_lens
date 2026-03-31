import { useState, useEffect } from 'react';
import { useNotifications } from '../../hooks/useNotifications';
import { clearAllReviews } from '../../services/firestore';

export default function Settings() {
  const { getEmailJSConfig, saveEmailJSConfig } = useNotifications();

  const [userName, setUserName] = useState('');
  const [emailConfig, setEmailConfig] = useState({
    serviceId: '',
    templateId: '',
    publicKey: '',
    email: ''
  });
  const [saved, setSaved] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const storedName = localStorage.getItem('lifelens_username') || '';
    setUserName(storedName);

    const config = getEmailJSConfig();
    if (config) setEmailConfig(config);

    const theme = localStorage.getItem('lifelens_theme');
    setIsDark(theme !== 'light');
  }, []);

  const handleSaveSettings = () => {
    localStorage.setItem('lifelens_username', userName);
    saveEmailJSConfig(emailConfig);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleExport = () => {
    try {
      const reviews = JSON.parse(localStorage.getItem('lifelens_reviews') || '[]');
      const data = {
        exportedAt: new Date().toISOString(),
        userName,
        reviews
      };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `lifelens_export_${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export failed:', err);
    }
  };

  const handleClearAll = async () => {
    try {
      await clearAllReviews();
      localStorage.removeItem('lifelens_draft');
    } catch (err) {
      console.error('Failed to clear data:', err);
    }
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

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <h1 className="text-2xl font-bold text-slate-100">Settings</h1>

      {/* Personal */}
      <section className="bg-slate-800/40 border border-slate-700 rounded-2xl p-6 space-y-4">
        <h2 className="text-lg font-semibold text-slate-200">Personal</h2>
        <div>
          <label className="block text-sm text-slate-400 mb-1">Your Name</label>
          <input
            id="settings-username"
            type="text"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            placeholder="Enter your name for personalization"
            className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-2.5
              text-slate-200 placeholder-slate-600 text-sm
              focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500"
          />
        </div>
      </section>

      {/* EmailJS Config */}
      <section className="bg-slate-800/40 border border-slate-700 rounded-2xl p-6 space-y-4">
        <h2 className="text-lg font-semibold text-slate-200">Email Notifications (EmailJS)</h2>
        <p className="text-xs text-slate-500">
          Configure EmailJS to receive review reminders. Create a free account at emailjs.com.
        </p>

        {[
          { key: 'serviceId', label: 'Service ID', placeholder: 'e.g. service_xyz123' },
          { key: 'templateId', label: 'Template ID', placeholder: 'e.g. template_abc456' },
          { key: 'publicKey', label: 'Public Key', placeholder: 'e.g. user_def789' },
          { key: 'email', label: 'Email Address', placeholder: 'you@example.com' }
        ].map(field => (
          <div key={field.key}>
            <label className="block text-sm text-slate-400 mb-1">{field.label}</label>
            <input
              id={`settings-${field.key}`}
              type={field.key === 'email' ? 'email' : 'text'}
              value={emailConfig[field.key]}
              onChange={(e) => setEmailConfig(prev => ({ ...prev, [field.key]: e.target.value }))}
              placeholder={field.placeholder}
              className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-2.5
                text-slate-200 placeholder-slate-600 text-sm
                focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500"
            />
          </div>
        ))}
      </section>

      {/* Save Button */}
      <button
        id="save-settings-btn"
        onClick={handleSaveSettings}
        className={`w-full py-3 rounded-xl font-semibold transition-all duration-300
          ${saved
            ? 'bg-emerald-500 text-white'
            : 'bg-indigo-500 text-white hover:bg-indigo-400'
          }`}
      >
        {saved ? '✓ Saved!' : 'Save Settings'}
      </button>

      {/* Appearance */}
      <section className="bg-slate-800/40 border border-slate-700 rounded-2xl p-6 space-y-4">
        <h2 className="text-lg font-semibold text-slate-200">Appearance</h2>
        <button
          id="toggle-dark-mode-btn"
          onClick={handleToggleDarkMode}
          className="flex items-center justify-between w-full px-4 py-3 bg-slate-900/50
            border border-slate-700 rounded-xl hover:border-slate-600 transition-colors"
        >
          <span className="text-sm text-slate-300">{isDark ? 'Dark Mode' : 'Light Mode'}</span>
          <span className={`w-10 h-5 rounded-full relative transition-colors duration-300 ${isDark ? 'bg-indigo-500' : 'bg-slate-400'}`}>
            <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-300 ${isDark ? 'left-5' : 'left-0.5'}`} />
          </span>
        </button>
      </section>

      {/* Data Management */}
      <section className="bg-slate-800/40 border border-slate-700 rounded-2xl p-6 space-y-4">
        <h2 className="text-lg font-semibold text-slate-200">Data Management</h2>

        <button
          id="export-data-btn"
          onClick={handleExport}
          className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl
            text-slate-300 text-sm hover:border-emerald-500/50 hover:text-emerald-400
            transition-colors text-left"
        >
          Export All Data as JSON
        </button>

        {!showClearConfirm ? (
          <button
            onClick={() => setShowClearConfirm(true)}
            className="w-full px-4 py-3 bg-slate-900/50 border border-red-500/20 rounded-xl
              text-red-400 text-sm hover:border-red-500/50
              transition-colors text-left"
          >
            Clear All Data
          </button>
        ) : (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 space-y-3">
            <p className="text-sm text-red-300">Are you sure? This will permanently delete all reviews.</p>
            <div className="flex gap-2">
              <button
                id="confirm-clear-btn"
                onClick={handleClearAll}
                className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium
                  hover:bg-red-400 transition-colors"
              >
                Yes, Delete Everything
              </button>
              <button
                onClick={() => setShowClearConfirm(false)}
                className="px-4 py-2 bg-slate-700 text-slate-300 rounded-lg text-sm
                  hover:bg-slate-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
