import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  writeBatch
} from 'firebase/firestore';
import { db } from './firebase';

const COLLECTION = 'reviews';

export async function addReview(review) {
  const docRef = await addDoc(collection(db, COLLECTION), review);
  return { ...review, id: docRef.id };
}

export async function getAllReviews() {
  const q = query(collection(db, COLLECTION), orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function updateReviewDoc(id, data) {
  const ref = doc(db, COLLECTION, id);
  await updateDoc(ref, data);
}

export async function deleteReviewDoc(id) {
  const ref = doc(db, COLLECTION, id);
  await deleteDoc(ref);
}

export async function clearAllReviews() {
  const snapshot = await getDocs(collection(db, COLLECTION));
  const batch = writeBatch(db);
  snapshot.docs.forEach(d => batch.delete(d.ref));
  await batch.commit();
}
