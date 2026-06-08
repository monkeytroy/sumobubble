import { Schema, model, models, type Model } from 'mongoose';
import type { ICustomer } from './customer.types';

export type { ICustomer } from './customer.types';
export { Membership, SubscriptionStatus } from './customer.types';

const customerSchema = new Schema<ICustomer>({
  email: { type: String, required: true, index: true, unique: true },
  customerId: { type: String, required: true, index: true, unique: true },
  name: { type: String, required: true },
  subscription: {
    id: { type: String, required: false },
    customerId: { type: String, required: false },
    status: { type: String, required: false },
    productId: { type: String, required: false },
    metadata: { type: {}, required: false }
  },
  membership: String
});

const Customer: Model<ICustomer> =
  (models?.Customer as Model<ICustomer>) || model<ICustomer>('Customer', customerSchema, 'customers');

export default Customer;
