import { createContext, useContext, useState, useCallback } from 'react'
import { nanoid } from 'nanoid'
import { Announcer } from '../components/a11y/LiveRegions'

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([])

    const showToast = useCallback((type, message, options = {}) => {
        const id = nanoid()
        const hasAction = !!options.action
        const toast = {
            id,
            type, // 'success' | 'error' | 'info' | 'warning'
            message,
            duration: options.duration || (hasAction ? 5000 : 3000), // Longer for undo
            action: options.action || null, // { label, onClick }
        }

        setToasts(prev => [...prev, toast])

        // Auto-dismiss after duration
        if (toast.duration > 0) {
            setTimeout(() => {
                dismissToast(id)
            }, toast.duration)
        }

        return id
    }, [])

    const dismissToast = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id))
    }, [])

    return (
        <ToastContext.Provider value={{ toasts, showToast, dismissToast }}>
            {children}
        </ToastContext.Provider>
    )
}

export function useToast() {
    const context = useContext(ToastContext)
    if (!context) {
        throw new Error('useToast must be used within ToastProvider')
    }
    return context
}
