import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { fetchBillingSubscription } from '../lib/billing.js';
import { hasProAccess, normalizeSubscription } from '../lib/subscription.js';

const STORAGE_KEY = 'aqua_auth_user_v1';

function readStoredUser() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;
    if (typeof parsed.email !== 'string' || !parsed.email.trim()) return null;
    return {
      name: typeof parsed.name === 'string' ? parsed.name : '',
      email: parsed.email.trim(),
      subscription: normalizeSubscription(parsed.subscription),
    };
  } catch {
    return null;
  }
}

function writeStoredUser(user) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  } catch {
    // ignore (storage may be unavailable)
  }
}

function clearStoredUser() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [billingLoaded, setBillingLoaded] = useState(false);

  useEffect(() => {
    setUser(readStoredUser());
    setBillingLoaded(true);
  }, []);

  useEffect(() => {
    if (!user?.email) return;

    let ignore = false;
    setBillingLoaded(false);

    fetchBillingSubscription(user.email)
      .then((result) => {
        if (ignore || !result) return;
        const nextSubscription = normalizeSubscription(result.subscription);
        setUser((prev) => {
          if (!prev || prev.email !== user.email) return prev;
          const next = { ...prev, subscription: nextSubscription };
          writeStoredUser(next);
          return next;
        });
      })
      .catch(() => {
        // keep the locally persisted subscription if billing sync fails
      })
      .finally(() => {
        if (!ignore) setBillingLoaded(true);
      });

    return () => {
      ignore = true;
    };
  }, [user?.email]);

  const value = useMemo(() => {
    return {
      user,
      isAuthed: Boolean(user),
      billingLoaded,
      hasProAccess: hasProAccess(user),
      signIn: ({ name, email }) => {
        const current = readStoredUser();
        const nextEmail = (email || '').trim().toLowerCase();
        const keepSubscription =
          current?.email && current.email === nextEmail ? normalizeSubscription(current.subscription) : null;
        const next = { name: (name || '').trim(), email: nextEmail, subscription: keepSubscription };
        writeStoredUser(next);
        setUser(next);
      },
      setSubscription: (subscription) => {
        setUser((prev) => {
          if (!prev) return prev;
          const next = { ...prev, subscription: normalizeSubscription(subscription) };
          writeStoredUser(next);
          return next;
        });
      },
      signOut: () => {
        clearStoredUser();
        setUser(null);
      },
    };
  }, [billingLoaded, user]);

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
