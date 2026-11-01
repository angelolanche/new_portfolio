import type { Project } from './projects.ts';

export const portfolioUrl = 'https://angeloaosol.xyz';

export type PageMetadata = {
  title: string;
  description: string;
  canonical: string;
  image: string;
  imageAlt: string;
};

export function homeMetadata(): PageMetadata {
  return {
    title: 'Creative Technologist — Angelo AoSol | Between Frames',
    description:
      "Creative technologist Angelo AoSol presents moving images, installations, and visual experiments in an interactive portfolio.",
    canonical: `${portfolioUrl}/`,
    image: `${portfolioUrl}/social-preview.png`,
    imageAlt: 'A red sun with long rays against a black background',
  };
}

export function aboutMetadata(): PageMetadata {
  return {
    title: 'About — Angelo AoSol | Creative Technologist',
    description:
      'About Angelo AoSol and his practice across interaction, art, and software development.',
    canonical: `${portfolioUrl}/about/`,
    image: `${portfolioUrl}/social-preview.png`,
    imageAlt: 'A red sun with long rays against a black background',
  };
}

export function projectMetadata(project: Project): PageMetadata {
  const firstParagraph = project.description
    .split(/\r?\n\s*\r?\n/)[0]
    .replace(/\s+/g, ' ')
    .trim();
  const description = excerpt(firstParagraph, 160);
  const poster = project.videos[0]?.poster;
  return {
    title: `${project.title} — Angelo AoSol | Between Frames`,
    description,
    canonical: `${portfolioUrl}/projects/${project.slug}/`,
    image: `${portfolioUrl}${poster ?? '/social-preview.png'}`,
    imageAlt: `${project.title} project documentation`,
  };
}

export function applyPageMetadata(metadata: PageMetadata) {
  document.title = metadata.title;
  setCanonical(metadata.canonical);
  const tags = [
    ['name', 'description', metadata.description],
    ['property', 'og:type', 'website'],
    ['property', 'og:url', metadata.canonical],
    ['property', 'og:title', metadata.title],
    ['property', 'og:description', metadata.description],
    ['property', 'og:image', metadata.image],
    ['property', 'og:image:alt', metadata.imageAlt],
    ['name', 'twitter:card', 'summary_large_image'],
    ['name', 'twitter:title', metadata.title],
    ['name', 'twitter:description', metadata.description],
    ['name', 'twitter:image', metadata.image],
  ] as const;
  for (const [attribute, key, content] of tags) {
    let tag = document.head.querySelector<HTMLMetaElement>(
      `meta[${attribute}="${key}"]`,
    );
    if (!tag) {
      tag = document.createElement('meta');
      tag.setAttribute(attribute, key);
      document.head.append(tag);
    }
    tag.content = content;
  }
}

export function renderProjectMetadata(html: string, project: Project) {
  const metadata = projectMetadata(project);
  const projectData = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: project.title,
    description: metadata.description,
    url: metadata.canonical,
    image: metadata.image,
    genre: project.category,
  }).replace(/</g, '\\u003c');
  return renderPageMetadata(html, metadata, projectData);
}

export function renderPageMetadata(
  html: string,
  metadata: PageMetadata,
  structuredData?: string,
) {
  let result = replace(
    html,
    /<link\s+rel="canonical"\s+href="[^"]+"\s*\/?>/i,
    `<link rel="canonical" href="${escapeAttribute(metadata.canonical)}" />`,
  );
  result = replace(result, /<title>[^<]*<\/title>/i, `<title>${escapeHtml(metadata.title)}</title>`);
  for (const [attribute, key, content] of [
    ['name', 'description', metadata.description],
    ['property', 'og:url', metadata.canonical],
    ['property', 'og:title', metadata.title],
    ['property', 'og:description', metadata.description],
    ['property', 'og:image', metadata.image],
    ['property', 'og:image:alt', metadata.imageAlt],
    ['name', 'twitter:title', metadata.title],
    ['name', 'twitter:description', metadata.description],
    ['name', 'twitter:image', metadata.image],
  ] as const) {
    const pattern = new RegExp(
      `<meta\\s+${attribute}="${escapeRegExp(key)}"\\s+content="[^"]*"\\s*\\/?>`,
      'i',
    );
    result = replace(
      result,
      pattern,
      `<meta ${attribute}="${escapeAttribute(key)}" content="${escapeAttribute(content)}" />`,
    );
  }
  result = result.replace(
    /\s*<meta\s+property="og:image:(?:width|height)"[^>]*\/?>/gi,
    '',
  );
  if (!structuredData) return result;
  return result.replace(
    '</head>',
    `  <script type="application/ld+json">${structuredData}</script>\n  </head>`,
  );
}

export function renderSitemap(projects: readonly Project[]) {
  const locations = [
    `${portfolioUrl}/`,
    aboutMetadata().canonical,
    ...projects.map((project) => projectMetadata(project).canonical),
  ];
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${locations.map((url) => `  <url><loc>${escapeHtml(url)}</loc></url>`).join('\n')}\n</urlset>\n`;
}

function setCanonical(href: string) {
  let canonical = document.head.querySelector<HTMLLinkElement>(
    'link[rel="canonical"]',
  );
  if (!canonical) {
    canonical = document.createElement('link');
    canonical.rel = 'canonical';
    document.head.append(canonical);
  }
  canonical.href = href;
}

function excerpt(text: string, maximum: number) {
  if (text.length <= maximum) return text;
  const shortened = text.slice(0, maximum - 1);
  const boundary = shortened.lastIndexOf(' ');
  return `${shortened.slice(0, boundary > 0 ? boundary : maximum - 1)}…`;
}

function replace(value: string, pattern: RegExp, replacement: string) {
  if (!pattern.test(value)) throw new Error(`SEO template tag not found: ${pattern}`);
  return value.replace(pattern, replacement);
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function escapeAttribute(value: string) {
  return escapeHtml(value).replace(/"/g, '&quot;');
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
