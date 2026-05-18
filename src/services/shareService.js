import { createSharedReview, getSharedReview } from './firestore';

function generateToken() {
  return Array.from(crypto.getRandomValues(new Uint8Array(16)))
    .map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Create a shareable link for a review.
 * Stores a snapshot of the review in a public collection with a unique token.
 * Link expires after 7 days.
 */
export async function shareReview(review) {
  const token = generateToken();
  const expiresAt = new Date(Date.now() + 7 * 86400000).toISOString();

  const shareData = {
    token,
    expiresAt,
    createdAt: new Date().toISOString(),
    reviewType: review.reviewType,
    scores: review.scores,
    insights: review.insights || null,
    mood: review.mood || null,
    date: review.createdAt || review.date
  };

  await createSharedReview(shareData);

  const baseUrl = window.location.origin;
  return `${baseUrl}/shared/${token}`;
}

/**
 * Fetch a shared review by token.
 */
export async function fetchSharedReview(token) {
  const data = await getSharedReview(token);
  if (!data) return null;

  // Check expiry
  if (data.expiresAt && new Date(data.expiresAt) < new Date()) {
    return null;
  }

  return data;
}
