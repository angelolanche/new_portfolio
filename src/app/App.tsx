import { Opening } from '../features/world/Opening';
export function App() {
  return (
    <main>
      <header>
        <span>Between Frames</span>
        <span>Opening study / 01</span>
      </header>
      <h1 className="sr-only">Interactive Portfolio</h1>
      <Opening />
      <footer>This portfolio is in development.</footer>
    </main>
  );
}
