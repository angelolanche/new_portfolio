// @vitest-environment jsdom

import { useState } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { DitherControls } from './DitherControls';
import {
  defaultDitherSettings,
  ditherColors,
  displayRgb,
  ditherPatterns,
  ditherAdjustments,
  serializeDitherSettings,
} from './ditherSettings';

function Studio() {
  const [settings, setSettings] = useState(defaultDitherSettings);
  return (
    <>
      <DitherControls settings={settings} onChange={setSettings} />
      <output data-testid="settings">{JSON.stringify(settings)}</output>
    </>
  );
}

describe('dithering studio', () => {
  it('supports all patterns and advanced controls and resets them together', () => {
    render(<Studio />);
    for (const style of Object.keys(ditherPatterns)) {
      fireEvent.change(screen.getByLabelText('Pattern'), {
        target: { value: style },
      });
      expect(
        JSON.parse(screen.getByTestId('settings').textContent!).style,
      ).toBe(style);
    }
    expect(screen.getByLabelText(/Palette blend/)).toBeDisabled();
    fireEvent.change(screen.getByLabelText('Palette'), {
      target: { value: 'green' },
    });
    expect(screen.getByLabelText(/Palette blend/)).toBeEnabled();
    for (const { key, label, min } of ditherAdjustments) {
      fireEvent.change(screen.getByLabelText(new RegExp(label)), {
        target: { value: String(min) },
      });
      expect(JSON.parse(screen.getByTestId('settings').textContent!)[key]).toBe(
        min,
      );
    }
    fireEvent.click(screen.getByLabelText('Invert tones'));
    expect(JSON.parse(screen.getByTestId('settings').textContent!).invert).toBe(
      true,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Reset look' }));
    expect(JSON.parse(screen.getByTestId('settings').textContent!)).toEqual(
      defaultDitherSettings,
    );
  });

  it('downloads the current settings as a versioned JSON file and releases the URL', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    let downloaded: Blob | undefined;
    const create = vi.fn((blob: Blob) => {
      downloaded = blob;
      return 'blob:settings';
    });
    const revoke = vi.fn();
    const click = vi
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(function (this: HTMLAnchorElement) {
        expect(this.download).toBe('between-frames-dithering.json');
        expect(this.href).toBe('blob:settings');
      });
    vi.stubGlobal('URL', { createObjectURL: create, revokeObjectURL: revoke });
    try {
      render(<Studio />);
      fireEvent.change(screen.getByLabelText('Pattern'), {
        target: { value: 'dots' },
      });
      fireEvent.change(screen.getByLabelText(/Contrast/), {
        target: { value: '2' },
      });
      fireEvent.click(
        screen.getByRole('button', { name: 'Download settings' }),
      );
      expect(click).toHaveBeenCalledOnce();
      expect(downloaded?.type).toBe('application/json');
      const content = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.readAsText(downloaded!);
      });
      const settings = JSON.parse(screen.getByTestId('settings').textContent!);
      expect(content).toBe(serializeDitherSettings(settings));
      expect(JSON.parse(content)).toEqual({
        application: 'Between Frames',
        version: 1,
        settings,
      });
      expect(settings).toMatchObject({ style: 'dots', contrast: 2 });
      vi.runAllTimers();
      expect(revoke).toHaveBeenCalledWith('blob:settings');
      expect(document.querySelector('a[download]')).toBeNull();
    } finally {
      click.mockRestore();
      vi.unstubAllGlobals();
      vi.useRealTimers();
    }
  });
  it('updates intensity, grain, levels and pattern independently, including a zero-effect preview', () => {
    render(<Studio />);
    fireEvent.change(screen.getByLabelText(/Intensity/), {
      target: { value: '0' },
    });
    fireEvent.change(screen.getByLabelText(/Grain size/), {
      target: { value: '4' },
    });
    fireEvent.change(screen.getByLabelText(/Color levels/), {
      target: { value: '4' },
    });
    fireEvent.change(screen.getByLabelText('Pattern'), {
      target: { value: 'noise' },
    });
    expect(
      JSON.parse(screen.getByTestId('settings').textContent!),
    ).toMatchObject({
      intensity: 0,
      cellSize: 4,
      levels: 4,
      style: 'noise',
      palette: 'original',
    });
    fireEvent.change(screen.getByLabelText('Pattern'), {
      target: { value: 'lines' },
    });
    expect(screen.getByLabelText('Pattern')).toHaveValue('lines');
  });

  it('allows custom colors and restores the approved look', () => {
    render(<Studio />);
    expect(screen.queryByLabelText('Shadows')).not.toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Palette'), {
      target: { value: 'custom' },
    });
    fireEvent.change(screen.getByLabelText('Shadows'), {
      target: { value: '#123456' },
    });
    fireEvent.change(screen.getByLabelText('Highlights'), {
      target: { value: '#abcdef' },
    });
    const settings = JSON.parse(screen.getByTestId('settings').textContent!);
    expect(ditherColors(settings)).toEqual(['#123456', '#abcdef']);
    fireEvent.click(screen.getByRole('button', { name: 'Reset look' }));
    expect(JSON.parse(screen.getByTestId('settings').textContent!)).toEqual(
      defaultDitherSettings,
    );
    expect(screen.queryByLabelText('Shadows')).not.toBeInTheDocument();
  });

  it('provides distinct palettes in display color space', () => {
    const palettes = ['mono', 'amber', 'cyan', 'green', 'violet'] as const;
    const colors = palettes.map((palette) =>
      ditherColors({ ...defaultDitherSettings, palette }),
    );
    expect(new Set(colors.map((palette) => JSON.stringify(palette))).size).toBe(
      5,
    );
    expect(displayRgb('#ff8000')).toEqual([1, 128 / 255, 0]);
  });
});
