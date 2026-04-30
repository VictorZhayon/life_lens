import { lifeAreas } from '../../data/lifeAreas';

export default function GoalCard({ goal, onToggleMilestone, onComplete, onDelete, getProgress }) {
  const area = lifeAreas.find(a => a.id === goal.area);
  const progress = getProgress(goal);
  const daysLeft = goal.deadline
    ? Math.ceil((new Date(goal.deadline) - new Date()) / 86400000)
    : null;

  const isOverdue = daysLeft !== null && daysLeft < 0;
  const isCompleted = goal.status === 'completed';

  return (
    <div className={`bg-slate-800/50 border rounded-2xl p-5 transition-all hover:border-slate-600
      ${isCompleted ? 'border-emerald-500/30 opacity-75' : 'border-slate-700'}`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {area && (
              <span className="text-xs px-2 py-0.5 rounded-full border font-medium"
                style={{
                  borderColor: area.color + '50',
                  backgroundColor: area.color + '15',
                  color: area.color
                }}>
                {area.icon} {area.name.split(' ')[0]}
              </span>
            )}
            {isCompleted && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                ✓ Completed
              </span>
            )}
          </div>
          <h3 className={`font-semibold text-slate-100 ${isCompleted ? 'line-through opacity-60' : ''}`}>
            {goal.title}
          </h3>
          {goal.description && (
            <p className="text-sm text-slate-400 mt-1">{goal.description}</p>
          )}
        </div>

        {/* Progress Ring */}
        <div className="relative w-14 h-14 flex-shrink-0">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
            <circle cx="18" cy="18" r="16" fill="none" stroke="#334155" strokeWidth="3" />
            <circle
              cx="18" cy="18" r="16" fill="none"
              stroke={isCompleted ? '#10b981' : (area?.color || '#6366f1')}
              strokeWidth="3"
              strokeDasharray={`${progress} 100`}
              strokeLinecap="round"
              className="transition-all duration-700"
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-slate-200">
            {progress}%
          </span>
        </div>
      </div>

      {/* Deadline */}
      {daysLeft !== null && !isCompleted && (
        <div className={`text-xs font-medium mb-3 ${isOverdue ? 'text-red-400' : daysLeft <= 7 ? 'text-amber-400' : 'text-slate-500'}`}>
          {isOverdue ? `⚠ ${Math.abs(daysLeft)} days overdue` : `📅 ${daysLeft} days remaining`}
        </div>
      )}

      {/* Milestones */}
      {goal.milestones && goal.milestones.length > 0 && (
        <div className="space-y-1.5 mb-4">
          {goal.milestones.map((ms) => (
            <button
              key={ms.id}
              onClick={() => !isCompleted && onToggleMilestone(goal.id, ms.id)}
              className={`flex items-center gap-2 w-full text-left text-sm px-3 py-1.5 rounded-lg
                transition-all ${isCompleted ? 'cursor-default' : 'hover:bg-slate-700/50 cursor-pointer'}`}
            >
              <span className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 text-[10px]
                ${ms.completed
                  ? 'bg-emerald-500 border-emerald-500 text-white'
                  : 'border-slate-600'}`}>
                {ms.completed && '✓'}
              </span>
              <span className={`${ms.completed ? 'line-through text-slate-500' : 'text-slate-300'}`}>
                {ms.text}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Actions */}
      {!isCompleted && (
        <div className="flex gap-2 pt-2 border-t border-slate-700/50">
          <button
            onClick={() => onComplete(goal.id)}
            className="flex-1 text-xs px-3 py-1.5 text-emerald-400 border border-emerald-500/30
              rounded-lg hover:bg-emerald-500/10 transition-colors"
          >
            ✓ Complete
          </button>
          <button
            onClick={() => onDelete(goal.id)}
            className="text-xs px-3 py-1.5 text-red-400 border border-red-500/30
              rounded-lg hover:bg-red-500/10 transition-colors"
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
}
