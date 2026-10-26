// @vitest-environment jsdom

import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('../features/world/Opening', () => ({
  Opening: ({ colorDither }: { colorDither: boolean }) => (
    <div data-testid="opening" data-color-dither={String(colorDither)} />
  ),
}));
import { App } from './App';

describe('App', () => {
  it('shows the portfolio heading and development status', () => {
    render(<App />);

    expect(
      screen.getByRole('heading', { level: 1, name: 'Interactive Portfolio' }),
    ).toBeVisible();
    expect(screen.getByText('This portfolio is in development.')).toBeVisible();
  });

  it('uses color dither for the only opening presentation', () => {
    render(<App />);

    expect(screen.getByTestId('opening')).toHaveAttribute(
      'data-color-dither',
      'true',
    );
  });
});
