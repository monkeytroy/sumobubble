// Types/enums for the Customer model. Lives separately from the schema file
// so client components can import these without pulling mongoose (and its
// Node-only deps: dns, fs, async_hooks, ...) into the browser bundle.

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
