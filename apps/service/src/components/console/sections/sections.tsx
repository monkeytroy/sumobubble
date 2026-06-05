import { section as sectionSetup } from './config-setup';
import { section as sectionAsk } from './config-ask';
import { section as sectionSummary } from './config-summary';
import { section as sectionInfoRequest } from './config-info-request';
import { section as sectionSpotlight } from './config-spotlight';
import { ISection } from '@/src/components/console/types';

// These sections are what are loaded for the side bar and available to users.
export const sections: Array<ISection> = [
  { ...sectionSetup },
  { ...sectionAsk },
  { ...sectionSummary },
  { ...sectionInfoRequest },
  { ...sectionSpotlight }
];
