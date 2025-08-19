import { useQuery } from '@tanstack/react-query';

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
  role: 'user' | 'admin';
  planType: 'free' | 'pro' | 'enterprise';
  businessCardsCount: number;
  businessCardsLimit: number;
  createdAt: string;
  updatedAt: string;
}

export function useAuth() {
  const { data: user, isLoading, error, refetch } = useQuery<User>({
    queryKey: ['/api/auth/user'],
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    error,
    refetch,
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