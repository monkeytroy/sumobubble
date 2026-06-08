import { Schema, model, models, type Model } from 'mongoose';
import type { IAskSource } from './askSource.types';

export type { IAskSource } from './askSource.types';

const askSourceSchema = new Schema<IAskSource>({
  customerId: { type: String, required: true },
  siteId: { type: String, required: true },
  origFilename: { type: String, required: false },
  isMaster: { type: Boolean, required: true },
  contents: { type: String, required: true }
});

const AskSource: Model<IAskSource> =
  (models?.AskSource as Model<IAskSource>) || model<IAskSource>('AskSource', askSourceSchema, 'asksources');

export default AskSource;
