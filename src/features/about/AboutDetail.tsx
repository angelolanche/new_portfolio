import { useEffect, useRef } from 'react';
import { aboutParagraphs, aboutSource } from '../../content/about';

export function AboutDetail({ onClose }: { onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    dialog.current?.showModal();
  }, []);
  return (
    <dialog
      ref={dialog}
      className="project-detail about-detail"
      aria-labelledby="about-title"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
    >
      <div className="detail-top">
        <span>Between Frames / The artist</span>
        <button autoFocus onClick={onClose}>
          Back to signal ↗
        </button>
      </div>
      <article>
        <p className="signal-eyebrow">New Media Artist</p>
        <h2 id="about-title">Angelo AoSol</h2>
        <div className="about-copy">
          {aboutParagraphs
            .flatMap((text) =>
              text
                .split(/\n+/)
                .map((p) => p.trim())
                .filter(Boolean),
            )
            .map((text, i) => (
              <p key={i}>{text}</p>
            ))}
        </div>
        <a className="project-source" href="mailto:angelo.pjsol@gmail.com">
          angelo.pjsol@gmail.com ↗
        </a>
        <a
          className="project-source"
          href={aboutSource}
          target="_blank"
          rel="noreferrer"
        >
          Original About ↗
        </a>
      </article>
    </dialog>
  );
}
