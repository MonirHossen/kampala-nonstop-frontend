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
  note?: string;
};

export type GuideNamedPoint = {
  name: string;
  detail: string;
};

export type GuideFxGuide = {
  currency: string;
  unit: string;
  lower: string;
  upper: string;
};

export type GuideTravelInfoNavItem = {
  id: string;
  label: string;
};

export type GuideTravelInformation = {
  introHeading: string;
  intro: string;
  nav: GuideTravelInfoNavItem[];
  visaHeading: string;
  visaParagraphs: string[];
  officialPortalLabel: string;
  officialPortalUrl: string;
  atAGlanceHeading: string;
  atAGlance: string[];
  visaFreeHeading: string;
  visaFreeParagraphs: string[];
  costsHeading: string;
  costsIntro: string;
  costs: GuideVisaCost[];
  costsFootnote: string;
  flightsHeading: string;
  flightsIntro: string;
  airlineName: string;
  airlineUrl: string;
  airlineSuffix: string;
  flightDestinations: string[];
  flightsNote: string;
  flightsSchedules: string;
  airportHeading: string;
  airportIntro: string;
  transferBefore: string;
  transferEmphasis: string;
  transferAfter: string;
  gettingAroundHeading: string;
  transportHeading: string;
  transportIntro: string;
  transportOptions: GuideNamedPoint[];
  transportNote: string;
  healthHeading: string;
  healthIntro: string;
  healthColumnHeading: string;
  healthPoints: string[];
  safetyColumnHeading: string;
  safetyPoints: string[];
  moneyHeading: string;
  moneyIntro: string;
  moneyGuideLabel: string;
  fx: GuideFxGuide[];
  moneyParagraphs: string[];
  connectivityHeading: string;
  connectivityColumnHeading: string;
  connectivityPoints: string[];
  electricityColumnHeading: string;
  electricityPoints: string[];
  packHeading: string;
  packIntro: string;
  packListLabel: string;
  packItems: string[];
  packNote: string;
  etiquetteHeading: string;
  etiquettePoints: string[];
  etiquetteCloseBefore: string;
  etiquetteMale: string;
  etiquetteMaleNote: string;
  etiquetteFemale: string;
  etiquetteCloseAfter: string;
  whenHeading: string;
  whenParagraphs: string[];
  ctaEyebrow: string;
  ctaHeading: string;
  ctaLabel: string;
};

export type GuideRegion = {
  code: string;
  title: string;
  summary: string;
  overview: string;
  keyAreas: string[];
  orientation: string;
  actionLabel: string;
  actionTopic: string;
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
