import {
  LucideBackpack,
  LucideBanknote,
  LucideBinoculars,
  LucideBookOpen,
  LucideBuilding2,
  LucideCalendarDays,
  LucideCloudSun,
  LucideCompass,
  LucideDroplets,
  LucideGlobe,
  LucideHandshake,
  LucideInfo,
  LucideLandmark,
  LucideMap,
  LucideMapPinned,
  LucideMessagesSquare,
  LucideMountain,
  LucideMusic,
  LucidePlane,
  LucidePlaneLanding,
  LucideShieldCheck,
  LucideShieldPlus,
  LucideSmartphone,
  LucideStamp,
  LucideSun,
  LucideUtensilsCrossed,
  LucideWallet,
  type LucideIconData,
} from '@lucide/angular';

/** Lucide icon data mapped by travel-guide topic code (UI chrome only). */
export const GUIDE_TOPIC_ICONS: Readonly<Record<string, LucideIconData>> = {
  ENTRY_VISAS: LucideStamp.icon,
  ARRIVAL: LucidePlaneLanding.icon,
  GETTING_AROUND: LucideMapPinned.icon,
  MONEY_PAYMENTS: LucideBanknote.icon,
  EXCHANGE_RATE: LucideLandmark.icon,
  HEALTH_SAFETY: LucideShieldPlus.icon,
  MOBILE_INTERNET: LucideSmartphone.icon,
  WEATHER: LucideCloudSun.icon,
  CULTURE_ETIQUETTE: LucideHandshake.icon,
  WHAT_TO_PACK: LucideBackpack.icon,
};

export const GUIDE_SECTION_ICONS: Readonly<Record<string, LucideIconData>> = {
  overview: LucideBookOpen.icon,
  essentials: LucideInfo.icon,
  'travel-guide': LucideCompass.icon,
  'travel-information': LucidePlane.icon,
  regions: LucideMap.icon,
};

/** Lucide icon data for essentials and travel-information section buttons. */
export const GUIDE_NAV_ICONS: Readonly<Record<string, LucideIconData>> = {
  ABOUT: LucideGlobe.icon,
  CULTURE_TRADITIONS: LucideMusic.icon,
  FOOD_DRINK_SOCIAL: LucideUtensilsCrossed.icon,
  LANGUAGES_COMMUNICATION: LucideMessagesSquare.icon,
  GEOGRAPHY_CLIMATE: LucideMountain.icon,
  MAJOR_DESTINATIONS: LucideMapPinned.icon,
  TOURISM_GLANCE: LucideBinoculars.icon,
  KAMPALA_CITY_LIFE: LucideBuilding2.icon,
  SAFETY_REASSURANCE: LucideShieldCheck.icon,
  COST_OF_LIVING: LucideWallet.icon,
  PUBLIC_HOLIDAYS: LucideCalendarDays.icon,
  LOCAL_ETIQUETTE: LucideHandshake.icon,
  'visa-information': LucideStamp.icon,
  'flights-to-uganda': LucidePlane.icon,
  'arrival-getting-around': LucideMapPinned.icon,
  'money-payments': LucideBanknote.icon,
  'health-safety': LucideShieldPlus.icon,
  'connectivity-power': LucideSmartphone.icon,
  'what-to-pack': LucideBackpack.icon,
  'cultural-etiquette': LucideHandshake.icon,
  'when-to-travel': LucideCloudSun.icon,
};

export const GUIDE_REGION_ICONS: Readonly<Record<string, LucideIconData>> = {
  CENTRAL: LucideBuilding2.icon,
  WEST: LucideMountain.icon,
  EAST: LucideDroplets.icon,
  NORTH: LucideSun.icon,
};

export function guideTopicIcon(code: string | null | undefined): LucideIconData {
  if (!code) {
    return LucideMapPinned.icon;
  }

  return GUIDE_TOPIC_ICONS[code] ?? LucideMapPinned.icon;
}

export function guideSectionIcon(slug: string | null | undefined): LucideIconData {
  if (!slug) {
    return GUIDE_SECTION_ICONS['overview'];
  }

  return GUIDE_SECTION_ICONS[slug] ?? LucideBookOpen.icon;
}

export function guideNavIcon(id: string | null | undefined): LucideIconData {
  if (!id) {
    return LucideCompass.icon;
  }

  return GUIDE_NAV_ICONS[id] ?? GUIDE_TOPIC_ICONS[id] ?? LucideCompass.icon;
}

export function guideRegionIcon(code: string | null | undefined): LucideIconData {
  if (!code) {
    return LucideMap.icon;
  }

  return GUIDE_REGION_ICONS[code] ?? LucideMap.icon;
}
