import React from 'react'
import { cn } from '@/utils'

interface Step {
  id: string | number
  title: string
  description?: string
}

interface StepsProps {
  steps: Step[]
  currentStep: number
  className?: string
  orientation?: 'horizontal' | 'vertical'
}

export function Steps({
  steps,
  currentStep,
  className,
  orientation = 'horizontal',
}: StepsProps) {
  return (
    <div
      className={cn(
        'w-full',
        orientation === 'vertical' ? 'space-y-4' : '',
        className
      )}
    >
      <ol
        className={cn(
          'relative',
          orientation === 'horizontal'
            ? 'flex items-center justify-between w-full'
            : 'border-l border-gray-200 ml-3 space-y-6'
        )}
      >
        {steps.map((step, index) => {
          const isActive = index === currentStep
          const isCompleted = index < currentStep
          const isLast = index === steps.length - 1

          return (
            <li
              key={step.id}
              className={cn(
                orientation === 'horizontal'
                  ? 'flex items-center relative'
                  : 'relative'
              )}
              style={{
                width: orientation === 'horizontal' ? `${100 / steps.length}%` : 'auto',
              }}
            >
              {/* 连接线 */}
              {orientation === 'horizontal' && !isLast && (
                <div
                  className={cn(
                    'absolute top-1/2 left-0 -translate-y-1/2 h-0.5 w-full',
                    isCompleted ? 'bg-primary' : 'bg-gray-200'
                  )}
                  style={{ left: '50%', width: '100%' }}
                />
              )}

              <div
                className={cn(
                  orientation === 'horizontal'
                    ? 'flex flex-col items-center relative z-10'
                    : 'flex items-start'
                )}
              >
                {/* 步骤圆点 */}
                <div
                  className={cn(
                    'flex items-center justify-center rounded-full',
                    isActive
                      ? 'bg-primary text-white border-2 border-primary h-8 w-8'
                      : isCompleted
                      ? 'bg-primary text-white h-8 w-8'
                      : 'bg-gray-100 text-gray-500 border-2 border-gray-200 h-8 w-8',
                    orientation === 'vertical' ? '-ml-[19px]' : ''
                  )}
                >
                  {isCompleted ? (
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      ></path>
                    </svg>
                  ) : (
                    <span className="text-sm font-medium">{index + 1}</span>
                  )}
                </div>

                {/* 步骤文本 */}
                <div
                  className={cn(
                    orientation === 'horizontal'
                      ? 'text-center mt-2'
                      : 'ml-3 mt-0.5'
                  )}
                >
                  <h3
                    className={cn(
                      'text-sm font-medium',
                      isActive || isCompleted
                        ? 'text-gray-900'
                        : 'text-gray-500'
                    )}
                  >
                    {step.title}
                  </h3>
                  {step.description && (
                    <p
                      className={cn(
                        'text-xs',
                        isActive
                          ? 'text-gray-600'
                          : isCompleted
                          ? 'text-gray-600'
                          : 'text-gray-400'
                      )}
                    >
                      {step.description}
                    </p>
                  )}
                </div>
              </div>
            </li>
          )
        })}
      </ol>
    </div>
  )
}