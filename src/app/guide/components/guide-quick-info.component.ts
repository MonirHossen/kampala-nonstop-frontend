import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { GuideEssential } from '../guide.models';

@Component({
  selector: 'kn-guide-quick-info',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block lg:sticky lg:top-24 lg:self-start' },
  template: `
    <aside class="overflow-hidden rounded-2xl border border-hairline bg-paper">
      <header class="relative overflow-hidden">
        <img
          src="/img/uganda/uganda-map.svg"
          alt=""
          class="absolute inset-0 h-full w-full object-cover"
          aria-hidden="true"
          loading="lazy"
        />
        <span class="absolute inset-0 bg-ink/72" aria-hidden="true"></span>
        <span
          class="pointer-events-none absolute -right-1 -top-3 font-display text-[4.5rem] leading-none text-ink-foreground/[0.12]"
          aria-hidden="true"
        >
          {{ countryCode() }}
        </span>

        <h2 class="relative px-5 pb-6 pt-24 font-display text-xl leading-snug text-ink-foreground sm:text-[1.35rem]">
          {{ countryName() }} at a glance
        </h2>
      </header>

      @if (essentials().length > 0) {
        <dl class="divide-y divide-hairline">
          @for (item of essentials(); track item.id) {
            <div
              class="group grid grid-cols-[6.75rem_1fr] gap-4 px-5 py-3 transition-colors hover:bg-sand/45"
            >
              <dt
                class="text-[0.62rem] font-bold uppercase leading-[1.45] tracking-[0.15em] text-muted-foreground transition-colors group-hover:text-clay"
              >
                {{ item.name }}
              </dt>
              <dd class="text-[0.875rem] leading-snug text-foreground">{{ item.value_text }}</dd>
            </div>
          }
        </dl>
      } @else {
        <p class="px-5 py-6 text-sm text-muted-foreground">No quick facts published yet.</p>
      }
    </aside>
  `,
})
export class GuideQuickInfoComponent {
  readonly essentials = input<GuideEssential[]>([]);
  readonly countryName = input('Uganda');
  readonly countryCode = input('UG');
}
