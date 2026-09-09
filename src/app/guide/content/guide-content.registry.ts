import { CountryGuideContent, GuideHubCard } from './guide-content.types';
import { UGANDA_ESSENTIALS_NARRATIVE } from './uganda-essentials.content';
import { UGANDA_REGIONS, UGANDA_REGIONS_INTRO } from './uganda-regions.content';
import { UGANDA_TRAVEL_GUIDE_TOPICS } from './uganda-travel-guide.content';
import { UGANDA_TRAVEL_INFORMATION } from './uganda-travel-information.content';

const UGANDA_HUB_CARDS: GuideHubCard[] = [
  {
    slug: 'essentials',
    title: 'Essentials',
    lede: 'Get to know Uganda: its people, culture, geography and everyday essentials.',
    cta: 'Explore Essentials',
  },
  {
    slug: 'travel-guide',
    title: 'Travel Guide',
    lede: 'Explore ten practical topics to help you prepare and find your way.',
    cta: 'Explore Travel Guide',
  },
  {
    slug: 'travel-information',
    title: 'Travel Information',
    lede: 'Find visa information, arrival details, transport options and packing advice.',
    cta: 'Explore Travel Information',
  },
  {
    slug: 'regions',
    title: 'Regions',
    lede: 'Find your bearings across Central, West, East and North.',
    cta: 'Explore Regions',
  },
];

export const UGANDA_GUIDE_CONTENT: CountryGuideContent = {
  countryCode: 'UG',
  countryName: 'Uganda',
  hubTitle: 'Get to know the Pearl of Africa',
  hubLede:
    'A practical country guide for travellers: quick facts, how to get ready, and how the four regions sit together.',
  hubCards: UGANDA_HUB_CARDS,
  essentialsNarrative: UGANDA_ESSENTIALS_NARRATIVE,
  travelGuideTopics: UGANDA_TRAVEL_GUIDE_TOPICS,
  travelInformation: UGANDA_TRAVEL_INFORMATION,
  regionsIntro: UGANDA_REGIONS_INTRO,
  regions: UGANDA_REGIONS,
};

const GUIDE_CONTENT_BY_COUNTRY: Record<string, CountryGuideContent> = {
  UG: UGANDA_GUIDE_CONTENT,
};

export function guideContentFor(countryCode: string): CountryGuideContent | null {
  const code = countryCode.trim().toUpperCase();
  return GUIDE_CONTENT_BY_COUNTRY[code] ?? null;
}
