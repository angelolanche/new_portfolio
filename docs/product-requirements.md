# Product requirements

The current implementation scope is closed as of 2026-10-27, with no active tasks. This document records product direction and constraints; it is not a checklist of changes awaiting implementation. Preserve the current experience unless a new request changes its scope.

Present the owner as a software engineer focused on interaction, art, and software development. Employment is the primary goal; freelance clients are secondary.

- Provide a navigable 3D space with Projects, About, and Contact destinations.
- Inside the TV, the mouse rotates the camera up to ±120 degrees per axis while parked at a work; the next scroll recenters it. Arrow keys rotate the free-flight camera; WASD and Q/E translate it. Mouse movement also controls room look before TV entry. Desktop scroll travels between complete work stops, with smooth acceleration, braking and framing. On phones and tablets, circular previous/next buttons navigate the stops; portrait phones show a prompt to rotate to landscape. Touching a work opens it, with no free camera look on touch devices. Destination clicks smoothly move toward the chosen work.
- On scroll/Locate arrival, fit only the destination work's white 3D label below or beside its video. Save that arrangement relative to the video in both scroll and free modes; camera movement, resizing and dialogs must not reposition it. A new guided arrival may refit its destination. Follow only the video's float motion. Metadata is black without numbering; preserve the title's chromatic effect.
- Provide a direct navigation menu with smooth, continuous camera movement.
- Open projects as 2D detail pages with shareable URLs such as `/projects/project-name`. Returning restores the previous 3D camera position.
- If 3D cannot load, provide minimal HTML access to projects, about, and contact. Reuse shared content and project pages.
- Contact contains information and professional links; no message form is required.
- Initial public content is English. Do not invent personal details, project claims, or contact information.
- The canvas fills the viewport, with only Work index and About as persistent interface buttons. Dialog navigation and native video controls remain available in content views. The scene runs automatically, with no pause or replay controls or shortcuts. Reduced-motion visitors start directly inside the static signal.

The approved direction is Between Frames: surreal nostalgia, analog sci-fi, and spatial anti-design. BETWEEN_FRAMES_CONTEXT.md remains the creative decision source; consult relevant sections for visual or scene work and preserve the consolidated approved state. Do not reopen approved decisions or generate new references unnecessarily.

References live in references/. The previous guide identified references/between-frames-composition.png as the owner's composition reference; verify availability before relying on it. The preferred storyboard has not been verified locally.
