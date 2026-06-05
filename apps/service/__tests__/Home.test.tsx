import { expect, test } from 'vitest';
import { screen } from '@testing-library/react';
import HomePage from '../pages/index';
import { customRender } from './utils';
import { mockProps, mockSession } from './mocks';

test('Home Landing Page', async () => {
  customRender(<HomePage {...mockProps} />, { session: mockSession });

  const mainTitle = screen.getByTestId('main-title');
  expect(mainTitle.textContent).toEqual('SumoBubble');

  const pricingTableContainer = screen.getByTestId('pricing-table-container');
  expect(pricingTableContainer).to.exist;

  const pricingTable = screen.getByTestId('pricing-table');
  expect(pricingTable).to.exist;
});
