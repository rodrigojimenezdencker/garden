import {
  type DocumentData,
  type DocumentSnapshot,
  type QueryConstraint,
  Timestamp,
  collection,
  doc,
  addDoc as firestoreAddDoc,
  deleteDoc as firestoreDeleteDoc,
  getDoc as firestoreGetDoc,
  getDocs as firestoreGetDocs,
  updateDoc as firestoreUpdateDoc,
  limit,
  onSnapshot,
  query,
  serverTimestamp,
  startAfter,
} from 'firebase/firestore';
import { db } from '../lib/firebase';

const isPlainObject = (value: unknown): value is Record<string, unknown> => {
  return Object.prototype.toString.call(value) === '[object Object]';
};

const convertTimestampValue = (value: unknown): unknown => {
  if (value instanceof Timestamp) {
    return value.toDate();
  }

  if (Array.isArray(value)) {
    return value.map((item) => convertTimestampValue(item));
  }

  if (isPlainObject(value)) {
    return Object.fromEntries(
      Object.entries(value).map(([key, entry]) => [
        key,
        convertTimestampValue(entry),
      ]),
    );
  }

  return value;
};

export const convertTimestamps = <T>(data: DocumentData): T => {
  return convertTimestampValue(data) as T;
};

export const getDocument = async <T>(
  collectionName: string,
  id: string,
): Promise<T | null> => {
  const documentRef = doc(db, collectionName, id);
  const snapshot = await firestoreGetDoc(documentRef);

  if (!snapshot.exists()) {
    return null;
  }

  return convertTimestamps<T>({ id: snapshot.id, ...snapshot.data() });
};

export const getDocuments = async <T>(
  collectionName: string,
  ...constraints: QueryConstraint[]
): Promise<T[]> => {
  const collectionRef = collection(db, collectionName);
  const collectionQuery = query(collectionRef, ...constraints);
  const snapshot = await firestoreGetDocs(collectionQuery);

  return snapshot.docs.map((documentSnapshot) =>
    convertTimestamps<T>({
      id: documentSnapshot.id,
      ...documentSnapshot.data(),
    }),
  );
};

export const addDocument = async <T>(
  collectionName: string,
  data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>,
): Promise<string> => {
  const collectionRef = collection(db, collectionName);
  const documentRef = await firestoreAddDoc(collectionRef, {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return documentRef.id;
};

export const updateDocument = async <T>(
  collectionName: string,
  id: string,
  data: Partial<T>,
): Promise<void> => {
  const documentRef = doc(db, collectionName, id);

  await firestoreUpdateDoc(documentRef, {
    ...data,
    updatedAt: serverTimestamp(),
  });
};

export const deleteDocument = async (
  collectionName: string,
  id: string,
): Promise<void> => {
  const documentRef = doc(db, collectionName, id);
  await firestoreDeleteDoc(documentRef);
};

export const subscribeToCollection = <T>(
  collectionName: string,
  constraints: QueryConstraint[],
  callback: (data: T[]) => void,
): (() => void) => {
  const collectionRef = collection(db, collectionName);
  const collectionQuery = query(collectionRef, ...constraints);

  return onSnapshot(collectionQuery, (snapshot) => {
    callback(
      snapshot.docs.map((documentSnapshot) =>
        convertTimestamps<T>({
          id: documentSnapshot.id,
          ...documentSnapshot.data(),
        }),
      ),
    );
  });
};

export const getPaginatedDocuments = async <T>(
  collectionName: string,
  pageSize: number,
  lastDoc: DocumentSnapshot | null,
  ...constraints: QueryConstraint[]
): Promise<{
  data: T[];
  lastDoc: DocumentSnapshot | null;
  hasMore: boolean;
}> => {
  const collectionRef = collection(db, collectionName);
  const paginationConstraints = [...constraints, limit(pageSize + 1)];

  if (lastDoc) {
    paginationConstraints.push(startAfter(lastDoc));
  }

  const collectionQuery = query(collectionRef, ...paginationConstraints);
  const snapshot = await firestoreGetDocs(collectionQuery);
  const hasMore = snapshot.docs.length > pageSize;
  const documents = hasMore ? snapshot.docs.slice(0, pageSize) : snapshot.docs;

  return {
    data: documents.map((documentSnapshot) =>
      convertTimestamps<T>({
        id: documentSnapshot.id,
        ...documentSnapshot.data(),
      }),
    ),
    lastDoc: documents.at(-1) ?? null,
    hasMore,
  };
};
