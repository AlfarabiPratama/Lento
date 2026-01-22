import { useRef } from 'react'

export const SETTINGS_TABS = [
    { id: 'tampilan', label: 'Tampilan' },
    { id: 'akun', label: 'Akun' },
    { id: 'sync', label: 'Sync' },
    { id: 'data', label: 'Data' },
    { id: 'tentang', label: 'Tentang' },
]

export const VALID_TABS = SETTINGS_TABS.map(t => t.id)
export const DEFAULT_TAB = 'tampilan'

/**
 * ARIA-compliant tab bar for Settings page
 * 
 * Features:
 * - role="tablist" with aria-orientation
 * - Roving tabindex (active = 0, others = -1)
 * - Keyboard navigation (Arrow, Home, End)
 * - Automatic activation (focus = panel change)
 * - Mobile-friendly with safe area + horizontal scroll
 * 
 * @see https://www.w3.org/WAI/ARIA/apg/patterns/tabs/
 */
export function SettingsTabBar({ activeTab, onTabChange }) {
    const tabsRef = useRef({})

    const handleKeyDown = (e, currentIndex) => {
        let newIndex = currentIndex

        switch (e.key) {
            case 'ArrowRight':
                newIndex = (currentIndex + 1) % SETTINGS_TABS.length
                break
            case 'ArrowLeft':
                newIndex = (currentIndex - 1 + SETTINGS_TABS.length) % SETTINGS_TABS.length
                break
            case 'Home':
                newIndex = 0
                break
            case 'End':
                newIndex = SETTINGS_TABS.length - 1
                break
            default:
                return // Don't prevent default for other keys
        }

        e.preventDefault()
        const newTab = SETTINGS_TABS[newIndex]

        // Automatic activation: focus change = panel change
        onTabChange(newTab.id)

        // Focus the new tab + scroll into view (for mobile horizontal scroll)
        const tabEl = tabsRef.current[newTab.id]
        tabEl?.focus()
        tabEl?.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' })
    }

    return (
        <div
            role="tablist"
            aria-label="Pengaturan"
            aria-orientation="horizontal"
            className="sticky top-0 z-10 flex gap-1 px-4 py-2 bg-paper/95 
                 backdrop-blur-sm border-b border-line overflow-x-auto max-w-full
                 scrollbar-hide -webkit-overflow-scrolling-touch"
            style={{ paddingTop: 'max(0.5rem, env(safe-area-inset-top))' }}
        >
            {SETTINGS_TABS.map((tab, index) => (
                <button
                    key={tab.id}
                    ref={(el) => (tabsRef.current[tab.id] = el)}
                    type="button"
                    role="tab"
                    id={`tab-${tab.id}`}
                    aria-selected={activeTab === tab.id}
                    aria-controls={`panel-${tab.id}`}
                    tabIndex={activeTab === tab.id ? 0 : -1}
                    onClick={() => onTabChange(tab.id)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    className={`
            px-4 py-2.5 min-h-[44px] rounded-lg text-small font-medium 
            whitespace-nowrap transition-colors
            ${activeTab === tab.id
                            ? 'bg-primary/10 text-primary'
                            : 'text-ink-muted hover:bg-paper-warm hover:text-ink'
                        }
          `}
                >
                    {tab.label}
                </button>
            ))}
        </div>
    )
}
