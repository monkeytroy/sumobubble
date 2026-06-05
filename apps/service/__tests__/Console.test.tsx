import { expect, test } from 'vitest';
import { screen } from '@testing-library/react';
import Console from '../pages/console/index';
import { customRender } from './utils';
import { mockProps, mockSession } from './mocks';

test('Home Landing Page', async () => {
  customRender(<Console {...mockProps} />, { session: mockSession });

  const sitesText = screen.getByText('Welcome! Ready to get started?');
  expect(sitesText).toBeDefined;

  expect(screen.getByText('Choose a Site to Edit (1 Sites)')).toBeDefined;
});
