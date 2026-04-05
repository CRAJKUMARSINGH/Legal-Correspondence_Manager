import { StrictMode, Component, type ReactNode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'

class ErrorBoundary extends Component<{ children: ReactNode }, { error: string | null }> {
  state = { error: null }
  static getDerivedStateFromError(e: Error) { return { error: e.message } }
  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-8">
          <div className="bg-white rounded-xl border border-red-200 p-6 max-w-lg w-full shadow">
            <h2 className="text-red-600 font-bold mb-2">App Error</h2>
            <pre className="text-xs text-gray-600 whitespace-pre-wrap">{this.state.error}</pre>
            <button
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg text-sm"
              onClick={() => { localStorage.clear(); window.location.reload() }}
            >
              Clear data &amp; reload
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>
)
