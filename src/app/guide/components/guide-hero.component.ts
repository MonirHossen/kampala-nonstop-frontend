import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { GuideBreadcrumbComponent, type GuideCrumb } from './guide-breadcrumb.component';

@Component({
  selector: 'kn-guide-hero',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [GuideBreadcrumbComponent],
  template: `
    <section class="relative overflow-hidden bg-ink text-ink-foreground">
      <div class="absolute inset-0">
        <img
          [src]="backgroundImage()"
          alt=""
          class="h-full w-full object-cover object-center"
          aria-hidden="true"
        />
        <div class="absolute inset-0 bg-ink/55" aria-hidden="true"></div>
      </div>

      <div
        class="relative mx-auto flex min-h-[18rem] max-w-[1400px] flex-col items-center justify-center px-5 pb-14 pt-28 text-center sm:min-h-[22rem] sm:px-8 sm:pb-16 sm:pt-32"
      >
        <h1 class="hero-headline max-w-4xl text-ink-foreground">{{ title() }}</h1>
        <div class="mt-6">
          <kn-guide-breadcrumb [crumbs]="crumbs()" tone="light" />
        </div>
      </div>
    </section>
  `,
})
export class GuideHeroComponent {
  readonly crumbs = input.required<GuideCrumb[]>();
  readonly title = input.required<string>();
  readonly backgroundImage = input('/img/title-banner.jpg');
}
