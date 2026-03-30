import { BrowserRouter as Router, Routes, Route, NavLink, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import ReviewForm from './components/ReviewForm/ReviewForm';
import InsightsDashboard from './components/InsightsDashboard/InsightsDashboard';
import HistoryView from './components/HistoryView/HistoryView';
import RadarChart from './components/Charts/RadarChart';
import LineChart from './components/Charts/LineChart';
import ReviewBanner from './components/Notifications/ReviewBanner';
import Settings from './components/Settings/Settings';
import { useNotifications } from './hooks/useNotifications';
import { useReviews } from './hooks/useReviews';
import { lifeAreas } from './data/lifeAreas';

function Dashboard() {
  const { reviews } = useReviews();
  const userName = localStorage.getItem('lifelens_username');
  const latestReview = reviews[0];

  const avgScore = latestReview
    ? (lifeAreas.reduce((sum, a) => sum + (latestReview.scores[a.id] || 0), 0) / 9).toFixed(1)
    : null;

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-emerald-400 bg-clip-text text-transparent">
          {userName ? `Welcome back, ${userName}` : 'Welcome to LifeLens'}
        </h1>
        <p className="text-slate-400">Your personal review & re-strategy planner</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-indigo-400">{reviews.length}</p>
          <p className="text-xs text-slate-400 mt-1">Total Reviews</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-emerald-400">
            {reviews.filter(r => r.reviewType === 'weekly').length}
          </p>
          <p className="text-xs text-slate-400 mt-1">Weekly</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-amber-400">
            {reviews.filter(r => r.reviewType === 'monthly').length}
          </p>
          <p className="text-xs text-slate-400 mt-1">Monthly</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-rose-400">
            {avgScore || '—'}
          </p>
          <p className="text-xs text-slate-400 mt-1">Latest Avg</p>
        </div>
      </div>

      {/* Latest Insights */}
      {latestReview?.insights && (
        <div className="bg-gradient-to-br from-indigo-500/10 to-emerald-500/10 border border-indigo-500/20 rounded-2xl p-6">
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Latest Insight</h2>
          <p className="text-slate-200 italic">"{latestReview.insights.headline}"</p>
          <p className="text-sm text-amber-400 mt-2">Focus: {latestReview.insights.focus_area}</p>
        </div>
      )}

      {/* Charts */}
      <RadarChart />
      <LineChart />

      {/* Start Review CTA */}
      {reviews.length === 0 && (
        <div className="text-center py-8">
          <h2 className="text-xl font-bold text-slate-200 mb-2">Ready for your first review?</h2>
          <p className="text-slate-400 mb-6">Take 15 minutes to reflect on your 9 life areas</p>
          <NavLink
            to="/review"
            className="inline-block px-8 py-3 bg-gradient-to-r from-indigo-500 to-emerald-500
              text-white font-semibold rounded-xl shadow-lg hover:shadow-indigo-500/30
              transition-all duration-300 hover:scale-[1.02]"
          >
            Start Your First Review
          </NavLink>
        </div>
      )}
    </div>
  );
}

function ChartsPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <h1 className="text-2xl font-bold text-slate-100">Trends & Charts</h1>
      <RadarChart />
      <LineChart />
    </div>
  );
}

function Layout({ children }) {
  const location = useLocation();

  const navItems = [
    { to: '/', label: 'Home' },
    { to: '/review', label: 'Review' },
    { to: '/history', label: 'History' },
    { to: '/charts', label: 'Charts' },
    { to: '/settings', label: 'Settings' }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      {/* Top bar */}
      <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <NavLink to="/" className="flex items-center gap-2">
            <span className="font-bold text-lg bg-gradient-to-r from-indigo-400 to-emerald-400 bg-clip-text text-transparent">
              LifeLens
            </span>
          </NavLink>

          {/* Desktop nav */}
          <nav className="hidden sm:flex items-center gap-1">
            {navItems.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `
                  px-3 py-1.5 rounded-lg text-sm font-medium transition-all
                  ${isActive
                    ? 'bg-indigo-500/20 text-indigo-400'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }
                `}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-4xl mx-auto px-4 py-8 pb-24 sm:pb-8">
        {children}
      </main>

      {/* Mobile bottom nav */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/90 backdrop-blur-xl border-t border-slate-800">
        <div className="flex items-center justify-around h-16">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `
                flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-all
                ${isActive
                  ? 'text-indigo-400'
                  : 'text-slate-500 hover:text-slate-300'
                }
              `}
            >
              <span className="text-xs font-medium">{item.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}

export default function App() {
  const { triggerTypes, showBanner, dismissBanner } = useNotifications();

  // Initialize dark mode
  useEffect(() => {
    const theme = localStorage.getItem('lifelens_theme');
    if (theme !== 'light') {
      document.documentElement.classList.add('dark');
    }
  }, []);

  return (
    <Router>
      {showBanner && (
        <ReviewBanner triggerTypes={triggerTypes} onDismiss={dismissBanner} />
      )}
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/review" element={<ReviewForm />} />
          <Route path="/history" element={<HistoryView />} />
          <Route path="/history/:id" element={<HistoryView />} />
          <Route path="/insights/:id" element={<InsightsDashboard />} />
          <Route path="/charts" element={<ChartsPage />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </Layout>
    </Router>
  );
}
