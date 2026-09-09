import { GuideRegion } from './guide-content.types';

export const UGANDA_REGIONS_INTRO =
  'Four regions, many ways to experience Uganda. Choose a card to explore each region here.';

export const UGANDA_REGIONS: GuideRegion[] = [
  {
    code: 'CENTRAL',
    title: 'Central',
    summary:
      'Central brings together Kampala’s busy urban life and Entebbe’s calmer lakeside pace. It is a natural starting point for getting your bearings before travelling further.',
    image: '/img/hero_culture_desktop.jpg',
    isFeatured: true,
    keyAreas: [
      'Kampala — government, business, culture and nightlife.',
      'Entebbe — the international airport and Lake Victoria.',
    ],
    orientation:
      'Plan your first stop around your flight time. Allow flexibility for traffic when moving between Entebbe and Kampala.',
  },
  {
    code: 'WEST',
    title: 'West',
    summary:
      'Western Uganda is known for mountain gorilla and chimpanzee experiences, crater lakes and the dramatic landscapes of the Albertine Rift.',
    image: '/img/hero_nature_desktop.jpg',
    isFeatured: true,
    keyAreas: [
      'Bwindi and Mgahinga — mountain gorilla trekking.',
      'Queen Elizabeth and Kibale — savannah, crater lakes and chimpanzees.',
    ],
    orientation:
      'Treat the west as an overnight (or longer) trip from Kampala, not a day out. Leave the city early, and avoid the Friday afternoon Masaka-road rush.',
  },
  {
    code: 'EAST',
    title: 'East',
    summary:
      'Eastern Uganda offers Mount Elgon, Sipi Falls and a quieter pace, with strong coffee and hiking culture around the highlands.',
    image: '/img/hero_adventure_desktop.jpg',
    isFeatured: false,
    keyAreas: [
      'Sipi Falls — cliff views, coffee tours and cooler air.',
      'Mount Elgon — hiking and highland landscapes on the Kenya border.',
    ],
    orientation:
      'The east is a natural add-on if you have a spare night beyond Kampala and Jinja. Sipi is the overnight most first-time visitors remember.',
  },
  {
    code: 'NORTH',
    title: 'North',
    summary:
      'Northern Uganda includes the Nile around Murchison Falls and wide savannah landscapes, with growing tourism infrastructure beyond the south.',
    image: '/img/hero_nature_desktop.jpg',
    isFeatured: false,
    keyAreas: [
      'Murchison Falls — the Nile squeezed through the rift, plus classic game drives.',
      'The wider north — savannah, river life and a slower road north of the capital.',
    ],
    orientation:
      'Murchison is a long day from Kampala. An overnight turns it from a rush into the Nile-and-savannah trip most first-time visitors actually want.',
  },
];
