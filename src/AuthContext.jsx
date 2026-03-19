import { createContext, useContext, useState, useEffect } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db, googleProvider } from "./firebase.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(undefined); // undefined = loading
  const [isPro,   setIsPro]   = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        // Fetch pro status from Firestore
        const ref  = doc(db, "users", firebaseUser.uid);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const data = snap.data();
          const now  = Date.now();
          const pro  = data.isPro === true &&
            (!data.proExpiresAt || data.proExpiresAt > now);
          setIsPro(pro);
        } else {
          // Create user doc on first sign in
          await setDoc(ref, {
            email:     firebaseUser.email,
            createdAt: Date.now(),
            isPro:     false,
          });
          setIsPro(false);
        }
      } else {
        setUser(null);
        setIsPro(false);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  const loginEmail  = (email, pw) => signInWithEmailAndPassword(auth, email, pw);
  const signupEmail = (email, pw) => createUserWithEmailAndPassword(auth, email, pw);
  const loginGoogle = ()          => signInWithPopup(auth, googleProvider);
  const logout      = ()          => signOut(auth);

  return (
    <AuthContext.Provider value={{ user, isPro, loading, loginEmail, signupEmail, loginGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
