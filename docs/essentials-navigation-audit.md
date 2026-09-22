# Essentials navigation inventory and correction

Audited the pre-refactor component at HEAD (latest page commit afd56ba) and its NARRATIVE_CODES / HIDDEN_TAB_CODES definitions on 2026-09-21. There were 12 visible editorial topic buttons; History was additional content under About. Quick facts were a separate card. All 13 editorial sections plus the quick-facts section now remain mounted (14 sections and 14 links in each navigation).

| Original label | Original code | Legacy section value / current anchor | Mapping |
| --- | --- | --- | --- |
| About Uganda | ABOUT | about | Original topic retained. |
| History of Uganda | HISTORY | history | Originally nested under About; now indexed explicitly. |
| Culture & Traditions | CULTURE_TRADITIONS | culture-traditions | Original topic retained. |
| Food, Drink & Social Life | FOOD_DRINK_SOCIAL | food-drink-social | Original topic retained. |
| Languages & Communication | LANGUAGES_COMMUNICATION | languages-communication | Original topic retained. |
| Geography & Climate | GEOGRAPHY_CLIMATE | geography-climate | Original topic retained. |
| Major Destinations & Regional Anchors | MAJOR_DESTINATIONS | major-destinations | Original topic retained. |
| Tourism at a Glance | TOURISM_GLANCE | tourism-glance | Original topic retained. |
| Kampala: City Life Snapshot | KAMPALA_CITY_LIFE | kampala-city-life | Original topic retained. |
| Safety & Practical Reassurance | SAFETY_REASSURANCE | safety-reassurance | Original topic retained. |
| Cost of Living & Currency | COST_OF_LIVING | cost-of-living | Original topic retained. |
| Public Holidays & Festivals | PUBLIC_HOLIDAYS | public-holidays | Original topic retained. |
| Local Etiquette | LOCAL_ETIQUETTE | local-etiquette | Original topic retained. |

All editorial content uses GuideNarrativeBlocksComponent; images use guideEssentialsImage(code), and navigation icons use guideNavIcon(code). Original labels and rich content come from GET /api/v1/guide/UG/essentials through the cached GuideApiService.getEssentials('UG'). The preserved quick-facts card uses GuideQuickInfoComponent and is linked as key-facts. Local Knowledge remains in the Guide shell.

## Diagnosis

The refactored template did not filter by active selection. The missing-topic failure was reproducible with the existing unavailable localhost API: fallbackEssentials only contained About and History, while any nonempty partial API response replaced the whole fallback. The full published payload was recovered unchanged from https://api-dev.kampalanonstop.com/api/v1/guide/UG/essentials on 2026-09-21 into uganda-essentials-fallback.ts. Live records take precedence by code, missing records use the snapshot, and the merged collection retains source ordering. No API environment URL was changed.

## Invariants

- allSections supplies desktop navigation, mobile navigation and every top-level section.
- Active section and URL values only control scrolling/highlighting.
- A valid hash takes precedence over a legacy query; an invalid hash falls back to a valid query.
- API success, partial success, empty response and failure preserve the original inventory.
- Page-level tests assert every original anchor, navigation/content parity, preserved section elements after selection and one API call.
