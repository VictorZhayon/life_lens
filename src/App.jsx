import { BrowserRouter as Router, Routes, Route, NavLink, useLocation } from 'react-router-dom';
import { useEffect, useState, Suspense, lazy } from 'react';
import { AuthProvider, useAuth } from './hooks/useAuth';
import AuthGate from './components/Auth/AuthGate';
import Onboarding from './components/Onboarding/Onboarding';
import { ToastProvider } from './components/UI/ToastProvider';
import ErrorBoundary from './components/UI/ErrorBoundary';
import PageTransition from './components/UI/PageTransition';
import InstallPrompt from './components/UI/InstallPrompt';
import { PageSkeleton } from './components/UI/Skeleton';
import ReviewBanner from './components/Notifications/ReviewBanner';
import { useNotifications } from './hooks/useNotifications';
import { useReviews } from './hooks/useReviews';
import { useGoals } from './hooks/useGoals';
import { useStreaks } from './hooks/useStreaks';
import { lifeAreas } from './data/lifeAreas';
import { migrateRootDataToUser } from './services/firestore';

// Eagerly loaded (critical path)
import StreakDashboard from './components/Streaks/StreakDashboard';

// Code-split: lazy load non-critical routes
const ReviewForm = lazy(() => import('./components/ReviewForm/ReviewForm'));
const InsightsDashboard = lazy(() => import('./components/InsightsDashboard/InsightsDashboard'));
const HistoryView = lazy(() => import('./components/HistoryView/HistoryView'));
const RadarChart = lazy(() => import('./components/Charts/RadarChart'));
const LineChart = lazy(() => import('./components/Charts/LineChart'));
const Settings = lazy(() => import('./components/Settings/Settings'));
const GoalTracker = lazy(() => import('./components/GoalTracker/GoalTracker'));
const CompareReviews = lazy(() => import('./components/CompareReviews/CompareReviews'));
const ActionPlan = lazy(() => import('./components/ActionPlan/ActionPlan'));
const TemplateManager = lazy(() => import('./components/Templates/TemplateManager'));
const AskLifeLens = lazy(() => import('./components/AskLifeLens/AskLifeLens'));
const AnnualReview = lazy(() => import('./components/AnnualReview/AnnualReview'));
const SharedReviewView = lazy(() => import('./components/SharedReview/SharedReviewView'));

