import { useState, useMemo } from 'react'
import { IconSquareCheck, IconFilter, IconX, IconFileText } from '@tabler/icons-react'
import { CheckboxRenderer, TaskCounter } from './CheckboxRenderer'
import { parseCheckboxes, isOverdue, isDueToday } from '../../features/space/checkboxParser'

/**
 * TaskListView - Global view of all tasks across all notes
 * 
 * Features:
 * - Aggregate tasks from all notes
 * - Filter by status, priority, due date
 * - Click to navigate to source note
 * - Toggle task completion
 */
export function TaskListView({ pages, onNavigateToNote, onToggleTask }) {
    const [filter, setFilter] = useState('all') // all | incomplete | completed
    const [priorityFilter, setPriorityFilter] = useState(0) // 0 = all, 1-3 = specific
    const [dueDateFilter, setDueDateFilter] = useState('all') // all | today | overdue | upcoming
    const [showFilters, setShowFilters] = useState(false)

    // Aggregate all tasks from all pages
    const allTasks = useMemo(() => {
        const tasks = []
        
        pages.forEach(page => {
            const checkboxes = parseCheckboxes(page.content || '')
            
            checkboxes.forEach(checkbox => {
                tasks.push({
                    ...checkbox,
                    pageId: page.id,
                    pageTitle: page.title || 'Untitled',
                    pageContent: page.content,
                })
            })
        })
        
        return tasks
    }, [pages])

    // Apply filters
    const filteredTasks = useMemo(() => {
        let result = allTasks
        
        // Status filter
        if (filter === 'incomplete') {
            result = result.filter(t => !t.isChecked)
        } else if (filter === 'completed') {
            result = result.filter(t => t.isChecked)
        }
        
        // Priority filter
        if (priorityFilter > 0) {
            result = result.filter(t => t.priority === priorityFilter)
        }
        
        // Due date filter
        if (dueDateFilter === 'today') {
            result = result.filter(t => t.dueDate && isDueToday(t.dueDate))
        } else if (dueDateFilter === 'overdue') {
            result = result.filter(t => t.dueDate && isOverdue(t.dueDate))
        } else if (dueDateFilter === 'upcoming') {
            result = result.filter(t => t.dueDate && !isOverdue(t.dueDate) && !isDueToday(t.dueDate))
        }
        
        // Sort: incomplete first, then by priority, then by due date
        result.sort((a, b) => {
            // Completed tasks at bottom
            if (a.isChecked !== b.isChecked) {
                return a.isChecked ? 1 : -1
            }
            
            // Higher priority first
            if (a.priority !== b.priority) {
                return b.priority - a.priority
            }
            
            // Earlier due dates first
            if (a.dueDate && b.dueDate) {
                return a.dueDate - b.dueDate
            }
            if (a.dueDate) return -1
            if (b.dueDate) return 1
            
            return 0
        })
        
        return result
    }, [allTasks, filter, priorityFilter, dueDateFilter])

    const stats = useMemo(() => {
        const total = allTasks.length
        const completed = allTasks.filter(t => t.isChecked).length
        const overdue = allTasks.filter(t => t.dueDate && isOverdue(t.dueDate) && !t.isChecked).length
        const dueToday = allTasks.filter(t => t.dueDate && isDueToday(t.dueDate) && !t.isChecked).length
        
        return { total, completed, overdue, dueToday }
    }, [allTasks])

    const handleToggle = (task) => {
        // Find the line index in the original content
        const lines = task.pageContent.split('\n')
        let lineIndex = -1
        let currentPos = 0
        
        for (let i = 0; i < lines.length; i++) {
            if (currentPos === task.index) {
                lineIndex = i
                break
            }
            currentPos += lines[i].length + 1 // +1 for newline
        }
        
        if (lineIndex >= 0) {
            onToggleTask(task.pageId, lineIndex)
        }
    }

    if (allTasks.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center">
                <IconSquareCheck size={48} className="text-ink-muted opacity-50 mb-4" />
                <p className="text-body text-ink-muted">Belum ada task</p>
                <p className="text-small text-ink-soft mt-1">
                    Buat task dengan syntax: <code className="px-1 py-0.5 bg-paper-warm rounded text-tiny">- [ ] Task</code>
                </p>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {/* Header with stats */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-h2 text-ink">Semua Task</h2>
                    <div className="flex items-center gap-3 mt-2">
                        <TaskCounter total={stats.total} completed={stats.completed} />
                        
                        {stats.overdue > 0 && (
                            <span className="text-tiny text-red-600 bg-red-50 px-2 py-0.5 rounded">
                                {stats.overdue} overdue
                            </span>
                        )}
                        
                        {stats.dueToday > 0 && (
                            <span className="text-tiny text-orange-600 bg-orange-50 px-2 py-0.5 rounded">
                                {stats.dueToday} due today
                            </span>
                        )}
                    </div>
                </div>
                
                <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="btn-ghost btn-sm"
                >
                    <IconFilter size={18} />
                    Filter
                </button>
            </div>

            {/* Filters */}
            {showFilters && (
                <div className="card space-y-3 animate-in">
                    <div className="flex items-center justify-between">
                        <h3 className="text-small font-medium text-ink">Filter</h3>
                        <button
                            onClick={() => setShowFilters(false)}
                            className="btn-ghost btn-sm"
                        >
                            <IconX size={16} />
                        </button>
                    </div>
                    
                    {/* Status filter */}
                    <div>
                        <p className="text-tiny text-ink-muted mb-1">Status</p>
                        <div className="flex gap-2">
                            {['all', 'incomplete', 'completed'].map(f => (
                                <button
                                    key={f}
                                    onClick={() => setFilter(f)}
                                    className={`btn-sm ${filter === f ? 'btn-primary' : 'btn-secondary'}`}
                                >
                                    {f === 'all' ? 'Semua' : f === 'incomplete' ? 'Belum' : 'Selesai'}
                                </button>
                            ))}
                        </div>
                    </div>
                    
                    {/* Priority filter */}
                    <div>
                        <p className="text-tiny text-ink-muted mb-1">Prioritas</p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setPriorityFilter(0)}
                                className={`btn-sm ${priorityFilter === 0 ? 'btn-primary' : 'btn-secondary'}`}
                            >
                                Semua
                            </button>
                            {[1, 2, 3].map(p => (
                                <button
                                    key={p}
                                    onClick={() => setPriorityFilter(p)}
                                    className={`btn-sm ${priorityFilter === p ? 'btn-primary' : 'btn-secondary'}`}
                                >
                                    {'!'.repeat(p)}
                                </button>
                            ))}
                        </div>
                    </div>
                    
                    {/* Due date filter */}
                    <div>
                        <p className="text-tiny text-ink-muted mb-1">Deadline</p>
                        <div className="flex gap-2 flex-wrap">
                            {[
                                { value: 'all', label: 'Semua' },
                                { value: 'overdue', label: 'Overdue' },
                                { value: 'today', label: 'Hari ini' },
                                { value: 'upcoming', label: 'Upcoming' },
                            ].map(f => (
                                <button
                                    key={f.value}
                                    onClick={() => setDueDateFilter(f.value)}
                                    className={`btn-sm ${dueDateFilter === f.value ? 'btn-primary' : 'btn-secondary'}`}
                                >
                                    {f.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Task list */}
            <div className="space-y-4">
                {filteredTasks.map((task, idx) => (
                    <div 
                        key={`${task.pageId}-${idx}`}
                        className="card hover:shadow-sm transition-shadow group"
                    >
                        {/* Page title */}
                        <button
                            onClick={() => onNavigateToNote(task.pageId)}
                            className="flex items-center gap-2 text-tiny text-ink-muted hover:text-primary transition-colors mb-2"
                        >
                            <IconFileText size={14} />
                            {task.pageTitle}
                        </button>
                        
                        {/* Task */}
                        <CheckboxRenderer
                            isChecked={task.isChecked}
                            text={task.text}
                            indent={task.indent}
                            onToggle={() => handleToggle(task)}
                            disabled={false}
                            priority={task.priority}
                            dueDate={task.dueDate}
                        />
                    </div>
                ))}
            </div>

            {filteredTasks.length === 0 && (
                <div className="text-center py-8 text-ink-muted">
                    <p className="text-body">Tidak ada task yang sesuai filter</p>
                </div>
            )}
        </div>
    )
}

export default TaskListView
