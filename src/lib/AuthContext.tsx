import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { onAuthStateChanged, signOut, type User as FirebaseUser } from "firebase/auth";
import type { AppUser } from "../types";
import { useGameStore } from "../store/useGameStore";
import { auth, hasFirebaseConfig } from "./firebase";
import { waitForAppUserProfile } from "./userProfiles";

type AuthContextValue = {
  currentUser: FirebaseUser | null;
  profile: AppUser | null;
  loading: boolean;
  isConfigured: boolean;
};

const AuthContext = createContext<AuthContextValue>({
  currentUser: null,
  profile: null,
  loading: hasFirebaseConfig,
  isConfigured: hasFirebaseConfig,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(auth?.currentUser ?? null);
  const [profile, setProfile] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(hasFirebaseConfig);
  const setUser = useGameStore((state) => state.setUser);
  const logout = useGameStore((state) => state.logout);

  useEffect(() => {
    if (!hasFirebaseConfig || !auth) {
      setLoading(false);
      return;
    }

    const authInstance = auth;

    const unsubscribe = onAuthStateChanged(authInstance, async (firebaseUser) => {
      setCurrentUser(firebaseUser);

      if (!firebaseUser) {
        setProfile(null);
        logout();
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        const nextProfile = await waitForAppUserProfile(firebaseUser.uid, firebaseUser.email);

        if (!nextProfile) {
          await signOut(authInstance);
          setProfile(null);
          logout();
          return;
        }

        setProfile(nextProfile);
        setUser(nextProfile);
      } catch (error) {
        console.error("Không thể đồng bộ hồ sơ người dùng từ Firebase.", error);
        setProfile(null);
        logout();
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, [logout, setUser]);

  const value = useMemo(
    () => ({ currentUser, profile, loading, isConfigured: hasFirebaseConfig }),
    [currentUser, loading, profile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAppAuth() {
  return useContext(AuthContext);
}