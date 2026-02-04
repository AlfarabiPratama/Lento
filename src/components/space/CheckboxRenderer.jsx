import { IconSquare, IconSquareCheck, IconAlertCircle, IconCalendar } from '@tabler/icons-react'
import { isOverdue, isDueToday } from '../../features/space/checkboxParser'

/**
 * Priority Badge Component
 */
function PriorityBadge({ level }) {
    if (level === 0) return null
    
    const configs = {
        1: { color: 'text-blue-600', bg: 'bg-blue-50', label: 'Low' },
        2: { color: 'text-orange-600', bg: 'bg-orange-50', label: 'Med' },
        3: { color: 'text-red-600', bg: 'bg-red-50', label: 'High' },
    }
    
    const config = configs[level] || configs[1]
    
    return (
        <span 
            className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-tiny font-medium ${config.bg} ${config.color}`}
            title={`Priority: ${config.label}`}
        >
            <IconAlertCircle size={12} />
            {config.label}
        </span>
    )
}

/**
 * Due Date Badge Component
 */
function DueDateBadge({ dueDate }) {
    if (!dueDate) return null
    
    const today = isDueToday(dueDate)
    const overdue = isOverdue(dueDate)
    
    const formattedDate = new Date(dueDate).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short'
    })
    
    let colorClass = 'text-ink-muted bg-paper-warm'
    if (overdue) {
        colorClass = 'text-red-600 bg-red-50'
    } else if (today) {
        colorClass = 'text-orange-600 bg-orange-50'
    }
    
    return (
        <span 
            className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-tiny ${colorClass}`}
            title={overdue ? 'Overdue!' : today ? 'Due today' : 'Due date'}
        >
            <IconCalendar size={12} />
            {formattedDate}
            {overdue && '⚠️'}
        </span>
    )
}

/**
 * CheckboxRenderer - Interactive checkbox component for tasks
 * 
 * Features:
 * - Visual checkbox that can be clicked
 * - Strikethrough for completed tasks
 * - Supports nested tasks with indentation
 * - Priority badges
 * - Due date badges
 * - Accessible with keyboard
 */
export function CheckboxRenderer({ 
    isChecked, 
    text, 
    indent = '', 
    onToggle,
    disabled = false,
    priority = 0,
    dueDate = null,
}) {
    const indentLevel = indent.length / 2 // Assuming 2 spaces per indent
    const paddingLeft = indentLevel * 24 // 24px per indent level

    return (
        <div 
            className="flex items-start gap-2 py-1.5 group hover:bg-paper-warm rounded px-2 -mx-2 transition-colors"
            style={{ paddingLeft: `${paddingLeft + 8}px` }}
        >
            <button
                onClick={onToggle}
                disabled={disabled}
                className={`mt-0.5 flex-shrink-0 transition-all duration-200 ${
                    disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-110'
                }`}
                aria-label={isChecked ? 'Mark as incomplete' : 'Mark as complete'}
                type="button"
            >
                {isChecked ? (
                    <IconSquareCheck 
                        size={20} 
                        stroke={1.5}
                        className="text-primary" 
                    />
                ) : (
                    <IconSquare 
                        size={20} 
                        stroke={1.5}
                        className="text-ink-muted hover:text-primary transition-colors" 
                    />
                )}
            </button>
            
            <div className="flex-1 min-w-0">
                <span 
                    className={`block text-body leading-relaxed transition-all duration-200 ${
                        isChecked 
                            ? 'text-ink-muted line-through opacity-60' 
                            : 'text-ink'
                    }`}
                >
                    {text}
                </span>
                
                {/* Badges */}
                {(priority > 0 || dueDate) && !isChecked && (
                    <div className="flex items-center gap-1.5 mt-1">
                        <PriorityBadge level={priority} />
                        <DueDateBadge dueDate={dueDate} />
                    </div>
                )}
            </div>
        </div>
    )
}

/**
 * TaskCounter - Display task completion stats
 */
export function TaskCounter({ total, completed, className = '' }) {
    if (total === 0) return null
    
    const percentage = Math.round((completed / total) * 100)
    
    return (
        <div className={`inline-flex items-center gap-2 ${className}`}>
            <div className="flex items-center gap-1.5">
                <IconSquareCheck size={14} className="text-primary" />
                <span className="text-small text-ink">
                    {completed}/{total}
                </span>
            </div>
            
            {/* Progress bar */}
            <div className="w-16 h-1.5 bg-paper-warm rounded-full overflow-hidden">
                <div 
                    className="h-full bg-primary rounded-full transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                />
            </div>
            
            <span className="text-tiny text-ink-muted">
                {percentage}%
            </span>
        </div>
    )
}

/**
 * ContentRenderer - Render note content with interactive checkboxes
 * 
 * This component intelligently renders content:
 * - Checkbox lines become interactive CheckboxRenderer components
 * - Regular text lines remain as plain text
 * - Preserves formatting and structure
 * - Supports filtering
 */
export function ContentRenderer({ content, onToggle, disabled = false, filter = 'all' }) {
    const lines = content.split('\n')
    
    return (
        <div className="space-y-0.5">
            {lines.map((line, index) => {
                const checkboxMatch = line.match(/^(\s*)-\s\[([ xX])\]\s(.+)$/)
                
                if (checkboxMatch) {
                    const [, indent, status, rawText] = checkboxMatch
                    const isChecked = status.toLowerCase() === 'x'
                    
                    // Apply filter
                    if (filter === 'incomplete' && isChecked) {
                        return null // Skip completed tasks
                    }
                    if (filter === 'completed' && !isChecked) {
                        return null // Skip incomplete tasks
                    }
                    
                    // Parse metadata
                    const dueDateMatch = rawText.match(/@due\(([^)]+)\)/i)
                    const priorityMatch = rawText.match(/^(!{1,3})\s/)
                    
                    let dueDate = null
                    if (dueDateMatch) {
                        const dateStr = dueDateMatch[1]
                        if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
                            dueDate = new Date(dateStr)
                        }
                    }
                    
                    const priority = priorityMatch ? priorityMatch[1].length : 0
                    
                    // Clean text
                    let displayText = rawText.trim()
                    if (priorityMatch) {
                        displayText = displayText.replace(/^(!{1,3})\s/, '')
                    }
                    
                    return (
                        <CheckboxRenderer
                            key={index}
                            isChecked={isChecked}
                            text={displayText}
                            indent={indent || ''}
                            onToggle={() => onToggle(index)}
                            disabled={disabled}
                            priority={priority}
                            dueDate={dueDate}
                        />
                    )
                }
                
                // Regular text line - hide if filtering and not empty
                if (filter !== 'all' && line.trim() === '') {
                    return null
                }
                
                return (
                    <div 
                        key={index} 
                        className="py-1 px-2 text-body text-ink leading-relaxed whitespace-pre-wrap"
                    >
                        {line || '\u00A0'} {/* Non-breaking space for empty lines */}
                    </div>
                )
            })}
        </div>
    )
}

export default CheckboxRenderer
