import { useState, useEffect } from 'react'
import { IconCheck, IconPigMoney, IconTarget, IconCalendarMonth, IconTrash, IconTrophy } from '@tabler/icons-react'
import { LentoSheet } from '../../ui/LentoSheet'
import { LentoDialog } from '../../ui/LentoDialog'
import { LentoButton } from '../../ui/LentoButton'
import { MoneyInput } from '../../finance/molecules/MoneyInput'
import { GOAL_TYPES, SOURCE_KINDS } from '../../../features/goals/goalsRepo'

const BREAKPOINT_MOBILE = 600

/**
 * GoalSheet - Modal for creating/editing goals
 * Uses LentoDialog on desktop, LentoSheet on mobile
 */
export function GoalSheet({
    open,
    onClose,
    onSave,
    onDelete,
    onMarkComplete,
    onReactivate,
    accounts = [],
    habits = [],
    editGoal = null,
}) {
    const [step, setStep] = useState(1)
    const [type, setType] = useState(GOAL_TYPES.SAVINGS)
    const [title, setTitle] = useState('')
    const [targetAmount, setTargetAmount] = useState(0)
    const [deadline, setDeadline] = useState('')
    const [sourceKind, setSourceKind] = useState(SOURCE_KINDS.NET_WORTH)
    const [sourceRefId, setSourceRefId] = useState('')
    const [saving, setSaving] = useState(false)
    const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth < BREAKPOINT_MOBILE : false)

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < BREAKPOINT_MOBILE)
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    useEffect(() => {
        if (open) {
            if (editGoal) {
                setType(editGoal.type)
                setTitle(editGoal.title)
                setTargetAmount(editGoal.target_amount || 0)
                setDeadline(editGoal.deadline || '')
                setSourceKind(editGoal.source?.kind || SOURCE_KINDS.NET_WORTH)
                setSourceRefId(editGoal.source?.ref_id || '')
                setStep(2)
            } else {
                setStep(1)
                setType(GOAL_TYPES.SAVINGS)
                setTitle('')
                setTargetAmount(0)
                setDeadline('')
                setSourceKind(SOURCE_KINDS.NET_WORTH)
                setSourceRefId('')
            }
        }
    }, [open, editGoal])

    const handleTypeSelect = (selectedType) => {
        setType(selectedType)
        setStep(2)
    }

    const handleSave = async () => {
        if (!title.trim()) return
        if (targetAmount <= 0 && type === GOAL_TYPES.SAVINGS) return

        setSaving(true)
        try {
            await onSave({
                type,
                title: title.trim(),
                target_amount: targetAmount,
                deadline: deadline || null,
                source: {
                    kind: type === GOAL_TYPES.HABIT ? 'habit' : sourceKind,
                    ref_id: sourceRefId || null,
                },
            })
        } catch (err) {
            console.error('Failed to save goal:', err)
        } finally {
            setSaving(false)
        }
    }

    // Check completion by status field, not milestones
    const isComplete = editGoal?.status === 'completed'
    const modalTitle = step === 1 ? 'Pilih Jenis Target' : editGoal ? 'Edit Target' : 'Target Baru'

    // Form content (shared between dialog and sheet)
    const formContent = (
        <div className="space-y-4">
            {step === 1 ? (
                <div className="space-y-3">
                    <button
                        onClick={() => handleTypeSelect(GOAL_TYPES.SAVINGS)}
                        className="w-full card flex items-center gap-3 text-left hover:border-primary/50"
                    >
                        <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                            <IconPigMoney size={24} className="text-green-600" />
                        </div>
                        <div>
                            <p className="text-body font-medium text-ink">Target Tabungan</p>
                            <p className="text-small text-ink-muted">Nabung untuk beli sesuatu</p>
                        </div>
                    </button>

                    <button
                        onClick={() => handleTypeSelect(GOAL_TYPES.HABIT)}
                        className="w-full card flex items-center gap-3 text-left hover:border-primary/50"
                    >
                        <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center">
                            <IconTarget size={24} className="text-orange-600" />
                        </div>
                        <div>
                            <p className="text-body font-medium text-ink">Target Habit</p>
                            <p className="text-small text-ink-muted">Capai streak tertentu</p>
                        </div>
                    </button>
                </div>
            ) : (
                <div className="space-y-4">
                    <div>
                        <label className="text-sm text-ink-muted mb-2 block">Nama Target</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder={type === GOAL_TYPES.SAVINGS ? 'Contoh: Beli iPhone' : 'Contoh: Olahraga 30 hari'}
                            className="input w-full"
                            autoFocus
                        />
                    </div>

                    {type === GOAL_TYPES.SAVINGS ? (
                        <div>
                            <label className="text-sm text-ink-muted mb-2 block">Target Nominal</label>
                            <MoneyInput value={targetAmount} onChange={setTargetAmount} />
                        </div>
                    ) : (
                        <div>
                            <label className="text-sm text-ink-muted mb-2 block">Target Streak (hari)</label>
                            <input
                                type="number"
                                value={targetAmount || ''}
                                onChange={(e) => setTargetAmount(parseInt(e.target.value) || 0)}
                                placeholder="30"
                                className="input w-full"
                                min="1"
                            />
                        </div>
                    )}

                    {type === GOAL_TYPES.SAVINGS && (
                        <div>
                            <label className="text-sm text-ink-muted mb-2 block">Sumber Progress</label>
                            <select
                                value={sourceKind}
                                onChange={(e) => setSourceKind(e.target.value)}
                                className="input w-full"
                            >
                                <option value={SOURCE_KINDS.NET_WORTH}>Total Kekayaan</option>
                                <option value={SOURCE_KINDS.ACCOUNT}>Akun Tertentu</option>
                            </select>

                            {sourceKind === SOURCE_KINDS.ACCOUNT && accounts.length > 0 && (
                                <select
                                    value={sourceRefId}
                                    onChange={(e) => setSourceRefId(e.target.value)}
                                    className="input w-full mt-2"
                                >
                                    <option value="">Pilih akun...</option>
                                    {accounts.map(acc => (
                                        <option key={acc.id} value={acc.id}>{acc.name}</option>
                                    ))}
                                </select>
                            )}
                        </div>
                    )}

                    {type === GOAL_TYPES.HABIT && habits.length > 0 && (
                        <div>
                            <label className="text-sm text-ink-muted mb-2 block">Pilih Habit</label>
                            <select
                                value={sourceRefId}
                                onChange={(e) => setSourceRefId(e.target.value)}
                                className="input w-full"
                            >
                                <option value="">Pilih habit...</option>
                                {habits.map(h => (
                                    <option key={h.id} value={h.id}>{h.name}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div>
                        <label className="text-sm text-ink-muted mb-2 block flex items-center gap-1">
                            <IconCalendarMonth size={14} />
                            <span>Deadline (opsional)</span>
                        </label>
                        <input
                            type="date"
                            value={deadline}
                            onChange={(e) => setDeadline(e.target.value)}
                            className="input w-full"
                        />
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-3 pt-4 border-t border-line">
                        {!editGoal ? (
                            <LentoButton variant="secondary" onClick={() => setStep(1)} className="flex-1">
                                Kembali
                            </LentoButton>
                        ) : (
                            <LentoButton variant="secondary" onClick={onClose} className="flex-1">
                                Batal
                            </LentoButton>
                        )}
                        <LentoButton onClick={handleSave} disabled={saving} className="flex-1">
                            <IconCheck size={18} stroke={2} />
                            <span>{saving ? 'Menyimpan...' : 'Simpan'}</span>
                        </LentoButton>
                    </div>

                    {/* Toggle Complete/Reactivate button */}
                    {editGoal && onMarkComplete && (
                        <button
                            onClick={() => isComplete ? onReactivate?.(editGoal.id) : onMarkComplete(editGoal.id)}
                            className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl
                                font-medium text-small transition-colors
                                ${isComplete
                                    ? 'bg-primary/10 text-primary hover:bg-primary/20'
                                    : 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100'
                                }`}
                        >
                            <IconTrophy size={18} stroke={2} />
                            <span>{isComplete ? 'Aktifkan kembali' : 'Tandai tercapai'}</span>
                        </button>
                    )}

                    {/* Delete button (only for existing goals, at the bottom for calm UX) */}
                    {editGoal && onDelete && (
                        <button
                            onClick={() => onDelete(editGoal.id)}
                            className="w-full flex items-center justify-center gap-2 py-2 
                                text-warning hover:text-warning/80 transition-colors text-small"
                        >
                            <IconTrash size={16} stroke={2} />
                            <span>Hapus target</span>
                        </button>
                    )}
                </div>
            )}
        </div>
    )

    // Render based on viewport
    if (isMobile) {
        return (
            <LentoSheet open={open} onClose={onClose} title={modalTitle}>
                {formContent}
            </LentoSheet>
        )
    }

    return (
        <LentoDialog open={open} onClose={onClose} title={modalTitle}>
            {formContent}
        </LentoDialog>
    )
}

export default GoalSheet

