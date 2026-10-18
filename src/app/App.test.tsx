import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { App } from './App';

describe('App', () => {
  it('shows the portfolio heading and development status', () => {
    render(<App />);

    expect(screen.getByRole('heading', { level: 1, name: 'Interactive Portfolio' })).toBeVisible();
    expect(screen.getByText('This portfolio is in development.')).toBeVisible();
  });
});
