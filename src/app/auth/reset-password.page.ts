import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { LucideEye, LucideEyeOff, LucideLoaderCircle } from '@lucide/angular';
import { extractApiError } from '../core/lib/api-error';
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
  selector: 'kn-reset-password-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, RouterLink, LucideEye, LucideEyeOff, LucideLoaderCircle],
  template: `
    <div class="flex min-h-screen items-center justify-center bg-ink px-5 py-16">
      <div class="w-full max-w-sm">
        <a routerLink="/" class="font-display text-2xl text-ink-foreground">
          Kampala<span class="text-primary">Nonstop</span>
        </a>
        <p class="eyebrow mt-1 text-ink-foreground/40">Choose a new password</p>

        <form [formGroup]="form" (ngSubmit)="submit()" novalidate class="mt-8 bg-paper p-7">
          <input type="hidden" formControlName="token" />

          <label for="email" class="eyebrow block text-muted-foreground">Email</label>
          <input
            id="email"
            type="email"
            autocomplete="email"
            formControlName="email"
            class="mt-2 h-11 w-full border-b bg-transparent outline-none transition-colors"
            [class]="
              showControlError('email')
                ? 'border-destructive'
                : 'border-input focus:border-primary'
            "
          />

          <label for="password" class="eyebrow mt-5 block text-muted-foreground">New password</label>
          <div class="relative">
            <input
              id="password"
              [type]="show() ? 'text' : 'password'"
              autocomplete="new-password"
              formControlName="password"
              class="mt-2 h-11 w-full border-b bg-transparent pr-10 outline-none transition-colors"
              [class]="
                showControlError('password')
                  ? 'border-destructive'
                  : 'border-input focus:border-primary'
              "
            />
            <button
              type="button"
              (click)="show.set(!show())"
              class="absolute right-0 top-3.5 text-muted-foreground hover:text-foreground"
              [attr.aria-label]="show() ? 'Hide password' : 'Show password'"
            >
              @if (show()) {
                <svg lucideEyeOff class="h-4 w-4"></svg>
              } @else {
                <svg lucideEye class="h-4 w-4"></svg>
              }
            </button>
          </div>

          <label for="password_confirmation" class="eyebrow mt-5 block text-muted-foreground"
            >Confirm password</label
          >
          <input
            id="password_confirmation"
            [type]="show() ? 'text' : 'password'"
            autocomplete="new-password"
            formControlName="password_confirmation"
            class="mt-2 h-11 w-full border-b bg-transparent outline-none transition-colors"
            [class]="
              showControlError('password_confirmation') || form.hasError('passwordMismatch')
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
              @if (needsNewLink()) {
                <a routerLink="/forgot-password" class="ml-1 underline">Request a new link</a>
              }
            </p>
          }

          @if (success()) {
            <p
              role="status"
              class="mt-5 border-l-2 border-forest bg-forest/5 px-3 py-2.5 text-xs text-forest"
            >
              {{ success() }}
            </p>
          }

          <button
            type="submit"
            [disabled]="loading() || !!success()"
            class="eyebrow mt-7 flex w-full items-center justify-center gap-2 bg-primary py-4 text-primary-foreground transition-colors hover:bg-clay disabled:opacity-70"
          >
            @if (loading()) {
              <svg lucideLoaderCircle class="h-4 w-4 animate-spin"></svg>
              Updating&hellip;
            } @else {
              Update password
            }
          </button>
        </form>

        <p class="mt-6 text-center text-sm text-ink-foreground/50">
          <a routerLink="/login" class="text-primary hover:underline">Back to sign in</a>
        </p>
      </div>
    </div>
  `,
})
export class ResetPasswordPage implements OnInit {
  private readonly auth = inject(TravellerAuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  protected readonly loading = signal(false);
  protected readonly formError = signal<string | null>(null);
  protected readonly success = signal<string | null>(null);
  protected readonly needsNewLink = signal(false);
  protected readonly show = signal(false);

  protected readonly form = this.fb.nonNullable.group(
    {
      email: ['', [Validators.required, Validators.email]],
      token: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(8)]],
      password_confirmation: ['', Validators.required],
    },
    { validators: passwordsMatch },
  );

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((params) => {
      const email = this.decodeParam(params.get('email'));
      const token = this.decodeParam(params.get('token'));

      this.form.patchValue({ email, token });

      if (!email || !token) {
        this.needsNewLink.set(true);
        this.formError.set('This reset link is invalid or incomplete.');
      } else {
        this.needsNewLink.set(false);
        this.formError.set(null);
      }
    });
  }

  protected showControlError(
    control: 'email' | 'password' | 'password_confirmation',
  ): boolean {
    const field = this.form.controls[control];
    return field.invalid && field.touched;
  }

  protected submit(): void {
    this.success.set(null);
    this.form.markAllAsTouched();

    if (this.loading() || this.success()) {
      return;
    }

    if (!this.form.controls.token.value) {
      this.needsNewLink.set(true);
      this.formError.set('This reset link is invalid or incomplete.');
      return;
    }

    if (this.form.hasError('passwordMismatch')) {
      this.needsNewLink.set(false);
      this.formError.set('Passwords do not match.');
      return;
    }

    if (this.form.invalid) {
      this.needsNewLink.set(false);
      this.formError.set('Please fill in all fields with a valid password (min. 8 characters).');
      return;
    }

    this.formError.set(null);
    this.needsNewLink.set(false);
    this.loading.set(true);

    this.auth.resetPassword(this.form.getRawValue()).subscribe({
      next: (response) => {
        this.success.set(response.message || 'Password updated. You can sign in now.');
        this.loading.set(false);
        setTimeout(() => void this.router.navigateByUrl('/login'), 2000);
      },
      error: (error: unknown) => {
        this.needsNewLink.set(true);
        this.formError.set(extractApiError(error, 'Unable to reset password.'));
        this.loading.set(false);
      },
    });
  }

  private decodeParam(value: string | null): string {
    if (!value) {
      return '';
    }

    try {
      return decodeURIComponent(value.replace(/\+/g, '%20'));
    } catch {
      return value;
    }
  }
}
