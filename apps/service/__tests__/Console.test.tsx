import { beforeEach, expect, test } from 'vitest';
import { screen } from '@testing-library/react';
import { AccountSettings } from '@/src/components/console/account-settings';
import { useAppStore } from '@/src/store/app-store';
import { customRender } from './utils';
import { mockProps, mockSession } from './mocks';

beforeEach(() => {
  // Hydrate store the way the app router StoreHydrator would.
  useAppStore.setState({
    customer: mockProps.customer,
    sites: mockProps.sites
  });
});

test('Sites landing page renders the site list', async () => {
  customRender(<AccountSettings {...mockProps} />, { session: mockSession });

  expect(screen.getByText('Choose a Site to Edit (1 Sites)')).toBeDefined();
  expect(screen.getByText('Fred')).toBeDefined();
});
