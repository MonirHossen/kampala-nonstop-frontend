export const INTERESTS = [
  "Food & Local Life",
  "Culture & Heritage",
  "Music, Nightlife & Entertainment",
  "Nature & Wildlife",
  "Adventure & Outdoors",
  "Events & Festivals",
  "Wellness & Relaxation",
  "Sports & Recreation",
  "Other",
] as const;

export type Interest = (typeof INTERESTS)[number];
