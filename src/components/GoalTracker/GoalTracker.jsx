import { useState } from 'react';
import { useGoals } from '../../hooks/useGoals';
import { lifeAreas } from '../../data/lifeAreas';
import GoalCard from './GoalCard';
import GoalForm from './GoalForm';

export default function GoalTracker() {
  const {
    goals, loading, addGoal, deleteGoal,
    toggleMilestone, completeGoal, getGoalProgress
  } = useGoals();

  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState('all'); // 'all' | 'active' | 'completed' | area id
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const handleSave = async (goalData) => {
    await addGoal(goalData);
    setShowForm(false);
  };

  const handleDelete = async (id) => {
    if (deleteConfirm === id) {
      await deleteGoal(id);
      setDeleteConfirm(null);
    } else {
      setDeleteConfirm(id);
      setTimeout(() => setDeleteConfirm(null), 3000);
    }
  };

  // Filter logic
  const filteredGoals = goals.filter(g => {
    if (filter === 'all') return true;
    if (filter === 'active') return g.status === 'active';
    if (filter === 'completed') return g.status === 'completed';
    return g.area === filter;
  });

  const activeCount = goals.filter(g => g.status === 'active').length;
  const completedCount = goals.filter(g => g.status === 'completed').length;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Goals</h1>
          <p className="text-sm text-slate-400 mt-1">
            {activeCount} active · {completedCount} completed
          </p>
        </div>
        <button
          id="add-goal-btn"
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-emerald-500 text-white
            rounded-xl text-sm font-medium hover:shadow-lg hover:shadow-indigo-500/20 transition-all"
        >
          + New Goal
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {[
          { id: 'all', label: 'All' },
          { id: 'active', label: 'Active' },
          { id: 'completed', label: 'Completed' }
        ].map(f => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all
              ${filter === f.id
                ? 'bg-indigo-500 text-white'
                : 'bg-slate-800 text-slate-400 hover:text-slate-300'}`}
          >
            {f.label}
          </button>
        ))}
        <div className="w-px bg-slate-700 mx-1" />
        {lifeAreas.map(area => (
          <button
            key={area.id}
            onClick={() => setFilter(area.id)}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all
              ${filter === area.id
                ? 'text-white'
                : 'bg-slate-800 text-slate-400 hover:text-slate-300'}`}
            style={filter === area.id ? {
              backgroundColor: area.color + '30',
              color: area.color,
              borderColor: area.color
            } : {}}
          >
            {area.icon}
          </button>
        ))}
      </div>

      {/* Goals List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 space-y-4">
          <div className="w-10 h-10 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
          <p className="text-slate-400">Loading goals...</p>
        </div>
      ) : filteredGoals.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-4xl mb-3">🎯</p>
          <p className="text-slate-400">
            {filter === 'all'
              ? 'No goals yet. Set your first goal to start tracking progress!'
              : 'No goals match this filter.'}
          </p>
          {filter === 'all' && (
            <button
              onClick={() => setShowForm(true)}
              className="mt-4 px-6 py-2.5 bg-indigo-500 text-white rounded-xl
                text-sm font-medium hover:bg-indigo-400 transition-all"
            >
              Create Your First Goal
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {filteredGoals.map(goal => (
            <GoalCard
              key={goal.id}
              goal={goal}
              onToggleMilestone={toggleMilestone}
              onComplete={completeGoal}
              onDelete={handleDelete}
              getProgress={getGoalProgress}
            />
          ))}
        </div>
      )}

      {/* Goal Form Modal */}
      {showForm && (
        <GoalForm
          onSave={handleSave}
          onCancel={() => setShowForm(false)}
        />
      )}
    </div>
  );
}
