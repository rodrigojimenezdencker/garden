import {
  GoogleAuthProvider,
  type User,
  createUserWithEmailAndPassword,
  onAuthStateChanged as firebaseOnAuthStateChanged,
  signOut as firebaseSignOut,
  signInWithEmailAndPassword,
  signInWithPopup,
} from 'firebase/auth';
import { auth } from '../lib/firebase';

export const signInWithGoogle = async (): Promise<User> => {
  const provider = new GoogleAuthProvider();
  const credential = await signInWithPopup(auth, provider);

  return credential.user;
};

export const signInWithEmail = async (
  email: string,
  password: string,
): Promise<User> => {
  const credential = await signInWithEmailAndPassword(auth, email, password);

  return credential.user;
};

export const signUp = async (
  email: string,
  password: string,
): Promise<User> => {
  const credential = await createUserWithEmailAndPassword(
    auth,
    email,
    password,
  );

  return credential.user;
};

export const signOut = async (): Promise<void> => {
  await firebaseSignOut(auth);
};

export const onAuthStateChanged = (
  callback: (user: User | null) => void,
): (() => void) => {
  return firebaseOnAuthStateChanged(auth, callback);
};

export const getCurrentUser = (): User | null => {
  return auth.currentUser;
};
