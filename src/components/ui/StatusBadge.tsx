/**
 * StatusBadge Component with Color Blind Accessibility
 * 
 * Provides visual indicators using:
 * - Icons (✓, ⚠, ✕, etc.)
 * - Text labels
 * - Color
 * - Border patterns
 * 
 * Ensures users with color blindness can differentiate status without relying on color alone.
 * 
 * Usage:
 *   import { StatusBadge } from '@/components/ui/StatusBadge';
 *   
 *   <StatusBadge status="success" label="Lunas" />
 *   <StatusBadge status="warning" label="Jatuh tempo besok" />
 *   <StatusBadge status="error" label="Lewat jatuh tempo" />
 */

import React from 'react';
import { IconCheck, IconAlertTriangle, IconX, IconInfoCircle, IconCircle } from '@tabler/icons-react';

type StatusType = 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'paid' | 'overdue';

interface StatusBadgeProps {
  status: StatusType;
  label: string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}

const STATUS_CONFIG = {
  success: {
    bg: 'bg-green-50 dark:bg-green-950/30',
    text: 'text-green-700 dark:text-green-400',
    border: 'border-green-300 dark:border-green-700',
    icon: IconCheck,
    ariaLabel: 'Status: Success',
  },
  paid: {
    bg: 'bg-green-50 dark:bg-green-950/30',
    text: 'text-green-700 dark:text-green-400',
    border: 'border-green-300 dark:border-green-700',
    icon: IconCheck,
    ariaLabel: 'Status: Paid',
  },
  warning: {
    bg: 'bg-amber-50 dark:bg-amber-950/30',
    text: 'text-amber-700 dark:text-amber-400',
    border: 'border-amber-300 dark:border-amber-700',
    icon: IconAlertTriangle,
    ariaLabel: 'Status: Warning',
  },
  error: {
    bg: 'bg-red-50 dark:bg-red-950/30',
    text: 'text-red-700 dark:text-red-400',
    border: 'border-red-300 dark:border-red-700',
    icon: IconX,
    ariaLabel: 'Status: Error',
  },
  overdue: {
    bg: 'bg-red-50 dark:bg-red-950/30',
    text: 'text-red-700 dark:text-red-400',
    border: 'border-red-300 dark:border-red-700',
    icon: IconX,
    ariaLabel: 'Status: Overdue',
  },
  info: {
    bg: 'bg-blue-50 dark:bg-blue-950/30',
    text: 'text-blue-700 dark:text-blue-400',
    border: 'border-blue-300 dark:border-blue-700',
    icon: IconInfoCircle,
    ariaLabel: 'Status: Information',
  },
  neutral: {
    bg: 'bg-gray-50 dark:bg-gray-800',
    text: 'text-gray-700 dark:text-gray-400',
    border: 'border-gray-300 dark:border-gray-600',
    icon: IconCircle,
    ariaLabel: 'Status: Neutral',
  },
};

const SIZE_CLASSES = {
  sm: {
    padding: 'px-2 py-0.5',
    text: 'text-xs',
    icon: 12,
    gap: 'gap-1',
  },
  md: {
    padding: 'px-2.5 py-1',
    text: 'text-sm',
    icon: 14,
    gap: 'gap-1.5',
  },
  lg: {
    padding: 'px-3 py-1.5',
    text: 'text-base',
    icon: 16,
    gap: 'gap-2',
  },
};

export function StatusBadge({
  status,
  label,
  size = 'md',
  showIcon = true,
  className = '',
}: StatusBadgeProps) {
  const config = STATUS_CONFIG[status];
  const sizeConfig = SIZE_CLASSES[size];
  const Icon = config.icon;

  return (
    <span
      className={`
        inline-flex items-center 
        ${sizeConfig.gap}
        ${sizeConfig.padding}
        ${sizeConfig.text}
        ${config.bg}
        ${config.text}
        rounded-md
        font-medium
        border
        ${config.border}
        ${className}
      `}
      role="status"
      aria-label={`${config.ariaLabel}: ${label}`}
    >
      {showIcon && (
        <Icon 
          size={sizeConfig.icon} 
          stroke={2.5}
          aria-hidden="true"
        />
      )}
      <span>{label}</span>
    </span>
  );
}

