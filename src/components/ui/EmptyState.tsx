import React, { ReactNode } from 'react'
import { cn } from '@/utils'
import { Button } from './Button'

interface EmptyStateProps {
  title: string
  description?: string
  icon?: ReactNode
  action?: {
    label: string
    onClick: () => void
  }
  className?: string
}

export function EmptyState({
  title,
  description,
  icon,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center p-8',
        className
      )}
    >
      {icon ? (
        <div className="mb-4">{icon}</div>
      ) : (
        <div className="rounded-full bg-gray-100 p-3 mb-4">
          <svg
            className="h-6 w-6 text-gray-400"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
            />
          </svg>
        </div>
      )}
      <h3 className="text-lg font-medium text-gray-900">{title}</h3>
      {description && (
        <p className="mt-1 text-sm text-gray-500 max-w-md">{description}</p>
      )}
      {action && (
        <div className="mt-6">
          <Button onClick={action.onClick}>{action.label}</Button>
        </div>
      )}
    </div>
  )
}

interface NoResultsProps {
  query?: string
  title?: string
  description?: string
  resetAction?: () => void
  className?: string
}

export function NoResults({
  query,
  title,
  description,
  resetAction,
  className,
}: NoResultsProps) {
  return (
    <EmptyState
      title={title || `没有找到${query ? `"${query}"的` : ''}结果`}
      description={
        description ||
        '请尝试使用不同的搜索词或筛选条件，或者重置所有筛选条件。'
      }
      icon={
        <svg
          className="h-12 w-12 text-gray-400"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      }
      action={
        resetAction
          ? {
              label: '重置筛选条件',
              onClick: resetAction,
            }
          : undefined
      }
      className={className}
    />
  )
}