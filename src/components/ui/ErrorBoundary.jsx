import { Component } from 'react'
import { IconAlertTriangle, IconRefresh, IconHome } from '@tabler/icons-react'
import { captureError } from '../../lib/sentry'

/**
 * ErrorBoundary - Catches JavaScript errors in child components
 * 
 * Prevents white screen of death by showing a friendly error UI.
 * React requires error boundaries to be class components.
 */
export class ErrorBoundary extends Component {
    constructor(props) {
        super(props)
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null
        }
    }

    static getDerivedStateFromError(error) {
        // Update state so next render shows fallback UI
        return { hasError: true, error }
    }

    componentDidCatch(error, errorInfo) {
        // Log error for debugging
        console.error('ErrorBoundary caught an error:', error, errorInfo)

        this.setState({ errorInfo })

        // Send to Sentry error tracking (production only, if configured)
        captureError(error, {
            componentStack: errorInfo?.componentStack,
            errorBoundary: true,
        })
    }

    handleReload = () => {
        window.location.reload()
    }

    handleGoHome = () => {
        window.location.href = '/'
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null, errorInfo: null })
    }

    render() {
        if (this.state.hasError) {
            // Custom fallback UI if provided
            if (this.props.fallback) {
                return this.props.fallback
            }

            // Default error UI
            return (
                <div className="min-h-screen bg-paper flex items-center justify-center p-6">
                    <div className="max-w-md w-full text-center">
                        {/* Icon */}
                        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-danger/10 flex items-center justify-center">
                            <IconAlertTriangle size={32} stroke={2} className="text-danger" />
                        </div>

                        {/* Title */}
                        <h1 className="text-h1 text-ink mb-3">
                            Oops, ada yang error
                        </h1>

                        {/* Description */}
                        <p className="text-body text-ink-muted mb-6">
                            Tenang, data kamu aman. Coba reload halaman atau kembali ke beranda.
                        </p>

                        {/* Error details (development only) */}
                        {import.meta.env.DEV && this.state.error && (
                            <details className="mb-6 text-left">
                                <summary className="text-small text-ink-muted cursor-pointer hover:text-ink">
                                    🔧 Detail Error (dev only)
                                </summary>
                                <pre className="mt-2 p-3 bg-paper-warm rounded-lg text-tiny text-danger overflow-auto max-h-40">
                                    {this.state.error.toString()}
                                    {this.state.errorInfo?.componentStack}
                                </pre>
                            </details>
                        )}

                        {/* Actions */}
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <button
                                onClick={this.handleReload}
                                className="btn-primary flex items-center justify-center gap-2"
                            >
                                <IconRefresh size={18} stroke={2} />
                                Reload Halaman
                            </button>
                            <button
                                onClick={this.handleGoHome}
                                className="btn-secondary flex items-center justify-center gap-2"
                            >
                                <IconHome size={18} stroke={2} />
                                Ke Beranda
                            </button>
                        </div>

                        {/* Try again button */}
                        {this.props.onRetry && (
                            <button
                                onClick={() => {
                                    this.handleReset()
                                    this.props.onRetry()
                                }}
                                className="mt-4 text-small text-primary hover:underline"
                            >
                                Coba lagi tanpa reload
                            </button>
                        )}

                        {/* Logo */}
                        <div className="mt-12 text-ink-light">
                            <span className="text-h3 font-bold text-primary/50">Lento</span>
                        </div>
                    </div>
                </div>
            )
        }

        return this.props.children
    }
}

/**
 * Feature-level error boundary with simpler UI
 */
export class FeatureErrorBoundary extends Component {
    constructor(props) {
        super(props)
        this.state = { hasError: false }
    }

    static getDerivedStateFromError() {
        return { hasError: true }
    }

    componentDidCatch(error, errorInfo) {
        console.error(`Error in ${this.props.feature || 'feature'}:`, error, errorInfo)
    }

    handleRetry = () => {
        this.setState({ hasError: false })
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="card p-6 text-center">
                    <p className="text-body text-ink-muted mb-4">
                        {this.props.message || 'Gagal memuat. Coba lagi?'}
                    </p>
                    <button
                        onClick={this.handleRetry}
                        className="text-primary text-small hover:underline"
                    >
                        Coba lagi
                    </button>
                </div>
            )
        }

        return this.props.children
    }
}

export default ErrorBoundary
