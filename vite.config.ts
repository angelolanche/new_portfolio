import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import type { Plugin, ResolvedConfig } from 'vite';
import { projects } from './src/content/projects.ts';
import {
  aboutMetadata,
  portfolioUrl,
  renderPageMetadata,
  renderProjectMetadata,
  renderSitemap,
} from './src/content/projectMetadata.ts';

function projectSeoPages(): Plugin {
  let outDir = 'dist';
  return {
    name: 'project-seo-pages',
    apply: 'build',
    configResolved(config: ResolvedConfig) {
      outDir = resolve(config.root, config.build.outDir);
    },
    async closeBundle() {
      const html = await readFile(resolve(outDir, 'index.html'), 'utf8');
      for (const project of projects) {
        const directory = resolve(outDir, 'projects', project.slug);
        await mkdir(directory, { recursive: true });
        await writeFile(
          resolve(directory, 'index.html'),
          renderProjectMetadata(html, project),
          'utf8',
        );
      }
      const aboutDirectory = resolve(outDir, 'about');
      await mkdir(aboutDirectory, { recursive: true });
      await writeFile(
        resolve(aboutDirectory, 'index.html'),
        renderPageMetadata(html, aboutMetadata()),
        'utf8',
      );
      await writeFile(resolve(outDir, 'sitemap.xml'), renderSitemap(projects));
      await writeFile(
        resolve(outDir, 'robots.txt'),
        `User-agent: *\nAllow: /\nSitemap: ${portfolioUrl}/sitemap.xml\n`,
      );
    },
  };
}

export default defineConfig({
  plugins: [react(), projectSeoPages()],
  test: {
    // Geometry and simulation tests need no DOM. UI tests opt into jsdom.
    environment: 'node',
    // Avoid starting a DOM/runtime per CPU core and starving animation tests.
    maxWorkers: 4,
    setupFiles: ['./src/app/testSetup.ts'],
    clearMocks: true,
  },
});
