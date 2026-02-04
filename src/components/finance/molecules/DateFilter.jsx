import { useState } from 'react'
import { IconCalendar, IconChevronDown } from '@tabler/icons-react'

/**
 * DateFilter - Dropdown filter untuk filter transaksi by date
 * 
 * Options: Hari ini, Minggu ini, Bulan ini, Bulan lalu, Custom range
 */
export function DateFilter({ value, onChange }) {
    const [showCustom, setShowCustom] = useState(false)
    const [customStart, setCustomStart] = useState('')
    const [customEnd, setCustomEnd] = useState('')

    const options = [
        { value: 'all', label: 'Semua' },
        { value: 'today', label: 'Hari ini' },
        { value: 'this-week', label: 'Minggu ini' },
        { value: 'this-month', label: 'Bulan ini' },
        { value: 'last-month', label: 'Bulan lalu' },
        { value: 'custom', label: 'Custom...' },
    ]

    const handleChange = (e) => {
        const newValue = e.target.value
        if (newValue === 'custom') {
            setShowCustom(true)
        } else {
            setShowCustom(false)
            onChange({ type: newValue })
        }
    }

    const handleCustomApply = () => {
        if (customStart && customEnd) {
            onChange({ 
                type: 'custom', 
                start: customStart, 
                end: customEnd 
            })
            setShowCustom(false)
        }
    }

    const currentLabel = value.type === 'custom' 
        ? `${new Date(value.start).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })} - ${new Date(value.end).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}`
        : options.find(o => o.value === value.type)?.label || 'Filter'

    return (
        <div className="relative">
            <div className="relative">
                <IconCalendar 
                    size={16} 
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted pointer-events-none" 
                />
                <select
                    value={value.type === 'custom' ? 'custom' : value.type}
                    onChange={handleChange}
                    className="input pl-9 pr-8 appearance-none cursor-pointer text-sm"
                    style={{ paddingRight: '2rem' }}
                >
                    {options.map(opt => (
                        <option key={opt.value} value={opt.value}>
                            {opt.label}
                        </option>
                    ))}
                </select>
                <IconChevronDown 
                    size={16} 
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted pointer-events-none" 
                />
            </div>

            {/* Custom Date Range Modal */}
            {showCustom && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowCustom(false)}>
                    <div className="card p-4 w-full max-w-sm animate-in" onClick={e => e.stopPropagation()}>
                        <h3 className="text-h3 text-ink mb-4">Custom Date Range</h3>
                        
                        <div className="space-y-3">
                            <div>
                                <label className="text-small text-ink-muted mb-1 block">Dari Tanggal</label>
                                <input
                                    type="date"
                                    value={customStart}
                                    onChange={(e) => setCustomStart(e.target.value)}
                                    className="input text-sm"
                                />
                            </div>
                            
                            <div>
                                <label className="text-small text-ink-muted mb-1 block">Sampai Tanggal</label>
                                <input
                                    type="date"
                                    value={customEnd}
                                    onChange={(e) => setCustomEnd(e.target.value)}
                                    className="input text-sm"
                                />
                            </div>
                        </div>

                        <div className="flex gap-2 mt-4">
                            <button 
                                onClick={handleCustomApply} 
                                className="btn-primary flex-1"
                                disabled={!customStart || !customEnd}
                            >
                                Terapkan
                            </button>
                            <button 
                                onClick={() => setShowCustom(false)} 
                                className="btn-secondary"
                            >
                                Batal
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default DateFilter
