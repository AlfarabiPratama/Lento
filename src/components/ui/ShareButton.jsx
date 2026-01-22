import { useState } from 'react'
import { IconShare3, IconCopy, IconCheck } from '@tabler/icons-react'
import { shareOrCopy, canShare } from '../../lib/share'

/**
 * ShareButton - Reusable share/copy button
 */
export function ShareButton({
    title,
    text,
    url,
    files,
    size = 'md',
    variant = 'ghost',
    className = '',
    onShare,
}) {
    const [copied, setCopied] = useState(false)

    const handleShare = async () => {
        const result = await shareOrCopy({ title, text, url, files })

        if (result.ok) {
            if (result.method === 'copy') {
                setCopied(true)
                setTimeout(() => setCopied(false), 2000)
            }
            onShare?.(result)
        }
    }

    const sizeClasses = {
        sm: 'w-8 h-8',
        md: 'w-10 h-10',
        lg: 'w-12 h-12',
    }

    const iconSize = {
        sm: 16,
        md: 20,
        lg: 24,
    }

    const baseClasses = `
    inline-flex items-center justify-center rounded-lg
    transition-all lento-focus
    ${sizeClasses[size]}
    ${className}
  `

    const variantClasses = {
        ghost: 'hover:bg-paper-warm text-ink-muted hover:text-ink',
        primary: 'bg-primary text-white hover:bg-primary-dark',
        secondary: 'bg-paper-warm text-ink hover:bg-line',
    }

    return (
        <button
            onClick={handleShare}
            className={`${baseClasses} ${variantClasses[variant]}`}
            aria-label={canShare() ? 'Bagikan' : 'Salin'}
            title={canShare() ? 'Bagikan' : 'Salin ke clipboard'}
        >
            {copied ? (
                <IconCheck size={iconSize[size]} stroke={2} className="text-green-500" />
            ) : canShare() ? (
                <IconShare3 size={iconSize[size]} stroke={1.5} />
            ) : (
                <IconCopy size={iconSize[size]} stroke={1.5} />
            )}
        </button>
    )
}

export default ShareButton
