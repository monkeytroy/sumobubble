import { Schema, model, models, type Model } from 'mongoose';
import type { ISite, ISiteSection, IContactCategory } from './site.types';

export type { ISite, ISiteSection, ISiteSections, IContactCategory, IChatSite } from './site.types';

const sectionSchema = new Schema<ISiteSection>({
  title: { type: String, required: false },
  enabled: { type: Boolean, required: true },
  content: { type: String, trim: true },
  url: {
    type: String,
    trim: true,
    required: false
  },
  props: {
    verseRef: String,
    autoFill: Boolean,
    copyright: String,
    translation: {
      type: String,
      max: 3,
      min: 3
    },
    email: {
      type: Array<String>,
      default: undefined,
      validate: {
        validator: (val: string) => {
          return !val?.match || (val?.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/) && val?.length <= 320);
        },
        message: 'Contact is not a valid email failed'
      }
    },
    categories: {
      type: Array<IContactCategory>,
      default: undefined,
      required: false
    }
  }
});

const siteSchema = new Schema<ISite>({
  customerId: { type: String, required: true },
  customerEmail: { type: String, required: true },
  title: { type: String, required: true, min: 4, max: 160 },
  button: { type: String, required: false },
  theme: {
    primary: String
  },
  social: {
    // unused for now. placeholder.
    youtube: String
  },
  summary: {
    type: {
      enabled: Boolean,
      content: String,
      special: String
    },
    required: true
  },
  chatbot: {
    enabled: Boolean,
    chatsite: String,
    chatbaseId: String
  },
  sections: {
    type: Map,
    of: sectionSchema,
    required: true
  }
});

const Site: Model<ISite> = (models?.Site as Model<ISite>) || model<ISite>('Site', siteSchema, 'sites');

export default Site;
