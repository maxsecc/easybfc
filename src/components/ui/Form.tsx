'use client'

import React, { ReactNode } from 'react'
import { cn } from '@/utils'

interface FormProps extends React.FormHTMLAttributes<HTMLFormElement> {
  children: ReactNode
  className?: string
}

export function Form({ children, className, ...props }: FormProps) {
  return (
    <form className={cn('space-y-6', className)} {...props}>
      {children}
    </form>
  )
}

interface FormFieldProps {
  children: ReactNode
  className?: string
}

export function FormField({ children, className }: FormFieldProps) {
  return <div className={cn('space-y-2', className)}>{children}</div>
}

interface FormLabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  children: ReactNode
  className?: string
  required?: boolean
}

export function FormLabel({
  children,
  className,
  required,
  ...props
}: FormLabelProps) {
  return (
    <label
      className={cn('text-sm font-medium text-gray-700', className)}
      {...props}
    >
      {children}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
  )
}

interface FormDescriptionProps {
  children: ReactNode
  className?: string
}

export function FormDescription({
  children,
  className,
}: FormDescriptionProps) {
  return (
    <p className={cn('text-sm text-gray-500', className)}>{children}</p>
  )
}

interface FormMessageProps {
  children?: ReactNode
  className?: string
}

export function FormMessage({ children, className }: FormMessageProps) {
  if (!children) return null

  return (
    <p className={cn('text-sm font-medium text-red-500', className)}>
      {children}
    </p>
  )
}

interface FormSectionProps {
  children: ReactNode
  title?: string
  description?: string
  className?: string
}

export function FormSection({
  children,
  title,
  description,
  className,
}: FormSectionProps) {
  return (
    <div className={cn('space-y-6', className)}>
      {(title || description) && (
        <div className="space-y-1">
          {title && (
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              {title}
            </h3>
          )}
          {description && (
            <p className="text-sm text-gray-500">{description}</p>
          )}
        </div>
      )}
      <div className="space-y-6">{children}</div>
    </div>
  )
}

interface FormDividerProps {
  className?: string
}

export function FormDivider({ className }: FormDividerProps) {
  return <hr className={cn('my-8 border-gray-200', className)} />
}

interface FormActionsProps {
  children: ReactNode
  className?: string
  align?: 'left' | 'center' | 'right'
}

export function FormActions({
  children,
  className,
  align = 'right',
}: FormActionsProps) {
  const alignClasses = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end',
  }

  return (
    <div
      className={cn(
        'flex items-center gap-3 pt-4',
        alignClasses[align],
        className
      )}
    >
      {children}
    </div>
  )
}