/**
 * ProgressRing Component with Pattern for Color Blindness
 * 
 * Displays circular progress with:
 * - Dashed stroke pattern (not solid color)
 * - Numeric value in center
 * - ARIA labels for screen readers
 */

interface ProgressRingProps {
  value: number;
  max: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  label?: string;
  className?: string;
}

const RING_SIZES = {
  sm: { outer: 48, stroke: 4, radius: 20, fontSize: 'text-xs' },
  md: { outer: 64, stroke: 6, radius: 26, fontSize: 'text-sm' },
  lg: { outer: 80, stroke: 8, radius: 32, fontSize: 'text-base' },
};

export function ProgressRing({
  value,
  max,
  size = 'md',
  showLabel = true,
  label,
  className = '',
}: ProgressRingProps) {
  const percentage = (value / max) * 100;
  const config = RING_SIZES[size];
  const circumference = 2 * Math.PI * config.radius;
  const strokeDashoffset = circumference - (circumference * percentage) / 100;

  // Prepare ARIA attributes to avoid expression linting errors
  const ariaProps = {
    role: 'progressbar' as const,
    'aria-valuenow': value,
    'aria-valuemin': 0,
    'aria-valuemax': max,
    'aria-label': label || `Progress: ${value} of ${max}`,
  };

  return (
    <div 
      className={`relative inline-flex items-center justify-center ${className}`}
      {...ariaProps}
    >
      <svg
        width={config.outer}
        height={config.outer}
        className="transform -rotate-90"
      >
        {/* Background ring */}
        <circle
          cx={config.outer / 2}
          cy={config.outer / 2}
          r={config.radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={config.stroke}
          className="text-gray-200 dark:text-gray-700"
        />
        
        {/* Progress ring with dashed pattern for color blind accessibility */}
        <circle
          cx={config.outer / 2}
          cy={config.outer / 2}
          r={config.radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={config.stroke}
          strokeDasharray="4 2"
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="text-primary transition-all duration-300"
        />
      </svg>

      {/* Center text */}
      {showLabel && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`font-bold text-ink ${config.fontSize}`}>
            {value}/{max}
          </span>
        </div>
      )}
    </div>
  );
}

/**
 * TrendIndicator Component with Icons
 * 
 * Shows trend direction using:
 * - Arrow icons (not just color)
 * - Text labels (increased/decreased)
 * - Color as supplementary cue
 */

interface TrendIndicatorProps {
  value: number;
  label?: string;
  showPercentage?: boolean;
  className?: string;
}

export function TrendIndicator({
  value,
  label,
  showPercentage = true,
  className = '',
}: TrendIndicatorProps) {
  const isPositive = value > 0;
  const isNeutral = value === 0;
  
  const icon = isPositive ? '↑' : isNeutral ? '→' : '↓';
  const colorClass = isPositive 
    ? 'text-green-600 dark:text-green-400' 
    : isNeutral 
    ? 'text-gray-500 dark:text-gray-400'
    : 'text-red-600 dark:text-red-400';
  
  const ariaLabel = isPositive 
    ? 'Trend up' 
    : isNeutral 
    ? 'No change'
    : 'Trend down';

  return (
    <span
      className={`inline-flex items-center gap-1 ${colorClass} ${className}`}
      role="status"
      aria-label={`${ariaLabel}: ${label || `${Math.abs(value)}%`}`}
    >
      <span className="text-lg font-bold" aria-hidden="true">
        {icon}
      </span>
      {showPercentage && (
        <span className="text-sm font-semibold">
          {Math.abs(value)}%
        </span>
      )}
      {label && <span className="text-xs">{label}</span>}
    </span>
  );
}
