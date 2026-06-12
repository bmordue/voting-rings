import { createRoot } from 'react-dom/client'
import { Component, type ReactNode } from 'react'

import App from './App.tsx'

import "./main.css"
import "./styles/theme.css"
import "./index.css"

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      if (import.meta.env.DEV) throw this.state.error;
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <div className="w-full max-w-md">
            <div className="border border-red-300 rounded-lg p-4 mb-6 bg-red-50">
              <h2 className="font-semibold text-red-800 mb-2">Runtime Error</h2>
              <p className="text-sm text-red-700">Something unexpected happened.</p>
            </div>
            <pre className="text-xs bg-muted p-3 rounded border overflow-auto max-h-32 mb-4">
              {this.state.error?.message}
            </pre>
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              className="w-full px-4 py-2 border rounded-md hover:bg-muted"
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
)
