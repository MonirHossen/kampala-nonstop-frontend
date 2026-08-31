import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { WaitlistApiService } from '../core/services/waitlist-api.service';
import { RevealDirective } from '../shared/reveal.directive';

type Tile = {
  code: string;
  label: string;
  copy: string;
  image?: string;
  alt?: string;
  index: string;
};

/** Landing showcase visuals — keyed by interest code. `other` is form-only. */
const TILE_MEDIA: Record<string, Pick<Tile, 'image' | 'alt'>> = {
  food_local_life: {
    image: '/img/cat-food.jpg',
    alt: 'Chapati rolex cooking on a roadside grill in Kampala',
  },
  music_nightlife_entertainment: {
    image: '/img/cat-nightlife.jpg',
    alt: 'Crowd dancing under string lights at a Kampala open-air bar',
  },
  culture_heritage: {
    image: '/img/cat-culture.jpg',
    alt: 'Ugandan drummers performing in traditional dress',
  },
  nature_wildlife: {
    image: '/img/cat-nature.jpg',
    alt: 'Crested cranes in misty Ugandan hills at sunrise',
  },
  adventure_outdoors: {
    image: '/img/cat-adventure.jpg',
    alt: 'Rafters paddling white water on the Nile in Uganda',
  },
  events_festivals: {
    image: '/img/cat-events.jpg',
    alt: 'Hands raised in a crowd at a Kampala music festival at dusk',
  },
  wellness_relaxation: {
    image: '/img/cat-wellness.jpg',
    alt: 'A hammock in palm shade beside Lake Victoria',
  },
};

@Component({
  selector: 'kn-categories-section',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RevealDirective],
  template: `
    <section id="experiences" class="relative overflow-hidden bg-paper">
      <div
        class="pointer-events-none absolute inset-0 opacity-[0.55]"
        style="background:
          radial-gradient(ellipse 70% 50% at 0% 0%, color-mix(in oklch, var(--sand) 70%, transparent), transparent 55%),
          radial-gradient(ellipse 55% 45% at 100% 100%, color-mix(in oklch, var(--primary) 12%, transparent), transparent 50%);"
      ></div>

      <div class="relative mx-auto max-w-[1400px] px-5 py-20 sm:px-8 sm:py-28">
        <div knReveal class="max-w-2xl">
          <div class="flex items-center gap-3">
            <span class="h-px w-10 bg-primary"></span>
            <p class="eyebrow text-clay">What you'll discover</p>
          </div>
          <h2 class="display-lg mt-5 text-foreground">Kampala, by how you want to feel it.</h2>
          <p class="lede mt-5 max-w-xl">
            Culture, food, nightlife, nature and more — pick what pulls you in, and we shape the trip
            around it.
          </p>
        </div>

        @if (tiles().length > 0) {
          <ul
            class="mt-14 grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-8 lg:gap-y-16"
          >
            @for (tile of tiles(); track tile.code; let i = $index) {
              <li [knReveal]="80 + i * 70" class="group">
                <article class="flex h-full flex-col">
                  <div class="relative aspect-[4/5] overflow-hidden bg-ink">
                    @if (tile.image) {
                      <img
                        [src]="tile.image"
                        [alt]="tile.alt ?? tile.label"
                        loading="lazy"
                        width="800"
                        height="1000"
                        class="h-full w-full object-cover transition-transform duration-[1100ms] ease-out group-hover:scale-[1.04]"
                      />
                      <div
                        class="absolute inset-0 bg-gradient-to-t from-ink/35 via-transparent to-transparent opacity-80 transition-opacity duration-500 group-hover:opacity-50"
                      ></div>
                    } @else {
                      <div
                        class="absolute inset-0 flex items-end bg-gradient-to-br from-ink via-clay to-primary/80 p-6"
                        aria-hidden="true"
                      >
                        <span
                          class="font-display text-4xl leading-none text-ink-foreground/25 sm:text-5xl"
                        >
                          {{ tile.label }}
                        </span>
                      </div>
                    }
                    <span
                      class="absolute left-4 top-4 font-display text-sm tracking-[0.18em] text-ink-foreground/90"
                    >
                      {{ tile.index }}
                    </span>
                  </div>

                  <div class="mt-5 flex flex-1 flex-col border-t border-hairline pt-4">
                    <h3 class="font-display text-[1.35rem] leading-tight text-foreground sm:text-[1.5rem]">
                      {{ tile.label }}
                    </h3>
                    @if (tile.copy) {
                      <p class="mt-2 text-[0.95rem] leading-relaxed text-muted-foreground">
                        {{ tile.copy }}
                      </p>
                    }
                  </div>
                </article>
              </li>
            }
          </ul>
        }
      </div>
    </section>
  `,
})
export class CategoriesSectionComponent implements OnInit {
  private readonly waitlistApi = inject(WaitlistApiService);

  protected readonly tiles = signal<Tile[]>([]);

  ngOnInit(): void {
    void this.load();
  }

  private async load(): Promise<void> {
    try {
      const interests = await this.waitlistApi.listInterestTypes();
      // Landing showcase: photographed experiences only (`other` / text-only stay on the form).
      const showcase = interests.filter((interest) => Boolean(TILE_MEDIA[interest.code]?.image));

      this.tiles.set(
        showcase.map((interest, index) => {
          const media = TILE_MEDIA[interest.code]!;
          return {
            code: interest.code,
            label: interest.name,
            copy: interest.description?.trim() || '',
            index: String(index + 1).padStart(2, '0'),
            ...media,
          };
        }),
      );
    } catch {
      this.tiles.set([]);
    }
  }
}
