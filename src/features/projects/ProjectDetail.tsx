import { useEffect, useRef } from 'react';
import { projects, type Project } from '../../content/projects';

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
        <h2 id="project-title">{project.title}</h2>
        <div className="project-editorial">
          <div className="project-copy">
            <p className="project-copy-label">The work</p>
            <div className="project-description">
              {project.description.split('\n\n').map((paragraph) => (
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
                  onLoadedMetadata={(event) => {
                    if (event.currentTarget.paused)
                      event.currentTarget.currentTime = 0.01;
                  }}
                  aria-label={`${project.title} — video ${index + 1}`}
                >
                  <source
                    src={video.url}
                    type={
                      video.url.toLowerCase().endsWith('.mov')
                        ? 'video/quicktime'
                        : 'video/mp4'
                    }
                  />
                  {video.preview !== video.url && (
                    <source src={video.preview} type="video/mp4" />
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
