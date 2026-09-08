import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RevealDirective } from '../../shared/reveal.directive';
import { GuideBreadcrumbComponent, type GuideCrumb } from './guide-breadcrumb.component';

@Component({
  selector: 'kn-guide-hero',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [GuideBreadcrumbComponent, RevealDirective],
  template: `
    <section class="relative overflow-hidden bg-ink text-ink-foreground">
      <div class="absolute inset-0">
        <img
          [src]="backgroundImage()"
          alt=""
          class="h-full w-full object-cover opacity-55 drift"
          aria-hidden="true"
        />
        <div
          class="absolute inset-0 bg-gradient-to-t from-ink via-ink/70 to-ink/35"
          aria-hidden="true"
        ></div>
      </div>

      <div class="relative mx-auto max-w-[1400px] px-5 pb-16 pt-28 sm:px-8 sm:pb-20 sm:pt-36">
        <div knReveal>
          <kn-guide-breadcrumb [crumbs]="crumbs()" />
          <p class="eyebrow mt-8 text-primary">{{ eyebrow() }}</p>
          <h1 class="display-lg mt-4 max-w-3xl text-ink-foreground">{{ title() }}</h1>
          @if (lede(); as text) {
            <p class="lede mt-5 max-w-2xl text-ink-foreground/75">{{ text }}</p>
          }
        </div>
      </div>
    </section>
  `,
})
export class GuideHeroComponent {
  readonly crumbs = input.required<GuideCrumb[]>();
  readonly eyebrow = input('Country guide');
  readonly title = input.required<string>();
  readonly lede = input<string | null>(null);
  readonly backgroundImage = input('/img/hero_nature_desktop.jpg');
}
