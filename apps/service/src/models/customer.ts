import { Schema, model, models } from 'mongoose';

/**
 * Though exported, these are highly germane to the model
 * though could split to a customer.types.ts file.
 */

export enum Membership {
  Preview = 'preview',
  Trial = 'trial',
  Basic = 'basic',
  Plus = 'plus'
}

export enum SubscriptionStatus {
  Active = 'active',
  Inactive = 'inactive',
  Incomplete = 'incomplete',
  Cancelled = 'cancelled'
}

export interface ICustomer {
  email: string;
  customerId: string;
  name: string;
  subscription: {
    id?: string;
    customerId?: string;
    status: SubscriptionStatus;
    productId?: string;
    metadata?: {
      chatbot?: boolean;
    };
  };
  membership: Membership;
}

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

const Customer = models?.Customer || model('Customer', customerSchema, 'customers');

export default Customer;
