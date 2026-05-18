import { useState, useCallback, useEffect } from 'react';
import { useAuth } from './useAuth';
import {
  addGoal as addGoalToFirestore, getAllGoals,
  updateGoalDoc, deleteGoalDoc
} from '../services/firestore';

const CACHE_KEY = 'lifelens_goals_cache';

export function useGoals() {
  const { userId } = useAuth();
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) { setLoading(false); return; }

    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) setGoals(JSON.parse(cached));
    } catch {}

    let cancelled = false;
    async function load() {
      try {
        const data = await getAllGoals(userId);
        if (!cancelled) {
          setGoals(data);
          localStorage.setItem(CACHE_KEY, JSON.stringify(data));
          // Check recurring goals for reset
          checkRecurringResets(data);
        }
      } catch (err) { console.error('Failed to load goals:', err); }
      finally { if (!cancelled) setLoading(false); }
    }
    load();
    return () => { cancelled = true; };
  }, [userId]);

  // Check if any recurring goals need their milestones reset
  const checkRecurringResets = async (goalsList) => {
    if (!userId) return;
    const now = new Date();
    for (const goal of goalsList) {
      if (!goal.recurring || goal.status !== 'active') continue;
      const lastReset = goal.lastReset ? new Date(goal.lastReset) : new Date(goal.createdAt);
      let shouldReset = false;

      if (goal.recurringFrequency === 'daily' && now - lastReset > 86400000) shouldReset = true;
      if (goal.recurringFrequency === 'weekly' && now - lastReset > 604800000) shouldReset = true;
      if (goal.recurringFrequency === 'monthly') {
        shouldReset = now.getMonth() !== lastReset.getMonth() || now.getFullYear() !== lastReset.getFullYear();
      }

      if (shouldReset) {
        const resetMilestones = (goal.milestones || []).map(m => ({ ...m, completed: false }));
        const completions = (goal.recurringCompletions || 0) +
          (goal.milestones?.every(m => m.completed) ? 1 : 0);
        const update = { milestones: resetMilestones, lastReset: now.toISOString(), recurringCompletions: completions };
        await updateGoalDoc(userId, goal.id, update);
        setGoals(prev => prev.map(g => g.id === goal.id ? { ...g, ...update } : g));
      }
    }
  };

  const addGoal = useCallback(async (goal) => {
    if (!userId) throw new Error('Not authenticated');
    const newGoal = {
      ...goal, createdAt: new Date().toISOString(), status: 'active',
      recurring: goal.recurring || false,
      recurringFrequency: goal.recurringFrequency || null,
      recurringCompletions: 0,
      lastReset: null,
      milestones: (goal.milestones || []).map((m, i) => ({
        id: `ms-${i}`, text: m.text || m, completed: false
      }))
    };
    const saved = await addGoalToFirestore(userId, newGoal);
    setGoals(prev => {
      const updated = [saved, ...prev];
      localStorage.setItem(CACHE_KEY, JSON.stringify(updated));
      return updated;
    });
    return saved;
  }, [userId]);

  const updateGoal = useCallback(async (id, data) => {
    if (!userId) return;
    await updateGoalDoc(userId, id, data);
    setGoals(prev => {
      const updated = prev.map(g => g.id === id ? { ...g, ...data } : g);
      localStorage.setItem(CACHE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, [userId]);

  const deleteGoal = useCallback(async (id) => {
    if (!userId) return;
    await deleteGoalDoc(userId, id);
    setGoals(prev => {
      const updated = prev.filter(g => g.id !== id);
      localStorage.setItem(CACHE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, [userId]);

  const toggleMilestone = useCallback(async (goalId, milestoneId) => {
    const goal = goals.find(g => g.id === goalId);
    if (!goal) return;
    const updatedMilestones = goal.milestones.map(m =>
      m.id === milestoneId ? { ...m, completed: !m.completed } : m
    );
    await updateGoal(goalId, { milestones: updatedMilestones });
  }, [goals, updateGoal]);

  const completeGoal = useCallback(async (id) => {
    await updateGoal(id, { status: 'completed', completedAt: new Date().toISOString() });
  }, [updateGoal]);

  const archiveGoal = useCallback(async (id) => {
    await updateGoal(id, { status: 'archived' });
  }, [updateGoal]);

  const getGoalsByArea = useCallback((areaId) => goals.filter(g => g.area === areaId), [goals]);
  const getActiveGoals = useCallback(() => goals.filter(g => g.status === 'active'), [goals]);

  const getGoalProgress = useCallback((goal) => {
    if (!goal.milestones || goal.milestones.length === 0) return goal.status === 'completed' ? 100 : 0;
    const completed = goal.milestones.filter(m => m.completed).length;
    return Math.round((completed / goal.milestones.length) * 100);
  }, []);

  return {
    goals, loading, addGoal, updateGoal, deleteGoal,
    toggleMilestone, completeGoal, archiveGoal,
    getGoalsByArea, getActiveGoals, getGoalProgress
  };
}

export default useGoals;
