import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { LucideLoaderCircle } from '@lucide/angular';
import { extractApiError } from '../core/lib/api-error';
import { TravellerAuthService } from '../core/services/traveller-auth.service';

@Component({
  selector: 'kn-forgot-password-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, RouterLink, LucideLoaderCircle],
  template: `
    <div class="flex min-h-screen items-center justify-center bg-ink px-5 py-16">
      <div class="w-full max-w-sm">
        <a routerLink="/" class="font-display text-2xl text-ink-foreground">
          Kampala<span class="text-primary">Nonstop</span>
        </a>
        <p class="eyebrow mt-1 text-ink-foreground/40">Reset your password</p>

        <form [formGroup]="form" (ngSubmit)="submit()" novalidate class="mt-8 bg-paper p-7">
          <p class="text-sm text-muted-foreground">
            Enter your email and we will send a reset link if an account exists.
          </p>

          <label for="email" class="eyebrow mt-6 block text-muted-foreground">Email</label>
          <input
            id="email"
            type="email"
            autocomplete="email"
            formControlName="email"
            class="mt-2 h-11 w-full border-b bg-transparent outline-none transition-colors"
            [class]="
              form.controls.email.invalid && form.controls.email.touched
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

        <p class="mt-6 text-center text-sm text-ink-foreground/50">
          <a routerLink="/login" class="text-primary hover:underline">Back to sign in</a>
        </p>
      </div>
    </div>
  `,
})
export class ForgotPasswordPage {
  private readonly auth = inject(TravellerAuthService);
  private readonly fb = inject(FormBuilder);

  protected readonly loading = signal(false);
  protected readonly formError = signal<string | null>(null);
  protected readonly success = signal<string | null>(null);

  protected readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
  });

  protected submit(): void {
    this.formError.set(null);
    this.success.set(null);
    this.form.markAllAsTouched();

    if (this.form.invalid || this.loading()) {
      return;
    }

    this.loading.set(true);
    this.auth.forgotPassword(this.form.getRawValue()).subscribe({
      next: (response) => {
        this.success.set(
          response.message ||
            'If that email exists, we sent a password reset link.',
        );
        this.loading.set(false);
      },
      error: (error: unknown) => {
        this.formError.set(extractApiError(error, 'Unable to send reset link.'));
        this.loading.set(false);
      },
    });
  }
}
