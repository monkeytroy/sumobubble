import { expect, test } from 'vitest';
import { screen } from '@testing-library/react';
import Console from '../pages/console/index';
import { customRender } from './utils';
import { mockProps, mockSession } from './mocks';

test('Sites landing page renders the site list', async () => {
  customRender(<Console {...mockProps} />, { session: mockSession });

  // Mock has 1 site so the list + count line render.
  expect(screen.getByText('Choose a Site to Edit (1 Sites)')).toBeDefined();
  // And the site name from the mock renders inside the list card.
  expect(screen.getByText('Fred')).toBeDefined();
});
