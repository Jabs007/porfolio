import { StrictMode, Component } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';

// Filter out upstream @react-three/fiber Clock deprecation warning
if (typeof window !== 'undefined') {
  const origWarn = console.warn;
  console.warn = (...args) => {
    if (typeof args[0] === 'string' && (args[0].includes('Clock: This module has been deprecated') || args[0].includes('THREE.Clock: This module has been deprecated'))) {
      return;
    }
    origWarn.apply(console, args);
  };
}

class GlobalErrorBoundary extends Component {
  state = { hasError: false, error: null };
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, info) {
    console.error('Global Error caught:', error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '40px',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          background: '#fff8f0',
          color: '#242220',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center'
        }}>
          <h2 style={{ fontSize: '24px', marginBottom: '16px', fontWeight: '600' }}>Something went wrong.</h2>
          <p style={{ opacity: 0.8, marginBottom: '24px', maxWidth: '500px' }}>
            {this.state.error?.message || 'A 3D rendering or layout error occurred.'}
          </p>
          <button 
            onClick={() => window.location.reload()}
            style={{
              padding: '12px 28px',
              background: '#8b5a2b',
              color: '#fff8f0',
              border: 'none',
              borderRadius: '50px',
              cursor: 'pointer',
              fontWeight: '600',
              boxShadow: '0 8px 24px rgba(139, 90, 43, 0.25)'
            }}
          >
            Reload Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GlobalErrorBoundary>
      <App />
    </GlobalErrorBoundary>
  </StrictMode>
);
