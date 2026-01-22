import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { IconX } from '@tabler/icons-react'
import { useQuickCapture } from '../../contexts/QuickCaptureContext'
import { CAPTURE_CONFIG, CAPTURE_TYPES_ORDER } from '../../features/capture/constants'
import { LentoIconButton } from '../ui/LentoIconButton'
import { QuickReadingLog } from './QuickReadingLog'

/**
 * QuickCaptureMenu - Type selection menu
 */
export function QuickCaptureMenu() {
    const navigate = useNavigate()
    const { open, closeCapture } = useQuickCapture()
    const [showReadingLog, setShowReadingLog] = useState(false)

    if (!open && !showReadingLog) return null

    const handleSelect = (type) => {
        const config = CAPTURE_CONFIG[type]

        // Handle reading type specially
        if (config.useSheet) {
            closeCapture()
            setShowReadingLog(true)
            return
        }

        closeCapture()
        // Navigate to the relevant page
        if (config.route) {
            navigate(config.route)
        }
    }

    const handleCloseReadingLog = () => {
        setShowReadingLog(false)
    }

    // Show reading log sheet
    if (showReadingLog) {
        return <QuickReadingLog open={showReadingLog} onClose={handleCloseReadingLog} />
    }

    // Show capture menu
    if (!open) return null

    return (
        <div className="fixed inset-0 z-50">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
                onClick={closeCapture}
            />

            {/* Menu - Desktop: popover from bottom-right, Mobile: bottom sheet */}
            <div className="absolute bottom-20 right-4 sm:bottom-24 sm:right-6 lg:bottom-8 lg:right-8
                      w-[calc(100%-2rem)] max-w-xs bg-surface rounded-2xl shadow-lg border border-line
                      overflow-hidden animate-fade-in">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-line">
                    <h3 className="text-h3 text-ink">Tambah Cepat</h3>
                    <LentoIconButton
                        icon={IconX}
                        onClick={closeCapture}
                        size="sm"
                        aria-label="Tutup"
                    />
                </div>

                {/* Options */}
                <div className="p-2">
                    {CAPTURE_TYPES_ORDER.map((typeId) => {
                        const config = CAPTURE_CONFIG[typeId]
                        const Icon = config.icon

                        return (
                            <button
                                key={typeId}
                                onClick={() => handleSelect(typeId)}
                                className="w-full flex items-center gap-3 p-3 rounded-xl
                           hover:bg-paper-warm transition-colors text-left group"
                            >
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${config.color}`}>
                                    <Icon size={20} stroke={2} />
                                </div>
                                <div className="flex-1">
                                    <p className="text-body font-medium text-ink group-hover:text-primary">
                                        {config.label}
                                    </p>
                                    <p className="text-small text-ink-muted">
                                        {config.description}
                                    </p>
                                </div>
                            </button>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}

export default QuickCaptureMenu

