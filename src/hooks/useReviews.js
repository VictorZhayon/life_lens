import { useState, useCallback, useEffect } from 'react';
import {
  addReview as addReviewToFirestore,
  getAllReviews,
  updateReviewDoc,
  deleteReviewDoc,
  clearAllReviews,
  importReviewDocs
} from '../services/firestore';

const DRAFT_KEY = 'lifelens_draft';

export function useReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load reviews from Firestore on mount
  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const data = await getAllReviews();
        if (!cancelled) setReviews(data);
      } catch (err) {
        console.error('Failed to load reviews from Firestore:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const saveReview = useCallback(async (review) => {
    const newReview = {
      ...review,
      createdAt: new Date().toISOString(),
      // Include mood, journalEntry, photos if provided
      mood: review.mood || null,
      journalEntry: review.journalEntry || null,
      photos: review.photos || []
    };
    try {
      const saved = await addReviewToFirestore(newReview);
      setReviews(prev => [saved, ...prev]);
      clearDraft();
      return saved;
    } catch (err) {
      console.error('Failed to save review:', err);
      throw err;
    }
  }, []);

  const getReviewById = useCallback((id) => {
    return reviews.find(r => r.id === id) || null;
  }, [reviews]);

  const getReviewsByType = useCallback((type) => {
    if (!type || type === 'all') return reviews;
    return reviews.filter(r => r.reviewType === type);
  }, [reviews]);

  const updateReviewInsights = useCallback(async (id, insights) => {
    try {
      await updateReviewDoc(id, { insights });
      setReviews(prev =>
        prev.map(r => r.id === id ? { ...r, insights } : r)
      );
    } catch (err) {
      console.error('Failed to update insights:', err);
    }
  }, []);

  const deleteReview = useCallback(async (id) => {
    try {
      await deleteReviewDoc(id);
      setReviews(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      console.error('Failed to delete review:', err);
    }
  }, []);

  const clearAllData = useCallback(async () => {
    try {
      await clearAllReviews();
      setReviews([]);
      localStorage.removeItem(DRAFT_KEY);
    } catch (err) {
      console.error('Failed to clear all data:', err);
    }
  }, []);

  const exportData = useCallback(() => {
    const data = {
      exportedAt: new Date().toISOString(),
      version: '2.0',
      reviews
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lifelens_export_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [reviews]);

  /**
   * Import reviews from a JSON export file.
   * @param {Object} data - The parsed JSON data
   * @param {'merge'|'replace'} mode - merge adds new reviews, replace clears and imports all
   */
  const importReviews = useCallback(async (data, mode = 'merge') => {
    const importedReviews = data.reviews || [];

    if (importedReviews.length === 0) {
      throw new Error('No reviews found in import file');
    }

    if (mode === 'replace') {
      await clearAllReviews();
    }

    const saved = await importReviewDocs(importedReviews);

    if (mode === 'replace') {
      setReviews(saved);
    } else {
      setReviews(prev => [...saved, ...prev]);
    }

    return saved.length;
  }, []);

  // Draft management — stays in localStorage (no need to persist drafts to DB)
  const saveDraft = useCallback((draft) => {
    localStorage.setItem(DRAFT_KEY, JSON.stringify({
      ...draft,
      savedAt: new Date().toISOString()
    }));
  }, []);

  const getDraft = useCallback(() => {
    try {
      const data = localStorage.getItem(DRAFT_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }, []);

  const clearDraft = useCallback(() => {
    localStorage.removeItem(DRAFT_KEY);
  }, []);

  return {
    reviews,
    loading,
    saveReview,
    getReviewById,
    getReviewsByType,
    updateReviewInsights,
    deleteReview,
    clearAllData,
    exportData,
    importReviews,
    saveDraft,
    getDraft,
    clearDraft
  };
}

export default useReviews;
