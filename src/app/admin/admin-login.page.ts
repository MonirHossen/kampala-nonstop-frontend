import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LucideEye, LucideEyeOff, LucideLoaderCircle } from '@lucide/angular';
import { AuthService } from '../core/services/auth.service';

@Component({
  selector: 'kn-admin-login-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, LucideEye, LucideEyeOff, LucideLoaderCircle],
  template: `
    <div class="flex min-h-screen items-center justify-center bg-ink px-5 py-16">
      <div class="w-full max-w-sm">
        <p class="font-display text-2xl text-ink-foreground">
          Kampala<span class="text-primary">Nonstop</span>
        </p>
        <p class="eyebrow mt-1 text-ink-foreground/40">Admin access</p>

        <form [formGroup]="form" (ngSubmit)="onSubmit()" novalidate class="mt-8 bg-paper p-7">
          <label for="email" class="eyebrow block text-muted-foreground">Email</label>
          <input
            id="email"
            type="email"
            autocomplete="email"
            formControlName="email"
            class="mt-2 h-11 w-full border-b bg-transparent outline-none transition-colors"
            [class]="
              showError('email') ? 'border-destructive' : 'border-input focus:border-primary'
            "
          />
          @if (emailError(); as message) {
            <p class="mt-1.5 text-xs text-destructive">{{ message }}</p>
          }

          <label for="password" class="eyebrow mt-6 block text-muted-foreground">Password</label>
          <div class="relative">
            <input
              id="password"
              [type]="show() ? 'text' : 'password'"
              autocomplete="current-password"
              formControlName="password"
              class="mt-2 h-11 w-full border-b bg-transparent pr-10 outline-none transition-colors"
              [class]="
                showError('password') ? 'border-destructive' : 'border-input focus:border-primary'
              "
            />
            <button
              type="button"
              (click)="show.set(!show())"
              [attr.aria-label]="show() ? 'Hide password' : 'Show password'"
              class="absolute right-0 top-3.5 text-muted-foreground hover:text-foreground"
            >
              @if (show()) {
                <svg lucideEyeOff class="h-4 w-4"></svg>
              } @else {
                <svg lucideEye class="h-4 w-4"></svg>
              }
            </button>
          </div>
          @if (passwordError(); as message) {
            <p class="mt-1.5 text-xs text-destructive">{{ message }}</p>
          }

          @if (formError()) {
            <p
              role="alert"
              class="mt-5 border-l-2 border-destructive bg-destructive/5 px-3 py-2.5 text-xs text-destructive"
            >
              {{ formError() }}
            </p>
          }

          <button
            type="submit"
            [disabled]="loading()"
            class="eyebrow mt-7 flex w-full items-center justify-center gap-2 bg-primary py-4 text-primary-foreground transition-colors hover:bg-clay disabled:opacity-70"
          >
            @if (loading()) {
              <svg lucideLoaderCircle class="h-4 w-4 animate-spin"></svg>
              Signing in&hellip;
            } @else {
              Sign in
            }
          </button>
        </form>
      </div>
    </div>
  `,
})
export class AdminLoginPage {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  protected readonly show = signal(false);
  protected readonly loading = signal(false);
  protected readonly formError = signal<string | null>(null);

  protected async onSubmit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.formError.set(null);
    this.loading.set(true);
    const { email, password } = this.form.getRawValue();

    try {
      await this.auth.login(email.trim(), password);
      void this.router.navigate(['/admin/dashboard']);
    } catch (error) {
      this.formError.set(
        error instanceof Error ? error.message : 'Sign in failed. Please try again.',
      );
    } finally {
      this.loading.set(false);
    }
  }

  protected showError(field: 'email' | 'password'): boolean {
    const control = this.form.controls[field];
    return control.invalid && (control.touched || control.dirty);
  }

  protected emailError(): string | null {
    if (!this.showError('email')) return null;
    const control = this.form.controls.email;
    if (control.hasError('required')) return 'Enter your email';
    return 'Enter a valid email';
  }

  protected passwordError(): string | null {
    if (!this.showError('password')) return null;
    const control = this.form.controls.password;
    if (control.hasError('required')) return 'Enter your password';
    return 'Password must be at least 6 characters';
  }
}
