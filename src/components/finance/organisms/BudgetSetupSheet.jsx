import { useState } from 'react'
import { IconX, IconCheck } from '@tabler/icons-react'
import { LentoSheet } from '../../ui/LentoSheet'
import { LentoButton } from '../../ui/LentoButton'
import { MoneyInput } from '../molecules/MoneyInput'
import { MAHASISWA_CATEGORIES } from '../../../features/finance/budget/budgetTemplates'

/**
 * BudgetSetupSheet - Bottom sheet for setting up budget
 */
export function BudgetSetupSheet({
    open,
    onClose,
    onSave,
    existingCategories = [],
    className = ''
}) {
    const [step, setStep] = useState(1) // 1: select template, 2: edit amounts
    const [selectedTemplate, setSelectedTemplate] = useState(null)
    const [budgets, setBudgets] = useState({})

    // Get available categories (exclude already set ones)
    // Use MAHASISWA_CATEGORIES as base since it has proper id/label structure
    const existingIds = existingCategories.map(c => c.category_id)
    const availableCategories = MAHASISWA_CATEGORIES.filter(c => !existingIds.includes(c.id))

    const handleTemplateSelect = (template) => {
        setSelectedTemplate(template)
        if (template === 'mahasiswa') {
            // Prefill with mahasiswa defaults
            const defaults = {}
            MAHASISWA_CATEGORIES.forEach(cat => {
                defaults[cat.id] = cat.defaultAmount
            })
            setBudgets(defaults)
        } else {
            setBudgets({})
        }
        setStep(2)
    }

    const handleAmountChange = (categoryId, amount) => {
        setBudgets(prev => ({
            ...prev,
            [categoryId]: amount,
        }))
    }

    const handleSave = () => {
        // Convert budgets to array and save
        const budgetEntries = Object.entries(budgets)
            .filter(([_, amount]) => amount > 0)
            .map(([categoryId, amount]) => ({ categoryId, amount }))

        onSave(budgetEntries)
        onClose()
        setStep(1)
        setSelectedTemplate(null)
        setBudgets({})
    }

    const categoriesToShow = selectedTemplate === 'mahasiswa'
        ? MAHASISWA_CATEGORIES
        : availableCategories

    return (
        <LentoSheet open={open} onClose={onClose}>
            <div className="p-4 space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <h3 className="text-h2 text-ink">
                        {step === 1 ? 'Set Budget' : 'Atur Nominal'}
                    </h3>
                    <button onClick={onClose} className="p-2 rounded-lg hover:bg-paper-warm">
                        <IconX size={20} stroke={2} className="text-ink-muted" />
                    </button>
                </div>

                {step === 1 ? (
                    /* Step 1: Template selection */
                    <div className="space-y-3">
                        <p className="text-body text-ink-muted">Pilih cara setup budget:</p>

                        <button
                            onClick={() => handleTemplateSelect('mahasiswa')}
                            className="w-full card flex items-center gap-3 text-left hover:border-primary/50"
                        >
                            <div className="min-w-11 min-h-11 rounded-lg bg-primary/10 flex items-center justify-center">
                                <span className="text-xl">🎓</span>
                            </div>
                            <div>
                                <p className="text-body font-medium text-ink">Template Mahasiswa</p>
                                <p className="text-small text-ink-muted">Budget umum untuk mahasiswa</p>
                            </div>
                        </button>

                        <button
                            onClick={() => handleTemplateSelect('custom')}
                            className="w-full card flex items-center gap-3 text-left hover:border-primary/50"
                        >
                            <div className="min-w-11 min-h-11 rounded-lg bg-secondary/10 flex items-center justify-center">
                                <span className="text-xl">✏️</span>
                            </div>
                            <div>
                                <p className="text-body font-medium text-ink">Buat Manual</p>
                                <p className="text-small text-ink-muted">Set budget sendiri per kategori</p>
                            </div>
                        </button>
                    </div>
                ) : (
                    /* Step 2: Edit amounts */
                    <div className="space-y-4">
                        <p className="text-small text-ink-muted">
                            Atur budget per kategori:
                        </p>

                        <div className="space-y-3 max-h-[50vh] overflow-y-auto">
                            {categoriesToShow.map(cat => (
                                <div key={cat.id} className="flex items-center gap-3">
                                    <span className="flex-1 text-body text-ink">{cat.label}</span>
                                    <div className="w-40">
                                        <MoneyInput
                                            value={budgets[cat.id] || 0}
                                            onChange={(val) => handleAmountChange(cat.id, val)}
                                            placeholder="0"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="flex gap-3 pt-4 border-t border-line">
                            <LentoButton variant="secondary" onClick={() => setStep(1)} className="flex-1">
                                Kembali
                            </LentoButton>
                            <LentoButton onClick={handleSave} className="flex-1">
                                <IconCheck size={18} stroke={2} />
                                <span>Simpan</span>
                            </LentoButton>
                        </div>
                    </div>
                )}
            </div>
        </LentoSheet>
    )
}

export default BudgetSetupSheet
