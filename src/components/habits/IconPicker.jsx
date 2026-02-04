import { useState } from 'react'
import { 
    IconX, IconSearch,
    // Health & Fitness
    IconHeart, IconRun, IconBike, IconYoga, IconApple, IconPill, IconBed, IconGlass,
    // Productivity
    IconRocket, IconTarget, IconCheckbox, IconClock, IconBolt, IconBriefcase,
    // Learning
    IconBook, IconBook2, IconSchool, IconCertificate, IconBulb, IconLanguage,
    // Mindfulness
    IconBrain, IconMoodSmile, IconFlower, IconSun, IconMoon, IconLeaf, IconNotes, IconBan,
    // Finance
    IconCoin, IconPigMoney, IconWallet, IconChartLine,
    // Social
    IconUsers, IconUser, IconPhone, IconMail,
    // Creative  
    IconPalette, IconPaint, IconMusic, IconCamera, IconPencil, IconBrush,
    // General
    IconStar, IconFlame, IconSparkles, IconTrophy, IconMedal, IconCheck
} from '@tabler/icons-react'
import { HABIT_ICONS } from '../../lib/habitCategories'

// Icon mapping - only include icons we use
const iconMap = {
    IconHeart, IconRun, IconBike, IconYoga, IconApple, IconPill, IconBed, IconGlass,
    IconRocket, IconTarget, IconCheckbox, IconClock, IconBolt, IconBriefcase,
    IconBook, IconBook2, IconSchool, IconCertificate, IconBulb, IconLanguage,
    IconBrain, IconMoodSmile, IconFlower, IconSun, IconMoon, IconLeaf, IconNotes, IconBan,
    IconCoin, IconPigMoney, IconWallet, IconChartLine,
    IconUsers, IconUser, IconPhone, IconMail,
    IconPalette, IconPaint, IconMusic, IconCamera, IconPencil, IconBrush,
    IconStar, IconFlame, IconSparkles, IconTrophy, IconMedal, IconCheck
}

/**
 * IconPicker - Modal untuk memilih icon habit
 * 
 * @param {Object} props
 * @param {boolean} props.isOpen - Modal visibility
 * @param {Function} props.onClose - Close handler
 * @param {Function} props.onSelect - Select handler with icon name
 * @param {string} props.selectedIcon - Currently selected icon name
 */
export function IconPicker({ isOpen, onClose, onSelect, selectedIcon }) {
    const [search, setSearch] = useState('')

    if (!isOpen) return null

    // Filter icons by search
    const filteredIcons = HABIT_ICONS.filter(iconName =>
        iconName.toLowerCase().includes(search.toLowerCase())
    )

    const handleSelect = (iconName) => {
        onSelect(iconName)
        onClose()
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black/50 animate-in fade-in"
                onClick={onClose}
            />
            
            {/* Modal */}
            <div className="relative w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-200">
                <div className="card p-4 sm:p-6 space-y-3 sm:space-y-4 max-h-[85vh] flex flex-col">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <h3 className="text-base sm:text-lg font-semibold text-ink">Pilih Icon</h3>
                        <button
                            onClick={onClose}
                            className="min-w-9 min-h-9 flex items-center justify-center rounded-lg text-ink-muted hover:bg-ink-muted/10 active:scale-95"
                            aria-label="Tutup"
                        >
                            <IconX size={20} stroke={2} />
                        </button>
                    </div>

                    {/* Search */}
                    <div className="relative">
                        <IconSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Cari icon..."
                            className="input pl-10 text-sm"
                        />
                    </div>

                    {/* Icon Grid */}
                    <div className="flex-1 overflow-y-auto">
                        <div className="grid grid-cols-6 gap-2">
                            {filteredIcons.map(iconName => {
                                const IconComponent = iconMap[iconName]
                                const isSelected = selectedIcon === iconName

                                if (!IconComponent) return null

                                return (
                                    <button
                                        key={iconName}
                                        onClick={() => handleSelect(iconName)}
                                        className={`aspect-square flex items-center justify-center rounded-lg transition-all ${
                                            isSelected
                                                ? 'bg-primary text-white'
                                                : 'bg-paper-warm hover:bg-ink-muted/10 text-ink'
                                        }`}
                                        title={iconName.replace('Icon', '')}
                                    >
                                        <IconComponent size={24} stroke={2} />
                                    </button>
                                )
                            })}
                        </div>

                        {filteredIcons.length === 0 && (
                            <div className="text-center py-8 text-ink-muted">
                                <p className="text-small">Tidak ada icon yang cocok</p>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="text-center text-tiny text-ink-muted">
                        {filteredIcons.length} icon
                    </div>
                </div>
            </div>
        </div>
    )
}

/**
 * IconPickerButton - Button to trigger icon picker
 */
export function IconPickerButton({ icon, onClick, label = 'Pilih Icon' }) {
    const IconComponent = icon ? iconMap[icon] : null

    return (
        <div>
            {label && (
                <label className="text-small text-ink-muted mb-2 block">
                    {label}
                </label>
            )}
            <button
                type="button"
                onClick={onClick}
                className="w-full h-12 flex items-center justify-center gap-2 rounded-lg border border-line bg-paper-warm hover:bg-ink-muted/10 transition-all"
            >
                {IconComponent ? (
                    <>
                        <IconComponent size={20} stroke={2} className="text-primary" />
                        <span className="text-small text-ink">{icon.replace('Icon', '')}</span>
                    </>
                ) : (
                    <span className="text-small text-ink-muted">Pilih icon (opsional)</span>
                )}
            </button>
        </div>
    )
}
