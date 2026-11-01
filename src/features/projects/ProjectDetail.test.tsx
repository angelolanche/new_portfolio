// @vitest-environment jsdom
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { render, screen } from '@testing-library/react';
import { beforeAll, expect, it, vi } from 'vitest';
import { projects, signalVideoFor } from '../../content/projects';
import { ProjectDetail } from './ProjectDetail';

beforeAll(() => {
  HTMLDialogElement.prototype.showModal = vi.fn(function (
    this: HTMLDialogElement,
  ) {
    this.setAttribute('open', '');
  });
});

it('keeps every work and its local media linked to actual files', () => {
  expect(projects).toHaveLength(13);
  for (const project of projects) {
    expect(project.slug).toBeTruthy();
    expect(project.title).toBeTruthy();
    expect(project.description.trim()).toBeTruthy();
    expect(project.source).toMatch(/^https:\/\//);
    expect(project.videos.length).toBeGreaterThan(0);
    const signalVideo = signalVideoFor(project);
    expect(signalVideo.preview, `${project.slug}: signal video`).toMatch(
      /^\/media\/projects\/.+\.mp4$/,
    );
    expect(signalVideo.poster, `${project.slug}: signal poster`).toMatch(
      /^\/media\/projects\/.+\.(?:jpg|png|webp)$/,
    );
    for (const path of [signalVideo.preview, signalVideo.poster]) {
      expect(
        existsSync(join(process.cwd(), 'public', path.slice(1))),
        `${project.slug}: signal asset ${path}`,
      ).toBe(true);
    }
    const paths = [
      ...('image' in project ? [project.image.src] : []),
      ...('images' in project ? project.images.map((image) => image.src) : []),
      ...('criticism' in project ? [project.criticism.image] : []),
      ...project.videos.flatMap((video) => [
        video.url,
        video.preview,
        video.poster,
      ]),
    ];
    for (const path of paths.filter((path) =>
      path.startsWith('/media/projects/'),
    )) {
      expect(
        existsSync(join(process.cwd(), 'public', path.slice(1))),
        `${project.slug}: ${path}`,
      ).toBe(true);
    }
    for (const video of project.videos) {
      if (video.url.startsWith('/media/projects/'))
        expect(video.preview).toBe(video.url);
    }
  }
});

it('surfaces each documented role and tool as scannable project facts', () => {
  const deliveryRoom = projects.find((project) => project.slug === 'bmw')!;
  render(<ProjectDetail project={deliveryRoom} onClose={() => {}} />);

  const facts = screen.getByText('Role').closest('.project-facts');
  expect(facts).not.toBeNull();
  expect(facts).toHaveTextContent('Technical direction');
  expect(facts).toHaveTextContent('Systems integration');
  expect(screen.getByText('Tools')).toBeInTheDocument();
  expect(facts).toHaveTextContent(/TouchDesigner.*WebSockets.*Python.*Bash/);
  expect(
    screen.getByText(/I was responsible for making the project happen as a functioning system/),
  ).toBeInTheDocument();
});

it('shows the Camera Roll poster and only the selected films', () => {
  render(<ProjectDetail project={projects[0]} onClose={() => {}} />);
  expect(
    screen.getByRole('img', { name: 'Camera Roll documentation' }),
  ).toHaveAttribute('src', '/media/projects/camera-roll-lucas-poster.jpg');
  const films = screen.getAllByLabelText(/Camera Roll — video/);
  expect(films).toHaveLength(3);
  expect(
    films.map((film) => film.querySelector('source')?.getAttribute('src')),
  ).toEqual([
    '/media/projects/camera-roll.mp4',
    '/media/projects/camera-roll-lucas-announcement.mp4',
    '/media/projects/camera-roll-dufl-event.mp4',
  ]);
  expect(films[0]).toHaveAttribute('poster', '/media/projects/camera-roll.jpg');
  expect(films[0].querySelectorAll('source')).toHaveLength(2);
  expect(films[0].querySelectorAll('source')[1]).toHaveAttribute(
    'src',
    projects[0].videos[0].url,
  );
});

it('presents the verified critical reading on AutoRRetrato with its original post', () => {
  render(<ProjectDetail project={projects[5]} onClose={() => {}} />);
  expect(screen.getByText('Critical reading')).toBeInTheDocument();
  expect(screen.getAllByText(/@ezioluiz\.psi/).length).toBeGreaterThan(0);
  expect(
    screen.getByRole('img', {
      name: 'AutoRRetrato — critical reading by @ezioluiz.psi',
    }),
  ).toHaveAttribute('src', '/media/projects/autorretrato-ezio-critique.webp');
  expect(
    screen.getByRole('link', { name: 'Read the full reflection ↗' }),
  ).toHaveAttribute(
    'href',
    'https://www.instagram.com/p/DSdXdqJEpzj/?img_index=2',
  );
});

it('shows the requested project images and names the MIS venue', () => {
  const coisa = projects.find((item) => item.slug === 'coisa-numero-1')!;
  const { rerender } = render(
    <ProjectDetail project={coisa} onClose={() => {}} />,
  );
  expect(
    screen.getAllByRole('img', { name: 'Coisa Numero 1 documentation' })[0],
  ).toHaveAttribute('src', '/media/projects/coisa-8-lentes.png');
  expect(screen.queryByText(/Installation sketch/)).not.toBeInTheDocument();

  const cerebro = projects.find(
    (item) => item.slug === 'interactive-led-brain',
  )!;
  rerender(<ProjectDetail project={cerebro} onClose={() => {}} />);
  expect(
    screen.getByText(/Museu da Imagem e do Som \(MIS\) in São Paulo/),
  ).toBeInTheDocument();

  const autorretrato = projects.find((item) => item.slug === 'autorretrato')!;
  rerender(<ProjectDetail project={autorretrato} onClose={() => {}} />);
  expect(
    screen.getByRole('img', { name: 'AutoRRetrato documentation' }),
  ).toHaveAttribute(
    'src',
    '/media/projects/autorretrato-festa-praga-full-poster.webp',
  );

  const midiaHell = projects.find((item) => item.slug === 'midia-hell')!;
  rerender(<ProjectDetail project={midiaHell} onClose={() => {}} />);
  expect(
    screen.getByRole('img', { name: 'Midia Hell documentation' }),
  ).toHaveAttribute('src', '/media/projects/midia-hell-event-poster.jpg');
});

it('shows the Gallery 138 photograph and identifies its Pixo film', () => {
  render(<ProjectDetail project={projects[2]} onClose={() => {}} />);
  expect(
    screen.getByText('Gallery 138 documentation photograph'),
  ).toBeInTheDocument();
  expect(
    screen.getByRole('img', { name: 'Opening of Gallery 138 documentation' }),
  ).toHaveAttribute('src', '/media/projects/gallery-138-photo.jpg');
  expect(
    screen
      .getByLabelText('Opening of Gallery 138 — video 2')
      .querySelector('source'),
  ).toHaveAttribute('src', '/media/projects/gallery-138-pixo.mp4');
  expect(screen.getByText('Pixo')).toBeInTheDocument();
});

it('shows Aleta documentation as a third Midia Hell video without the old photo', () => {
  const project = projects.find((item) => item.slug === 'midia-hell')!;
  render(<ProjectDetail project={project} onClose={() => {}} />);
  expect(
    screen.queryByText(
      'Hell de Janeiro event poster · public post by Laladiaba',
    ),
  ).not.toBeInTheDocument();
  const films = screen.getAllByLabelText(/Midia Hell — video/);
  expect(films).toHaveLength(3);
  expect(films[2].querySelector('source')).toHaveAttribute(
    'src',
    '/media/projects/midia-hell-aleta.mp4',
  );
  expect(screen.getByText('Aleta documentation')).toBeInTheDocument();
});

it('uses Desespero Tropical Film 2 for the signal box without changing the page film order', () => {
  const project = projects.find((item) => item.slug === 'desespero-tropical')!;
  expect(signalVideoFor(project).preview).toBe(
    '/media/projects/desespero-tropical-downloads.mp4',
  );
  render(<ProjectDetail project={project} onClose={() => {}} />);
  const films = screen.getAllByLabelText(/Desespero Tropical — video/);
  expect(
    films.map((film) => film.querySelector('source')?.getAttribute('src')),
  ).toEqual([
    '/media/projects/desespero-tropical-video.mp4',
    '/media/projects/desespero-tropical-downloads.mp4',
  ]);
  expect(
    screen.getByText(/existing project by artist Bia Raposo/),
  ).toBeInTheDocument();
  expect(
    screen.getByText(
      /Invited to join this presentation, I created visual effects and operated the projection, working alongside Alexandre Beraldo in both roles/,
    ),
  ).toBeInTheDocument();
});

it('keeps editorial copy beside media, avoids duplicate video covers and omits source links', () => {
  const { rerender } = render(
    <ProjectDetail project={projects[2]} onClose={() => {}} />,
  );
  expect(
    screen
      .getByText(/Created for the opening of Gallery 138/)
      .closest('.project-copy'),
  ).toBeInTheDocument();
  expect(
    screen.queryByRole('link', {
      name: /source|Open film|Original portfolio/i,
    }),
  ).not.toBeInTheDocument();
  expect(
    screen
      .getByLabelText('Opening of Gallery 138 — video 2')
      .querySelector('source'),
  ).toHaveAttribute('type', 'video/mp4');
  expect(
    screen
      .getByLabelText('Opening of Gallery 138 — video 2')
      .querySelectorAll('source'),
  ).toHaveLength(1);
  expect(
    screen.getByLabelText('Opening of Gallery 138 — video 2'),
  ).toHaveAttribute('poster', '/media/projects/gallery-138.jpg');

  rerender(<ProjectDetail project={projects[5]} onClose={() => {}} />);
  expect(
    screen.queryByText('AutoRRetrato · Instagram variation'),
  ).not.toBeInTheDocument();
  expect(
    screen.getByText('Festa Praga · full event poster'),
  ).toBeInTheDocument();
  expect(screen.getAllByLabelText(/AutoRRetrato — video/)).toHaveLength(2);
});
