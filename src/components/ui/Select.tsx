'use client'

import React, { useState, useRef, useEffect } from 'react'
import { cn } from '@/utils'

interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

interface SelectProps {
  options: SelectOption[]
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  disabled?: boolean
  error?: string
  label?: string
  helperText?: string
  required?: boolean
  className?: string
  id?: string
  name?: string
}

export function Select({
  options,
  value,
  onChange,
  placeholder = '请选择',
  disabled = false,
  error,
  label,
  helperText,
  required = false,
  className,
  id,
  name,
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedValue, setSelectedValue] = useState(value || '')
  const selectRef = useRef<HTMLDivElement>(null)

  // 当外部value变化时更新内部状态
  useEffect(() => {
    if (value !== undefined) {
      setSelectedValue(value)
    }
  }, [value])

  // 处理点击外部关闭下拉菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        selectRef.current &&
        !selectRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // 处理选项选择
  const handleSelect = (option: SelectOption) => {
    if (option.disabled) return
    
    setSelectedValue(option.value)
    onChange?.(option.value)
    setIsOpen(false)
  }

  // 获取当前选中选项的标签
  const getSelectedLabel = () => {
    const selectedOption = options.find((option) => option.value === selectedValue)
    return selectedOption ? selectedOption.label : placeholder
  }

  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <label
          htmlFor={id}
          className="block text-sm font-medium text-gray-700"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className="relative" ref={selectRef}>
        <button
          type="button"
          className={cn(
            'relative w-full cursor-default rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 text-left shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:text-sm',
            disabled && 'bg-gray-100 cursor-not-allowed opacity-75',
            error && 'border-red-500 focus:border-red-500 focus:ring-red-500'
          )}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          disabled={disabled}
          id={id}
        >
          <span
            className={cn(
              'block truncate',
              !selectedValue && 'text-gray-500'
            )}
          >
            {getSelectedLabel()}
          </span>
          <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
            <svg
              className="h-5 w-5 text-gray-400"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </span>
        </button>

        {isOpen && (
          <div className="absolute z-10 mt-1 w-full rounded-md bg-white shadow-lg">
            <ul
              className="max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm"
              tabIndex={-1}
              role="listbox"
              aria-labelledby={id}
            >
              {options.map((option) => (
                <li
                  key={option.value}
                  className={cn(
                    'relative cursor-default select-none py-2 pl-3 pr-9',
                    option.value === selectedValue
                      ? 'bg-primary text-white'
                      : 'text-gray-900',
                    option.disabled
                      ? 'opacity-50 cursor-not-allowed'
                      : 'hover:bg-gray-100 hover:text-gray-900'
                  )}
                  role="option"
                  aria-selected={option.value === selectedValue}
                  onClick={() => handleSelect(option)}
                >
                  <span className="block truncate">{option.label}</span>
                  {option.value === selectedValue && (
                    <span
                      className={cn(
                        'absolute inset-y-0 right-0 flex items-center pr-4',
                        option.value === selectedValue
                          ? 'text-white'
                          : 'text-primary'
                      )}
                    >
                      <svg
                        className="h-5 w-5"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* 错误信息 */}
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}

      {/* 帮助文本 */}
      {helperText && !error && (
        <p className="mt-1 text-sm text-gray-500">{helperText}</p>
      )}

      {/* 隐藏的原生select，用于表单提交 */}
      <select
        className="sr-only"
        aria-hidden="true"
        tabIndex={-1}
        name={name}
        value={selectedValue}
        onChange={(e) => {
          setSelectedValue(e.target.value)
          onChange?.(e.target.value)
        }}
        disabled={disabled}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
            disabled={option.disabled}
          >
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )
}