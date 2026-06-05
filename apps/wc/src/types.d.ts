declare module "markdown-it-sup";
declare module "vue-html-secure";

interface Window {
  grecaptcha: any;
  onPreviewUpdate: any;
}

interface ISite {
  _id?: string;
  customerId: string;
  customerEmail: string;
  title: string;
  isDev?: boolean;
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
    chatsite?: string;                // the url for the site the chat will be baesd off
    chatbaseId?: string;              // the chatbase bot id
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