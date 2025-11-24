import { Component, ErrorInfo, ReactNode } from 'react'
import Button from './Button'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div
          className="min-h-screen flex items-center justify-center bg-gray-50 px-4"
          role="alert"
          aria-live="assertive"
        >
          <div className="max-w-md w-full bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-center w-12 h-12 mx-auto bg-error/10 rounded-full mb-4">
              <svg
                className="w-6 h-6 text-error"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 text-center mb-2">
              Something went wrong
            </h2>
            <p className="text-gray-600 text-center mb-6">
              We're sorry, but something unexpected happened. Please try again.
            </p>
            {this.state.error && (
              <details className="mb-4 p-3 bg-gray-50 rounded text-sm">
                <summary className="cursor-pointer font-medium text-gray-700">
                  Error details
                </summary>
                <p className="mt-2 text-gray-600 font-mono text-xs break-all">
                  {this.state.error.message}
                </p>
              </details>
            )}
            <div className="flex gap-3">
              <Button
                variant="secondary"
                onClick={() => window.location.reload()}
                className="flex-1"
              >
                Reload Page
              </Button>
              <Button onClick={this.handleReset} className="flex-1">
                Try Again
              </Button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
