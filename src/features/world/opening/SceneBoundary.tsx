import { Component, type ReactNode } from 'react';

export class SceneBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? (
      <p className="fallback" role="status">
        The 3D study could not load. This portfolio is in development.
      </p>
    ) : (
      this.props.children
    );
  }
}
