import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { IconPlus, IconX, IconFlame, IconCheck, IconChevronDown, IconPencil, IconArchive, IconArrowUp, IconArrowDown, IconEye, IconEyeOff, IconDots } from '@tabler/icons-react'
import { useHabits, useTodayCheckins } from '../hooks/useHabits'
import { useToast } from '../contexts/ToastContext'
import { useFormValidation } from '../hooks/useFormValidation'
import EmptyState from '../components/EmptyState'
import { FormField } from '../components/ui/FormField'
import { WeekdaySelector } from '../components/ui/WeekdaySelector'
import { getNotificationPermission, requestNotificationPermission } from '../features/reminders/notificationService'
import { PullToRefresh } from '../components/ui/PullToRefresh'
import { SwipeToCompleteOrDelete } from '../components/ui/SwipeableListItem'
import { SwipeHint } from '../components/ui/SwipeHint'
import { haptics } from '../utils/haptics'
import { HabitStatus } from '../components/ui/StatusIndicator'
import { habitSchema } from '../lib/validationSchemas'
import { CheckInNoteModal } from '../components/habits/CheckInNoteModal'
import { CategorySelector, CategoryBadge } from '../components/habits/CategorySelector'
import { IconPicker, IconPickerButton } from '../components/habits/IconPicker'
import { TagInput } from '../components/habits/TagInput'
import { HabitIcon } from '../lib/habitIcons'
import { TemplatePicker, TemplatePickerButton } from '../components/habits/TemplatePicker'
import { HABIT_CATEGORIES } from '../lib/habitCategories'
import { HABIT_TEMPLATES } from '../lib/habitTemplates'

/**
 * Habits - dengan icon sizing sesuai guideline
 * - Icon tombol: 20px
 * - Icon inline/chip: 16px
 */
