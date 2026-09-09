export type GuideNarrativeSection = {
  heading: string;
  paragraphs: string[];
};

export type GuideTopic = {
  code: string;
  name: string;
  description: string;
  content: string;
};

export type GuideVisaCost = {
  name: string;
  price: string;
  note: string;
};

export type GuideTravelInformation = {
  introHeading: string;
  intro: string;
  visaHeading: string;
  visaParagraphs: string[];
  officialPortalLabel: string;
  officialPortalUrl: string;
  atAGlance: string[];
  visaFreeHeading: string;
  visaFreeParagraphs: string[];
  costsHeading: string;
  costsIntro: string;
  costs: GuideVisaCost[];
  costsFootnote: string;
};

export type GuideRegion = {
  code: string;
  title: string;
  summary: string;
  image?: string | null;
  isFeatured: boolean;
  keyAreas: string[];
  orientation: string;
};

export type GuideHubCard = {
  slug: 'essentials' | 'travel-guide' | 'travel-information' | 'regions';
  title: string;
  lede: string;
  cta: string;
};

export type CountryGuideContent = {
  countryCode: string;
  countryName: string;
  hubTitle: string;
  hubLede: string;
  hubCards: GuideHubCard[];
  essentialsNarrative: GuideNarrativeSection[];
  travelGuideTopics: GuideTopic[];
  travelInformation: GuideTravelInformation;
  regionsIntro: string;
  regions: GuideRegion[];
};
