import { useState, useCallback, useEffect } from 'react';

const STORAGE_KEY = 'lifelens_reviews';
const DRAFT_KEY = 'lifelens_draft';

function getStoredReviews() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveStoredReviews(reviews) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reviews));
}

export function useReviews() {
  const [reviews, setReviews] = useState(() => getStoredReviews());

  // Sync state to localStorage on change
  useEffect(() => {
    saveStoredReviews(reviews);
  }, [reviews]);

  const saveReview = useCallback((review) => {
    const newReview = {
      ...review,
      id: `review_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      createdAt: new Date().toISOString()
    };
    setReviews(prev => [newReview, ...prev]);
    clearDraft();
    return newReview;
  }, []);

  const getReviewById = useCallback((id) => {
    return reviews.find(r => r.id === id) || null;
  }, [reviews]);

  const getReviewsByType = useCallback((type) => {
    if (!type || type === 'all') return reviews;
    return reviews.filter(r => r.reviewType === type);
  }, [reviews]);

  const updateReviewInsights = useCallback((id, insights) => {
    setReviews(prev =>
      prev.map(r => r.id === id ? { ...r, insights } : r)
    );
  }, []);

  const deleteReview = useCallback((id) => {
    setReviews(prev => prev.filter(r => r.id !== id));
  }, []);

  const clearAllData = useCallback(() => {
    setReviews([]);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(DRAFT_KEY);
  }, []);

  const exportData = useCallback(() => {
    const data = {
      exportedAt: new Date().toISOString(),
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

  // Draft management
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
    saveReview,
    getReviewById,
    getReviewsByType,
    updateReviewInsights,
    deleteReview,
    clearAllData,
    exportData,
    saveDraft,
    getDraft,
    clearDraft
  };
}

export default useReviews;
