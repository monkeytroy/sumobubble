import type { ICustomer } from '@/src/models/customer.types';
import type { ISite } from '@/src/models/site.types';

export interface Email {
  emailTo: string;
  name: string;
  subject: string;
  body: string;
}

export interface ISitesSummary {
  _id: string;
  title: string;
}

export interface IAppProps {
  customer?: ICustomer;
  sites?: ISitesSummary[];
  stripe?: {
    key: string;
    consoleId: string;
    homeId: string;
  };
}

export interface ISiteProps {
  customer?: ICustomer;
  site?: ISite;
}
