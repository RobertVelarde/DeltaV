import OrbitalGraph from './components/OrbitalGraph';
import ErrorBoundary from './components/ErrorBoundary';
import { validateSystemData } from './data/systemData';

// Validate data integrity at startup in development.
// Errors are logged to the console; the app continues to render a
// partially-valid dataset so individual data issues can be diagnosed visually.
if (import.meta.env.DEV) {
  validateSystemData();
}

function App() {
  return (
    <ErrorBoundary label="Orbital Map">
      <OrbitalGraph />
    </ErrorBoundary>
  );
}

export default App;
