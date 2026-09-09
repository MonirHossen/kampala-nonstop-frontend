import { Injectable, signal } from '@angular/core';

export type AuthModalMode = 'login' | 'register' | 'forgot';

@Injectable({ providedIn: 'root' })
export class AuthModalService {
  readonly mode = signal<AuthModalMode | null>(null);
  readonly returnUrl = signal('/dashboard');
  readonly error = signal<string | null>(null);

  open(
    mode: AuthModalMode,
    options?: { returnUrl?: string | null; error?: string | null },
  ): void {
    this.returnUrl.set(options?.returnUrl?.trim() || '/dashboard');
    this.error.set(options?.error?.trim() || null);
    this.mode.set(mode);
  }

  switchTo(mode: AuthModalMode): void {
    this.error.set(null);
    this.mode.set(mode);
  }

  close(): void {
    this.mode.set(null);
    this.error.set(null);
    this.returnUrl.set('/dashboard');
  }

  isOpen(): boolean {
    return this.mode() !== null;
  }
}
