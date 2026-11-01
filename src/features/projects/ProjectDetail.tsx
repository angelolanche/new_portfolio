import { useEffect, useRef } from 'react';
import { projects, type Project } from '../../content/projects';

function splitProjectDescription(description: string) {
  const paragraphs = description.split(/\r?\n\s*\r?\n/);
  const facts: { label: string; value: string }[] = [];
  const narrative: string[] = [];
  for (const paragraph of paragraphs) {
    const story: string[] = [];
    for (const line of paragraph.split(/\r?\n/)) {
      const fact = line.trim().match(/^([^:\n]{2,48}):\s+(.+)$/);
      if (fact) facts.push({ label: fact[1], value: fact[2] });
      else story.push(line);
    }
    if (story.length > 0) narrative.push(story.join('\n'));
  }
  return { facts, narrative };
}

export function ProjectDetail({
  project,
  onClose,
}: {
  project: Project;
  onClose: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const stills = [
    ...('image' in project ? [project.image] : []),
    ...('images' in project ? project.images : []),
  ].filter(
    (image) => !project.videos.some((video) => video.poster === image.src),
  );
  const { facts, narrative } = splitProjectDescription(project.description);
  useEffect(() => {
    const previous = document.activeElement;
    dialog.current?.showModal();
    return () => {
      if (previous instanceof HTMLElement) previous.focus();
    };
  }, []);
  return (
    <dialog
      ref={dialog}
      className="project-detail"
      aria-labelledby="project-title"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
    >
      <div className="detail-top">
        <span>
          Between Frames / Transmission{' '}
          {String(projects.indexOf(project) + 1).padStart(2, '0')}
        </span>
        <button autoFocus onClick={onClose}>
          Back to signal ↗
        </button>
      </div>
      <article>
        <p className="signal-eyebrow">{project.category}</p>
        <h1 id="project-title">{project.title}</h1>
        <div className="project-editorial">
          <div className="project-copy">
            <p className="project-copy-label">The work</p>
            {facts.length > 0 && (
              <dl className="project-facts" aria-label="Project credits and tools">
                {facts.map(({ label, value }) => (
                  <div key={label}>
                    <dt>{label}</dt>
                    <dd>{value}</dd>
                  </div>
                ))}
              </dl>
            )}
            <div className="project-description">
              {narrative.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
            {'criticism' in project && (
              <aside
                className="project-criticism"
                aria-label="Critical reading"
              >
                <h3>Critical reading</h3>
                <p>{project.criticism.summary}</p>
                <a
                  href={project.criticism.source}
                  target="_blank"
                  rel="noreferrer"
                >
                  Read the full reflection ↗
                </a>
              </aside>
            )}
          </div>
          <div className="project-films">
            {'criticism' in project && (
              <figure className="project-critical-figure">
                <a
                  href={project.criticism.image}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Open critical reading image"
                >
                  <img
                    src={project.criticism.image}
                    alt={`${project.title} — critical reading by ${project.criticism.author}`}
                  />
                </a>
                <figcaption>
                  Critical reading · {project.criticism.author}
                </figcaption>
              </figure>
            )}
            {stills.map((image) => (
              <figure key={image.src}>
                <img
                  className="project-image"
                  src={image.src}
                  alt={`${project.title} documentation`}
                />
                <figcaption>{image.caption}</figcaption>
              </figure>
            ))}
            {project.videos.map((video, index) => (
              <figure key={video.video}>
                <video
                  controls
                  playsInline
                  loop
                  muted
                  autoPlay={index === 0}
                  preload="metadata"
                  poster={video.poster}
                  onLoadedMetadata={(event) => {
                    if (event.currentTarget.paused)
                      event.currentTarget.currentTime = 0.01;
                  }}
                  aria-label={`${project.title} — video ${index + 1}`}
                >
                  <source
                    src={video.preview}
                    type={
                      video.preview.toLowerCase().endsWith('.mov')
                        ? 'video/quicktime'
                        : 'video/mp4'
                    }
                  />
                  {video.url !== video.preview && (
                    <source
                      src={video.url}
                      type={
                        video.url.toLowerCase().endsWith('.mov')
                          ? 'video/quicktime'
                          : 'video/mp4'
                      }
                    />
                  )}
                  <a href={video.url}>Watch video</a>
                </video>
                <figcaption>
                  <span>
                    Film {String(index + 1).padStart(2, '0')} /{' '}
                    {String(project.videos.length).padStart(2, '0')}
                  </span>
                  <span>
                    {'caption' in video ? video.caption : project.title}
                  </span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </article>
      <span className="detail-bottom">
        ANGELOAOSOL <span aria-hidden="true">●</span>
      </span>
    </dialog>
  );
}
