import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PageShellComponent } from '../site/page-shell.component';

@Component({
  selector: 'kn-about-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PageShellComponent],
  template: `
    <kn-page-shell eyebrow="About" title="Built in Kampala, for Kampala.">
      <p>
        Kampala Nonstop started with a simple frustration: the city we love is described to visitors
        in five places and three clichés. Meanwhile the best plate of food, the best live band and
        the best view of the hills are usually somewhere no listicle mentions.
      </p>
      <p>
        We are building a travel service that plans around people, not packages — personalised trip
        planning, local experiences, nightlife, food, culture, nature and adventure across Kampala
        and Uganda, curated with local hosts who actually live it.
      </p>
      <p class="text-foreground">
        We're launching soon. Joining the waitlist tells us what you love, and shapes what we open
        with.
      </p>
    </kn-page-shell>
  `,
})
export class AboutPage {}
