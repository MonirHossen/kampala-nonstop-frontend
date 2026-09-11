import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

export type GuideCrumb = {
  label: string;
  link?: string | string[];
};

@Component({
  selector: 'kn-guide-breadcrumb',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <nav
      aria-label="Breadcrumb"
      class="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-sm"
    >
      @for (crumb of crumbs(); track $index; let last = $last) {
        @if (!last && crumb.link) {
          <a [routerLink]="crumb.link" [class]="linkClass()">
            {{ crumb.label }}
          </a>
          <span [class]="sepClass()" aria-hidden="true">/</span>
        } @else {
          <span [attr.aria-current]="last ? 'page' : null" [class]="currentClass()">
            {{ crumb.label }}
          </span>
          @if (!last) {
            <span [class]="sepClass()" aria-hidden="true">/</span>
          }
        }
      }
    </nav>
  `,
})
export class GuideBreadcrumbComponent {
  readonly crumbs = input.required<GuideCrumb[]>();
  readonly tone = input<'light' | 'dark'>('dark');

  protected linkClass(): string {
    return this.tone() === 'light'
      ? 'text-ink-foreground underline decoration-ink-foreground/45 underline-offset-4 transition-colors hover:text-primary'
      : 'text-muted-foreground transition-colors hover:text-primary';
  }

  protected currentClass(): string {
    return this.tone() === 'light' ? 'text-ink-foreground' : 'text-foreground';
  }

  protected sepClass(): string {
    return this.tone() === 'light' ? 'text-ink-foreground/45' : 'text-hairline';
  }
}
