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
        The 3D scene could not load. Use Work index or About to explore the portfolio.
      </p>
    ) : (
      this.props.children
    );
  }
}
