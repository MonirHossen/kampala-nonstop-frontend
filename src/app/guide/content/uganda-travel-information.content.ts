import { GuideTravelInformation } from './guide-content.types';

export const UGANDA_TRAVEL_INFORMATION: GuideTravelInformation = {
  introHeading: 'Get ready',
  intro:
    'Travel to Uganda is straightforward. Most friction comes from uncertainty, not complexity.',
  visaHeading: 'Visa information',
  visaParagraphs: [
    'Most visitors require a visa to enter Uganda.',
    'Uganda operates an official online e-Visa system, which is the recommended method for most travellers. Applications are submitted in advance and approvals are issued electronically.',
  ],
  officialPortalLabel: 'Official Uganda e-Visa portal',
  officialPortalUrl: 'https://visas.immigration.go.ug/',
  atAGlance: [
    'Visas are applied for online before travel',
    'Passports must be valid for at least 6 months',
    'A yellow fever certificate is required on entry',
  ],
  visaFreeHeading: 'Visa-free entry',
  visaFreeParagraphs: [
    'Citizens of several African and selected Caribbean and island nations are eligible for visa-free entry to Uganda for short stays.',
    'Visa-free eligibility varies by nationality and length of stay. Travellers should confirm the current list before travelling rather than relying on a previous trip.',
  ],
  costsHeading: 'Visa costs',
  costsIntro: 'Visa fees are standardised by visa type, not nationality.',
  costs: [
    {
      name: 'Single-entry tourist visa',
      price: 'USD $50',
      note: 'Typical cost for most non-visa-free nationalities including the UK, EU, US, Canada and Australia.',
    },
    {
      name: 'Multiple-entry tourist visa',
      price: 'from USD $100',
      note: 'Issued based on travel history and purpose.',
    },
    {
      name: 'East Africa Tourist Visa',
      price: 'USD $100',
      note: 'Valid for Uganda, Kenya and Rwanda on one visa.',
    },
    {
      name: 'Visa-free entry',
      price: 'USD $0',
      note: 'Where nationality and stay length qualify.',
    },
  ],
  costsFootnote: 'Visa fees are paid online and are non-refundable once submitted.',
};
