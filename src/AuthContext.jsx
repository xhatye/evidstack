import { createContext, useContext, useState, useEffect } from "react";
import {
  onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword,
  signInWithPopup, signOut, sendPasswordResetEmail, updatePassword,
  EmailAuthProvider, reauthenticateWithCredential,
} from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { auth, db, googleProvider } from "./firebase.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(undefined);
  const [isPro, setIsPro] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        const ref = doc(db, "users", firebaseUser.uid);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const data = snap.data();
          const now = Date.now();
          const pro = data.isPro === true && (!data.proExpiresAt || data.proExpiresAt > now);
          setIsPro(pro);
          setUserProfile(data.profile || null);
        } else {
          await setDoc(ref, { email: firebaseUser.email, createdAt: Date.now(), isPro: false });
          setIsPro(false);
          setUserProfile(null);
        }
      } else {
        setUser(null);
        setIsPro(false);
        setUserProfile(null);
      }
      setLoading(false);
    });
    return unsub;
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
    await updateDoc(ref, { profile: profileData });
    setUserProfile(profileData);
  };

  return (
    <AuthContext.Provider value={{
      user, isPro, loading, userProfile,
      loginEmail, signupEmail, loginGoogle,
      logout, resetPassword, changePassword, saveProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
