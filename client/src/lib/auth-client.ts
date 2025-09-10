import { queryClient } from './queryClient';

interface User {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  profileImageUrl: string | null;
  role: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

type AuthListener = (state: AuthState) => void;

class AuthClient {
  private state: AuthState = {
    user: null,
    accessToken: null,
    isLoading: true,
    isAuthenticated: false,
  };

  private listeners: Set<AuthListener> = new Set();
  private refreshPromise: Promise<void> | null = null;
  private refreshTimeoutId: number | null = null;

  constructor() {
    this.init();
  }

  private async init() {
    // Check for access token in URL hash from OAuth redirect
    this.checkHashForToken();
    
    // Try to restore session with refresh token
    await this.restoreSession();
    
    this.setState({ isLoading: false });
  }

  private checkHashForToken() {
    const hash = window.location.hash;
    const tokenMatch = hash.match(/token=([^&]+)/);
    
    if (tokenMatch) {
      const accessToken = tokenMatch[1];
      this.setAccessToken(accessToken);
      
      // Clean up URL
      const newHash = hash.replace(/[?&]?token=[^&]+/, '').replace(/^#$/, '');
      window.location.hash = newHash;
      
      // Fetch user data
      this.fetchUser();
    }
  }

  private async restoreSession() {
    try {
      // Try to refresh the session using the refresh token cookie
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        this.setAccessToken(data.accessToken);
        await this.fetchUser();
      }
    } catch (error) {
      console.log('Session restore failed, user needs to log in');
    }
  }

  private setAccessToken(token: string) {
    this.setState({ accessToken: token });
    this.scheduleTokenRefresh(token);
  }

  private setState(updates: Partial<AuthState>) {
    this.state = { ...this.state, ...updates };
    this.state.isAuthenticated = !!(this.state.user && this.state.accessToken);
    this.notifyListeners();
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.state));
  }

  private scheduleTokenRefresh(token: string) {
    if (this.refreshTimeoutId) {
      clearTimeout(this.refreshTimeoutId);
    }

    try {
      // Decode JWT to get expiration
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiresIn = (payload.exp * 1000) - Date.now();
      
      // Refresh 1 minute before expiration
      const refreshIn = Math.max(expiresIn - 60000, 5000);
      
      this.refreshTimeoutId = window.setTimeout(() => {
        this.refreshToken();
      }, refreshIn);
    } catch (error) {
      console.error('Failed to schedule token refresh:', error);
    }
  }

  private async fetchUser() {
    if (!this.state.accessToken) return;

    try {
      const response = await fetch('/api/auth/user', {
        headers: {
          'Authorization': `Bearer ${this.state.accessToken}`,
        },
        credentials: 'include',
      });

      if (response.ok) {
        const user = await response.json();
        this.setState({ user });
      } else if (response.status === 401) {
        // Token is invalid, try to refresh
        await this.refreshToken();
      }
    } catch (error) {
      console.error('Failed to fetch user:', error);
    }
  }

  private async refreshToken() {
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = this._refreshToken();
    try {
      await this.refreshPromise;
    } finally {
      this.refreshPromise = null;
    }
  }

  private async _refreshToken() {
    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        this.setAccessToken(data.accessToken);
        await this.fetchUser();
      } else {
        // Refresh failed, user needs to log in again
        this.logout();
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      this.logout();
    }
  }

  // Public API methods
  subscribe(listener: AuthListener) {
    this.listeners.add(listener);
    
    return () => {
      this.listeners.delete(listener);
    };
  }

  getState(): AuthState {
    return { ...this.state };
  }

  async login(email: string, password: string, rememberEmail?: boolean): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password, rememberEmail }),
      });

      const data = await response.json();

      if (response.ok) {
        this.setAccessToken(data.accessToken);
        this.setState({ user: data.user });
        
        // Remember email if requested
        if (rememberEmail) {
          localStorage.setItem('rememberedEmail', email);
        } else {
          localStorage.removeItem('rememberedEmail');
        }

        // Invalidate query cache
        queryClient.invalidateQueries();
        
        // Redirect based on user role
        if (data.user?.role === 'owner' || data.user?.role === 'admin') {
          window.location.href = '/admin';
        } else {
          window.location.href = '/dashboard';
        }
        
        return { success: true };
      } else {
        return { success: false, error: data.message || 'Login failed' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Network error' };
    }
  }

  async register(userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (response.ok) {
        this.setAccessToken(data.accessToken);
        this.setState({ user: data.user });
        
        // Invalidate query cache
        queryClient.invalidateQueries();
        
        return { success: true };
      } else {
        return { success: false, error: data.message || 'Registration failed' };
      }
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: 'Network error' };
    }
  }

  async logout(): Promise<void> {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout error:', error);
    }

    // Clear local state
    if (this.refreshTimeoutId) {
      clearTimeout(this.refreshTimeoutId);
      this.refreshTimeoutId = null;
    }

    this.setState({
      user: null,
      accessToken: null,
      isAuthenticated: false,
    });

    // Clear query cache
    queryClient.clear();
  }

  async logoutAll(): Promise<void> {
    if (!this.state.accessToken) return;

    try {
      await fetch('/api/auth/logout-all', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.state.accessToken}`,
        },
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout all error:', error);
    }

    // Clear local state
    if (this.refreshTimeoutId) {
      clearTimeout(this.refreshTimeoutId);
      this.refreshTimeoutId = null;
    }

    this.setState({
      user: null,
      accessToken: null,
      isAuthenticated: false,
    });

    // Clear query cache
    queryClient.clear();
  }

  getAccessToken(): string | null {
    return this.state.accessToken;
  }

  getRememberedEmail(): string | null {
    return localStorage.getItem('rememberedEmail');
  }

  clearRememberedEmail(): void {
    localStorage.removeItem('rememberedEmail');
  }
}

export const authClient = new AuthClient();
export type { User, AuthState };