import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { LucideEye, LucideEyeOff, LucideLoaderCircle } from '@lucide/angular';
import { extractApiError } from '../core/lib/api-error';
import { TravellerAuthService } from '../core/services/traveller-auth.service';

@Component({
  selector: 'kn-login-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, RouterLink, LucideEye, LucideEyeOff, LucideLoaderCircle],
  template: `
    <div class="flex min-h-screen items-center justify-center bg-ink px-5 py-16">
      <div class="w-full max-w-sm">
        <a routerLink="/" class="font-display text-2xl text-ink-foreground">
          Kampala<span class="text-primary">Nonstop</span>
        </a>
        <p class="eyebrow mt-1 text-ink-foreground/40">Traveller sign in</p>

        <form [formGroup]="form" (ngSubmit)="submit()" novalidate class="mt-8 bg-paper p-7">
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

          <div class="mt-4 text-right">
            <a
              routerLink="/forgot-password"
              class="text-xs text-muted-foreground underline-offset-2 hover:text-primary hover:underline"
            >
              Forgot password?
            </a>
          </div>

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

        <p class="mt-6 text-center text-sm text-ink-foreground/50">
          New here?
          <a routerLink="/register" class="text-primary hover:underline">Create an account</a>
        </p>
      </div>
    </div>
  `,
})
export class LoginPage {
  private readonly auth = inject(TravellerAuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);

  protected readonly loading = signal(false);
  protected readonly formError = signal<string | null>(null);
  protected readonly show = signal(false);

  protected readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  protected showError(control: 'email' | 'password'): boolean {
    const field = this.form.controls[control];
    return field.invalid && field.touched;
  }

  protected submit(): void {
    this.formError.set(null);
    this.form.markAllAsTouched();

    if (this.form.invalid || this.loading()) {
      return;
    }

    this.loading.set(true);
    this.auth.login(this.form.getRawValue()).subscribe({
      next: () => {
        const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') || '/dashboard';
        void this.router.navigateByUrl(returnUrl);
      },
      error: (error: unknown) => {
        this.formError.set(extractApiError(error, 'Unable to sign in with those credentials.'));
        this.loading.set(false);
      },
    });
  }
}
