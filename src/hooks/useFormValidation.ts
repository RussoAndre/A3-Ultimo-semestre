/**
 * Hook for form validation with security features
 */

import { useState, useCallback } from 'react'
import { sanitizeString } from '../utils/security'
import type { ValidationResult } from '../utils/validation'

interface FormErrors {
  [key: string]: string[]
}

interface UseFormValidationOptions<T> {
  initialValues: T
  validationRules: {
    [K in keyof T]?: (value: T[K]) => ValidationResult
  }
  sanitize?: boolean
}

export const useFormValidation = <T extends Record<string, any>>({
  initialValues,
  validationRules,
  sanitize = true,
}: UseFormValidationOptions<T>) => {
  const [values, setValues] = useState<T>(initialValues)
  const [errors, setErrors] = useState<FormErrors>({})
  const [touched, setTouched] = useState<Record<keyof T, boolean>>({} as Record<keyof T, boolean>)
  const [isValidating, setIsValidating] = useState(false)

  // Validate a single field
  const validateField = useCallback(
    (fieldName: keyof T, value: any): string[] => {
      const rule = validationRules[fieldName]
      if (!rule) return []

      const result = rule(value)
      return result.isValid ? [] : result.errors
    },
    [validationRules]
  )

  // Validate all fields
  const validateForm = useCallback((): boolean => {
    const newErrors: FormErrors = {}
    let isValid = true

    for (const fieldName in validationRules) {
      const fieldErrors = validateField(fieldName, values[fieldName])
      if (fieldErrors.length > 0) {
        newErrors[fieldName] = fieldErrors
        isValid = false
      }
    }

    setErrors(newErrors)
    return isValid
  }, [values, validationRules, validateField])

  // Handle field change
  const handleChange = useCallback(
    (fieldName: keyof T) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      let value: any = event.target.value

      // Sanitize string inputs if enabled
      if (sanitize && typeof value === 'string') {
        value = sanitizeString(value)
      }

      setValues(prev => ({
        ...prev,
        [fieldName]: value,
      }))

      // Clear errors for this field when user starts typing
      if (errors[fieldName as string]) {
        setErrors(prev => {
          const newErrors = { ...prev }
          delete newErrors[fieldName as string]
          return newErrors
        })
      }
    },
    [sanitize, errors]
  )

  // Handle field blur
  const handleBlur = useCallback(
    (fieldName: keyof T) => () => {
      setTouched(prev => ({
        ...prev,
        [fieldName]: true,
      }))

      // Validate field on blur
      const fieldErrors = validateField(fieldName, values[fieldName])
      if (fieldErrors.length > 0) {
        setErrors(prev => ({
          ...prev,
          [fieldName as string]: fieldErrors,
        }))
      }
    },
    [values, validateField]
  )

  // Set field value programmatically
  const setFieldValue = useCallback((fieldName: keyof T, value: any) => {
    setValues(prev => ({
      ...prev,
      [fieldName]: value,
    }))
  }, [])

  // Set field error programmatically
  const setFieldError = useCallback((fieldName: keyof T, error: string[]) => {
    setErrors(prev => ({
      ...prev,
      [fieldName as string]: error,
    }))
  }, [])

  // Reset form
  const resetForm = useCallback(() => {
    setValues(initialValues)
    setErrors({})
    setTouched({} as Record<keyof T, boolean>)
  }, [initialValues])

  // Handle form submit
  const handleSubmit = useCallback(
    (onSubmit: (values: T) => void | Promise<void>) =>
      async (event: React.FormEvent) => {
        event.preventDefault()
        setIsValidating(true)

        // Mark all fields as touched
        const allTouched = Object.keys(values).reduce(
          (acc, key) => ({
            ...acc,
            [key]: true,
          }),
          {} as Record<keyof T, boolean>
        )
        setTouched(allTouched)

        // Validate form
        const isValid = validateForm()

        if (isValid) {
          try {
            await onSubmit(values)
          } catch (error) {
            console.error('Form submission error:', error)
          }
        }

        setIsValidating(false)
      },
    [values, validateForm]
  )

  // Get field props for easy integration
  const getFieldProps = useCallback(
    (fieldName: keyof T) => ({
      name: fieldName as string,
      value: values[fieldName] || '',
      onChange: handleChange(fieldName),
      onBlur: handleBlur(fieldName),
      'aria-invalid': touched[fieldName] && errors[fieldName as string] ? 'true' : 'false',
      'aria-describedby': errors[fieldName as string] ? `${fieldName as string}-error` : undefined,
    }),
    [values, touched, errors, handleChange, handleBlur]
  )

  return {
    values,
    errors,
    touched,
    isValidating,
    handleChange,
    handleBlur,
    handleSubmit,
    setFieldValue,
    setFieldError,
    validateForm,
    resetForm,
    getFieldProps,
  }
}
