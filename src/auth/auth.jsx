import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { fetchBillingSubscription } from '../lib/billing.js';
import { hasProAccess, normalizeSubscription } from '../lib/subscription.js';
import {
  getAuthenticatedUser,
  signInWithPassword,
  signOutFromSupabase,
  signUpWithPassword,
} from '../lib/supabaseAuth.js';

function toAppUser(authUser) {
  if (!authUser?.id || !authUser?.email) return null;
  return {
    id: authUser.id,
    name: String(authUser.user_metadata?.name || authUser.email.split('@')[0] || '').trim(),
    email: String(authUser.email).trim().toLowerCase(),
    subscription: null,
  };
}

const AuthContext = createContext(null);
const GUEST_SESSION_KEY = 'aqua-ai-tools-guest-session';

function readGuestSession() {
  try { return sessionStorage.getItem(GUEST_SESSION_KEY) === 'active'; }
  catch { return false; }
}

function writeGuestSession(active) {
  try {
    if (active) sessionStorage.setItem(GUEST_SESSION_KEY, 'active');
    else sessionStorage.removeItem(GUEST_SESSION_KEY);
  } catch { /* Storage may be unavailable. */ }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authLoaded, setAuthLoaded] = useState(false);
  const [billingLoaded, setBillingLoaded] = useState(false);
  const [guestMode, setGuestMode] = useState(readGuestSession);

  useEffect(() => {
    if (guestMode) {
      setUser(null);
      setAuthLoaded(true);
      setBillingLoaded(true);
      return undefined;
    }
    let ignore = false;
    try {
      localStorage.removeItem('aqua_auth_user_v1');
    } catch {
      // Ignore unavailable storage while removing the legacy local profile.
    }
    getAuthenticatedUser()
      .then((authUser) => {
        if (!ignore) setUser(toAppUser(authUser));
      })
      .catch(() => {
        if (!ignore) setUser(null);
      })
      .finally(() => {
        if (!ignore) setAuthLoaded(true);
      });
    return () => {
      ignore = true;
    };
  }, [guestMode]);

  useEffect(() => {
    if (!user?.id) {
      if (authLoaded) setBillingLoaded(true);
      return;
    }

    let ignore = false;
    setBillingLoaded(false);

    fetchBillingSubscription()
      .then((result) => {
        if (ignore || !result) return;
        const nextSubscription = normalizeSubscription(result.subscription);
        setUser((prev) => {
          if (!prev || prev.email !== user.email) return prev;
          return { ...prev, subscription: nextSubscription };
        });
      })
      .catch(() => {
        // Authentication remains valid even if billing is temporarily unavailable.
      })
      .finally(() => {
        if (!ignore) setBillingLoaded(true);
      });

    return () => {
      ignore = true;
    };
  }, [authLoaded, user?.id]);

  const value = useMemo(() => {
    return {
      user,
      authLoaded,
      isAuthed: Boolean(user) && !guestMode,
      guestMode,
      enterGuest: () => {
        writeGuestSession(true);
        setUser(null);
        setGuestMode(true);
      },
      billingLoaded,
      hasProAccess: hasProAccess(user),
      signIn: async ({ email, password }) => {
        const session = await signInWithPassword({ email, password });
        const next = toAppUser(session?.user);
        if (!next) throw new Error('A sessão não contém um utilizador válido.');
        writeGuestSession(false);
        setGuestMode(false);
        setUser(next);
        return next;
      },
      signUp: async ({ name, email, password }) => {
        const result = await signUpWithPassword({ name, email, password });
        const next = toAppUser(result?.user || result);
        if (result?.access_token && next) {
          writeGuestSession(false);
          setGuestMode(false);
          setUser(next);
        }
        return { user: next, authenticated: Boolean(result?.access_token && next) };
      },
      setSubscription: (subscription) => {
        setUser((prev) => {
          if (!prev) return prev;
          return { ...prev, subscription: normalizeSubscription(subscription) };
        });
      },
      signOut: async () => {
        await signOutFromSupabase();
        setUser(null);
      },
    };
  }, [authLoaded, billingLoaded, guestMode, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>');
  return ctx;
}

export function getInitials(nameOrEmail) {
  const str = String(nameOrEmail || '').trim();
  if (!str) return '?';
  const parts = str.split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}
