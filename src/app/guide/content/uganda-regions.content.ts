import { GuideRegion } from './guide-content.types';

export const UGANDA_REGIONS_INTRO =
  'Uganda’s four regions — Central, Western, Eastern and Northern — each open a different side of the country. Choose a region to explore it here.';

export const UGANDA_REGIONS: GuideRegion[] = [
  {
    code: 'CENTRAL',
    title: 'Central',
    summary: 'City life, lakeside stays and Uganda’s international gateway.',
    overview:
      'The Central Region brings together Kampala’s busy urban life and Entebbe’s calmer lakeside pace. It is a natural starting point for getting your bearings before travelling further.',
    keyAreas: [
      'Kampala — government, business, culture and nightlife.',
      'Entebbe — the international airport and Lake Victoria.',
    ],
    orientation:
      'Plan your first stop around your flight time. Allow flexibility for traffic when moving between Entebbe and Kampala.',
    actionLabel: 'Getting here and arrival',
    actionTopic: 'ARRIVAL',
    mapSrc: '/img/guide/regions/uganda-central.svg',
  },
  {
    code: 'WEST',
    title: 'Western',
    summary: 'Savannah, primate forests, crater lakes and mountain landscapes.',
    overview:
      'The Western Region brings together many of Uganda’s best-known nature destinations. Wildlife journeys, forest visits and time in the highlands can form parts of the same wider itinerary.',
    keyAreas: [
      'Fort Portal and the Rwenzori region — crater lakes, highlands and mountain hiking.',
      'Queen Elizabeth National Park — savannah, lakes and birdlife.',
      'Bwindi Impenetrable Forest — mountain gorilla trekking.',
    ],
    orientation:
      'Plan longer road journeys and activity requirements together. Check your itinerary with your operator before adding extra stops.',
    actionLabel: 'Plan your transport',
    actionTopic: 'GETTING_AROUND',
    mapSrc: '/img/guide/regions/uganda-western.svg',
  },
  {
    code: 'EAST',
    title: 'Eastern',
    summary: 'The Nile at Jinja and a focus on adventure and leisure.',
    overview:
      'The Eastern Region is anchored by Jinja, combining the source of the Nile with adventure activities and time by the water. It can fit into a short stay or a wider journey from Kampala.',
    keyAreas: [
      'Jinja — a base for Nile activities, leisure and white-water rafting.',
      'The Nile — the focus for many of the area’s outdoor experiences.',
    ],
    orientation:
      'Allow time for the journey from Kampala and confirm the arrangements for any planned activities with your operator.',
    actionLabel: 'Prepare for your activities',
    actionTopic: 'WHAT_TO_PACK',
    mapSrc: '/img/guide/regions/uganda-eastern.svg',
  },
  {
    code: 'NORTH',
    title: 'Northern',
    summary: 'Gulu, cultural encounters and a different pace of city life.',
    overview:
      'The Northern Region offers another perspective on Uganda beyond its central and western routes. Gulu is a key base, with a distinct cultural identity and an evolving urban scene.',
    keyAreas: [
      'Gulu — a northern city with cultural and historical significance.',
      'Northern landscapes — a wider setting for journeys beyond the capital.',
    ],
    orientation:
      'Make room for longer travel distances and ask locally for guidance when planning visits beyond your main base.',
    actionLabel: 'Explore culture and etiquette',
    actionTopic: 'CULTURE_ETIQUETTE',
    mapSrc: '/img/guide/regions/uganda-northern.svg',
  },
];
