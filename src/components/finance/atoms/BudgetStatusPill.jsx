import { IconCheck, IconAlertTriangle, IconFlame } from '@tabler/icons-react'

/**
 * BudgetStatusPill - Status indicator for budget category
 */
export function BudgetStatusPill({ status = 'ok', className = '' }) {
    const config = {
        ok: {
            label: 'Aman',
            icon: IconCheck,
            colors: 'bg-green-100 text-green-700',
        },
        near: {
            label: 'Hampir',
            icon: IconAlertTriangle,
            colors: 'bg-yellow-100 text-yellow-700',
        },
        over: {
            label: 'Lewat',
            icon: IconFlame,
            colors: 'bg-red-100 text-red-700',
        },
    }

    const { label, icon: Icon, colors } = config[status] || config.ok

    return (
        <span
            className={`
        inline-flex items-center gap-1 px-2 py-0.5 rounded-full
        text-tiny font-medium
        ${colors}
        ${className}
      `}
        >
            <Icon size={12} stroke={2.5} />
            <span>{label}</span>
        </span>
    )
}

export default BudgetStatusPill
