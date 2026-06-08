// Types for the Site model. Lives separately from the schema file so client
// components can import these without pulling mongoose into the browser bundle.

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

export interface IChatSite {
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
