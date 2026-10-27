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
        {project.description && (
          <p className="project-description">{project.description}</p>
        )}
        <div className="project-films">
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
                aria-label={`${project.title} — video ${index + 1}`}
              >
                <source src={video.url} type="video/mp4" />
                <a href={video.url}>Watch video</a>
              </video>
              <figcaption>
                0{index + 1} / {project.title}{' '}
                <a href={video.url} target="_blank" rel="noreferrer">
                  Open film ↗
                </a>
              </figcaption>
            </figure>
          ))}
        </div>
        <a
          className="project-source"
          href={project.source}
          target="_blank"
          rel="noreferrer"
        >
          Original portfolio ↗
        </a>
      </article>
      <span className="detail-bottom">
        ANGELOAOSOL <span aria-hidden="true">●</span>
      </span>
    </dialog>
  );
}
