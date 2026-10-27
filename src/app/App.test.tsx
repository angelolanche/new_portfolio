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
  it('uses the scene as the complete site without a header or footer', () => {
    render(<App />);

    expect(
      screen.getByRole('heading', { level: 1, name: 'Interactive Portfolio' }),
    ).toBeVisible();
    expect(screen.queryByRole('banner')).not.toBeInTheDocument();
    expect(screen.queryByRole('contentinfo')).not.toBeInTheDocument();
    expect(screen.getByRole('main')).toContainElement(
      screen.getByTestId('opening'),
    );
  });

  it('uses color dither for the only opening presentation', () => {
    render(<App />);

    expect(screen.getByTestId('opening')).toHaveAttribute(
      'data-color-dither',
      'true',
    );
  });
});
