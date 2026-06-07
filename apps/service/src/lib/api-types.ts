import { IAskSource } from '@/src/models/askSource';
import { ISite } from '@/src/models/site';

export interface IApiRes {
  success: boolean;
  message: string;
}

export interface ConfigRes extends IApiRes {
  data?: ISite;
}

export interface AskSourceRes extends IApiRes {
  data?: IAskSource[];
}
