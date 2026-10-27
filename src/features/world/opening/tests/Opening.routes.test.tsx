// @vitest-environment jsdom
import {
  act,
  fireEvent,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { projects } from '../../../../content/projects';

import { canvas, setup, enterTv } from './openingHarness';

describe('Opening routes', () => {
  it('opens a shareable project and restores the same travel state through browser back/forward', async () => {
    const scene = await setup();
    await enterTv();
    fireEvent.wheel(scene, { deltaY: 1300 });
    act(() => {
      canvas.props!.navigationRef.current.progress = 0.18;
    });
    fireEvent.click(screen.getByRole('button', { name: 'Work index +' }));
    const index = screen.getByRole('dialog', { name: 'Work index' });
    fireEvent.click(within(index).getByRole('link', { name: /Delivery Room/ }));
    expect(window.location.pathname).toBe('/projects/bmw');
    expect(screen.getByRole('dialog', { name: 'Delivery Room' })).toBeVisible();
    const film = screen.getByLabelText('Delivery Room — video 1');
    expect(film.querySelector('source')).toHaveAttribute(
      'src',
      expect.stringContaining(
        'video.wixstatic.com/video/072acd_011f1d894bbf4c17b467f01aba6f1510/',
      ),
    );
    expect(
      screen.queryByText('Documentation and images coming soon.'),
    ).not.toBeInTheDocument();
    expect(canvas.props?.playing).toBe(false);
    expect(canvas.props?.suspended).toBe(true);
    fireEvent.click(screen.getByRole('button', { name: 'Back to signal ↗' }));
    await waitFor(() => expect(window.location.pathname).toBe('/'));
    expect(canvas.props?.navigationRef.current).toMatchObject({
      progress: 0.18,
      target: projects[0].progress,
      detailOpen: false,
    });
    act(() => window.history.forward());
    await waitFor(() =>
      expect(
        screen.getByRole('dialog', { name: 'Delivery Room' }),
      ).toBeVisible(),
    );
  });

  it('supports direct project URLs, Escape return, keyboard travel and index location without 3D', async () => {
    window.history.replaceState(null, '', '/projects/interactive-led-brain');
    const scene = await setup();
    const detail = screen.getByRole('dialog', {
      name: '_ CEREBRO _',
    });
    fireEvent(detail, new Event('cancel', { bubbles: true, cancelable: true }));
    expect(window.location.pathname).toBe('/');
    fireEvent.keyDown(scene, { key: 'End' });
    expect(canvas.props?.navigationRef.current.target).toBe(1);
    fireEvent.click(screen.getByRole('button', { name: 'Work index +' }));
    fireEvent.click(
      screen.getByRole('button', {
        name: 'Locate Delivery Room in the signal',
      }),
    );
    expect(canvas.props?.navigationRef.current.target).toBeCloseTo(0.81);
  });

  it('makes the sourced About available at a direct URL and restores the signal on Escape', async () => {
    window.history.replaceState(null, '', '/about');
    await setup();
    const about = screen.getByRole('dialog', { name: 'Angelo AoSol' });
    expect(within(about).getByText(/At 30, I understood/)).toBeVisible();
    expect(
      within(about).getByRole('link', { name: 'angelo.pjsol@gmail.com ↗' }),
    ).toHaveAttribute('href', 'mailto:angelo.pjsol@gmail.com');
    expect(canvas.props?.suspended).toBe(true);
    fireEvent(about, new Event('cancel', { bubbles: true, cancelable: true }));
    expect(window.location.pathname).toBe('/');
    expect(canvas.props?.navigationRef.current.detailOpen).toBe(false);
  });
});
