import React from "react";

// Simple auth client using our custom API endpoints
export interface User {
  id: string;
  email: string;
  name: string;
  isAdmin: boolean;
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

class SimpleAuthClient {
  private state: AuthState = {
    user: null,
    isLoading: false,
    error: null,
  };

  private listeners: ((state: AuthState) => void)[] = [];

  private notifyListeners() {
    this.listeners.forEach(listener => listener({ ...this.state }));
  }

  public getState(): AuthState {
    return { ...this.state };
  }

  public subscribe(listener: (state: AuthState) => void) {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  private async request<T = unknown>(endpoint: string, options: RequestInit): Promise<T> {
    const response = await fetch(endpoint, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Request failed');
    }

    return response.json() as Promise<T>;
  }

  public async signIn(email: string, password: string): Promise<{ user: User }> {
    this.state.isLoading = true;
    this.state.error = null;
    this.notifyListeners();

    try {
      const response = await this.request<{ user: User }>('/api/simple-auth/sign-in', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      this.state.user = response.user;
      return response;
    } catch (error) {
      this.state.error = error instanceof Error ? error.message : 'Sign in failed';
      throw error;
    } finally {
      this.state.isLoading = false;
      this.notifyListeners();
    }
  }

  public async signUp(email: string, password: string, name: string): Promise<{ user: User }> {
    this.state.isLoading = true;
    this.state.error = null;
    this.notifyListeners();

    try {
      const response = await this.request<{ user: User }>('/api/simple-auth/sign-up', {
        method: 'POST',
        body: JSON.stringify({ email, password, name }),
      });

      this.state.user = response.user;
      return response;
    } catch (error) {
      this.state.error = error instanceof Error ? error.message : 'Sign up failed';
      throw error;
    } finally {
      this.state.isLoading = false;
      this.notifyListeners();
    }
  }

  public async signOut(): Promise<void> {
    this.state.user = null;
    this.state.error = null;
    this.notifyListeners();
  }

  public async getSession(): Promise<{ user: User | null }> {
    // For now, just return the current user from state
    // In a real app, you'd validate a session token with the server
    return { user: this.state.user };
  }
}

export const authClient = new SimpleAuthClient();

// Export convenience functions
export const signIn = (email: string, password: string) => authClient.signIn(email, password);
export const signUp = (email: string, password: string, name: string) => authClient.signUp(email, password, name);
export const signOut = () => authClient.signOut();
export const getSession = () => authClient.getSession();

// React hook for session management
export function useSession() {
  const [session, setSession] = React.useState<AuthState>(authClient.getState());

  React.useEffect(() => {
    const unsubscribe = authClient.subscribe(setSession);
    return unsubscribe;
  }, []);

  return session;
}