/**
 * Guide art direction.
 *
 * Every hero, hub card, topic, narrative section and region detail gets its
 * own licence-clean, content-matched still from the local /img/uganda set
 * so no two figures on the same page re-use a photograph.
 */

const IMG = {
  skyline: '/img/uganda/uganda-skyline.jpg',
  market: '/img/uganda/uganda-market.jpg',
  dance: '/img/uganda/uganda-dance.jpg',
  savannah: '/img/uganda/uganda-savannah-elephants.jpg',
  rafting: '/img/uganda/uganda-rafting.jpg',
  citySunset: '/img/uganda/uganda-city-sunset.jpg',
  mosque: '/img/uganda/uganda-mosque.jpg',
  street: '/img/uganda/uganda-street.jpg',
  gorilla: '/img/uganda/uganda-gorilla.jpg',
  lake: '/img/uganda/uganda-lake.jpg',
  giraffes: '/img/uganda/uganda-giraffes.jpg',
  airport: '/img/uganda/uganda-airport.jpg',
  boarding: '/img/uganda/uganda-boarding.jpg',
  mountain: '/img/uganda/uganda-mountain.jpg',
  countryside: '/img/uganda/uganda-countryside.jpg',
  bananas: '/img/uganda/uganda-bananas.jpg',
  vendor: '/img/uganda/uganda-vendor.jpg',
  youth: '/img/uganda/uganda-youth.jpg',
  safari: '/img/uganda/uganda-safari.jpg',
  boda: '/img/uganda/uganda-boda.jpg',
  tradition: '/img/uganda/uganda-tradition.jpg',
  celebration: '/img/uganda/uganda-celebration.jpg',
  passport: '/img/uganda/uganda-passport.jpg',
  money: '/img/uganda/uganda-money.jpg',
  exchanger: '/img/uganda/uganda-exchanger.jpg',
  health: '/img/uganda/uganda-health.jpg',
  phone: '/img/uganda/uganda-phone.jpg',
  pack: '/img/uganda/uganda-pack.jpg',
  sky: '/img/uganda/uganda-sky.jpg',
  suitcase: '/img/uganda/uganda-suitcase.jpg',
  essentials: '/img/uganda/uganda-map.svg',
  flight: '/img/uganda/uganda-flight.jpg',
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
  CENTRAL: '/img/uganda/regions/uganda-central.svg',
  WEST: '/img/uganda/regions/uganda-western.svg',
  EAST: '/img/uganda/regions/uganda-eastern.svg',
  NORTH: '/img/uganda/regions/uganda-northern.svg',
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