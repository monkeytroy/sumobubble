import { expect, test } from 'vitest';
import { screen } from '@testing-library/react';
import HomePricing from '@/src/components/home-pricing';
import HomeFeatures from '@/src/components/home-features';
import HomeIntro from '@/src/components/home-intro';
import { customRender } from './utils';
import { mockProps, mockSession } from './mocks';

test('Home Landing Page', async () => {
  customRender(
    <>
      <HomeIntro />
      <HomeFeatures />
      <HomePricing stripe={mockProps.stripe} />
    </>,
    { session: mockSession }
  );

  const mainTitle = screen.getByTestId('main-title');
  expect(mainTitle.textContent).toEqual('SumoBubble');

  const pricingTableContainer = screen.getByTestId('pricing-table-container');
  expect(pricingTableContainer).toBeDefined();

  const pricingTable = screen.getByTestId('pricing-table');
  expect(pricingTable).toBeDefined();
});
