import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { SettingsStore } from '../core/services/settings.store';
import { PageShellComponent } from '../site/page-shell.component';

@Component({
  selector: 'kn-contact-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PageShellComponent],
  template: `
    <kn-page-shell eyebrow="Contact" title="Talk to us.">
      <p>
        Partnerships, local hosts, press or a question about your waitlist registration — write to
        us and a person in Kampala will reply.
      </p>
      <p>
        <a
          [href]="'mailto:' + settings.contactEmail()"
          class="text-primary underline-offset-4 hover:underline"
        >
          {{ settings.contactEmail() }}
        </a>
      </p>
      <p class="text-sm">Kampala, Uganda &middot; Mon–Sat, 9:00–18:00 EAT</p>
    </kn-page-shell>
  `,
})
export class ContactPage implements OnInit {
  protected readonly settings = inject(SettingsStore);

  ngOnInit(): void {
    void this.settings.load();
  }
}
