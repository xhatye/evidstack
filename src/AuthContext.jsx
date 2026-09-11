import { createContext, useContext, useState, useEffect } from "react";
import {
  onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword,
  signInWithPopup, signOut, sendPasswordResetEmail, updatePassword,
  EmailAuthProvider, reauthenticateWithCredential, setPersistence, browserLocalPersistence,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db, googleProvider } from "./firebase.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(undefined);
  const [isPro, setIsPro] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    let active = true;
    let profileRequest = 0;

    const syncUser = async (firebaseUser) => {
      const requestId = ++profileRequest;
      if (!firebaseUser) {
        if (!active) return;
        setUser(null);
        setIsPro(false);
        setUserProfile(null);
        setAuthError(null);
        setLoading(false);
        return;
      }

      if (active) {
        setUser(firebaseUser);
        setAuthError(null);
      }

      try {
        const ref = doc(db, "users", firebaseUser.uid);
        const snap = await getDoc(ref);
        if (!active || requestId !== profileRequest) return;

        if (snap.exists()) {
          const data = snap.data();
          const expiresAt = data.proExpiresAt;
          const expiresAtMs = typeof expiresAt?.toMillis === "function"
            ? expiresAt.toMillis()
            : typeof expiresAt?.seconds === "number"
              ? expiresAt.seconds * 1000
              : expiresAt;
          const pro = data.isPro === true && (!expiresAtMs || expiresAtMs > Date.now());
          setIsPro(pro);
          setUserProfile(data.profile || null);
        } else {
          await setDoc(ref, {
            email: firebaseUser.email || null,
            createdAt: Date.now(),
            isPro: false,
          }, { merge: true });
          if (!active || requestId !== profileRequest) return;
          setIsPro(false);
          setUserProfile(null);
        }
        setAuthError(null);
      } catch (error) {
        if (!active || requestId !== profileRequest) return;
        // Keep the signed-in identity available even if Firestore is temporarily unavailable.
        setIsPro(false);
        setUserProfile(null);
        setAuthError("Your account details could not be loaded. Please try again.");
        console.error("Unable to load account details", error);
      } finally {
        if (active && requestId === profileRequest) setLoading(false);
      }
    };

    setPersistence(auth, browserLocalPersistence).catch((error) => {
      if (active) console.error("Unable to persist the sign-in session", error);
    });
    const unsub = onAuthStateChanged(auth, syncUser);
    return () => {
      active = false;
      unsub();
    };
  }, []);

  const loginEmail = (email, pw) => signInWithEmailAndPassword(auth, email, pw);
  const signupEmail = (email, pw) => createUserWithEmailAndPassword(auth, email, pw);
  const loginGoogle = () => signInWithPopup(auth, googleProvider);
  const logout = () => signOut(auth);
  const resetPassword = (email) => sendPasswordResetEmail(auth, email);
  const changePassword = async (currentPw, newPw) => {
    const cred = EmailAuthProvider.credential(auth.currentUser.email, currentPw);
    await reauthenticateWithCredential(auth.currentUser, cred);
    await updatePassword(auth.currentUser, newPw);
  };

  const saveProfile = async (profileData) => {
    if (!user) return;
    const ref = doc(db, "users", user.uid);
    await setDoc(ref, { profile: profileData }, { merge: true });
    setUserProfile(profileData);
  };

  return (
    <AuthContext.Provider value={{
      user, isPro, loading, userProfile, authError,
      loginEmail, signupEmail, loginGoogle,
      logout, resetPassword, changePassword, saveProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

