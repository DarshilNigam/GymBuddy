import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  createdAt: number;
}

export interface RegisterResult {
  user: AuthUser | null;
  session: any | null;
  requiresEmailConfirmation: boolean;
}

interface StoredAccount {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  createdAt: number;
}

const AUTH_USER_KEY = 'gymbuddy_auth_user';
const ACCOUNTS_KEY = 'gymbuddy_registered_accounts';

class AuthService {
  private currentUser: AuthUser | null = null;
  private listeners: Array<(user: AuthUser | null) => void> = [];

  constructor() {
    this.loadLocalSession();
    this.initAuth();
  }

  private async initAuth(): Promise<void> {
    if (isSupabaseConfigured()) {
      try {
        // 1. Check existing Supabase session
        const { data: { session } } = await supabase.auth.getSession();
        if (session && session.user) {
          this.currentUser = this.mapSupabaseUser(session.user);
          localStorage.setItem(AUTH_USER_KEY, JSON.stringify(this.currentUser));
          this.notifyListeners();
          this.syncProfileFromCloud(session.user.id);
        }

        // 2. Subscribe to Supabase Auth state changes
        supabase.auth.onAuthStateChange((event, session) => {
          if (session && session.user) {
            this.currentUser = this.mapSupabaseUser(session.user);
            localStorage.setItem(AUTH_USER_KEY, JSON.stringify(this.currentUser));
            this.syncProfileFromCloud(session.user.id);
          } else if (event === 'SIGNED_OUT') {
            this.currentUser = null;
            localStorage.removeItem(AUTH_USER_KEY);
          }
          this.notifyListeners();
        });
      } catch (err) {
        console.warn('Supabase Auth init error:', err);
      }
    } else {
      // Local session restore for unconfigured environment
      this.loadLocalSession();
    }
  }

