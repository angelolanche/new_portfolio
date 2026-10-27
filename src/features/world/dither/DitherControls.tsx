import {
  defaultDitherSettings,
  ditherPatterns,
  ditherAdjustments,
  downloadDitherSettings,
  type DitherSettings,
} from './ditherSettings';
import './DitherControls.css';

export function DitherControls({
  settings,
  onChange,
}: {
  settings: DitherSettings;
  onChange: (settings: DitherSettings) => void;
}) {
  function update<K extends keyof DitherSettings>(
    key: K,
    value: DitherSettings[K],
  ) {
    onChange({ ...settings, [key]: value });
  }
  return (
    <details className="dither-controls" data-camera-controls open>
      <summary>Dithering studio</summary>
      <div className="dither-controls-body">
        <p>Explore the room’s texture and color in real time.</p>
        <label htmlFor="dither-intensity">
          Intensity <span>{Math.round(settings.intensity * 100)}%</span>
        </label>
        <input
          id="dither-intensity"
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={settings.intensity}
          onChange={(event) => update('intensity', Number(event.target.value))}
        />
        <label htmlFor="dither-size">
          Grain size <span>{settings.cellSize}px</span>
        </label>
        <input
          id="dither-size"
          type="range"
          min="1"
          max="12"
          step="0.5"
          value={settings.cellSize}
          onChange={(event) => update('cellSize', Number(event.target.value))}
        />
        <label htmlFor="dither-levels">
          Color levels <span>{settings.levels}</span>
        </label>
        <input
          id="dither-levels"
          type="range"
          min="2"
          max="64"
          step="1"
          value={settings.levels}
          onChange={(event) => update('levels', Number(event.target.value))}
        />
        <label htmlFor="dither-style">Pattern</label>
        <select
          id="dither-style"
          value={settings.style}
          onChange={(event) =>
            update('style', event.target.value as DitherSettings['style'])
          }
        >
          {Object.entries(ditherPatterns).map(([value, pattern]) => (
            <option key={value} value={value}>
              {pattern.label}
            </option>
          ))}
        </select>
        <label htmlFor="dither-palette">Palette</label>
        <select
          id="dither-palette"
          value={settings.palette}
          onChange={(event) =>
            update('palette', event.target.value as DitherSettings['palette'])
          }
        >
          <option value="original">Original colors</option>
          <option value="mono">Monochrome</option>
          <option value="amber">Amber</option>
          <option value="cyan">Cyan</option>
          <option value="green">Phosphor green</option>
          <option value="violet">Violet</option>
          <option value="custom">Custom duotone</option>
        </select>
        {settings.palette === 'custom' && (
          <div className="dither-colors">
            <label>
              Shadows{' '}
              <input
                type="color"
                value={settings.dark}
                onChange={(event) => update('dark', event.target.value)}
              />
            </label>
            <label>
              Highlights{' '}
              <input
                type="color"
                value={settings.light}
                onChange={(event) => update('light', event.target.value)}
              />
            </label>
          </div>
        )}
        <details className="dither-advanced" open>
          <summary>Pattern & color adjustments</summary>
          <div className="dither-adjustments">
            {ditherAdjustments.map(({ key, label, min, max, step }) => (
              <div key={key}>
                <label htmlFor={`dither-${key}`}>
                  {label}
                  <span>
                    {settings[key].toFixed(key === 'rotation' ? 0 : 2)}
                    {key === 'rotation' ? '°' : ''}
                  </span>
                </label>
                <input
                  id={`dither-${key}`}
                  type="range"
                  min={min}
                  max={max}
                  step={step}
                  value={settings[key]}
                  disabled={
                    key === 'paletteMix' && settings.palette === 'original'
                  }
                  onChange={(event) => update(key, Number(event.target.value))}
                />
              </div>
            ))}
            <label>
              Invert tones
              <input
                type="checkbox"
                checked={settings.invert}
                onChange={(event) => update('invert', event.target.checked)}
              />
            </label>
          </div>
        </details>
        <p>
          0% shows the original scene. Fewer levels create stronger contrast
          between tones.
        </p>
        <button type="button" onClick={() => downloadDitherSettings(settings)}>
          Download settings
        </button>
        <button
          type="button"
          onClick={() => onChange({ ...defaultDitherSettings })}
        >
          Reset look
        </button>
      </div>
    </details>
  );
}
