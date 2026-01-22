/**
 * Status Pattern Indicator Component
 * 
 * Provides visual patterns alongside colors for color-blind accessibility.
 * Used for habit status, finance indicators, and calendar events.
 * 
 * Usage:
 *   import { StatusIndicator } from '@/components/ui/StatusIndicator';
 *   
 *   <StatusIndicator status="success" label="Completed" />
 */

import { getPatternForStatus } from '../../utils/colorBlindSimulator';

type StatusType = 'success' | 'warning' | 'error' | 'info' | 'neutral';

interface StatusIndicatorProps {
  status: StatusType;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  showPattern?: boolean;
  className?: string;
}

export function StatusIndicator({
  status,
  label,
  size = 'md',
  showIcon = true,
  showPattern = false,
  className = '',
}: StatusIndicatorProps) {
  const { icon, pattern, ariaLabel } = getPatternForStatus(status);

  const sizeClasses = {
    sm: 'w-4 h-4 text-xs',
    md: 'w-6 h-6 text-sm',
    lg: 'w-8 h-8 text-base',
  };

  const colorClasses = {
    success: 'bg-green-500 text-white',
    warning: 'bg-amber-500 text-white',
    error: 'bg-red-500 text-white',
    info: 'bg-blue-500 text-white',
    neutral: 'bg-slate-300 text-slate-700',
  };

  const patternSvgs = {
    solid: null,
    'diagonal-stripes': (
      <pattern
        id="diagonal-stripes"
        patternUnits="userSpaceOnUse"
        width="4"
        height="4"
        patternTransform="rotate(45)"
      >
        <rect width="2" height="4" fill="currentColor" />
      </pattern>
    ),
    'cross-hatch': (
      <pattern id="cross-hatch" patternUnits="userSpaceOnUse" width="4" height="4">
        <path d="M 0,0 L 4,4 M 4,0 L 0,4" stroke="currentColor" strokeWidth="0.5" />
      </pattern>
    ),
    dots: (
      <pattern id="dots" patternUnits="userSpaceOnUse" width="4" height="4">
        <circle cx="2" cy="2" r="1" fill="currentColor" />
      </pattern>
    ),
    none: null,
  };

  return (
    <div
      className={`inline-flex items-center gap-2 ${className}`}
      role="status"
      aria-label={ariaLabel}
    >
      <div
        className={`
          ${sizeClasses[size]} 
          ${colorClasses[status]}
          rounded-full
          flex items-center justify-center
          font-semibold
          relative
          overflow-hidden
        `}
      >
        {showIcon && <span className="relative z-10">{icon}</span>}

        {showPattern && pattern !== 'solid' && pattern !== 'none' && patternSvgs[pattern as keyof typeof patternSvgs] && (
          <svg className="absolute inset-0 w-full h-full opacity-20">
            <defs>{patternSvgs[pattern as keyof typeof patternSvgs]}</defs>
            <rect width="100%" height="100%" fill={`url(#${pattern})`} />
          </svg>
        )}
      </div>

      {label && <span className="text-sm text-ink-muted">{label}</span>}
    </div>
  );
}

/**
 * Habit Status Badge with Pattern
 * Replaces simple colored dots with accessible indicators
 */
interface HabitStatusProps {
  completed: boolean;
  streak?: number;
  size?: 'sm' | 'md' | 'lg';
}

export function HabitStatus({ completed, streak = 0, size = 'md' }: HabitStatusProps) {
  const status = completed ? 'success' : 'neutral';
  const icon = completed ? '✓' : '○';

  return (
    <div className="flex items-center gap-2">
      <StatusIndicator
        status={status}
        size={size}
        showIcon
        showPattern={completed}
        aria-label={completed ? 'Completed' : 'Not completed'}
      />
      {streak > 0 && (
        <span className="text-xs text-amber-500 font-semibold" aria-label={`${streak} day streak`}>
          🔥 {streak}
        </span>
      )}
    </div>
  );
}

/**
 * Finance Indicator with Pattern
 * Shows positive/negative/neutral with icons and patterns
 */
interface FinanceIndicatorProps {
  value: number;
  showValue?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function FinanceIndicator({ value, showValue = true, size = 'md' }: FinanceIndicatorProps) {
  const status = value > 0 ? 'success' : value < 0 ? 'error' : 'neutral';
  const icon = value > 0 ? '↑' : value < 0 ? '↓' : '•';

  return (
    <div className="inline-flex items-center gap-2">
      <StatusIndicator status={status} size={size} showIcon={false} showPattern />
      <span
        className={`
          text-sm font-semibold
          ${value > 0 ? 'text-green-600' : value < 0 ? 'text-red-600' : 'text-slate-500'}
        `}
      >
        {icon}
        {showValue &&
          ` Rp${Math.abs(value).toLocaleString('id-ID', { maximumFractionDigits: 0 })}`}
      </span>
    </div>
  );
}

/**
 * Calendar Event Status
 * Shows event priority/type with patterns
 */
interface CalendarEventStatusProps {
  type: 'deadline' | 'meeting' | 'habit' | 'reminder';
  priority?: 'high' | 'medium' | 'low';
  size?: 'sm' | 'md' | 'lg';
}

export function CalendarEventStatus({
  type,
  priority = 'medium',
  size = 'sm',
}: CalendarEventStatusProps) {
  const statusMap = {
    deadline: 'error' as const,
    meeting: 'info' as const,
    habit: 'success' as const,
    reminder: 'warning' as const,
  };

  const iconMap = {
    deadline: '⏰',
    meeting: '👥',
    habit: '✓',
    reminder: '🔔',
  };

  return (
    <StatusIndicator
      status={statusMap[type]}
      size={size}
      showIcon={false}
      showPattern
      label={iconMap[type]}
      className="mr-2"
    />
  );
}

/**
 * Budget Warning Indicator
 * Shows budget health with icon + pattern
 */
interface BudgetWarningProps {
  percentage: number; // 0-100
  size?: 'sm' | 'md' | 'lg';
}

export function BudgetWarning({ percentage, size = 'md' }: BudgetWarningProps) {
  let status: 'success' | 'warning' | 'error';
  let message: string;

  if (percentage < 70) {
    status = 'success';
    message = 'On track';
  } else if (percentage < 90) {
    status = 'warning';
    message = 'Approaching limit';
  } else {
    status = 'error';
    message = 'Over budget';
  }

  return (
    <div className="inline-flex items-center gap-2">
      <StatusIndicator status={status} size={size} showIcon showPattern />
      <div className="flex flex-col">
        <span className="text-sm font-semibold text-ink">{percentage}% used</span>
        <span className="text-xs text-ink-muted">{message}</span>
      </div>
    </div>
  );
}
