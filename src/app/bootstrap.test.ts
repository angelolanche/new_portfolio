import { expect, it, vi } from 'vitest';

const startup = vi.hoisted(() => ({
  releaseArtwork: null as (() => void) | null,
  applicationStarted: vi.fn(),
}));
vi.mock('./loadingArtwork', () => ({
  showLoadingArtwork: () =>
    new Promise<void>((resolve) => {
      startup.releaseArtwork = resolve;
    }),
}));
vi.mock('./main', () => {
  startup.applicationStarted();
  return {};
});

it('does not evaluate the application until the artwork paint gate completes', async () => {
  const boot = import('./bootstrap');
  await vi.waitFor(() => expect(startup.releaseArtwork).toBeTypeOf('function'));
  expect(startup.applicationStarted).not.toHaveBeenCalled();
  startup.releaseArtwork!();
  await boot;
  expect(startup.applicationStarted).toHaveBeenCalledOnce();
});
