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
    {
      label: 'Experiences',
      code: 'EXPERIENCE',
      icon: LucideStar.icon,
      blurb: 'Curated combinations of activities',
      tileClass: 'bg-gradient-to-br from-primary via-primary to-clay text-primary-foreground',
      iconClass: 'text-primary-foreground',
      blurbClass: 'text-primary-foreground/85',
    },
    {
      label: 'Activities',
      code: 'ACTIVITY',
      icon: LucideFootprints.icon,
      blurb: 'Things to do',
      tileClass: 'bg-gradient-to-br from-forest via-forest to-ink text-white',
      iconClass: 'text-white',
      blurbClass: 'text-white/85',
    },
    {
      label: 'Events',
      code: 'EVENT',
      icon: LucideCalendarDays.icon,
      blurb: 'Scheduled happenings',
      tileClass: 'bg-gradient-to-br from-clay via-clay to-primary text-white',
      iconClass: 'text-white',
      blurbClass: 'text-white/85',
    },
    {
      label: 'Tours',
      code: 'TOUR',
      icon: LucideMap.icon,
      blurb: 'Structured journeys',
      tileClass: 'bg-gradient-to-br from-ink via-ink to-forest text-ink-foreground',
      iconClass: 'text-ink-foreground',
      blurbClass: 'text-ink-foreground/80',
    },
    {
      label: 'Services',
      code: 'SERVICE',
      icon: LucideConciergeBell.icon,
      blurb: 'Bookable services',
      tileClass: 'bg-gradient-to-br from-sand via-secondary to-muted text-foreground',
      iconClass: 'text-foreground',
      blurbClass: 'text-muted-foreground',
    },
  ];
