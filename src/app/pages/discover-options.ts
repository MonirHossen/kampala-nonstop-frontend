import {
  LucideUtensils, LucideLandmark, LucideMusic,
  LucideTrees, LucideMountain, LucideTickets, LucideFlower2,
  LucideBike, LucideShoppingBag, LucideHandshake,
  LucideStar, LucideFootprints, LucideCalendarDays, LucideMap, LucideConciergeBell,
} from '@lucide/angular';

// Editorial UI choices; not backend taxonomy identifiers.
export const DISCOVER_THEMES = [
    { label: 'Food & Local Life', image: 'discover_food_and_local_life', icon: LucideUtensils.icon },
    { label: 'Culture & Heritage', image: 'discover_culture_and_heritage', icon: LucideLandmark.icon },
    { label: 'Music, Nightlife & Entertainment', image: 'discover_music_nightlife_entertainment', icon: LucideMusic.icon },
    { label: 'Nature & Wildlife', image: 'discover_wildlife_and_nature', icon: LucideTrees.icon },
    { label: 'Adventure & Outdoors', image: 'discover_adventure_and_outdoors', icon: LucideMountain.icon },
    { label: 'Events & Festivals', image: 'discover_events_and_festivals', icon: LucideTickets.icon },
    { label: 'Wellness & Relaxation', image: 'discover_wellness_and_beauty', icon: LucideFlower2.icon },
    { label: 'Sports & Recreation', image: 'discover_sports_and_recreation', icon: LucideBike.icon },
    { label: 'Shopping', image: 'discover_shopping', icon: LucideShoppingBag.icon },
    { label: 'Community & Impact', image: 'discover_community_and_impact', icon: LucideHandshake.icon },
  ];
export const DISCOVER_TYPES = [
    { label: 'Experiences', icon: LucideStar.icon },
    { label: 'Activities', icon: LucideFootprints.icon },
    { label: 'Events', icon: LucideCalendarDays.icon },
    { label: 'Tours', icon: LucideMap.icon },
    { label: 'Services', icon: LucideConciergeBell.icon },
  ];
