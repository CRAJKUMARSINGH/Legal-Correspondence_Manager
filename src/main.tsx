import { StrictMode, Component, type ReactNode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { resetWithBackup, getStorageInfo } from './lib/dataReset'

class ErrorBoundary extends Component<{ children: ReactNode }, { error: string | null; resetting: boolean }> {
  state = { error: null, resetting: false }
  static getDerivedStateFromError(e: Error) { return { error: e.message, resetting: false } }

  handleReset = async () => {
    this.setState({ resetting: true })
    
    try {
      // Get storage info for debugging
      const storageInfo = getStorageInfo()
      console.log('Storage info before reset:', storageInfo)
      
      // Reset with backup
      await resetWithBackup()
    } catch (error) {
      console.error('Reset failed:', error)
      this.setState({ resetting: false })
    }
  }

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-8">
          <div className="bg-white rounded-xl border border-red-200 p-6 max-w-lg w-full shadow">
            <h2 className="text-red-600 font-bold mb-2">App Error</h2>
            <pre className="text-xs text-gray-600 whitespace-pre-wrap mb-4">{this.state.error}</pre>
            
            <div className="space-y-3">
              <p className="text-sm text-gray-600">
                This will clear all app data and create a backup download before resetting.
              </p>
              
              <button
                className="w-full px-4 py-2 bg-red-600 text-white rounded-lg text-sm disabled:opacity-50"
                onClick={this.handleReset}
                disabled={this.state.resetting}
              >
                {this.state.resetting ? 'Creating backup & resetting...' : 'Create backup & reset app'}
              </button>
              
              <button
                className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm"
                onClick={() => window.location.reload()}
              >
                Just reload page
              </button>
            </div>
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
