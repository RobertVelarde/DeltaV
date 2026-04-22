import { Component } from 'react';
import { COLORS, FONT } from '../utils/theme';

/**
 * ErrorBoundary — catches runtime errors in any child subtree and renders a
 * styled fallback UI instead of crashing the entire application.
 *
 * Wrap any component whose failure should be isolated (e.g. OrbitalGraph,
 * pathfinding-dependent panels) so the rest of the page can remain usable.
 *
 * @example
 * <ErrorBoundary label="Orbital Map">
 *   <OrbitalGraph />
 * </ErrorBoundary>
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // Surface the error in development; omit in production to avoid leaking
    // stack traces to end-users.
    if (import.meta.env.DEV) {
      console.error('[ErrorBoundary] Caught error:', error, info.componentStack);
    }
  }

  render() {
    if (this.state.hasError) {
      const { label = 'Component' } = this.props;
      return (
        <div
          role="alert"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            height: '100%',
            background: COLORS.background,
            color: COLORS.panelText,
            fontFamily: FONT.mono,
            gap: '12px',
            padding: '24px',
          }}
        >
          <span style={{ fontSize: '24px', color: '#ef4444' }}>⚠</span>
          <p style={{ color: '#ef4444', fontWeight: 'bold', letterSpacing: '0.1em' }}>
            {label.toUpperCase()} FAILURE
          </p>
          <p style={{ fontSize: '12px', color: COLORS.panelTextDim, textAlign: 'center', maxWidth: '400px' }}>
            An unexpected error occurred in this module. Reload the page to
            try again.
          </p>
          {import.meta.env.DEV && this.state.error && (
            <pre
              style={{
                fontSize: '10px',
                color: COLORS.panelTextDim,
                background: COLORS.panelBg,
                border: `1px solid ${COLORS.panelBorder}`,
                padding: '12px',
                borderRadius: '4px',
                maxWidth: '600px',
                overflowX: 'auto',
                whiteSpace: 'pre-wrap',
              }}
            >
              {this.state.error.toString()}
            </pre>
          )}
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            style={{
              marginTop: '8px',
              padding: '6px 16px',
              background: COLORS.panelBorder,
              border: `1px solid ${COLORS.accentGreen}`,
              color: COLORS.accentGreen,
              fontFamily: FONT.mono,
              fontSize: '12px',
              letterSpacing: '0.1em',
              cursor: 'pointer',
              borderRadius: '4px',
            }}
          >
            RETRY
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
