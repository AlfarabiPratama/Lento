/**
 * useFormValidation Hook
 * 
 * Reusable form validation hook with:
 * - Zod schema validation
 * - Real-time validation (onChange/onBlur)
 * - Touched field tracking
 * - Error state management
 * - Submit handling
 * 
 * @example
 * const { values, errors, touched, handleChange, handleBlur, handleSubmit, isValid } = useFormValidation({
 *   initialValues: { name: '', email: '' },
 *   validationSchema: z.object({
 *     name: z.string().min(3, 'Nama minimal 3 karakter'),
 *     email: z.string().email('Email tidak valid')
 *   }),
 *   onSubmit: async (values) => {
 *     await api.create(values)
 *   }
 * })
 */

import { useState, useCallback, useMemo } from 'react'

export function useFormValidation({
    initialValues = {},
    validationSchema,
    onSubmit,
    validateOnChange = true,
    validateOnBlur = true,
}) {
    const [values, setValues] = useState(initialValues)
    const [errors, setErrors] = useState({})
    const [touched, setTouched] = useState({})
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [submitCount, setSubmitCount] = useState(0)

    // Validate single field
    const validateField = useCallback((fieldName, value) => {
        if (!validationSchema) return null

        try {
            // Create a partial schema for single field validation
            const fieldSchema = validationSchema.shape[fieldName]
            if (!fieldSchema) return null

            fieldSchema.parse(value)
            return null // No error
        } catch (error) {
            if (error.errors && error.errors[0]) {
                return error.errors[0].message
            }
            return 'Invalid value'
        }
    }, [validationSchema])

    // Validate all fields
    const validateForm = useCallback((valuesToValidate) => {
        if (!validationSchema) return {}

        try {
            validationSchema.parse(valuesToValidate)
            return {} // No errors
        } catch (error) {
            if (error.errors) {
                const formErrors = {}
                error.errors.forEach((err) => {
                    const fieldName = err.path[0]
                    if (fieldName) {
                        formErrors[fieldName] = err.message
                    }
                })
                return formErrors
            }
            return {}
        }
    }, [validationSchema])

    // Handle field change
    const handleChange = useCallback((e) => {
        const { name, value, type, checked } = e.target
        const fieldValue = type === 'checkbox' ? checked : value

        setValues((prev) => ({
            ...prev,
            [name]: fieldValue,
        }))

        // Real-time validation
        if (validateOnChange && (touched[name] || submitCount > 0)) {
            const error = validateField(name, fieldValue)
            setErrors((prev) => ({
                ...prev,
                [name]: error,
            }))
        }
    }, [validateOnChange, validateField, touched, submitCount])

    // Handle field blur
    const handleBlur = useCallback((e) => {
        const { name, value } = e.target

        setTouched((prev) => ({
            ...prev,
            [name]: true,
        }))

        // Validate on blur
        if (validateOnBlur) {
            const error = validateField(name, value)
            setErrors((prev) => ({
                ...prev,
                [name]: error,
            }))
        }
    }, [validateOnBlur, validateField])

    // Handle form submit
    const handleSubmit = useCallback(async (e) => {
        if (e) {
            e.preventDefault()
        }

        setSubmitCount((prev) => prev + 1)

        // Mark all fields as touched
        const allTouched = Object.keys(values).reduce((acc, key) => {
            acc[key] = true
            return acc
        }, {})
        setTouched(allTouched)

        // Validate entire form
        const formErrors = validateForm(values)
        setErrors(formErrors)

        // If no errors, submit
        if (Object.keys(formErrors).length === 0) {
            setIsSubmitting(true)
            try {
                await onSubmit(values)
            } catch (error) {
                console.error('Form submission error:', error)
                throw error
            } finally {
                setIsSubmitting(false)
            }
        } else {
            // Focus first error field
            const firstErrorField = Object.keys(formErrors)[0]
            const element = document.querySelector(`[name="${firstErrorField}"]`)
            if (element) {
                element.focus()
            }
        }
    }, [values, validateForm, onSubmit])

    // Reset form
    const resetForm = useCallback(() => {
        setValues(initialValues)
        setErrors({})
        setTouched({})
        setSubmitCount(0)
        setIsSubmitting(false)
    }, [initialValues])

    // Set field value programmatically
    const setFieldValue = useCallback((fieldName, value) => {
        setValues((prev) => ({
            ...prev,
            [fieldName]: value,
        }))

        // Validate if touched
        if (touched[fieldName] || submitCount > 0) {
            const error = validateField(fieldName, value)
            setErrors((prev) => ({
                ...prev,
                [fieldName]: error,
            }))
        }
    }, [validateField, touched, submitCount])

    // Set field error manually
    const setFieldError = useCallback((fieldName, error) => {
        setErrors((prev) => ({
            ...prev,
            [fieldName]: error,
        }))
    }, [])

    // Check if form is valid
    const isValid = useMemo(() => {
        return Object.keys(errors).length === 0 && Object.values(errors).every(err => !err)
    }, [errors])

    // Get field props (for easy spreading)
    const getFieldProps = useCallback((fieldName) => {
        return {
            name: fieldName,
            value: values[fieldName] || '',
            onChange: handleChange,
            onBlur: handleBlur,
            'aria-invalid': touched[fieldName] && errors[fieldName] ? 'true' : 'false',
            'aria-describedby': errors[fieldName] ? `${fieldName}-error` : undefined,
        }
    }, [values, handleChange, handleBlur, touched, errors])

    // Get field state (for conditional rendering)
    const getFieldState = useCallback((fieldName) => {
        return {
            value: values[fieldName],
            error: errors[fieldName],
            touched: touched[fieldName],
            hasError: touched[fieldName] && !!errors[fieldName],
        }
    }, [values, errors, touched])

    return {
        // Values
        values,
        errors,
        touched,
        isSubmitting,
        submitCount,
        isValid,

        // Handlers
        handleChange,
        handleBlur,
        handleSubmit,
        resetForm,
        setFieldValue,
        setFieldError,

        // Helpers
        getFieldProps,
        getFieldState,
    }
}
