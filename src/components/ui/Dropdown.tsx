'use client'

import React, { useState, useRef, useEffect, ReactNode } from 'react'
import { cn } from '@/utils'

interface DropdownProps {
  trigger: ReactNode
  children: ReactNode
  align?: 'left' | 'right'
  width?: number
  className?: string
}

export function Dropdown({
  trigger,
  children,
  align = 'left',
  width = 200,
  className,
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // 处理点击外部关闭下拉菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // 处理ESC键关闭下拉菜单
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    document.addEventListener('keydown', handleEscKey)
    return () => {
      document.removeEventListener('keydown', handleEscKey)
    }
  }, [])

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <div onClick={() => setIsOpen(!isOpen)}>{trigger}</div>

      {isOpen && (
        <div
          className={cn(
            'absolute z-50 mt-2 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none',
            align === 'left' ? 'left-0' : 'right-0',
            className
          )}
          style={{ width: `${width}px` }}
        >
          <div className="py-1">{children}</div>
        </div>
      )}
    </div>
  )
}

interface DropdownItemProps {
  children: ReactNode
  onClick?: () => void
  className?: string
  disabled?: boolean
  danger?: boolean
}

export function DropdownItem({
  children,
  onClick,
  className,
  disabled = false,
  danger = false,
}: DropdownItemProps) {
  return (
    <button
      className={cn(
        'flex w-full items-center px-4 py-2 text-sm',
        disabled
          ? 'cursor-not-allowed opacity-50 text-gray-500'
          : danger
          ? 'text-red-600 hover:bg-red-50'
          : 'text-gray-700 hover:bg-gray-100',
        className
      )}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
    >
      {children}
    </button>
  )
}

interface DropdownSeparatorProps {
  className?: string
}

export function DropdownSeparator({ className }: DropdownSeparatorProps) {
  return <div className={cn('my-1 h-px bg-gray-200', className)} />
}

interface DropdownLabelProps {
  children: ReactNode
  className?: string
}

export function DropdownLabel({ children, className }: DropdownLabelProps) {
  return (
    <div
      className={cn(
        'px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider',
        className
      )}
    >
      {children}
    </div>
  )
}