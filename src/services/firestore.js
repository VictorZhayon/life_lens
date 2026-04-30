import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  writeBatch,
  where
} from 'firebase/firestore';
import { db } from './firebase';

// ==================== REVIEWS ====================
const REVIEWS_COLLECTION = 'reviews';

export async function addReview(review) {
  const docRef = await addDoc(collection(db, REVIEWS_COLLECTION), review);
  return { ...review, id: docRef.id };
}

export async function getAllReviews() {
  const q = query(collection(db, REVIEWS_COLLECTION), orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function updateReviewDoc(id, data) {
  const ref = doc(db, REVIEWS_COLLECTION, id);
  await updateDoc(ref, data);
}

export async function deleteReviewDoc(id) {
  const ref = doc(db, REVIEWS_COLLECTION, id);
  await deleteDoc(ref);
}

export async function clearAllReviews() {
  const snapshot = await getDocs(collection(db, REVIEWS_COLLECTION));
  const batch = writeBatch(db);
  snapshot.docs.forEach(d => batch.delete(d.ref));
  await batch.commit();
}

export async function importReviewDocs(reviews) {
  const results = [];
  for (const review of reviews) {
    const { id, ...data } = review;
    const docRef = await addDoc(collection(db, REVIEWS_COLLECTION), data);
    results.push({ ...data, id: docRef.id });
  }
  return results;
}

// ==================== GOALS ====================
const GOALS_COLLECTION = 'goals';

export async function addGoal(goal) {
  const docRef = await addDoc(collection(db, GOALS_COLLECTION), goal);
  return { ...goal, id: docRef.id };
}

export async function getAllGoals() {
  const q = query(collection(db, GOALS_COLLECTION), orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function updateGoalDoc(id, data) {
  const ref = doc(db, GOALS_COLLECTION, id);
  await updateDoc(ref, data);
}

export async function deleteGoalDoc(id) {
  const ref = doc(db, GOALS_COLLECTION, id);
  await deleteDoc(ref);
}

// ==================== ACTION PLANS ====================
const PLANS_COLLECTION = 'actionPlans';

export async function addActionPlan(plan) {
  const docRef = await addDoc(collection(db, PLANS_COLLECTION), plan);
  return { ...plan, id: docRef.id };
}

export async function getActionPlans() {
  const q = query(collection(db, PLANS_COLLECTION), orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function getActionPlanByReviewId(reviewId) {
  const q = query(collection(db, PLANS_COLLECTION), where('reviewId', '==', reviewId));
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  const d = snapshot.docs[0];
  return { id: d.id, ...d.data() };
}

export async function updateActionPlanDoc(id, data) {
  const ref = doc(db, PLANS_COLLECTION, id);
  await updateDoc(ref, data);
}

export async function deleteActionPlanDoc(id) {
  const ref = doc(db, PLANS_COLLECTION, id);
  await deleteDoc(ref);
}

// ==================== CUSTOM TEMPLATES ====================
const TEMPLATES_COLLECTION = 'customTemplates';

export async function addTemplate(template) {
  const docRef = await addDoc(collection(db, TEMPLATES_COLLECTION), template);
  return { ...template, id: docRef.id };
}

export async function getAllTemplates() {
  const q = query(collection(db, TEMPLATES_COLLECTION), orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function updateTemplateDoc(id, data) {
  const ref = doc(db, TEMPLATES_COLLECTION, id);
  await updateDoc(ref, data);
}

export async function deleteTemplateDoc(id) {
  const ref = doc(db, TEMPLATES_COLLECTION, id);
  await deleteDoc(ref);
}
