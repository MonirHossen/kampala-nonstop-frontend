import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Params, RouterLink } from '@angular/router';

export type GuideCrumb = {
  label: string;
  link?: string | string[];
  queryParams?: Params;
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
          <a [routerLink]="crumb.link" [queryParams]="crumb.queryParams" [class]="linkClass()">
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
      ? 'text-white underline decoration-white/45 underline-offset-4 transition-colors hover:text-primary'
      : 'text-muted-foreground transition-colors hover:text-primary';
  }

  protected currentClass(): string {
    return this.tone() === 'light' ? 'text-white' : 'text-foreground';
  }

  protected sepClass(): string {
    return this.tone() === 'light' ? 'text-white/45' : 'text-hairline';
  }
}
