import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  effect,
  inject,
  signal,
} from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { LucideEye, LucideEyeOff, LucideLoaderCircle, LucideX } from '@lucide/angular';
import { SocialAuthButtonsComponent } from '../core/components/social-auth-buttons.component';
import { extractApiError } from '../core/lib/api-error';
import { AuthModalService, type AuthModalMode } from '../core/services/auth-modal.service';
import { TravellerAuthService } from '../core/services/traveller-auth.service';

function passwordsMatch(group: AbstractControl): ValidationErrors | null {
  const password = group.get('password')?.value;
  const confirmation = group.get('password_confirmation')?.value;
  if (!password || !confirmation || password === confirmation) {
    return null;
  }
  return { passwordMismatch: true };
}

@Component({
  selector: 'kn-auth-modal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    LucideEye,
    LucideEyeOff,
    LucideLoaderCircle,
    LucideX,
    SocialAuthButtonsComponent,
  ],
  template: `
    @if (authModal.mode(); as mode) {
      <div
        class="fixed inset-0 z-[90] flex items-start justify-center overflow-y-auto bg-ink/60 px-4 py-10 sm:items-center sm:py-8"
        role="dialog"
        aria-modal="true"
        [attr.aria-label]="
          mode === 'login' ? 'Sign in' : mode === 'register' ? 'Create account' : 'Reset password'
        "
        (click)="close()"
      >
        <div
          class="relative w-full max-w-md border border-hairline bg-paper p-6 sm:p-7"
          (click)="$event.stopPropagation()"
        >
          <button
            type="button"
            (click)="close()"
            class="absolute right-4 top-4 text-muted-foreground transition-colors hover:text-foreground"
            aria-label="Close"
          >
            <svg lucideX class="h-5 w-5"></svg>
          </button>

          @if (mode === 'login') {
            <h2 class="font-display text-2xl text-foreground">Sign in</h2>
            <p class="mt-1 text-sm text-muted-foreground">Welcome back to Kampala Nonstop</p>

            <form [formGroup]="loginForm" (ngSubmit)="submitLogin()" novalidate class="mt-6">
              <label for="auth-login-email" class="eyebrow block text-muted-foreground">Email</label>
              <input
                id="auth-login-email"
                type="email"
                autocomplete="email"
                formControlName="email"
                class="mt-2 h-11 w-full border-b bg-transparent outline-none transition-colors"
                [class]="
                  loginFieldError('email')
                    ? 'border-destructive'
                    : 'border-input focus:border-primary'
                "
              />

              <label for="auth-login-password" class="eyebrow mt-6 block text-muted-foreground"
                >Password</label
              >
              <div class="relative">
                <input
                  id="auth-login-password"
                  [type]="showLoginPassword() ? 'text' : 'password'"
                  autocomplete="current-password"
                  formControlName="password"
                  class="mt-2 h-11 w-full border-b bg-transparent pr-10 outline-none transition-colors"
                  [class]="
                    loginFieldError('password')
                      ? 'border-destructive'
                      : 'border-input focus:border-primary'
                  "
                />
                <button
                  type="button"
                  (click)="showLoginPassword.set(!showLoginPassword())"
                  [attr.aria-label]="showLoginPassword() ? 'Hide password' : 'Show password'"
                  class="absolute right-0 top-3.5 text-muted-foreground hover:text-foreground"
                >
                  @if (showLoginPassword()) {
                    <svg lucideEyeOff class="h-4 w-4"></svg>
                  } @else {
                    <svg lucideEye class="h-4 w-4"></svg>
                  }
                </button>
              </div>

              <div class="mt-4 text-right">
                <button
                  type="button"
                  (click)="switchTo('forgot')"
                  class="text-xs text-muted-foreground underline-offset-2 hover:text-primary hover:underline"
                >
                  Forgot password?
                </button>
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

              <kn-social-auth-buttons [disabled]="loading()" [returnUrl]="authModal.returnUrl()" />
            </form>

            <p class="mt-6 text-center text-sm text-muted-foreground">
              New here?
              <button
                type="button"
                (click)="switchTo('register')"
                class="text-primary hover:underline"
              >
                Create an account
              </button>
            </p>
          } @else if (mode === 'register') {
            <h2 class="font-display text-2xl text-foreground">Create account</h2>
            <p class="mt-1 text-sm text-muted-foreground">Join Kampala Nonstop as a traveller</p>

            <form [formGroup]="registerForm" (ngSubmit)="submitRegister()" novalidate class="mt-6">
              <div class="grid gap-5 sm:grid-cols-2">
                <div>
                  <label for="auth-first-name" class="eyebrow block text-muted-foreground"
                    >First name</label
                  >
                  <input
                    id="auth-first-name"
                    type="text"
                    autocomplete="given-name"
                    formControlName="first_name"
                    class="mt-2 h-11 w-full border-b bg-transparent outline-none transition-colors"
                    [class]="
                      registerFieldError('first_name')
                        ? 'border-destructive'
                        : 'border-input focus:border-primary'
                    "
                  />
                </div>
                <div>
                  <label for="auth-last-name" class="eyebrow block text-muted-foreground"
                    >Last name</label
                  >
                  <input
                    id="auth-last-name"
                    type="text"
                    autocomplete="family-name"
                    formControlName="last_name"
                    class="mt-2 h-11 w-full border-b bg-transparent outline-none transition-colors"
                    [class]="
                      registerFieldError('last_name')
                        ? 'border-destructive'
                        : 'border-input focus:border-primary'
                    "
                  />
                </div>
              </div>

              <label for="auth-register-email" class="eyebrow mt-5 block text-muted-foreground"
                >Email</label
              >
              <input
                id="auth-register-email"
                type="email"
                autocomplete="email"
                formControlName="email"
                class="mt-2 h-11 w-full border-b bg-transparent outline-none transition-colors"
                [class]="
                  registerFieldError('email')
                    ? 'border-destructive'
                    : 'border-input focus:border-primary'
                "
              />

              <label for="auth-register-password" class="eyebrow mt-5 block text-muted-foreground"
                >Password</label
              >
              <div class="relative">
                <input
                  id="auth-register-password"
                  [type]="showRegisterPassword() ? 'text' : 'password'"
                  autocomplete="new-password"
                  formControlName="password"
                  class="mt-2 h-11 w-full border-b bg-transparent pr-10 outline-none transition-colors"
                  [class]="
                    registerFieldError('password')
                      ? 'border-destructive'
                      : 'border-input focus:border-primary'
                  "
                />
                <button
                  type="button"
                  (click)="showRegisterPassword.set(!showRegisterPassword())"
                  class="absolute right-0 top-3.5 text-muted-foreground hover:text-foreground"
                  [attr.aria-label]="showRegisterPassword() ? 'Hide password' : 'Show password'"
                >
                  @if (showRegisterPassword()) {
                    <svg lucideEyeOff class="h-4 w-4"></svg>
                  } @else {
                    <svg lucideEye class="h-4 w-4"></svg>
                  }
                </button>
              </div>

              <label
                for="auth-password-confirmation"
                class="eyebrow mt-5 block text-muted-foreground"
                >Confirm password</label
              >
              <input
                id="auth-password-confirmation"
                [type]="showRegisterPassword() ? 'text' : 'password'"
                autocomplete="new-password"
                formControlName="password_confirmation"
                class="mt-2 h-11 w-full border-b bg-transparent outline-none transition-colors"
                [class]="
                  registerForm.hasError('passwordMismatch') &&
                  registerForm.controls.password_confirmation.touched
                    ? 'border-destructive'
                    : 'border-input focus:border-primary'
                "
              />

              <label class="mt-6 flex items-start gap-3 text-sm text-muted-foreground">
                <input type="checkbox" formControlName="accept_terms" class="mt-1" />
                <span>
                  I agree to the
                  <a
                    routerLink="/terms"
                    (click)="goTo('/terms', $event)"
                    class="text-primary hover:underline"
                    >Terms</a
                  >
                  and
                  <a
                    routerLink="/privacy"
                    (click)="goTo('/privacy', $event)"
                    class="text-primary hover:underline"
                    >Privacy Policy</a
                  >
                </span>
              </label>

              <label class="mt-3 flex items-start gap-3 text-sm text-muted-foreground">
                <input type="checkbox" formControlName="marketing_consent" class="mt-1" />
                <span>Send me travel tips and Kampala Nonstop updates</span>
              </label>

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
                  Creating account&hellip;
                } @else {
                  Create account
                }
              </button>

              <kn-social-auth-buttons [disabled]="loading()" [returnUrl]="authModal.returnUrl()" />
            </form>

            <p class="mt-6 text-center text-sm text-muted-foreground">
              Already registered?
              <button
                type="button"
                (click)="switchTo('login')"
                class="text-primary hover:underline"
              >
                Sign in
              </button>
            </p>
          } @else {
            <h2 class="font-display text-2xl text-foreground">Reset password</h2>
            <p class="mt-1 text-sm text-muted-foreground">
              Enter your email and we will send a reset link if an account exists.
            </p>

            <form [formGroup]="forgotForm" (ngSubmit)="submitForgot()" novalidate class="mt-6">
              <label for="auth-forgot-email" class="eyebrow block text-muted-foreground">Email</label>
              <input
                id="auth-forgot-email"
                type="email"
                autocomplete="email"
                formControlName="email"
                class="mt-2 h-11 w-full border-b bg-transparent outline-none transition-colors"
                [class]="
                  forgotForm.controls.email.invalid && forgotForm.controls.email.touched
                    ? 'border-destructive'
                    : 'border-input focus:border-primary'
                "
              />

              @if (formError()) {
                <p
                  role="alert"
                  class="mt-5 border-l-2 border-destructive bg-destructive/5 px-3 py-2.5 text-xs text-destructive"
                >
                  {{ formError() }}
                </p>
              }

              @if (forgotSuccess()) {
                <p
                  role="status"
                  class="mt-5 border-l-2 border-forest bg-forest/5 px-3 py-2.5 text-xs text-forest"
                >
                  {{ forgotSuccess() }}
                </p>
              }

              <button
                type="submit"
                [disabled]="loading()"
                class="eyebrow mt-7 flex w-full items-center justify-center gap-2 bg-primary py-4 text-primary-foreground transition-colors hover:bg-clay disabled:opacity-70"
              >
                @if (loading()) {
                  <svg lucideLoaderCircle class="h-4 w-4 animate-spin"></svg>
                  Sending&hellip;
                } @else {
                  Send reset link
                }
              </button>
            </form>

            <p class="mt-6 text-center text-sm text-muted-foreground">
              <button
                type="button"
                (click)="switchTo('login')"
                class="text-primary hover:underline"
              >
                Back to sign in
              </button>
            </p>
          }
        </div>
      </div>
    }
  `,
})
export class AuthModalComponent {
  protected readonly authModal = inject(AuthModalService);
  private readonly auth = inject(TravellerAuthService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly loading = signal(false);
  protected readonly formError = signal<string | null>(null);
  protected readonly forgotSuccess = signal<string | null>(null);
  protected readonly showLoginPassword = signal(false);
  protected readonly showRegisterPassword = signal(false);

  protected readonly loginForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  protected readonly forgotForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
  });

  protected readonly registerForm = this.fb.nonNullable.group(
    {
      first_name: ['', [Validators.required, Validators.maxLength(100)]],
      last_name: ['', [Validators.required, Validators.maxLength(100)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      password_confirmation: ['', Validators.required],
      accept_terms: [false, Validators.requiredTrue],
      marketing_consent: [false],
    },
    { validators: passwordsMatch },
  );

  constructor() {
    this.destroyRef.onDestroy(() => {
      document.body.style.removeProperty('overflow');
    });

    effect(() => {
      const mode = this.authModal.mode();
      const externalError = this.authModal.error();

      if (!mode) {
        document.body.style.removeProperty('overflow');
        return;
      }

      document.body.style.overflow = 'hidden';
      this.loading.set(false);
      this.formError.set(externalError);
      this.forgotSuccess.set(null);
      this.showLoginPassword.set(false);
      this.showRegisterPassword.set(false);
      this.loginForm.reset({ email: '', password: '' });
      this.forgotForm.reset({ email: '' });
      this.registerForm.reset({
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        password_confirmation: '',
        accept_terms: false,
        marketing_consent: false,
      });
    });
  }

  protected switchTo(mode: AuthModalMode): void {
    this.formError.set(null);
    this.forgotSuccess.set(null);
    this.authModal.switchTo(mode);
    void this.router.navigate(['/'], {
      queryParams: { auth: mode },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  protected close(): void {
    this.authModal.close();
    void this.router.navigate(['/'], {
      queryParams: { auth: null, returnUrl: null, social_error: null },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  /** Close the modal without returning to `/`, so in-modal links can leave the home page. */
  protected goTo(url: string, event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.authModal.close();
    void this.router.navigateByUrl(url);
  }

  protected loginFieldError(control: 'email' | 'password'): boolean {
    const field = this.loginForm.controls[control];
    return field.invalid && field.touched;
  }

  protected registerFieldError(
    control: 'first_name' | 'last_name' | 'email' | 'password',
  ): boolean {
    const field = this.registerForm.controls[control];
    return field.invalid && field.touched;
  }

  protected submitForgot(): void {
    this.formError.set(null);
    this.forgotSuccess.set(null);
    this.forgotForm.markAllAsTouched();

    if (this.forgotForm.invalid || this.loading()) {
      return;
    }

    this.loading.set(true);
    this.auth.forgotPassword(this.forgotForm.getRawValue()).subscribe({
      next: (response) => {
        this.forgotSuccess.set(
          response.message || 'If that email exists, we sent a password reset link.',
        );
        this.loading.set(false);
      },
      error: (error: unknown) => {
        this.formError.set(extractApiError(error, 'Unable to send reset link.'));
        this.loading.set(false);
      },
    });
  }

  protected submitLogin(): void {
    this.formError.set(null);
    this.loginForm.markAllAsTouched();

    if (this.loginForm.invalid || this.loading()) {
      return;
    }

    this.loading.set(true);
    this.auth.login(this.loginForm.getRawValue()).subscribe({
      next: () => {
        const returnUrl = this.authModal.returnUrl() || '/dashboard';
        this.authModal.close();
        void this.router.navigateByUrl(returnUrl);
      },
      error: (error: unknown) => {
        this.formError.set(extractApiError(error, 'Unable to sign in with those credentials.'));
        this.loading.set(false);
      },
    });
  }

  protected submitRegister(): void {
    this.formError.set(null);
    this.registerForm.markAllAsTouched();

    if (this.registerForm.invalid || this.loading()) {
      if (this.registerForm.hasError('passwordMismatch')) {
        this.formError.set('Passwords do not match.');
      }
      return;
    }

    this.loading.set(true);
    const value = this.registerForm.getRawValue();

    this.auth
      .register({
        first_name: value.first_name,
        last_name: value.last_name,
        email: value.email,
        password: value.password,
        password_confirmation: value.password_confirmation,
        accept_terms: value.accept_terms,
        marketing_consent: value.marketing_consent,
      })
      .subscribe({
        next: () => {
          const returnUrl = this.authModal.returnUrl() || '/dashboard';
          this.authModal.close();
          void this.router.navigateByUrl(returnUrl);
        },
        error: (error: unknown) => {
          this.formError.set(extractApiError(error, 'Unable to create your account.'));
          this.loading.set(false);
        },
      });
  }
}
