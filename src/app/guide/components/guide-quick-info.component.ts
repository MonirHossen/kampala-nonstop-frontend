import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { GuideEssential } from '../guide.models';

@Component({
  selector: 'kn-guide-quick-info',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block lg:sticky lg:top-24 lg:self-start' },
  template: `
    <aside class="overflow-hidden rounded-xl border border-hairline bg-paper">
      <header
        class="relative overflow-hidden bg-gradient-to-br from-ink via-ink to-clay px-5 py-5 text-ink-foreground"
      >
        <span
          class="pointer-events-none absolute -right-1 -top-3 font-display text-[4.5rem] leading-none text-ink-foreground/[0.07]"
          aria-hidden="true"
        >
          {{ countryCode() }}
        </span>

        <p class="eyebrow text-primary">At a glance</p>
        <h2 class="mt-1.5 font-display text-[1.75rem] leading-none">{{ countryName() }}</h2>
        <p class="mt-2.5 text-[0.78rem] text-ink-foreground/50">{{ summaryLine() }}</p>
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

  protected readonly summaryLine = computed(() => {
    const count = this.essentials().length;
    return `${count} ${count === 1 ? 'essential' : 'essentials'}`;
  });
}
