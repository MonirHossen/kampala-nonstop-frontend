/**
 * Guide art direction.
 *
 * Every hero, hub card, topic, narrative section and region detail gets its
 * own licence-clean, content-matched still from the local /img/guide/ set
 * so no two figures on the same page re-use a photograph.
 */

const IMG = {
  skyline: '/img/guide/uganda-skyline.jpg',
  market: '/img/guide/uganda-market.jpg',
  dance: '/img/guide/uganda-dance.jpg',
  savannah: '/img/guide/uganda-savannah-elephants.jpg',
  rafting: '/img/guide/uganda-rafting.jpg',
  citySunset: '/img/guide/uganda-city-sunset.jpg',
  mosque: '/img/guide/uganda-mosque.jpg',
  street: '/img/guide/uganda-street.jpg',
  gorilla: '/img/guide/uganda-gorilla.jpg',
  lake: '/img/guide/uganda-lake.jpg',
  giraffes: '/img/guide/uganda-giraffes.jpg',
  airport: '/img/guide/uganda-airport.jpg',
  boarding: '/img/guide/uganda-boarding.jpg',
  mountain: '/img/guide/uganda-mountain.jpg',
  countryside: '/img/guide/uganda-countryside.jpg',
  bananas: '/img/guide/uganda-bananas.jpg',
  vendor: '/img/guide/uganda-vendor.jpg',
  youth: '/img/guide/uganda-youth.jpg',
  safari: '/img/guide/uganda-safari.jpg',
  boda: '/img/guide/uganda-boda.jpg',
  tradition: '/img/guide/uganda-tradition.jpg',
  celebration: '/img/guide/uganda-celebration.jpg',
  passport: '/img/guide/uganda-passport.jpg',
  money: '/img/guide/uganda-money.jpg',
  exchanger: '/img/guide/uganda-exchanger.jpg',
  health: '/img/guide/uganda-health.jpg',
  phone: '/img/guide/uganda-phone.jpg',
  pack: '/img/guide/uganda-pack.jpg',
  sky: '/img/guide/uganda-sky.jpg',
  suitcase: '/img/guide/uganda-suitcase.jpg',
  essentials: '/img/guide/uganda-map.svg',
  flight: '/img/guide/uganda-flight.jpg',
} as const;

export type GuideArtImgKey = keyof typeof IMG;

export const GUIDE_ART_IMAGES = {
  banner: IMG.skyline,
  food: IMG.market,
  culture: IMG.dance,
  nature: IMG.savannah,
  adventure: IMG.rafting,
  nightlife: IMG.citySunset,
  events: IMG.mosque,
} as const;

export type GuideArtImageKey = keyof typeof GUIDE_ART_IMAGES;

const SECTION_HERO: Readonly<Record<string, string>> = {
  essentials: IMG.safari,
  'travel-guide': IMG.rafting,
  'travel-information': IMG.boarding,
  regions: IMG.savannah,
};

export function guideHeroImage(sectionSlug: string | null | undefined): string {
  if (!sectionSlug) {
    return GUIDE_ART_IMAGES.banner;
  }
  return SECTION_HERO[sectionSlug] ?? GUIDE_ART_IMAGES.banner;
}

const HUB_IMAGE_BY_SLUG: Readonly<Record<string, string>> = {
  essentials: IMG.essentials,
  'travel-guide': IMG.rafting,
  'travel-information': IMG.passport,
  regions: IMG.savannah,
};

export function guideHubCardImage(slug: string): string {
  return HUB_IMAGE_BY_SLUG[slug] ?? GUIDE_ART_IMAGES.banner;
}

const TOPIC_IMAGE_BY_CODE: Readonly<Record<string, string>> = {
  ENTRY_VISAS: IMG.boarding,
  ARRIVAL: IMG.flight,
  GETTING_AROUND: IMG.street,
  MONEY_PAYMENTS: IMG.money,
  EXCHANGE_RATE: IMG.exchanger,
  HEALTH_SAFETY: IMG.health,
  MOBILE_INTERNET: IMG.phone,
  WEATHER: IMG.sky,
  CULTURE_ETIQUETTE: IMG.tradition,
  WHAT_TO_PACK: IMG.pack,
};

export function guideTopicImage(code: string | null | undefined): string {
  if (!code) {
    return GUIDE_ART_IMAGES.banner;
  }
  return TOPIC_IMAGE_BY_CODE[code] ?? GUIDE_ART_IMAGES.banner;
}

const INFO_SECTION_IMAGE: Readonly<Record<string, string>> = {
  'visa-information': IMG.passport,
  'flights-to-uganda': IMG.flight,
  'arrival-getting-around': IMG.boda,
  'money-payments': IMG.market,
  'health-safety': IMG.health,
  'connectivity-power': IMG.phone,
  'what-to-pack': IMG.suitcase,
  'cultural-etiquette': IMG.dance,
  'when-to-travel': IMG.giraffes,
};

export function guideInfoSectionImage(id: string): string {
  return INFO_SECTION_IMAGE[id] ?? GUIDE_ART_IMAGES.banner;
}

const ESSENTIALS_IMAGE_BY_CODE: Readonly<Record<string, string>> = {
  ABOUT: IMG.countryside,
  HISTORY: IMG.mosque,
  CULTURE_TRADITIONS: IMG.dance,
  FOOD_DRINK_SOCIAL: IMG.bananas,
  LANGUAGES_COMMUNICATION: IMG.phone,
  GEOGRAPHY_CLIMATE: IMG.mountain,
  MAJOR_DESTINATIONS: IMG.gorilla,
  TOURISM_GLANCE: IMG.lake,
  KAMPALA_CITY_LIFE: IMG.citySunset,
  SAFETY_REASSURANCE: IMG.street,
  COST_OF_LIVING: IMG.market,
  PUBLIC_HOLIDAYS: IMG.celebration,
  LOCAL_ETIQUETTE: IMG.tradition,
};

export function guideEssentialsImage(code: string | null | undefined): string {
  if (!code) {
    return GUIDE_ART_IMAGES.banner;
  }
  return ESSENTIALS_IMAGE_BY_CODE[code] ?? GUIDE_ART_IMAGES.banner;
}

const REGION_IMAGE_BY_CODE: Readonly<Record<string, string>> = {
  CENTRAL: IMG.skyline,
  WEST: IMG.gorilla,
  EAST: IMG.lake,
  NORTH: IMG.giraffes,
};

/** Wikipedia locator maps (Wikimedia Commons: Uganda – Central/Western/Eastern/Northern). */
const REGION_MAP_BY_CODE: Readonly<Record<string, string>> = {
  CENTRAL: '/img/guide/regions/uganda-central.svg',
  WEST: '/img/guide/regions/uganda-western.svg',
  EAST: '/img/guide/regions/uganda-eastern.svg',
  NORTH: '/img/guide/regions/uganda-northern.svg',
};

export function guideRegionImage(code: string | null | undefined): string {
  if (!code) {
    return GUIDE_ART_IMAGES.banner;
  }
  return REGION_IMAGE_BY_CODE[code] ?? GUIDE_ART_IMAGES.banner;
}

export function guideRegionMap(code: string | null | undefined): string {
  if (!code) {
    return REGION_MAP_BY_CODE['CENTRAL'];
  }
  return REGION_MAP_BY_CODE[code] ?? REGION_MAP_BY_CODE['CENTRAL'];
}