export interface IAskSource {
  _id?: string;
  customerId: string;
  siteId: string;
  origFilename?: string;
  isMaster: boolean;
  contents: string;
}
