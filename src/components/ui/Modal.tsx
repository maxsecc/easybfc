'use client'

import React, { Fragment, ReactNode, useEffect } from 'react'
import { cn } from '@/utils'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  children: ReactNode
  title?: string
  description?: string
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  className?: string
  showCloseButton?: boolean
  closeOnOverlayClick?: boolean
}

export function Modal({
  isOpen,
  onClose,
  children,
  title,
  description,
  size = 'md',
  className,
  showCloseButton = true,
  closeOnOverlayClick = true,
}: ModalProps) {
  // 处理ESC键关闭模态框
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscKey)
    return () => {
      document.removeEventListener('keydown', handleEscKey)
    }
  }, [isOpen, onClose])

  // 当模态框打开时，禁止背景滚动
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }

    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  if (!isOpen) return null

  // 根据size属性确定模态框宽度
  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    full: 'max-w-full mx-4',
  }

  return (
    <Fragment>
      {/* 背景遮罩 */}
      <div
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={closeOnOverlayClick ? onClose : undefined}
        aria-hidden="true"
      />

      {/* 模态框容器 */}
      <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto">
        <div
          className={cn(
            'relative bg-white rounded-lg shadow-xl w-full m-4 max-h-[calc(100vh-2rem)] overflow-y-auto',
            sizeClasses[size],
            className
          )}
          onClick={(e) => e.stopPropagation()}
        >
          {/* 关闭按钮 */}
          {showCloseButton && (
            <button
              type="button"
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-500 focus:outline-none"
              onClick={onClose}
            >
              <span className="sr-only">关闭</span>
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}

          {/* 标题和描述 */}
          {(title || description) && (
            <div className="px-6 pt-6 pb-0">
              {title && (
                <h3 className="text-lg font-medium leading-6 text-gray-900">
                  {title}
                </h3>
              )}
              {description && (
                <p className="mt-2 text-sm text-gray-500">{description}</p>
              )}
            </div>
          )}

          {/* 内容 */}
          <div className="p-6">{children}</div>
        </div>
      </div>
    </Fragment>
  )
}

interface ModalHeaderProps {
  children: ReactNode
  className?: string
}

export function ModalHeader({ children, className }: ModalHeaderProps) {
  return (
    <div className={cn('mb-4', className)}>
      {typeof children === 'string' ? (
        <h3 className="text-lg font-medium leading-6 text-gray-900">{children}</h3>
      ) : (
        children
      )}
    </div>
  )
}

interface ModalBodyProps {
  children: ReactNode
  className?: string
}

export function ModalBody({ children, className }: ModalBodyProps) {
  return <div className={cn('', className)}>{children}</div>
}

interface ModalFooterProps {
  children: ReactNode
  className?: string
}

export function ModalFooter({ children, className }: ModalFooterProps) {
  return (
    <div
      className={cn(
        'mt-6 flex flex-row-reverse gap-2 justify-start',
        className
      )}
    >
      {children}
    </div>
  )
}