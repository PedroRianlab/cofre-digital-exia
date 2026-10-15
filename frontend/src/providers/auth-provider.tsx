"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { loginRequest, registerRequest } from "@/features/auth/auth.api";
import type { AuthCredentials } from "@/features/auth/auth.types";
import {
  AUTH_TOKEN_KEY,
  AUTH_SESSION_CHANGED_EVENT,
  SESSION_EXPIRED_EVENT,
} from "@/lib/api";

type AuthContextValue = {
  isAuthenticated: boolean;
  isCheckingSession: boolean;
  login: (credentials: AuthCredentials) => Promise<void>;
  register: (credentials: AuthCredentials) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function subscribeToSession(callback: () => void) {
  window.addEventListener(AUTH_SESSION_CHANGED_EVENT, callback);
  window.addEventListener(SESSION_EXPIRED_EVENT, callback);

  return () => {
    window.removeEventListener(AUTH_SESSION_CHANGED_EVENT, callback);
    window.removeEventListener(SESSION_EXPIRED_EVENT, callback);
  };
}

function getSessionToken() {
  return sessionStorage.getItem(AUTH_TOKEN_KEY);
}

function getServerSessionToken() {
  return null;
}

function subscribeToHydration() {
  return () => undefined;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const token = useSyncExternalStore(
    subscribeToSession,
    getSessionToken,
    getServerSessionToken,
  );
  const isHydrated = useSyncExternalStore(
    subscribeToHydration,
    () => true,
    () => false,
  );
  const isCheckingSession = !isHydrated;

  useEffect(() => {
    function handleExpiredSession() {
      toast.error("Sua sessão expirou. Entre novamente.");
      router.replace("/login");
    }

    window.addEventListener(SESSION_EXPIRED_EVENT, handleExpiredSession);
    return () =>
      window.removeEventListener(SESSION_EXPIRED_EVENT, handleExpiredSession);
  }, [router]);

  const value = useMemo<AuthContextValue>(
    () => ({
      isAuthenticated: Boolean(token),
      isCheckingSession,
      async login(credentials) {
        const response = await loginRequest(credentials);
        sessionStorage.setItem(AUTH_TOKEN_KEY, response.accessToken);
        window.dispatchEvent(new Event(AUTH_SESSION_CHANGED_EVENT));
      },
      async register(credentials) {
        await registerRequest(credentials);
      },
      logout() {
        sessionStorage.removeItem(AUTH_TOKEN_KEY);
        window.dispatchEvent(new Event(AUTH_SESSION_CHANGED_EVENT));
      },
    }),
    [isCheckingSession, token],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth deve ser usado dentro de AuthProvider");
  }

  return context;
}
