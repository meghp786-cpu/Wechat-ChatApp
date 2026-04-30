import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

// Paste YOUR firebaseConfig from Firebase Console → Project Settings → Your apps
const firebaseConfig = {
    apiKey: "AIzaSyA5Jf7d14voWVCdSOATRjhanH42iQhv-Dk",
    authDomain: "nexus3d-chat.firebaseapp.com",
    projectId: "nexus3d-chat",
    storageBucket: "nexus3d-chat.firebasestorage.app",
    messagingSenderId: "524513145683",
    appId: "1:524513145683:web:37eec088031928e107a7a6",
    measurementId: "G-9YB0K2YXRQ"
};
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export const signInWithGoogle = () => signInWithPopup(auth, googleProvider);
