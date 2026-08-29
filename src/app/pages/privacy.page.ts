import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PageShellComponent } from '../site/page-shell.component';

@Component({
  selector: 'kn-privacy-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PageShellComponent],
  template: `
    <kn-page-shell eyebrow="Privacy" title="Your data, plainly explained.">
      <h2 class="font-display pt-4 text-2xl text-foreground">What we collect</h2>
      <p>
        When you join the waitlist we store your first name, surname, email address, country and the
        experience interests you select, plus whether you agreed to receive marketing updates.
      </p>
      <h2 class="font-display pt-4 text-2xl text-foreground">Campaign information</h2>
      <p>
        We also record limited technical context about how you reached the page — the referring
        website, the landing page address and any campaign parameters in the link. This helps us
        understand which channels bring people to Kampala Nonstop. It is never shown publicly.
      </p>
      <h2 class="font-display pt-4 text-2xl text-foreground">How we use it</h2>
      <p>
        To tell you when Kampala Nonstop launches, and to shape our first experiences around what
        waitlist members care about. We do not sell your data.
      </p>
      <h2 class="font-display pt-4 text-2xl text-foreground">Your choices</h2>
      <p>
        You can unsubscribe from updates at any time, and you can ask us to delete your registration
        by writing to our contact address.
      </p>
    </kn-page-shell>
  `,
})
export class PrivacyPage {}
