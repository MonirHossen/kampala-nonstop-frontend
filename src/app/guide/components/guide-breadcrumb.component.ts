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
    <nav aria-label="Breadcrumb" class="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
      @for (crumb of crumbs(); track $index; let last = $last) {
        @if (!last && crumb.link) {
          <a
            [routerLink]="crumb.link"
            class="text-muted-foreground transition-colors hover:text-primary"
          >
            {{ crumb.label }}
          </a>
          <span class="text-hairline" aria-hidden="true">/</span>
        } @else {
          <span [attr.aria-current]="last ? 'page' : null" class="text-foreground">
            {{ crumb.label }}
          </span>
          @if (!last) {
            <span class="text-hairline" aria-hidden="true">/</span>
          }
        }
      }
    </nav>
  `,
})
export class GuideBreadcrumbComponent {
  readonly crumbs = input.required<GuideCrumb[]>();
}
