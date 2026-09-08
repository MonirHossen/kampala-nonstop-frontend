import {
  LucideClock,
  LucideCloudSun,
  LucideLandmark,
  LucideMapPinned,
  LucideShieldAlert,
  LucideStamp,
  type LucideIconData,
} from '@lucide/angular';
import { GuideTravelInformation } from './guide.models';

/** Icons for travel-information triggers (UI chrome only). */
const TRAVEL_INFO_ICONS: Readonly<Record<string, LucideIconData>> = {
  EXCHANGE_RATE: LucideLandmark.icon,
  WEATHER: LucideCloudSun.icon,
  LOCAL_TIME: LucideClock.icon,
  ENTRY_VISA_STATUS: LucideStamp.icon,
  TRAVEL_ADVISORY: LucideShieldAlert.icon,
};

export type TravelInfoChip = GuideTravelInformation & {
  icon: LucideIconData;
  /** Short scannable value shown on the chip, or null when the data has none. */
  hint: string | null;
  /** Provenance line shown under the popover body. */
  footnote: string | null;
};

export function toTravelInfoChips(items: GuideTravelInformation[]): TravelInfoChip[] {
  return items.map((item) => ({
    ...item,
    icon: TRAVEL_INFO_ICONS[item.code ?? ''] ?? LucideMapPinned.icon,
    hint: chipHint(item),
    footnote: chipFootnote(item),
  }));
}

/**
 * Chip hints are derived from `value_data` only — never parsed out of the
 * editorial `value_text`, so a chip is empty rather than wrong.
 */
function chipHint(item: GuideTravelInformation): string | null {
  const data = item.value_data;

  if (!data) {
    return null;
  }

  switch (item.code) {
    case 'EXCHANGE_RATE': {
      const rate = data['rate'];
      if (typeof rate !== 'number') return null;
      const quote = typeof data['quote'] === 'string' ? data['quote'] : '';
      const base = typeof data['base'] === 'string' ? data['base'] : '';
      return `${rate.toLocaleString('en-US')} ${quote}/${base}`.trim();
    }

    case 'LOCAL_TIME': {
      const timezone = data['timezone'];
      if (typeof timezone !== 'string') return null;
      return currentTimeIn(timezone);
    }

    case 'WEATHER': {
      const summary = data['summary'];
      if (typeof summary !== 'string') return null;
      return humanise(summary);
    }

    default:
      return null;
  }
}

function chipFootnote(item: GuideTravelInformation): string | null {
  if (item.code === 'LOCAL_TIME') {
    return 'Calculated on this device';
  }

  const source = item.value_data?.['source'];
  return source === 'manual' ? 'Manually maintained snapshot' : null;
}

function currentTimeIn(timeZone: string): string | null {
  try {
    return new Intl.DateTimeFormat('en-GB', {
      timeZone,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(new Date());
  } catch {
    return null;
  }
}

function humanise(value: string): string {
  const words = value.replace(/_/g, ' ').trim();
  return words.charAt(0).toUpperCase() + words.slice(1);
}