function Dashboard() {
  const { reviews } = useReviews();
  const { getActiveGoals, getGoalProgress } = useGoals();
  const { displayName } = useAuth();
  const activeGoals = getActiveGoals();
  const latestReview = reviews[0];
  const avgScore = latestReview
    ? (lifeAreas.reduce((sum, a) => sum + (latestReview.scores[a.id] || 0), 0) / 9).toFixed(1)
    : null;

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-emerald-400 bg-clip-text text-transparent">
          {displayName ? `Welcome back, ${displayName.split(' ')[0]}` : 'Welcome to LifeLens'}
        </h1>
        <p className="text-slate-400">Your personal review & re-strategy planner</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { val: reviews.length, label: 'Total Reviews', color: 'text-indigo-400' },
          { val: reviews.filter(r => r.reviewType === 'weekly').length, label: 'Weekly', color: 'text-emerald-400' },
          { val: reviews.filter(r => r.reviewType === 'monthly').length, label: 'Monthly', color: 'text-amber-400' },
          { val: avgScore || '—', label: 'Latest Avg', color: 'text-rose-400' }
        ].map(s => (
          <div key={s.label} className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 text-center">
            <p className={`text-2xl font-bold ${s.color}`}>{s.val}</p>
            <p className="text-xs text-slate-400 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <StreakDashboard compact={true} />

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

      {latestReview?.insights && (
        <div className="bg-gradient-to-br from-indigo-500/10 to-emerald-500/10 border border-indigo-500/20 rounded-2xl p-6">
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Latest Insight</h2>
          <p className="text-slate-200 italic">"{latestReview.insights.headline}"</p>
          <p className="text-sm text-amber-400 mt-2">Focus: {latestReview.insights.focus_area}</p>
        </div>
      )}

      <Suspense fallback={<div className="h-20" />}>
        <RadarChart />
        <LineChart />
      </Suspense>

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
      <Suspense fallback={<PageSkeleton />}><RadarChart /><LineChart /></Suspense>
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
  const { user, signOut, photoURL } = useAuth();
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
    { to: '/chat', label: 'Ask AI', icon: '💬' },
    { to: '/annual', label: 'Year Review', icon: '📅' },
    { to: '/templates', label: 'Templates', icon: '📝' },
    { to: '/settings', label: 'Settings', icon: '⚙️' }
  ];

  const allDesktopItems = [...mainNavItems, ...moreNavItems];
  useEffect(() => { setMoreOpen(false); }, [location.pathname]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <NavLink to="/" className="flex items-center gap-2">
            <span className="font-bold text-lg bg-gradient-to-r from-indigo-400 to-emerald-400 bg-clip-text text-transparent">
              LifeLens
            </span>
          </NavLink>

          <nav className="hidden md:flex items-center gap-1">
            {allDesktopItems.map(item => (
              <NavLink key={item.to} to={item.to}
                className={({ isActive }) =>
                  `px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all
                  ${isActive ? 'bg-indigo-500/20 text-indigo-400' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'}`
                }>
                {item.label}
              </NavLink>
            ))}
          </nav>

          {user && (
            <div className="flex items-center gap-2">
              {photoURL && (
                <img src={photoURL} alt="" className="w-7 h-7 rounded-full border border-slate-700" />
              )}
              <button onClick={signOut} className="text-xs text-slate-500 hover:text-slate-300 hidden sm:block">
                Sign Out
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 pb-24 sm:pb-8">{children}</main>

      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/90 backdrop-blur-xl border-t border-slate-800">
        <div className="flex items-center justify-around h-16">
          {mainNavItems.map(item => (
            <NavLink key={item.to} to={item.to}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-all
                ${isActive ? 'text-indigo-400' : 'text-slate-500 hover:text-slate-300'}`
              }>
              <span className="text-lg">{item.icon}</span>
              <span className="text-[10px] font-medium">{item.label}</span>
            </NavLink>
          ))}
          <button onClick={() => setMoreOpen(p => !p)}
            className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-all
              ${moreOpen ? 'text-indigo-400' : 'text-slate-500 hover:text-slate-300'}`}>
            <span className="text-lg">☰</span>
            <span className="text-[10px] font-medium">More</span>
          </button>
        </div>

        {moreOpen && (
          <div className="absolute bottom-16 left-0 right-0 bg-slate-900 border-t border-slate-700 rounded-t-2xl p-4 animate-slideUp">
            <div className="grid grid-cols-3 gap-3">
              {moreNavItems.map(item => (
                <NavLink key={item.to} to={item.to}
                  className={({ isActive }) =>
                    `flex flex-col items-center gap-1 p-3 rounded-xl transition-all
                    ${isActive ? 'bg-indigo-500/20 text-indigo-400' : 'text-slate-400 hover:bg-slate-800'}`
                  }>
                  <span className="text-xl">{item.icon}</span>
                  <span className="text-xs font-medium">{item.label}</span>
                </NavLink>
              ))}
              {user && (
                <button onClick={signOut}
                  className="flex flex-col items-center gap-1 p-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-all">
                  <span className="text-xl">🚪</span>
                  <span className="text-xs font-medium">Sign Out</span>
                </button>
              )}
            </div>
          </div>
        )}
      </nav>

      {moreOpen && (
        <div className="sm:hidden fixed inset-0 z-30 bg-black/40" onClick={() => setMoreOpen(false)} />
      )}
    </div>
  );
}

function AuthenticatedApp() {
  const { triggerTypes, showBanner, dismissBanner } = useNotifications();
  const { userId } = useAuth();
  const [migrated, setMigrated] = useState(false);

  // Run migration on first auth
  useEffect(() => {
    if (userId && !migrated) {
      migrateRootDataToUser(userId).then((didMigrate) => {
        if (didMigrate) console.log('Data migrated to user scope');
        setMigrated(true);
      });
    }
  }, [userId]);

  return (
    <>
      <Onboarding />
      <InstallPrompt />
      {showBanner && <ReviewBanner triggerTypes={triggerTypes} onDismiss={dismissBanner} />}
      <Layout>
        <PageTransition>
          <ErrorBoundary>
            <Suspense fallback={<PageSkeleton />}>
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
                <Route path="/chat" element={<AskLifeLens />} />
                <Route path="/annual" element={<AnnualReview />} />
                <Route path="/settings" element={<Settings />} />
              </Routes>
            </Suspense>
          </ErrorBoundary>
        </PageTransition>
      </Layout>
    </>
  );
}

export default function App() {
  useEffect(() => {
    const theme = localStorage.getItem('lifelens_theme');
    if (theme === 'light') document.documentElement.classList.remove('dark');
    else {
      document.documentElement.classList.add('dark');
      if (!theme) localStorage.setItem('lifelens_theme', 'dark');
    }
  }, []);

  return (
    <AuthProvider>
      <ToastProvider>
        <Router>
          <Routes>
            {/* Public route — shared reviews (no auth) */}
            <Route path="/shared/:token" element={
              <Suspense fallback={<PageSkeleton />}>
                <SharedReviewView />
              </Suspense>
            } />
            {/* All other routes require auth */}
            <Route path="/*" element={<AppWithAuth />} />
          </Routes>
        </Router>
      </ToastProvider>
    </AuthProvider>
  );
}

function AppWithAuth() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return <AuthGate />;

  return <AuthenticatedApp />;
}
