import { inject, Injectable, signal } from '@angular/core';
import { SUPABASE } from '../supabase/supabase.client';

export type AdminUser = { id: string; email: string; isAdmin: boolean };

/**
 * Session state for admin routes. Access is ultimately enforced by row-level
 * security; this only drives navigation and UI.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly supabase = inject(SUPABASE);

  readonly user = signal<AdminUser | null>(null);
  readonly loading = signal(true);

  private resolved: Promise<AdminUser | null> | null = null;

  constructor() {
    this.supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        this.user.set(null);
        return;
      }
      this.me()
        .then((user) => this.user.set(user))
        .catch(() => this.user.set(null));
    });
  }

  /** Resolves the current admin session once, then serves it from cache. */
  async ensureLoaded(): Promise<AdminUser | null> {
    if (!this.resolved) {
      this.resolved = this.me()
        .catch(() => null)
        .then((user) => {
          this.user.set(user);
          this.loading.set(false);
          return user;
        });
    }
    return this.resolved;
  }

  async login(email: string, password: string): Promise<AdminUser> {
    const { data, error } = await this.supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);

    const user = data.user;
    if (!user) throw new Error('Sign in failed. Please try again.');

    const isAdmin = await this.hasAdminRole(user.id);
    if (!isAdmin) {
      await this.supabase.auth.signOut();
      throw new Error('This account does not have admin access.');
    }

    const admin: AdminUser = { id: user.id, email: user.email ?? email, isAdmin };
    this.user.set(admin);
    this.resolved = Promise.resolve(admin);
    return admin;
  }

  async logout(): Promise<void> {
    await this.supabase.auth.signOut();
    this.user.set(null);
    this.resolved = Promise.resolve(null);
  }

  async me(): Promise<AdminUser | null> {
    const { data } = await this.supabase.auth.getSession();
    const user = data.session?.user;
    if (!user) return null;
    const isAdmin = await this.hasAdminRole(user.id);
    return { id: user.id, email: user.email ?? '', isAdmin };
  }

  private async hasAdminRole(userId: string): Promise<boolean> {
    const { data, error } = await this.supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .eq('role', 'admin')
      .maybeSingle();
    if (error) return false;
    return Boolean(data);
  }
}
