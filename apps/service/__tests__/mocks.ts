import { Role } from '@/middleware';
import { Membership, SubscriptionStatus } from '@/src/models/customer';

export const mockSession = {
  user: {
    name: 'Fred',
    id: '1234',
    role: Role.admin
  },
  expires: ''
};

export const mockProps = {
  customer: {
    subscription: {
      status: SubscriptionStatus.Active,
      customerId: 'cus_QwdfA2UAmdRq8z',
      id: 'sub_1Q4kNzL5FciPHDzJ3N0dy7NF',
      metadata: {
        chatbot: true
      },
      productId: 'prod_Nu5AWMDJRljdyF'
    },
    _id: '66f780a91ae29501e3dbc199',
    email: 'fredarters@gmail.com',
    customerId: '66f77edb58fb09f2df0fef4e',
    name: 'fredarters',
    membership: Membership.Plus
  },
  sites: [
    {
      _id: '674f476b25ad030945ac1ee1',
      title: 'Fred'
    }
  ],
  stripe: {
    key: 'pk_test_51N8GtIL5FciPHDzJDe97PtC3ZlV97oKKPDYKp0fOEZ2Xnr6quU6hzhlzaZjDOkEtJFBwW2xyyLqvaAS2Ka6KM9GF00jA04MKwB',
    homeId: 'prctbl_1Q3izzL5FciPHDzJjiuswJ1H',
    consoleId: 'prctbl_1Q3qxJL5FciPHDzJcf3NgfFz'
  }
};
