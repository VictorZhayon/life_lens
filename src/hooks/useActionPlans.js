import { useState, useCallback, useEffect } from 'react';
import { useAuth } from './useAuth';
import {
  addActionPlan as addPlanToFirestore, getActionPlans as getPlansFromFirestore,
  getActionPlanByReviewId, updateActionPlanDoc, deleteActionPlanDoc
} from '../services/firestore';
import { generateActionPlan } from '../services/gemini';

export function useActionPlans() {
  const { userId } = useAuth();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) { setLoading(false); return; }
    let cancelled = false;
    async function load() {
      try {
        const data = await getPlansFromFirestore(userId);
        if (!cancelled) setPlans(data);
      } catch (err) { console.error('Failed to load action plans:', err); }
      finally { if (!cancelled) setLoading(false); }
    }
    load();
    return () => { cancelled = true; };
  }, [userId]);

  const createPlan = useCallback(async (review, insights, duration = 7) => {
    if (!userId) throw new Error('Not authenticated');
    const plan = await generateActionPlan(review.scores, review.answers, review.reviewType, insights, duration);
    const planDoc = { ...plan, reviewId: review.id, createdAt: new Date().toISOString() };
    const saved = await addPlanToFirestore(userId, planDoc);
    setPlans(prev => [saved, ...prev]);
    return saved;
  }, [userId]);

  const getPlanForReview = useCallback(async (reviewId) => {
    const cached = plans.find(p => p.reviewId === reviewId);
    if (cached) return cached;
    if (!userId) return null;
    try {
      const plan = await getActionPlanByReviewId(userId, reviewId);
      if (plan) setPlans(prev => prev.find(p => p.id === plan.id) ? prev : [plan, ...prev]);
      return plan;
    } catch (err) { console.error('Failed to fetch action plan:', err); return null; }
  }, [plans, userId]);

  const toggleTask = useCallback(async (planId, taskId) => {
    if (!userId) return;
    const plan = plans.find(p => p.id === planId);
    if (!plan) return;
    const updatedTasks = plan.tasks.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t);
    await updateActionPlanDoc(userId, planId, { tasks: updatedTasks });
    setPlans(prev => prev.map(p => p.id === planId ? { ...p, tasks: updatedTasks } : p));
  }, [plans, userId]);

  const deletePlan = useCallback(async (planId) => {
    if (!userId) return;
    await deleteActionPlanDoc(userId, planId);
    setPlans(prev => prev.filter(p => p.id !== planId));
  }, [userId]);

  const getPlanProgress = useCallback((plan) => {
    if (!plan?.tasks || plan.tasks.length === 0) return 0;
    return Math.round((plan.tasks.filter(t => t.completed).length / plan.tasks.length) * 100);
  }, []);

  return { plans, loading, createPlan, getPlanForReview, toggleTask, deletePlan, getPlanProgress };
}

export default useActionPlans;
