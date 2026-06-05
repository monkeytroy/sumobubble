import { Schema, model, models } from 'mongoose';

/**
 * Though exported, these are highly germane to the model
 * though could split to a customer.types.ts file.
 */

export interface IAskSource {
  _id?: string;
  customerId: string;
  siteId: string;
  origFilename?: string;
  isMaster: boolean;
  contents: string;
}

const askSourceSchema = new Schema<IAskSource>({
  customerId: { type: String, required: true },
  siteId: { type: String, required: true },
  origFilename: { type: String, required: false },
  isMaster: { type: Boolean, required: true },
  contents: { type: String, required: true }
});

const AskSource = models?.AskSource || model('AskSource', askSourceSchema, 'asksources');

export default AskSource;
