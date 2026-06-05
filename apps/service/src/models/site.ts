import { Schema, model, models } from 'mongoose';

/**
 * Though exported, these are highly germane to the model
 * though could split to a customer.types.ts file.
 */

export interface ISite {
  _id?: string;
  customerId: string;
  customerEmail: string;
  title: string;
  button?: string;
  theme?: {
    primary?: string;
  };
  social?: {
    youtube?: string;
  };
  summary: {
    enabled: boolean;
    content: string;
    special?: string;
  };
  chatbot: {
    enabled: boolean;
    sites?: IChatSite[];
    chatbotId?: string;
  };
  sections: ISiteSections;
}

export interface ISiteSections {
  [name: string]: ISiteSection;
}

interface IChatSite {
  url: string;
  active: boolean;
  progress: number;
  message: string;
}

export interface IContactCategory {
  title: string;
  email: string;
}

export interface ISiteSection {
  title?: string;
  enabled: boolean;
  content: string;
  url?: string;
  props?: {
    verseRef?: string;
    autoFill?: boolean;
    translation?: string;
    email?: string[];
    copyright?: string;
    categories?: IContactCategory[];
  };
}

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

const Site = models?.Site || model('Site', siteSchema, 'sites');

export default Site;
