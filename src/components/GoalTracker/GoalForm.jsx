import { useState } from 'react';
import { lifeAreas } from '../../data/lifeAreas';

const emptyGoal = {
  title: '',
  description: '',
  area: '',
  deadline: '',
  milestones: ['']
};

export default function GoalForm({ onSave, onCancel, editGoal }) {
  const [goal, setGoal] = useState(editGoal ? {
    ...editGoal,
    milestones: editGoal.milestones?.map(m => m.text || m) || ['']
  } : { ...emptyGoal });
  const [saving, setSaving] = useState(false);

  const handleChange = (field, value) => {
    setGoal(prev => ({ ...prev, [field]: value }));
  };

  const addMilestone = () => {
    setGoal(prev => ({ ...prev, milestones: [...prev.milestones, ''] }));
  };

  const updateMilestone = (idx, value) => {
    setGoal(prev => ({
      ...prev,
      milestones: prev.milestones.map((m, i) => i === idx ? value : m)
    }));
  };

  const removeMilestone = (idx) => {
    setGoal(prev => ({
      ...prev,
      milestones: prev.milestones.filter((_, i) => i !== idx)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!goal.title || !goal.area) return;

    setSaving(true);
    try {
      await onSave({
        ...goal,
        milestones: goal.milestones.filter(m => m.trim())
      });
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-100">
              {editGoal ? 'Edit Goal' : 'New Goal'}
            </h2>
            <button type="button" onClick={onCancel} className="text-slate-400 hover:text-slate-200 text-xl">✕</button>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm text-slate-400 mb-1">Goal Title *</label>
            <input
              id="goal-title-input"
              type="text"
              value={goal.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="e.g., Run a 5K marathon"
              className="w-full bg-slate-800/60 border border-slate-700 rounded-xl px-4 py-2.5
                text-slate-200 placeholder-slate-600 text-sm
                focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm text-slate-400 mb-1">Description</label>
            <textarea
              value={goal.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Why is this goal important to you?"
              rows={2}
              className="w-full bg-slate-800/60 border border-slate-700 rounded-xl px-4 py-2.5
                text-slate-200 placeholder-slate-600 text-sm resize-none
                focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500"
            />
          </div>

          {/* Life Area */}
          <div>
            <label className="block text-sm text-slate-400 mb-1">Life Area *</label>
            <div className="grid grid-cols-3 gap-2">
              {lifeAreas.map(area => (
                <button
                  key={area.id}
                  type="button"
                  onClick={() => handleChange('area', area.id)}
                  className={`px-3 py-2 rounded-xl text-xs font-medium border transition-all
                    ${goal.area === area.id
                      ? 'border-indigo-500 bg-indigo-500/10 text-indigo-300'
                      : 'border-slate-700 bg-slate-800/40 text-slate-400 hover:border-slate-600'
                    }`}
                >
                  {area.icon} {area.name.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>

          {/* Deadline */}
          <div>
            <label className="block text-sm text-slate-400 mb-1">Deadline</label>
            <input
              type="date"
              value={goal.deadline}
              onChange={(e) => handleChange('deadline', e.target.value)}
              className="w-full bg-slate-800/60 border border-slate-700 rounded-xl px-4 py-2.5
                text-slate-200 text-sm
                focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500"
            />
          </div>

          {/* Milestones */}
          <div>
            <label className="block text-sm text-slate-400 mb-2">Milestones</label>
            <div className="space-y-2">
              {goal.milestones.map((ms, idx) => (
                <div key={idx} className="flex gap-2">
                  <input
                    type="text"
                    value={ms}
                    onChange={(e) => updateMilestone(idx, e.target.value)}
                    placeholder={`Milestone ${idx + 1}`}
                    className="flex-1 bg-slate-800/60 border border-slate-700 rounded-xl px-4 py-2
                      text-slate-200 placeholder-slate-600 text-sm
                      focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500"
                  />
                  {goal.milestones.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeMilestone(idx)}
                      className="px-3 text-slate-500 hover:text-red-400 transition-colors"
                    >✕</button>
                  )}
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addMilestone}
              className="mt-2 text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              + Add Milestone
            </button>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2.5 border border-slate-700 text-slate-400 rounded-xl
                hover:border-slate-600 hover:text-slate-300 transition-all text-sm"
            >
              Cancel
            </button>
            <button
              id="save-goal-btn"
              type="submit"
              disabled={saving || !goal.title || !goal.area}
              className="flex-1 px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-emerald-500 text-white
                rounded-xl font-medium text-sm hover:shadow-lg hover:shadow-indigo-500/20
                transition-all disabled:opacity-50"
            >
              {saving ? 'Saving...' : (editGoal ? 'Update Goal' : 'Create Goal')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
