/// <reference types="vite/client" />

declare module "markdown-it-sup";
declare module "vue-html-secure";

interface Window {
  grecaptcha: {
    execute: (siteKey: string, options: { action: string }) => Promise<string>;
  };
  onPreviewUpdate?: (val: ISite) => void;
}

interface IContactInfo {
  category: string | null;
  email?: string;
  name?: string;
  phone?: string;
  message?: string;
}

interface ISite {
  _id?: string;
  customerId: string;
  customerEmail: string;
  title: string;
  isDev?: boolean;
  button?: string;            // e.g. 'circleRight' — controls bubble launcher style
  theme?: {
    primary?: string;
  }
  social?: {
    youtube?: string;
  }
  summary: {
    enabled: boolean;
    content: string;
    special?: string;
  },
  chatbot: {
    enabled: boolean;
  }
  sections: ISiteSections
}

interface ISiteSections {
  [name: string]: ISiteSection
}

interface ISiteSection {
  title?: string;
  enabled: boolean;
  content: string;
  url: string;
  props?: {
    verseRef?: string;
    autoFill?: boolean;
    translation?: string;
    email?: string[];
    copyright?: string;
    categories?: IContactCategory[];
  }
}

interface IContactCategory {
  title: string;
  email: string;
}