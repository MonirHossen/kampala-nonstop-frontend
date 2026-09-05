import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
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
  selector: 'kn-register-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, RouterLink, LucideEye, LucideEyeOff, LucideLoaderCircle],
  template: `
    <div class="flex min-h-screen items-center justify-center bg-ink px-5 py-16">
      <div class="w-full max-w-md">
        <a routerLink="/" class="font-display text-2xl text-ink-foreground">
          Kampala<span class="text-primary">Nonstop</span>
        </a>
        <p class="eyebrow mt-1 text-ink-foreground/40">Create your traveller account</p>

        <form [formGroup]="form" (ngSubmit)="submit()" novalidate class="mt-8 bg-paper p-7">
          <div class="grid gap-5 sm:grid-cols-2">
            <div>
              <label for="first_name" class="eyebrow block text-muted-foreground">First name</label>
              <input
                id="first_name"
                type="text"
                autocomplete="given-name"
                formControlName="first_name"
                class="mt-2 h-11 w-full border-b bg-transparent outline-none transition-colors"
                [class]="
                  touchedInvalid('first_name')
                    ? 'border-destructive'
                    : 'border-input focus:border-primary'
                "
              />
            </div>
            <div>
              <label for="last_name" class="eyebrow block text-muted-foreground">Last name</label>
              <input
                id="last_name"
                type="text"
                autocomplete="family-name"
                formControlName="last_name"
                class="mt-2 h-11 w-full border-b bg-transparent outline-none transition-colors"
                [class]="
                  touchedInvalid('last_name')
                    ? 'border-destructive'
                    : 'border-input focus:border-primary'
                "
              />
            </div>
          </div>

          <label for="email" class="eyebrow mt-5 block text-muted-foreground">Email</label>
          <input
            id="email"
            type="email"
            autocomplete="email"
            formControlName="email"
            class="mt-2 h-11 w-full border-b bg-transparent outline-none transition-colors"
            [class]="
              touchedInvalid('email') ? 'border-destructive' : 'border-input focus:border-primary'
            "
          />

          <label for="password" class="eyebrow mt-5 block text-muted-foreground">Password</label>
          <div class="relative">
            <input
              id="password"
              [type]="show() ? 'text' : 'password'"
              autocomplete="new-password"
              formControlName="password"
              class="mt-2 h-11 w-full border-b bg-transparent pr-10 outline-none transition-colors"
              [class]="
                touchedInvalid('password')
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
              form.hasError('passwordMismatch') && form.controls.password_confirmation.touched
                ? 'border-destructive'
                : 'border-input focus:border-primary'
            "
          />

          <label class="mt-6 flex items-start gap-3 text-sm text-muted-foreground">
            <input type="checkbox" formControlName="accept_terms" class="mt-1" />
            <span>
              I agree to the
              <a routerLink="/terms" class="text-primary hover:underline">Terms</a>
              and
              <a routerLink="/privacy" class="text-primary hover:underline">Privacy Policy</a>
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
        </form>

        <p class="mt-6 text-center text-sm text-ink-foreground/50">
          Already registered?
          <a routerLink="/login" class="text-primary hover:underline">Sign in</a>
        </p>
      </div>
    </div>
  `,
})
export class RegisterPage {
  private readonly auth = inject(TravellerAuthService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  protected readonly loading = signal(false);
  protected readonly formError = signal<string | null>(null);
  protected readonly show = signal(false);

  protected readonly form = this.fb.nonNullable.group(
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

  protected touchedInvalid(
    control: 'first_name' | 'last_name' | 'email' | 'password',
  ): boolean {
    const field = this.form.controls[control];
    return field.invalid && field.touched;
  }

  protected submit(): void {
    this.formError.set(null);
    this.form.markAllAsTouched();

    if (this.form.invalid || this.loading()) {
      if (this.form.hasError('passwordMismatch')) {
        this.formError.set('Passwords do not match.');
      }
      return;
    }

    this.loading.set(true);
    const value = this.form.getRawValue();

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
        next: () => void this.router.navigateByUrl('/dashboard'),
        error: (error: unknown) => {
          this.formError.set(extractApiError(error, 'Unable to create your account.'));
          this.loading.set(false);
        },
      });
  }
}
