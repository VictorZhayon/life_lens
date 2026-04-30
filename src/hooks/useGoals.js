import { useState, useCallback, useEffect } from 'react';
import {
  addGoal as addGoalToFirestore,
  getAllGoals,
  updateGoalDoc,
  deleteGoalDoc
} from '../services/firestore';

export function useGoals() {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load goals from Firestore on mount
  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const data = await getAllGoals();
        if (!cancelled) setGoals(data);
      } catch (err) {
        console.error('Failed to load goals:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const addGoal = useCallback(async (goal) => {
    const newGoal = {
      ...goal,
      createdAt: new Date().toISOString(),
      status: 'active', // active | completed | archived
      milestones: (goal.milestones || []).map((m, i) => ({
        id: `ms-${i}`,
        text: m.text || m,
        completed: false
      }))
    };
    try {
      const saved = await addGoalToFirestore(newGoal);
      setGoals(prev => [saved, ...prev]);
      return saved;
    } catch (err) {
      console.error('Failed to save goal:', err);
      throw err;
    }
  }, []);

  const updateGoal = useCallback(async (id, data) => {
    try {
      await updateGoalDoc(id, data);
      setGoals(prev => prev.map(g => g.id === id ? { ...g, ...data } : g));
    } catch (err) {
      console.error('Failed to update goal:', err);
    }
  }, []);

  const deleteGoal = useCallback(async (id) => {
    try {
      await deleteGoalDoc(id);
      setGoals(prev => prev.filter(g => g.id !== id));
    } catch (err) {
      console.error('Failed to delete goal:', err);
    }
  }, []);

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

  // Computed helpers
  const getGoalsByArea = useCallback((areaId) => {
    return goals.filter(g => g.area === areaId);
  }, [goals]);

  const getActiveGoals = useCallback(() => {
    return goals.filter(g => g.status === 'active');
  }, [goals]);

  const getGoalProgress = useCallback((goal) => {
    if (!goal.milestones || goal.milestones.length === 0) {
      return goal.status === 'completed' ? 100 : 0;
    }
    const completed = goal.milestones.filter(m => m.completed).length;
    return Math.round((completed / goal.milestones.length) * 100);
  }, []);

  return {
    goals,
    loading,
    addGoal,
    updateGoal,
    deleteGoal,
    toggleMilestone,
    completeGoal,
    archiveGoal,
    getGoalsByArea,
    getActiveGoals,
    getGoalProgress
  };
}

export default useGoals;
