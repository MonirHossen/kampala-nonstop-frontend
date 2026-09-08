import {
  LucideBackpack,
  LucideBanknote,
  LucideCloudSun,
  LucideHandshake,
  LucideLandmark,
  LucideMapPinned,
  LucidePlaneLanding,
  LucideShieldPlus,
  LucideSmartphone,
  LucideStamp,
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

export function guideTopicIcon(code: string | null | undefined): LucideIconData {
  if (!code) {
    return LucideMapPinned.icon;
  }

  return GUIDE_TOPIC_ICONS[code] ?? LucideMapPinned.icon;
}
