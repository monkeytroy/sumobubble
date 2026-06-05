import Customer, { ICustomer, SubscriptionStatus, Membership } from '@/src/models/customer';
import { log } from '@/src/lib/log';
import connectMongo from '@/src/lib/mongoose';

/**
 * Module only interface for props
 */
interface IFetchOrCreateCustomerProps {
  customerId: string;
  username?: string | null;
  email: string;
}

/**
 *
 * @param param0
 * @returns
 */
export const fetchOrCreateCustomer = async ({
  customerId,
  username,
  email
}: IFetchOrCreateCustomerProps): Promise<ICustomer | null> => {
  await connectMongo();

  log(`fetchOrCreateCustomer::Looking for ${customerId} ${email}`);

  // fetch or create customer rec
  let customer: ICustomer | null = await Customer.findOne({ email: email });
  if (!customer) {
    const newCustomer: ICustomer = {
      email,
      customerId,
      name: username || '',
      subscription: {
        status: SubscriptionStatus.Incomplete
      },
      membership: Membership.Preview
    };
    customer = await Customer.create(newCustomer);
  }

  const { __v, ...customerRes } = JSON.parse(JSON.stringify(customer));

  return customerRes;
};
