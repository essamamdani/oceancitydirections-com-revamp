"use client";
import React, { createContext, useContext, useEffect, useState } from 'react';
import { getClientUser, subscribeAuth, signOut as authSignOut } from '@/utils/auth/session';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

const AuthContext = createContext({
  user: null,
  loading: true,
  signOut: async () => {},
  refreshUser: async () => {},
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Initialize and subscribe to auth changes
  useEffect(() => {
    let mounted = true;

    const init = async () => {
      const { user: initialUser } = await getClientUser();
      if (mounted) {
        setUser(initialUser ?? null);
        setLoading(false);
      }
    };

    init();

    const subscription = subscribeAuth((_event, session) => {
      if (mounted) {
        setUser(session?.user ?? null);
      }
    });

    return () => {
      mounted = false;
      subscription?.unsubscribe?.();
    };
  }, []);

  const signOut = async () => {
    try {
      await authSignOut();
      
      // Clear localStorage
      localStorage.removeItem('auth-token');
      document.cookie = 'auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      localStorage.removeItem('auth-user');
      
      setUser(null);
      toast.success("Logged out successfully");
      router.refresh();
      router.push("/");
    } catch (err) {
      console.error('Logout error:', err);
      toast.error("Logout failed");
    }
  };

  const refreshUser = async () => {
    const { user: freshUser } = await getClientUser();
    setUser(freshUser ?? null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signOut, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
