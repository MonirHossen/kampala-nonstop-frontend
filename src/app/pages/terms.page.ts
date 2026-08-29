import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PageShellComponent } from '../site/page-shell.component';

@Component({
  selector: 'kn-terms-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PageShellComponent],
  template: `
    <kn-page-shell eyebrow="Terms" title="Terms of use.">
      <p>
        This website is a pre-launch page for Kampala Nonstop, based in Kampala, Uganda. Joining the
        waitlist registers your interest; it does not create a booking, reservation or contract for
        travel services.
      </p>
      <p>
        Please submit accurate details. We may remove duplicate or clearly invalid registrations.
        Waitlist placement does not guarantee availability or pricing when we launch.
      </p>
      <p>
        All text, photography and brand marks on this site belong to Kampala Nonstop and may not be
        reused without permission.
      </p>
      <p>These terms may be updated before launch. The version on this page is the current one.</p>
    </kn-page-shell>
  `,
})
export class TermsPage {}
