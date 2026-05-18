import { useState, useCallback, useEffect } from 'react';
import { useAuth } from './useAuth';
import {
  addReview as addReviewToFirestore,
  getAllReviews,
  updateReviewDoc,
  deleteReviewDoc,
  clearAllReviews,
  importReviewDocs
} from '../services/firestore';

const DRAFT_KEY = 'lifelens_draft';
const CACHE_KEY = 'lifelens_reviews_cache';

export function useReviews() {
  const { userId } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load from localStorage cache immediately, then Firestore
  useEffect(() => {
    if (!userId) { setLoading(false); return; }

    // Show cached data instantly
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) setReviews(JSON.parse(cached));
    } catch {}

    let cancelled = false;
    async function load() {
      try {
        const data = await getAllReviews(userId);
        if (!cancelled) {
          setReviews(data);
          localStorage.setItem(CACHE_KEY, JSON.stringify(data));
        }
      } catch (err) {
        console.error('Failed to load reviews from Firestore:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [userId]);

  const saveReview = useCallback(async (review) => {
    if (!userId) throw new Error('Not authenticated');
    const newReview = {
      ...review,
      createdAt: new Date().toISOString(),
      mood: review.mood || null,
      journalEntry: review.journalEntry || null,
      photos: review.photos || []
    };
    const saved = await addReviewToFirestore(userId, newReview);
    setReviews(prev => {
      const updated = [saved, ...prev];
      localStorage.setItem(CACHE_KEY, JSON.stringify(updated));
      return updated;
    });
    clearDraft();
    return saved;
  }, [userId]);

  const getReviewById = useCallback((id) => {
    return reviews.find(r => r.id === id) || null;
  }, [reviews]);

  const getReviewsByType = useCallback((type) => {
    if (!type || type === 'all') return reviews;
    return reviews.filter(r => r.reviewType === type);
  }, [reviews]);

  const updateReviewInsights = useCallback(async (id, insights) => {
    if (!userId) return;
    await updateReviewDoc(userId, id, { insights });
    setReviews(prev => {
      const updated = prev.map(r => r.id === id ? { ...r, insights } : r);
      localStorage.setItem(CACHE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, [userId]);

  const deleteReview = useCallback(async (id) => {
    if (!userId) return;
    await deleteReviewDoc(userId, id);
    setReviews(prev => {
      const updated = prev.filter(r => r.id !== id);
      localStorage.setItem(CACHE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, [userId]);

  const clearAllData = useCallback(async () => {
    if (!userId) return;
    await clearAllReviews(userId);
    setReviews([]);
    localStorage.removeItem(DRAFT_KEY);
    localStorage.removeItem(CACHE_KEY);
  }, [userId]);

  const exportData = useCallback(() => {
    const data = { exportedAt: new Date().toISOString(), version: '2.0', reviews };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lifelens_export_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [reviews]);

  const importReviews = useCallback(async (data, mode = 'merge') => {
    if (!userId) throw new Error('Not authenticated');
    const importedReviews = data.reviews || [];
    if (importedReviews.length === 0) throw new Error('No reviews found in import file');

    if (mode === 'replace') await clearAllReviews(userId);

    const saved = await importReviewDocs(userId, importedReviews);

    if (mode === 'replace') {
      setReviews(saved);
    } else {
      setReviews(prev => [...saved, ...prev]);
    }
    return saved.length;
  }, [userId]);

  const saveDraft = useCallback((draft) => {
    localStorage.setItem(DRAFT_KEY, JSON.stringify({ ...draft, savedAt: new Date().toISOString() }));
  }, []);

  const getDraft = useCallback(() => {
    try {
      const data = localStorage.getItem(DRAFT_KEY);
      return data ? JSON.parse(data) : null;
    } catch { return null; }
  }, []);

  const clearDraft = useCallback(() => { localStorage.removeItem(DRAFT_KEY); }, []);

  return {
    reviews, loading, saveReview, getReviewById, getReviewsByType,
    updateReviewInsights, deleteReview, clearAllData, exportData,
    importReviews, saveDraft, getDraft, clearDraft
  };
}

export default useReviews;
