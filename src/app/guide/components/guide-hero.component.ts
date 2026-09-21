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
        class="relative mx-auto flex max-w-[1400px] flex-col items-center justify-center px-5 text-center sm:px-8"
        [class]="compact() ? 'min-h-[180px] py-6' : 'min-h-[18rem] pb-14 pt-28 sm:min-h-[22rem] sm:pb-16 sm:pt-32'"
      >
        <h1 class="max-w-4xl text-ink-foreground" [class]="compact() ? 'font-display text-3xl sm:text-4xl' : 'hero-headline'">{{ title() }}</h1>
        <div class="mt-6 w-full">
          @if (showBreadcrumbs()) {
            <kn-guide-breadcrumb [crumbs]="crumbs()" tone="light" />
          }
          <ng-content />
        </div>
      </div>
    </section>
  `,
})
export class GuideHeroComponent {
  readonly crumbs = input.required<GuideCrumb[]>();
  readonly compact = input(false);
  readonly showBreadcrumbs = input(true);
  readonly title = input.required<string>();
  readonly backgroundImage = input('/img/guide/uganda-skyline.jpg');
}