  public async syncProfileFromCloud(userId: string): Promise<void> {
    if (!isSupabaseConfigured() || !userId) return;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('name, email, avatar_url')
        .eq('id', userId)
        .single();

      if (!error && data && this.currentUser && this.currentUser.id === userId) {
        if (data.name && data.name !== this.currentUser.name) {
          this.currentUser = {
            ...this.currentUser,
            name: data.name,
            email: data.email || this.currentUser.email,
          };
          localStorage.setItem(AUTH_USER_KEY, JSON.stringify(this.currentUser));
          this.notifyListeners();
        }
      }
    } catch (e) {
      console.warn('Failed to sync profile from cloud:', e);
    }
  }

  private mapSupabaseUser(user: any): AuthUser {
    const meta = user.user_metadata || user.raw_user_meta_data || {};
    const name = meta.name || meta.full_name || meta.displayName || (user.email ? user.email.split('@')[0] : 'Athlete');
    return {
      id: user.id,
      name,
      email: user.email || '',
      createdAt: user.created_at ? new Date(user.created_at).getTime() : Date.now(),
    };
  }

  // Fallback storage helpers when Supabase project is unconfigured in local dev
  private getLocalAccounts(): StoredAccount[] {
    try {
      const stored = localStorage.getItem(ACCOUNTS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // Ignore
    }
    return [];
  }

  private saveLocalAccounts(accounts: StoredAccount[]): void {
    try {
      localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
    } catch {
      // Ignore
    }
  }

  private loadLocalSession(): void {
    try {
      const stored = localStorage.getItem(AUTH_USER_KEY);
      if (stored) {
        this.currentUser = JSON.parse(stored);
      }
    } catch {
      this.currentUser = null;
    }
  }

  public getCurrentUser(): AuthUser | null {
    return this.currentUser;
  }

  public isAuthenticated(): boolean {
    return this.currentUser !== null;
  }

  public async login(email: string, password: string): Promise<AuthUser> {
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail || !password) {
      throw new Error('Please enter both your email address and password.');
    }

    if (!normalizedEmail.includes('@') || !normalizedEmail.includes('.')) {
      throw new Error('Please enter a valid email address.');
    }

    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters.');
    }

    if (isSupabaseConfigured()) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password,
      });

      if (error) {
        const msg = error.message.toLowerCase();
        if (
          msg.includes('invalid login credentials') ||
          msg.includes('invalid credentials') ||
          msg.includes('user not found') ||
          msg.includes('email not found')
        ) {
          throw new Error('Account not found. Please register first.');
        }
        if (msg.includes('email not confirmed')) {
          throw new Error('Please confirm your email before logging in.');
        }
        throw new Error(error.message || 'Failed to sign in. Please verify your credentials.');
      }

      if (!data.user) {
        throw new Error('Account not found. Please register first.');
      }

      const user = this.mapSupabaseUser(data.user);
      this.currentUser = user;
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
      this.notifyListeners();
      return user;
    }

    // Local fallback when Supabase is not configured
    await new Promise((resolve) => setTimeout(resolve, 300));
    const accounts = this.getLocalAccounts();
    const account = accounts.find((acc) => acc.email.toLowerCase() === normalizedEmail);

    if (!account) {
      throw new Error('Account not found. Please register first.');
    }

    if (account.passwordHash !== password) {
      throw new Error('Incorrect password. Please try again.');
    }

    const user: AuthUser = {
      id: account.id,
      name: account.name,
      email: account.email,
      createdAt: account.createdAt,
    };

    this.currentUser = user;
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
    this.notifyListeners();
    return user;
  }

  public async register(name: string, email: string, password: string): Promise<RegisterResult> {
    const trimmedName = name.trim();
    const normalizedEmail = email.trim().toLowerCase();

    if (!trimmedName) {
      throw new Error('Please enter your full name.');
    }

    if (!normalizedEmail || !normalizedEmail.includes('@') || !normalizedEmail.includes('.')) {
      throw new Error('Please enter a valid email address.');
    }

    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters.');
    }

    if (isSupabaseConfigured()) {
      const { data, error } = await supabase.auth.signUp({
        email: normalizedEmail,
        password,
        options: {
          data: {
            name: trimmedName,
            full_name: trimmedName,
          },
        },
      });

      if (error) {
        const msg = error.message.toLowerCase();
        if (
          msg.includes('already registered') ||
          msg.includes('already in use') ||
          msg.includes('user already exists')
        ) {
          throw new Error('This email is already registered. Please log in.');
        }
        throw new Error(error.message || 'Registration failed. Please try again.');
      }

      // Supabase anti-user enumeration check (returns user with empty identities if already exists)
      if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
        throw new Error('This email is already registered. Please log in.');
      }

      // Check if session was returned
      if (data.session && data.user) {
        const user = this.mapSupabaseUser(data.user);
        this.currentUser = user;
        localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
        this.notifyListeners();
        return {
          user,
          session: data.session,
          requiresEmailConfirmation: false,
        };
      }

      // If email confirmation is required and no active session is returned
      this.currentUser = null;
      this.notifyListeners();
      return {
        user: null,
        session: null,
        requiresEmailConfirmation: true,
      };
    }

    // Local fallback when Supabase is not configured
    await new Promise((resolve) => setTimeout(resolve, 350));
    const accounts = this.getLocalAccounts();
    const existing = accounts.find((acc) => acc.email.toLowerCase() === normalizedEmail);

    if (existing) {
      throw new Error('This email is already registered. Please log in.');
    }

    const newAccount: StoredAccount = {
      id: `usr_${Date.now()}`,
      name: trimmedName,
      email: normalizedEmail,
      passwordHash: password,
      createdAt: Date.now(),
    };

    const updatedAccounts = [...accounts, newAccount];
    this.saveLocalAccounts(updatedAccounts);

    const user: AuthUser = {
      id: newAccount.id,
      name: newAccount.name,
      email: newAccount.email,
      createdAt: newAccount.createdAt,
    };

    this.currentUser = user;
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
    this.notifyListeners();

    return {
      user,
      session: { access_token: `gb_tok_${Date.now()}` },
      requiresEmailConfirmation: false,
    };
  }

  public async logout(): Promise<void> {
    if (isSupabaseConfigured()) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.warn('Supabase sign out error:', err);
      }
    }
    this.currentUser = null;
    localStorage.removeItem(AUTH_USER_KEY);
    this.notifyListeners();
  }

  public subscribe(listener: (user: AuthUser | null) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notifyListeners(): void {
    for (const listener of this.listeners) {
      listener(this.currentUser);
    }
  }
}

export const authService = new AuthService();
