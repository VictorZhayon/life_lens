import {
  collection, addDoc, getDocs, doc, updateDoc, deleteDoc,
  query, orderBy, writeBatch, where, setDoc, getDoc
} from 'firebase/firestore';
import { db } from './firebase';

// ==================== HELPERS ====================
// User-scoped collection path: users/{userId}/{collectionName}
function userCol(userId, colName) {
  return collection(db, 'users', userId, colName);
}

function userDoc(userId, colName, docId) {
  return doc(db, 'users', userId, colName, docId);
}

// ==================== MIGRATION ====================
/**
 * One-time migration: move root-level data to user subcollections.
 * Call after first sign-in. Checks if migration already done.
 */
export async function migrateRootDataToUser(userId) {
  const migrationRef = doc(db, 'users', userId);
  const migrationSnap = await getDoc(migrationRef);

  if (migrationSnap.exists() && migrationSnap.data().migrated) {
    return false; // Already migrated
  }

  const rootCollections = ['reviews', 'goals', 'actionPlans', 'customTemplates'];

  for (const colName of rootCollections) {
    try {
      const rootSnap = await getDocs(collection(db, colName));
      if (rootSnap.empty) continue;

      const batch = writeBatch(db);
      rootSnap.docs.forEach(d => {
        const targetRef = doc(db, 'users', userId, colName, d.id);
        batch.set(targetRef, d.data());
      });
      await batch.commit();
    } catch (err) {
      console.error(`Migration failed for ${colName}:`, err);
    }
  }

  // Mark migration complete
  await setDoc(migrationRef, { migrated: true, migratedAt: new Date().toISOString() }, { merge: true });
  return true;
}

// ==================== REVIEWS ====================
export async function addReview(userId, review) {
  const docRef = await addDoc(userCol(userId, 'reviews'), review);
  return { ...review, id: docRef.id };
}

export async function getAllReviews(userId) {
  const q = query(userCol(userId, 'reviews'), orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function updateReviewDoc(userId, id, data) {
  await updateDoc(userDoc(userId, 'reviews', id), data);
}

export async function deleteReviewDoc(userId, id) {
  await deleteDoc(userDoc(userId, 'reviews', id));
}

export async function clearAllReviews(userId) {
  const snapshot = await getDocs(userCol(userId, 'reviews'));
  const batch = writeBatch(db);
  snapshot.docs.forEach(d => batch.delete(d.ref));
  await batch.commit();
}

export async function importReviewDocs(userId, reviews) {
  const results = [];
  for (const review of reviews) {
    const { id, ...data } = review;
    const docRef = await addDoc(userCol(userId, 'reviews'), data);
    results.push({ ...data, id: docRef.id });
  }
  return results;
}

// ==================== GOALS ====================
export async function addGoal(userId, goal) {
  const docRef = await addDoc(userCol(userId, 'goals'), goal);
  return { ...goal, id: docRef.id };
}

export async function getAllGoals(userId) {
  const q = query(userCol(userId, 'goals'), orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function updateGoalDoc(userId, id, data) {
  await updateDoc(userDoc(userId, 'goals', id), data);
}

export async function deleteGoalDoc(userId, id) {
  await deleteDoc(userDoc(userId, 'goals', id));
}

// ==================== ACTION PLANS ====================
export async function addActionPlan(userId, plan) {
  const docRef = await addDoc(userCol(userId, 'actionPlans'), plan);
  return { ...plan, id: docRef.id };
}

export async function getActionPlans(userId) {
  const q = query(userCol(userId, 'actionPlans'), orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function getActionPlanByReviewId(userId, reviewId) {
  const q = query(userCol(userId, 'actionPlans'), where('reviewId', '==', reviewId));
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  const d = snapshot.docs[0];
  return { id: d.id, ...d.data() };
}

export async function updateActionPlanDoc(userId, id, data) {
  await updateDoc(userDoc(userId, 'actionPlans', id), data);
}

export async function deleteActionPlanDoc(userId, id) {
  await deleteDoc(userDoc(userId, 'actionPlans', id));
}

// ==================== CUSTOM TEMPLATES ====================
export async function addTemplate(userId, template) {
  const docRef = await addDoc(userCol(userId, 'customTemplates'), template);
  return { ...template, id: docRef.id };
}

export async function getAllTemplates(userId) {
  const q = query(userCol(userId, 'customTemplates'), orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function updateTemplateDoc(userId, id, data) {
  await updateDoc(userDoc(userId, 'customTemplates', id), data);
}

export async function deleteTemplateDoc(userId, id) {
  await deleteDoc(userDoc(userId, 'customTemplates', id));
}

// ==================== SHARED REVIEWS (public, root-level) ====================
export async function createSharedReview(data) {
  const docRef = await addDoc(collection(db, 'sharedReviews'), data);
  return docRef.id;
}

export async function getSharedReview(token) {
  const q = query(collection(db, 'sharedReviews'), where('token', '==', token));
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
}