function Habits() {
    const navigate = useNavigate()
    const [showArchived, setShowArchived] = useState(false)
    const [categoryFilter, setCategoryFilter] = useState(localStorage.getItem('habitCategoryFilter') || '')
    const { habits, loading, create, update, remove, archive, unarchive, reorder } = useHabits({ includeArchived: showArchived })
    const { isChecked, checkIn, uncheck } = useTodayCheckins()
    const { showToast } = useToast()
    const [showForm, setShowForm] = useState(false)
    const [editingHabit, setEditingHabit] = useState(null)
    const [checkInModal, setCheckInModal] = useState({ isOpen: false, habit: null })
    const [activeMenu, setActiveMenu] = useState(null) // For kebab menu
    const [showIconPicker, setShowIconPicker] = useState(false) // For icon picker modal
    const [showTemplatePicker, setShowTemplatePicker] = useState(false) // For template picker modal

    // Form validation
    const {
        values,
        errors,
        touched,
        handleChange,
        handleBlur,
        handleSubmit,
        resetForm,
        setFieldValue,
        isSubmitting,
    } = useFormValidation({
        initialValues: {
            name: '',
            description: '',
            category: '',
            tags: [],
            icon: '',
            reminder_enabled: false,
            reminder_time: null,
            reminder_days: null
        },
        validationSchema: habitSchema,
        onSubmit: async (formValues) => {
            try {
                if (editingHabit) {
                    await update(editingHabit.id, formValues)
                    showToast('success', `Kebiasaan "${formValues.name}" berhasil diupdate`)
                } else {
                    await create(formValues)
                    showToast('success', `Kebiasaan "${formValues.name}" berhasil ditambahkan`)
                }
                
                resetForm()
                setShowForm(false)
                setEditingHabit(null)
            } catch (err) {
                showToast('error', editingHabit ? 'Gagal mengupdate kebiasaan' : 'Gagal menambahkan kebiasaan')
                throw err
            }
        }
    })

    const handleToggle = async (habitId) => {
        const habit = habits.find(h => h.id === habitId)
        try {
            if (isChecked(habitId)) {
                await uncheck(habitId)
                showToast('info', `Check-in "${habit?.name}" dibatalkan`)
            } else {
                // Open modal for note input
                setCheckInModal({ isOpen: true, habit })
            }
        } catch (err) {
            haptics.error()
            showToast('error', 'Gagal mengupdate check-in')
        }
    }

    const handleCheckInSubmit = async (note) => {
        const habit = checkInModal.habit
        try {
            await checkIn(habit.id, note)
            haptics.success()
            showToast('success', `${habit?.name} • Hari ini selesai!`)
        } catch (err) {
            haptics.error()
            showToast('error', 'Gagal check-in')
            throw err // Re-throw for modal to handle
        }
    }

    // Pull-to-refresh handler - just show visual feedback
    const handleRefresh = async () => {
        // Data already reactive via hooks, just wait a bit for smooth UX
        await new Promise(resolve => setTimeout(resolve, 500))
        haptics.light()
    }

    const handleDelete = async (habitId) => {
        const habit = habits.find(h => h.id === habitId)
        const confirmed = window.confirm(`Hapus kebiasaan "${habit?.name}"? Tindakan ini tidak dapat dibatalkan.`)
        if (!confirmed) return

        try {
            await remove(habitId)
            showToast('success', `Kebiasaan "${habit?.name}" dihapus`)
        } catch (err) {
            showToast('error', 'Gagal menghapus kebiasaan')
        }
    }

    const handleArchive = async (habitId) => {
        const habit = habits.find(h => h.id === habitId)
        try {
            await archive(habitId)
            showToast('success', `"${habit?.name}" diarsipkan`)
        } catch (err) {
            showToast('error', 'Gagal mengarsipkan kebiasaan')
        }
    }

    const handleUnarchive = async (habitId) => {
        const habit = habits.find(h => h.id === habitId)
        try {
            await unarchive(habitId)
            showToast('success', `"${habit?.name}" dikembalikan`)
        } catch (err) {
            showToast('error', 'Gagal mengembalikan kebiasaan')
        }
    }

    const handleMoveUp = async (habitId, currentIndex) => {
        if (currentIndex === 0) return
        
        try {
            const activeHabits = habits.filter(h => !h.archived_at)
            const targetHabit = activeHabits[currentIndex]
            const prevHabit = activeHabits[currentIndex - 1]
            
            // Swap orders - do it sequentially to avoid race condition
            const tempOrder = targetHabit.order
            await reorder(targetHabit.id, prevHabit.order)
            await reorder(prevHabit.id, tempOrder)
            
            haptics.light()
            setActiveMenu(null)
        } catch (err) {
            showToast('error', 'Gagal mengubah urutan')
        }
    }

    const handleMoveDown = async (habitId, currentIndex) => {
        const activeHabits = habits.filter(h => !h.archived_at)
        if (currentIndex === activeHabits.length - 1) return
        
        try {
            const targetHabit = activeHabits[currentIndex]
            const nextHabit = activeHabits[currentIndex + 1]
            
            // Swap orders - do it sequentially to avoid race condition
            const tempOrder = targetHabit.order
            await reorder(targetHabit.id, nextHabit.order)
            await reorder(nextHabit.id, tempOrder)
            
            haptics.light()
            setActiveMenu(null)
        } catch (err) {
            showToast('error', 'Gagal mengubah urutan')
        }
    }

    const handleEdit = (habit) => {
        setEditingHabit(habit)
        setFieldValue('name', habit.name)
        setFieldValue('description', habit.description || '')
        setFieldValue('category', habit.category || '')
        setFieldValue('tags', habit.tags || [])
        setFieldValue('icon', habit.icon || '')
        setFieldValue('reminder_enabled', habit.reminder_enabled || false)
        setFieldValue('reminder_time', habit.reminder_time || null)
        setFieldValue('reminder_days', habit.reminder_days || null)
        setShowForm(true)
    }

    const handleCancelEdit = () => {
        setShowForm(false)
        setEditingHabit(null)
        resetForm()
    }

    const handleSelectTemplate = (template) => {
        setFieldValue('name', template.name)
        setFieldValue('description', template.description)
        setFieldValue('category', template.category || '')
        setFieldValue('tags', template.tags || [])
        setFieldValue('icon', template.icon || '')
        setShowForm(true)
    }

    // Category filter handler
    const handleCategoryFilter = (categoryId) => {
        setCategoryFilter(categoryId)
        localStorage.setItem('habitCategoryFilter', categoryId)
    }

    // Filter habits by category
    const filteredHabits = categoryFilter 
        ? habits.filter(habit => habit.category === categoryFilter)
        : habits

    if (loading) {
        return (
            <div className="space-y-6 animate-in">
                {/* Header skeleton */}
                <div className="flex items-start justify-between">
                    <div>
                        <div className="h-7 w-28 bg-paper-warm rounded animate-pulse mb-2" />
                        <div className="h-4 w-40 bg-paper-warm rounded animate-pulse" />
                    </div>
                </div>
                {/* Habits list skeleton */}
                <div className="space-y-2">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="flex items-center gap-3 p-3 rounded-lg border border-line bg-surface">
                            <div className="w-10 h-10 rounded-lg bg-paper-warm animate-pulse" />
                            <div className="flex-1 space-y-1">
                                <div className="h-5 w-2/3 bg-paper-warm rounded animate-pulse" />
                                <div className="h-3 w-1/3 bg-paper-warm rounded animate-pulse" />
                            </div>
                            <div className="w-8 h-8 rounded-full bg-paper-warm animate-pulse" />
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    return (
        <PullToRefresh onRefresh={handleRefresh}>
            <div className="space-y-6 animate-in">{/* Header */}
            <header className="flex items-start justify-between">
                <div>
                    <h1 className="text-h1 text-ink">Kebiasaan</h1>
                    <p className="text-body text-ink-muted mt-1">Jaga ritme harianmu.</p>
                </div>
                {habits.length > 0 && (
                    <div className="flex gap-2">
                        <button
                            onClick={() => {
                                haptics.light()
                                setShowArchived(!showArchived)
                            }}
                            className="btn-secondary btn-sm"
                            aria-label={showArchived ? 'Sembunyikan arsip' : 'Tampilkan arsip'}
                            title={showArchived ? 'Sembunyikan arsip' : 'Tampilkan arsip'}
                        >
                            {showArchived ? <IconEyeOff size={20} stroke={2} /> : <IconEye size={20} stroke={2} />}
                        </button>
                        <button
                            onClick={() => {
                                haptics.light()
                                setShowForm(!showForm)
                            }}
                            className="btn-primary btn-sm"
                            aria-label="Tambah kebiasaan"
                        >
                            <IconPlus size={20} stroke={2} />
                            <span>Tambah</span>
                        </button>
                    </div>
                )}
            </header>

            {/* Category Filter */}
            {habits.length > 0 && (
                <div className="-mx-4 sm:mx-0 px-4 sm:px-0">
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                        <button
                            onClick={() => handleCategoryFilter('')}
                            className={`btn btn-sm whitespace-nowrap flex-shrink-0 ${!categoryFilter ? 'btn-primary' : 'btn-ghost'}`}
                        >
                            Semua
                        </button>
                        {HABIT_CATEGORIES.map(category => (
                            <button
                                key={category.id}
                                onClick={() => handleCategoryFilter(category.id)}
                                className={`btn btn-sm whitespace-nowrap flex-shrink-0 ${
                                    categoryFilter === category.id ? 'btn-primary' : 'btn-ghost'
                                }`}
                            >
                                {category.label}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Add/Edit form */}
            {showForm && (
                <form onSubmit={handleSubmit} className="card space-y-4 animate-in">
                    <div className="flex items-center justify-between">
                        <h3 className="text-h2 text-ink">
                            {editingHabit ? 'Edit Kebiasaan' : 'Kebiasaan baru'}
                        </h3>
                        {editingHabit && (
                            <button
                                type="button"
                                onClick={handleCancelEdit}
                                className="text-small text-ink-muted hover:text-ink"
                            >
                                Batal
                            </button>
                        )}
                    </div>

                    {/* Template Picker Button - Only show when creating new habit */}
                    {!editingHabit && (
                        <div className="flex justify-center">
                            <TemplatePickerButton onClick={() => setShowTemplatePicker(true)} />
                        </div>
                    )}

                    <div className="space-y-4">
                        <FormField
                            label="Nama kebiasaan"
                            hint="Deskriptif dan spesifik (misal: Minum air 8 gelas)"
                            error={errors.name}
                            touched={touched.name}
                            required
                            fieldId="habit-name"
                        >
                            <input
                                type="text"
                                name="name"
                                id="habit-name"
                                placeholder="Nama kebiasaan"
                                value={values.name}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                className="input"
                                autoFocus
                            />
                        </FormField>

                        <FormField
                            label="Deskripsi"
                            error={errors.description}
                            touched={touched.description}
                            fieldId="habit-description"
                        >
                            <input
                                type="text"
                                name="description"
                                id="habit-description"
                                placeholder="Penjelasan singkat (opsional)"
                                value={values.description}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                className="input"
                            />
                        </FormField>

                        {/* Category Selector */}
                        <CategorySelector
                            value={values.category}
                            onChange={(value) => setFieldValue('category', value)}
                            label="Kategori"
                            error={errors.category}
                        />

                        {/* Icon Picker */}
                        <IconPickerButton
                            icon={values.icon}
                            onClick={() => setShowIconPicker(true)}
                            label="Icon"
                        />

                        {/* Tags Input */}
                        <TagInput
                            tags={values.tags}
                            onChange={(tags) => setFieldValue('tags', tags)}
                            label="Tags"
                        />

                        {/* Reminder Settings */}
                        <div className="flex items-center gap-3 p-3 rounded-xl border border-line">
                            <label className="flex items-center gap-2 cursor-pointer flex-1">
                                <input
                                    type="checkbox"
                                    name="reminder_enabled"
                                    checked={values.reminder_enabled || false}
                                    onChange={async (e) => {
                                        const checked = e.target.checked
                                        haptics.light()

                                        // Request permission if enabling reminder for first time
                                        if (checked && getNotificationPermission() === 'default') {
                                            await requestNotificationPermission()
                                        }

                                        setFieldValue('reminder_enabled', checked)
                                        setFieldValue('reminder_time', checked ? (values.reminder_time || '08:00') : null)
                                    }}
                                    className="w-4 h-4 accent-primary"
                                />
                                <span className="text-body text-ink">Ingatkan saya</span>
                            </label>

                            {values.reminder_enabled && (
                                <input
                                    type="time"
                                    name="reminder_time"
                                    value={values.reminder_time || '08:00'}
                                    onChange={(e) => setFieldValue('reminder_time', e.target.value)}
                                    className="px-3 py-1.5 rounded-lg border border-line bg-paper text-body text-ink"
                                />
                            )}
                        </div>

                        {/* Advanced: Hari reminder khusus */}
                        {values.reminder_enabled && (
                            <details className="group">
                                <summary className="flex items-center gap-2 cursor-pointer text-small text-ink-muted hover:text-ink">
                                    <IconChevronDown size={16} className="group-open:rotate-180 transition-transform" />
                                    <span>Atur hari reminder (opsional)</span>
                                </summary>
                                <div className="mt-3 pl-6">
                                    <WeekdaySelector
                                        value={values.reminder_days || []}
                                        onChange={(days) => setFieldValue('reminder_days', days.length > 0 ? days : null)}
                                        helperText="Kosong = reminder mengikuti hari aktif habit"
                                    />
                                </div>
                            </details>
                        )}
                    </div>
                    <div className="flex gap-2">
                        <button type="submit" className="btn-primary" disabled={isSubmitting}>
                            {isSubmitting ? 'Menyimpan...' : editingHabit ? 'Update' : 'Simpan'}
                        </button>
                        <button 
                            type="button" 
                            onClick={handleCancelEdit} 
                            className="btn-secondary"
                            disabled={isSubmitting}
                        >
                            Batal
                        </button>
                    </div>
                </form>
            )}

            {/* Habits list */}
            {habits.length > 0 ? (
                <>
                    <div className="space-y-2">
                        {filteredHabits.map((habit, index) => {
                        const isArchived = !!habit.archived_at
                        const activeHabits = filteredHabits.filter(h => !h.archived_at)
                        const activeIndex = activeHabits.findIndex(h => h.id === habit.id)
                        const isMenuOpen = activeMenu === habit.id
                        
                        return (
                            <div key={habit.id} className="relative">
                                <SwipeToCompleteOrDelete
                                    onComplete={() => handleToggle(habit.id)}
                                    onDelete={() => handleDelete(habit.id)}
                                    isCompleted={isChecked(habit.id)}
                                    completeLabel="Check-in"
                                    deleteLabel="Hapus"
                                    disabled={isArchived}
                                >
                                    <div className={`card group py-3 ${isArchived ? 'opacity-60' : ''}`}>
                                    <div 
                                        className="flex items-center gap-3"
                                    >
                                        {/* Checkbox */}
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                !isArchived && handleToggle(habit.id)
                                            }}
                                            disabled={isArchived}
                                            className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                                                isArchived 
                                                    ? 'border-line cursor-not-allowed'
                                                    : isChecked(habit.id)
                                                        ? 'bg-primary border-primary text-white cursor-pointer'
                                                        : 'border-line hover:border-primary cursor-pointer'
                                            }`}
                                            aria-label={isChecked(habit.id) ? 'Batalkan check-in' : 'Check-in'}
                                        >
                                            {isChecked(habit.id) && (
                                                <IconCheck size={16} stroke={2.5} />
                                            )}
                                        </button>

                                        {/* Custom Icon (if set) */}
                                        {habit.icon && (
                                            <div className="flex-shrink-0">
                                                <HabitIcon iconName={habit.icon} size={20} className="text-primary" />
                                            </div>
                                        )}

                                        {/* Info */}
                                        <div 
                                            className="flex-1 min-w-0 cursor-pointer"
                                            onClick={() => !isArchived && navigate(`/habits/${habit.id}`)}
                                        >
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <h3 className={`text-h3 truncate ${isChecked(habit.id) ? 'text-ink-muted line-through' : 'text-ink'}`}>
                                                    {habit.name}
                                                </h3>
                                                {isArchived && (
                                                    <span className="text-tiny px-2 py-0.5 rounded-full bg-ink-muted/10 text-ink-muted flex-shrink-0">
                                                        Arsip
                                                    </span>
                                                )}
                                                {habit.category && (
                                                    <CategoryBadge categoryId={habit.category} size="sm" />
                                                )}
                                            </div>
                                            {habit.description && (
                                                <p className="text-small text-ink-muted mt-0.5 truncate">{habit.description}</p>
                                            )}
                                            {/* Tags */}
                                            {habit.tags && habit.tags.length > 0 && (
                                                <div className="flex flex-wrap gap-1 mt-1.5">
                                                    {habit.tags.slice(0, 3).map(tag => (
                                                        <span 
                                                            key={tag}
                                                            className="text-[10px] sm:text-xs px-1.5 py-0.5 rounded bg-base-300 text-base-content/70"
                                                        >
                                                            {tag}
                                                        </span>
                                                    ))}
                                                    {habit.tags.length > 3 && (
                                                        <span className="text-[10px] sm:text-xs px-1.5 py-0.5 text-base-content/50">
                                                            +{habit.tags.length - 3}
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        {/* Habit status with streak */}
                                        <div 
                                            className="cursor-pointer"
                                            onClick={() => !isArchived && navigate(`/habits/${habit.id}`)}
                                        >
                                            <HabitStatus 
                                                completed={isChecked(habit.id)}
                                                streak={habit.streak_current}
                                                size="md"
                                            />
                                        </div>

                                        {/* Action buttons */}
                                        {!isArchived ? (
                                            <div className="flex items-center gap-2 flex-shrink-0">
                                                {/* Edit button */}
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        handleEdit(habit)
                                                    }}
                                                    className="min-w-9 min-h-9 flex items-center justify-center rounded-lg text-primary bg-primary/10 hover:bg-primary/20 active:scale-95 transition-all"
                                                    aria-label="Edit kebiasaan"
                                                >
                                                    <IconPencil size={18} stroke={2} />
                                                </button>

                                                {/* Kebab menu */}
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        setActiveMenu(isMenuOpen ? null : habit.id)
                                                    }}
                                                    className="min-w-9 min-h-9 flex items-center justify-center rounded-lg text-ink-muted bg-ink-muted/5 hover:bg-ink-muted/10 active:scale-95 transition-all"
                                                    aria-label="More options"
                                                >
                                                    <IconDots size={18} stroke={2} />
                                                </button>
                                            </div>
                                        ) : (
                                            /* Unarchive button for archived habits */
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    handleUnarchive(habit.id)
                                                }}
                                                className="min-w-9 min-h-9 flex items-center justify-center rounded-lg text-success bg-success/10 hover:bg-success/20 active:scale-95 transition-all flex-shrink-0"
                                                aria-label="Kembalikan kebiasaan"
                                                title="Kembalikan"
                                            >
                                                <IconArchive size={18} stroke={2} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </SwipeToCompleteOrDelete>

                            {/* Dropdown menu - rendered outside to avoid overflow issues */}
                            {!isArchived && isMenuOpen && (
                                <>
                                    {/* Backdrop */}
                                    <div 
                                        className="fixed inset-0 z-[100]" 
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            setActiveMenu(null)
                                        }}
                                    />
                                    
                                    {/* Menu - positioned absolute to the wrapper div */}
                                    <div className="absolute right-2 top-12 z-[101] bg-surface border border-line rounded-lg shadow-xl py-1 min-w-[160px] animate-in fade-in slide-in-from-top-2">
                                        {/* Move Up */}
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                handleMoveUp(habit.id, activeIndex)
                                            }}
                                            disabled={activeIndex === 0}
                                            className={`w-full px-4 py-2 text-left text-small flex items-center gap-3 ${
                                                activeIndex === 0 
                                                    ? 'text-ink-muted cursor-not-allowed opacity-50'
                                                    : 'text-ink hover:bg-paper-warm'
                                            }`}
                                        >
                                            <IconArrowUp size={16} stroke={2} />
                                            <span>Pindah ke atas</span>
                                        </button>

                                        {/* Move Down */}
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                handleMoveDown(habit.id, activeIndex)
                                            }}
                                            disabled={activeIndex === activeHabits.length - 1}
                                            className={`w-full px-4 py-2 text-left text-small flex items-center gap-3 ${
                                                activeIndex === activeHabits.length - 1
                                                    ? 'text-ink-muted cursor-not-allowed opacity-50'
                                                    : 'text-ink hover:bg-paper-warm'
                                            }`}
                                        >
                                            <IconArrowDown size={16} stroke={2} />
                                            <span>Pindah ke bawah</span>
                                        </button>

                                        <div className="border-t border-line my-1" />

                                        {/* Archive */}
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                handleArchive(habit.id)
                                                setActiveMenu(null)
                                            }}
                                            className="w-full px-4 py-2 text-left text-small flex items-center gap-3 text-warning hover:bg-paper-warm"
                                        >
                                            <IconArchive size={16} stroke={2} />
                                            <span>Arsipkan</span>
                                        </button>

                                        {/* Delete */}
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                handleDelete(habit.id)
                                                setActiveMenu(null)
                                            }}
                                            className="w-full px-4 py-2 text-left text-small flex items-center gap-3 text-danger hover:bg-danger/10"
                                        >
                                            <IconX size={16} stroke={2} />
                                            <span>Hapus</span>
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    )
                })}
                </div>
                </>
            ) : !showForm && (
                <>
                    {categoryFilter ? (
                        <div className="text-center py-12">
                            <p className="text-body text-ink-muted mb-4">
                                Tidak ada kebiasaan di kategori ini
                            </p>
                            <button
                                onClick={() => handleCategoryFilter('')}
                                className="btn btn-secondary btn-sm"
                            >
                                Tampilkan Semua
                            </button>
                        </div>
                    ) : (
                        <>
                            <EmptyState
                                icon="✨"
                                title="Belum ada kebiasaan"
                                description="Kebiasaan baik dibangun dari langkah kecil. Mulai dengan 1 kebiasaan yang ingin kamu jaga setiap hari."
                                primaryAction={() => setShowForm(true)}
                                primaryLabel="Buat kebiasaan pertama"
                            />

                            <div className="card">
                                <h3 className="text-h2 text-ink mb-3">Contoh kebiasaan populer</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {HABIT_TEMPLATES.slice(0, 4).map((template, i) => (
                                <button
                                    key={i}
                                    onClick={() => handleSelectTemplate(template)}
                                    className="text-left p-3 rounded-lg border border-line hover:border-primary hover:bg-primary-50/30 transition-all group"
                                >
                                    <p className="text-h3 text-ink group-hover:text-primary">{template.name}</p>
                                    <p className="text-small text-ink-muted">{template.description}</p>
                                </button>
                            ))}
                        </div>
                    </div>
                        </>
                    )}
                </>
            )}

            {/* Weekly rhythm */}
            {habits.length > 0 && (
                <section className="card">
                    <h2 className="text-h2 text-ink mb-4">Ritme minggu ini</h2>
                    <div className="grid grid-cols-7 gap-2">
                        {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map((day, i) => {
                            const isToday = i === new Date().getDay()
                            const isPast = i < new Date().getDay()
                            return (
                                <div key={day} className="text-center">
                                    <p className={`text-caption mb-2 ${isToday ? 'text-primary font-medium' : 'text-ink-muted'}`}>
                                        {day}
                                    </p>
                                    <div className={`w-8 h-8 mx-auto rounded-lg flex items-center justify-center ${isToday
                                        ? 'bg-primary text-white'
                                        : isPast
                                            ? 'bg-primary-50 text-primary'
                                            : 'bg-paper-warm text-ink-soft'
                                        }`}>
                                        {isPast && <IconCheck size={16} stroke={2} />}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </section>
            )}

            {/* Swipe gesture hint */}
            {habits.length > 0 && <SwipeHint storageKey="habits-swipe-hint" />}

            {/* Icon Picker Modal */}
            <IconPicker
                isOpen={showIconPicker}
                onClose={() => setShowIconPicker(false)}
                onSelect={(iconName) => setFieldValue('icon', iconName)}
                selectedIcon={values.icon}
            />

            {/* Template Picker Modal */}
            <TemplatePicker
                isOpen={showTemplatePicker}
                onClose={() => setShowTemplatePicker(false)}
                onSelectTemplate={handleSelectTemplate}
            />

            {/* Check-in Note Modal */}
            <CheckInNoteModal
                isOpen={checkInModal.isOpen}
                onClose={() => setCheckInModal({ isOpen: false, habit: null })}
                onSubmit={handleCheckInSubmit}
                habitName={checkInModal.habit?.name || ''}
            />
        </div>
        </PullToRefresh>
    )
}

export default Habits
