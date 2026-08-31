import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  ReactiveFormsModule,
  Validators,
  type AbstractControl,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { LucideArrowRight, LucideLoaderCircle } from '@lucide/angular';
import {
  WaitlistApiService,
  type WaitlistInviterSession,
} from '../core/services/waitlist-api.service';
import { DEFAULT_WAITLIST_SOURCE } from '../core/lib/tracking';
import { SettingsStore } from '../core/services/settings.store';
import { SiteFooterComponent } from '../site/site-footer.component';
import { SiteHeaderComponent } from '../site/site-header.component';
import { RevealDirective } from '../shared/reveal.directive';

@Component({
  selector: 'kn-waitlist-invite-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    SiteHeaderComponent,
    SiteFooterComponent,
    ReactiveFormsModule,
    RouterLink,
    RevealDirective,
    LucideArrowRight,
    LucideLoaderCircle,
  ],
  template: `
    <div class="bg-background">
      <kn-site-header />
      <main>
        <section class="bg-ink">
          <div class="mx-auto max-w-[1400px] px-5 py-20 sm:px-8 sm:py-28">
            <div knReveal class="mx-auto max-w-2xl bg-paper p-6 sm:p-10 lg:p-12">
              @if (!inviter()) {
                <p class="eyebrow text-clay">Almost there</p>
                <h1 class="display-lg mt-4 text-foreground">Join the waitlist first</h1>
                <p class="mt-4 text-muted-foreground">
                  Register yourself, then you can invite friends from this page.
                </p>
                <a
                  routerLink="/waitlist/join"
                  [queryParams]="{ source: defaultSource }"
                  class="eyebrow mt-8 inline-flex items-center gap-2 bg-primary px-8 py-4 text-primary-foreground"
                >
                  Join the Waitlist
                  <svg lucideArrowRight class="h-4 w-4"></svg>
                </a>
              } @else {
                <p class="eyebrow text-primary">Waitlist confirmed</p>
                <h1 class="display-lg mt-4 text-foreground">Thank you.</h1>
                <p class="mt-4 max-w-md text-[1.02rem] leading-relaxed text-muted-foreground">
                  You're on the list, {{ inviter()!.firstName }}. Invite a friend to join —
                  and enter to win a return flight to Uganda.
                </p>

                <form
                  class="mt-10 border-t border-hairline pt-8"
                  [formGroup]="form"
                  (ngSubmit)="onSubmit()"
                  novalidate
                >
                  <input type="hidden" [value]="inviter()!.id" name="inviter_id" />
                  <input type="hidden" [value]="inviter()!.firstName" name="inviter_first_name" />
                  <input type="hidden" [value]="inviter()!.surname" name="inviter_surname" />
                  <input type="hidden" [value]="inviter()!.email" name="inviter_email" />

                  <label for="inviteeEmail" class="eyebrow block text-muted-foreground">
                    Friend's email address
                  </label>
                  <div class="mt-2">
                    <input
                      id="inviteeEmail"
                      type="email"
                      inputmode="email"
                      formControlName="inviteeEmail"
                      autocomplete="email"
                      maxlength="255"
                      placeholder="friend@example.com"
                      [class]="inputClass(form.controls.inviteeEmail)"
                    />
                  </div>
                  @if (errorFor(form.controls.inviteeEmail); as message) {
                    <p class="mt-2 text-xs text-destructive" role="alert">{{ message }}</p>
                  }

                  @if (formError()) {
                    <p
                      role="alert"
                      class="mt-6 border-l-2 border-destructive bg-destructive/5 px-4 py-3 text-sm text-destructive"
                    >
                      {{ formError() }}
                    </p>
                  }

                  @if (successMessage()) {
                    <p
                      role="status"
                      class="mt-6 border-l-2 border-primary bg-primary/5 px-4 py-3 text-sm text-foreground"
                    >
                      {{ successMessage() }}
                    </p>
                  }

                  <button
                    type="submit"
                    [disabled]="status() === 'loading'"
                    class="eyebrow mt-8 flex w-full items-center justify-center gap-2.5 bg-primary px-8 py-5 text-primary-foreground transition-all duration-300 hover:bg-clay disabled:opacity-70"
                  >
                    @if (status() === 'loading') {
                      <svg lucideLoaderCircle class="h-4 w-4 animate-spin"></svg>
                      Sending&hellip;
                    } @else {
                      Send invitation
                      <svg lucideArrowRight class="h-4 w-4"></svg>
                    }
                  </button>
                </form>
              }
            </div>
          </div>
        </section>
      </main>
      <kn-site-footer [settings]="settings.settings()" />
    </div>
  `,
})
export class WaitlistInvitePage implements OnInit {
  private readonly waitlistApi = inject(WaitlistApiService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  protected readonly settings = inject(SettingsStore);

  protected readonly defaultSource = DEFAULT_WAITLIST_SOURCE;
  protected readonly inviter = signal<WaitlistInviterSession | null>(null);
  protected readonly status = signal<'idle' | 'loading'>('idle');
  protected readonly formError = signal<string | null>(null);
  protected readonly successMessage = signal<string | null>(null);

  protected readonly form = this.fb.nonNullable.group({
    inviteeEmail: ['', [Validators.required, Validators.email, Validators.maxLength(255)]],
  });

  constructor() {
    const nav = this.router.getCurrentNavigation();
    const stateInviter = (nav?.extras.state?.['inviter'] ??
      (typeof history !== 'undefined' ? history.state?.['inviter'] : null)) as
      | WaitlistInviterSession
      | undefined;

    this.inviter.set(stateInviter ?? this.waitlistApi.readInviter());
  }

  ngOnInit(): void {
    void this.settings.load();
  }

  protected async onSubmit(): Promise<void> {
    const current = this.inviter();
    if (!current || this.status() === 'loading') return;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const email = this.form.controls.inviteeEmail.getRawValue().trim().toLowerCase();
    this.formError.set(null);
    this.successMessage.set(null);
    this.status.set('loading');

    try {
      await this.waitlistApi.invite(current.id, email);
      this.successMessage.set(`Invitation sent to ${email}. Invite another friend below.`);
      this.form.reset({ inviteeEmail: '' });
      this.status.set('idle');
    } catch {
      this.status.set('idle');
      this.formError.set("We couldn't send that invitation just now. Please try again.");
    }
  }

  protected inputClass(control: AbstractControl): string {
    const base =
      'h-13 w-full border-b bg-transparent py-3 text-[1rem] outline-none transition-colors placeholder:text-muted-foreground/60';
    return control.invalid && (control.touched || control.dirty)
      ? `${base} border-destructive`
      : `${base} border-input focus:border-primary hover:border-foreground`;
  }

  protected errorFor(control: FormControl<string>): string | null {
    if (!(control.invalid && (control.touched || control.dirty))) return null;
    if (control.hasError('required')) return "Please enter your friend's email";
    if (control.hasError('email')) return 'Enter a valid email address';
    return null;
  }
}
