import { useEffect, useRef } from 'react';
import { aboutParagraphs, aboutVideo } from '../../content/about';

export function AboutDetail({ onClose }: { onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const reducedMotion = Boolean(
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches,
  );
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
      <div className="about-content">
        <svg
          className="about-threads"
          viewBox="0 0 1440 2400"
          preserveAspectRatio="none"
          aria-hidden="true"
          focusable="false"
        >
          <path d="M -80 270 C 270 195, 415 450, 790 320 S 1220 180, 1520 345" />
          <path d="M -80 610 C 340 740, 520 420, 875 545 S 1260 740, 1520 575" />
          <path d="M 170 -90 C 320 220, 730 180, 980 470 S 1180 780, 1340 990" />
          <path d="M -80 85 C 210 210, 440 55, 725 150 S 1210 280, 1520 105" />
          <path d="M -80 185 C 270 100, 465 300, 780 230 S 1260 50, 1520 200" />
          <path d="M -80 370 C 215 480, 430 270, 795 410 S 1240 530, 1520 380" />
          <path d="M -80 475 C 290 355, 500 610, 850 470 S 1220 320, 1520 495" />
          <path d="M -80 715 C 230 590, 460 800, 810 690 S 1250 540, 1520 735" />
          <path d="M -80 825 C 275 930, 520 690, 875 790 S 1260 960, 1520 815" />
          <path d="M 25 -90 C 210 225, 85 450, 340 680 S 580 810, 650 990" />
          <path d="M 360 -90 C 175 245, 610 300, 460 570 S 720 850, 790 990" />
          <path d="M 575 -90 C 750 160, 500 430, 730 625 S 1010 780, 960 990" />
          <path d="M 790 -90 C 570 180, 960 310, 860 545 S 1100 770, 1110 990" />
          <path d="M 1090 -90 C 920 245, 1250 420, 1060 650 S 1300 835, 1340 990" />
          <path d="M 1370 -90 C 1200 150, 1510 390, 1280 590 S 1440 830, 1510 990" />
          <path d="M -80 1010 C 250 870, 480 1130, 780 990 S 1240 850, 1520 1040" />
          <path d="M -80 1150 C 230 1280, 500 980, 830 1120 S 1250 1320, 1520 1130" />
          <path d="M -80 1300 C 300 1150, 510 1450, 870 1280 S 1230 1110, 1520 1330" />
          <path d="M -80 1450 C 220 1600, 460 1270, 800 1430 S 1240 1630, 1520 1460" />
          <path d="M -80 1600 C 290 1420, 510 1750, 850 1580 S 1250 1420, 1520 1630" />
          <path d="M -80 1750 C 250 1920, 480 1570, 810 1740 S 1250 1940, 1520 1770" />
          <path d="M -80 1900 C 310 1730, 520 2040, 870 1880 S 1260 1710, 1520 1940" />
          <path d="M -80 2050 C 240 2220, 470 1890, 820 2040 S 1250 2230, 1520 2070" />
          <path d="M -80 2200 C 300 2030, 520 2350, 870 2170 S 1270 2010, 1520 2240" />
          <path d="M -80 2340 C 260 2480, 510 2180, 830 2320 S 1250 2500, 1520 2350" />
          <path d="M 80 850 C 280 1120, 70 1390, 330 1640 S 210 2110, 430 2480" />
          <path d="M 240 820 C 40 1110, 490 1350, 290 1630 S 520 2110, 370 2470" />
          <path d="M 480 830 C 700 1110, 350 1400, 620 1660 S 450 2130, 730 2480" />
          <path d="M 640 820 C 430 1110, 830 1370, 650 1650 S 900 2120, 750 2470" />
          <path d="M 820 840 C 1070 1130, 680 1400, 950 1660 S 760 2140, 1050 2480" />
          <path d="M 980 820 C 750 1130, 1170 1380, 990 1650 S 1240 2110, 1090 2470" />
          <path d="M 1140 830 C 1390 1110, 1000 1410, 1280 1660 S 1090 2130, 1380 2480" />
          <path d="M 1300 820 C 1090 1110, 1510 1380, 1320 1650 S 1540 2110, 1410 2470" />
          <path d="M -40 950 C 260 1220, 350 1510, 710 1800 S 1130 2140, 1520 2410" />
          <path d="M 1500 930 C 1180 1190, 1080 1510, 730 1800 S 330 2140, -80 2410" />
        </svg>
        <div className="detail-top">
          <span>Between Frames / The artist</span>
          <button autoFocus onClick={onClose}>
            Back to signal ↗
          </button>
        </div>
        <article>
          <p className="signal-eyebrow">New Media Artist</p>
          <h2 id="about-title">Angelo AoSol</h2>
          <div className="about-layout">
            <figure className="about-media">
              <video
                controls
                autoPlay={!reducedMotion}
                muted
                loop
                playsInline
                preload="metadata"
                poster={aboutVideo.poster}
                aria-label="Angelo AoSol — About film"
              >
                <source src={aboutVideo.src} type="video/mp4" />
              </video>
              <figcaption>Angelo AoSol / About film</figcaption>
            </figure>
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
          </div>
          <a className="project-source" href="mailto:angelo.pjsol@gmail.com">
            angelo.pjsol@gmail.com ↗
          </a>
        </article>
      </div>
    </dialog>
  );
}
