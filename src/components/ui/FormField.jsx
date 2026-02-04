/**
 * FormField Component
 * 
 * Accessible form field wrapper with integrated error states,
 * labels, hints, and ARIA attributes
 * 
 * Features:
 * - Automatic error state styling
 * - ARIA attributes for accessibility
 * - Label and hint text support
 * - Optional field indicator
 * - Error message integration
 * - Consistent spacing
 * 
 * @example
 * <FormField
 *   label="Email"
 *   hint="We'll never share your email"
 *   error={errors.email}
 *   touched={touched.email}
 *   required
 * >
 *   <input {...getFieldProps('email')} type="email" />
 * </FormField>
 */

import { ErrorMessage } from './ErrorMessage'

export function FormField({
    label,
    hint,
    error,
    touched,
    required = false,
    children,
    className = '',
    labelClassName = '',
    fieldId,
}) {
    const hasError = touched && error
    const errorId = fieldId ? `${fieldId}-error` : undefined
    const hintId = fieldId ? `${fieldId}-hint` : undefined

    // Clone children to add error state class
    const childWithProps = children && typeof children === 'object' 
        ? {
            ...children,
            props: {
                ...children.props,
                id: fieldId || children.props.id,
                'aria-describedby': [
                    hasError ? errorId : null,
                    hint ? hintId : null,
                    children.props['aria-describedby']
                ].filter(Boolean).join(' ') || undefined,
            }
        }
        : children

    return (
        <div className={`space-y-1.5 ${className}`}>
            {/* Label */}
            {label && (
                <label
                    htmlFor={fieldId}
                    className={`block text-sm font-medium text-ink-900 dark:text-ink-100 ${labelClassName}`}
                >
                    {label}
                    {required && (
                        <span className="text-red-600 dark:text-red-400 ml-1" aria-label="required">
                            *
                        </span>
                    )}
                    {!required && (
                        <span className="text-ink-500 dark:text-ink-400 ml-1 font-normal text-xs">
                            (opsional)
                        </span>
                    )}
                </label>
            )}

            {/* Hint text */}
            {hint && (
                <p
                    id={hintId}
                    className="text-xs text-ink-600 dark:text-ink-400"
                >
                    {hint}
                </p>
            )}

            {/* Input field with error styling */}
            <div className={hasError ? 'form-field-error' : ''}>
                {childWithProps}
            </div>

            {/* Error message */}
            <ErrorMessage id={errorId} error={hasError ? error : null} />
        </div>
    )
}
