import { useState, useCallback, useEffect } from 'react';
import {
  addActionPlan as addPlanToFirestore,
  getActionPlans as getPlansFromFirestore,
  getActionPlanByReviewId,
  updateActionPlanDoc,
  deleteActionPlanDoc
} from '../services/firestore';
import { generateActionPlan } from '../services/gemini';

export function useActionPlans() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load plans from Firestore on mount
  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const data = await getPlansFromFirestore();
        if (!cancelled) setPlans(data);
      } catch (err) {
        console.error('Failed to load action plans:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const createPlan = useCallback(async (review, insights, duration = 7) => {
    const plan = await generateActionPlan(
      review.scores,
      review.answers,
      review.reviewType,
      insights,
      duration
    );

    const planDoc = {
      ...plan,
      reviewId: review.id,
      createdAt: new Date().toISOString()
    };

    const saved = await addPlanToFirestore(planDoc);
    setPlans(prev => [saved, ...prev]);
    return saved;
  }, []);

  const getPlanForReview = useCallback(async (reviewId) => {
    // Check cache first
    const cached = plans.find(p => p.reviewId === reviewId);
    if (cached) return cached;

    // Try Firestore
    try {
      const plan = await getActionPlanByReviewId(reviewId);
      if (plan) {
        setPlans(prev => {
          if (prev.find(p => p.id === plan.id)) return prev;
          return [plan, ...prev];
        });
      }
      return plan;
    } catch (err) {
      console.error('Failed to fetch action plan:', err);
      return null;
    }
  }, [plans]);

  const toggleTask = useCallback(async (planId, taskId) => {
    const plan = plans.find(p => p.id === planId);
    if (!plan) return;

    const updatedTasks = plan.tasks.map(t =>
      t.id === taskId ? { ...t, completed: !t.completed } : t
    );

    try {
      await updateActionPlanDoc(planId, { tasks: updatedTasks });
      setPlans(prev => prev.map(p =>
        p.id === planId ? { ...p, tasks: updatedTasks } : p
      ));
    } catch (err) {
      console.error('Failed to toggle task:', err);
    }
  }, [plans]);

  const deletePlan = useCallback(async (planId) => {
    try {
      await deleteActionPlanDoc(planId);
      setPlans(prev => prev.filter(p => p.id !== planId));
    } catch (err) {
      console.error('Failed to delete action plan:', err);
    }
  }, []);

  const getPlanProgress = useCallback((plan) => {
    if (!plan?.tasks || plan.tasks.length === 0) return 0;
    const completed = plan.tasks.filter(t => t.completed).length;
    return Math.round((completed / plan.tasks.length) * 100);
  }, []);

  return {
    plans,
    loading,
    createPlan,
    getPlanForReview,
    toggleTask,
    deletePlan,
    getPlanProgress
  };
}

export default useActionPlans;
