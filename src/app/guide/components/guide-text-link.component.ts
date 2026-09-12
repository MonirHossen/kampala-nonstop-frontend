import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { LucideExternalLink, LucideLink } from '@lucide/angular';

@Component({
  selector: 'a[knGuideLink]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LucideLink, LucideExternalLink],
  host: {
    class:
      'group/link inline-flex items-center gap-1.5 font-semibold text-primary underline decoration-primary/40 underline-offset-4 transition-colors hover:decoration-primary',
  },
  template: `
    <ng-content />
    @if (external()) {
      <svg lucideExternalLink class="h-3.5 w-3.5 shrink-0 opacity-80" aria-hidden="true"></svg>
    } @else {
      <svg lucideLink class="h-3.5 w-3.5 shrink-0 opacity-80" aria-hidden="true"></svg>
    }
  `,
})
export class GuideTextLinkComponent {
  readonly external = input(false);
}
