export type InterestOption = {
  code: string;
  name: string;
  description?: string | null;
  display_order?: number;
};

/** @deprecated Prefer WaitlistApiService.listInterestTypes() — kept for admin Supabase filters. */
export const INTEREST_OPTIONS: readonly InterestOption[] = [
  { code: 'culture_heritage', name: 'Culture & Heritage' },
  { code: 'food_local_life', name: 'Food & Local Life' },
  { code: 'music_nightlife_entertainment', name: 'Music, Nightlife & Entertainment' },
  { code: 'nature_wildlife', name: 'Nature & Wildlife' },
  { code: 'adventure_outdoors', name: 'Adventure & Outdoors' },
  { code: 'events_festivals', name: 'Events & Festivals' },
  { code: 'wellness_relaxation', name: 'Wellness & Relaxation' },
  { code: 'sports_recreation', name: 'Sports & Recreation' },
  { code: 'other', name: 'Other' },
] as const;

export const INTERESTS = INTEREST_OPTIONS.map((interest) => interest.name);

export type Interest = (typeof INTERESTS)[number];

export function interestName(code: string, options: readonly InterestOption[] = INTEREST_OPTIONS): string {
  return options.find((interest) => interest.code === code)?.name ?? code;
}
