import { expect, it } from 'vitest';
import { projects } from './projects';
import {
  projectMetadata,
  renderProjectMetadata,
  renderSitemap,
} from './projectMetadata';

const indexTemplate = `<!doctype html>
<html lang="en"><head>
<link rel="canonical" href="https://angeloaosol.xyz/" />
<meta name="description" content="Home description" />
<meta property="og:url" content="https://angeloaosol.xyz/" />
<meta property="og:title" content="Home title" />
<meta property="og:description" content="Home description" />
<meta property="og:image" content="https://angeloaosol.xyz/social-preview.png" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:image:alt" content="Home image" />
<meta name="twitter:title" content="Home title" />
<meta name="twitter:description" content="Home description" />
<meta name="twitter:image" content="https://angeloaosol.xyz/social-preview.png" />
<title>Home title</title>
</head><body></body></html>`;

it('creates unique project metadata and structured data for static routes', () => {
  const project = projects[0];
  const metadata = projectMetadata(project);
  const html = renderProjectMetadata(indexTemplate, project);

  expect(metadata.title).toBe('Camera Roll — Angelo AoSol | Between Frames');
  expect(metadata.canonical).toBe(
    'https://angeloaosol.xyz/projects/camera-roll/',
  );
  expect(metadata.image).toBe(
    'https://angeloaosol.xyz/media/projects/camera-roll.jpg',
  );
  expect(html).toContain(`<title>${metadata.title}</title>`);
  expect(html).toContain(`content="${metadata.description}"`);
  expect(html).toContain('"@type":"CreativeWork"');
  expect(html).not.toContain('og:image:width');
  expect(html).not.toContain('Home description');
});

it('lists the homepage and every shareable project URL in its sitemap', () => {
  const sitemap = renderSitemap(projects);
  expect(sitemap).toContain('<loc>https://angeloaosol.xyz/</loc>');
  expect(sitemap).toContain('<loc>https://angeloaosol.xyz/about/</loc>');
  expect(sitemap.match(/<url>/g)).toHaveLength(projects.length + 2);
  for (const project of projects)
    expect(sitemap).toContain(
      `<loc>https://angeloaosol.xyz/projects/${project.slug}/</loc>`,
    );
});
