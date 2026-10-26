import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  test: {
    // Geometry and simulation tests need no DOM. UI tests opt into jsdom.
    environment: 'node',
    // Avoid starting a DOM/runtime per CPU core and starving animation tests.
    maxWorkers: 4,
    setupFiles: ['./src/app/testSetup.ts'],
    clearMocks: true,
  },
});
