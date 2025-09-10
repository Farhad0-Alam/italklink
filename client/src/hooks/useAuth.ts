import { useState, useEffect } from 'react';
import { authClient } from '@/lib/auth-client';
import type { AuthState } from '@/lib/auth-client';

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
  role: 'user' | 'admin' | 'owner';
  planType: 'free' | 'pro' | 'enterprise';
  businessCardsCount: number;
  businessCardsLimit: number;
  createdAt: string;
  updatedAt: string;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>(authClient.getState());

  useEffect(() => {
    const unsubscribe = authClient.subscribe(setAuthState);
    return unsubscribe;
  }, []);

  return {
    user: authState.user,
    isLoading: authState.isLoading,
    isAuthenticated: authState.isAuthenticated,
    login: authClient.login.bind(authClient),
    register: authClient.register.bind(authClient),
    logout: authClient.logout.bind(authClient),
    logoutAll: authClient.logoutAll.bind(authClient),
    getRememberedEmail: authClient.getRememberedEmail.bind(authClient),
    clearRememberedEmail: authClient.clearRememberedEmail.bind(authClient),
  };
}

export function useRequireAuth() {
  const auth = useAuth();
  
  if (!auth.isLoading && !auth.isAuthenticated) {
    // This will be handled by the component using this hook
    return { ...auth, requiresAuth: true };
  }
  
  return { ...auth, requiresAuth: false };
}