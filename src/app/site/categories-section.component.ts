import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RevealDirective } from '../shared/reveal.directive';
type Tile = {
  label: string;
  copy: string;
  image?: string;
  alt?: string;
  /** Intrinsic size of `image`, so the browser reserves the right ratio. */
  width?: number;
  height_px?: number;
  span: string;
  height: string;
};

@Component({
  selector: 'kn-categories-section',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RevealDirective],
  template: `
    <section id="experiences" class="bg-sand/45">
      <div class="mx-auto max-w-[1400px] px-5 py-20 sm:px-8 sm:py-28">
        <div knReveal>
          <div class="flex items-center gap-3">
            <span class="h-px w-10 bg-primary"></span>
            <p class="eyebrow text-clay">What you'll discover</p>
          </div>
          <h2 class="display-lg mt-5 max-w-xl text-foreground">Nine ways to fall for the city.</h2>
        </div>

        <ul class="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-8 sm:gap-5 lg:grid-cols-12">
          @for (tile of tiles; track tile.label; let i = $index) {
            <li
              [knReveal]="i * 55"
              class="group relative overflow-hidden bg-ink"
              [class]="tile.span + ' ' + tile.height"
            >
              @if (tile.image) {
                <img
                  [src]="tile.image"
                  [alt]="tile.alt ?? tile.label"
                  loading="lazy"
                  [width]="tile.width ?? 1024"
                  [height]="tile.height_px ?? 1280"
                  class="h-full w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-105"
                />
                <div
                  class="absolute inset-0 bg-gradient-to-t from-ink/88 via-ink/25 to-transparent"
                ></div>
              } @else {
                <div class="absolute inset-0 bg-clay/90"></div>
              }
              <div class="absolute inset-0 flex flex-col justify-end p-5 sm:p-6">
                <h3 class="font-display text-xl leading-tight text-ink-foreground sm:text-[1.6rem]">
                  {{ tile.label }}
                </h3>
                <p class="mt-2 max-w-xs text-[0.86rem] leading-relaxed text-ink-foreground/70">
                  {{ tile.copy }}
                </p>
              </div>
            </li>
          }

        </ul>
      </div>
    </section>
  `,
})
export class CategoriesSectionComponent {
  protected readonly tiles: Tile[] = [
    {
      label: 'Food & Local Life',
      copy: 'Rolex stands, fish at the landing site, kitchens with no signage.',
      image: '/img/cat-food.jpg',
      alt: 'Chapati rolex cooking on a roadside grill in Kampala',
      span: 'sm:col-span-4 lg:col-span-5',
      height: 'h-[58vw] sm:h-[46vw] lg:h-[30rem]',
    },
    {
      label: 'Music, Nightlife & Entertainment',
      copy: "From live band nights to the city's loudest, longest weekends.",
      image: '/img/cat-nightlife.jpg',
      alt: 'Crowd dancing under string lights at a Kampala open-air bar',
      span: 'sm:col-span-4 lg:col-span-7',
      height: 'h-[58vw] sm:h-[46vw] lg:h-[30rem]',
    },
    {
      label: 'Culture & Heritage',
      copy: 'Buganda drums, barkcloth, palaces and the stories behind them.',
      image: '/img/cat-culture.jpg',
      alt: 'Ugandan drummers performing in traditional dress',
      span: 'sm:col-span-4 lg:col-span-4',
      height: 'h-[58vw] sm:h-[40vw] lg:h-[24rem]',
    },
    {
      label: 'Nature & Wildlife',
      copy: 'Crested cranes, misty hills and mornings on Lake Victoria.',
      image: '/img/cat-nature.jpg',
      alt: 'Crested cranes in misty Ugandan hills at sunrise',
      span: 'sm:col-span-4 lg:col-span-4',
      height: 'h-[58vw] sm:h-[40vw] lg:h-[24rem]',
    },
    {
      label: 'Adventure & Outdoors',
      copy: 'The Nile at Jinja, hikes, quad trails and long weekends out.',
      image: '/img/cat-adventure.jpg',
      alt: 'Rafters paddling white water on the Nile in Uganda',
      span: 'sm:col-span-4 lg:col-span-4',
      height: 'h-[58vw] sm:h-[40vw] lg:h-[24rem]',
    },
    {
      label: 'Events & Festivals',
      copy: 'Concerts, street festivals and the nights the city plans around.',
      image: '/img/cat-events.jpg',
      alt: 'Hands raised in a crowd at a Kampala music festival at dusk',
      span: 'sm:col-span-4 lg:col-span-4',
      height: 'h-[58vw] sm:h-[40vw] lg:h-[22rem]',
    },
    {
      label: 'Wellness & Relaxation',
      copy: 'Slow lakeside afternoons, gardens and quiet corners of the city.',
      image: '/img/cat-wellness.jpg',
      alt: 'A hammock in palm shade beside Lake Victoria',
      span: 'sm:col-span-4 lg:col-span-4',
      height: 'h-[58vw] sm:h-[40vw] lg:h-[22rem]',
    },
    {
      label: 'Sports & Recreation',
      copy: 'Match days, five-a-side, padel, boxing gyms and rugby afternoons.',
      image: '/img/cat-sports.jpg',
      alt: 'A five-a-side football match on a red-earth pitch in Kampala at golden hour',
      span: 'sm:col-span-4 lg:col-span-4',
      height: 'h-[40vw] sm:h-[40vw] lg:h-[22rem]',
    },
    {
      label: 'Other',
      copy: 'Something else entirely — tell us on the waitlist and we will shape it with you.',
      image: '/img/cat-other.jpg',
      alt: 'A rooftop lounge above the Kampala skyline at blue hour, lit by string lights',
      width: 1600,
      height_px: 1067,
      span: 'sm:col-span-8 lg:col-span-12',
      height: 'h-[40vw] sm:h-[22vw] lg:h-[14rem]',
    },
  ];
}
