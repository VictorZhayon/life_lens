import { useAuth } from '../../hooks/useAuth';

export default function AuthGate() {
  const { signIn, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-8">
        {/* Branding */}
        <div className="space-y-3">
          <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-indigo-500 to-emerald-500 flex items-center justify-center shadow-2xl shadow-indigo-500/30">
            <span className="text-4xl">🔍</span>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-400 to-emerald-400 bg-clip-text text-transparent">
            LifeLens
          </h1>
          <p className="text-slate-400 text-lg">Personal Review & Re-strategy Planner</p>
        </div>

        {/* Features preview */}
        <div className="grid grid-cols-3 gap-3 py-4">
          {[
            { icon: '📊', label: '9 Life Areas' },
            { icon: '🤖', label: 'AI Insights' },
            { icon: '🎯', label: 'Goal Tracking' }
          ].map(f => (
            <div key={f.label} className="bg-slate-800/50 border border-slate-700 rounded-xl p-3 text-center">
              <span className="text-xl">{f.icon}</span>
              <p className="text-[10px] text-slate-400 mt-1">{f.label}</p>
            </div>
          ))}
        </div>

        {/* Google Sign In */}
        <button
          id="google-sign-in-btn"
          onClick={signIn}
          className="w-full flex items-center justify-center gap-3 px-6 py-3.5
            bg-white text-slate-800 rounded-xl font-semibold text-sm
            hover:bg-slate-100 transition-all duration-200 shadow-lg
            hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
        >
          <svg width="20" height="20" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
          </svg>
          Continue with Google
        </button>

        <p className="text-xs text-slate-600">
          Your data is private and stored securely in Firebase
        </p>
      </div>
    </div>
  );
}
