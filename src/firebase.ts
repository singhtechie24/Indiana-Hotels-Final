import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your secondary Firebase project credentials...
const firebaseConfig = {
  apiKey: "AIzaSyDsKccDW2uUcUAgJew8pCZ3GA6PspKDnP4",
  authDomain: "ehotelmanager-final.firebaseapp.com",
  projectId: "ehotelmanager-final",
  storageBucket: "ehotelmanager-final.firebasestorage.app",
  messagingSenderId: "497994469123",
  appId: "1:497994469123:web:673a45856788e515a96336"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app; 