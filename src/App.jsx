import { BrowserRouter as Router, Routes, Route, NavLink, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import ReviewForm from './components/ReviewForm/ReviewForm';
import InsightsDashboard from './components/InsightsDashboard/InsightsDashboard';
import HistoryView from './components/HistoryView/HistoryView';
import RadarChart from './components/Charts/RadarChart';
import LineChart from './components/Charts/LineChart';
import ReviewBanner from './components/Notifications/ReviewBanner';
import Settings from './components/Settings/Settings';
import GoalTracker from './components/GoalTracker/GoalTracker';
import StreakDashboard from './components/Streaks/StreakDashboard';
import CompareReviews from './components/CompareReviews/CompareReviews';
import ActionPlan from './components/ActionPlan/ActionPlan';
import TemplateManager from './components/Templates/TemplateManager';
import { useNotifications } from './hooks/useNotifications';
import { useReviews } from './hooks/useReviews';
import { useGoals } from './hooks/useGoals';
import { lifeAreas } from './data/lifeAreas';

function Dashboard() {
  const { reviews } = useReviews();
  const { getActiveGoals, getGoalProgress } = useGoals();
  const userName = localStorage.getItem('lifelens_username');
  const latestReview = reviews[0];
  const activeGoals = getActiveGoals();

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

      {/* Streak Widget */}
      <StreakDashboard compact={true} />

      {/* Active Goals Summary */}
      {activeGoals.length > 0 && (
        <div className="bg-slate-800/40 border border-slate-700 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Active Goals</h3>
            <NavLink to="/goals" className="text-xs text-indigo-400 hover:text-indigo-300">View All →</NavLink>
          </div>
          <div className="space-y-2">
            {activeGoals.slice(0, 3).map(goal => {
              const area = lifeAreas.find(a => a.id === goal.area);
              const progress = getGoalProgress(goal);
              return (
                <div key={goal.id} className="flex items-center gap-3">
                  <span className="text-sm">{area?.icon}</span>
                  <span className="text-sm text-slate-300 flex-1 truncate">{goal.title}</span>
                  <div className="w-16 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500 rounded-full transition-all" style={{ width: `${progress}%` }} />
                  </div>
                  <span className="text-xs text-slate-500 w-8 text-right">{progress}%</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

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
          <NavLink to="/review"
            className="inline-block px-8 py-3 bg-gradient-to-r from-indigo-500 to-emerald-500
              text-white font-semibold rounded-xl shadow-lg hover:shadow-indigo-500/30
              transition-all duration-300 hover:scale-[1.02]">
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

function StreaksPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-slate-100">Streaks & Badges</h1>
      <StreakDashboard />
    </div>
  );
}

function Layout({ children }) {
  const location = useLocation();
  const [moreOpen, setMoreOpen] = useState(false);

  const mainNavItems = [
    { to: '/', label: 'Home', icon: '🏠' },
    { to: '/review', label: 'Review', icon: '📝' },
    { to: '/goals', label: 'Goals', icon: '🎯' },
    { to: '/history', label: 'History', icon: '📋' }
  ];

  const moreNavItems = [
    { to: '/charts', label: 'Charts', icon: '📊' },
    { to: '/compare', label: 'Compare', icon: '⚖️' },
    { to: '/streaks', label: 'Streaks', icon: '🔥' },
    { to: '/templates', label: 'Templates', icon: '📝' },
    { to: '/settings', label: 'Settings', icon: '⚙️' }
  ];

  const allDesktopItems = [...mainNavItems, ...moreNavItems];

  // Close more menu on route change
  useEffect(() => {
    setMoreOpen(false);
  }, [location.pathname]);

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
            {allDesktopItems.map(item => (
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
          {mainNavItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `
                flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-all
                ${isActive ? 'text-indigo-400' : 'text-slate-500 hover:text-slate-300'}
              `}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="text-[10px] font-medium">{item.label}</span>
            </NavLink>
          ))}

          {/* More button */}
          <button
            onClick={() => setMoreOpen(prev => !prev)}
            className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-all
              ${moreOpen ? 'text-indigo-400' : 'text-slate-500 hover:text-slate-300'}`}
          >
            <span className="text-lg">☰</span>
            <span className="text-[10px] font-medium">More</span>
          </button>
        </div>

        {/* More menu slide-up */}
        {moreOpen && (
          <div className="absolute bottom-16 left-0 right-0 bg-slate-900 border-t border-slate-700 rounded-t-2xl p-4 animate-slideUp">
            <div className="grid grid-cols-3 gap-3">
              {moreNavItems.map(item => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) => `
                    flex flex-col items-center gap-1 p-3 rounded-xl transition-all
                    ${isActive ? 'bg-indigo-500/20 text-indigo-400' : 'text-slate-400 hover:bg-slate-800'}
                  `}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span className="text-xs font-medium">{item.label}</span>
                </NavLink>
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* Overlay for more menu */}
      {moreOpen && (
        <div className="sm:hidden fixed inset-0 z-30 bg-black/40" onClick={() => setMoreOpen(false)} />
      )}
    </div>
  );
}

export default function App() {
  const { triggerTypes, showBanner, dismissBanner } = useNotifications();

  // Initialize dark mode
  useEffect(() => {
    const theme = localStorage.getItem('lifelens_theme');
    if (theme === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
      if (!theme) localStorage.setItem('lifelens_theme', 'dark');
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
          <Route path="/goals" element={<GoalTracker />} />
          <Route path="/compare" element={<CompareReviews />} />
          <Route path="/streaks" element={<StreaksPage />} />
          <Route path="/templates" element={<TemplateManager />} />
          <Route path="/action-plan/:id" element={<ActionPlan />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </Layout>
    </Router>
  );
}
