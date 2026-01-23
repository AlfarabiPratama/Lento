import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { IconNotebook, IconSparkles } from '@tabler/icons-react'
import { WidgetCard } from '../atoms/WidgetCard'

// Quick journal prompts
const PROMPTS = [
    'Apa yang kamu syukuri hari ini?',
    'Hal kecil apa yang membuatmu senang?',
    'Apa yang ingin kamu capai hari ini?',
    'Bagaimana perasaanmu sekarang?',
    'Apa yang sudah kamu pelajari hari ini?',
]

/**
 * JournalWidget - Responsive: compact on mobile, full on desktop
 */
export function JournalWidget({ onQuickSave, className = '' }) {
    const navigate = useNavigate()
    const [text, setText] = useState('')
    const [saving, setSaving] = useState(false)

    // Get random prompt based on date
    const todayIndex = new Date().getDate() % PROMPTS.length
    const prompt = PROMPTS[todayIndex]

    const handleSave = async () => {
        if (!text.trim()) return
        setSaving(true)
        try {
            await onQuickSave?.(text.trim())
            setText('')
        } finally {
            setSaving(false)
        }
    }

    return (
        <WidgetCard
            title="Jurnal 1 Menit"
            icon={IconNotebook}
            iconColor="text-purple-600"
            iconBg="bg-purple-100"
            onAction={() => navigate('/journal')}
            className={className}
        >
            <div className="space-y-1 sm:space-y-3">
                {/* Prompt */}
                <div className="flex items-start gap-1 sm:gap-2 p-1.5 sm:p-2 rounded sm:rounded-lg bg-purple-50">
                    <IconSparkles size={14} className="text-purple-500 shrink-0 mt-0.5 sm:hidden" />
                    <IconSparkles size={16} className="text-purple-500 shrink-0 mt-0.5 hidden sm:block" />
                    <p className="text-small sm:text-small text-purple-700 line-clamp-2">{prompt}</p>
                </div>

                {/* Quick input - mobile: single line, desktop: textarea */}
                {/* IMPORTANT: font-size must be >= 16px to prevent iOS Safari auto-zoom */}
                <input
                    type="text"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Tulis di sini..."
                    className="sm:hidden w-full px-2 py-1.5 text-base border border-line rounded focus:outline-none focus:border-primary"
                />
                <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Tulis di sini..."
                    className="hidden sm:block input w-full resize-none text-base"
                    rows={2}
                />

                {/* Save button */}
                <button
                    onClick={handleSave}
                    disabled={!text.trim() || saving}
                    className="btn-primary w-full py-1.5 sm:py-2 text-xs sm:text-small min-h-[44px] sm:min-h-0"
                >
                    {saving ? 'Menyimpan...' : 'Simpan'}
                </button>
            </div>
        </WidgetCard>
    )
}

export default JournalWidget
