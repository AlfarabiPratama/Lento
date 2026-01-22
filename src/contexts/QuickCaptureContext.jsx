import { createContext, useContext, useState, useCallback } from 'react'

/**
 * Quick Capture Types
 */
export const CAPTURE_TYPES = {
    NOTE: 'note',
    JOURNAL: 'journal',
    TRANSACTION: 'transaction',
    HABIT: 'habit',
    POMODORO: 'pomodoro',
}

const QuickCaptureContext = createContext(null)

/**
 * QuickCaptureProvider - Global quick capture state
 */
export function QuickCaptureProvider({ children }) {
    const [open, setOpen] = useState(false)
    const [captureType, setCaptureType] = useState(null)
    const [formOpen, setFormOpen] = useState(false)

    // Open capture menu
    const openCapture = useCallback(() => {
        setOpen(true)
        setCaptureType(null)
        setFormOpen(false)
    }, [])

    // Close everything
    const closeCapture = useCallback(() => {
        setOpen(false)
        setCaptureType(null)
        setFormOpen(false)
    }, [])

    // Select capture type and open form
    const selectType = useCallback((type) => {
        setCaptureType(type)
        setFormOpen(true)
        setOpen(false) // Close menu, open form
    }, [])

    // Close form only
    const closeForm = useCallback(() => {
        setFormOpen(false)
        setCaptureType(null)
    }, [])

    const value = {
        open,
        captureType,
        formOpen,
        openCapture,
        closeCapture,
        selectType,
        closeForm,
    }

    return (
        <QuickCaptureContext.Provider value={value}>
            {children}
        </QuickCaptureContext.Provider>
    )
}

/**
 * useQuickCapture - Access quick capture context
 */
export function useQuickCapture() {
    const context = useContext(QuickCaptureContext)
    if (!context) {
        throw new Error('useQuickCapture must be used within QuickCaptureProvider')
    }
    return context
}

export default QuickCaptureProvider
