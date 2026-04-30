import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useReviews } from '../../hooks/useReviews';
import { useActionPlans } from '../../hooks/useActionPlans';
import { lifeAreas } from '../../data/lifeAreas';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';

export default function ActionPlan() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getReviewById, loading: reviewsLoading } = useReviews();
  const { createPlan, getPlanForReview, toggleTask, getPlanProgress, loading: plansLoading } = useActionPlans();

  const [review, setReview] = useState(null);
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [duration, setDuration] = useState(7);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (reviewsLoading || plansLoading) return;
    async function load() {
      let r = getReviewById(id);
      if (!r) {
        try {
          const docRef = doc(db, 'reviews', id);
          const snap = await getDoc(docRef);
          if (snap.exists()) r = { id: snap.id, ...snap.data() };
        } catch (err) { console.error(err); }
      }
      if (!r) { navigate('/history'); return; }
      setReview(r);

      const existingPlan = await getPlanForReview(id);
      if (existingPlan) setPlan(existingPlan);
      setLoading(false);
    }
    load();
  }, [id, reviewsLoading, plansLoading]);

  const handleGenerate = async () => {
    if (!review) return;
    setGenerating(true);
    setError(null);
    try {
      const newPlan = await createPlan(review, review.insights, duration);
      setPlan(newPlan);
    } catch (err) {
      setError(err.message);
    } finally {
      setGenerating(false);
    }
  };

  const handleToggle = async (taskId) => {
    if (!plan) return;
    await toggleTask(plan.id, taskId);
    setPlan(prev => ({
      ...prev,
      tasks: prev.tasks.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t)
    }));
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-4">
        <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
        <p className="text-slate-400">Loading...</p>
      </div>
    );
  }

  const areaMap = {};
  lifeAreas.forEach(a => { areaMap[a.id] = a; });

  const progress = plan ? getPlanProgress(plan) : 0;

  // Group tasks by day
  const tasksByDay = plan ? plan.tasks.reduce((acc, task) => {
    const day = task.day || 1;
    if (!acc[day]) acc[day] = [];
    acc[day].push(task);
    return acc;
  }, {}) : {};

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <button onClick={() => navigate(`/insights/${id}`)} className="text-slate-400 hover:text-slate-200 text-sm">
        ← Back to Insights
      </button>

      <h1 className="text-2xl font-bold text-slate-100">Action Plan</h1>

      {!plan && !generating && (
        <div className="bg-slate-800/40 border border-slate-700 rounded-2xl p-8 text-center space-y-4">
          <p className="text-4xl">📋</p>
          <p className="text-slate-300">Generate an AI-powered action plan based on your review.</p>
          <div className="flex items-center justify-center gap-3">
            {[7, 30].map(d => (
              <button key={d} onClick={() => setDuration(d)}
                className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all
                  ${duration === d ? 'border-indigo-500 bg-indigo-500/10 text-indigo-300' : 'border-slate-700 text-slate-400 hover:border-slate-600'}`}>
                {d}-Day Plan
              </button>
            ))}
          </div>
          <button id="generate-plan-btn" onClick={handleGenerate}
            className="px-8 py-3 bg-gradient-to-r from-indigo-500 to-emerald-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-indigo-500/30 transition-all hover:scale-[1.02]">
            Generate Action Plan
          </button>
        </div>
      )}

      {generating && (
        <div className="flex flex-col items-center justify-center py-16 space-y-4">
          <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
          <p className="text-slate-400 animate-pulse">Creating your {duration}-day action plan...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-center">
          <p className="text-red-400 text-sm">{error}</p>
          <button onClick={handleGenerate} className="mt-2 text-sm text-red-300 underline">Try Again</button>
        </div>
      )}

      {plan && !generating && (
        <>
          {/* Plan Header */}
          <div className="bg-gradient-to-br from-indigo-500/10 to-emerald-500/10 border border-indigo-500/20 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-slate-100">{plan.title}</h2>
            <p className="text-sm text-slate-400 mt-1">{plan.duration}-Day Plan · {plan.tasks?.length} tasks</p>
            {plan.motivation && <p className="text-sm text-slate-300 mt-3 italic">"{plan.motivation}"</p>}
          </div>

          {/* Progress Bar */}
          <div className="bg-slate-800/40 border border-slate-700 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-400">Progress</span>
              <span className="text-sm font-bold text-indigo-400">{progress}%</span>
            </div>
            <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }} />
            </div>
          </div>

          {/* Tasks by Day */}
          <div className="space-y-4">
            {Object.entries(tasksByDay).sort(([a], [b]) => a - b).map(([day, tasks]) => (
              <div key={day} className="bg-slate-800/40 border border-slate-700 rounded-xl p-4">
                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Day {day}</h3>
                <div className="space-y-2">
                  {tasks.map(task => {
                    const area = areaMap[task.area];
                    return (
                      <button key={task.id} onClick={() => handleToggle(task.id)}
                        className="flex items-start gap-3 w-full text-left p-2 rounded-lg hover:bg-slate-700/30 transition-colors">
                        <span className={`w-5 h-5 mt-0.5 rounded border flex items-center justify-center flex-shrink-0 text-xs transition-all
                          ${task.completed ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-600'}`}>
                          {task.completed && '✓'}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm ${task.completed ? 'line-through text-slate-500' : 'text-slate-200'}`}>{task.task}</p>
                          {area && <span className="text-[10px] mt-0.5" style={{ color: area.color }}>{area.icon} {area.name.split(' ')[0]}</span>}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Regenerate */}
          <div className="text-center pt-4">
            <button onClick={handleGenerate}
              className="px-6 py-2.5 bg-slate-800 text-slate-300 border border-slate-700 rounded-xl hover:border-indigo-500 hover:text-indigo-400 transition-all">
              Regenerate Plan
            </button>
          </div>
        </>
      )}
    </div>
  );
}
