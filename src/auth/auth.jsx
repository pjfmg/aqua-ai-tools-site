import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

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

  useEffect(() => {
    setUser(readStoredUser());
  }, []);

  const value = useMemo(() => {
    return {
      user,
      isAuthed: Boolean(user),
      signIn: ({ name, email }) => {
        const next = { name: (name || '').trim(), email: (email || '').trim().toLowerCase() };
        writeStoredUser(next);
        setUser(next);
      },
      signOut: () => {
        clearStoredUser();
        setUser(null);
      },
    };
  }, [user]);

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
